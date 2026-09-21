import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';

interface ToastProps {
  message: string;
  onDone: () => void;
  duration?: number;
}

export function Toast({ message, onDone, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(id);
  }, [onDone, duration]);

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="pointer-events-none fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-line bg-raised px-4 py-3 text-body text-txt shadow-xl">
      
      <CheckIcon size={16} strokeWidth={2.25} className="text-teal" />
      {message}
    </motion.div>);

}