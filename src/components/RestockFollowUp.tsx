import { useState } from 'react';
import { motion } from 'framer-motion';
import { PencilIcon, SparklesIcon, XIcon } from 'lucide-react';
import { RestockItem, RestockRequest, RestockUrgency } from '../types/report';
import {
  RESTOCK_DEFAULT_QTY,
  RESTOCK_QUANTITIES,
  RESTOCK_URGENCIES } from
'../utils/mockAi';

interface RestockFollowUpProps {
  /** Items the mocked AI recognised in the statement, in the order it read them. */
  suggestedItems: string[];
  request?: RestockRequest;
  onChange: (request: RestockRequest) => void;
}

/** Which question the card is on. `done` is the collapsed request line. */
type Step = 'ask' | 'quantities' | 'urgency' | 'done';

const CHIP =
'rounded-lg border px-2.5 py-2.5 text-meta outline-none transition-colors duration-150 ease-out ' +
'focus-visible:ring-2 focus-visible:ring-teal dt:py-1.5';
const CHIP_IDLE = 'border-line text-muted hover:border-teal hover:text-teal';
const CHIP_ON = 'border-teal text-teal';

/** "Before next shift" reads as a clause at the end of the request line. */
const lowerFirst = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

export function RestockFollowUp({ suggestedItems, request, onChange }: RestockFollowUpProps) {
  const added = request?.status === 'added';
  const [step, setStep] = useState<Step>(added ? 'done' : 'ask');
  // qty 0 means "not answered yet", which is what holds back the next step.
  const [items, setItems] = useState<RestockItem[]>(
    request?.items ?? suggestedItems.map((name) => ({ name, qty: 0 }))
  );
  const [otherFor, setOtherFor] = useState<string | null>(null);
  const [otherValue, setOtherValue] = useState('');

  if (request?.status === 'dismissed') return null;

  /** Fills in anything still unanswered, so a skipped step never blocks. */
  const settled = (list: RestockItem[]): RestockItem[] =>
  list.map((item) => item.qty > 0 ? item : { ...item, qty: RESTOCK_DEFAULT_QTY });

  const setQty = (name: string, qty: number) => {
    const next = items.map((item) => item.name === name ? { ...item, qty } : item);
    setItems(next);
    setOtherFor(null);
    setOtherValue('');
    // One question at a time: move on as soon as every item has an answer.
    if (next.every((item) => item.qty > 0)) setStep('urgency');
  };

  const finish = (urgency: RestockUrgency | null) => {
    const list = settled(items);
    setItems(list);
    setStep('done');
    onChange({ items: list, urgency, status: 'added' });
  };

  const dismiss = () =>
  onChange({ items: request?.items ?? [], urgency: request?.urgency ?? null, status: 'dismissed' });

  if (step === 'done' && request?.status === 'added') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="group/restock flex items-start gap-2 rounded-lg border border-line bg-raised/40 px-3 py-2">

        <span className="mt-0.5 shrink-0 rounded-md bg-raised px-1.5 py-0.5 text-label text-muted">
          restock request
        </span>
        <p className="min-w-0 flex-1 text-meta text-txt">
          {request.items.map((item) => `${item.name} ×${item.qty}`).join(', ')}
          {request.urgency &&
          <>
              <span className="px-1.5 text-faint">·</span>
              <span className="text-muted">{lowerFirst(request.urgency)}</span>
            </>
          }
        </p>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label="Edit restock request"
            onClick={() => {
              setItems(request.items.map((item) => ({ ...item })));
              setStep('quantities');
            }}
            className="rounded-md p-2 text-faint outline-none transition-[opacity,color] duration-150 ease-out hover:text-txt focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-teal dt:p-1 dt:opacity-0 dt:group-hover/restock:opacity-100">

            <PencilIcon size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Remove restock request"
            onClick={dismiss}
            className="rounded-md p-2 text-faint outline-none transition-[opacity,color] duration-150 ease-out hover:text-txt focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-teal dt:p-1 dt:opacity-0 dt:group-hover/restock:opacity-100">

            <XIcon size={14} strokeWidth={2} />
          </button>
        </div>
      </motion.div>);

  }

  return (
    <motion.aside
      aria-label="Suggestion"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-lg border border-line bg-raised/40 px-3.5 py-3">

      <p className="mb-2 flex items-center gap-1.5 text-label font-medium uppercase tracking-wide text-faint">
        <SparklesIcon size={13} strokeWidth={2} />
        Suggestion
      </p>

      {step === 'ask' &&
      <>
          <p className="text-body text-txt">Add a restock request?</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button type="button" onClick={() => setStep('quantities')} className={`${CHIP} ${CHIP_IDLE}`}>
              Yes
            </button>
            <button type="button" onClick={dismiss} className={`${CHIP} ${CHIP_IDLE}`}>
              Not now
            </button>
          </div>
        </>
      }

      {step === 'quantities' &&
      <>
          <p className="text-body text-txt">How many bottles?</p>
          <div className="mt-3 space-y-2">
            {items.map((item) =>
          <div key={item.name} className="flex flex-wrap items-center gap-1.5">
                <span className="w-24 shrink-0 truncate text-meta text-muted">{item.name}</span>
                {RESTOCK_QUANTITIES.map((qty) =>
            <button
              key={qty}
              type="button"
              aria-pressed={item.qty === qty}
              onClick={() => setQty(item.name, qty)}
              className={`${CHIP} ${item.qty === qty ? CHIP_ON : CHIP_IDLE}`}>

                    {qty}
                  </button>
            )}
                <button
              type="button"
              aria-pressed={otherFor === item.name}
              onClick={() => {
                setOtherFor(item.name);
                setOtherValue(item.qty > 0 ? String(item.qty) : '');
              }}
              className={`${CHIP} ${
              otherFor === item.name || item.qty > 0 && !RESTOCK_QUANTITIES.includes(item.qty) ?
              CHIP_ON :
              CHIP_IDLE}`
              }>

                  Other
                </button>
                {otherFor === item.name &&
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const qty = Number(otherValue);
                if (!Number.isFinite(qty) || qty <= 0) return;
                setQty(item.name, Math.round(qty));
              }}>

                    <label htmlFor={`restock-other-${item.name}`} className="sr-only">
                      How many {item.name}?
                    </label>
                    <input
                id={`restock-other-${item.name}`}
                autoFocus
                type="number"
                min={1}
                inputMode="numeric"
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                className="w-16 rounded-lg border border-line bg-card px-2 py-1.5 text-meta text-txt caret-teal outline-none transition-colors duration-150 ease-out placeholder:text-faint focus:border-teal" />

                  </form>
            }
              </div>
          )}
          </div>
        </>
      }

      {step === 'urgency' &&
      <>
          <p className="text-body text-txt">How soon?</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {RESTOCK_URGENCIES.map((urgency) =>
          <button
            key={urgency}
            type="button"
            aria-pressed={request?.urgency === urgency}
            onClick={() => finish(urgency)}
            className={`${CHIP} ${request?.urgency === urgency ? CHIP_ON : CHIP_IDLE}`}>

                {urgency}
              </button>
          )}
          </div>
        </>
      }

      {step !== 'ask' &&
      <div className="mt-3 flex justify-end">
          <button
          type="button"
          onClick={() => step === 'quantities' ? setStep('urgency') : finish(null)}
          className="rounded-md px-1.5 py-0.5 text-label text-faint outline-none transition-colors duration-150 ease-out hover:text-muted focus-visible:ring-2 focus-visible:ring-teal">

            Skip
          </button>
        </div>
      }
    </motion.aside>);

}
