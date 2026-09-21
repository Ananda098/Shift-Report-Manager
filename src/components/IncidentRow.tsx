import React from 'react';
import { Person, ReviewIncident } from '../types/report';
import { people } from '../data/people';
import { HighlightText } from './HighlightText';
import { TierBadge } from './TierBadge';
import { StatusChip } from './StatusChip';

interface IncidentRowProps {
  incident: ReviewIncident;
  highlight?: boolean;
  onOpen: (incident: ReviewIncident) => void;
}

const MAX_AVATARS = 3;

function ReporterAvatar({ person }: {person: Person;}) {
  return (
    <span className="group/avatar relative">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-raised text-[11px] font-medium text-muted ring-2 ring-card">
        {person.initials}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-raised px-2 py-1 text-label text-txt opacity-0 shadow-lg transition-opacity duration-150 ease-out group-hover/avatar:opacity-100">
        
        {person.name} · {person.role}
      </span>
    </span>);

}

export function IncidentRow({ incident, highlight = false, onOpen }: IncidentRowProps) {
  const dismissed = incident.status === 'dismissed';
  const shown = incident.reportedBy.slice(0, MAX_AVATARS);
  const extra = incident.reportedBy.length - shown.length;

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(incident)}
        aria-label={`Open ${incident.type} at ${incident.time}`}
        className="grid w-full cursor-pointer grid-cols-[260px_1fr_auto] items-center gap-4 rounded-lg px-3 py-2.5 text-left outline-none transition-colors duration-150 ease-out hover:bg-raised focus-visible:ring-2 focus-visible:ring-teal">
        
        <span className="flex min-w-0 items-center gap-2.5">
          <TierBadge tier={incident.tier} />
          <span className={`truncate text-body ${dismissed ? 'text-faint' : 'text-txt'}`}>
            <HighlightText active={highlight}>{incident.type}</HighlightText>
          </span>
        </span>

        <span className="flex items-center gap-2.5 text-meta text-muted">
          <span className="tabular-nums">{incident.time}</span>
          <span className="flex -space-x-1.5">
            {shown.map((person) =>
            <ReporterAvatar key={person.id} person={person} />
            )}
            {shown.length === 0 && <ReporterAvatar person={people.you} />}
            {extra > 0 &&
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-raised text-[11px] font-medium text-faint ring-2 ring-card">
                +{extra}
              </span>
            }
          </span>
        </span>

        <StatusChip status={incident.status} />
      </button>
    </li>);

}