import React from 'react';
import { Tier } from '../types/report';

const dot: Record<Tier, string> = {
  T1: 'bg-tier-t1',
  T2: 'bg-tier-t2',
  T3: 'bg-tier-t3'
};

const label: Record<Tier, string> = {
  T1: 'text-muted',
  T2: 'text-tier-t2',
  T3: 'text-tier-t3'
};

export function TierBadge({ tier }: {tier: Tier;}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-raised px-2 py-1">
      <span className={`h-2 w-2 rounded-full ${dot[tier]}`} />
      <span className={`text-label font-medium ${label[tier]}`}>{tier}</span>
    </span>);

}