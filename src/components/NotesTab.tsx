import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GhostPrompt } from './GhostPrompt';
import { RecordButton } from './RecordButton';
import { getCaretCoordinates, measureTextWidth } from '../utils/caretCoordinates';

const PLACEHOLDER =
'What happened tonight? Start anywhere — the crowd, the crew, anything that went wrong. Type or hit Record and just talk.';

const GHOST_PROMPTS = [
'Crowd tonight?',
'Anything concerning?',
'How did the crew do?',
'Anything we need?'];


const TRANSCRIPT = 'Door was slow around one, Tomek had to help out.';

const PAUSE_MS = 1750;
const WORD_MS = 90;
const HIGHLIGHT_MS = 1500;

interface Ghost {
  text: string;
  left: number;
  top: number;
}

interface NotesTabProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesTab({ value, onChange }: NotesTabProps) {
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [recording, setRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const [highlightStart, setHighlightStart] = useState<number | null>(null);
  const [highlightFading, setHighlightFading] = useState(false);

  const promptIndex = useRef(0);
  const pauseTimer = useRef<number | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const clearPause = useCallback(() => {
    if (pauseTimer.current) window.clearTimeout(pauseTimer.current);
    pauseTimer.current = undefined;
  }, []);

  const schedulePrompt = useCallback(
    (text: string) => {
      clearPause();
      if (!text.trim() || promptIndex.current >= GHOST_PROMPTS.length) return;
      pauseTimer.current = window.setTimeout(() => {
        const el = textareaRef.current;
        if (!el) return;
        const prompt = GHOST_PROMPTS[promptIndex.current];
        const caret = getCaretCoordinates(el, el.selectionStart);
        // Sit inline, just after the caret — unless the line has no room left.
        const width = measureTextWidth(prompt, el);
        const fitsOnLine = caret.left + 4 + width <= el.clientWidth;
        setGhost({
          text: prompt,
          left: fitsOnLine ? caret.left + 4 : 0,
          top: fitsOnLine ? caret.top : caret.top + caret.height
        });
        promptIndex.current += 1;
      }, PAUSE_MS);
    },
    [clearPause]
  );

  useEffect(() => () => clearPause(), [clearPause]);

  // Keep the editor sized to its content so the document flows from the top.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value, typing]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let next = e.target.value;
    // Typing "- " at the start of a line becomes a bullet.
    const caret = e.target.selectionStart;
    const lineStart = next.lastIndexOf('\n', caret - 1) + 1;
    if (next.slice(lineStart, caret) === '- ') {
      next = `${next.slice(0, lineStart)}• ${next.slice(caret)}`;
    }
    setGhost(null);
    onChange(next);
    schedulePrompt(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      clearPause();
      setGhost(null);
      return;
    }
    if (e.key !== 'Enter' || e.shiftKey) return;
    const el = e.currentTarget;
    const caret = el.selectionStart;
    const lineStart = value.lastIndexOf('\n', caret - 1) + 1;
    const line = value.slice(lineStart, caret);
    if (!line.startsWith('• ')) return;
    e.preventDefault();
    const next =
    line.trim() === '•' ?
    `${value.slice(0, lineStart)}\n${value.slice(caret)}` :
    `${value.slice(0, caret)}\n• ${value.slice(caret)}`;
    const nextCaret = line.trim() === '•' ? lineStart + 1 : caret + 3;
    setGhost(null);
    onChange(next);
    schedulePrompt(next);
    window.requestAnimationFrame(() => {
      el.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleStop = () => {
    setRecording(false);
    clearPause();
    setGhost(null);

    const trimmed = value.replace(/\s+$/, '');
    const base = trimmed.length ? `${trimmed}\n\n` : '';
    setHighlightStart(base.length);
    setTyping(true);

    const words = TRANSCRIPT.split(' ');
    let i = 0;
    const tick = () => {
      i += 1;
      onChange(base + words.slice(0, i).join(' '));
      if (i < words.length) {
        window.setTimeout(tick, WORD_MS);
        return;
      }
      setTyping(false);
      window.setTimeout(() => {
        setHighlightFading(true);
        window.setTimeout(() => {
          setHighlightStart(null);
          setHighlightFading(false);
        }, 320);
      }, HIGHLIGHT_MS);
    };
    window.setTimeout(tick, WORD_MS);
  };

  const showTranscriptView = typing || highlightStart !== null;

  return (
    <div className="flex h-[460px] flex-col overflow-hidden rounded-xl border border-line bg-card">
      <div className="scroll-slim flex-1 overflow-y-auto px-5 py-4">
        {showTranscriptView ?
        <p className="whitespace-pre-wrap break-words text-body text-txt">
            {value.slice(0, highlightStart ?? 0)}
            <span
            className={[
            'transition-colors duration-300 ease-out',
            highlightFading ? 'text-txt' : 'text-teal'].
            join(' ')}>
            
              {value.slice(highlightStart ?? 0)}
            </span>
          </p> :

        <div className="relative">
            <label htmlFor="shift-notes" className="sr-only">
              Shift notes
            </label>
            <textarea
            id="shift-notes"
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={clearPause}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className="block w-full resize-none overflow-hidden bg-transparent text-body text-txt outline-none placeholder:text-faint" />
          
            {ghost &&
          <GhostPrompt
            text={ghost.text}
            left={ghost.left}
            top={ghost.top}
            onDismiss={() => setGhost(null)} />

          }
          </div>
        }
      </div>

      <div className="flex items-center justify-end border-t border-line px-4 py-3">
        <RecordButton
          recording={recording}
          disabled={typing}
          onStart={() => {
            clearPause();
            setGhost(null);
            setRecording(true);
          }}
          onStop={handleStop} />
        
      </div>
    </div>);

}