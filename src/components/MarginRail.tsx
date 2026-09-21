import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface MarginRailItem {
  /** Unique key for the card. Defaults to anchorId. */
  id?: string;
  /** DOM id of the element in the document this card is anchored to. */
  anchorId: string;
  element: React.ReactNode;
}

interface MarginRailProps {
  items: MarginRailItem[];
  /** Vertical gap kept between stacked cards, in px. */
  gap?: number;
  /** Below this viewport width, cards render as a plain stacked list instead of docs-style anchored positions. */
  breakpoint?: number;
}

/** Tracks whether the viewport is at least `breakpointPx` wide. */
function useIsWide(breakpointPx: number): boolean {
  const [wide, setWide] = useState(() => window.innerWidth >= breakpointPx);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const handler = () => setWide(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpointPx]);

  return wide;
}

/**
 * A Google Docs style comment margin: every card lines up with the top of the
 * element it is anchored to, and cards that would overlap are pushed down.
 * Below `breakpoint`, there's no room beside the content for this, so cards
 * fall back to a plain stacked list.
 */
export function MarginRail({ items, gap = 8, breakpoint = 680 }: MarginRailProps) {
  const wide = useIsWide(breakpoint);
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [tops, setTops] = useState<Record<string, number>>({});

  const keyed = items.map((item) => ({ ...item, key: item.id ?? item.anchorId }));

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const railTop = rail.getBoundingClientRect().top;

    const measured = keyed.
    map((item) => {
      const anchor = document.getElementById(item.anchorId);
      const card = cardRefs.current[item.key];
      return {
        key: item.key,
        desired: anchor ? anchor.getBoundingClientRect().top - railTop : 0,
        height: card ? card.offsetHeight : 0
      };
    }).
    sort((a, b) => a.desired - b.desired);

    const next: Record<string, number> = {};
    let cursor = Number.NEGATIVE_INFINITY;
    measured.forEach((m) => {
      const top = Math.max(m.desired, cursor);
      next[m.key] = top;
      cursor = top + m.height + gap;
    });

    setTops((prev) => {
      const keys = Object.keys(next);
      const same =
      keys.length === Object.keys(prev).length &&
      keys.every((k) => Math.abs((prev[k] ?? Number.NaN) - next[k]) < 0.5);
      return same ? prev : next;
    });
  }, [keyed, gap]);

  const measureRef = useRef(measure);
  measureRef.current = measure;

  // Re-measure after every render, and whenever an anchor or card changes size.
  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(() => measureRef.current());
    if (railRef.current) observer.observe(railRef.current);
    keyed.forEach((item) => {
      const anchor = document.getElementById(item.anchorId);
      if (anchor) observer.observe(anchor);
      const card = cardRefs.current[item.key];
      if (card) observer.observe(card);
    });
    return () => observer.disconnect();
  });

  useEffect(() => {
    const onResize = () => measureRef.current();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!wide) {
    return (
      <div className="space-y-3">
        {keyed.map((item) => <div key={item.key}>{item.element}</div>)}
      </div>);

  }

  return (
    <div ref={railRef} className="relative h-full w-full">
      {keyed.map((item) =>
      <div
        key={item.key}
        ref={(el) => {
          cardRefs.current[item.key] = el;
        }}
        style={{ top: tops[item.key] ?? 0 }}
        className={[
        'absolute left-2 right-6 transition-[top] duration-200 ease-out',
        tops[item.key] === undefined ? 'invisible' : ''].
        join(' ')}>
        
          {item.element}
        </div>
      )}
    </div>);

}