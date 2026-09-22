import React, { useEffect, useRef, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { Statement } from '../types/report';

interface StatementRowProps {
  statement: Statement;
  active: boolean;
  /** A help card is anchored to this statement — mark the text like a commented range. */
  commented?: boolean;
  /** Character index from which newly added text is briefly highlighted. */
  highlightFrom?: number | null;
  onOpenSource: (statement: Statement) => void;
  onChangeText: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function StatementRow({
  statement,
  active,
  commented = false,
  highlightFrom = null,
  onOpenSource,
  onChangeText,
  onDelete
}: StatementRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(statement.text);
  const [highlightFading, setHighlightFading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [editing, draft]);

  useEffect(() => {
    if (!editing) return;
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  useEffect(() => {
    if (highlightFrom == null) return;
    setHighlightFading(false);
    const id = window.setTimeout(() => setHighlightFading(true), 1500);
    return () => window.clearTimeout(id);
  }, [highlightFrom, statement.text]);

  const startEditing = () => {
    setDraft(statement.text);
    setEditing(true);
  };

  const save = () => {
    setEditing(false);
    const next = draft.trim();
    if (!next) {
      onDelete(statement.id);
      return;
    }
    if (next !== statement.text) onChangeText(statement.id, next);
  };

  const cancel = () => {
    setDraft(statement.text);
    setEditing(false);
  };

  return (
    <li
      id={`statement-${statement.id}`}
      className={[
      'group relative flex gap-2.5 rounded-lg border px-3 py-2 pr-10 transition-colors duration-150 ease-out',
      editing ? 'border-teal bg-teal-fill/30' : 'border-transparent hover:bg-raised'].
      join(' ')}>

      {/* Line marker — keeps stacked statements separable at a glance. It
          reads the same whether or not the source is open; the magnifier on
          the right is what marks that. */}
      <span
        aria-hidden
        className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-faint transition-colors duration-150 ease-out group-hover:bg-muted" />


      {editing ?
      <>
          <label htmlFor={`statement-input-${statement.id}`} className="sr-only">
            Edit statement
          </label>
          <textarea
          id={`statement-input-${statement.id}`}
          ref={textareaRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              save();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            }
          }}
          className="block w-full resize-none overflow-hidden bg-transparent text-body text-txt caret-teal outline-none" />

        </> :

      <p
        tabIndex={0}
        role="button"
        onClick={startEditing}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            startEditing();
          }
        }}
        className={[
        'min-w-0 flex-1 cursor-text rounded-sm text-body text-txt outline-none focus-visible:ring-2 focus-visible:ring-teal',
        commented ? 'underline decoration-teal/60 decoration-2 underline-offset-[5px]' : ''].
        join(' ')}>

          {highlightFrom == null ?
        statement.text :

        <>
              {statement.text.slice(0, highlightFrom)}
              <span
            className={[
            'transition-colors duration-300 ease-out',
            highlightFading ? 'text-txt' : 'text-teal'].
            join(' ')}>

                {statement.text.slice(highlightFrom)}
              </span>
            </>
        }
        </p>
      }

      <button
        type="button"
        aria-label="Where this came from"
        onClick={() => onOpenSource(statement)}
        className={[
        'absolute right-2 top-1.5 rounded-md p-2.5 outline-none transition-[opacity,color] duration-150 ease-out dt:p-1.5',
        'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-teal',
        active ?
        'text-teal opacity-100' :
        'text-faint opacity-100 hover:text-txt dt:opacity-0 dt:group-hover:opacity-100'].
        join(' ')}>

        <SearchIcon size={15} strokeWidth={2} />
      </button>
    </li>);

}
