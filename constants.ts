
import { IssueType } from './types';

export const SLA_TIMES_HOURS: Record<IssueType, number> = {
  'streetlight': 72,
  'pothole': 168,
  'water-leak': 48,
  'garbage': 24,
  'sewage': 24,
  'road-damage': 336,
  'other': 72
};

export const ISSUE_LABELS: Record<IssueType, string> = {
  'streetlight': 'Streetlight Not Working',
  'pothole': 'Pothole',
  'water-leak': 'Water Leak',
  'garbage': 'Garbage Not Collected',
  'sewage': 'Sewage Overflow',
  'road-damage': 'Road Damage',
  'other': 'Other Civic Issue'
};

export const AREAS = [
  "Pallavaram",
  "Anna Nagar",
  "T. Nagar",
  "Adyar",
  "Velachery",
  "Tambaram",
  "Mylapore"
];

export const WORKFLOW_STAGES = [
  { id: 'submitted', title: 'Submitted', description: 'Complaint registered' },
  { id: 'verified', title: 'Verified', description: 'Evidence validated' },
  { id: 'assigned', title: 'Assigned', description: 'Tasked to department' },
  { id: 'in_progress', title: 'In Progress', description: 'Work in field' },
  { id: 'resolved', title: 'Resolved', description: 'Issue fixed' }
];
