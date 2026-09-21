import React, { useEffect, useState } from 'react';

interface HighlightTextProps {
  active: boolean;
  children: React.ReactNode;
}

/** Briefly tints newly added text teal, then fades it back to body colour. */
export function HighlightText({ active, children }: HighlightTextProps) {
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    if (!active) return;
    setFaded(false);
    const id = window.setTimeout(() => setFaded(true), 1500);
    return () => window.clearTimeout(id);
  }, [active]);

  return (
    <span
      className={[
      'transition-colors duration-300 ease-out',
      active && !faded ? 'text-teal' : ''].
      join(' ')}>
      
      {children}
    </span>);

}