import React from 'react';
import { ArrowLeftIcon, CheckIcon, LoaderCircleIcon } from 'lucide-react';

interface ReviewTopBarProps {
  saving: boolean;
  onBack: () => void;
}

export function ReviewTopBar({ saving, onBack }: ReviewTopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-base px-5">
      <p className="text-body text-txt">
        Reviewing incidents <span className="text-faint">·</span>{' '}
        <span className="text-muted">Sat 20 Sep</span>
      </p>

      <div className="flex items-center gap-4">
        <p aria-live="polite" className="flex items-center gap-1.5 text-label text-faint">
          {saving ?
          <>
              <LoaderCircleIcon size={13} strokeWidth={2} className="animate-spin" />
              Saving…
            </> :

          <>
              <CheckIcon size={13} strokeWidth={2.25} className="text-teal" />
              Progress saved
            </>
          }
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:bg-raised hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">
          
          <ArrowLeftIcon size={15} strokeWidth={2} />
          Back to report
        </button>
      </div>
    </header>);

}