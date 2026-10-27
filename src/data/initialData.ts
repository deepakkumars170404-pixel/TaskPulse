import { User, Task, OfficeTiming, EventTiming, OrgSettings } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin_1',
    name: 'Admin',
    email: 'admin@company.com',
    role: 'admin',
    initials: 'AD',
    avatarBg: 'bg-indigo-600',
  },
];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_OFFICE_TIMING: OfficeTiming = {
  openTime: '9:00 AM',
  closeTime: '5:00 PM',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
};

export const INITIAL_EVENT_TIMING: EventTiming = {
  id: 'evt_annual_day',
  eventName: 'Annual Day Preparation',
  date: 'Sun 26 Oct 2026',
  newTiming: '8:00 AM - 6:00 PM',
  allottedStaffIds: [],
  isActive: false,
};

export const INITIAL_ORG_SETTINGS: OrgSettings = {
  orgName: 'Deepak',
  accentColor: '#4F46E5',
};
