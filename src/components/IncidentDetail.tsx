import { ReviewIncident, Tier } from '../types/report';
import { InlineEditable } from './InlineEditable';
import { TierMenu } from './TierMenu';
import { DetailsSection } from './DetailsSection';
import { EvidenceSection } from './EvidenceSection';
import { HistoryTimeline } from './HistoryTimeline';
import { Avatar } from './Avatar';

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
        <h2 className="text-label font-semibold uppercase tracking-wide text-faint">
          What happened
        </h2>
        <div className="mt-2.5">
          <InlineEditable
            value={incident.summary}
            ariaLabel="What happened"
            textClass="text-body leading-[1.75]"
            onChange={onChangeSummary} />

        </div>
        {incident.reportedBy.length > 0 &&
        <div className="group/prov relative mt-2.5 inline-flex items-center gap-2 text-label text-faint">
            <span className="flex -space-x-1.5">
              {incident.reportedBy.slice(0, 3).map((person) =>
            <Avatar
              key={person.id}
              person={person}
              className="h-[18px] w-[18px] border-2 border-base bg-raised text-[9px]" />

            )}
            </span>
            Summarised from {incident.reportedBy.length} report
            {incident.reportedBy.length > 1 ? 's' : ''}
            <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-1.5 whitespace-nowrap rounded-md border border-line bg-raised px-2.5 py-1.5 text-label text-muted opacity-0 shadow-lg transition-opacity duration-150 ease-out group-hover/prov:opacity-100">
              {incident.reportedBy.map((person) => {
              const reportTime = incident.history.find(
                (h) => h.kind === 'report' && h.person?.id === person.id
              )?.time;
              return (
                <div key={person.id}>
                    {person.name}
                  {reportTime ? ` · ${reportTime}` : ''}
                  </div>);

            })}
            </div>
          </div>
        }
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