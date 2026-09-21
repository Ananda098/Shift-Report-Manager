import { ReviewIncident } from '../types/report';
import { HighlightText } from './HighlightText';
import { TierBadge } from './TierBadge';
import { StatusChip } from './StatusChip';

/**
 * Shared column layout so the header row and every incident row line up.
 * The tracks stay fixed because the header and the rows are separate grids —
 * `auto` would size each to its own content and drift apart. The `dt:`
 * prefixes live inside the constant because Tailwind only scans literal
 * class strings, so prefixing it at the use site would not compile.
 */
export const INCIDENT_GRID =
'dt:grid dt:grid-cols-[100px_minmax(0,1fr)_56px_140px] dt:items-start dt:gap-3.5';

interface IncidentRowProps {
  incident: ReviewIncident;
  highlight?: boolean;
  onOpen: (incident: ReviewIncident) => void;
}

export function IncidentRow({ incident, highlight = false, onOpen }: IncidentRowProps) {
  const dismissed = incident.status === 'dismissed';

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(incident)}
        aria-label={`Open ${incident.type} at ${incident.time}`}
        className={`flex w-full flex-col items-start gap-1.5 ${INCIDENT_GRID} rounded-lg px-3 py-2.5 text-left outline-none transition-colors duration-150 ease-out hover:bg-raised focus-visible:ring-2 focus-visible:ring-teal`}>

        <span
          className={`w-full min-w-0 text-body dt:col-start-2 dt:row-start-1 ${dismissed ? 'text-faint' : 'text-txt'}`}>

          <HighlightText active={highlight}>{incident.type}</HighlightText>
        </span>

        <span className="flex w-full items-center gap-2 dt:contents">
          <span className="dt:col-start-1 dt:row-start-1">
            <TierBadge tier={incident.tier} />
          </span>

          <span className="ml-auto text-meta tabular-nums text-muted dt:col-start-3 dt:row-start-1 dt:ml-0 dt:pt-1 dt:text-right">
            {incident.time}
          </span>

          <span className="dt:col-start-4 dt:row-start-1 dt:flex dt:justify-end">
            <StatusChip status={incident.status} />
          </span>
        </span>
      </button>
    </li>);

}
