import { DetailRow, Evidence, HistoryEntry, ReviewIncident, Tier } from '../types/report';
import { nightOrder } from './time';

const TIER_ORDER: Record<Tier, number> = { T3: 0, T2: 1, T1: 2 };

export function sortForQueue(list: ReviewIncident[]): ReviewIncident[] {
  return [...list].sort(
    (a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || nightOrder(a.time) - nightOrder(b.time)
  );
}

export function systemEntry(label: string, time = '03:14'): HistoryEntry {
  return { id: `h-sys-${Math.random().toString(36).slice(2, 8)}`, kind: 'system', time, label };
}

function withRow(rows: DetailRow[], row: DetailRow): DetailRow[] {
  const exists = rows.some((r) => r.id === row.id);
  return exists ? rows.map((r) => r.id === row.id ? row : r) : [...rows, row];
}

export interface HelpActionResult {
  incident: ReviewIncident;
  /** DOM-independent id of the row or tile that should flash teal. */
  highlightId: string | null;
  /** Other help card ids to resolve alongside this one — used to skip a chained follow-up when the answer doesn't need it. */
  skipIds?: string[];
}

/** Applies an InlineAIHelp answer to an incident. Pure — returns a new incident. */
export function applyHelpAction(incident: ReviewIncident, action: string): HelpActionResult {
  switch (action) {
    case 'witness-zosia':
      return {
        incident: {
          ...incident,
          details: incident.details.map((row) =>
          row.id === 'parties' ?
          {
            ...row,
            values: row.values.map((value) =>
            value.startsWith('Zosia') ? 'Zosia, bar staff — witness' : value
            )
          } :
          row
          )
        },
        highlightId: 'parties'
      };
    case 'witness-none':
      return {
        incident: {
          ...incident,
          details: withRow(incident.details, {
            id: 'witnesses',
            label: 'Witnesses',
            values: ['None present']
          })
        },
        highlightId: 'witnesses'
      };
    case 'medical-first-aid':
    case 'medical-declined':
    case 'medical-ambulance':{
        const value =
        action === 'medical-first-aid' ?
        'Yes, first aid given' :
        action === 'medical-declined' ?
        'Offered, declined' :
        'Ambulance called';
        return {
          incident: {
            ...incident,
            details: withRow(incident.details, {
              id: 'medical',
              label: 'Medical attention',
              values: [value]
            })
          },
          highlightId: 'medical'
        };
      }
    case 'watchlist-yes':
      return {
        incident: {
          ...incident,
          details: withRow(incident.details, {
            id: 'watchlist',
            label: 'Watch list',
            values: ['Flagged — duration pending']
          })
        },
        highlightId: 'watchlist'
      };
    case 'watchlist-no':
      return {
        incident,
        highlightId: null,
        skipIds: ['help-watchlist-duration']
      };
    case 'watchlist-tonight':
    case 'watchlist-month':
    case 'watchlist-indefinite':{
        const value =
        action === 'watchlist-tonight' ?
        'Flagged — rest of tonight' :
        action === 'watchlist-month' ?
        'Flagged — this month' :
        'Flagged — indefinite, repeat offender';
        return {
          incident: {
            ...incident,
            details: withRow(incident.details, { id: 'watchlist', label: 'Watch list', values: [value] })
          },
          highlightId: 'watchlist'
        };
      }
    case 'hazard-yes':
      return {
        incident: {
          ...incident,
          details: withRow(incident.details, {
            id: 'hazard',
            label: 'Hazard follow-up',
            values: ['Logged — action pending']
          })
        },
        highlightId: 'hazard'
      };
    case 'hazard-no':
      return {
        incident,
        highlightId: null,
        skipIds: ['help-hazard-action']
      };
    case 'hazard-mopped':
    case 'hazard-sign':
    case 'hazard-cordoned':{
        const value =
        action === 'hazard-mopped' ?
        'Floor mopped immediately' :
        action === 'hazard-sign' ?
        'Warning sign placed' :
        'Area cordoned off';
        return {
          incident: {
            ...incident,
            details: withRow(incident.details, { id: 'hazard', label: 'Hazard follow-up', values: [value] })
          },
          highlightId: 'hazard'
        };
      }
    case 'request-clip':{
        const clip: Evidence = {
          id: `e-req-${incident.id}`,
          kind: 'request',
          name: 'CCTV request',
          status: 'pending'
        };
        return {
          incident: {
            ...incident,
            evidence: [...incident.evidence, clip],
            history: [
            ...incident.history,
            systemEntry('You requested the Bar 2 clip, 23:35–23:50')]

          },
          highlightId: clip.id
        };
      }
    default:
      return { incident, highlightId: null };
  }
}