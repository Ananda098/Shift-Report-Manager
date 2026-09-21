import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ReviewIncident } from '../types/report';
import { TierBadge } from './TierBadge';
import { StatusChip } from './StatusChip';

interface DoneStackProps {
  incidents: ReviewIncident[];
  currentId: string | null;
  onSelect: (id: string) => void;
}

export function DoneStack({ incidents, currentId, onSelect }: DoneStackProps) {
  const [expanded, setExpanded] = useState(false);
  if (incidents.length === 0) return null;

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="px-3 pb-6 pt-4">
      
      <AnimatePresence initial={false} mode="wait">
        {expanded ?
        <motion.ul
          key="list"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="space-y-1">
          
            {incidents.map((incident) => {
            const reporter = incident.reportedBy[0];
            const extra = Math.max(incident.reportedBy.length - 1, 0);
            return (
              <li key={incident.id}>
                  <button
                  type="button"
                  onClick={() => onSelect(incident.id)}
                  className={[
                  'w-full rounded-lg border border-line px-2.5 py-2 text-left outline-none transition-colors duration-150 ease-out',
                  'focus-visible:ring-2 focus-visible:ring-teal',
                  currentId === incident.id ? 'bg-raised' : 'bg-card hover:bg-raised'].
                  join(' ')}>
                  
                    <span className="flex items-center gap-2">
                      <TierBadge tier={incident.tier} />
                      <span className="min-w-0 flex-1 truncate text-meta text-muted">
                        {incident.type}
                      </span>
                    </span>
                    <span className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-label text-faint">
                        {incident.time}
                        <span>·</span>
                        {reporter ? reporter.name.split(' ')[0] : 'You'}
                        {extra > 0 ? ` +${extra}` : ''}
                      </span>
                      <StatusChip status={incident.status} />
                    </span>
                  </button>
                </li>);

          })}
          </motion.ul> :

        <motion.div
          key="stack"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative h-[56px]">
          
            <span className="absolute inset-x-3 top-3 h-10 rounded-lg border border-line bg-card/60" />
            <span className="absolute inset-x-1.5 top-1.5 h-10 rounded-lg border border-line bg-card/80" />
            <span className="absolute inset-x-0 top-0 flex h-10 items-center justify-between rounded-lg border border-line bg-card px-2.5">
              <span className="text-meta text-muted">{incidents.length} done</span>
              <span className="text-label text-faint">Hover to open</span>
            </span>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}