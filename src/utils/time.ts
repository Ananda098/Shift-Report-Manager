/** Sorts across the night, where hours before midday belong to the following morning. */
export function nightOrder(time: string): number {
  const [h, m] = time.replace('~', '').split(':').map(Number);
  return (h < 12 ? h + 24 : h) * 60 + m;
}