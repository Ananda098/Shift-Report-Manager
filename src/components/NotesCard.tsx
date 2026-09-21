import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SparklesIcon, FileTextIcon, ChevronDownIcon } from 'lucide-react';
import { GhostPrompt } from './GhostPrompt';
import { RecordButton } from './RecordButton';
import { getCaretCoordinates, measureTextWidth } from '../utils/caretCoordinates';

const PLACEHOLDER =
'What happened tonight? Start anywhere — the crowd, the crew, anything that went wrong. Type or hit Record and just talk.';

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
const HIGHLIGHT_MS = 1500;

interface Ghost {
  text: string;
  left: number;
  top: number;
}

interface NotesCardProps {
  value: string;
  onChange: (value: string) => void;
  onAddToReport: () => void;
  /** True once the card has settled into its compact, post-push state. */
  collapsed: boolean;
  onExpand: () => void;
  /** For the collapsed summary line — counts across the whole report, not just the last push. */
  statementCount: number;
  incidentCount: number;
}

function CollapsedSummary({
  onExpand,
  statementCount,
  incidentCount




}: {onExpand: () => void;statementCount: number;incidentCount: number;}) {
  const parts = [`${statementCount} statement${statementCount === 1 ? '' : 's'}`];
  if (incidentCount > 0) {
    parts.push(`${incidentCount} incident${incidentCount === 1 ? '' : 's'}`);
  }

  return (
    <button
      type="button"
      onClick={onExpand}
      className="flex w-full items-center justify-between rounded-xl border border-line bg-card px-5 py-4 text-left outline-none transition-colors duration-150 ease-out hover:bg-raised focus-visible:ring-2 focus-visible:ring-teal">

      <span className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-raised text-muted">
          <FileTextIcon size={15} strokeWidth={1.75} />
        </span>
        <span className="text-body text-txt">
          Notes added <span className="text-faint">·</span>{' '}
          <span className="text-muted">{parts.join(' · ')}</span>
        </span>
      </span>
      <span className="flex items-center gap-1 text-meta text-muted">
        View or add more
        <ChevronDownIcon size={15} strokeWidth={2} />
      </span>
    </button>);

}

/** The freeform "write or record" card. Sits above Incidents; collapses to a
    one-line summary once its contents have been pushed into the report. */
export function NotesCard({
  value,
  onChange,
  onAddToReport,
  collapsed,
  onExpand,
  statementCount,
  incidentCount
}: NotesCardProps) {
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [recording, setRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const [highlightStart, setHighlightStart] = useState<number | null>(null);
  const [highlightFading, setHighlightFading] = useState(false);

  const promptIndex = useRef(0);
  const pauseTimer = useRef<number | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Keep the editor sized to its content so the document flows from the top.
  useEffect(() => {
    if (collapsed) return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value, typing, highlightStart, collapsed]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let next = e.target.value;
    // Typing "- " at the start of a line becomes a bullet.
    const caret = e.target.selectionStart;
    const lineStart = next.lastIndexOf('\n', caret - 1) + 1;
    if (next.slice(lineStart, caret) === '- ') {
      next = `${next.slice(0, lineStart)}• ${next.slice(caret)}`;
    }
    setGhost(null);
    onChange(next);
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
    const lineStart = value.lastIndexOf('\n', caret - 1) + 1;
    const line = value.slice(lineStart, caret);
    if (!line.startsWith('• ')) return;
    e.preventDefault();
    const next =
    line.trim() === '•' ?
    `${value.slice(0, lineStart)}\n${value.slice(caret)}` :
    `${value.slice(0, caret)}\n• ${value.slice(caret)}`;
    const nextCaret = line.trim() === '•' ? lineStart + 1 : caret + 3;
    setGhost(null);
    onChange(next);
    schedulePrompt(next);
    window.requestAnimationFrame(() => {
      el.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleStop = () => {
    setRecording(false);
    clearPause();
    setGhost(null);

    const trimmed = value.replace(/\s+$/, '');
    const base = trimmed.length ? `${trimmed}\n\n` : '';
    onChange(base);
    setHighlightStart(base.length);
    setTyping(true);

    const words = TRANSCRIPT.split(' ');
    let i = 0;
    const tick = () => {
      i = Math.min(i + WORDS_PER_TICK, words.length);
      onChange(base + words.slice(0, i).join(' '));
      if (i < words.length) {
        window.setTimeout(tick, WORD_MS);
        return;
      }
      setTyping(false);
      window.setTimeout(() => {
        setHighlightFading(true);
        window.setTimeout(() => {
          setHighlightStart(null);
          setHighlightFading(false);
        }, 320);
      }, HIGHLIGHT_MS);
    };
    window.setTimeout(tick, WORD_MS);
  };

  if (collapsed) {
    return (
      <CollapsedSummary
        onExpand={onExpand}
        statementCount={statementCount}
        incidentCount={incidentCount} />);

  }

  const showTranscriptView = typing || highlightStart !== null;
  const canPush = !typing && value.trim().length > 0;

  return (
    <div className="flex h-[460px] flex-col overflow-hidden rounded-xl border border-line bg-card">
      <div className="scroll-slim flex-1 overflow-y-auto px-5 py-4">
        {showTranscriptView ?
        <p className="whitespace-pre-wrap break-words text-body text-txt">
            {value.slice(0, highlightStart ?? 0)}
            <span
            className={[
            'transition-colors duration-300 ease-out',
            highlightFading ? 'text-txt' : 'text-teal'].
            join(' ')}>

              {value.slice(highlightStart ?? 0)}
            </span>
          </p> :

        <div className="relative">
            <label htmlFor="shift-notes" className="sr-only">
              Shift notes
            </label>
            <textarea
            id="shift-notes"
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={clearPause}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className="block w-full resize-none overflow-hidden bg-transparent text-body text-txt outline-none placeholder:text-faint" />

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

      <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={onAddToReport}
          disabled={!canPush}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-meta font-medium text-teal outline-none transition-colors duration-150 ease-out hover:bg-teal-fill focus-visible:ring-2 focus-visible:ring-teal disabled:pointer-events-none disabled:opacity-40">

          <SparklesIcon size={15} strokeWidth={2} />
          Add my notes to the report
        </button>
        <RecordButton
          recording={recording}
          disabled={typing}
          onStart={() => {
            clearPause();
            setGhost(null);
            setRecording(true);
          }}
          onStop={handleStop} />

      </div>
    </div>);

}
