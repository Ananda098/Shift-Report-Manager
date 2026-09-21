import React, { useEffect, useRef, useState } from 'react';

interface InlineEditableProps {
  value: string;
  onChange: (value: string) => void;
  /** Called instead of onChange when the field is saved empty. */
  onDelete?: () => void;
  ariaLabel: string;
  /** Typography override, e.g. "text-meta". */
  textClass?: string;
  /** Shown in faint text while the value is empty. */
  placeholder?: string;
  /** DOM id put on the focusable element, so it can be scrolled to and focused. */
  elementId?: string;
  /** Marks the field as missing / invalid. */
  error?: boolean;
  children?: React.ReactNode;
}

/**
 * Click-to-edit text. The read and edit boxes share the same box model so
 * nothing shifts when it flips, and editing is the only tinted state.
 */
export function InlineEditable({
  value,
  onChange,
  onDelete,
  ariaLabel,
  textClass = 'text-body',
  placeholder,
  elementId,
  error = false,
  children
}: InlineEditableProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) return;
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [editing, draft]);

  useEffect(() => {
    if (!editing) return;
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  const start = () => {
    setDraft(value);
    setEditing(true);
  };

  const save = () => {
    setEditing(false);
    const next = draft.trim();
    if (!next) {
      onDelete?.();
      return;
    }
    if (next !== value) onChange(next);
  };

  const shared = `block w-full rounded-md border px-1 ${textClass}`;

  if (editing) {
    return (
      <textarea
        id={elementId}
        ref={ref}
        rows={1}
        aria-label={ariaLabel}
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
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`${shared} resize-none overflow-hidden border-teal bg-teal-fill/30 text-txt caret-teal outline-none`} />);


  }

  return (
    <p
      id={elementId}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={start}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          start();
        }
      }}
      className={[
      shared,
      'cursor-text outline-none transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-teal',
      error ? 'border-tier-t3' : 'border-transparent',
      value ? 'text-txt' : 'text-faint'].
      join(' ')}>
      
      {value ? children ?? value : placeholder}
    </p>);

}