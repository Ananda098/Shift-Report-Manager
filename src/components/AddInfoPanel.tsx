import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, MicIcon } from 'lucide-react';
import { DrawerAnswer, SectionQuestion } from '../utils/mockAi';
import { DismissDialog } from './DismissDialog';

interface AddInfoPanelProps {
  sectionTitle: string;
  questions: SectionQuestion[];
  onClose: () => void;
  onAdd: (answers: DrawerAnswer[]) => void;
}

const RECORD_MS = 600;

function QuestionField({
  question,
  value,
  recording,
  onChange,
  onRecord




}: {question: SectionQuestion;value: string;recording: boolean;onChange: (v: string) => void;onRecord: () => void;}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="border-t border-line py-3 first:border-t-0 first:pt-0">
      <p className="text-label text-faint">{question.question}</p>
      <textarea
        ref={ref}
        rows={1}
        value={value}
        disabled={recording}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type an answer…"
        className="mt-1.5 block w-full resize-none overflow-hidden rounded-md bg-transparent text-body text-txt outline-none placeholder:text-faint disabled:text-faint" />

      <button
        type="button"
        onClick={onRecord}
        disabled={recording}
        className="mt-1 inline-flex items-center gap-1.5 rounded-md text-label text-muted outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal disabled:text-teal">

        <MicIcon size={12} strokeWidth={2} />
        {recording ? 'Listening…' : 'Record'}
      </button>
    </div>);

}

/** Same drawer pattern as "New incident", but built from a section's supporting questions. */
export function AddInfoPanel({ sectionTitle, questions, onClose, onAdd }: AddInfoPanelProps) {
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ''));
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);

  const hasData = answers.some((a) => a.trim().length > 0);

  const setAnswer = (index: number, value: string) => {
    setAnswers((prev) => prev.map((a, i) => i === index ? value : a));
  };

  const record = (index: number) => {
    if (recordingIndex !== null) return;
    setRecordingIndex(index);
    window.setTimeout(() => {
      setAnswer(index, questions[index].sampleAnswer);
      setRecordingIndex(null);
    }, RECORD_MS);
  };

  const requestClose = () => hasData ? setDiscardOpen(true) : onClose();

  const handleAdd = () => {
    const filled: DrawerAnswer[] = questions.
    map((q, i) => ({ question: q.question, chip: q.chip, text: answers[i].trim() })).
    filter((a) => a.text.length > 0);
    if (filled.length === 0) return;
    onAdd(filled);
  };

  return (
    <motion.aside
      aria-label={`Add information to ${sectionTitle}`}
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[340px] flex-col border-l border-line bg-card">

      <div className="scroll-slim flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-section font-semibold text-txt">Add to {sectionTitle.toLowerCase()}</h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="-mr-1 rounded-md p-1 text-faint outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

            <XIcon size={17} strokeWidth={2} />
          </button>
        </div>
        <p className="text-meta text-muted">
          Answer whatever's relevant — type, or tap Record for each one. Nothing here is required.
        </p>

        <div className="mt-4">
          {questions.map((question, index) =>
          <QuestionField
            key={question.question}
            question={question}
            value={answers[index]}
            recording={recordingIndex === index}
            onChange={(v) => setAnswer(index, v)}
            onRecord={() => record(index)} />

          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line bg-card px-4 py-3">
        <button
          type="button"
          onClick={requestClose}
          className="rounded-md px-2 py-1 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

          Cancel
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!hasData}
          className="h-10 rounded-lg bg-teal px-4 text-meta font-medium text-teal-ink outline-none transition-colors duration-150 ease-out hover:bg-teal-hi focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-40">

          Add to {sectionTitle.toLowerCase()}
        </button>
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
