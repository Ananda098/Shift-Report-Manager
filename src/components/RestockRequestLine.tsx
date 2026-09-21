import { motion } from 'framer-motion';
import { PencilIcon, XIcon } from 'lucide-react';
import { RestockRequest } from '../types/report';

interface RestockRequestLineProps {
  request: RestockRequest;
  /** Reopens the margin card on the quantities question. */
  onEdit: () => void;
  onRemove: () => void;
}

/** "Before next shift" reads as a clause at the end of the request line. */
const lowerFirst = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

/**
 * The answer to a restock suggestion, sitting under the statement it belongs
 * to. The question itself is asked in the margin (`RestockFollowUp`); this is
 * the part that stays in the report.
 */
export function RestockRequestLine({ request, onEdit, onRemove }: RestockRequestLineProps) {
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
          onClick={onEdit}
          className="rounded-md p-2 text-faint outline-none transition-[opacity,color] duration-150 ease-out hover:text-txt focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-teal dt:p-1 dt:opacity-0 dt:group-hover/restock:opacity-100">

          <PencilIcon size={14} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Remove restock request"
          onClick={onRemove}
          className="rounded-md p-2 text-faint outline-none transition-[opacity,color] duration-150 ease-out hover:text-txt focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-teal dt:p-1 dt:opacity-0 dt:group-hover/restock:opacity-100">

          <XIcon size={14} strokeWidth={2} />
        </button>
      </div>
    </motion.div>);

}
