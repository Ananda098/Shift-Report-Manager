import React from 'react';
import { Tier } from '../types/report';

const dot: Record<Tier, string> = {
  T1: 'bg-tier-t1',
  T2: 'bg-tier-blue',
  T3: 'bg-tier-t2'
};

const label: Record<Tier, string> = {
  T1: 'text-muted',
  T2: 'text-tier-blue',
  T3: 'text-tier-t2'
};

export const TIER_LABEL: Record<Tier, string> = {
  T1: 'Minor',
  T2: 'Moderate',
  T3: 'Serious'
};

export function TierBadge({ tier }: {tier: Tier;}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-raised px-2 py-1">
      <span className={`h-2 w-2 rounded-full ${dot[tier]}`} />
      <span className={`text-label font-medium ${label[tier]}`}>{TIER_LABEL[tier]}</span>
    </span>);

}