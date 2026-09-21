import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NoteEntry, NoteMatch, ReviewIncident, Statement, StatementSection } from '../types/report';
import { statementSections } from '../data/statements';
import { people } from '../data/people';
import { sortForQueue, systemEntry } from '../utils/reviewActions';
import { noteTimeForIndex } from '../utils/time';
import {
  ParsedIncident,
  ParsedStatement,
  parseNotes,
  SECTION_QUESTIONS } from
'../utils/mockAi';
import { NavRail } from './NavRail';
import { ReportHeader } from './ReportHeader';
import { ReviewModule } from './ReviewModule';
import { NotesCard } from './NotesCard';
import { EditNotePanel } from './EditNotePanel';
import { ReportSections } from './ReportSections';
import { SourcePanel } from './SourcePanel';
import { MarginRail, MarginRailItem } from './MarginRail';
import { IncidentPreviewPanel } from './IncidentPreviewPanel';
import { AddIncidentPanel, NewIncidentDraft } from './AddIncidentPanel';
import { AddInfoPanel } from './AddInfoPanel';
import { ReviewView } from './ReviewView';
import { Toast } from './Toast';

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
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [sections, setSections] = useState<StatementSection[]>(
    statementSections.map((section) => ({ ...section, statements: [] }))
  );
  const [openStatementId, setOpenStatementId] = useState<string | null>(null);
  const [openIncidentId, setOpenIncidentId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addInfoSectionId, setAddInfoSectionId] = useState<string | null>(null);
  const [newIncidentId, setNewIncidentId] = useState<string | null>(null);
  const [newStatementIds, setNewStatementIds] = useState<string[]>([]);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [panelOwnsPrimary, setPanelOwnsPrimary] = useState(false);

  const openStatement = sections.flatMap((section) => section.statements).find((s) => s.id === openStatementId) ?? null;
  const openIncident = incidents.find((i) => i.id === openIncidentId) ?? null;
  const addInfoSection = sections.find((s) => s.id === addInfoSectionId) ?? null;
  const addInfoQuestions = addInfoSection ? SECTION_QUESTIONS[addInfoSection.id] ?? [] : [];
  const addInfoInitialAnswers = addInfoQuestions.map(
    (q) => addInfoSection?.statements.find((s) => s.chips.includes(q.chip))?.text ?? ''
  );
  const editingNote = notes.find((n) => n.id === editingNoteId) ?? null;
  const reviewedCount = incidents.filter((incident) => incident.status !== 'pending').length;
  const allReviewed = reviewedCount === incidents.length;
  // One primary per screen: anything layered on top takes the primary slot.
  const demotePagePrimaries = panelOwnsPrimary || toast !== null;

  const openReview = (incidentId?: string) => {
    const pending = sortForQueue(incidents.filter((i) => i.status === 'pending'));
    setCurrentReviewId(incidentId ?? pending[0]?.id ?? incidents[0].id);
    setView('review');
  };

  const flashNew = (ids: string[]) => {
    setNewStatementIds(ids);
    window.setTimeout(() => setNewStatementIds([]), 2200);
  };

  const handleAddIncident = (draft: NewIncidentDraft) => {
    const id = `i-new-${Date.now()}`;
    onAddIncident({
      id,
      tier: draft.tier,
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
    setAddOpen(false);
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
    setToast(summarisePush(parsed, parsedIncidents, titleById));
  };

  /** Editing a note re-parses its new text: statements traced back to this
      note that the manager hasn't manually edited (or deleted) are updated
      or removed to match, statements for phrases no longer present are
      dropped, and newly-recognised phrases are added. Manually-touched
      statements, and incidents already created from this note, are left
      alone. */
  const handleSaveNoteEdit = (noteId: string, newText: string) => {
    const note = notes.find((n) => n.id === noteId);
    setEditingNoteId(null);
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
    setAddInfoSectionId(null);
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

  const marginItems: MarginRailItem[] = [];
  if (!openIncident && !addOpen && !addInfoSection && openStatement) {
    marginItems.push({
      id: `source-${openStatement.id}`,
      anchorId: `statement-${openStatement.id}`,
      element:
      <SourcePanel
        source={openStatement.source}
        addedSources={openStatement.addedSources}
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
          setToast(`All ${incidents.length} incidents reviewed`);
        }} />);


  }

  return (
    <div className="relative flex h-full w-full flex-col-reverse overflow-hidden bg-base font-sans text-txt dt:flex-row">
      <NavRail />

      <main className="scroll-slim flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col dt:flex-row">
          <div className="w-full shrink-0 px-10 py-9 dt:w-[760px]">
            <ReportHeader hasUnreviewed={!allReviewed} demoted={demotePagePrimaries} />

            <div className="mt-6 mb-7">
              <NotesCard
                draft={notesDraft}
                onChangeDraft={setNotesDraft}
                onAddToReport={handlePushNotes}
                notes={notes}
                onEditNote={setEditingNoteId} />

            </div>

            {!allReviewed &&
            <div className="dt:hidden">
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
              onGoToReview={() => openReview()}
              onAddIncident={() => setAddOpen(true)}
              sections={sections}
              notesPushed={notesPushed}
              newStatementIds={newStatementIds}
              openStatementId={openStatementId}
              onOpenSource={(statement: Statement) => setOpenStatementId(statement.id)}
              onOpenIncident={(incident) => setOpenIncidentId(incident.id)}
              onChangeStatement={updateStatement}
              onDeleteStatement={deleteStatement}
              onAddInfo={setAddInfoSectionId} />

          </div>

          <div
            className="w-full shrink-0 px-10 pb-9 dt:w-[340px] dt:px-0 dt:py-9"
            aria-label="Margin notes">

            {!allReviewed &&
            <div className="hidden dt:block">
                <ReviewModule
                total={incidents.length}
                reviewedCount={reviewedCount}
                demoted={demotePagePrimaries}
                onStartReview={() => openReview()} />

              </div>
            }
            <MarginRail items={marginItems} breakpoint={680} />
          </div>
        </div>
      </main>

      <AnimatePresence>
        {openIncident &&
        <IncidentPreviewPanel
          key={openIncident.id}
          incident={openIncident}
          onClose={() => setOpenIncidentId(null)}
          onEditInReview={(incident) => {
            setOpenIncidentId(null);
            openReview(incident.id);
          }} />

        }
        {addOpen &&
        <AddIncidentPanel
          key="add-incident"
          onClose={() => {
            setAddOpen(false);
            setPanelOwnsPrimary(false);
          }}
          onAdd={handleAddIncident}
          onPrimaryChange={setPanelOwnsPrimary} />

        }
        {addInfoSection &&
        <AddInfoPanel
          key={`add-info-${addInfoSection.id}`}
          sectionTitle={addInfoSection.title}
          questions={addInfoQuestions}
          initialAnswers={addInfoInitialAnswers}
          hasExistingContent={addInfoSection.statements.length > 0}
          onClose={() => setAddInfoSectionId(null)}
          onAdd={(rows) => handleAddInfo(addInfoSection.id, rows)} />

        }
        {editingNote &&
        <EditNotePanel
          key={`edit-note-${editingNote.id}`}
          note={editingNote}
          onClose={() => setEditingNoteId(null)}
          onSave={handleSaveNoteEdit} />

        }
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast key="report-toast" message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>);

}
