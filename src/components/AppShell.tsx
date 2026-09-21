import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  NoteEntry,
  NoteMatch,
  RestockRequest,
  ReviewIncident,
  Statement,
  StatementSection } from
'../types/report';
import { statementSections } from '../data/statements';
import { people } from '../data/people';
import { sortForQueue, systemEntry } from '../utils/reviewActions';
import { noteTimeForIndex } from '../utils/time';
import {
  ParsedIncident,
  ParsedStatement,
  parseNotes,
  SECTION_QUESTIONS,
  suggestRestock } from
'../utils/mockAi';
import { NavRail } from './NavRail';
import { ReportHeader } from './ReportHeader';
import { ReviewModule } from './ReviewModule';
import { NotesCard } from './NotesCard';
import { EditNotePanel } from './EditNotePanel';
import { ReportSections } from './ReportSections';
import { SourcePanel } from './SourcePanel';
import { RestockFollowUp } from './RestockFollowUp';
import { MarginRail, MarginRailItem } from './MarginRail';
import { IncidentPreviewPanel } from './IncidentPreviewPanel';
import {
  AddIncidentPanel,
  EMPTY_INCIDENT_DRAFT,
  IncidentDraft,
  incidentDraftHasData } from
'./AddIncidentPanel';
import { AddInfoPanel, emptyInfoDraft, InfoDraft, infoDraftIsDirty } from './AddInfoPanel';
import { DrawerShell } from './DrawerShell';
import { ReviewView } from './ReviewView';
import { toast } from 'sonner';

/** Which of the three drawers the one shell is currently showing. */
type Drawer =
{kind: 'incident';} |
{kind: 'info';sectionId: string;} |
{kind: 'note';noteId: string;};

const drawerKey = (drawer: Drawer): string =>
drawer.kind === 'incident' ?
'incident' :
drawer.kind === 'info' ?
`info-${drawer.sectionId}` :
`note-${drawer.noteId}`;

interface AppShellProps {
  incidents: ReviewIncident[];
  onUpdateIncident: (id: string, updater: (incident: ReviewIncident) => ReviewIncident) => void;
  onAddIncident: (incident: ReviewIncident) => void;
  resolvedHelp: string[];
  onResolveHelp: (helpId: string) => void;
}

/** Placeholder "now" used as the source time for anything the manager files directly. */
const NOW = '03:14';

/** Human-readable line for the post-push toast, naming where things landed. */
function summarisePush(
statements: ParsedStatement[],
incidents: ParsedIncident[],
titleById: Record<string, string>)
: string {
  if (statements.length === 0 && incidents.length === 0) {
    return 'Nothing new in your notes — already in the report.';
  }
  const counts = new Map<string, number>();
  statements.forEach((s) => counts.set(s.sectionId, (counts.get(s.sectionId) ?? 0) + 1));
  const parts = Array.from(counts.entries()).map(([id, n]) => `${n} to ${titleById[id] ?? id}`);
  if (incidents.length > 0) {
    parts.push(`${incidents.length} incident${incidents.length > 1 ? 's' : ''} awaiting review`);
  }
  return `Added ${parts.join(' · ')}.`;
}

export function AppShell({
  incidents,
  onUpdateIncident,
  onAddIncident,
  resolvedHelp,
  onResolveHelp
}: AppShellProps) {
  const [view, setView] = useState<'report' | 'review'>('report');
  const [notesDraft, setNotesDraft] = useState('');
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [notesPushed, setNotesPushed] = useState(false);
  const [pushedKeys, setPushedKeys] = useState<Set<string>>(new Set());
  const [manuallyEditedIds, setManuallyEditedIds] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState<StatementSection[]>(
    statementSections.map((section) => ({ ...section, statements: [] }))
  );
  const [openStatementId, setOpenStatementId] = useState<string | null>(null);
  // An answered restock request the manager has reopened from its line in the
  // report — its card comes back to the margin until they answer again.
  const [editingRestockId, setEditingRestockId] = useState<string | null>(null);
  const [openIncidentId, setOpenIncidentId] = useState<string | null>(null);
  const [newIncidentId, setNewIncidentId] = useState<string | null>(null);
  const [newStatementIds, setNewStatementIds] = useState<string[]>([]);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [visibleToasts, setVisibleToasts] = useState(0);
  // One microphone on the page: whoever is mid-take owns it, and every other
  // Record button greys out until they stop.
  const [recordingIn, setRecordingIn] = useState<'notes' | 'drawer' | null>(null);

  // One drawer at a time, plus the unsaved draft of every drawer that has
  // been opened — swapping the shell's contents never throws input away.
  const [drawer, setDrawer] = useState<Drawer | null>(null);
  const [focusPulse, setFocusPulse] = useState(0);
  /** Height of the sticky report header, so the margin column can sit under it. */
  const [headerHeight, setHeaderHeight] = useState(0);
  const [incidentDraft, setIncidentDraft] = useState<IncidentDraft>(EMPTY_INCIDENT_DRAFT);
  const [infoDrafts, setInfoDrafts] = useState<Record<string, InfoDraft>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const openStatement = sections.flatMap((section) => section.statements).find((s) => s.id === openStatementId) ?? null;
  const openIncident = incidents.find((i) => i.id === openIncidentId) ?? null;

  /** A section's current statements, one answer per question — the baseline a
      draft is measured against and what the drawer prefills with. */
  const infoBaselineFor = (section: StatementSection) =>
  (SECTION_QUESTIONS[section.id] ?? []).map(
    (q) => section.statements.find((s) => s.chips.includes(q.chip))?.text ?? ''
  );

  const drawerSection = drawer?.kind === 'info' ? sections.find((s) => s.id === drawer.sectionId) ?? null : null;
  const drawerNote = drawer?.kind === 'note' ? notes.find((n) => n.id === drawer.noteId) ?? null : null;

  // Sections holding an unsaved draft, for the "Draft" marker on their trigger.
  const draftSectionIds = sections.
  filter((section) => {
    const draft = infoDrafts[section.id];
    return Boolean(draft) && infoDraftIsDirty(draft, infoBaselineFor(section));
  }).
  map((section) => section.id);

  const reviewedCount = incidents.filter((incident) => incident.status !== 'pending').length;
  const allReviewed = reviewedCount === incidents.length;

  // One primary per screen: the side panel takes the slot as soon as its own
  // primary goes live — which for a drawer means it has something to commit.
  const drawerOwnsPrimary =
  drawer?.kind === 'incident' ?
  incidentDraftHasData(incidentDraft) :
  drawer?.kind === 'info' && drawerSection ?
  (infoDrafts[drawerSection.id] ?? emptyInfoDraft(infoBaselineFor(drawerSection))).answers.some((a) => a.trim()) :
  drawer?.kind === 'note' && drawerNote ?
  Boolean((noteDrafts[drawerNote.id] ?? drawerNote.text).trim()) :
  false;
  const panelOwnsPrimary = Boolean(openIncident) || drawerOwnsPrimary;
  const demotePagePrimaries = panelOwnsPrimary || visibleToasts > 0;

  /** Opening a drawer while another is up swaps the contents in place.
      Re-triggering the open one only re-focuses its first field. */
  const openDrawer = (next: Drawer) => {
    if (drawer && drawerKey(drawer) === drawerKey(next)) {
      setFocusPulse((n) => n + 1);
      return;
    }
    // The incident preview owns the same slot — never stack the two.
    setOpenIncidentId(null);
    // A drawer that has just swapped in is not re-focused, only re-triggered ones.
    setFocusPulse(0);
    setDrawer(next);
  };

  const closeDrawer = () => setDrawer(null);

  const clearIncidentDraft = () => setIncidentDraft(EMPTY_INCIDENT_DRAFT);

  const clearInfoDraft = (sectionId: string) =>
  setInfoDrafts((prev) => {
    const next = { ...prev };
    delete next[sectionId];
    return next;
  });

  const clearNoteDraft = (noteId: string) =>
  setNoteDrafts((prev) => {
    const next = { ...prev };
    delete next[noteId];
    return next;
  });

  const changeInfoDraft = (sectionId: string, baseline: string[]) => (
  updater: (draft: InfoDraft) => InfoDraft) =>
  {
    setInfoDrafts((prev) => ({
      ...prev,
      [sectionId]: updater(prev[sectionId] ?? emptyInfoDraft(baseline))
    }));
  };

  const openIncidentPreview = (id: string) => {
    // The preview and the drawers share the right-hand slot; drafts survive.
    setDrawer(null);
    setOpenIncidentId(id);
  };

  /** Fires a toast and keeps a count of the live ones, so the page can demote
      its own primary actions for as long as one is on screen. */
  const showToast = (message: string) => {
    setVisibleToasts((n) => n + 1);
    const done = () => setVisibleToasts((n) => Math.max(0, n - 1));
    toast.success(message, { duration: 5000, onAutoClose: done, onDismiss: done });
  };

  const openReview = (incidentId?: string) => {
    const pending = sortForQueue(incidents.filter((i) => i.status === 'pending'));
    setCurrentReviewId(incidentId ?? pending[0]?.id ?? incidents[0].id);
    setView('review');
  };

  const flashNew = (ids: string[]) => {
    setNewStatementIds(ids);
    window.setTimeout(() => setNewStatementIds([]), 2200);
  };

  const handleAddIncident = (draft: IncidentDraft) => {
    const id = `i-new-${Date.now()}`;
    onAddIncident({
      id,
      tier: draft.tier ?? 'T1',
      type: draft.type,
      date: 'Sun 21',
      time: draft.time,
      location: draft.location,
      status: 'confirmed',
      reportedBy: [],
      description: draft.summary,
      summary: draft.summary,
      evidence: draft.evidence,
      details: [
      { id: 'time', label: 'Time', values: [draft.time] },
      { id: 'location', label: 'Location', values: [draft.location] },
      { id: 'parties', label: 'Parties', values: draft.parties }],

      history: [systemEntry('You added this incident · voice')]
    });
    closeDrawer();
    clearIncidentDraft();
    setNewIncidentId(id);
    window.setTimeout(() => setNewIncidentId((v) => v === id ? null : v), 2200);
  };

  /** "Add my notes to the report": mocked AI splits the note into tagged
      statements per section, and any incident-shaped line becomes a real
      incident awaiting review instead of report text. Already-pushed
      phrases are skipped, so pushing several notes over the night never
      duplicates or overwrites. The input clears and the note is logged as
      its own entry so the manager can keep adding more. */
  const handlePushNotes = () => {
    const text = notesDraft.trim();
    if (!text) return;

    const { statements: parsed, incidents: parsedIncidents } = parseNotes(text, pushedKeys);
    setNotesPushed(true);

    const matches: NoteMatch[] = [];
    const newIds: string[] = [];

    if (parsed.length > 0) {
      setSections((prev) =>
      prev.map((section) => {
        const toAdd = parsed.filter((p) => p.sectionId === section.id);
        if (toAdd.length === 0) return section;
        const added: Statement[] = toAdd.map((p) => {
          const id = `s-note-${section.id}-${p.key}`;
          newIds.push(id);
          matches.push({ key: p.key, sectionId: section.id, statementId: id });
          return {
            id,
            chips: p.chips,
            text: p.text,
            source: { quote: p.quote, person: people.you, time: NOW, input: 'Note' }
          };
        });
        return { ...section, statements: [...section.statements, ...added] };
      })
      );
      flashNew(newIds);
    }

    const incidentIds: string[] = [];
    parsedIncidents.forEach((inc) => {
      const id = `i-note-${inc.key}`;
      incidentIds.push(id);
      onAddIncident({
        id,
        tier: inc.tier,
        type: inc.type,
        date: 'Sun 21',
        time: inc.time,
        location: inc.location,
        status: 'pending',
        reportedBy: [],
        description: inc.description,
        summary: inc.description,
        evidence: [],
        details: [
        { id: 'time', label: 'Time', values: [inc.time] },
        { id: 'location', label: 'Location', values: [inc.location] },
        { id: 'parties', label: 'Parties', values: ['Not yet identified'] }],

        history: [systemEntry('Added from your notes — awaiting review')]
      });
    });

    setPushedKeys((prev) => {
      const next = new Set(prev);
      parsed.forEach((p) => next.add(p.key));
      parsedIncidents.forEach((i) => next.add(i.key));
      return next;
    });

    setNotes((prev) => [
    {
      id: `note-${Date.now()}`,
      text,
      time: noteTimeForIndex(prev.length),
      statementIds: matches.map((m) => m.statementId),
      matches,
      incidentIds
    },
    ...prev]
    );
    setNotesDraft('');

    const titleById = Object.fromEntries(sections.map((s) => [s.id, s.title]));
    showToast(summarisePush(parsed, parsedIncidents, titleById));
  };

  /** Editing a note re-parses its new text: statements traced back to this
      note that the manager hasn't manually edited (or deleted) are updated
      or removed to match, statements for phrases no longer present are
      dropped, and newly-recognised phrases are added. Manually-touched
      statements, and incidents already created from this note, are left
      alone. */
  const handleSaveNoteEdit = (noteId: string, newText: string) => {
    const note = notes.find((n) => n.id === noteId);
    closeDrawer();
    clearNoteDraft(noteId);
    if (!note || newText === note.text) return;

    const previousKeys = new Set(note.matches.map((m) => m.key));
    const excludeKeys = new Set(pushedKeys);
    previousKeys.forEach((key) => excludeKeys.delete(key));

    const { statements: parsed, incidents: parsedIncidents } = parseNotes(newText, excludeKeys);
    const parsedByKey = new Map(parsed.map((p) => [p.key, p]));

    const newMatches: NoteMatch[] = [];
    const changedIds: string[] = [];

    setSections((prev) =>
    prev.map((section) => {
      let statements = section.statements;

      note.matches.
      filter((m) => m.sectionId === section.id).
      forEach((m) => {
        const index = statements.findIndex((s) => s.id === m.statementId);
        if (manuallyEditedIds.has(m.statementId)) {
          if (index !== -1) newMatches.push(m);
          return;
        }
        const stillPresent = parsedByKey.get(m.key);
        if (!stillPresent) {
          if (index !== -1) statements = statements.filter((_, i) => i !== index);
          return;
        }
        if (index !== -1 && statements[index].text !== stillPresent.text) {
          statements = statements.map((s, i) =>
          i === index ?
          { ...s, text: stillPresent.text, source: { ...s.source, quote: stillPresent.quote } } :
          s
          );
          changedIds.push(m.statementId);
        }
        if (index !== -1) newMatches.push(m);
      });

      parsed.
      filter((p) => p.sectionId === section.id && !previousKeys.has(p.key)).
      forEach((p) => {
        const id = `s-note-${section.id}-${p.key}`;
        statements = [
        ...statements,
        {
          id,
          chips: p.chips,
          text: p.text,
          source: { quote: p.quote, person: people.you, time: note.time, input: 'Note' }
        }];

        newMatches.push({ key: p.key, sectionId: section.id, statementId: id });
        changedIds.push(id);
      });

      return { ...section, statements };
    })
    );

    parsedIncidents.forEach((inc) => {
      onAddIncident({
        id: `i-note-${inc.key}`,
        tier: inc.tier,
        type: inc.type,
        date: 'Sun 21',
        time: inc.time,
        location: inc.location,
        status: 'pending',
        reportedBy: [],
        description: inc.description,
        summary: inc.description,
        evidence: [],
        details: [
        { id: 'time', label: 'Time', values: [inc.time] },
        { id: 'location', label: 'Location', values: [inc.location] },
        { id: 'parties', label: 'Parties', values: ['Not yet identified'] }],

        history: [systemEntry('Added from your notes — awaiting review')]
      });
    });

    setPushedKeys((prev) => {
      const next = new Set(prev);
      previousKeys.forEach((key) => next.delete(key));
      newMatches.forEach((m) => next.add(m.key));
      parsedIncidents.forEach((i) => next.add(i.key));
      return next;
    });

    setNotes((prev) =>
    prev.map((n) =>
    n.id === noteId ?
    {
      ...n,
      text: newText,
      statementIds: newMatches.map((m) => m.statementId),
      matches: newMatches,
      incidentIds: [...n.incidentIds, ...parsedIncidents.map((i) => `i-note-${i.key}`)]
    } :
    n
    )
    );

    if (changedIds.length > 0) flashNew(changedIds);
  };

  /** "+ Add information" drawer: syncs the drawer's rows onto the section —
      a row with new text becomes a new tagged statement (mocked AI — the
      answer stands as written), a row matching an existing statement (by
      chip) updates it in place instead of duplicating it, and a row the
      manager cleared removes its statement. */
  const handleAddInfo = (sectionId: string, rows: {chip: string;text: string;}[]) => {
    closeDrawer();
    clearInfoDraft(sectionId);
    const newIds: string[] = [];

    setSections((prev) =>
    prev.map((section) => {
      if (section.id !== sectionId) return section;
      let statements = section.statements;

      rows.forEach((row) => {
        const text = row.text.trim();
        const existingIndex = statements.findIndex((s) => s.chips.includes(row.chip));

        if (!text) {
          if (existingIndex !== -1) statements = statements.filter((_, i) => i !== existingIndex);
          return;
        }
        if (existingIndex !== -1) {
          if (statements[existingIndex].text !== text) {
            statements = statements.map((s, i) => i === existingIndex ? { ...s, text } : s);
          }
          return;
        }
        const id = `s-add-${sectionId}-${row.chip}-${Date.now()}`;
        newIds.push(id);
        statements = [
        ...statements,
        {
          id,
          chips: [row.chip],
          text,
          source: { quote: text, person: people.you, time: NOW, input: 'Typed' }
        }];

      });

      return { ...section, statements };
    })
    );

    if (newIds.length > 0) flashNew(newIds);
  };

  const updateStatement = (id: string, text: string) => {
    setSections((prev) =>
    prev.map((section) => ({
      ...section,
      statements: section.statements.map((s) => s.id === id ? { ...s, text } : s)
    }))
    );
    setManuallyEditedIds((prev) => new Set(prev).add(id));
  };

  /** The manager's answer to a statement's restock follow-up. Dismissed ones
      stay dismissed — later note pushes only ever append statements, so the
      same suggestion never comes back. */
  const setStatementRestock = (id: string, restockRequest: RestockRequest) => {
    setSections((prev) =>
    prev.map((section) => ({
      ...section,
      statements: section.statements.map((s) => s.id === id ? { ...s, restockRequest } : s)
    }))
    );
    setEditingRestockId((current) => current === id ? null : current);
  };

  const deleteStatement = (id: string) => {
    setSections((prev) =>
    prev.map((section) => ({
      ...section,
      statements: section.statements.filter((s) => s.id !== id)
    }))
    );
    setOpenStatementId((current) => current === id ? null : current);
    setManuallyEditedIds((prev) => new Set(prev).add(id));
  };

  /** The right-hand slot holds one thing at a time: the preview if an
      incident is open, otherwise whichever drawer is up. */
  const sidePanelKey = openIncident ?
  `preview-${openIncident.id}` :
  drawer ?
  drawerKey(drawer) :
  null;

  /** Mocked AI: a supplies line naming bottled stock gets a "restock this?"
      card in the margin, anchored to the line it read, until it's answered or
      dismissed. Dismissed ones stay dismissed — later note pushes only ever
      append statements, so the same suggestion never comes back. */
  const restockSuggestions = sections.flatMap((section) =>
  section.statements.
  map((statement) => ({ statement, items: suggestRestock(section.id, statement.text) })).
  filter(
    ({ statement, items }) =>
    items.length > 0 &&
    statement.restockRequest?.status !== 'dismissed' && (
    statement.restockRequest?.status !== 'added' || editingRestockId === statement.id)
  )
  );

  const marginItems: MarginRailItem[] = [];
  // The drawer slides over the margin, so its cards step aside while one is up.
  if (!openIncident && !drawer) {
    restockSuggestions.forEach(({ statement, items }) => {
      marginItems.push({
        id: `restock-${statement.id}`,
        anchorId: `statement-${statement.id}`,
        element:
        <RestockFollowUp
          key={items.join('|')}
          suggestedItems={items}
          request={statement.restockRequest}
          editing={editingRestockId === statement.id}
          onChange={(request) => setStatementRestock(statement.id, request)} />


      });
    });
  }
  if (!openIncident && !drawer && openStatement) {
    marginItems.push({
      id: `source-${openStatement.id}`,
      anchorId: `statement-${openStatement.id}`,
      element:
      <SourcePanel
        source={openStatement.source}
        addedSources={openStatement.addedSources}
        chips={openStatement.chips}
        onClose={() => setOpenStatementId(null)} />


    });
  }

  if (view === 'review' && currentReviewId) {
    return (
      <ReviewView
        incidents={incidents}
        currentId={currentReviewId}
        resolvedHelp={resolvedHelp}
        onSelect={setCurrentReviewId}
        onUpdate={onUpdateIncident}
        onResolveHelp={onResolveHelp}
        onBack={() => setView('report')}
        onFinish={() => {
          setView('report');
          showToast(`All ${incidents.length} incidents reviewed`);
        }} />);


  }

  return (
    <div className="relative flex h-full w-full flex-col-reverse overflow-hidden bg-base font-sans text-txt dt:flex-row">
      <NavRail />

      <main className="scroll-slim flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col wide:flex-row">
          <div className="w-full px-4 py-6 dt:px-10 dt:py-9 wide:min-w-0 wide:flex-1">
            <ReportHeader
              hasUnreviewed={!allReviewed}
              demoted={demotePagePrimaries}
              onHeightChange={setHeaderHeight} />


            <div className="mt-6 mb-7">
              <NotesCard
                draft={notesDraft}
                onChangeDraft={setNotesDraft}
                onAddToReport={handlePushNotes}
                notes={notes}
                activeNoteId={drawer?.kind === 'note' ? drawer.noteId : null}
                recordDisabled={recordingIn === 'drawer'}
                onRecordingChange={(recording) => setRecordingIn(recording ? 'notes' : null)}
                onEditNote={(noteId) => openDrawer({ kind: 'note', noteId })} />

            </div>

            {!allReviewed &&
            <div className="mb-6 wide:hidden dt:mb-7">
                <ReviewModule
                total={incidents.length}
                reviewedCount={reviewedCount}
                demoted={demotePagePrimaries}
                onStartReview={() => openReview()} />

              </div>
            }

            <ReportSections
              incidents={incidents}
              highlightIncidentId={newIncidentId}
              onAddIncident={() => openDrawer({ kind: 'incident' })}
              addIncidentActive={drawer?.kind === 'incident'}
              activeSectionId={drawer?.kind === 'info' ? drawer.sectionId : null}
              draftSectionIds={draftSectionIds}
              sections={sections}
              notesPushed={notesPushed}
              newStatementIds={newStatementIds}
              openStatementId={openStatementId}
              onOpenSource={(statement: Statement) => setOpenStatementId(statement.id)}
              onOpenIncident={(incident) => openIncidentPreview(incident.id)}
              onChangeStatement={updateStatement}
              onDeleteStatement={deleteStatement}
              restockSuggestionIds={restockSuggestions.map(({ statement }) => statement.id)}
              onChangeRestock={setStatementRestock}
              onEditRestock={setEditingRestockId}
              onAddInfo={(sectionId) => openDrawer({ kind: 'info', sectionId })} />

          </div>

          <div
            className="w-full shrink-0 px-4 pb-6 dt:px-10 wide:w-[340px] wide:px-0 wide:py-9"
            aria-label="Margin notes">

            {!allReviewed &&
            <div
              style={{ top: headerHeight }}
              className="hidden wide:sticky wide:z-10 wide:block wide:bg-base wide:pt-6 wide:pb-4">

                <ReviewModule
                total={incidents.length}
                reviewedCount={reviewedCount}
                demoted={demotePagePrimaries}
                onStartReview={() => openReview()} />

              </div>
            }
            <MarginRail items={marginItems} breakpoint={1024} />
          </div>
        </div>
      </main>

      {/* The preview and the drawers share one shell, so moving between them
          crossfades in place instead of sliding the panel out and back. */}
      <AnimatePresence>
        {sidePanelKey &&
        <DrawerShell
          key="side-panel"
          contentKey={sidePanelKey}
          ariaLabel={
          openIncident ?
          `${openIncident.type} preview` :
          drawer?.kind === 'incident' ?
          'New incident' :
          drawer?.kind === 'info' ?
          drawerSection?.title ?? 'Add information' :
          'Edit note'
          }>

            {openIncident &&
          <IncidentPreviewPanel
            incident={openIncident}
            onClose={() => setOpenIncidentId(null)}
            onEditInReview={(incident) => {
              setOpenIncidentId(null);
              openReview(incident.id);
            }} />

          }
            {!openIncident && drawer?.kind === 'incident' &&
          <AddIncidentPanel
            draft={incidentDraft}
            onChangeDraft={setIncidentDraft}
            focusPulse={focusPulse}
            recordDisabled={recordingIn === 'notes'}
            onRecordingChange={(recording) => setRecordingIn(recording ? 'drawer' : null)}
            onClose={() => {
              closeDrawer();
              clearIncidentDraft();
            }}
            onAdd={handleAddIncident} />

          }
            {!openIncident && drawer?.kind === 'info' && drawerSection && (() => {
            const baseline = infoBaselineFor(drawerSection);
            return (
              <AddInfoPanel
                sectionTitle={drawerSection.title}
                questions={SECTION_QUESTIONS[drawerSection.id] ?? []}
                baseline={baseline}
                draft={infoDrafts[drawerSection.id] ?? emptyInfoDraft(baseline)}
                onChangeDraft={changeInfoDraft(drawerSection.id, baseline)}
                focusPulse={focusPulse}
                hasExistingContent={drawerSection.statements.length > 0}
                recordDisabled={recordingIn === 'notes'}
                onRecordingChange={(recording) => setRecordingIn(recording ? 'drawer' : null)}
                onClose={() => {
                  closeDrawer();
                  clearInfoDraft(drawerSection.id);
                }}
                onAdd={(rows) => handleAddInfo(drawerSection.id, rows)} />);


          })()}
            {!openIncident && drawer?.kind === 'note' && drawerNote &&
          <EditNotePanel
            note={drawerNote}
            draft={noteDrafts[drawerNote.id] ?? drawerNote.text}
            onChangeDraft={(text) =>
            setNoteDrafts((prev) => ({ ...prev, [drawerNote.id]: text }))
            }
            focusPulse={focusPulse}
            onClose={() => {
              closeDrawer();
              clearNoteDraft(drawerNote.id);
            }}
            onSave={handleSaveNoteEdit} />

          }
          </DrawerShell>
        }
      </AnimatePresence>
    </div>);

}
