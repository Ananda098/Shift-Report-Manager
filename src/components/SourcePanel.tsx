import React from 'react';
import { motion } from 'framer-motion';
import { XIcon, MicIcon, PenLineIcon, SmartphoneIcon, SparklesIcon } from 'lucide-react';
import { Source, AddedSource, InputType } from '../types/report';

const inputIcon: Record<InputType, typeof MicIcon> = {
  Voice: MicIcon,
  Note: PenLineIcon,
  'Team app': SmartphoneIcon,
  Typed: PenLineIcon
};

interface SourcePanelProps {
  source: Source;
  addedSources?: AddedSource[];
  onClose: () => void;
}

export function SourcePanel({ source, addedSources, onClose }: SourcePanelProps) {
  const Icon = inputIcon[source.input];

  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      aria-labelledby="source-panel-title"
      className="rounded-xl border border-line bg-card p-4">
      
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 id="source-panel-title" className="text-meta font-medium text-muted">
          Where this came from
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
        “{source.quote}”
      </blockquote>

      <div className="mt-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-raised text-label font-medium text-muted">
          {source.person.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-meta text-txt">{source.person.name}</p>
          <p className="text-label text-faint">{source.person.role}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-label text-muted">
        <span>{source.time}</span>
        <span className="text-line">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Icon size={13} strokeWidth={2} className="text-faint" />
          {source.input}
        </span>
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
    </motion.section>);

}