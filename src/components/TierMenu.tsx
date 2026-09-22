import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { Tier } from '../types/report';
import { TierBadge } from './TierBadge';

const TIERS: {tier: Tier;description: string;}[] = [
{ tier: 'T1', description: 'Logged only — refusals, minor notes' },
{ tier: 'T2', description: 'Needs follow-up — theft, injury, ejection' },
{ tier: 'T3', description: 'Violence, medical, police involved' }];


/** Right edge of the nearest ancestor that would clip the menu — the drawer's
    scroll area, usually — or the viewport when nothing else clips. */
function clipRightEdge(el: HTMLElement): number {
  let node = el.parentElement;
  while (node) {
    const { overflowX, overflowY } = window.getComputedStyle(node);
    if (overflowX !== 'visible' || overflowY !== 'visible') {
      return node.getBoundingClientRect().right;
    }
    node = node.parentElement;
  }
  return window.innerWidth;
}

/** Roomy where there is room — in the 440px drawer the menu takes what is
    left beside the label column instead of running off the edge. */
const MENU_MAX = 400;
const MENU_MIN = 220;
const MENU_GUTTER = 12;

interface TierMenuProps {
  tier: Tier;
  onChange: (tier: Tier) => void;
}

export function TierMenu({ tier, onChange }: TierMenuProps) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(MENU_MAX);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Measured as it opens: the menu hangs off the badge, so how much room is
  // left depends on where the badge sits inside whatever is holding it.
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!open || !wrap) return;
    const room = clipRightEdge(wrap) - wrap.getBoundingClientRect().left - MENU_GUTTER;
    setWidth(Math.max(MENU_MIN, Math.min(MENU_MAX, room)));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md py-1.5 outline-none transition-opacity duration-150 ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:ring-teal dt:py-0">
        
        <TierBadge tier={tier} />
        <ChevronDownIcon size={13} strokeWidth={2} className="text-faint" />
      </button>

      <AnimatePresence>
        {open &&
        <motion.ul
          role="menu"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          style={{ width }}
          className="absolute left-0 top-full z-30 mt-1.5 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-raised p-1 shadow-xl">

            {TIERS.map((option) =>
          <li key={option.tier} role="none">
                <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                if (option.tier !== tier) onChange(option.tier);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left outline-none transition-colors duration-150 ease-out hover:bg-card focus-visible:ring-2 focus-visible:ring-teal">

                  <span className="w-24 shrink-0">
                    <TierBadge tier={option.tier} />
                  </span>
                  <span className="min-w-0 text-label text-muted">{option.description}</span>
                </button>
              </li>
          )}
          </motion.ul>
        }
      </AnimatePresence>
    </div>);

}