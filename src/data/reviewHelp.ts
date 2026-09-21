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

}];