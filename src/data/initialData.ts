import { User, Task, OfficeTiming, EventTiming, OrgSettings } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin_deepak',
    name: 'Deepak (Admin)',
    email: 'admin@company.com',
    role: 'admin',
    initials: 'DA',
    avatarBg: 'bg-indigo-600',
  },
];

// Pure empty array - all tasks are loaded dynamically from Supabase database
export const INITIAL_TASKS: Task[] = [];

export const INITIAL_OFFICE_TIMING: OfficeTiming = {
  openTime: '09:30 AM',
  closeTime: '06:30 PM',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
};

export const INITIAL_EVENT_TIMING: EventTiming | null = null;

export const INITIAL_ORG_SETTINGS: OrgSettings = {
  orgName: 'Deepak',
  contactEmail: 'admin@company.com',
  accentColor: '#4F46E5',
};
