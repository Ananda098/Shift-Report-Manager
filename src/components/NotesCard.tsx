import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SparklesIcon, PencilIcon, ChevronDownIcon } from 'lucide-react';
import { GhostPrompt } from './GhostPrompt';
import { RecordButton } from './RecordButton';
import { NoteEntry } from '../types/report';
import { getCaretCoordinates, measureTextWidth } from '../utils/caretCoordinates';

const PLACEHOLDER = 'What happened tonight?';

const GHOST_PROMPTS = [
'Crowd tonight?',
'Anything concerning?',
'How did the crew do?',
'Anything we need?'];


// One dictated note covering crowd, a concern, an incident and a supply
// note — everything the mocked report parser knows how to recognise,
// so a single Record tap can demo the whole notes-to-report flow.
const TRANSCRIPT =
'It was mostly regulars tonight, and there was a birthday group, maybe twenty of them, in the back room from eleven. Floor never emptied out after midnight — full right through to lights up. Mezzanine party finished ahead of schedule, all of them out by about one. Door was slow around one, Tomek had to help out. Toilets by the stairs flooded again. Roped it off at ten past two. Back stairwell camera is still dead — that is the fourth night now. Two guys started shoving each other near the smoking area around half twelve, door team split them up fast. We killed the house tequila around half one and switched to the backup. Order tongs and a new small fryer basket, the old one is bent.';

const PAUSE_MS = 1750;
const WORDS_PER_TICK = 3;
const WORD_MS = 45;
const MIN_HEIGHT = 78;
const MAX_HEIGHT = 210;
const VISIBLE_NOTES = 3;

interface Ghost {
  text: string;
  left: number;
  top: number;
}

interface NotesCardProps {
  draft: string;
  onChangeDraft: (value: string) => void;
  onAddToReport: () => void;
  notes: NoteEntry[];
  /** The note whose "Edit note" drawer is currently showing, if any. */
  activeNoteId: string | null;
  /** A drawer is already recording — one microphone at a time. */
  recordDisabled?: boolean;
  onRecordingChange: (recording: boolean) => void;
  onEditNote: (noteId: string) => void;
}

/** The freeform "write or record" card. The input stays open and ready for
    the next note before and after every push; each push adds an entry to
    the list below instead of collapsing the card. */
export function NotesCard({
  draft,
  onChangeDraft,
  onAddToReport,
  notes,
  activeNoteId,
  recordDisabled,
  onRecordingChange,
  onEditNote
}: NotesCardProps) {
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [recording, setRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  // The pushed-notes list is hidden behind the footer entry point, and never
  // opens on its own — a push is acknowledged by the toast and the count.
  const [notesOpen, setNotesOpen] = useState(false);

  const reduceMotion = useReducedMotion();

  const promptIndex = useRef(0);
  const pauseTimer = useRef<number | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLParagraphElement>(null);

  const clearPause = useCallback(() => {
    if (pauseTimer.current) window.clearTimeout(pauseTimer.current);
    pauseTimer.current = undefined;
  }, []);

  const schedulePrompt = useCallback(
    (text: string) => {
      clearPause();
      if (!text.trim() || promptIndex.current >= GHOST_PROMPTS.length) return;
      pauseTimer.current = window.setTimeout(() => {
        const el = textareaRef.current;
        if (!el) return;
        const prompt = GHOST_PROMPTS[promptIndex.current];
        const caret = getCaretCoordinates(el, el.selectionStart);
        // Sit inline, just after the caret — unless the line has no room left.
        const width = measureTextWidth(prompt, el);
        const fitsOnLine = caret.left + 4 + width <= el.clientWidth;
        setGhost({
          text: prompt,
          left: fitsOnLine ? caret.left + 4 : 0,
          top: fitsOnLine ? caret.top : caret.top + caret.height
        });
        promptIndex.current += 1;
      }, PAUSE_MS);
    },
    [clearPause]
  );

  useEffect(() => () => clearPause(), [clearPause]);

  // Compact by default (~3 lines), grows with content up to ~8 lines, then
  // scrolls internally instead of pushing the rest of the page down.
  useEffect(() => {
    const el = typing ? transcriptRef.current : textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    el.style.height = `${next}px`;
  }, [draft, typing]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let next = e.target.value;
    // Typing "- " at the start of a line becomes a bullet.
    const caret = e.target.selectionStart;
    const lineStart = next.lastIndexOf('\n', caret - 1) + 1;
    if (next.slice(lineStart, caret) === '- ') {
      next = `${next.slice(0, lineStart)}• ${next.slice(caret)}`;
    }
    setGhost(null);
    onChangeDraft(next);
    schedulePrompt(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      clearPause();
      setGhost(null);
      return;
    }
    if (e.key !== 'Enter' || e.shiftKey) return;
    const el = e.currentTarget;
    const caret = el.selectionStart;
    const lineStart = draft.lastIndexOf('\n', caret - 1) + 1;
    const line = draft.slice(lineStart, caret);
    if (!line.startsWith('• ')) return;
    e.preventDefault();
    const next =
    line.trim() === '•' ?
    `${draft.slice(0, lineStart)}\n${draft.slice(caret)}` :
    `${draft.slice(0, caret)}\n• ${draft.slice(caret)}`;
    const nextCaret = line.trim() === '•' ? lineStart + 1 : caret + 3;
    setGhost(null);
    onChangeDraft(next);
    schedulePrompt(next);
    window.requestAnimationFrame(() => {
      el.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleStop = () => {
    setRecording(false);
    onRecordingChange(false);
    clearPause();
    setGhost(null);

    const trimmed = draft.replace(/\s+$/, '');
    const base = trimmed.length ? `${trimmed}\n\n` : '';
    onChangeDraft(base);
    setTyping(true);

    const words = TRANSCRIPT.split(' ');
    let i = 0;
    const tick = () => {
      i = Math.min(i + WORDS_PER_TICK, words.length);
      onChangeDraft(base + words.slice(0, i).join(' '));
      if (i < words.length) {
        window.setTimeout(tick, WORD_MS);
        return;
      }
      setTyping(false);
    };
    window.setTimeout(tick, WORD_MS);
  };

  // Anything in the box — typed or dictated — reveals the push action and
  // demotes Record to a quiet secondary.
  const hasContent = draft.trim().length > 0;
  const canPush = !typing && hasContent;
  const visibleNotes = showAllNotes ? notes : notes.slice(0, VISIBLE_NOTES);

  return (
    // Deliberately not a report card: the composer sits on the raised input
    // surface, so the sections below read as the document it writes into.
    <div className="rounded-xl border border-line bg-raised transition-colors duration-150 ease-out focus-within:border-teal/60">
      <div className="px-4 py-3.5 dt:px-5 dt:py-4">
        {typing ?
        <p
          ref={transcriptRef}
          className="scroll-slim overflow-y-auto whitespace-pre-wrap break-words text-body text-txt">

            {draft}
          </p> :

        <div className="relative">
            <label htmlFor="shift-notes" className="sr-only">
              Shift notes
            </label>
            <textarea
            id="shift-notes"
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={clearPause}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className="scroll-slim block w-full resize-none overflow-y-auto bg-transparent text-body text-txt outline-none placeholder:text-faint" />

            {ghost &&
          <GhostPrompt
            text={ghost.text}
            left={ghost.left}
            top={ghost.top}
            onDismiss={() => setGhost(null)} />

          }
          </div>
        }
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3">
        {notes.length > 0 ?
        <button
          type="button"
          onClick={() => setNotesOpen((open) => !open)}
          aria-expanded={notesOpen}
          aria-controls="my-notes-list"
          className="inline-flex h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

            My notes ({notes.length})
            <ChevronDownIcon
            size={15}
            strokeWidth={2}
            className={[
            'transition-transform duration-200 ease-out',
            notesOpen ? 'rotate-180' : ''].
            join(' ')} />

          </button> :

        <span />
        }

        {/* Record holds the right edge: the push action only ever fades in and
            out of the space already reserved beside it, so nothing shifts. */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onAddToReport}
            disabled={!canPush}
            aria-hidden={!hasContent}
            className={[
            'inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-4 text-meta font-medium text-teal outline-none',
            'transition-[opacity,background-color] duration-150 ease-out hover:bg-teal-fill',
            'focus-visible:ring-2 focus-visible:ring-teal',
            hasContent ? canPush ? 'opacity-100' : 'pointer-events-none opacity-40' : 'pointer-events-none opacity-0'].
            join(' ')}>

            <SparklesIcon size={15} strokeWidth={2} />
            <span className="dt:hidden">Add to report</span>
            <span className="hidden dt:inline">Add my notes to the report</span>
          </button>
          <RecordButton
            recording={recording}
            disabled={typing || recordDisabled}
            secondary={hasContent}
            onStart={() => {
              clearPause();
              setGhost(null);
              setRecording(true);
              onRecordingChange(true);
            }}
            onStop={handleStop} />

        </div>
      </div>

      <AnimatePresence initial={false}>
        {notes.length > 0 && notesOpen &&
        <motion.div
          id="my-notes-list"
          key="my-notes-list"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={
          reduceMotion ?
          { duration: 0 } :
          { duration: 0.22, ease: [0.23, 1, 0.32, 1] }
          }
          className="overflow-hidden">

          <div className="border-t border-line px-3 py-2">
            <ul className="space-y-0.5">
            {visibleNotes.map((note) =>
          <li
            key={note.id}
            className={[
            'group flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors duration-150 ease-out hover:bg-card',
            activeNoteId === note.id ? 'bg-card' : ''].
            join(' ')}>

                <div className="min-w-0 flex-1">
                  <p className="text-meta text-txt">
                    My note <span className="text-faint">·</span>{' '}
                    <span className="text-muted">{note.time}</span>
                  </p>
                  <p className="truncate text-label text-faint">{note.text}</p>
                </div>
                <button
              type="button"
              onClick={() => onEditNote(note.id)}
              aria-label="Edit note"
              aria-current={activeNoteId === note.id ? 'true' : undefined}
              className={[
              'shrink-0 rounded-md p-2.5 opacity-100 outline-none transition-[opacity,color] duration-150 ease-out hover:text-txt focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-teal dt:p-1.5',
              activeNoteId === note.id ? 'text-txt dt:opacity-100' : 'text-faint dt:opacity-0 dt:group-hover:opacity-100'].
              join(' ')}>

                  <PencilIcon size={14} strokeWidth={2} />
                </button>
              </li>
          )}
          </ul>
          {!showAllNotes && notes.length > VISIBLE_NOTES &&
        <button
          type="button"
          onClick={() => setShowAllNotes(true)}
          className="mt-1 rounded-md px-2 py-1 text-label text-muted outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

              Show all ({notes.length})
            </button>
            }
          </div>
        </motion.div>
        }
      </AnimatePresence>
    </div>);

}
