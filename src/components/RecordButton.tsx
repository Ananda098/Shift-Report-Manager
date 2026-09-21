import { useEffect, useState } from 'react';
import { MicIcon } from 'lucide-react';

interface RecordButtonProps {
  recording: boolean;
  disabled?: boolean;
  /** Steps back to an unfilled button when something else on the row owns
      the primary slot. Same box either way, so nothing shifts. */
  secondary?: boolean;
  onStart: () => void;
  onStop: () => void;
}

function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function RecordButton({ recording, disabled, secondary, onStart, onStop }: RecordButtonProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!recording) {
      setElapsed(0);
      return;
    }
    const id = window.setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  if (recording) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-10 items-center gap-2 rounded-lg border border-line bg-raised px-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tier-t3 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-tier-t3" />
          </span>
          <span className="font-mono text-meta tabular-nums text-muted">{format(elapsed)}</span>
        </div>
        <button
          type="button"
          onClick={onStop}
          className="inline-flex h-10 items-center rounded-lg bg-teal-fill px-4 text-meta font-medium text-teal outline-none transition-colors duration-150 ease-out hover:bg-teal-fill/70 focus-visible:ring-2 focus-visible:ring-teal">
          
          Stop
        </button>
      </div>);

  }

  return (
    <button
      type="button"
      onClick={onStart}
      disabled={disabled}
      className={[
      'inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-meta font-medium text-teal outline-none',
      'transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-40',
      secondary ? 'hover:bg-teal-fill' : 'bg-teal-fill hover:bg-teal-fill/70'].
      join(' ')}>
      
      <MicIcon size={17} strokeWidth={2} />
      Record
    </button>);

}