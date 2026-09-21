import React from 'react';
import {
  PlusIcon,
  ShieldAlertIcon,
  UsersIcon,
  TriangleAlertIcon,
  UserCheckIcon,
  PackageIcon } from
'lucide-react';
import { ReviewIncident, Statement, StatementSection } from '../types/report';
import { nightOrder } from '../utils/time';
import { IncidentRow, INCIDENT_GRID } from './IncidentRow';
import { StatementRow } from './StatementRow';
import { EmptySection } from './EmptySection';

interface ReportSectionsProps {
  incidents: ReviewIncident[];
  highlightIncidentId: string | null;
  onGoToReview: () => void;
  onAddIncident: () => void;
  sections: StatementSection[];
  /** Whether notes have ever been pushed — flips an empty section from blank to "Not mentioned tonight". */
  notesPushed: boolean;
  newStatementIds: string[];
  openStatementId: string | null;
  onOpenSource: (statement: Statement) => void;
  onOpenIncident: (incident: ReviewIncident) => void;
  onChangeStatement: (id: string, text: string) => void;
  onDeleteStatement: (id: string) => void;
  onAddInfo: (sectionId: string) => void;
}

type IconType = typeof ShieldAlertIcon;

const SECTION_ICONS: Record<string, IconType> = {
  crowd: UsersIcon,
  concerning: TriangleAlertIcon,
  crew: UserCheckIcon,
  needs: PackageIcon
};

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

function AddInfoAction({ label, onClick }: {label: string;onClick: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:bg-raised hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

      <PlusIcon size={14} strokeWidth={2} />
      {label}
    </button>);

}

export function ReportSections({
  incidents,
  highlightIncidentId,
  onGoToReview,
  onAddIncident,
  sections,
  notesPushed,
  newStatementIds,
  openStatementId,
  onOpenSource,
  onOpenIncident,
  onChangeStatement,
  onDeleteStatement,
  onAddInfo
}: ReportSectionsProps) {
  const chronological = [...incidents].sort((a, b) => nightOrder(a.time) - nightOrder(b.time));
  const reviewed = chronological.filter((incident) => incident.status !== 'pending');
  const pendingCount = incidents.length - reviewed.length;

  return (
    <div className="space-y-4">
      <SectionCard
        icon={ShieldAlertIcon}
        title="Incidents"
        action={<AddInfoAction label="Add incident" onClick={onAddIncident} />}>

        {reviewed.length > 0 &&
        <>
            <div
            className={`-mx-2 grid ${INCIDENT_GRID} gap-3.5 border-b border-line px-3 pb-2 text-label uppercase tracking-wide text-faint`}>

              <span>Tier</span>
              <span>Incident</span>
              <span className="text-right">Time</span>
              <span>Status</span>
            </div>
            <ul className="-mx-2 mt-1">
              {reviewed.map((incident) =>
            <IncidentRow
              key={incident.id}
              incident={incident}
              highlight={highlightIncidentId === incident.id}
              onOpen={onOpenIncident} />

            )}
            </ul>
          </>
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

      {sections.map((section) => {
        const isEmpty = section.statements.length === 0;
        return (
          <SectionCard
            key={section.id}
            icon={SECTION_ICONS[section.id] ?? UsersIcon}
            title={section.title}
            quiet={isEmpty}
            action={
            <AddInfoAction label="Add information" onClick={() => onAddInfo(section.id)} />
            }>

            {isEmpty ?
            notesPushed && <EmptySection text="Not mentioned tonight" /> :

            <ul className="-mx-2 space-y-1">
                {section.statements.map((statement) =>
              <StatementRow
                key={statement.id}
                statement={statement}
                active={openStatementId === statement.id}
                chipHighlight={newStatementIds.includes(statement.id)}
                onOpenSource={onOpenSource}
                onChangeText={onChangeStatement}
                onDelete={onDeleteStatement} />

              )}
              </ul>
            }
          </SectionCard>);

      })}
    </div>);

}
