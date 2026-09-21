import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface DismissDialogProps {
  title?: string;
  body?: string;
  keepLabel?: string;
  confirmLabel?: string;
  onKeep: () => void;
  onDismiss: () => void;
}

export function DismissDialog({
  title = 'Dismiss this incident?',
  body = 'It will be removed from tonight’s report. It stays in the history log and you can restore it from Done.',
  keepLabel = 'Keep it',
  confirmLabel = 'Dismiss incident',
  onKeep,
  onDismiss
}: DismissDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onKeep();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onKeep]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        onClick={onKeep}
        className="absolute inset-0 bg-black/60" />
      
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dismiss-title"
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-[440px] max-w-full rounded-xl border border-line bg-card p-5">
        
        <h2 id="dismiss-title" className="text-section font-semibold text-txt">
          {title}
        </h2>
        <p className="mt-2 text-body text-muted">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onKeep}
            className="h-10 rounded-lg border border-line px-4 text-meta text-muted outline-none transition-colors duration-150 ease-out hover:border-faint hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">
            
            {keepLabel}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="h-10 rounded-lg bg-tier-t3 px-4 text-meta font-medium text-[#2B1211] outline-none transition-opacity duration-150 ease-out hover:opacity-90 focus-visible:ring-2 focus-visible:ring-tier-t3">
            
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>);

}