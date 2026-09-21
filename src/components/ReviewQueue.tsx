import React from 'react';
import { ReviewIncident } from '../types/report';
import { sortForQueue } from '../utils/reviewActions';
import { TIER_DOT } from './TierBadge';
import { ReporterStack } from './ReporterStack';
import { DoneStack } from './DoneStack';

interface ReviewQueueProps {
  incidents: ReviewIncident[];
  currentId: string | null;
  onSelect: (id: string) => void;
}

export function ReviewQueue({ incidents, currentId, onSelect }: ReviewQueueProps) {
  const pending = sortForQueue(incidents.filter((i) => i.status === 'pending'));
  const done = incidents.filter((i) => i.status !== 'pending');

  return (
    <nav
      aria-label="Review queue"
      className="hidden w-[280px] shrink-0 flex-col border-r border-line bg-base wide:flex">

      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto">
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

        <ul className="space-y-1.5 px-3 pb-4">
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
                    <span className="min-w-0 truncate text-meta text-txt">{incident.type}</span>
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
      </div>

      <DoneStack incidents={done} currentId={currentId} onSelect={onSelect} />
    </nav>);

}
