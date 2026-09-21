import { useEffect, useRef, useState } from 'react';
import { SendIcon } from 'lucide-react';

interface ReportHeaderProps {
  hasUnreviewed: boolean;
  /** Something on top of the page owns the primary action right now. */
  demoted?: boolean;
}

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const overflowY = window.getComputedStyle(node).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
}

export function ReportHeader({ hasUnreviewed, demoted = false }: ReportHeaderProps) {
  const secondary = hasUnreviewed || demoted;
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scroller = findScrollParent(headerRef.current);
    if (!scroller) return;
    const onScroll = () => setScrolled(scroller.scrollTop > 0);
    onScroll();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={[
      'sticky top-0 z-20 -mx-4 -mt-6 mb-5 border-b bg-base px-4 pb-4 pt-6 dt:-mx-10 dt:-mt-9 dt:mb-6 dt:px-10 dt:pt-9',
      'transition-colors duration-150 ease-out',
      scrolled ? 'border-line' : 'border-transparent'].
      join(' ')}>
      
      <p className="mb-5 text-meta text-faint">
        <span className="transition-colors duration-150 hover:text-muted">Reports</span>
        <span className="px-1.5 text-line">/</span>
        <span className="text-muted">Sat 20 Sep</span>
      </p>
      <div className="flex items-start justify-between gap-3 dt:gap-6">
        <div>
          <h1 className="text-title font-semibold text-txt">Report</h1>
          <p className="mt-1 text-meta text-muted">Sat 20 Sep · Club Neon</p>
        </div>
        <button
          type="button"
          className={[
          'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-meta font-medium outline-none',
          'transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-base',
          secondary ?
          'border border-line text-muted hover:border-faint hover:text-txt' :
          'bg-teal text-teal-ink hover:bg-teal-hi'].
          join(' ')}>
          
          <SendIcon size={15} strokeWidth={2} />
          Send report
        </button>
      </div>
    </header>);

}