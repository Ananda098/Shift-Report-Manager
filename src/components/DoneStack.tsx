import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ReviewIncident } from '../types/report';
import { TIER_DOT } from './TierBadge';
import { ReporterStack } from './ReporterStack';

interface DoneStackProps {
  incidents: ReviewIncident[];
  currentId: string | null;
  onSelect: (id: string) => void;
}

export function DoneStack({ incidents, currentId, onSelect }: DoneStackProps) {
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);
  const visible = pinned || hovering;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pinned) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setPinned(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [pinned]);

  if (incidents.length === 0) return null;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="shrink-0 px-3 pb-6 pt-4">

      <AnimatePresence initial={false} mode="wait">
        {visible ?
        <motion.div
          key="list"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>

          <button
            type="button"
            onClick={() => setPinned((p) => !p)}
            className="mb-1.5 flex w-full items-center rounded-md px-1 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-teal">
            <span className="text-meta text-muted">{incidents.length} done</span>
          </button>

          <ul className="space-y-1.5">
            {incidents.map((incident) => {
              const current = incident.id === currentId;
              return (
                <li key={incident.id}>
                  <button
                    type="button"
                    onClick={() => pinned ? onSelect(incident.id) : setPinned(true)}
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
        </motion.div> :

        <motion.button
          key="stack"
          type="button"
          onClick={() => setPinned(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative block h-[56px] w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-teal">

          <span className="absolute inset-x-3 top-3 h-10 rounded-lg border border-line bg-card/60" />
          <span className="absolute inset-x-1.5 top-1.5 h-10 rounded-lg border border-line bg-card/80" />
          <span className="absolute inset-x-0 top-0 flex h-10 items-center justify-between rounded-lg border border-line bg-card px-2.5">
            <span className="text-meta text-muted">{incidents.length} done</span>
            <span className="text-label text-faint">Click to open</span>
          </span>
        </motion.button>
        }
      </AnimatePresence>
    </div>);

}
