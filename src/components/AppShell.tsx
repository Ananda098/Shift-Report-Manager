import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import { AddedSource, ReviewIncident, Statement, StatementSection } from '../types/report';
import { statementSections } from '../data/statements';
import { people } from '../data/people';
import { categoryForText } from '../utils/categories';
import { sortForQueue, systemEntry } from '../utils/reviewActions';
import { NavRail } from './NavRail';
import { ReportHeader } from './ReportHeader';
import { ReviewModule } from './ReviewModule';
import { NotesTab } from './NotesTab';
import { SummaryTab } from './SummaryTab';
import { SourcePanel } from './SourcePanel';
import { MarginRail, MarginRailItem } from './MarginRail';
import { InlineAIHelp } from './InlineAIHelp';
import { RestockDetailsHelp } from './RestockDetailsHelp';
import { IncidentPreviewPanel } from './IncidentPreviewPanel';
import { AddIncidentPanel, NewIncidentDraft } from './AddIncidentPanel';
import { ReviewView } from './ReviewView';
import { Toast } from './Toast';

type Tab = 'notes' | 'summary';

type HelpStep = 'restock' | 'restock-details';

interface HelpCard {
  id: string;
  statementId: string;
  step: HelpStep;
}

interface AppShellProps {
  incidents: ReviewIncident[];
  onUpdateIncident: (id: string, updater: (incident: ReviewIncident) => ReviewIncident) => void;
  onAddIncident: (incident: ReviewIncident) => void;
  resolvedHelp: string[];
  onResolveHelp: (helpId: string) => void;
}

const tabs: {id: Tab;label: string;ai?: boolean;}[] = [
{ id: 'notes', label: 'Notes' },
{ id: 'summary', label: 'Summary', ai: true }];


const SUGGESTION_SOURCE: AddedSource = {
  label: 'Added via suggestion',
  by: 'you',
  time: '03:14'
};

const INITIAL_HELP: HelpCard[] = [
{ id: 'help-restock', statementId: 's-needs-1', step: 'restock' }];


/** Docs-style margin: at most two help cards are visible, the rest queue behind them. */
const MAX_VISIBLE_HELP = 2;

export function AppShell({
  incidents,
  onUpdateIncident,
  onAddIncident,
  resolvedHelp,
  onResolveHelp
}: AppShellProps) {
  const [view, setView] = useState<'report' | 'review'>('report');
  const [tab, setTab] = useState<Tab>('notes');
  const [notes, setNotes] = useState('');
  const [sections, setSections] = useState<StatementSection[]>(statementSections);
  const [openStatementId, setOpenStatementId] = useState<string | null>(null);
  const [openIncidentId, setOpenIncidentId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newIncidentId, setNewIncidentId] = useState<string | null>(null);
  const [newStatementId, setNewStatementId] = useState<string | null>(null);
  const [helpCards, setHelpCards] = useState<HelpCard[]>(INITIAL_HELP);
  const [highlight, setHighlight] = useState<{id: string;from: number;} | null>(null);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [panelOwnsPrimary, setPanelOwnsPrimary] = useState(false);

  const allStatements = sections.flatMap((section) => section.statements);
  const openStatement = allStatements.find((s) => s.id === openStatementId) ?? null;
  const openIncident = incidents.find((i) => i.id === openIncidentId) ?? null;
  const visibleHelp = helpCards.slice(0, MAX_VISIBLE_HELP);
  const reviewedCount = incidents.filter((incident) => incident.status !== 'pending').length;
  const allReviewed = reviewedCount === incidents.length;
  // One primary per screen: anything layered on top takes the primary slot.
  const demotePagePrimaries = panelOwnsPrimary || toast !== null;

  const openReview = (incidentId?: string) => {
    const pending = sortForQueue(incidents.filter((i) => i.status === 'pending'));
    setCurrentReviewId(incidentId ?? pending[0]?.id ?? incidents[0].id);
    setView('review');
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
    setTab('summary');
    setNewIncidentId(id);
    window.setTimeout(() => setNewIncidentId((v) => v === id ? null : v), 2200);
  };

  const addStatement = (sectionId: string, text: string) => {
    const statement: Statement = {
      id: `s-new-${Date.now()}`,
      chips: [categoryForText(text)],
      text,
      source: { quote: text, person: people.you, time: '03:14', input: 'Typed' }
    };
    setSections((prev) =>
    prev.map((section) =>
    section.id === sectionId ?
    { ...section, statements: [...section.statements, statement] } :
    section
    )
    );
    setNewStatementId(statement.id);
    window.setTimeout(() => {
      setNewStatementId((v) => v === statement.id ? null : v);
    }, 2200);
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
    setHelpCards((prev) => prev.filter((card) => card.statementId !== id));
  };

  const appendToStatement = (id: string, suffix: string) => {
    const current = allStatements.find((s) => s.id === id);
    if (!current) return;
    const from = current.text.length;
    setSections((prev) =>
    prev.map((section) => ({
      ...section,
      statements: section.statements.map((s) =>
      s.id === id ?
      {
        ...s,
        text: `${s.text}${suffix}`,
        addedSources: s.addedSources?.length ? s.addedSources : [SUGGESTION_SOURCE]
      } :
      s
      )
    }))
    );
    setHighlight({ id, from });
    window.setTimeout(() => {
      setHighlight((h) => h && h.id === id && h.from === from ? null : h);
    }, 2200);
  };

  const removeHelp = (cardId: string) => {
    setHelpCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const replaceHelp = (cardId: string, next: HelpCard) => {
    setHelpCards((prev) => prev.map((card) => card.id === cardId ? next : card));
  };

  const renderHelp = (card: HelpCard) => {
    const anchorId = `statement-${card.statementId}`;
    if (card.step === 'restock') {
      return (
        <InlineAIHelp
          anchorId={anchorId}
          type="optional"
          question="Do you need to request a restock?"
          options={[
          {
            label: 'Yes, request restock',
            onSelect: () => {
              appendToStatement(card.statementId, ' Restock requested.');
              replaceHelp(card.id, {
                id: `${card.id}-details`,
                statementId: card.statementId,
                step: 'restock-details'
              });
            }
          },
          { label: 'No', onSelect: () => removeHelp(card.id) }]
          }
          onDismiss={() => removeHelp(card.id)} />);


    }
    return (
      <RestockDetailsHelp
        anchorId={anchorId}
        onAdd={(detail) => {
          appendToStatement(card.statementId, detail);
          removeHelp(card.id);
        }}
        onDismiss={() => removeHelp(card.id)} />);


  };

  const marginItems: MarginRailItem[] = [];
  if (tab === 'summary' && !openIncident && !addOpen) {
    visibleHelp.forEach((card) => {
      marginItems.push({
        id: card.id,
        anchorId: `statement-${card.statementId}`,
        element: renderHelp(card)
      });
    });
    if (openStatement) {
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
          setTab('summary');
          setToast(`All ${incidents.length} incidents reviewed`);
        }} />);


  }

  return (
    <div className="relative flex h-full w-full flex-col-reverse overflow-hidden bg-base font-sans text-txt sm:flex-row">
      <NavRail />

      <main className="scroll-slim flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col xl:flex-row">
          <div className="w-full shrink-0 px-10 py-9 xl:w-[760px]">
            <ReportHeader hasUnreviewed={!allReviewed} demoted={demotePagePrimaries} />

            {!allReviewed &&
            <ReviewModule
              total={incidents.length}
              reviewedCount={reviewedCount}
              demoted={demotePagePrimaries}
              onStartReview={() => openReview()} />

            }

            <div
              role="tablist"
              aria-label="Report sections"
              className="flex items-center gap-6 border-b border-line">
              
              {tabs.map(({ id, label, ai }) =>
              <button
                key={id}
                role="tab"
                id={`tab-${id}`}
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                type="button"
                onClick={() => setTab(id)}
                className={[
                '-mb-px inline-flex items-center gap-1.5 border-b-2 px-0.5 pb-3 pt-1 text-body outline-none transition-colors duration-150 ease-out',
                'focus-visible:ring-2 focus-visible:ring-teal',
                tab === id ?
                'border-teal font-medium text-txt' :
                'border-transparent text-muted hover:text-txt'].
                join(' ')}>
                
                  {ai && <SparklesIcon size={14} strokeWidth={2} className="text-teal" />}
                  {label}
                </button>
              )}
            </div>

            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-6">
              {tab === 'notes' ?
              <NotesTab value={notes} onChange={setNotes} /> :

              <SummaryTab
                hasNotes={notes.trim().length > 0}
                incidents={incidents}
                highlightIncidentId={newIncidentId}
                onGoToReview={() => openReview()}
                onAddIncident={() => setAddOpen(true)}
                sections={sections}
                openStatementId={openStatementId}
                commentedStatementIds={visibleHelp.map((card) => card.statementId)}
                highlight={highlight}
                newStatementId={newStatementId}
                onOpenSource={(statement: Statement) => setOpenStatementId(statement.id)}
                onOpenIncident={(incident) => setOpenIncidentId(incident.id)}
                onChangeStatement={updateStatement}
                onDeleteStatement={deleteStatement}
                onAddStatement={addStatement} />

              }
            </div>
          </div>

          <div
            className="w-full shrink-0 px-10 pb-9 xl:w-[340px] xl:px-0 xl:py-9"
            aria-label="Margin notes">

            <MarginRail items={marginItems} />
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
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast key="review-toast" message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>);

}