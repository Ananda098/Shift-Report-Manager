import { StatementSection } from '../types/report';
import { people } from './people';

/**
 * Section metadata (id/title) seeds the report's empty sections; the
 * statements here are never shown directly — they're the mocked AI's
 * knowledge base (see utils/mockAi.ts), matched against the manager's
 * notes so the demo produces the same tagged output every time.
 */
export const statementSections: StatementSection[] = [
{
  id: 'crowd',
  title: 'Crowd',
  statements: [
  {
    id: 's-crowd-1',
    chips: ['audience', 'experience'],
    text: 'Busy from eleven, mostly regulars and a birthday group of about twenty in the back room.',
    source: {
      quote:
      'It was mostly regulars tonight, and there was a birthday group, maybe twenty of them, in the back room from eleven.',
      person: people.tomek,
      time: '01:12',
      input: 'Voice'
    }
  },
  {
    id: 's-crowd-2',
    chips: ['experience'],
    text: 'Dance floor stayed full until close, with no real lulls after midnight.',
    source: {
      quote: 'Floor never emptied out after midnight — full right through to lights up.',
      person: people.marta,
      time: '02:05',
      input: 'Note'
    }
  },
  {
    id: 's-crowd-3',
    chips: ['private events'],
    text: 'The private booking in the mezzanine wrapped early and left around one.',
    source: {
      quote: 'Mezzanine party finished ahead of schedule, all of them out by about one.',
      person: people.ines,
      time: '01:20',
      input: 'Team app'
    }
  }]

},
{
  id: 'safety',
  title: 'Safety concerns',
  statements: [
  {
    id: 's-concern-1',
    chips: ['security'],
    text: 'Door queue backed up around one — we were a body short until Tomek stepped in.',
    source: {
      quote: 'Door was slow around one, Tomek had to help out.',
      person: people.tomek,
      time: '01:12',
      input: 'Voice'
    }
  },
  {
    id: 's-concern-2',
    chips: ['maintenance'],
    text: 'The second toilet block flooded again and was roped off just after two.',
    source: {
      quote: 'Toilets by the stairs flooded again. Roped it off at ten past two.',
      person: people.karl,
      time: '02:18',
      input: 'Team app'
    }
  },
  {
    id: 's-concern-3',
    chips: ['security', 'maintenance'],
    text: 'The camera over the back stairwell has been offline all week.',
    source: {
      quote: 'Back stairwell camera is still dead — that is the fourth night now.',
      person: people.marta,
      time: '00:40',
      input: 'Note'
    }
  }]

},
{
  id: 'staff',
  title: 'Staff',
  statements: []
},
{
  id: 'supplies',
  title: 'Supplies and repairs',
  statements: [
  {
    id: 's-needs-1',
    chips: ['inventory'],
    text: 'House tequila ran out by half one; bar 2 poured the backup bottles.',
    source: {
      quote: 'We killed the house tequila around half one and switched to the backup.',
      person: people.sofia,
      time: '01:35',
      input: 'Voice'
    }
  },
  {
    id: 's-needs-3',
    chips: ['inventory'],
    text: 'Vodka and Jägermeister are both down to the last bottles behind bar 1.',
    source: {
      quote: 'We are nearly out of vodka and Jägermeister behind bar 1, last bottles now.',
      person: people.sofia,
      time: '02:40',
      input: 'Voice'
    }
  },
  {
    id: 's-needs-2',
    chips: ['kitchen', 'equipment'],
    text: 'Kitchen needs another set of tongs and a replacement basket for the small fryer.',
    source: {
      quote: 'Order tongs and a new small fryer basket, the old one is bent.',
      person: people.karl,
      time: '03:10',
      input: 'Team app'
    }
  }]

}];