import React from 'react';
import { motion } from 'framer-motion';
import { XIcon, PaperclipIcon, CheckIcon, ArrowRightIcon } from 'lucide-react';
import { ReviewIncident } from '../types/report';
import { TierBadge } from './TierBadge';

interface IncidentPreviewPanelProps {
  incident: ReviewIncident;
  onClose: () => void;
  onEditInReview: (incident: ReviewIncident) => void;
}

function StatusLine({ incident }: {incident: ReviewIncident;}) {
  if (incident.status === 'confirmed') {
    const at = [...incident.history].reverse().find((h) => h.label === 'You confirmed')?.time;
    return (
      <span className="flex items-center gap-1.5 text-label text-muted">
        <CheckIcon size={14} strokeWidth={2.25} className="text-teal" />
        Confirmed{at ? ` ${at}` : ''}
      </span>);

  }
  if (incident.status === 'dismissed') {
    return <span className="text-label text-faint">Dismissed</span>;
  }
  return <span className="text-label text-faint">Pending review</span>;
}

function PanelHeading({ children }: {children: React.ReactNode;}) {
  return <h3 className="text-label font-semibold uppercase tracking-wide text-faint">{children}</h3>;
}

export function IncidentPreviewPanel({
  incident,
  onClose,
  onEditInReview
}: IncidentPreviewPanelProps) {
  return (
    <motion.aside
      aria-label={`${incident.type} preview`}
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[340px] flex-col border-l border-line bg-card">
      
      <div className="scroll-slim flex-1 overflow-y-auto px-5 py-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <TierBadge tier={incident.tier} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close incident preview"
            className="-mr-1 rounded-md p-1 text-faint outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">
            
            <XIcon size={17} strokeWidth={2} />
          </button>
        </div>

        <h2 className="text-section font-semibold text-txt">{incident.type}</h2>
        <p className="mt-1 text-meta text-muted">
          {incident.time} · {incident.location}
        </p>

        <div className="mt-5 border-t border-line pt-4">
          <PanelHeading>Reported by</PanelHeading>
          {incident.reportedBy.length === 0 ?
          <p className="mt-2.5 text-body text-faint">Added by you</p> :

          <ul className="mt-2.5 space-y-2">
              {incident.reportedBy.map((person) =>
            <li key={person.id} className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-raised text-label font-medium text-muted">
                    {person.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-meta text-txt">{person.name}</span>
                    <span className="block text-label text-faint">{person.role}</span>
                  </span>
                </li>
            )}
            </ul>
          }
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <PanelHeading>What happened</PanelHeading>
          <p className="mt-2.5 text-body text-txt">{incident.summary}</p>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <PanelHeading>Evidence</PanelHeading>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {incident.evidence.length === 0 &&
            <p className="text-body text-faint">No evidence attached</p>
            }
            {incident.evidence.map((file) =>
            <span
              key={file.id}
              className="inline-flex items-center gap-1.5 rounded-md bg-raised px-2 py-1 text-label text-muted">
              
                <PaperclipIcon size={12} strokeWidth={2} className="text-faint" />
                {file.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex shrink-0 items-center justify-between gap-3 border-t border-line bg-card px-5 py-3">
        <StatusLine incident={incident} />
        <button
          type="button"
          onClick={() => onEditInReview(incident)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:border-teal hover:text-teal focus-visible:ring-2 focus-visible:ring-teal">
          
          Edit in review
          <ArrowRightIcon size={14} strokeWidth={2} />
        </button>
      </div>
    </motion.aside>);

}