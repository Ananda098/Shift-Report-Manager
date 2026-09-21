/** Sorts across the night, where hours before midday belong to the following morning. */
export function nightOrder(time: string): number {
  const [h, m] = time.replace('~', '').split(':').map(Number);
  return (h < 12 ? h + 24 : h) * 60 + m;
}

/** A plausible, increasing clock time for the Nth note pushed this shift (demo-only). */
export function noteTimeForIndex(index: number): string {
  const minutes = (72 + index * 23) % (24 * 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}