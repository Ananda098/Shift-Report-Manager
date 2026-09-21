import React from 'react';
import { ReviewIncident } from '../types/report';
import { sortForQueue } from '../utils/reviewActions';
import { TierBadge } from './TierBadge';
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
      className="scroll-slim flex w-[280px] shrink-0 flex-col overflow-y-auto border-r border-line bg-base">
      
      <div className="px-5 pb-4 pt-6">
        <h2 className="text-section font-semibold text-txt">Let’s go through it together</h2>
        <p className="mt-1 text-meta text-muted">{pending.length} left tonight</p>
      </div>

      <ul className="space-y-0.5 px-3">
        {pending.map((incident) => {
          const current = incident.id === currentId;
          return (
            <li key={incident.id}>
              <button
                type="button"
                onClick={() => onSelect(incident.id)}
                aria-current={current ? 'true' : undefined}
                className={[
                'relative w-full rounded-lg px-2.5 py-2.5 text-left outline-none transition-colors duration-150 ease-out',
                'focus-visible:ring-2 focus-visible:ring-teal',
                current ? 'bg-raised' : 'hover:bg-card'].
                join(' ')}>
                
                {current &&
                <span
                  aria-hidden
                  className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-teal" />

                }
                <TierBadge tier={incident.tier} />
                <span className="mt-1.5 block truncate text-body text-txt">{incident.type}</span>
                <span className="mt-0.5 block text-meta text-faint">
                  {incident.time} · {incident.location}
                </span>
              </button>
            </li>);

        })}
      </ul>

      <DoneStack incidents={done} currentId={currentId} onSelect={onSelect} />
    </nav>);

}