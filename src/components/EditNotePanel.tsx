import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { NoteEntry } from '../types/report';
import { DismissDialog } from './DismissDialog';

interface EditNotePanelProps {
  note: NoteEntry;
  onClose: () => void;
  onSave: (noteId: string, text: string) => void;
}

/** Same drawer pattern as "New incident" / "Add information" — the note's
    full text, editable, with the report re-synced on save. */
export function EditNotePanel({ note, onClose, onSave }: EditNotePanelProps) {
  const [text, setText] = useState(note.text);
  const [discardOpen, setDiscardOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const isDirty = text.trim() !== note.text;
  const requestClose = () => isDirty ? setDiscardOpen(true) : onClose();

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(note.id, trimmed);
  };

  return (
    <motion.aside
      aria-label="Edit note"
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[440px] flex-col border-l border-line bg-card">

      <div className="scroll-slim flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-section font-semibold text-txt">Edit note</h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="-mr-1 rounded-md p-1 text-faint outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

            <XIcon size={17} strokeWidth={2} />
          </button>
        </div>

        <label htmlFor="edit-note-text" className="sr-only">
          Note text
        </label>
        <textarea
          id="edit-note-text"
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="block w-full resize-none overflow-hidden bg-transparent text-body text-txt outline-none" />

      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line bg-card px-4 py-3">
        <button
          type="button"
          onClick={requestClose}
          className="rounded-md px-2 py-1 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!text.trim()}
          className="h-10 rounded-lg bg-teal px-4 text-meta font-medium text-teal-ink outline-none transition-colors duration-150 ease-out hover:bg-teal-hi focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-40">

          Save note
        </button>
      </div>

      <AnimatePresence>
        {discardOpen &&
        <DismissDialog
          title="Discard these edits?"
          body="Your changes to this note will be lost."
          keepLabel="Keep editing"
          confirmLabel="Discard"
          onKeep={() => setDiscardOpen(false)}
          onDismiss={onClose} />

        }
      </AnimatePresence>
    </motion.aside>);

}
