import React from 'react';
import {
  PlusIcon,
  ShieldAlertIcon,
  UsersIcon,
  TriangleAlertIcon,
  UserCheckIcon,
  WrenchIcon } from
'lucide-react';
import { RestockRequest, ReviewIncident, Statement, StatementSection } from '../types/report';
import { nightOrder } from '../utils/time';
import { IncidentRow, INCIDENT_GRID } from './IncidentRow';
import { StatementRow } from './StatementRow';
import { EmptySection } from './EmptySection';
import { RestockRequestLine } from './RestockRequestLine';

interface ReportSectionsProps {
  incidents: ReviewIncident[];
  highlightIncidentId: string | null;
  onAddIncident: () => void;
  /** The side drawer is currently showing "New incident". */
  addIncidentActive: boolean;
  /** The section whose "Add information" drawer is showing, if any. */
  activeSectionId: string | null;
  /** Sections holding an unsaved drawer draft. */
  draftSectionIds: string[];
  sections: StatementSection[];
  /** Whether notes have ever been pushed — flips an empty section from blank to "Not mentioned tonight". */
  notesPushed: boolean;
  /** Statements just written by a note push — their text flashes teal. */
  newStatementIds: string[];
  openStatementId: string | null;
  onOpenSource: (statement: Statement) => void;
  onOpenIncident: (incident: ReviewIncident) => void;
  onChangeStatement: (id: string, text: string) => void;
  onDeleteStatement: (id: string) => void;
  /** Statements with a restock suggestion card open in the margin — their text
      is marked like a commented range. */
  restockSuggestionIds: string[];
  /** The manager answered (or removed) a statement's restock follow-up. */
  onChangeRestock: (statementId: string, request: RestockRequest) => void;
  /** Reopen an answered restock request in the margin card. */
  onEditRestock: (statementId: string) => void;
  onAddInfo: (sectionId: string) => void;
}

type IconType = typeof ShieldAlertIcon;

const SECTION_ICONS: Record<string, IconType> = {
  crowd: UsersIcon,
  safety: TriangleAlertIcon,
  staff: UserCheckIcon,
  supplies: WrenchIcon
};

/** One section of the report. `framed` is spent once, on Incidents: it is the
    night's payload and the only section holding a table, so it keeps the card
    while the four written sections read as blocks of one document, separated
    by a hairline and aligned to the card's own text inset. */
function SectionCard({
  icon: Icon,
  title,
  action,
  quiet = false,
  framed = false,
  children





}: {icon: IconType;title: string;action?: React.ReactNode;quiet?: boolean;framed?: boolean;children: React.ReactNode;}) {
  return (
    <section
      className={[
      'group/section',
      framed ?
      'rounded-xl border border-line bg-card p-4 dt:p-5' :
      'px-4 py-5 dt:px-5 dt:py-6'].
      join(' ')}>

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
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

/** A section's action carries no chrome at all: one word, faint until the
    section is pointed at, lifting to `txt` under the cursor and to teal while
    its drawer is open. The heading beside it already names the subject, so
    the word only has to name the verb. Touch has no hover, so below `dt` —
    and whenever it is holding a draft or is open — it simply stays visible,
    the same rule `StatementRow`'s magnifier follows. */
function AddInfoAction({
  label,
  onClick,
  editing = false,
  active = false,
  hasDraft = false







}: {label: string;onClick: () => void;editing?: boolean;active?: boolean;hasDraft?: boolean;}) {
  const pinned = active || hasDraft;
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={hasDraft ? `${label} — unsaved draft` : label}
      aria-current={active ? 'true' : undefined}
      className={[
      'inline-flex shrink-0 items-center gap-1.5 rounded-md px-1 py-2 text-meta outline-none dt:py-1',
      'transition-[color,opacity] duration-150 ease-out',
      'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-teal',
      active ? 'text-teal' : 'text-faint hover:text-txt',
      pinned ? '' : 'dt:opacity-0 dt:group-hover/section:opacity-100'].
      join(' ')}>

      {/* An unsaved draft is state on the action itself, not a word floating
          beside it. */}
      {hasDraft && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-teal" />}
      {editing ? 'Edit' : 'Add'}
    </button>);

}

/** Incidents keeps a labelled action: it names a thing to file, not a section
    to edit, and it is the one action on the page worth reading. Pointing at it
    is not a state — hover only lifts it onto a raised fill, while the drawer
    being open takes teal, the one colour no hover borrows. The border is
    transparent rather than absent at rest, so nothing resizes between them. */
function AddIncidentAction({
  onClick,
  active = false



}: {onClick: () => void;active?: boolean;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={[
      'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-2 py-2 text-meta outline-none dt:py-1',
      'transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-teal',
      active ?
      'border-teal/45 bg-teal-fill text-teal' :
      'border-transparent text-faint hover:bg-raised hover:text-txt'].
      join(' ')}>

      <PlusIcon size={14} strokeWidth={2} />
      Add incident
    </button>);

}

export function ReportSections({
  incidents,
  highlightIncidentId,
  onAddIncident,
  addIncidentActive,
  activeSectionId,
  draftSectionIds,
  sections,
  notesPushed,
  newStatementIds,
  openStatementId,
  onOpenSource,
  onOpenIncident,
  onChangeStatement,
  onDeleteStatement,
  restockSuggestionIds,
  onChangeRestock,
  onEditRestock,
  onAddInfo
}: ReportSectionsProps) {
  const chronological = [...incidents].sort((a, b) => nightOrder(a.time) - nightOrder(b.time));
  const reviewed = chronological.filter((incident) => incident.status !== 'pending');

  return (
    <div className="space-y-4">
      <SectionCard
        icon={ShieldAlertIcon}
        title="Incidents"
        framed
        action={<AddIncidentAction onClick={onAddIncident} active={addIncidentActive} />}>

        {reviewed.length === 0 ?
        <EmptySection text="Nothing reviewed yet" /> :

        <>
            <div
            className={`-mx-2 hidden ${INCIDENT_GRID} border-b border-line px-3 pb-2 text-label uppercase tracking-wide text-faint`}>

              <span>Tier</span>
              <span>Incident</span>
              <span className="text-right">Time</span>
              <span className="text-right">Status</span>
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
      </SectionCard>

      {/* The written sections run together as one document: a hairline between
          them instead of five frames down the page. */}
      <div className="divide-y divide-line">
        {sections.map((section) => {
        const isEmpty = section.statements.length === 0;
        return (
          <SectionCard
            key={section.id}
            icon={SECTION_ICONS[section.id] ?? UsersIcon}
            title={section.title}
            quiet={isEmpty}
            action={
            <AddInfoAction
              label={isEmpty ? `Add to ${section.title}` : `Edit ${section.title}`}
              editing={!isEmpty}
              active={activeSectionId === section.id}
              hasDraft={draftSectionIds.includes(section.id)}
              onClick={() => onAddInfo(section.id)} />

            }>

            {isEmpty ?
            notesPushed && <EmptySection text="Not mentioned tonight" /> :

            <ul className="-mx-2 space-y-0.5">
                {section.statements.map((statement) => {
                // The mocked AI asks about restocking in the margin; what
                // lands in the report is the request the manager confirmed.
                const request = statement.restockRequest;
                return (
                  <React.Fragment key={statement.id}>
                      <StatementRow
                      statement={statement}
                      active={openStatementId === statement.id}
                      commented={restockSuggestionIds.includes(statement.id)}
                      highlightFrom={newStatementIds.includes(statement.id) ? 0 : null}
                      onOpenSource={onOpenSource}
                      onChangeText={onChangeStatement}
                      onDelete={onDeleteStatement} />

                      {request?.status === 'added' &&
                    <li className="px-3 pb-1.5 pt-1">
                          <RestockRequestLine
                        request={request}
                        onEdit={() => onEditRestock(statement.id)}
                        onRemove={() => onChangeRestock(statement.id, { ...request, status: 'dismissed' })} />

                        </li>
                    }
                    </React.Fragment>);

              })}
              </ul>
            }
          </SectionCard>);

      })}
      </div>
    </div>);

}
