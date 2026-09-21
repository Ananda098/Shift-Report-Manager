import { Person } from '../types/report';

export const people: Record<string, Person> = {
  tomek: { id: 'tomek', name: 'Tomek Rybak', role: 'Door', initials: 'TR' },
  marta: { id: 'marta', name: 'Marta Vella', role: 'Floor', initials: 'MV' },
  sofia: { id: 'sofia', name: 'Sofia Lange', role: 'Bar', initials: 'SL' },
  karl: { id: 'karl', name: 'Karl Bergmann', role: 'Maintenance', initials: 'KB' },
  ines: { id: 'ines', name: 'Inès Dupont', role: 'Events', initials: 'ID' },
  zosia: { id: 'zosia', name: 'Zosia Nowak', role: 'Bar', initials: 'ZN' },
  kuba: { id: 'kuba', name: 'Kuba Wierzba', role: 'Door', initials: 'KW' },
  ola: { id: 'ola', name: 'Ola Kamińska', role: 'Floor', initials: 'OK' },
  you: { id: 'you', name: 'You', role: 'Closing manager', initials: 'YO' }
};