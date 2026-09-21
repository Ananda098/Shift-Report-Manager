import { Tier } from '../types/report';
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

/** One supporting question the "+ Add information" drawer asks for a section. */
export interface SectionQuestion {
  question: string;
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
    question: 'How busy did it get, and when?',
    chip: 'audience',
    sampleAnswer: 'Packed by midnight, steady until close.'
  },
  {
    question: 'Any private bookings or groups tonight?',
    chip: 'private events',
    sampleAnswer: 'A hen party of about fifteen in the mezzanine from ten.'
  },
  {
    question: 'Did the crowd energy or age mix stand out?',
    chip: 'experience',
    sampleAnswer: 'Younger crowd than usual, mostly student-age.'
  },
  {
    question: 'Were we ever near capacity?',
    chip: 'capacity',
    sampleAnswer: 'Hit capacity briefly around one, held the door for ten minutes.'
  }],

  concerning: [
  {
    question: 'Any safety or security issue, even a minor one?',
    chip: 'security',
    sampleAnswer: 'One guest got argumentative at the cloakroom, settled quickly.'
  },
  {
    question: 'Anything broken, unsafe, or in need of repair?',
    chip: 'maintenance',
    sampleAnswer: 'Handrail on the back stairs is loose.'
  },
  {
    question: 'Any guest complaints worth flagging?',
    chip: 'complaint',
    sampleAnswer: 'Complaint about the smoking area queue moving too slowly.'
  },
  {
    question: 'Anything a future shift should be warned about?',
    chip: 'handover',
    sampleAnswer: 'Regular in the grey jacket was asked to slow down on drinks twice.'
  }],

  crew: [
  {
    question: 'Was the team fully staffed and on time?',
    chip: 'staffing',
    sampleAnswer: 'Fully staffed, everyone on time.'
  },
  {
    question: 'Anyone who handled something particularly well?',
    chip: 'recognition',
    sampleAnswer: 'Ola handled the medical call calmly and kept the floor informed.'
  },
  {
    question: 'Any conduct or performance issue to note?',
    chip: 'conduct',
    sampleAnswer: 'None tonight.'
  },
  {
    question: 'Any training gap you noticed?',
    chip: 'training',
    sampleAnswer: 'New door staff still unsure on the ID-check process.'
  }],

  needs: [
  {
    question: 'What ran low or ran out tonight?',
    chip: 'inventory',
    sampleAnswer: 'Running low on cups and ice by close.'
  },
  {
    question: 'Any equipment that needs fixing or replacing?',
    chip: 'equipment',
    sampleAnswer: 'One of the till card readers is intermittent.'
  },
  {
    question: 'Anything to reorder before next weekend?',
    chip: 'supplies',
    sampleAnswer: 'Reorder tonic and lime before Friday.'
  },
  {
    question: 'Any facilities issue for the day team?',
    chip: 'facilities',
    sampleAnswer: 'Back door lock is sticking, needs a look.'
  }]

};

export interface DrawerAnswer {
  question: string;
  chip: string;
  text: string;
}

/** Turns answered drawer questions into tagged statements — the answer text stands as-is. */
export function answersToStatements(answers: DrawerAnswer[]): {chips: string[];text: string;}[] {
  return answers.
  filter((a) => a.text.trim().length > 0).
  map((a) => ({ chips: [a.chip], text: a.text.trim() }));
}
