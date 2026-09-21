import React, { useEffect, useRef, useState } from 'react';

interface StatementComposerProps {
  placeholder: string;
  ariaLabel: string;
  onSubmit: (text: string) => void;
}

/** An empty section that is actually writable: type, then Enter or blur to file it. */
export function StatementComposer({ placeholder, ariaLabel, onSubmit }: StatementComposerProps) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    setValue('');
    onSubmit(text);
  };

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      aria-label={ariaLabel}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
      onBlur={submit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          submit();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setValue('');
          e.currentTarget.blur();
        }
      }}
      className="block w-full resize-none overflow-hidden rounded-md bg-transparent px-1 text-body text-txt caret-teal outline-none placeholder:text-faint" />);


}