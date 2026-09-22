import React from 'react';
import { FileTextIcon } from 'lucide-react';

interface ReviewTopBarProps {
  saving: boolean;
  onBack: () => void;
}

export function ReviewTopBar({ saving, onBack }: ReviewTopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-base px-4 dt:h-16 dt:px-5">
      <p className="flex min-w-0 items-baseline gap-[7px]">
        <span className="text-[15px] font-semibold text-txt">Incidents</span>
        <span aria-hidden="true" className="hidden text-[15px] text-faint/60 dt:inline">
          ·
        </span>
        <span className="hidden whitespace-nowrap text-[15px] text-muted dt:inline">
          Sat 20 – Sun 21 Sep
        </span>
      </p>

      <div className="flex shrink-0 items-center gap-3 dt:gap-4">
        <p
          aria-live="polite"
          className={[
          'flex items-center gap-1.5 text-label font-medium',
          'transition-colors duration-300 ease-out',
          saving ? 'text-teal' : 'text-muted'].
          join(' ')}>

          <span
            aria-hidden="true"
            className={[
            'h-1.5 w-1.5 shrink-0 rounded-full bg-teal transition-opacity duration-300 ease-out',
            saving ? 'save-pulse' : 'opacity-0'].
            join(' ')} />

          {saving ? 'Saving…' : 'Progress saved'}
        </p>

        <span aria-hidden="true" className="h-[22px] w-px bg-line" />

        <button
          type="button"
          onClick={onBack}
          aria-label="Back to report"
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-raised px-3 text-meta font-medium text-muted outline-none transition-colors duration-150 ease-out hover:bg-line hover:text-txt focus-visible:ring-2 focus-visible:ring-teal dt:h-8">

          <FileTextIcon size={15} strokeWidth={2} />
          <span className="hidden dt:inline">Back to report</span>
        </button>
      </div>
    </header>);

}
