import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';

export type InlineAIHelpType = 'optional' | 'mandatory';

/** The quiet Back / Dismiss pair along the bottom of the card. */
const FOOT_BUTTON =
'rounded-md px-1.5 py-0.5 text-label text-faint outline-none transition-colors duration-150 ease-out ' +
'hover:text-muted focus-visible:ring-2 focus-visible:ring-teal';

export interface InlineAIHelpOption {
  label: string;
  onSelect: () => void;
  /** Moves the card on to its next question instead of answering it outright,
      so the contents swap in place rather than the card fading out. */
  advances?: boolean;
}

interface InlineAIHelpProps {
  anchorId: string;
  type?: InlineAIHelpType;
  /** Identifies the question showing. Changing it crossfades the card's
      contents; the card itself stays where it is. */
  stepKey?: string;
  question: string;
  options?: InlineAIHelpOption[];
  input?: {placeholder: string;onSubmit: (value: string) => void;};
  /** Marks the card as blocking an action it was asked to answer. */
  error?: boolean;
  errorMessage?: string;
  /** Returns to the previous question, on a card that has one behind it. */
  onBack?: () => void;
  onDismiss: () => void;
  /** Custom body. Receives `resolve`, which fades the card out before running the action. */
  children?: (resolve: (action: () => void) => void) => React.ReactNode;
}

export function InlineAIHelp({
  anchorId,
  type = 'optional',
  stepKey,
  question,
  options,
  input,
  error = false,
  errorMessage,
  onBack,
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

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepKey ?? question}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.13, ease: 'easeOut' }}>

          <p className="text-body text-txt">{question}</p>

          {options && options.length > 0 &&
          <div className="mt-3 flex flex-wrap gap-1.5">
              {options.map((option) =>
            <button
              key={option.label}
              type="button"
              onClick={() => option.advances ? option.onSelect() : resolve(option.onSelect)}
              className="rounded-lg border border-line px-2.5 py-2.5 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:border-teal hover:text-teal focus-visible:ring-2 focus-visible:ring-teal dt:py-1.5">

                  {option.label}
                </button>
            )}
            </div>
          }
        </motion.div>
      </AnimatePresence>

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

      {(onBack || !mandatory) &&
      <div className="mt-3 flex items-center justify-between gap-2">
          {onBack ?
        <button type="button" onClick={onBack} className={FOOT_BUTTON}>
              Back
            </button> :

        <span />
        }
          {!mandatory &&
        <button type="button" onClick={() => resolve(onDismiss)} className={FOOT_BUTTON}>
              Dismiss
            </button>
        }
        </div>
      }
    </motion.aside>);

}