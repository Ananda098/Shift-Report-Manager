import React, { useState } from 'react';
import { InlineAIHelp } from './InlineAIHelp';

const QUANTITIES = ['6 bottles', '12 bottles', '24 bottles'];
const TIMINGS = ['Before Friday', 'Next delivery', 'Urgent (tomorrow)'];

interface RestockDetailsHelpProps {
  anchorId: string;
  onAdd: (detail: string) => void;
  onDismiss: () => void;
}

function Chip({
  label,
  selected,
  onClick




}: {label: string;selected: boolean;onClick: () => void;}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
      'rounded-md border px-2 py-1 text-label outline-none transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-teal',
      selected ?
      'border-teal bg-teal-fill text-teal' :
      'border-line bg-raised text-muted hover:text-txt'].
      join(' ')}>
      
      {label}
    </button>);

}

export function RestockDetailsHelp({ anchorId, onAdd, onDismiss }: RestockDetailsHelpProps) {
  const [quantity, setQuantity] = useState<string | null>(null);
  const [timing, setTiming] = useState<string | null>(null);
  const ready = Boolean(quantity && timing);

  return (
    <InlineAIHelp
      anchorId={anchorId}
      type="optional"
      question="How much, and how soon?"
      onDismiss={onDismiss}>
      
      {(resolve) =>
      <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {QUANTITIES.map((option) =>
          <Chip
            key={option}
            label={option}
            selected={quantity === option}
            onClick={() => setQuantity(option)} />

          )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TIMINGS.map((option) =>
          <Chip
            key={option}
            label={option}
            selected={timing === option}
            onClick={() => setTiming(option)} />

          )}
          </div>
          <button
          type="button"
          disabled={!ready}
          onClick={() =>
          resolve(() => onAdd(` ${quantity}, ${timing?.toLowerCase()}.`))
          }
          className="mt-1 rounded-lg border border-teal px-2.5 py-1.5 text-meta text-teal outline-none transition-colors duration-150 ease-out hover:bg-teal-fill focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-not-allowed disabled:border-line disabled:text-faint disabled:hover:bg-transparent">
          
            Add
          </button>
        </div>
      }
    </InlineAIHelp>);

}