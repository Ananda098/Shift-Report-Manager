# Shift Report Manager

## What this is

A demo product for **nightclub managers** — a tool a closing manager would use at the
end of a shift to review the night's incidents (door refusals, medical events,
altercations, theft, etc.), confirm or dismiss each one, fill in missing details, and
assemble a shift report to send up the chain.

This is a **presentation demo, not a real product**. All data is fictional and hardcoded
in `src/data/`. There is no backend, no auth, no persistence — state lives only in
`App.tsx` for the lifetime of the browser tab and resets on reload. Do not add a backend,
database, or real auth unless explicitly asked; the goal is a convincing, polished
walkthrough for an upcoming presentation, not production infrastructure.

The project was originally exported from [Magic Patterns](https://magicpatterns.com)
(React + TypeScript + Tailwind) and has been hand-edited since.

## The product concept

The demo tells a story: a busy night has generated a pile of incident reports from staff
(voice notes, typed notes, team-app messages), plus whatever the manager jots down
directly. The manager's job is to turn that raw stream into a clean, sendable shift
report:

1. **Report page** (`ReportHeader`, `NotesCard`, `ReviewModule`, `ReportSections`) — a
   single scrolling page, not tabs. `NotesCard` is a freeform "write or record" box that
   stays open before and after every push; `ReportSections` renders the Incidents summary
   plus four fixed report sections — **Crowd**, **Safety concerns**, **Staff**, **Supplies
   and repairs** — and the "Send report" action (not wired to anything real — it's set
   dressing).
2. **Notes → report ("mocked AI")** (`utils/mockAi.ts`) — typing or recording a note and
   hitting "Add note" runs it through a deterministic phrase-matcher
   (not a real model) that splits it into tagged statements per section, or, for an
   incident-shaped line, files a new incident awaiting review instead of report text.
   Each push logs the note itself as a compact entry ("My note · time") under the input;
   its pencil action reopens the same drawer text for editing, which re-syncs only the
   statements that came from that note and that the manager hasn't since edited or
   deleted by hand.
3. **Review flow** (`ReviewView`, with `ReviewTopBar`, `IncidentSwitcher`, `ReviewQueue`)
   — a focused, one-incident-at-a-time queue for going through every incident: read what
   staff reported (`IncidentDetail`, `HistoryTimeline`), change its tier, attach evidence,
   answer inline AI prompts (`InlineAIHelp`), then **confirm** or **dismiss** it
   (`DecisionBar`, `DismissDialog`). Queue order is tier first (T3 → T1), then time
   (`utils/reviewActions.ts sortForQueue`); already-decided incidents collapse into
   `DoneStack`, a hover/click-to-expand pile at the bottom of the queue.
4. **Add-incident panel** (`AddIncidentPanel`) — lets the manager log something the AI
   pipeline missed. Includes a simulated "record a voice note" interaction
   (`RecordButton`) that auto-fills the form after a short delay to sell the AI-transcription
   illusion (`handleStop` in `AddIncidentPanel.tsx`) — there is no real speech-to-text.
   `AddInfoPanel` is the equivalent drawer for a report section (fixed question rows per
   section, from `SECTION_QUESTIONS` in `mockAi.ts`), and `EditNotePanel` is the same
   drawer pattern for editing a pushed note's full text.
5. **Incident detail / preview** (`IncidentDetail`, `IncidentPreviewPanel`,
   `SourcePanel`) — lets the manager see the original quote/source behind any field
   (who said it, when, via voice/note/team app), and edit values inline.

The AI-assistant illusion (suggested tiers, inline help prompts, restock suggestions,
auto-filled voice transcripts, notes-to-report parsing) is a core part of the pitch — it
should look real and frictionless in the demo even though it's all scripted, not backed
by any model.

## Architecture

- **Single shared state root**: `src/App.tsx` owns the one array of
  `ReviewIncident[]` (seeded from `src/data/incidents.ts`) and passes it plus two
  callbacks — `onUpdateIncident` (functional updater keyed by incident id) and
  `onAddIncident` — down through `AppShell`. Every view (report, review, add-panel,
  previews) reads and mutates this same state, so there is one source of truth for
  "tonight's incidents."
- **`AppShell.tsx`** is the real controller: it owns UI state (which top-level view —
  `report` or `review` — is showing, which drawer/panel is open, toasts, the scripted
  inline-help queue) plus the report-building state: the four `StatementSection`s, the
  list of pushed `NoteEntry`s and the live notes draft, `pushedKeys` (phrase keys already
  filed, so re-parsing never duplicates) and `manuallyEditedIds` (statement ids the
  manager has hand-edited or deleted, which a later note edit must never overwrite).
  It also owns the single `drawer` descriptor (`incident` / `info` + section id / `note` +
  note id) and every drawer's unsaved draft (`incidentDraft`, `infoDrafts` keyed by
  section, `noteDrafts` keyed by note). The drafts live here rather than in the panels so
  swapping the drawer's contents never loses input; Cancel clears that drawer's draft, and
  a confirmed Add/Update clears it after saving.
- **`types/report.ts`** defines the shared domain model: `Incident` / `ReviewIncident`,
  `Person`, `Evidence`, `DetailRow` (label/value rows that can carry a `Source` — the
  quote + person + time + input method it came from), `HistoryEntry`, the
  `Statement`/`StatementSection` model behind each report section, and
  `NoteEntry`/`NoteMatch` (a pushed note's text/time plus the phrase-to-statement matches
  it produced, so editing the note can diff and re-sync correctly).
- **`src/data/`** is all fixture data: `incidents.ts` (the night's incidents),
  `people.ts` (staff roster), `statements.ts` (the four report sections' seed
  statements — these double as the mocked AI's phrase knowledge base, see below),
  `reviewHelp.ts` (scripted inline AI-help prompts keyed to specific incident ids, e.g. a
  mandatory witness question on incident `i-6`). Treat this as demo content — safe to
  edit for a better presentation narrative, not logic.
- **`src/utils/`**: `mockAi.ts` (`parseNotes` — matches a note's text against every seeded
  statement's `source.quote` and one hardcoded incident phrase, deterministically, so the
  demo is repeatable; `SECTION_QUESTIONS` — the fixed label/placeholder/chip rows the
  `AddInfoPanel` drawer asks per section), `reviewActions.ts` (queue sorting, system
  history entries, pure `applyHelpAction` reducer for the scripted AI prompts),
  `categories.ts` (keyword → chip tagging for typed notes), `time.ts` (`nightOrder` —
  sorts times so post-midnight hours sort after the evening, since a "night" spans two
  calendar days; `noteTimeForIndex` — a plausible increasing clock time for the Nth
  pushed note), `caretCoordinates.ts` (inline-editable caret positioning).
- Ignore `src/package.json` — it's leftover Magic Patterns export metadata and isn't
  used by the actual build (the real manifest is the root `package.json`).

## Visual language

Dark theme defined entirely in `tailwind.config.js` (`base`/`card`/`raised`/`line`/`txt`/
`muted`/`faint`, a `teal` accent used for primary actions and AI-touched content, and
`tier` colors for T1/T2/T3 severity plus a `tier.blue`). Three custom breakpoints live
under `theme.extend.screens`. `dt: '680px'` is the mobile/desktop cutoff for everything
that only needs a little room — below it `NavRail` is a bottom bar, gutters tighten to
`px-4`, the incidents table stacks each row onto two lines, and hover-only affordances
stay visible because touch has no hover. The side columns need far more than that, so
they land later and separately: `wide: '1024px'` brings in the report's `MarginRail` and
the review flow's `ReviewQueue` (below it the queue is replaced by `IncidentSwitcher`'s
dropdown), and `rail: '1180px'` moves the review flow's own `MarginRail` alongside the
content — later again, because there the 280px queue is already spending the width. Keep
the numeric `breakpoint` prop passed to `MarginRail` in sync with whichever variant wraps
it. Custom font sizes (`title`/`section`/`body`/`meta`/`label`) are used
instead of Tailwind's default scale — prefer them over `text-sm`/`text-lg` etc. when
styling. There is one side drawer, not three: `DrawerShell` owns the
`motion.aside` that slides in from the right at a fixed 440px, and `AddIncidentPanel`,
`AddInfoPanel` and `EditNotePanel` render inside it as a `DrawerBody` (title + close +
scrollable fields) plus a `DrawerFooter` (`DrawerCancel` and a primary/Record action).
Opening a second drawer while one is up crossfades the contents in place instead of
sliding the shell out and back — follow this for any new drawer. Global styles/animations (ghost shimmer for AI placeholders, slim
scrollbars, 2-line clamp) live in `src/index.css`.

## Working conventions

- Stack: Vite + React 18 + TypeScript + Tailwind, `framer-motion` for panel/dialog
  transitions, `lucide-react` for icons. No router, no state library, no backend — keep
  it that way unless asked.
- Run with `npm install` then `npm run dev`; `npm run build` for a production build;
  `npm run lint` for eslint.
- When adding incidents/people/help prompts, extend the fixtures in `src/data/` rather
  than inventing new state-holding mechanisms.
- Since this is presentation-facing, prioritize visual polish and demo reliability
  (no dead ends, no console errors mid-click-through) over architectural rigor.
