import React from 'react';

interface ReviewModuleProps {
  total: number;
  reviewedCount: number;
  /** Something on top of the page owns the primary action right now. */
  demoted?: boolean;
  onStartReview: () => void;
}

/** Only rendered while something is still pending. */
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
      className="mb-7 flex items-center justify-between gap-6 rounded-xl border border-teal/25 bg-teal-fill/40 px-5 py-4">
      
      <div className="min-w-0 flex-1">
        <h2 id="review-module-title" className="text-section font-semibold text-txt">
          {started ?
          <>
              {left} incidents left <span className="text-faint">·</span>{' '}
              <span className="text-muted">{reviewedCount} reviewed</span>
            </> :

          `${total} incidents reported tonight`
          }
        </h2>
        {started ?
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={reviewedCount}
          className="mt-2.5 h-1 w-full max-w-[280px] overflow-hidden rounded-full bg-raised">
          
            <div
            className="h-full rounded-full bg-teal transition-[width] duration-300 ease-out"
            style={{ width: `${reviewedCount / total * 100}%` }} />
          
          </div> :

        <p className="mt-1 text-meta text-muted">Takes roughly 3 minutes</p>
        }
      </div>
      <button
        type="button"
        onClick={onStartReview}
        className={[
        'inline-flex h-10 shrink-0 items-center rounded-lg px-4 text-meta font-medium outline-none',
        'transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-base',
        demoted ?
        'border border-line text-muted hover:border-faint hover:text-txt' :
        'bg-teal text-teal-ink hover:bg-teal-hi'].
        join(' ')}>
        
        {started ? 'Continue review' : 'Start review'}
      </button>
    </section>);

}