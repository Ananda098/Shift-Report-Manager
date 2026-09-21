import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';

export type InlineAIHelpType = 'optional' | 'mandatory';

export interface InlineAIHelpOption {
  label: string;
  onSelect: () => void;
}

interface InlineAIHelpProps {
  anchorId: string;
  type?: InlineAIHelpType;
  question: string;
  options?: InlineAIHelpOption[];
  input?: {placeholder: string;onSubmit: (value: string) => void;};
  /** Marks the card as blocking an action it was asked to answer. */
  error?: boolean;
  errorMessage?: string;
  onDismiss: () => void;
  /** Custom body. Receives `resolve`, which fades the card out before running the action. */
  children?: (resolve: (action: () => void) => void) => React.ReactNode;
}

export function InlineAIHelp({
  anchorId,
  type = 'optional',
  question,
  options,
  input,
  error = false,
  errorMessage,
  onDismiss,
  children
}: InlineAIHelpProps) {
  const [leaving, setLeaving] = useState(false);
  const [value, setValue] = useState('');
  const mandatory = type === 'mandatory';

  const resolve = (action: () => void) => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(action, 200);
  };

  return (
    <motion.aside
      data-anchor={anchorId}
      aria-label={mandatory ? 'Required question' : 'Suggestion'}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: leaving ? 0 : 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className={[
      'relative overflow-hidden rounded-xl border bg-card p-4 transition-colors duration-150 ease-out',
      error ? 'border-tier-t3' : 'border-line'].
      join(' ')}>
      
      {mandatory && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-tier-t3" />}

      <motion.p
        animate={error ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={[
        'mb-2 flex items-center gap-1.5 text-label font-medium uppercase tracking-wide',
        mandatory ? 'text-tier-t3' : 'text-faint'].
        join(' ')}>
        
        <SparklesIcon size={13} strokeWidth={2} />
        {mandatory ? 'Required' : 'Suggestion'}
      </motion.p>

      <p className="text-body text-txt">{question}</p>

      {options && options.length > 0 &&
      <div className="mt-3 flex flex-wrap gap-1.5">
          {options.map((option) =>
        <button
          key={option.label}
          type="button"
          onClick={() => resolve(option.onSelect)}
          className="rounded-lg border border-line px-2.5 py-1.5 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:border-teal hover:text-teal focus-visible:ring-2 focus-visible:ring-teal">
          
              {option.label}
            </button>
        )}
        </div>
      }

      {input &&
      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!value.trim()) return;
          const submitted = value.trim();
          resolve(() => input.onSubmit(submitted));
        }}>
        
          <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={input.placeholder}
          className="w-full rounded-lg border border-line bg-raised px-2.5 py-1.5 text-meta text-txt caret-teal outline-none transition-colors duration-150 ease-out placeholder:text-faint focus:border-teal" />
        
        </form>
      }

      {children?.(resolve)}

      {error && errorMessage &&
      <p role="alert" className="mt-2.5 text-label text-tier-t3">
          {errorMessage}
        </p>
      }

      {!mandatory &&
      <div className="mt-3 flex justify-end">
          <button
          type="button"
          onClick={() => resolve(onDismiss)}
          className="rounded-md px-1.5 py-0.5 text-label text-faint outline-none transition-colors duration-150 ease-out hover:text-muted focus-visible:ring-2 focus-visible:ring-teal">
          
            Dismiss
          </button>
        </div>
      }
    </motion.aside>);

}