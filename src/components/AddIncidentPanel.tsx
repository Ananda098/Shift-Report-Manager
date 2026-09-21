import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { Evidence, Tier } from '../types/report';
import { RecordButton } from './RecordButton';
import { InlineEditable } from './InlineEditable';
import { HighlightText } from './HighlightText';
import { TierMenu } from './TierMenu';
import { EvidenceSection } from './EvidenceSection';
import { DismissDialog } from './DismissDialog';

export interface NewIncidentDraft {
  tier: Tier;
  type: string;
  time: string;
  location: string;
  parties: string[];
  summary: string;
  evidence: Evidence[];
}

interface AddIncidentPanelProps {
  onClose: () => void;
  onAdd: (draft: NewIncidentDraft) => void;
  /** Tells the shell whether this panel is currently showing a primary action. */
  onPrimaryChange?: (hasPrimary: boolean) => void;
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

export function AddIncidentPanel({ onClose, onAdd, onPrimaryChange }: AddIncidentPanelProps) {
  const [recording, setRecording] = useState(false);
  const [tier, setTier] = useState<Tier | null>(null);
  const [tierByAI, setTierByAI] = useState(false);
  const [type, setType] = useState('');
  const [time, setTime] = useState('');
  const [timeApprox, setTimeApprox] = useState(false);
  const [location, setLocation] = useState('');
  const [parties, setParties] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [filled, setFilled] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const complete = Boolean(type && time && location && summary);

  // Once every required field has been captured, the panel stays in its complete state.
  useEffect(() => {
    if (complete) setExpanded(true);
  }, [complete]);

  useEffect(() => {
    onPrimaryChange?.(expanded);
  }, [expanded, onPrimaryChange]);

  useEffect(() => () => onPrimaryChange?.(false), [onPrimaryChange]);

  const mark = (key: string) => setFilled((prev) => [...prev, key]);

  const handleStop = () => {
    setRecording(false);
    const steps: (() => void)[] = [
    () => {
      setType('Ejection');
      mark('type');
    },
    () => {
      setTime('~01:50');
      setTimeApprox(true);
      mark('time');
    },
    () => {
      setLocation('Entrance, outside the rope');
      mark('location');
    },
    () => {
      setSummary(
        'Guest refused to leave after being cut off at the bar; Kuba walked him out. No injuries.'
      );
      mark('summary');
    },
    () => {
      setParties(['Unnamed male guest, 20s, grey hoodie', 'Kuba, door']);
      mark('parties');
    },
    () => {
      setTier('T2');
      setTierByAI(true);
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

  const hasData = Boolean(
    type || time || location || summary || parties.length || evidence.length || tier
  );

  const handleAdd = () => {
    if (missing.length > 0) {
      focusField(missing[0].key);
      return;
    }
    onAdd({ tier: tier ?? 'T1', type, time, location, parties, summary, evidence });
  };

  const requestClose = () => hasData ? setDiscardOpen(true) : onClose();

  const typeField =
  <Field id="type" label="Type" key="type">
      <InlineEditable
      value={type}
      onChange={setType}
      onDelete={() => setType('')}
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
      onChange={(value) => {
        setTime(value);
        setTimeApprox(value.startsWith('~'));
      }}
      onDelete={() => setTime('')}
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
        onClick={() => {
          setTime(chip.value);
          setTimeApprox(chip.approx);
        }}
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
      onChange={setLocation}
      onDelete={() => setLocation('')}
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
      onChange={setSummary}
      onDelete={() => setSummary('')}
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
          <TierMenu tier={tier} onChange={setTier} />
        </div> :

    <p className="px-1 text-body text-faint">Set after you describe it</p>
    }
    </Field>;


  const partiesField =
  <Field id="parties" label="Parties" key="parties">
      {parties.length === 0 ?
    <InlineEditable
      value=""
      onChange={(value) => setParties([value])}
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
        setParties((prev) => prev.map((p, i) => i === index ? value : p))
        }
        onDelete={() => setParties((prev) => prev.filter((_, i) => i !== index))}>
        
              <HighlightText active={filled.includes('parties')}>{line}</HighlightText>
            </InlineEditable>
      )}
        </div>
    }
    </Field>;


  return (
    <motion.aside
      aria-label="New incident"
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[340px] flex-col border-l border-line bg-card">
      
      <div className="scroll-slim flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-section font-semibold text-txt">New incident</h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close new incident"
            className="-mr-1 rounded-md p-1 text-faint outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">
            
            <XIcon size={17} strokeWidth={2} />
          </button>
        </div>

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
            setEvidence((prev) => [...prev, { id: `e-new-${Date.now()}`, kind: 'photo', name }])
            } />
          
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line bg-card px-4 py-3">
        <button
          type="button"
          onClick={requestClose}
          className="rounded-md px-2 py-1 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">
          
          Cancel
        </button>

        {expanded ?
        <button
          type="button"
          onClick={handleAdd}
          className="h-10 rounded-lg bg-teal px-4 text-meta font-medium text-teal-ink outline-none transition-colors duration-150 ease-out hover:bg-teal-hi focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-card">
          
            Add incident
          </button> :

        <RecordButton
          recording={recording}
          onStart={() => setRecording(true)}
          onStop={handleStop} />

        }
      </div>

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
    </motion.aside>);

}