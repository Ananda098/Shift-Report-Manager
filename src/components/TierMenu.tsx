import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { Tier } from '../types/report';
import { TierBadge } from './TierBadge';

const TIERS: {tier: Tier;description: string;}[] = [
{ tier: 'T1', description: 'Logged only — refusals and minor notes.' },
{ tier: 'T2', description: 'Needs follow-up — theft, injury, ejection.' },
{ tier: 'T3', description: 'Serious — violence, medical, police involved.' }];


interface TierMenuProps {
  tier: Tier;
  onChange: (tier: Tier) => void;
}

export function TierMenu({ tier, onChange }: TierMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

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
        className="inline-flex items-center gap-1 rounded-md outline-none transition-opacity duration-150 ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:ring-teal">
        
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
          className="absolute left-0 top-full z-30 mt-1.5 w-[268px] overflow-hidden rounded-xl border border-line bg-raised p-1 shadow-xl">
          
            {TIERS.map((option) =>
          <li key={option.tier} role="none">
                <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                if (option.tier !== tier) onChange(option.tier);
              }}
              className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left outline-none transition-colors duration-150 ease-out hover:bg-card focus-visible:ring-2 focus-visible:ring-teal">
              
                  <TierBadge tier={option.tier} />
                  <span className="pt-0.5 text-label text-muted">{option.description}</span>
                </button>
              </li>
          )}
          </motion.ul>
        }
      </AnimatePresence>
    </div>);

}