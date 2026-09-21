import React from 'react';
import { PaperclipIcon, CheckIcon, ArrowRightIcon } from 'lucide-react';
import { ReviewIncident } from '../types/report';
import { TierBadge } from './TierBadge';
import { DrawerBody, DrawerFooter, DrawerPrimary } from './DrawerShell';

interface IncidentPreviewPanelProps {
  incident: ReviewIncident;
  onClose: () => void;
  onEditInReview: (incident: ReviewIncident) => void;
}

function StatusLine({ incident }: {incident: ReviewIncident;}) {
  if (incident.status === 'confirmed') {
    const at = [...incident.history].reverse().find((h) => h.label === 'You confirmed')?.time;
    return (
      <span className="flex items-center gap-1.5 px-2 text-label text-muted">
        <CheckIcon size={14} strokeWidth={2.25} className="text-teal" />
        Confirmed{at ? ` ${at}` : ''}
      </span>);

  }
  if (incident.status === 'dismissed') {
    return <span className="px-2 text-label text-faint">Dismissed</span>;
  }
  return <span className="px-2 text-label text-faint">Pending review</span>;
}

function PanelHeading({ children }: {children: React.ReactNode;}) {
  return <h3 className="text-label font-semibold uppercase tracking-wide text-faint">{children}</h3>;
}

/** Read-only counterpart to the editable drawers: same shell, same header,
    same footer box. Nothing here is a draft, so the footer's left slot
    carries the incident's standing instead of Cancel, and the one action is
    a way out to the review flow rather than a save. */
export function IncidentPreviewPanel({
  incident,
  onClose,
  onEditInReview
}: IncidentPreviewPanelProps) {
  return (
    <>
      <DrawerBody
        title={incident.type}
        eyebrow={<TierBadge tier={incident.tier} />}
        subtitle={`${incident.time} · ${incident.location}`}
        onClose={onClose}>

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
      </DrawerBody>

      <DrawerFooter>
        <StatusLine incident={incident} />
        <DrawerPrimary
          label="Edit in review"
          shortLabel="Review"
          trailingIcon={<ArrowRightIcon size={14} strokeWidth={2} />}
          onClick={() => onEditInReview(incident)} />

      </DrawerFooter>
    </>);

}
