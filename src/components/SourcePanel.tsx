import React from 'react';
import { motion } from 'framer-motion';
import { XIcon, SparklesIcon } from 'lucide-react';
import { Source, AddedSource } from '../types/report';
import { Avatar } from './Avatar';

interface SourcePanelProps {
  source: Source;
  addedSources?: AddedSource[];
  /** Tags on the statement this source belongs to. The report itself stays
      untagged for readability — they only surface here. */
  chips?: string[];
  onClose: () => void;
}

export function SourcePanel({ source, addedSources, chips, onClose }: SourcePanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      aria-labelledby="source-panel-title"
      className="rounded-xl border border-line bg-card p-4">

      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 id="source-panel-title" className="text-[11px] font-semibold uppercase tracking-wide text-faint">
          Source
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close source"
          className="-mr-1 -mt-1 rounded-md p-1 text-faint outline-none transition-colors duration-150 ease-out hover:text-txt focus-visible:ring-2 focus-visible:ring-teal">

          <XIcon size={16} strokeWidth={2} />
        </button>
      </div>

      <blockquote className="border-l-2 border-teal/50 pl-3 text-body text-txt">
        {source.quote}
      </blockquote>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar person={source.person} className="h-6 w-6 shrink-0 bg-raised text-[11px]" />
          <span className="truncate text-label text-txt">{source.person.name}</span>
        </span>
        <span className="shrink-0 text-label text-faint">{source.time}</span>
      </div>

      {addedSources?.map((added) =>
      <div
        key={`${added.label}-${added.time}`}
        className="mt-2 flex items-center gap-1.5 text-label text-faint">

          <SparklesIcon size={13} strokeWidth={2} />
          <span>
            {added.label} · {added.by} · {added.time}
          </span>
        </div>
      )}

      {chips &&
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
          {chips.map((chip) =>
        <span
          key={chip}
          className="rounded-md bg-raised px-1.5 py-0.5 text-label text-muted">

              {chip}
            </span>
        )}
          <button
          type="button"
          className="rounded-md border border-dashed border-line px-1.5 py-0.5 text-label text-faint outline-none transition-colors duration-150 ease-out hover:text-muted focus-visible:ring-2 focus-visible:ring-teal">

            + tag
          </button>
        </div>
      }
    </motion.section>);

}
