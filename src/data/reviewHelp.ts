import { InlineAIHelpType } from '../components/InlineAIHelp';

export interface ReviewHelpOption {
  label: string;
  action: string;
}

export interface ReviewHelpDef {
  id: string;
  incidentId: string;
  /** DOM id of the row or section this card is anchored to. */
  anchorId: string;
  type: InlineAIHelpType;
  question: string;
  options: ReviewHelpOption[];
}

export const reviewHelp: ReviewHelpDef[] = [
{
  id: 'help-witness',
  incidentId: 'i-6',
  anchorId: 'detail-parties',
  type: 'mandatory',
  question: 'A serious incident needs a witness on record. Who else was there?',
  options: [
  { label: 'Zosia was there', action: 'witness-zosia' },
  { label: 'No one else saw it', action: 'witness-none' }]

},
{
  id: 'help-medical',
  incidentId: 'i-8',
  anchorId: 'review-details',
  type: 'mandatory',
  question: 'Was medical attention offered?',
  options: [
  { label: 'Yes, first aid given', action: 'medical-first-aid' },
  { label: 'Offered, declined', action: 'medical-declined' },
  { label: 'Ambulance called', action: 'medical-ambulance' }]

},
{
  id: 'help-clip',
  incidentId: 'i-3',
  anchorId: 'review-evidence',
  type: 'optional',
  question: 'Bar 2 camera covers this spot. Request the 23:35–23:50 clip?',
  options: [
  { label: 'Request clip', action: 'request-clip' },
  { label: 'Not needed', action: 'none' }]

},
{
  id: 'help-watchlist',
  incidentId: 'i-9',
  anchorId: 'detail-parties',
  type: 'optional',
  question: 'Should this guest go on the watch list?',
  options: [
  { label: 'Yes, add to watch list', action: 'watchlist-yes' },
  { label: 'No, one-off', action: 'watchlist-no' }]

},
{
  id: 'help-watchlist-duration',
  incidentId: 'i-9',
  anchorId: 'detail-parties',
  type: 'optional',
  question: 'How long should the flag last?',
  options: [
  { label: 'Rest of tonight', action: 'watchlist-tonight' },
  { label: 'This month', action: 'watchlist-month' },
  { label: 'Indefinite, repeat offender', action: 'watchlist-indefinite' }]

},
{
  id: 'help-hazard',
  incidentId: 'i-5',
  anchorId: 'review-details',
  type: 'optional',
  question: 'Guest declined first aid — log a hazard follow-up?',
  options: [
  { label: 'Yes, log follow-up', action: 'hazard-yes' },
  { label: 'No further action', action: 'hazard-no' }]

},
{
  id: 'help-hazard-action',
  incidentId: 'i-5',
  anchorId: 'review-details',
  type: 'optional',
  question: 'What was done about the spill?',
  options: [
  { label: 'Floor mopped immediately', action: 'hazard-mopped' },
  { label: 'Warning sign placed', action: 'hazard-sign' },
  { label: 'Area cordoned off', action: 'hazard-cordoned' }]

}];