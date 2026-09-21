import React from 'react';
import { ArrowLeftIcon } from 'lucide-react';

interface ReviewTopBarProps {
  saving: boolean;
  onBack: () => void;
}

export function ReviewTopBar({ saving, onBack }: ReviewTopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-base px-4 dt:px-5">
      <p className="truncate text-section text-txt">
        Incidents
        <span className="ml-2 hidden rounded-md bg-raised px-2 py-0.5 align-middle text-[11px] text-faint dt:inline-flex">
          Sat 20/09 - Sun 21/09
        </span>
      </p>

      <div className="flex shrink-0 items-center gap-3 dt:gap-4">
        <p aria-live="polite" className="text-[11px] text-faint">
          {saving ? 'Saving…' : 'Progress saved'}
        </p>
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to report"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:border-faint hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

          <ArrowLeftIcon size={15} strokeWidth={2} />
          <span className="hidden dt:inline">Back to report</span>
        </button>
      </div>
    </header>);

}