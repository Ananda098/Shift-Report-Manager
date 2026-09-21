import React from 'react';
import {
  PlusIcon,
  FileTextIcon,
  ShieldAlertIcon,
  UsersIcon,
  TriangleAlertIcon,
  UserCheckIcon,
  PackageIcon } from
'lucide-react';
import { ReviewIncident, Statement, StatementSection } from '../types/report';
import { nightOrder } from '../utils/time';
import { dayOverview } from '../data/statements';
import { IncidentRow } from './IncidentRow';
import { StatementRow } from './StatementRow';
import { StatementComposer } from './StatementComposer';
import { EmptySection } from './EmptySection';

interface SummaryTabProps {
  hasNotes: boolean;
  incidents: ReviewIncident[];
  highlightIncidentId: string | null;
  onGoToReview: () => void;
  onAddIncident: () => void;
  sections: StatementSection[];
  openStatementId: string | null;
  commentedStatementIds: string[];
  highlight: {id: string;from: number;} | null;
  newStatementId: string | null;
  onOpenSource: (statement: Statement) => void;
  onOpenIncident: (incident: ReviewIncident) => void;
  onChangeStatement: (id: string, text: string) => void;
  onDeleteStatement: (id: string) => void;
  onAddStatement: (sectionId: string, text: string) => void;
}

type IconType = typeof FileTextIcon;

function SectionCard({
  icon: Icon,
  title,
  action,
  quiet = false,
  children






}: {icon: IconType;title: string;action?: React.ReactNode;quiet?: boolean;children: React.ReactNode;}) {
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={[
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-raised transition-colors duration-150 ease-out',
            quiet ? 'text-faint' : 'text-muted'].
            join(' ')}>
            
            <Icon size={15} strokeWidth={1.75} />
          </span>
          <h2
            className={[
            'text-section font-semibold transition-colors duration-150 ease-out',
            quiet ? 'text-muted' : 'text-txt'].
            join(' ')}>
            
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>);

}

export function SummaryTab({
  hasNotes,
  incidents,
  highlightIncidentId,
  onGoToReview,
  onAddIncident,
  sections,
  openStatementId,
  commentedStatementIds,
  highlight,
  newStatementId,
  onOpenSource,
  onOpenIncident,
  onChangeStatement,
  onDeleteStatement,
  onAddStatement
}: SummaryTabProps) {
  const chronological = [...incidents].sort((a, b) => nightOrder(a.time) - nightOrder(b.time));
  const reviewed = chronological.filter((incident) => incident.status !== 'pending');
  const pendingCount = incidents.length - reviewed.length;
  const crew = sections.find((s) => s.id === 'crew');

  const statementList = (section: StatementSection) =>
  <ul className="-mx-2 space-y-1">
      {section.statements.map((statement) =>
    <StatementRow
      key={statement.id}
      statement={statement}
      active={openStatementId === statement.id}
      commented={commentedStatementIds.includes(statement.id)}
      highlightFrom={highlight?.id === statement.id ? highlight.from : null}
      chipHighlight={newStatementId === statement.id}
      onOpenSource={onOpenSource}
      onChangeText={onChangeStatement}
      onDelete={onDeleteStatement} />

    )}
    </ul>;


  const renderStatements = (id: string, title: string, icon: IconType) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return null;
    return (
      <SectionCard icon={icon} title={title}>
        {statementList(section)}
      </SectionCard>);

  };

  return (
    <div className="space-y-4">
      <SectionCard icon={FileTextIcon} title="Day overview" quiet={!hasNotes}>
        {hasNotes ?
        <p className="text-body text-txt">{dayOverview}</p> :

        <EmptySection text="Written automatically from your notes" />
        }
      </SectionCard>

      <SectionCard
        icon={ShieldAlertIcon}
        title="Incidents"
        action={
        <button
          type="button"
          onClick={onAddIncident}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:bg-raised hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">
          
            <PlusIcon size={14} strokeWidth={2} />
            Add incident
          </button>
        }>
        
        {reviewed.length > 0 &&
        <ul className="-mx-2">
            {reviewed.map((incident) =>
          <IncidentRow
            key={incident.id}
            incident={incident}
            highlight={highlightIncidentId === incident.id}
            onOpen={onOpenIncident} />

          )}
          </ul>
        }

        {pendingCount > 0 &&
        <div
          className={[
          'flex items-center gap-2',
          reviewed.length > 0 ? 'mt-3 border-t border-line pt-3' : ''].
          join(' ')}>
          
            <p className="text-body text-muted">{pendingCount} awaiting review</p>
            <span className="text-body text-faint">·</span>
            <button
            type="button"
            onClick={onGoToReview}
            className="rounded-md text-body text-teal underline-offset-4 outline-none transition-colors duration-150 ease-out hover:text-teal-hi hover:underline focus-visible:ring-2 focus-visible:ring-teal">
            
              Continue review
            </button>
          </div>
        }
      </SectionCard>

      {renderStatements('crowd', 'Crowd tonight', UsersIcon)}
      {renderStatements('concerning', 'Anything concerning?', TriangleAlertIcon)}

      {crew &&
      <SectionCard
        icon={UserCheckIcon}
        title="Crew performance"
        quiet={crew.statements.length === 0}>
        
          {crew.statements.length > 0 ?
        statementList(crew) :

        <StatementComposer
          placeholder="Not mentioned tonight"
          ariaLabel="Add a note about the crew"
          onSubmit={(text) => onAddStatement('crew', text)} />

        }
        </SectionCard>
      }

      {renderStatements('needs', 'Anything we need?', PackageIcon)}
    </div>);

}