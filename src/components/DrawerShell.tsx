import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { RecordButton } from './RecordButton';

interface DrawerShellProps {
  /** Changing this crossfades the contents; the shell itself stays put. */
  contentKey: string;
  ariaLabel: string;
  children: React.ReactNode;
}

/** The one side panel. "New incident", every "Add information", "Edit note"
    and the incident preview render inside this shell, so they share a width,
    a header, a footer height and one scroll region. Opening a different one
    while one is up swaps the contents in place — the shell never slides out
    and back in. */
export function DrawerShell({ contentKey, ariaLabel, children }: DrawerShellProps) {
  const reduceMotion = useReducedMotion();
  const slide = reduceMotion ?
  { duration: 0 } :
  { duration: 0.25, ease: [0.23, 1, 0.32, 1] as const };
  const fade = { duration: reduceMotion ? 0 : 0.15, ease: 'linear' as const };

  return (
    <motion.aside
      aria-label={ariaLabel}
      initial={{ x: reduceMotion ? 0 : 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: reduceMotion ? 0 : 24, opacity: 0 }}
      transition={slide}
      className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[440px] flex-col border-l border-line bg-card">

      <AnimatePresence initial={false}>
        <motion.div
          key={contentKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={fade}
          className="absolute inset-0 flex flex-col">

          {children}
        </motion.div>
      </AnimatePresence>
    </motion.aside>);

}

/** Scrollable region of the drawer: title, close button, then the fields.
    `eyebrow` sits above the title (the preview's tier badge), `subtitle`
    below it — the close button stays pinned to the same corner either way. */
export function DrawerBody({
  title,
  eyebrow,
  subtitle,
  onClose,
  children





}: {title: React.ReactNode;eyebrow?: React.ReactNode;subtitle?: React.ReactNode;onClose: () => void;children: React.ReactNode;}) {
  return (
    <div className="scroll-slim flex-1 overflow-y-auto px-5 py-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <div className="mb-2.5">{eyebrow}</div>}
          <h2 className="text-section font-semibold text-txt">{title}</h2>
          {subtitle && <p className="mt-1 text-meta text-muted">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 shrink-0 rounded-md p-1 text-faint outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

          <XIcon size={17} strokeWidth={2} />
        </button>
      </div>
      {children}
    </div>);

}

/** Fixed-height footer: what you're leaving behind on the left, what you're
    doing next on the right. Same box in every drawer, so nothing shifts on
    a swap. */
export function DrawerFooter({ children }: {children: React.ReactNode;}) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-t border-line bg-card px-4">
      {children}
    </div>);

}

/** The shared "Cancel" every editable drawer footer opens with. */
export function DrawerCancel({ onClick }: {onClick: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md px-2 py-1 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

      Cancel
    </button>);

}

/** The solid action a drawer footer ends with. One box in every drawer; the
    short label takes over at phone width, and whenever `compact` is set, so
    a long label never squeezes the rest of the footer. */
export function DrawerPrimary({
  label,
  shortLabel,
  trailingIcon,
  disabled = false,
  compact = false,
  onClick







}: {label: string;shortLabel?: string;trailingIcon?: React.ReactNode;disabled?: boolean;compact?: boolean;onClick: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
      'inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-teal px-4 text-meta font-medium text-teal-ink outline-none',
      'transition-[opacity,background-color] duration-150 ease-out hover:bg-teal-hi',
      'focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-card',
      'disabled:pointer-events-none disabled:opacity-40'].
      join(' ')}>

      {shortLabel ?
      compact ?
      shortLabel :
      <>
            <span className="dt:hidden">{shortLabel}</span>
            <span className="hidden dt:inline">{label}</span>
          </> :

      label
      }
      {trailingIcon}
    </button>);

}

/** Every editable drawer's right-hand pair: Record, then the primary. Both
    are always on screen, so the footer never reflows — only the emphasis
    moves. Nothing entered yet: Record is the filled button and the primary
    waits, greyed out. Something entered: the primary goes solid and Record
    steps back to a quiet "record some more". Mid-take: the primary is out of
    reach until the transcript lands, and yields to its short label so the
    running timer always has room. */
export function DrawerActions({
  recording,
  recordDisabled,
  onStartRecord,
  onStopRecord,
  primaryLabel,
  primaryShortLabel,
  primaryDisabled,
  onPrimary








}: {recording: boolean;recordDisabled?: boolean;onStartRecord: () => void;onStopRecord: () => void;primaryLabel: string;primaryShortLabel?: string;primaryDisabled: boolean;onPrimary: () => void;}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <RecordButton
        recording={recording}
        disabled={recordDisabled}
        secondary={!primaryDisabled}
        onStart={onStartRecord}
        onStop={onStopRecord} />

      <DrawerPrimary
        label={primaryLabel}
        shortLabel={primaryShortLabel}
        disabled={primaryDisabled}
        compact={recording}
        onClick={onPrimary} />

    </div>);

}

/** A drawer's recording state, mirrored up to the shell so nothing else on
    the page can start a second take — and so a drawer closed mid-recording
    releases the microphone on its way out. */
export function useDrawerRecording(onRecordingChange: (recording: boolean) => void) {
  const [recording, setRecording] = useState(false);
  const report = useRef(onRecordingChange);
  report.current = onRecordingChange;

  useEffect(() => () => report.current(false), []);

  const start = useCallback(() => {
    setRecording(true);
    report.current(true);
  }, []);

  const stop = useCallback(() => {
    setRecording(false);
    report.current(false);
  }, []);

  return { recording, start, stop };
}
