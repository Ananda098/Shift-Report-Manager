import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon, MicIcon } from 'lucide-react';
import { Evidence } from '../types/report';
import { SectionQuestion } from '../utils/mockAi';
import { RecordButton } from './RecordButton';
import { InlineEditable } from './InlineEditable';
import { HighlightText } from './HighlightText';
import { EvidenceSection } from './EvidenceSection';
import { DismissDialog } from './DismissDialog';

interface AddInfoPanelProps {
  sectionTitle: string;
  questions: SectionQuestion[];
  /** Existing answers, one per question, prefilled from the section's current statements. */
  initialAnswers: string[];
  /** The section already has statements — swaps the primary label to "Update". */
  hasExistingContent: boolean;
  onClose: () => void;
  onAdd: (rows: {chip: string;text: string;}[]) => void;
}

const FILL_STEP_MS = 250;

function Row({
  label,
  tag,
  children



}: {label: string;tag?: string;children: React.ReactNode;}) {
  return (
    <div className="flex gap-3 border-t border-line py-2.5">
      <span className="w-[76px] shrink-0 pt-1 text-label uppercase tracking-wide text-faint">
        {label}
      </span>
      <div className="min-w-0 flex-1">
        {children}
        {tag && <p className="mt-0.5 px-1 text-label text-faint">{tag}</p>}
      </div>
    </div>);

}

/** Same drawer pattern as "New incident" — label-left/value-right rows, one
    per section question, filled by typing or by a mocked Record pass. */
export function AddInfoPanel({
  sectionTitle,
  questions,
  initialAnswers,
  hasExistingContent,
  onClose,
  onAdd
}: AddInfoPanelProps) {
  const [answers, setAnswers] = useState<string[]>(initialAnswers);
  const [recording, setRecording] = useState(false);
  const [recordedChips, setRecordedChips] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [discardOpen, setDiscardOpen] = useState(false);

  const hasData = answers.some((a) => a.trim().length > 0);
  const isDirty = evidence.length > 0 || answers.some((a, i) => a !== initialAnswers[i]);

  const setAnswer = (index: number, value: string) => {
    setAnswers((prev) => prev.map((a, i) => i === index ? value : a));
  };

  // Fills whichever rows are still empty — content the manager already typed
  // or that came prefilled from an earlier answer is left alone.
  const handleStop = () => {
    setRecording(false);
    const emptyIndexes = questions.map((_, i) => i).filter((i) => !answers[i].trim());
    emptyIndexes.forEach((qIndex, step) => {
      window.setTimeout(() => {
        setAnswer(qIndex, questions[qIndex].sampleAnswer);
        setRecordedChips((prev) => [...prev, questions[qIndex].chip]);
      }, FILL_STEP_MS * (step + 1));
    });
  };

  const requestClose = () => isDirty ? setDiscardOpen(true) : onClose();

  const handleAdd = () => {
    onAdd(questions.map((q, i) => ({ chip: q.chip, text: answers[i] })));
  };

  return (
    <motion.aside
      aria-label={sectionTitle}
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[340px] flex-col border-l border-line bg-card">

      <div className="scroll-slim flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-section font-semibold text-txt">{sectionTitle}</h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="-mr-1 rounded-md p-1 text-faint outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

            <XIcon size={17} strokeWidth={2} />
          </button>
        </div>

        <div>
          {questions.map((question, index) =>
          <Row
            key={question.chip}
            label={question.label}
            tag={recordedChips.includes(question.chip) ? 'from recording' : undefined}>

              <InlineEditable
              value={answers[index]}
              onChange={(value) => setAnswer(index, value)}
              onDelete={() => setAnswer(index, '')}
              ariaLabel={question.label}
              elementId={`input-${question.chip}`}
              placeholder={question.placeholder}>

                <HighlightText active={recordedChips.includes(question.chip)}>
                  {answers[index]}
                </HighlightText>
              </InlineEditable>
            </Row>
          )}
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

        {!hasData || recording ?
        <RecordButton
          recording={recording}
          onStart={() => setRecording(true)}
          onStop={handleStop} /> :


        <div className="flex items-center gap-2">
            <button
            type="button"
            onClick={() => setRecording(true)}
            aria-label="Record more"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-teal outline-none transition-colors duration-150 ease-out hover:bg-teal-fill focus-visible:ring-2 focus-visible:ring-teal">

              <MicIcon size={16} strokeWidth={2} />
            </button>
            <button
            type="button"
            onClick={handleAdd}
            className="h-10 rounded-lg bg-teal px-4 text-meta font-medium text-teal-ink outline-none transition-colors duration-150 ease-out hover:bg-teal-hi focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-card">

              {hasExistingContent ? 'Update information' : 'Add information'}
            </button>
          </div>
        }
      </div>

      <AnimatePresence>
        {discardOpen &&
        <DismissDialog
          title="Discard this information?"
          body="What you've entered here will be lost."
          keepLabel="Keep editing"
          confirmLabel="Discard"
          onKeep={() => setDiscardOpen(false)}
          onDismiss={onClose} />

        }
      </AnimatePresence>
    </motion.aside>);

}
