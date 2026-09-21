const RULES: {pattern: RegExp;chip: string;}[] = [
{ pattern: /\b(door|entrance)\b/i, chip: 'door staff' },
{ pattern: /\bbar\b/i, chip: 'bar staff' },
{ pattern: /\b(sound|light|lights|stage|dj)\b/i, chip: 'production' },
{ pattern: /\bsecurity\b/i, chip: 'security' }];


/** Picks a category chip for text the manager typed themselves. */
export function categoryForText(text: string): string {
  return RULES.find((rule) => rule.pattern.test(text))?.chip ?? 'crew';
}