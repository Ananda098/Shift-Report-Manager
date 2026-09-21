import { RestockUrgency, Tier } from '../types/report';
import { statementSections } from '../data/statements';

export interface ParsedStatement {
  /** Stable id for the phrase that produced this — lets a repeat push skip it. */
  key: string;
  sectionId: string;
  chips: string[];
  text: string;
  /** The exact fragment of the manager's own notes this was drawn from, for the source popover. */
  quote: string;
}

export interface ParsedIncident {
  key: string;
  tier: Tier;
  type: string;
  time: string;
  location: string;
  description: string;
}

interface StatementSnippet extends Omit<ParsedStatement, 'quote'> {
  /** Phrase to look for in raw notes (case-insensitive). */
  match: string;
}

/** Pulls the phrase back out of the notes with its original casing/punctuation intact. */
function exactFragment(notes: string, phrase: string): string {
  const index = notes.toLowerCase().indexOf(phrase.toLowerCase());
  return index === -1 ? phrase : notes.slice(index, index + phrase.length);
}

interface IncidentSnippet extends ParsedIncident {
  match: string;
}

/**
 * The "knowledge" a real notes-parsing model would infer at runtime. Every
 * statement already seeded in data/statements.ts doubles as a phrase this
 * mock recognises: its source quote is the trigger, its text/chips/section
 * are what gets filed — so the demo produces the same result every time.
 */
const STATEMENT_SNIPPETS: StatementSnippet[] = statementSections.flatMap((section) =>
section.statements.map((statement) => ({
  key: statement.id,
  match: statement.source.quote,
  sectionId: section.id,
  chips: statement.chips,
  text: statement.text
}))
);

/** One phrase that reads as an incident rather than a shift note. */
const INCIDENT_SNIPPETS: IncidentSnippet[] = [
{
  key: 'incident-smoking-area-shove',
  match: 'shoving each other near the smoking area',
  tier: 'T2',
  type: 'Altercation',
  time: '00:30',
  location: 'Smoking area',
  description:
  'Two guests began shoving each other near the smoking area; the door team separated them within seconds.'
}];


/**
 * Mocked notes → report parser. A real version would call an LLM; this one
 * just recognises known phrases, so the demo is deterministic and repeatable.
 * `alreadyUsed` holds keys from earlier pushes so re-pushing the same notes
 * never re-adds or duplicates anything.
 */
export function parseNotes(
notes: string,
alreadyUsed: ReadonlySet<string>)
: {statements: ParsedStatement[];incidents: ParsedIncident[];} {
  const haystack = notes.toLowerCase();

  const statements = STATEMENT_SNIPPETS.
  filter((s) => !alreadyUsed.has(s.key) && haystack.includes(s.match.toLowerCase())).
  map(({ key, sectionId, chips, text, match }) => ({
    key,
    sectionId,
    chips,
    text,
    quote: exactFragment(notes, match)
  }));

  const incidents = INCIDENT_SNIPPETS.
  filter((i) => !alreadyUsed.has(i.key) && haystack.includes(i.match.toLowerCase())).
  map(({ key, tier, type, time, location, description }) => ({
    key,
    tier,
    type,
    time,
    location,
    description
  }));

  return { statements, incidents };
}

/**
 * Bottled stock the venue reorders, and the words that name it in a supplies
 * line. A real model would recognise these at runtime; this fixed vocabulary
 * keeps the "add a restock request?" follow-up deterministic.
 */
const RESTOCK_STOCK: {name: string;matches: string[];}[] = [
{ name: 'Vodka', matches: ['vodka'] },
{ name: 'Jägermeister', matches: ['jägermeister', 'jagermeister', 'jäger', 'jager'] },
{ name: 'Tequila', matches: ['tequila'] },
{ name: 'Gin', matches: ['gin'] },
{ name: 'Rum', matches: ['rum'] },
{ name: 'Whisky', matches: ['whisky', 'whiskey'] },
{ name: 'Prosecco', matches: ['prosecco'] },
{ name: 'Tonic', matches: ['tonic'] }];


/** Quantities offered per item, plus the fallback when a step is skipped. */
export const RESTOCK_QUANTITIES = [6, 12, 24];
export const RESTOCK_DEFAULT_QTY = 12;

export const RESTOCK_URGENCIES: RestockUrgency[] = [
'Before next shift',
'This week',
'Next regular order'];


/**
 * Mocked "this sounds like it needs reordering" check: which bottled items a
 * supplies statement names, in the order they appear in it. Anything outside
 * the supplies section, or naming nothing orderable, gets no follow-up.
 */
export function suggestRestock(sectionId: string, text: string): string[] {
  if (sectionId !== 'supplies') return [];

  return RESTOCK_STOCK.
  map(({ name, matches }) => {
    const at = matches.reduce((earliest, phrase) => {
      const index = text.search(new RegExp(`\\b${phrase}\\b`, 'i'));
      if (index === -1) return earliest;
      return earliest === -1 ? index : Math.min(earliest, index);
    }, -1);
    return { name, at };
  }).
  filter((found) => found.at !== -1).
  sort((a, b) => a.at - b.at).
  map((found) => found.name);
}

/** One row the "+ Add information" drawer asks for a section — styled like a
    New-incident field: short label on the left, the question as the input's
    placeholder on the right. */
export interface SectionQuestion {
  /** Short field label, e.g. "Staffing" — rendered uppercase, matching New incident's Field. */
  label: string;
  /** The supporting question, shown as the input placeholder. */
  placeholder: string;
  chip: string;
  /** Filled in when the manager taps Record instead of typing. */
  sampleAnswer: string;
}

/**
 * Fixed prompts per section — the things worth remembering for handover,
 * insurance or a legal follow-up, framed as questions rather than fields.
 */
export const SECTION_QUESTIONS: Record<string, SectionQuestion[]> = {
  crowd: [
  {
    label: 'Busy',
    placeholder: 'How busy, and when?',
    chip: 'audience',
    sampleAnswer: 'Packed by midnight, steady until close.'
  },
  {
    label: 'Groups',
    placeholder: 'Any private bookings tonight?',
    chip: 'private events',
    sampleAnswer: 'A hen party of about fifteen in the mezzanine from ten.'
  },
  {
    label: 'Vibe',
    placeholder: 'Crowd energy or age mix stand out?',
    chip: 'experience',
    sampleAnswer: 'Younger crowd than usual, mostly student-age.'
  },
  {
    label: 'Capacity',
    placeholder: 'Near capacity at any point?',
    chip: 'capacity',
    sampleAnswer: 'Hit capacity briefly around one, held the door for ten minutes.'
  }],

  safety: [
  {
    label: 'Security',
    placeholder: 'Any safety or security issue?',
    chip: 'security',
    sampleAnswer: 'One guest got argumentative at the cloakroom, settled quickly.'
  },
  {
    label: 'Maintenance',
    placeholder: 'Anything broken or unsafe?',
    chip: 'maintenance',
    sampleAnswer: 'Handrail on the back stairs is loose.'
  },
  {
    label: 'Complaints',
    placeholder: 'Any guest complaints?',
    chip: 'complaint',
    sampleAnswer: 'Complaint about the smoking area queue moving too slowly.'
  },
  {
    label: 'Handover',
    placeholder: 'Anything the next shift should know?',
    chip: 'handover',
    sampleAnswer: 'Regular in the grey jacket was asked to slow down on drinks twice.'
  }],

  staff: [
  {
    label: 'Staffing',
    placeholder: 'Fully staffed and on time?',
    chip: 'staffing',
    sampleAnswer: 'Fully staffed, everyone on time.'
  },
  {
    label: 'Standouts',
    placeholder: 'Anyone who handled something well?',
    chip: 'recognition',
    sampleAnswer: 'Ola handled the medical call calmly and kept the floor informed.'
  },
  {
    label: 'Issues',
    placeholder: 'Any conduct or performance issue?',
    chip: 'conduct',
    sampleAnswer: 'None tonight.'
  },
  {
    label: 'Training',
    placeholder: 'Any training gap you noticed?',
    chip: 'training',
    sampleAnswer: 'New door staff still unsure on the ID-check process.'
  }],

  supplies: [
  {
    label: 'Equipment',
    placeholder: 'Anything broken or not working?',
    chip: 'equipment',
    sampleAnswer: 'One of the till card readers is intermittent.'
  },
  {
    label: 'Stock',
    placeholder: 'Anything running low or out?',
    chip: 'inventory',
    sampleAnswer: 'Running low on cups and ice by close.'
  },
  {
    label: 'Vendors',
    placeholder: 'Any issue with suppliers or third parties?',
    chip: 'vendors',
    sampleAnswer: 'Linen delivery arrived a day late again.'
  },
  {
    label: 'Requests',
    placeholder: 'Anything else the venue needs?',
    chip: 'requests',
    sampleAnswer: 'Could use a second radio for the smoking area.'
  }]

};
