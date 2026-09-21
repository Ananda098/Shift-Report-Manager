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
(voice notes, typed notes, team-app messages). The manager's job is to turn that raw
stream into a clean, sendable shift report:

1. **Report page** (`ReportHeader`, `ReviewModule`, `SummaryTab`/`NotesTab`) — the main
   landing view. Shows a nudge to review pending incidents, a running notes/summary
   draft, and the "Send report" action (not wired to anything real — it's set dressing).
2. **Review flow** (`ReviewView`) — a focused, one-incident-at-a-time queue for going
   through every incident: read what staff reported (`IncidentDetail`, `HistoryTimeline`),
   change its tier, attach evidence, answer inline AI prompts (`InlineAIHelp`), then
   **confirm** or **dismiss** it (`DecisionBar`, `DismissDialog`). Queue order is tier
   first (T3 → T1), then time (`utils/reviewActions.ts sortForQueue`).
3. **Add-incident panel** (`AddIncidentPanel`) — lets the manager log something the AI
   pipeline missed. Includes a simulated "record a voice note" interaction
   (`RecordButton`) that auto-fills the form after a short delay to sell the AI-transcription
   illusion (`handleStop` in `AddIncidentPanel.tsx`) — there is no real speech-to-text.
4. **Incident detail / preview** (`IncidentDetail`, `IncidentPreviewPanel`,
   `SourcePanel`) — lets the manager see the original quote/source behind any field
   (who said it, when, via voice/note/team app), and edit values inline.

The AI-assistant illusion (suggested tiers, inline help prompts, restock suggestions,
auto-filled voice transcripts) is a core part of the pitch — it should look real and
frictionless in the demo even though it's all scripted, not backed by any model.

## Architecture

- **Single shared state root**: `src/App.tsx` owns the one array of
  `ReviewIncident[]` (seeded from `src/data/incidents.ts`) and passes it plus two
  callbacks — `onUpdateIncident` (functional updater keyed by incident id) and
  `onAddIncident` — down through `AppShell`. Every view (report, review, add-panel,
  previews) reads and mutates this same state, so there is one source of truth for
  "tonight's incidents."
- **`AppShell.tsx`** is the real controller: it owns UI state (active tab, which
  panels/margins are open, toasts, the scripted inline-help queue) and switches between
  the `report` and `review` top-level views.
- **`types/report.ts`** defines the shared domain model: `Incident` / `ReviewIncident`,
  `Person`, `Evidence`, `DetailRow` (label/value rows that can carry a `Source` — the
  quote + person + time + input method it came from), `HistoryEntry`, and the
  `Statement`/`StatementSection` model used by the Notes/Summary tabs.
- **`src/data/`** is all fixture data: `incidents.ts` (the night's incidents),
  `people.ts` (staff roster), `statements.ts` (notes-tab content), `reviewHelp.ts`
  (scripted inline AI-help prompts keyed to specific incident ids, e.g. a mandatory
  witness question on incident `i-6`). Treat this as demo content — safe to edit for
  a better presentation narrative, not logic.
- **`src/utils/`**: `reviewActions.ts` (queue sorting, system history entries, pure
  `applyHelpAction` reducer for the scripted AI prompts), `categories.ts` (keyword →
  chip tagging for typed notes), `time.ts` (`nightOrder` — sorts times so post-midnight
  hours sort after the evening, since a "night" spans two calendar days), `caretCoordinates.ts`
  (inline-editable caret positioning).
- Ignore `src/package.json` — it's leftover Magic Patterns export metadata and isn't
  used by the actual build (the real manifest is the root `package.json`).

## Visual language

Dark theme defined entirely in `tailwind.config.js` (`base`/`card`/`raised`/`line`/`txt`/
`muted`/`faint`, a `teal` accent used for primary actions and AI-touched content, and
`tier` colors for T1/T2/T3 severity). Custom font sizes (`title`/`section`/`body`/`meta`/
`label`) are used instead of Tailwind's default scale — prefer them over `text-sm`/`text-lg`
etc. when styling. Global styles/animations (ghost shimmer for AI placeholders, slim
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
