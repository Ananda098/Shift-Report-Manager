import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, ImageIcon, FileTextIcon, PlusIcon, ClockIcon } from 'lucide-react';
import { Evidence } from '../types/report';

const THUMBNAILS: Record<string, string> = {
  video: "/348da33a-29fa-41e0-93bf-7fdb950fe5a9.jpg",
  photo: "/23ea42fb-bea5-4b71-b842-9c51e33ecb25.jpg"
};

const TILE = 'relative h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-card';

interface EvidenceSectionProps {
  evidence: Evidence[];
  highlightId: string | null;
  onAdd: (name: string) => void;
  /** Marks evidence as a missing requirement. */
  error?: boolean;
}

function TileCaption({ item, highlighted }: {item: Evidence;highlighted: boolean;}) {
  const Icon =
  item.kind === 'video' ?
  PlayIcon :
  item.kind === 'document' ?
  FileTextIcon :
  item.kind === 'request' ?
  ClockIcon :
  ImageIcon;

  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-1.5 pb-1.5 pt-5">
      <p
        className={[
        'flex items-center gap-1 text-[11px] leading-4 transition-colors duration-300 ease-out',
        highlighted ? 'text-teal' : 'text-txt'].
        join(' ')}
        title={item.name}>
        
        <Icon size={11} strokeWidth={2} className="shrink-0 opacity-70" />
        <span className="truncate">{item.name}</span>
      </p>
    </div>);

}

export function EvidenceSection({
  evidence,
  highlightId,
  onAdd,
  error = false
}: EvidenceSectionProps) {
  const [uploading, setUploading] = useState(false);

  const startUpload = () => {
    if (uploading) return;
    setUploading(true);
    window.setTimeout(() => {
      setUploading(false);
      onAdd('photo_new.jpg');
    }, 1500);
  };

  return (
    <section id="review-evidence" aria-labelledby="review-evidence-title" className="mt-8">
      <h2 id="review-evidence-title" className="text-section font-semibold text-txt">
        Evidence
      </h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {evidence.map((item) => {
          const thumbnail = THUMBNAILS[item.kind];
          return (
            <div key={item.id} className={TILE}>
              {thumbnail ?
              <img
                src={thumbnail}
                alt=""
                className="absolute inset-0 h-full w-full object-cover" /> :


              <div className="absolute inset-0 flex items-center justify-center bg-raised">
                  {item.kind === 'document' ?
                <FileTextIcon size={22} strokeWidth={1.75} className="text-faint" /> :

                <ClockIcon size={22} strokeWidth={1.75} className="text-faint" />
                }
                </div>
              }

              {item.kind === 'video' &&
              <>
                  <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-txt">
                    <PlayIcon size={14} strokeWidth={2.5} />
                  </span>
                  {item.duration &&
                <span className="absolute right-1.5 top-1.5 rounded bg-black/65 px-1 py-0.5 text-[11px] leading-4 text-txt">
                      {item.duration}
                    </span>
                }
                </>
              }

              {item.kind === 'request' && item.status &&
              <span className="absolute right-1.5 top-1.5 rounded bg-black/65 px-1 py-0.5 text-[11px] leading-4 text-muted">
                  {item.status}
                </span>
              }

              <TileCaption item={item} highlighted={highlightId === item.id} />
            </div>);

        })}

        {uploading ?
        <div className={TILE}>
            <div className="absolute inset-0 flex items-center justify-center bg-raised">
              <ImageIcon size={22} strokeWidth={1.75} className="text-faint" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-1.5 pb-1.5 pt-5">
              <p className="text-[11px] leading-4 text-muted">Uploading…</p>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-line">
                <motion.div
                initial={{ width: '5%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.4, ease: 'linear' }}
                className="h-full bg-teal" />
              
              </div>
            </div>
          </div> :

        <button
          type="button"
          id="field-evidence"
          onClick={startUpload}
          className={[
          'flex h-32 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-faint outline-none transition-colors duration-150 ease-out hover:border-teal hover:text-teal focus-visible:ring-2 focus-visible:ring-teal',
          error ? 'border-tier-t3' : 'border-line'].
          join(' ')}>
          
            <PlusIcon size={18} strokeWidth={2} />
            <span className="text-label">Add</span>
          </button>
        }
      </div>
    </section>);

}