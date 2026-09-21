import { useState } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
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
  /** Reopened from an answered request line — skip the opening question. */
  editing?: boolean;
  onChange: (request: RestockRequest) => void;
}

/** Which question the card is on. The answered request lives on the statement,
    not here, so the card is gone as soon as it has one. */
type Step = 'ask' | 'quantities' | 'urgency';

const CHIP =
'rounded-lg border px-2.5 py-2.5 text-meta outline-none transition-colors duration-150 ease-out ' +
'focus-visible:ring-2 focus-visible:ring-teal dt:py-1.5';
const CHIP_IDLE = 'border-line text-muted hover:border-teal hover:text-teal';
const CHIP_ON = 'border-teal text-teal';

/** The quiet Back / Skip pair along the bottom of the card. */
const FOOT_BUTTON =
'rounded-md px-1.5 py-0.5 text-label text-faint outline-none transition-colors duration-150 ease-out ' +
'hover:text-muted focus-visible:ring-2 focus-visible:ring-teal';

export function RestockFollowUp({
  suggestedItems,
  request,
  editing = false,
  onChange
}: RestockFollowUpProps) {
  const [step, setStep] = useState<Step>(editing ? 'quantities' : 'ask');
  // qty 0 means "not answered yet", which is what holds back the next step.
  const [items, setItems] = useState<RestockItem[]>(
    request?.items.map((item) => ({ ...item })) ??
    suggestedItems.map((name) => ({ name, qty: 0 }))
  );
  const [otherFor, setOtherFor] = useState<string | null>(null);
  const [otherValue, setOtherValue] = useState('');
  const [leaving, setLeaving] = useState(false);

  /** Fades the card out before the answer takes it off the rail, like InlineAIHelp. */
  const resolve = (action: () => void) => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(action, 200);
  };

  /** Fills in anything still unanswered, so a skipped step never blocks. */
  const settled = (list: RestockItem[]): RestockItem[] =>
  list.map((item) => item.qty > 0 ? item : { ...item, qty: RESTOCK_DEFAULT_QTY });

  const setQty = (name: string, qty: number) => {
    const wasIncomplete = items.some((item) => item.qty === 0);
    const next = items.map((item) => item.name === name ? { ...item, qty } : item);
    setItems(next);
    setOtherFor(null);
    setOtherValue('');
    // One question at a time: move on as the last blank is filled — but not
    // when the manager has stepped back to change an answer already given.
    if (wasIncomplete && next.every((item) => item.qty > 0)) setStep('urgency');
  };

  const finish = (urgency: RestockUrgency | null) => {
    const list = settled(items);
    setItems(list);
    resolve(() => onChange({ items: list, urgency, status: 'added' }));
  };

  const dismiss = () =>
  resolve(() =>
  onChange({ items: request?.items ?? [], urgency: request?.urgency ?? null, status: 'dismissed' })
  );

  // A card reopened to change an existing request starts on the quantities,
  // so there is no opening question behind them to go back to.
  const back =
  step === 'urgency' ?
  () => setStep('quantities') :
  step === 'quantities' && !editing ?
  () => setStep('ask') :
  null;

  return (
    <motion.aside
      aria-label="Suggestion"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: leaving ? 0 : 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-xl border border-line bg-card p-4">

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
          <div className="mt-3 space-y-3">
            {items.map((item) =>
          <div key={item.name}>
                {/* One item needs no naming — the question above already asks
                    about it. Several, and each row says which it answers. */}
                {items.length > 1 &&
            <p className="mb-1.5 text-meta text-muted">{item.name}</p>
            }
                <div className="flex flex-wrap items-center gap-1.5">
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
                className="w-16 rounded-lg border border-line bg-raised px-2 py-1.5 text-meta text-txt caret-teal outline-none transition-colors duration-150 ease-out placeholder:text-faint focus:border-teal" />

                  </form>
            }
                </div>
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
      <div className="mt-3 flex items-center justify-between gap-2">
          {back ?
        <button type="button" onClick={back} className={FOOT_BUTTON}>
              Back
            </button> :

        <span />
        }
          <button
          type="button"
          onClick={() =>
          step === 'quantities' ? setStep('urgency') : finish(request?.urgency ?? null)
          }
          className={FOOT_BUTTON}>

            {/* Nothing left to skip once every item has a number — from here
                the button is just the way on to the last question. */}
            {step === 'quantities' && items.every((item) => item.qty > 0) ? 'Next' : 'Skip'}
          </button>
        </div>
      }
    </motion.aside>);

}
