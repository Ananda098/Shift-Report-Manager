import React from 'react';
import { ShieldAlertIcon } from 'lucide-react';

interface ReviewModuleProps {
  total: number;
  reviewedCount: number;
  /** Something on top of the page owns the primary action right now. */
  demoted?: boolean;
  onStartReview: () => void;
}

/** Only rendered while something is still pending. Spacing is left to the
    caller so the rail copy can sit inside a sticky, background-filled slot. */
export function ReviewModule({
  total,
  reviewedCount,
  demoted = false,
  onStartReview
}: ReviewModuleProps) {
  const left = total - reviewedCount;
  const started = reviewedCount > 0;

  return (
    <section
      id="review-module"
      aria-labelledby="review-module-title"
      className="rounded-xl border border-teal/25 bg-teal-fill/40 p-4">
      
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal/15 text-teal">
          <ShieldAlertIcon size={15} strokeWidth={1.75} />
        </span>
        <h2 id="review-module-title" className="text-meta font-semibold text-txt">
          Incident review
        </h2>
      </div>

      <p className="mt-3.5 text-body text-txt">
        {started ?
        `${reviewedCount} of ${total} incidents reviewed` :
        `${total} incidents reported tonight`
        }
      </p>
      <p className="mt-1 text-label text-muted">
        {started ?
        `${left} still to go` :
        'Takes roughly 3 minutes'
        }
      </p>

      {started &&
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={reviewedCount}
        className="mt-3 h-1 w-full overflow-hidden rounded-full bg-raised">
        
          <div
          className="h-full rounded-full bg-teal transition-[width] duration-300 ease-out"
          style={{ width: `${reviewedCount / total * 100}%` }} />
        
        </div>
      }

      <button
        type="button"
        onClick={onStartReview}
        className={[
        'mt-4 inline-flex h-9 items-center justify-center rounded-lg px-4 text-meta font-medium outline-none',
        // Full width in the narrow rail; its own width in the wide in-flow copy.
        'w-auto wide:w-full',
        'transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-base',
        demoted ?
        'border border-line text-muted hover:border-faint hover:text-txt' :
        'bg-teal text-teal-ink hover:bg-teal-hi'].
        join(' ')}>
        
        {started ? 'Continue review' : 'Start review'}
      </button>
    </section>);

}
