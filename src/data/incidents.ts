import { DetailRow, ReviewIncident } from '../types/report';
import { people } from './people';

function rows(time: string, location: string, parties: string[]): DetailRow[] {
  return [
  { id: 'time', label: 'Time', values: [time] },
  { id: 'location', label: 'Location', values: [location] },
  { id: 'parties', label: 'Parties', values: parties }];

}

/**
 * The single source of truth for tonight's incidents. Both the report and the
 * review view read from one piece of state seeded with this list.
 */
export const incidents: ReviewIncident[] = [
{
  id: 'i-1',
  tier: 'T1',
  type: 'Entry refusal',
  date: 'Sat 20',
  time: '22:10',
  location: 'Entrance',
  status: 'pending',
  reportedBy: [people.kuba, people.tomek],
  description:
  'A guest was turned away at the first door check for visible intoxication. He left with his group without any argument.',
  summary:
  'A guest was turned away at the first door check for visible intoxication. He left with his group without any argument.',
  evidence: [],
  details: rows('22:10', 'Entrance, outer door', ['Unnamed male guest, 20s, refused']),
  history: [
  {
    id: 'h-1-1',
    kind: 'report',
    person: people.kuba,
    role: 'Door',
    input: 'Team app',
    time: '22:12',
    text: 'Turned one away at the front, he was already far gone before he got to me. His mates tried to vouch for him but he could not stand straight on his own. No fuss about it in the end and they walked him off down the street. I told them to try again another night when he has slept it off.'
  },
  {
    id: 'h-1-2',
    kind: 'report',
    person: people.tomek,
    role: 'Security',
    input: 'Note',
    time: '22:20',
    text: 'Watched the whole thing from the inner door in case it turned. Kuba handled it on his own and nobody raised their voice. The group did not come back around the block. Nothing further needed from security.'
  }]

},
{
  id: 'i-2',
  tier: 'T1',
  type: 'Entry refusal',
  date: 'Sat 20',
  time: '22:45',
  location: 'Entrance',
  status: 'pending',
  reportedBy: [people.kuba],
  description:
  'A guest presented an ID that did not match the person holding it. The document was photographed and handed back, and she left on her own.',
  summary:
  'A guest presented an ID that did not match the person holding it. The document was photographed and handed back, and she left on her own.',
  evidence: [],
  details: rows('22:45', 'Entrance, ID check', ['Unnamed female guest, 20s, refused']),
  history: [
  {
    id: 'h-2-1',
    kind: 'report',
    person: people.kuba,
    role: 'Door',
    input: 'Voice',
    duration: '18s',
    time: '22:47',
    text: 'The ID was not hers, the photo was nothing like her and the birth year did not match what she told me at the desk. I asked her twice and she changed her answer both times. Took a picture of the card for the log and handed it straight back. She left without arguing once I said we keep a copy. Nobody else in her group tried it after that.'
  }]

},
{
  id: 'i-3',
  tier: 'T2',
  type: 'Theft / property',
  date: 'Sat 20',
  time: '23:40',
  location: 'Bar 2',
  status: 'pending',
  reportedBy: [people.zosia, people.ola],
  description:
  'A guest reported her phone taken from the bar top while she was ordering. Staff searched the area and checked lost property with no result.',
  summary:
  'A guest reported her phone taken from the bar top while she was ordering. Staff searched the area and checked lost property with no result.',
  evidence: [
  { id: 'e-3-1', kind: 'video', name: 'CCTV_bar2_2338.mp4', duration: '0:42' },
  { id: 'e-3-2', kind: 'photo', name: 'photo_bartop.jpg' }],

  details: rows('23:40', 'Bar 2, service end by the till', [
  'Unnamed female guest, 20s, reporting',
  'Zosia, bar staff']
  ),
  history: [
  {
    id: 'h-3-1',
    kind: 'report',
    person: people.zosia,
    role: 'Bar',
    input: 'Voice',
    duration: '31s',
    time: '23:48',
    text: 'She put her phone down on the bar while she was paying and turned round to talk to her friend. When she looked back it was gone, maybe a minute later. We looked under the mats, behind the fridge and checked lost property twice with nothing to show for it. She was calm about it and did not want to make a scene. She is going to call tomorrow to see if it has turned up.'
  },
  {
    id: 'h-3-2',
    kind: 'report',
    person: people.ola,
    role: 'Floor',
    input: 'Note',
    time: '00:05',
    text: 'Walked the area around bar 2 with her and asked the people standing nearby. Two of them said they had seen nothing and the rest had only just arrived. I checked the floor and the seating behind the pillar as well. Took her number so we can call her if it comes in.'
  }]

},
{
  id: 'i-4',
  tier: 'T1',
  type: 'Entry refusal',
  date: 'Sat 20',
  time: '23:20',
  location: 'Entrance',
  status: 'pending',
  reportedBy: [people.kuba],
  description:
  'A group of four was refused at the door with no reservation and the guest list already full. They were pointed to the main queue and left.',
  summary:
  'A group of four was refused at the door with no reservation and the guest list already full. They were pointed to the main queue and left.',
  evidence: [],
  details: rows('23:20', 'Entrance, guest list desk', ['Group of four, refused']),
  history: [
  {
    id: 'h-4-1',
    kind: 'report',
    person: people.kuba,
    role: 'Door',
    input: 'Team app',
    time: '23:22',
    text: 'Four lads turned up claiming a table booking under a first name only. Nothing in the book for tonight and the guest list was already full by then. I offered them the main queue and said I could not promise anything. They argued for a minute and then left on their own. No aggression, just disappointed.'
  }]

},
{
  id: 'i-5',
  tier: 'T2',
  type: 'Slip / fall',
  date: 'Sun 21',
  time: '00:50',
  location: 'Dance floor',
  status: 'pending',
  reportedBy: [people.ola, people.zosia],
  description:
  'A guest slipped on a spilled drink near the centre of the floor and landed on her side. She declined first aid and stayed on; the floor was cleared and mopped within five minutes.',
  summary:
  'A guest slipped on a spilled drink near the centre of the floor and landed on her side. She declined first aid and stayed on; the floor was cleared and mopped within five minutes.',
  evidence: [
  { id: 'e-5-1', kind: 'video', name: 'CCTV_floor_0049.mp4', duration: '1:05' },
  { id: 'e-5-2', kind: 'photo', name: 'photo_spill.jpg' }],

  details: rows('00:50', 'Dance floor, centre by the pillar', [
  'Unnamed female guest, 30s, fell',
  'Ola, floor staff']
  ),
  history: [
  {
    id: 'h-5-1',
    kind: 'report',
    person: people.ola,
    role: 'Floor',
    input: 'Voice',
    duration: '27s',
    time: '00:54',
    text: 'She went down hard on her side near the pillar in the middle of the floor. Someone had dropped a drink there and nobody flagged it to us. She got up on her own before I reached her and said she was fine. I offered the first aid kit twice and she turned it down both times. I cleared the area and had it mopped within a few minutes.'
  },
  {
    id: 'h-5-2',
    kind: 'report',
    person: people.zosia,
    role: 'Bar',
    input: 'Note',
    time: '01:02',
    text: 'Gave her water at the bar afterwards and kept an eye on her for a while. She was laughing about it with her friends and stayed until close. No complaint made and no injury that I could see. Told her to come and find me if her hip started hurting.'
  }]

},
{
  id: 'i-6',
  tier: 'T3',
  type: 'Violence / altercation',
  date: 'Sun 21',
  time: '01:30',
  location: 'Hall',
  status: 'pending',
  reportedBy: [people.tomek, people.zosia],
  description:
  'Two guests exchanged punches by the back bar after a verbal argument. The door team separated them within seconds and walked both out through the side exit.',
  summary:
  'Two guests exchanged punches by the back bar after a verbal argument. The door team separated them within seconds and walked both out through the side exit.',
  evidence: [
  { id: 'e-6-1', kind: 'video', name: 'CCTV_hall_0130.mp4', duration: '2:14' },
  { id: 'e-6-2', kind: 'video', name: 'CCTV_cloakroom_0129.mp4', duration: '0:58' },
  { id: 'e-6-3', kind: 'photo', name: 'photo_01.jpg' }],

  details: [
  { id: 'time', label: 'Time', values: ['01:30'] },
  {
    id: 'location',
    label: 'Location',
    values: ['Main floor, near the back bar'],
    source: {
      quote: 'It was right by the back bar, not out in the middle of the floor.',
      person: people.zosia,
      time: '01:40',
      input: 'Note'
    }
  },
  {
    id: 'parties',
    label: 'Parties',
    values: [
    'Unnamed male guest, 30s, black jacket',
    'Unnamed male guest, 20s, witness',
    'Zosia, bar staff'],

    source: {
      quote: 'Two of them went at it by the back bar, the one in the black jacket swung first.',
      person: people.tomek,
      time: '01:34',
      input: 'Voice'
    }
  }],

  history: [
  {
    id: 'h-6-1',
    kind: 'report',
    person: people.tomek,
    role: 'Security',
    input: 'Voice',
    duration: '22s',
    time: '01:34',
    text: 'Two of them went at it by the back bar, the one in the black jacket swung first. It started over a spilled drink from what the bar staff told me afterwards. We had them apart in about ten seconds and walked both out the side door. No blood on either of them and neither wanted anything done about it. Police were already on the street and had a word with them outside.'
  },
  {
    id: 'h-6-2',
    kind: 'report',
    person: people.zosia,
    role: 'Bar',
    input: 'Note',
    time: '01:40',
    text: 'It kicked off at my end of the bar right after a drink went over. I saw the whole thing from the service side, maybe two metres away. The one in the black jacket threw the first punch, no question about it. The other only swung back once before the door team got there.'
  },
  {
    id: 'h-6-3',
    kind: 'system',
    time: '01:45',
    label: 'AI escalated to Serious — police attended'
  }]

},
{
  id: 'i-7',
  tier: 'T1',
  type: 'Entry refusal',
  date: 'Sun 21',
  time: '01:55',
  location: 'Entrance',
  status: 'pending',
  reportedBy: [people.kuba, people.tomek],
  description:
  'A guest on the internal ban list from last month was recognised at the door. He was refused and left after a short exchange.',
  summary:
  'A guest on the internal ban list from last month was recognised at the door. He was refused and left after a short exchange.',
  evidence: [],
  details: rows('01:55', 'Entrance, outer door', ['Unnamed male guest, 30s, on ban list']),
  history: [
  {
    id: 'h-7-1',
    kind: 'report',
    person: people.kuba,
    role: 'Door',
    input: 'Team app',
    time: '01:56',
    text: 'Recognised him straight away from the ban list in October. Told him no and gave him the reason once. He tried to talk his way round it for a minute and asked for the manager. I said the ban still stands and he went without any trouble. Worth keeping the photo on file, he has tried twice now.'
  },
  {
    id: 'h-7-2',
    kind: 'report',
    person: people.tomek,
    role: 'Security',
    input: 'Note',
    time: '02:00',
    text: 'Stood with Kuba until he was off the street and round the corner. He did not try the side entrance afterwards. Nothing further and no need to call anyone. Logged it so the next shift knows he came back.'
  }]

},
{
  id: 'i-8',
  tier: 'T3',
  type: 'Medical',
  date: 'Sun 21',
  time: '02:10',
  location: 'Toilets',
  status: 'pending',
  reportedBy: [people.ola, people.zosia],
  description:
  'A guest was found unresponsive but breathing in a cubicle by her friend. She was moved to the quiet room and an ambulance was called; the crew took over at 02:26.',
  summary:
  'A guest was found unresponsive but breathing in a cubicle by her friend. She was moved to the quiet room and an ambulance was called; the crew took over at 02:26.',
  evidence: [
  { id: 'e-8-1', kind: 'video', name: 'CCTV_corridor_0208.mp4', duration: '1:36' },
  { id: 'e-8-2', kind: 'document', name: 'incident_form_medical.pdf' }],

  details: [
  { id: 'time', label: 'Time', values: ['02:10'] },
  {
    id: 'location',
    label: 'Location',
    values: ['Toilets, second cubicle on the left'],
    source: {
      quote: 'Her friend came running out of the second cubicle shouting for help.',
      person: people.ola,
      time: '02:14',
      input: 'Voice'
    }
  },
  {
    id: 'parties',
    label: 'Parties',
    values: [
    'Unnamed female guest, 20s, unresponsive',
    'Unnamed female guest, 20s, friend',
    'Ola, floor staff']

  }],

  history: [
  {
    id: 'h-8-1',
    kind: 'report',
    person: people.ola,
    role: 'Floor',
    input: 'Voice',
    duration: '44s',
    time: '02:14',
    text: 'Her friend came running out of the second cubicle shouting for help. She was out of it but breathing fine and had a steady pulse. We got her into the quiet room with two of us carrying her and called an ambulance straight away. She came round before the crew arrived and was talking to us by the time they took over. Her friend stayed with her the whole time and went with her in the ambulance.'
  },
  {
    id: 'h-8-2',
    kind: 'report',
    person: people.zosia,
    role: 'Bar',
    input: 'Team app',
    time: '02:30',
    text: 'Ambulance crew arrived at 02:26 and we walked them straight through the side corridor. They checked her over in the quiet room for about ten minutes. They left with her at 02:41 through the side door. Her friend picked up their coats from the cloakroom before they went.'
  }]

},
{
  id: 'i-9',
  tier: 'T2',
  type: 'Ejection',
  date: 'Sun 21',
  time: '02:40',
  location: 'Entrance',
  status: 'pending',
  reportedBy: [people.tomek, people.kuba],
  description:
  'A guest was ejected for repeatedly harassing others on the floor after two warnings. He walked out under escort with no physical contact needed.',
  summary:
  'A guest was ejected for repeatedly harassing others on the floor after two warnings. He walked out under escort with no physical contact needed.',
  evidence: [
  { id: 'e-9-1', kind: 'video', name: 'CCTV_entrance_0240.mp4', duration: '0:51' },
  { id: 'e-9-2', kind: 'photo', name: 'photo_01.jpg' }],

  details: rows('02:40', 'Entrance, inner lobby', [
  'Unnamed male guest, 20s, ejected',
  'Two guests, complainants']
  ),
  history: [
  {
    id: 'h-9-1',
    kind: 'report',
    person: people.tomek,
    role: 'Security',
    input: 'Voice',
    duration: '35s',
    time: '02:44',
    text: 'Third complaint about the same guy bothering people on the floor tonight. He had two warnings from me already, the last one about half an hour before. We walked him out through the lobby with one of us either side. No hands on him and he went quietly once he saw there were two of us. I would put him on the watch list for next weekend.'
  },
  {
    id: 'h-9-2',
    kind: 'report',
    person: people.kuba,
    role: 'Door',
    input: 'Note',
    time: '02:47',
    text: 'Held the door and watched him leave the area properly. He stood across the road for a few minutes and then went. Face noted for the list and I described him to the other door. No further contact after that.'
  }]

},
{
  id: 'i-10',
  tier: 'T1',
  type: 'Entry refusal',
  date: 'Sun 21',
  time: '03:05',
  location: 'Entrance',
  status: 'pending',
  reportedBy: [people.kuba],
  description:
  'A late arrival was refused because the doors were closed for the night. He accepted it and left immediately.',
  summary:
  'A late arrival was refused because the doors were closed for the night. He accepted it and left immediately.',
  evidence: [],
  details: rows('03:05', 'Entrance, doors closed', ['Unnamed male guest, 20s, refused']),
  history: [
  {
    id: 'h-10-1',
    kind: 'report',
    person: people.kuba,
    role: 'Door',
    input: 'Team app',
    time: '03:06',
    text: 'Last one of the night, the doors were already shut when he arrived. Told him we were done for the evening and he said fair enough. He asked what time we open next week before he left. No issue at all, logging it for completeness.'
  }]

}];