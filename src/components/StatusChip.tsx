import React from 'react';
import { CheckIcon } from 'lucide-react';
import { ReviewStatus } from '../types/report';

export function StatusChip({ status }: {status: ReviewStatus;}) {
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-ok/15 px-2 py-1 text-label font-medium text-ok">
        <CheckIcon size={13} strokeWidth={2.5} />
        Confirmed
      </span>);

  }
  if (status === 'dismissed') {
    return (
      <span className="inline-flex items-center whitespace-nowrap rounded-md bg-raised px-2 py-1 text-label text-faint">
        Dismissed
      </span>);

  }
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-md border border-line px-2 py-1 text-label text-muted">
      Pending review
    </span>);

}