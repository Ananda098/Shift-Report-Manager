import React from 'react';
import { SearchIcon } from 'lucide-react';
import { DetailRow } from '../types/report';
import { InlineEditable } from './InlineEditable';
import { HighlightText } from './HighlightText';

interface DetailsSectionProps {
  rows: DetailRow[];
  highlightId: string | null;
  openSourceRowId: string | null;
  onChange: (rowId: string, index: number, value: string) => void;
  onOpenSource: (rowId: string) => void;
}

export function DetailsSection({
  rows,
  highlightId,
  openSourceRowId,
  onChange,
  onOpenSource
}: DetailsSectionProps) {
  return (
    <section id="review-details" aria-labelledby="review-details-title" className="mt-8">
      <h2 id="review-details-title" className="text-section font-semibold text-txt">
        Details
      </h2>

      <div className="mt-2">
        {rows.map((row) => {
          const active = openSourceRowId === row.id;
          return (
            <div
              key={row.id}
              id={`detail-${row.id}`}
              className="group relative -mx-3 flex gap-4 rounded-lg px-3 py-2 pr-9 transition-colors duration-150 ease-out hover:bg-card">
              
              {active &&
              <span
                aria-hidden
                className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-teal" />

              }
              <span className="w-28 shrink-0 pt-1 text-label uppercase tracking-wide text-faint">
                {row.label}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                {row.values.map((value, index) =>
                <InlineEditable
                  key={`${row.id}-${index}`}
                  value={value}
                  ariaLabel={`${row.label} line ${index + 1}`}
                  onChange={(next) => onChange(row.id, index, next)}>
                  
                    <HighlightText active={highlightId === row.id}>{value}</HighlightText>
                  </InlineEditable>
                )}
              </div>

              {row.source &&
              <button
                type="button"
                aria-label={`Where the ${row.label.toLowerCase()} came from`}
                onClick={() => onOpenSource(row.id)}
                className={[
                'absolute right-2 top-2.5 rounded-md p-1.5 outline-none transition-[opacity,color] duration-150 ease-out',
                'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-teal',
                active ?
                'text-teal opacity-100' :
                'text-faint opacity-0 hover:text-txt group-hover:opacity-100'].
                join(' ')}>
                
                  <SearchIcon size={15} strokeWidth={2} />
                </button>
              }
            </div>);

        })}
      </div>
    </section>);

}