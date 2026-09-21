import React from 'react';
import { ReviewStatus } from '../types/report';

interface DecisionBarProps {
  status: ReviewStatus;
  pendingCount: number;
  onDismissRequest: () => void;
  onRestore: () => void;
  onConfirm: () => void;
}

export function DecisionBar({
  status,
  pendingCount,
  onDismissRequest,
  onRestore,
  onConfirm
}: DecisionBarProps) {
  const pending = status === 'pending';
  const primaryLabel =
  pendingCount === 0 || pending && pendingCount === 1 ?
  'Finish review' :
  pending ?
  'Confirm & next' :
  'Next';

  return (
    <div className="flex h-[72px] w-full shrink-0 items-center justify-between border-t border-line bg-base">
      {status === 'dismissed' ?
      <button
        type="button"
        onClick={onRestore}
        className="rounded-md px-1 py-1 text-body font-medium text-tier-t3 outline-none transition-opacity duration-150 ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:ring-tier-t3">
        
          Restore
        </button> :

      <button
        type="button"
        onClick={onDismissRequest}
        className="rounded-md px-1 py-1 text-body font-medium text-tier-t3 outline-none transition-opacity duration-150 ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:ring-tier-t3">
        
          Not an incident
        </button>
      }

      <button
        type="button"
        onClick={onConfirm}
        className="inline-flex h-11 items-center rounded-lg bg-teal px-5 text-body font-medium text-teal-ink outline-none transition-colors duration-150 ease-out hover:bg-teal-hi focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-base">
        
        {primaryLabel}
      </button>
    </div>);

}