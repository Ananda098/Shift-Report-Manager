import React, { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ReviewIncident, Tier } from '../types/report';
import { reviewHelp } from '../data/reviewHelp';
import { applyHelpAction, sortForQueue, systemEntry } from '../utils/reviewActions';
import { ReviewTopBar } from './ReviewTopBar';
import { IncidentSwitcher } from './IncidentSwitcher';
import { ReviewQueue } from './ReviewQueue';
import { IncidentDetail } from './IncidentDetail';
import { DecisionBar } from './DecisionBar';
import { DismissDialog } from './DismissDialog';
import { MarginRail, MarginRailItem } from './MarginRail';
import { TIER_LABEL } from './TierBadge';
import { InlineAIHelp } from './InlineAIHelp';
import { SourcePanel } from './SourcePanel';

interface ReviewViewProps {
  incidents: ReviewIncident[];
  currentId: string;
  resolvedHelp: string[];
  onSelect: (id: string) => void;
  onUpdate: (id: string, updater: (incident: ReviewIncident) => ReviewIncident) => void;
  onResolveHelp: (helpId: string) => void;
  onBack: () => void;
  onFinish: () => void;
}

export function ReviewView({
  incidents,
  currentId,
  resolvedHelp,
  onSelect,
  onUpdate,
  onResolveHelp,
  onBack,
  onFinish
}: ReviewViewProps) {
  const [saving, setSaving] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [openSourceRowId, setOpenSourceRowId] = useState<string | null>(null);
  const [dismissOpen, setDismissOpen] = useState(false);
  const [helpError, setHelpError] = useState<string | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  const current = incidents.find((i) => i.id === currentId) ?? incidents[0];
  const pending = incidents.filter((i) => i.status === 'pending');
  const help = reviewHelp.find((h) => h.incidentId === current.id && !resolvedHelp.includes(h.id));

  const touch = () => {
    setSaving(true);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSaving(false), 600);
  };

  const flash = (id: string | null) => {
    if (!id) return;
    setHighlightId(id);
    window.setTimeout(() => setHighlightId((v) => v === id ? null : v), 2200);
  };

  const update = (updater: (incident: ReviewIncident) => ReviewIncident) => {
    onUpdate(current.id, updater);
    touch();
  };

  const goNext = () => {
    const queue = sortForQueue(pending.filter((i) => i.id !== current.id));
    if (queue.length === 0) {
      onFinish();
      return;
    }
    setOpenSourceRowId(null);
    setHelpError(null);
    onSelect(queue[0].id);
  };

  const handleConfirm = () => {
    if (help?.type === 'mandatory') {
      setHelpError(help.id);
      document.
      querySelector(`[data-anchor="${help.anchorId}"]`)?.
      scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (current.status === 'pending') {
      update((incident) => ({
        ...incident,
        status: 'confirmed',
        history: [...incident.history, systemEntry('You confirmed')]
      }));
    }
    goNext();
  };

  const handleDismiss = () => {
    setDismissOpen(false);
    update((incident) => ({
      ...incident,
      status: 'dismissed',
      history: [...incident.history, systemEntry('You dismissed')]
    }));
    goNext();
  };

  const handleRestore = () => {
    update((incident) => ({
      ...incident,
      status: 'pending',
      history: [...incident.history, systemEntry('You restored this incident')]
    }));
  };

  const handleTier = (tier: Tier) => {
    update((incident) => ({
      ...incident,
      tier,
      history: [
      ...incident.history,
      systemEntry(`You changed tier ${TIER_LABEL[incident.tier]} → ${TIER_LABEL[tier]}`)]

    }));
  };

  const handleAddEvidence = (name: string) => {
    const id = `e-new-${Date.now()}`;
    update((incident) => ({
      ...incident,
      evidence: [...incident.evidence, { id, kind: 'photo', name }],
      history: [...incident.history, systemEntry(`You added ${name}`)]
    }));
    flash(id);
  };

  const marginItems: MarginRailItem[] = [];
  if (help) {
    marginItems.push({
      id: help.id,
      anchorId: help.anchorId,
      element:
      <InlineAIHelp
        anchorId={help.anchorId}
        type={help.type}
        question={help.question}
        error={helpError === help.id}
        errorMessage="Answer this to confirm"
        options={help.options.map((option) => ({
          label: option.label,
          onSelect: () => {
            const result = applyHelpAction(current, option.action);
            onUpdate(current.id, () => result.incident);
            onResolveHelp(help.id);
            result.skipIds?.forEach(onResolveHelp);
            setHelpError(null);
            touch();
            flash(result.highlightId);
          }
        }))}
        onDismiss={() => onResolveHelp(help.id)} />


    });
  }

  const sourceRow = current.details.find((row) => row.id === openSourceRowId && row.source);
  if (sourceRow?.source) {
    marginItems.push({
      id: `source-${sourceRow.id}`,
      anchorId: `detail-${sourceRow.id}`,
      element: <SourcePanel source={sourceRow.source} onClose={() => setOpenSourceRowId(null)} />
    });
  }

  return (
    <div className="flex h-full w-full flex-col bg-base font-sans text-txt">
      <ReviewTopBar saving={saving} onBack={onBack} />
      <IncidentSwitcher incidents={incidents} currentId={current.id} onSelect={onSelect} />

      <div className="flex min-h-0 flex-1">
        <ReviewQueue incidents={incidents} currentId={current.id} onSelect={onSelect} />

        <div className="scroll-slim flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[1080px] flex-col dt:flex-row">
            <div className="flex w-full shrink-0 flex-col px-8 pt-8 dt:w-[720px]">
              <IncidentDetail
                incident={current}
                highlightId={highlightId}
                openSourceRowId={openSourceRowId}
                onChangeTier={handleTier}
                onChangeSummary={(summary) => update((incident) => ({ ...incident, summary }))}
                onChangeDetail={(rowId, index, value) =>
                update((incident) => ({
                  ...incident,
                  details: incident.details.map((row) =>
                  row.id === rowId ?
                  { ...row, values: row.values.map((v, i) => i === index ? value : v) } :
                  row
                  )
                }))
                }
                onOpenSource={(rowId) =>
                setOpenSourceRowId((v) => v === rowId ? null : rowId)
                }
                onAddEvidence={handleAddEvidence} />
              

              <div className="h-16" />

              <DecisionBar
                status={current.status}
                pendingCount={pending.length}
                onDismissRequest={() => setDismissOpen(true)}
                onRestore={handleRestore}
                onConfirm={handleConfirm} />
              
            </div>

            <div
              className="w-full shrink-0 px-8 pb-8 dt:w-[340px] dt:px-0 dt:pt-8"
              aria-label="Margin notes">

              <MarginRail items={marginItems} breakpoint={680} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {dismissOpen &&
        <DismissDialog onKeep={() => setDismissOpen(false)} onDismiss={handleDismiss} />
        }
      </AnimatePresence>
    </div>);

}