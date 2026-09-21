import React from 'react';
import { ReviewIncident } from '../types/report';
import { HighlightText } from './HighlightText';
import { TierBadge } from './TierBadge';
import { StatusChip } from './StatusChip';

/** Shared column widths so the header row and every incident row line up. */
export const INCIDENT_GRID = 'grid-cols-[100px_1fr_56px_140px]';

interface IncidentRowProps {
  incident: ReviewIncident;
  highlight?: boolean;
  onOpen: (incident: ReviewIncident) => void;
}

export function IncidentRow({ incident, highlight = false, onOpen }: IncidentRowProps) {
  const dismissed = incident.status === 'dismissed';

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(incident)}
        aria-label={`Open ${incident.type} at ${incident.time}`}
        className={`grid w-full ${INCIDENT_GRID} items-start gap-3.5 rounded-lg px-3 py-2.5 text-left outline-none transition-colors duration-150 ease-out hover:bg-raised focus-visible:ring-2 focus-visible:ring-teal`}>

        <TierBadge tier={incident.tier} />

        <span className={`min-w-0 text-body ${dismissed ? 'text-faint' : 'text-txt'}`}>
          <HighlightText active={highlight}>{incident.type}</HighlightText>
        </span>

        <span className="pt-1 text-right text-meta tabular-nums text-muted">{incident.time}</span>

        <span>
          <StatusChip status={incident.status} />
        </span>
      </button>
    </li>);

}
