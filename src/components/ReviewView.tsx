import React, { useLayoutEffect, useRef, useState } from 'react';
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
  onUnresolveHelp: (helpId: string) => void;
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
  onUnresolveHelp,
  onBack,
  onFinish
}: ReviewViewProps) {
  const [saving, setSaving] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [openSourceRowId, setOpenSourceRowId] = useState<string | null>(null);
  const [dismissOpen, setDismissOpen] = useState(false);
  const [helpError, setHelpError] = useState<string | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const current = incidents.find((i) => i.id === currentId) ?? incidents[0];
  const pending = incidents.filter((i) => i.status === 'pending');
  const help = reviewHelp.find((h) => h.incidentId === current.id && !resolvedHelp.includes(h.id));

  // Each incident is its own page of the queue, so start it from the top
  // rather than wherever the previous one was left scrolled to.
  useLayoutEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [current.id]);

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
    // A follow-up is the second step of the question it hangs off, not a card
    // of its own: the rail keeps one id for the chain, so answering swaps the
    // question inside the card instead of replacing the card.
    const previousId = help.stepOf;
    const chainId = previousId ?? help.id;
    const nextStep = reviewHelp.find((h) => h.stepOf === help.id);
    const fills = help.fills;

    marginItems.push({
      id: chainId,
      anchorId: help.anchorId,
      element:
      <InlineAIHelp
        anchorId={help.anchorId}
        type={help.type}
        stepKey={help.id}
        question={help.question}
        error={helpError === help.id}
        errorMessage="Answer this to confirm"
        options={help.options.map((option) => {
          const result = applyHelpAction(current, option.action);
          return {
            label: option.label,
            // Anything that leaves the follow-up standing moves the card on to
            // it; an answer that skips it finishes the card outright.
            advances: Boolean(nextStep && !result.skipIds?.includes(nextStep.id)),
            onSelect: () => {
              onUpdate(current.id, () => result.incident);
              onResolveHelp(help.id);
              result.skipIds?.forEach(onResolveHelp);
              setHelpError(null);
              touch();
              flash(result.highlightId);
            }
          };
        })}
        onBack={
        previousId ?
        () => {
          // Back undoes the answer behind this step, placeholder row and all,
          // so the card returns to exactly the state it was asked in.
          if (fills) {
            onUpdate(current.id, (incident) => ({
              ...incident,
              details: incident.details.filter((row) => row.id !== fills)
            }));
          }
          setHelpError(null);
          onUnresolveHelp(previousId);
        } :
        undefined
        }
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

        <div className="flex min-h-0 flex-1 flex-col">
          <div ref={scrollerRef} className="scroll-slim flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1080px] flex-col rail:flex-row">
              <div className="flex w-full flex-col px-4 pb-6 pt-6 dt:px-8 dt:pb-8 dt:pt-8 rail:min-w-0 rail:flex-1">
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

              </div>

              <div
                className="w-full shrink-0 px-4 pb-6 dt:px-8 dt:pb-8 rail:w-[340px] rail:px-0 rail:pt-8"
                aria-label="Margin notes">

                <MarginRail items={marginItems} breakpoint={1180} />
              </div>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[1080px] shrink-0 rail:flex-row">
            <div className="w-full px-4 dt:px-8 rail:min-w-0 rail:flex-1">
              <DecisionBar
                status={current.status}
                pendingCount={pending.length}
                onDismissRequest={() => setDismissOpen(true)}
                onRestore={handleRestore}
                onConfirm={handleConfirm} />
            </div>
            <div className="hidden shrink-0 rail:block rail:w-[340px]" />
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