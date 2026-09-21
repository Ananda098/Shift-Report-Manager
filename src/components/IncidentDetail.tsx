import React from 'react';
import { ReviewIncident, Tier } from '../types/report';
import { InlineEditable } from './InlineEditable';
import { TierMenu } from './TierMenu';
import { DetailsSection } from './DetailsSection';
import { EvidenceSection } from './EvidenceSection';
import { HistoryTimeline } from './HistoryTimeline';

interface IncidentDetailProps {
  incident: ReviewIncident;
  highlightId: string | null;
  openSourceRowId: string | null;
  onChangeTier: (tier: Tier) => void;
  onChangeSummary: (text: string) => void;
  onChangeDetail: (rowId: string, index: number, value: string) => void;
  onOpenSource: (rowId: string) => void;
  onAddEvidence: (name: string) => void;
}

export function IncidentDetail({
  incident,
  highlightId,
  openSourceRowId,
  onChangeTier,
  onChangeSummary,
  onChangeDetail,
  onOpenSource,
  onAddEvidence
}: IncidentDetailProps) {
  return (
    <article>
      <div className="flex items-center gap-3">
        <TierMenu tier={incident.tier} onChange={onChangeTier} />
        {incident.status !== 'pending' &&
        <span className="text-label text-faint">
            {incident.status === 'confirmed' ? 'Confirmed' : 'Dismissed'}
          </span>
        }
      </div>

      <h1 className="mt-3 text-title font-semibold text-txt">{incident.type}</h1>

      <div className="mt-5">
        <h2 className="text-section font-semibold text-txt">What happened</h2>
        <div className="mt-2">
          <InlineEditable
            value={incident.summary}
            ariaLabel="What happened"
            onChange={onChangeSummary} />
          
        </div>
      </div>

      <DetailsSection
        rows={incident.details}
        highlightId={highlightId}
        openSourceRowId={openSourceRowId}
        onChange={onChangeDetail}
        onOpenSource={onOpenSource} />
      

      <EvidenceSection
        evidence={incident.evidence}
        highlightId={highlightId}
        onAdd={onAddEvidence} />
      

      <HistoryTimeline
        entries={incident.history}
        location={incident.details.find((row) => row.id === 'location')?.values[0] ?? incident.location} />
      
    </article>);

}