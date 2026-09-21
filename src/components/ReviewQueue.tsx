import React, { useState } from 'react';
import { Person, ReviewIncident } from '../types/report';
import { sortForQueue } from '../utils/reviewActions';
import { TIER_DOT } from './TierBadge';
import { DoneStack } from './DoneStack';

interface ReviewQueueProps {
  incidents: ReviewIncident[];
  currentId: string | null;
  onSelect: (id: string) => void;
}

function Avatar({ person, surface }: {person: Person;surface: string;}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(person.avatarUrl) && !imgFailed;

  return (
    <span className={`flex h-6 w-6 items-center justify-center overflow-hidden rounded-full text-[10px] font-medium text-muted ring-2 ${surface}`}>
      {showImage ?
      <img
        src={person.avatarUrl}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setImgFailed(true)} /> :


      person.initials}
    </span>);

}

function ReporterStack({ people, current }: {people: Person[];current: boolean;}) {
  const shown = people.slice(0, 2);
  const extra = people.length - shown.length;
  const avatarSurface = current ? 'bg-card ring-raised' : 'bg-raised ring-card';

  return (
    <span className="flex shrink-0 items-center -space-x-2">
      {shown.map((person) =>
      <span key={person.id} className="group/avatar relative">
          <Avatar person={person} surface={avatarSurface} />
          <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-raised px-2 py-1 text-label text-txt opacity-0 shadow-lg transition-opacity duration-150 ease-out group-hover/avatar:opacity-100">
            {person.name}
          </span>
        </span>
      )}
      {extra > 0 &&
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-faint ring-2 ${avatarSurface}`}>
          +{extra}
        </span>
      }
    </span>);

}

export function ReviewQueue({ incidents, currentId, onSelect }: ReviewQueueProps) {
  const pending = sortForQueue(incidents.filter((i) => i.status === 'pending'));
  const done = incidents.filter((i) => i.status !== 'pending');

  return (
    <nav
      aria-label="Review queue"
      className="scroll-slim hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r border-line bg-base dt:flex">

      <div className="px-5 pb-4 pt-6">
        <p className="text-meta text-muted">{pending.length} left tonight</p>
        <div
          role="progressbar"
          aria-label="Review progress"
          aria-valuemin={0}
          aria-valuemax={incidents.length}
          aria-valuenow={done.length}
          className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-raised">

          <div
            className="h-full rounded-full bg-teal transition-[width] duration-300 ease-out"
            style={{ width: `${incidents.length ? done.length / incidents.length * 100 : 0}%` }} />

        </div>
      </div>

      <ul className="space-y-1.5 px-3">
        {pending.map((incident) => {
          const current = incident.id === currentId;
          return (
            <li key={incident.id}>
              <button
                type="button"
                onClick={() => onSelect(incident.id)}
                aria-current={current ? 'true' : undefined}
                className={[
                'relative w-full rounded-lg px-3.5 py-3.5 text-left outline-none transition-colors duration-150 ease-out',
                'focus-visible:ring-2 focus-visible:ring-teal',
                current ? 'bg-raised' : 'bg-card/25 hover:bg-card'].
                join(' ')}>

                {current &&
                <span
                  aria-hidden
                  className="absolute inset-y-2.5 left-0 w-0.5 rounded-full bg-teal" />

                }
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TIER_DOT[incident.tier]}`} />
                  <span className="truncate text-body text-txt">{incident.type}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <ReporterStack people={incident.reportedBy} current={current} />
                  <span className="shrink-0 text-label text-faint">
                    {incident.date} · {incident.time}
                  </span>
                </div>
              </button>
            </li>);

        })}
      </ul>

      <DoneStack incidents={done} currentId={currentId} onSelect={onSelect} />
    </nav>);

}
