import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ReviewIncident, Statement, StatementSection } from '../types/report';
import { statementSections } from '../data/statements';
import { people } from '../data/people';
import { sortForQueue, systemEntry } from '../utils/reviewActions';
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
  const [notes, setNotes] = useState('');
  const [notesPushed, setNotesPushed] = useState(false);
  const [notesCollapsed, setNotesCollapsed] = useState(false);
  const [pushedKeys, setPushedKeys] = useState<Set<string>>(new Set());
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

  const allStatements = sections.flatMap((section) => section.statements);
  const openStatement = allStatements.find((s) => s.id === openStatementId) ?? null;
  const openIncident = incidents.find((i) => i.id === openIncidentId) ?? null;
  const addInfoSection = sections.find((s) => s.id === addInfoSectionId) ?? null;
  const addInfoQuestions = addInfoSection ? SECTION_QUESTIONS[addInfoSection.id] ?? [] : [];
  const addInfoInitialAnswers = addInfoQuestions.map(
    (q) => addInfoSection?.statements.find((s) => s.chips.includes(q.chip))?.text ?? ''
  );
  const reviewedCount = incidents.filter((incident) => incident.status !== 'pending').length;
  const allReviewed = reviewedCount === incidents.length;
  const notesStatementCount = allStatements.filter((s) => s.source.input === 'Note').length;
  const notesIncidentCount = incidents.filter((i) => i.id.startsWith('i-note-')).length;
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

  /** "Add my notes to the report": mocked AI splits new notes into tagged
      statements per section, and any incident-shaped line becomes a real
      incident awaiting review instead of report text. Already-pushed
      phrases are skipped, so re-pushing never duplicates or overwrites —
      and the card settles into its compact summary either way. */
  const handlePushNotes = () => {
    const { statements: parsed, incidents: parsedIncidents } = parseNotes(notes, pushedKeys);
    setNotesPushed(true);
    setNotesCollapsed(true);

    if (parsed.length > 0) {
      const newIds: string[] = [];
      setSections((prev) =>
      prev.map((section) => {
        const toAdd = parsed.filter((p) => p.sectionId === section.id);
        if (toAdd.length === 0) return section;
        const added: Statement[] = toAdd.map((p) => {
          const id = `s-note-${section.id}-${p.key}`;
          newIds.push(id);
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
      parsed.forEach((p) => next.add(p.key));
      parsedIncidents.forEach((i) => next.add(i.key));
      return next;
    });

    const titleById = Object.fromEntries(sections.map((s) => [s.id, s.title]));
    setToast(summarisePush(parsed, parsedIncidents, titleById));
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
  };

  const deleteStatement = (id: string) => {
    setSections((prev) =>
    prev.map((section) => ({
      ...section,
      statements: section.statements.filter((s) => s.id !== id)
    }))
    );
    setOpenStatementId((current) => current === id ? null : current);
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
                value={notes}
                onChange={setNotes}
                onAddToReport={handlePushNotes}
                collapsed={notesCollapsed}
                onExpand={() => setNotesCollapsed(false)}
                statementCount={notesStatementCount}
                incidentCount={notesIncidentCount} />

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
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast key="report-toast" message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>);

}
