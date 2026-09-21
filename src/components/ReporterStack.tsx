import { Person } from '../types/report';
import { Avatar } from './Avatar';

export function ReporterStack({ people, current }: {people: Person[];current: boolean;}) {
  const shown = people.slice(0, 2);
  const extra = people.length - shown.length;
  const avatarSurface = current ? 'bg-card ring-2 ring-raised' : 'bg-raised ring-2 ring-card';

  return (
    <span className="flex shrink-0 items-center -space-x-2">
      {shown.map((person) =>
      <span key={person.id} className="group/avatar relative">
          <Avatar person={person} className={`h-6 w-6 text-[10px] ${avatarSurface}`} />
          <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-raised px-2 py-1 text-label text-txt opacity-0 shadow-lg transition-opacity duration-150 ease-out group-hover/avatar:opacity-100">
            {person.name}
          </span>
        </span>
      )}
      {extra > 0 &&
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-faint ${avatarSurface}`}>
          +{extra}
        </span>
      }
    </span>);

}
