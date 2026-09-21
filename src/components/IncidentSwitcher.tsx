import { ReviewIncident } from '../types/report';
import { sortForQueue } from '../utils/reviewActions';
import { TIER_LABEL } from './TierBadge';

interface IncidentSwitcherProps {
  incidents: ReviewIncident[];
  currentId: string;
  onSelect: (id: string) => void;
}

/** Jump-to-incident dropdown for narrow screens, where the review queue sidebar is hidden. */
export function IncidentSwitcher({ incidents, currentId, onSelect }: IncidentSwitcherProps) {
  const pending = sortForQueue(incidents.filter((i) => i.status === 'pending'));
  const done = incidents.filter((i) => i.status !== 'pending');

  return (
    <div className="border-b border-line bg-base px-4 py-2.5 wide:hidden">
      <label htmlFor="incident-switcher" className="sr-only">
        Jump to incident
      </label>
      <select
        id="incident-switcher"
        value={currentId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded-lg border border-line bg-raised px-3 py-2 text-body text-txt outline-none focus-visible:ring-2 focus-visible:ring-teal">

        {pending.length > 0 &&
        <optgroup label={`Pending (${pending.length})`}>
            {pending.map((incident) =>
          <option key={incident.id} value={incident.id}>
                {TIER_LABEL[incident.tier]} · {incident.type} · {incident.time}
              </option>
          )}
          </optgroup>
        }
        {done.length > 0 &&
        <optgroup label={`Done (${done.length})`}>
            {done.map((incident) =>
          <option key={incident.id} value={incident.id}>
                {TIER_LABEL[incident.tier]} · {incident.type} · {incident.time} ·{' '}
                {incident.status === 'confirmed' ? 'Confirmed' : 'Dismissed'}
              </option>
          )}
          </optgroup>
        }
      </select>
    </div>);

}
