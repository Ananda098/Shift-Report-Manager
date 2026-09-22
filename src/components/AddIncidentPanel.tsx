import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Evidence, Tier } from '../types/report';
import { InlineEditable } from './InlineEditable';
import { HighlightText } from './HighlightText';
import { TierMenu } from './TierMenu';
import { EvidenceSection } from './EvidenceSection';
import { DismissDialog } from './DismissDialog';
import {
  DrawerActions,
  DrawerBody,
  DrawerCancel,
  DrawerFooter,
  useDrawerRecording } from
'./DrawerShell';

/** Everything the manager has entered so far. Lives in the shell, so
    swapping to another drawer and back leaves the half-filled form intact. */
export interface IncidentDraft {
  tier: Tier | null;
  tierByAI: boolean;
  type: string;
  time: string;
  timeApprox: boolean;
  location: string;
  parties: string[];
  summary: string;
  evidence: Evidence[];
  /** Fields the mocked transcription filled, for the one-off highlight. */
  filled: string[];
  /** Sticks once every required field has been captured. */
  expanded: boolean;
}

export const EMPTY_INCIDENT_DRAFT: IncidentDraft = {
  tier: null,
  tierByAI: false,
  type: '',
  time: '',
  timeApprox: false,
  location: '',
  parties: [],
  summary: '',
  evidence: [],
  filled: [],
  expanded: false
};

export function incidentDraftHasData(draft: IncidentDraft): boolean {
  return Boolean(
    draft.type ||
    draft.time ||
    draft.location ||
    draft.summary ||
    draft.parties.length ||
    draft.evidence.length ||
    draft.tier
  );
}

interface AddIncidentPanelProps {
  draft: IncidentDraft;
  onChangeDraft: (updater: (draft: IncidentDraft) => IncidentDraft) => void;
  /** Bumped when the already-open drawer's trigger is clicked again. */
  focusPulse: number;
  /** Something else on the page is recording — this drawer's mic waits its turn. */
  recordDisabled?: boolean;
  onRecordingChange: (recording: boolean) => void;
  onClose: () => void;
  onAdd: (draft: IncidentDraft) => void;
}

const FILL_STEP_MS = 250;

function Field({
  id,
  label,
  children,
  tag





}: {id: string;label: string;children: React.ReactNode;tag?: string;}) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      id={`field-${id}`}
      className="flex gap-3 border-t border-line py-2.5">

      <span className="w-[76px] shrink-0 pt-1 text-label uppercase tracking-wide text-faint">
        {label}
      </span>
      <div className="min-w-0 flex-1">
        {children}
        {tag && <p className="mt-0.5 px-1 text-label text-faint">{tag}</p>}
      </div>
    </motion.div>);

}

export function AddIncidentPanel({
  draft,
  onChangeDraft,
  focusPulse,
  recordDisabled,
  onRecordingChange,
  onClose,
  onAdd
}: AddIncidentPanelProps) {
  const { recording, start: startRecording, stop: stopRecording } = useDrawerRecording(onRecordingChange);
  const [discardOpen, setDiscardOpen] = useState(false);

  const { tier, tierByAI, type, time, timeApprox, location, parties, summary, evidence, filled, expanded } = draft;

  const set = <K extends keyof IncidentDraft,>(key: K, value: IncidentDraft[K]) =>
  onChangeDraft((prev) => ({ ...prev, [key]: value }));

  const complete = Boolean(type && time && location && summary);

  // Once every required field has been captured, the panel stays in its complete state.
  useEffect(() => {
    if (complete) onChangeDraft((prev) => prev.expanded ? prev : { ...prev, expanded: true });
  }, [complete, onChangeDraft]);

  const mark = (key: string) =>
  onChangeDraft((prev) => ({ ...prev, filled: [...prev.filled, key] }));

  const handleStop = () => {
    stopRecording();
    const steps: (() => void)[] = [
    () => {
      onChangeDraft((prev) => ({ ...prev, type: 'Ejection' }));
      mark('type');
    },
    () => {
      onChangeDraft((prev) => ({ ...prev, time: '~01:50', timeApprox: true }));
      mark('time');
    },
    () => {
      onChangeDraft((prev) => ({ ...prev, location: 'Entrance, outside the rope' }));
      mark('location');
    },
    () => {
      onChangeDraft((prev) => ({
        ...prev,
        summary:
        'Guest refused to leave after being cut off at the bar; Kuba walked him out. No injuries.'
      }));
      mark('summary');
    },
    () => {
      onChangeDraft((prev) => ({
        ...prev,
        parties: ['Unnamed male guest, 20s, grey hoodie', 'Kuba, door']
      }));
      mark('parties');
    },
    () => {
      onChangeDraft((prev) => ({ ...prev, tier: 'T2', tierByAI: true }));
      mark('tier');
    }];

    steps.forEach((step, i) => window.setTimeout(step, FILL_STEP_MS * (i + 1)));
  };

  const missing: {key: string;label: string;}[] = [];
  if (!type) missing.push({ key: 'type', label: 'Type' });
  if (!time) missing.push({ key: 'time', label: 'Time' });
  if (!location) missing.push({ key: 'location', label: 'Location' });
  if (!summary) missing.push({ key: 'summary', label: 'What happened' });

  const isMissing = (key: string) => expanded && missing.some((m) => m.key === key);

  const focusField = (key: string) => {
    document.getElementById(`field-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const target = document.getElementById(`input-${key}`) as HTMLElement | null;
    window.setTimeout(() => target?.focus(), 120);
  };

  // Re-clicking "+ Add incident" while this drawer is already up just puts
  // the caret back in the first field.
  useEffect(() => {
    if (focusPulse > 0) {
      (document.getElementById('input-type') as HTMLElement | null)?.focus();
    }
  }, [focusPulse]);

  const hasData = incidentDraftHasData(draft);

  const handleAdd = () => {
    if (missing.length > 0) {
      focusField(missing[0].key);
      return;
    }
    onAdd(draft);
  };

  const requestClose = () => hasData ? setDiscardOpen(true) : onClose();

  const typeField =
  <Field id="type" label="Type" key="type">
      <InlineEditable
      value={type}
      onChange={(value) => set('type', value)}
      onDelete={() => set('type', '')}
      ariaLabel="Incident type"
      elementId="input-type"
      placeholder="What kind of incident?"
      error={isMissing('type')}>

        <HighlightText active={filled.includes('type')}>{type}</HighlightText>
      </InlineEditable>
    </Field>;


  const timeField =
  <Field id="time" label="Time" tag={timeApprox ? 'approx.' : undefined} key="time">
      <InlineEditable
      value={time}
      onChange={(value) =>
      onChangeDraft((prev) => ({ ...prev, time: value, timeApprox: value.startsWith('~') }))
      }
      onDelete={() => set('time', '')}
      ariaLabel="Time"
      elementId="input-time"
      placeholder="When did it happen?"
      error={isMissing('time')}>

        <HighlightText active={filled.includes('time')}>{time}</HighlightText>
      </InlineEditable>
      <div className="mt-1 flex gap-1.5 px-1">
        {[
      { label: 'Just now', value: '03:14', approx: false },
      { label: '~1h ago', value: '~02:15', approx: true }].
      map((chip) =>
      <button
        key={chip.label}
        type="button"
        onClick={() =>
        onChangeDraft((prev) => ({ ...prev, time: chip.value, timeApprox: chip.approx }))
        }
        className="rounded-md bg-raised px-1.5 py-0.5 text-label text-muted outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

            {chip.label}
          </button>
      )}
      </div>
    </Field>;


  const locationField =
  <Field id="location" label="Location" key="location">
      <InlineEditable
      value={location}
      onChange={(value) => set('location', value)}
      onDelete={() => set('location', '')}
      ariaLabel="Location"
      elementId="input-location"
      placeholder="Where?"
      error={isMissing('location')}>

        <HighlightText active={filled.includes('location')}>{location}</HighlightText>
      </InlineEditable>
    </Field>;


  const summaryField =
  <Field id="summary" label="What happened" key="summary">
      <InlineEditable
      value={summary}
      onChange={(value) => set('summary', value)}
      onDelete={() => set('summary', '')}
      ariaLabel="What happened"
      elementId="input-summary"
      placeholder="Describe it in a line or two"
      error={isMissing('summary')}>

        <HighlightText active={filled.includes('summary')}>{summary}</HighlightText>
      </InlineEditable>
    </Field>;


  const tierField =
  <Field id="tier" label="Tier" tag={tierByAI ? 'set by AI' : undefined} key="tier">
      {tier ?
    <div className="px-1">
          <TierMenu tier={tier} onChange={(value) => set('tier', value)} />
        </div> :

    <p className="px-1 text-body text-faint">Set after you describe it</p>
    }
    </Field>;


  const partiesField =
  <Field id="parties" label="Parties" key="parties">
      {parties.length === 0 ?
    <InlineEditable
      value=""
      onChange={(value) => set('parties', [value])}
      ariaLabel="Parties"
      elementId="input-parties"
      placeholder="Who was involved?" /> :


    <div className="space-y-0.5">
          {parties.map((line, index) =>
      <InlineEditable
        key={index}
        value={line}
        ariaLabel={`Party line ${index + 1}`}
        elementId={index === 0 ? 'input-parties' : undefined}
        onChange={(value) =>
        onChangeDraft((prev) => ({
          ...prev,
          parties: prev.parties.map((p, i) => i === index ? value : p)
        }))
        }
        onDelete={() =>
        onChangeDraft((prev) => ({
          ...prev,
          parties: prev.parties.filter((_, i) => i !== index)
        }))
        }>

              <HighlightText active={filled.includes('parties')}>{line}</HighlightText>
            </InlineEditable>
      )}
        </div>
    }
    </Field>;


  return (
    <>
      <DrawerBody title="New incident" onClose={requestClose}>
        <div>
          {expanded && tierField}
          {typeField}
          {timeField}
          {locationField}
          {expanded && partiesField}
          {summaryField}
        </div>

        <div className="border-t border-line pt-1">
          <EvidenceSection
            evidence={evidence}
            highlightId={null}
            onAdd={(name) =>
            onChangeDraft((prev) => ({
              ...prev,
              evidence: [...prev.evidence, { id: `e-new-${Date.now()}`, kind: 'photo', name }]
            }))
            } />

        </div>
      </DrawerBody>

      <DrawerFooter>
        <DrawerCancel onClick={requestClose} />
        <DrawerActions
          recording={recording}
          recordDisabled={recordDisabled}
          onStartRecord={startRecording}
          onStopRecord={handleStop}
          primaryLabel="Add incident"
          primaryShortLabel="Add"
          primaryReady={hasData && !recording}
          onPrimary={handleAdd} />

      </DrawerFooter>

      <AnimatePresence>
        {discardOpen &&
        <DismissDialog
          title="Discard this incident?"
          body="Everything you have entered here will be lost."
          keepLabel="Keep editing"
          confirmLabel="Discard"
          onKeep={() => setDiscardOpen(false)}
          onDismiss={onClose} />

        }
      </AnimatePresence>
    </>);

}
