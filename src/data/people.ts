import { Person } from '../types/report';

export const people: Record<string, Person> = {
  tomek: { id: 'tomek', name: 'Tomek Rybak', role: 'Door', initials: 'TR', avatarUrl: 'https://i.pravatar.cc/64?u=tomek-rybak' },
  marta: { id: 'marta', name: 'Marta Vella', role: 'Floor', initials: 'MV' },
  sofia: { id: 'sofia', name: 'Sofia Lange', role: 'Bar', initials: 'SL', avatarUrl: 'https://i.pravatar.cc/64?u=sofia-lange' },
  karl: { id: 'karl', name: 'Karl Bergmann', role: 'Maintenance', initials: 'KB' },
  ines: { id: 'ines', name: 'Inès Dupont', role: 'Events', initials: 'ID', avatarUrl: 'https://i.pravatar.cc/64?u=ines-dupont' },
  zosia: { id: 'zosia', name: 'Zosia Nowak', role: 'Bar', initials: 'ZN', avatarUrl: 'https://i.pravatar.cc/64?u=zosia-nowak' },
  kuba: { id: 'kuba', name: 'Kuba Wierzba', role: 'Door', initials: 'KW', avatarUrl: 'https://i.pravatar.cc/64?u=kuba-wierzba' },
  ola: { id: 'ola', name: 'Ola Kamińska', role: 'Floor', initials: 'OK', avatarUrl: 'https://i.pravatar.cc/64?u=ola-kaminska' },
  you: { id: 'you', name: 'You', role: 'Closing manager', initials: 'YO' }
};