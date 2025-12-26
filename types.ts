
export type IssueType = 'streetlight' | 'pothole' | 'water-leak' | 'garbage' | 'sewage' | 'road-damage' | 'other';

export interface ComplaintProgress {
  stage: string;
  timestamp: number;
  completed: boolean;
  note?: string;
}

export interface Complaint {
  id: string;
  issueType: IssueType;
  location: string;
  area: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'resolved' | 'overdue';
  slaHours: number;
  contact?: string;
  progress: ComplaintProgress[];
}

export interface TransparencyArticle {
  id: string;
  title: string;
  content: string;
  date: number;
  area: string;
  issueType: string;
  breachCount: number;
  isAiGenerated: boolean;
}

export enum UserRole {
  CITIZEN = 'citizen',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
}
