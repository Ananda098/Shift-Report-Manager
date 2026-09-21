import React, { useLayoutEffect, useRef, useState } from 'react';
import { PlayIcon } from 'lucide-react';
import { HistoryEntry } from '../types/report';

const WAVEFORM = [6, 11, 7, 14, 9, 16, 8, 12, 6, 13, 9, 15, 7, 10, 6, 12, 8, 14, 7, 9];

function AudioPlayer({ duration }: {duration: string;}) {
  return (
    <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-raised px-2.5 py-2">
      <button
        type="button"
        aria-label="Play recording"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-fill text-teal outline-none transition-colors duration-150 ease-out hover:bg-teal-fill/70 focus-visible:ring-2 focus-visible:ring-teal">
        
        <PlayIcon size={13} strokeWidth={2.5} />
      </button>
      <div aria-hidden className="flex h-5 flex-1 items-center gap-[3px]">
        {WAVEFORM.map((height, i) =>
        <span key={i} className="w-[3px] rounded-full bg-line" style={{ height }} />
        )}
      </div>
      <span className="shrink-0 text-label tabular-nums text-faint">{duration}</span>
    </div>);

}

function ReportEntry({ entry, location }: {entry: HistoryEntry;location: string;}) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;
    setClamped(el.scrollHeight > el.clientHeight + 1);
  }, [expanded, entry.text]);

  const hasRecording = entry.input === 'Voice' && Boolean(entry.duration);
  const canExpand = clamped || hasRecording;

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <p className="min-w-0 text-meta text-muted">
          {entry.time} <span className="text-faint">·</span>{' '}
          <span className="text-faint">{entry.location ?? location}</span>
        </p>
        <p className="flex shrink-0 items-center gap-1.5 text-meta text-muted">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-raised text-[11px] font-medium text-muted">
            {entry.person?.initials}
          </span>
          <span className="text-txt">{entry.person?.name.split(' ')[0]}</span>
          <span className="text-faint">·</span>
          <span>{entry.role ?? entry.person?.role}</span>
        </p>
      </div>

      <p ref={textRef} className={`mt-1.5 text-body text-txt ${expanded ? '' : 'clamp-2'}`}>
        {entry.text}
      </p>

      {expanded && hasRecording && entry.duration && <AudioPlayer duration={entry.duration} />}

      {canExpand &&
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-1 rounded-md text-meta text-muted underline-offset-4 outline-none transition-colors duration-150 ease-out hover:text-txt hover:underline focus-visible:ring-2 focus-visible:ring-teal">
        
          {expanded ? 'Hide full report' : 'Show full report'}
        </button>
      }
    </>);

}

interface HistoryTimelineProps {
  entries: HistoryEntry[];
  location: string;
}

export function HistoryTimeline({ entries, location }: HistoryTimelineProps) {
  return (
    <section aria-labelledby="review-history-title" className="mt-8">
      <h2 id="review-history-title" className="text-section font-semibold text-txt">
        History
      </h2>

      <ol className="mt-3 border-l border-line pl-4">
        {entries.map((entry) =>
        <li key={entry.id} className="relative pb-5 last:pb-0">
            <span
            aria-hidden
            className={[
            'absolute -left-[21px] top-2 h-1.5 w-1.5 rounded-full',
            entry.kind === 'system' ? 'bg-line' : 'bg-faint'].
            join(' ')} />
          
            {entry.kind === 'system' ?
          <p className="text-meta text-faint">
                {entry.time} · {entry.label}
              </p> :

          <ReportEntry entry={entry} location={location} />
          }
          </li>
        )}
      </ol>
    </section>);

}