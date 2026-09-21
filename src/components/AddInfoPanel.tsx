import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MicIcon } from 'lucide-react';
import { SectionQuestion } from '../utils/mockAi';
import { RecordButton } from './RecordButton';
import { InlineEditable } from './InlineEditable';
import { HighlightText } from './HighlightText';
import { DismissDialog } from './DismissDialog';
import { DrawerBody, DrawerCancel, DrawerFooter } from './DrawerShell';

/** One section's unsaved answers. Held by the shell, keyed by section, so
    swapping between sections never drops what was typed. */
export interface InfoDraft {
  answers: string[];
  /** Chips the mocked transcription filled, for the "from recording" tag. */
  recordedChips: string[];
}

export function emptyInfoDraft(baseline: string[]): InfoDraft {
  return { answers: baseline, recordedChips: [] };
}

export function infoDraftIsDirty(draft: InfoDraft, baseline: string[]): boolean {
  return draft.answers.some((a, i) => a !== (baseline[i] ?? ''));
}

interface AddInfoPanelProps {
  sectionTitle: string;
  questions: SectionQuestion[];
  /** The section's current statements, one per question — what "dirty" is measured against. */
  baseline: string[];
  draft: InfoDraft;
  onChangeDraft: (updater: (draft: InfoDraft) => InfoDraft) => void;
  /** Bumped when the already-open drawer's trigger is clicked again. */
  focusPulse: number;
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
      <span className="w-[112px] shrink-0 pt-1 text-label uppercase tracking-wide text-faint">
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
  baseline,
  draft,
  onChangeDraft,
  focusPulse,
  hasExistingContent,
  onClose,
  onAdd
}: AddInfoPanelProps) {
  const [recording, setRecording] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const { answers, recordedChips } = draft;
  const hasData = answers.some((a) => a.trim().length > 0);
  const isDirty = infoDraftIsDirty(draft, baseline);

  const setAnswer = (index: number, value: string) => {
    onChangeDraft((prev) => ({
      ...prev,
      answers: prev.answers.map((a, i) => i === index ? value : a)
    }));
  };

  // Fills whichever rows are still empty — content the manager already typed
  // or that came prefilled from an earlier answer is left alone.
  const handleStop = () => {
    setRecording(false);
    const emptyIndexes = questions.map((_, i) => i).filter((i) => !answers[i].trim());
    emptyIndexes.forEach((qIndex, step) => {
      window.setTimeout(() => {
        onChangeDraft((prev) => ({
          answers: prev.answers.map((a, i) => i === qIndex ? questions[qIndex].sampleAnswer : a),
          recordedChips: [...prev.recordedChips, questions[qIndex].chip]
        }));
      }, FILL_STEP_MS * (step + 1));
    });
  };

  // Re-clicking this section's trigger while its drawer is up just puts the
  // caret back in the first row.
  useEffect(() => {
    if (focusPulse > 0 && questions.length > 0) {
      (document.getElementById(`input-${questions[0].chip}`) as HTMLElement | null)?.focus();
    }
  }, [focusPulse, questions]);

  const requestClose = () => isDirty ? setDiscardOpen(true) : onClose();

  const handleAdd = () => {
    onAdd(questions.map((q, i) => ({ chip: q.chip, text: answers[i] ?? '' })));
  };

  return (
    <>
      <DrawerBody title={sectionTitle} onClose={requestClose}>
        <div>
          {questions.map((question, index) =>
          <Row
            key={question.chip}
            label={question.label}
            tag={recordedChips.includes(question.chip) ? 'from recording' : undefined}>

              <InlineEditable
              value={answers[index] ?? ''}
              onChange={(value) => setAnswer(index, value)}
              onDelete={() => setAnswer(index, '')}
              ariaLabel={question.label}
              elementId={`input-${question.chip}`}
              placeholder={question.placeholder}>

                <HighlightText active={recordedChips.includes(question.chip)}>
                  {answers[index] ?? ''}
                </HighlightText>
              </InlineEditable>
            </Row>
          )}
        </div>
      </DrawerBody>

      <DrawerFooter>
        <DrawerCancel onClick={requestClose} />

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
      </DrawerFooter>

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
    </>);

}
