import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface DrawerShellProps {
  /** Changing this crossfades the contents; the shell itself stays put. */
  contentKey: string;
  ariaLabel: string;
  children: React.ReactNode;
}

/** The one side drawer. "New incident", every "Add information" and "Edit
    note" render inside this shell, so they share a width, a header, a footer
    height and one scroll region. Opening a different drawer while one is up
    swaps the contents in place — the shell never slides out and back in. */
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

/** Scrollable region of the drawer: title, close button, then the fields. */
export function DrawerBody({
  title,
  onClose,
  children



}: {title: string;onClose: () => void;children: React.ReactNode;}) {
  return (
    <div className="scroll-slim flex-1 overflow-y-auto px-5 py-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-section font-semibold text-txt">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 rounded-md p-1 text-faint outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

          <XIcon size={17} strokeWidth={2} />
        </button>
      </div>
      {children}
    </div>);

}

/** Fixed-height footer: "Cancel" on the left, the primary/Record action on
    the right. Same box in every drawer, so nothing shifts on a swap. */
export function DrawerFooter({ children }: {children: React.ReactNode;}) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-t border-line bg-card px-4">
      {children}
    </div>);

}

/** The shared "Cancel" button every drawer footer opens with. */
export function DrawerCancel({ onClick }: {onClick: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md px-2 py-1 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

      Cancel
    </button>);

}
