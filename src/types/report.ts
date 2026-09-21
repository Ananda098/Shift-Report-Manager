export type Tier = 'T1' | 'T2' | 'T3';

export type InputType = 'Voice' | 'Note' | 'Team app' | 'Typed';

export type ReviewStatus = 'pending' | 'confirmed' | 'dismissed';

export interface Person {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export type EvidenceKind = 'video' | 'photo' | 'document' | 'request';

export interface Evidence {
  id: string;
  kind: EvidenceKind;
  name: string;
  /** Video length, e.g. "2:14". */
  duration?: string;
  /** Free-form state for requested evidence, e.g. "pending". */
  status?: string;
}

export interface Source {
  quote: string;
  person: Person;
  time: string;
  input: InputType;
}

export interface Incident {
  id: string;
  tier: Tier;
  type: string;
  time: string;
  location: string;
  reportedBy: Person[];
  description: string;
  evidence: Evidence[];
}

/** A label / value row in the incident detail view. Parties has several values. */
export interface DetailRow {
  id: string;
  label: string;
  values: string[];
  source?: Source;
}

export interface HistoryEntry {
  id: string;
  kind: 'report' | 'system';
  time: string;
  person?: Person;
  /** Role shown for this entry, overriding the person's default role. */
  role?: string;
  input?: InputType;
  /** Voice length, e.g. "22s". */
  duration?: string;
  /** Where this was reported from, when it differs from the incident location. */
  location?: string;
  text?: string;
  /** System entries have no author and no body. */
  label?: string;
}

export interface ReviewIncident extends Incident {
  status: ReviewStatus;
  summary: string;
  details: DetailRow[];
  history: HistoryEntry[];
}

/** A line appended to a statement by something other than a person, e.g. a suggestion. */
export interface AddedSource {
  label: string;
  by: string;
  time: string;
}

export interface Statement {
  id: string;
  chips: string[];
  text: string;
  source: Source;
  addedSources?: AddedSource[];
}

export interface StatementSection {
  id: string;
  title: string;
  statements: Statement[];
}