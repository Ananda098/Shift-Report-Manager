import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NoteEntry } from '../types/report';
import { DismissDialog } from './DismissDialog';
import { DrawerBody, DrawerCancel, DrawerFooter } from './DrawerShell';

interface EditNotePanelProps {
  note: NoteEntry;
  /** The note's unsaved text, held by the shell so a swap keeps the edit. */
  draft: string;
  onChangeDraft: (text: string) => void;
  /** Bumped when the already-open drawer's trigger is clicked again. */
  focusPulse: number;
  onClose: () => void;
  onSave: (noteId: string, text: string) => void;
}

/** Same drawer pattern as "New incident" / "Add information" — the note's
    full text, editable, with the report re-synced on save. */
export function EditNotePanel({
  note,
  draft,
  onChangeDraft,
  focusPulse,
  onClose,
  onSave
}: EditNotePanelProps) {
  const [discardOpen, setDiscardOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  // Re-clicking this note's pencil while its drawer is up just puts the
  // caret back in the text.
  useEffect(() => {
    if (focusPulse > 0) textareaRef.current?.focus();
  }, [focusPulse]);

  const isDirty = draft.trim() !== note.text;
  const requestClose = () => isDirty ? setDiscardOpen(true) : onClose();

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSave(note.id, trimmed);
  };

  return (
    <>
      <DrawerBody title="Edit note" onClose={requestClose}>
        <label htmlFor="edit-note-text" className="sr-only">
          Note text
        </label>
        <textarea
          id="edit-note-text"
          ref={textareaRef}
          rows={1}
          value={draft}
          onChange={(e) => onChangeDraft(e.target.value)}
          spellCheck={false}
          className="block w-full resize-none overflow-hidden bg-transparent text-body text-txt outline-none" />

      </DrawerBody>

      <DrawerFooter>
        <DrawerCancel onClick={requestClose} />
        <button
          type="button"
          onClick={handleSave}
          disabled={!draft.trim()}
          className="h-10 rounded-lg bg-teal px-4 text-meta font-medium text-teal-ink outline-none transition-colors duration-150 ease-out hover:bg-teal-hi focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-40">

          Save note
        </button>
      </DrawerFooter>

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
    </>);

}
