import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface GhostPromptProps {
  text: string;
  /** Position relative to the editor, in px. */
  left: number;
  top: number;
  onDismiss: () => void;
}

/** A hint that sits inline right after the caret. Never part of the note content. */
export function GhostPrompt({ text, left, top, onDismiss }: GhostPromptProps) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onDismiss]);

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      aria-live="polite"
      style={{ left, top }}
      className="ghost-shimmer pointer-events-none absolute select-none whitespace-nowrap text-body text-faint">
      
      {text}
    </motion.p>);

}