export type Role = 'super_admin' | 'admin' | 'branch_manager' | 'staff';

export type BranchName = 'sivakasi 1.0' | 'sivakasi 3.0' | 'srivi 2.0' | 'All Branches';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskType = 'admin' | 'self' | 'staff';

export type TaskStatus = 'pending' | 'accepted' | 'done' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  avatarBg?: string;
  branch?: BranchName;
  employeeId?: string;
  password?: string;
  designation?: string;
}

/** Check if user has an executive / managerial role */
export const isExecutiveRole = (role?: Role | null): boolean => {
  return role === 'super_admin' || role === 'admin' || role === 'branch_manager';
};

/** Only Super Admins (Dr. Thavabalan & Deepak) have authority to add/remove staff or alter designations */
export const isSuperAdmin = (role?: Role | null): boolean => {
  return role === 'super_admin';
};

/** Human-readable display label for roles */
export const getRoleDisplayName = (role: Role): string => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'branch_manager':
      return 'Branch Manager';
    case 'staff':
      return 'Staff';
    default:
      return role;
  }
};

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  createdByName: string;
  assignedTo: string;
  assignedToName: string;
  type: TaskType;
  priority: TaskPriority;
  dueDate: string;
  dueTime: string;
  status: TaskStatus;
  acceptedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;
  createdAt: string;
  pendingReason?: string; // Reason submitted by staff if task is pending/blocked
  pendingReasonUpdatedAt?: string;
}

export interface OfficeTiming {
  openTime: string;
  closeTime: string;
  workingDays: string[];
}

export interface EventTiming {
  id: string;
  eventName: string;
  date: string;
  newTiming: string;
  allottedStaffIds: string[];
  isActive: boolean;
}

export interface OrgSettings {
  orgName: string;
  contactEmail?: string;
  accentColor?: string;
}

export type ThemePreset =
  | 'navy'       // Royal Navy Blue (Enterprise Stripe & Microsoft Blue - Default)
  | 'monochrome' // Obsidian B&W (Minimalist Executive Black & White)
  | 'emerald'    // Forest Emerald (Executive Enterprise Green)
  | 'crimson'    // Executive Crimson (Vanguard / Harvard Deep Wine Red)
  | 'bronze'     // Corporate Bronze (Bloomberg Warm Executive Amber)
  | 'slate'      // Steel Slate (Apple Minimalist Neutral Slate)
  | 'mocha';     // Corporate Mocha (Executive Warm Espresso Taupe)

export type BgCanvas =
  | 'slate'      // Cool Slate (#F8FAFC) - Default
  | 'white'      // Pure White (#FFFFFF)
  | 'zinc'       // Corporate Zinc (#F4F4F5)
  | 'ice'        // Executive Ice (#F0F7FF)
  | 'cashmere';  // Subtle Cashmere (#FAF7F2)

export type FontFamily =
  | 'outfit'
  | 'jakarta'
  | 'inter'
  | 'poppins'
  | 'mono'
  | 'system';

export interface TaskAlert {
  id: string;
  title: string;
  message: string;
  taskTitle: string;
  senderName: string;
  dueDate?: string;
  dueTime?: string;
  priority?: string;
  type?: 'admin' | 'staff' | 'decline' | 'issue' | 'event';
}

export interface StudentAdmission {
  id: string;
  admissionNo: number; // Numeric admission number: e.g. 1001, 1002...
  studentName: string;
  courseName: string;
  admissionDate: string; // e.g. "29 Oct 2026"
  studentPhone?: string;
  studentEmail?: string;
  feesPaid?: string;
  batchTiming?: string;
  notes?: string;
  staffId: string; // Staff member who enrolled the student
  staffName: string;
  createdAt: string;
}

/**
 * Universal helper to extract a task's decline/rejection reason message.
 * Handles both dedicated rejectReason and pendingReason prefixed with [DECLINED]:
 */
export const getTaskDeclineReason = (task: Partial<Task>): string | null => {
  if (task.rejectReason && task.rejectReason.trim()) {
    return task.rejectReason.trim();
  }
  if (task.pendingReason && task.pendingReason.trim()) {
    if (task.pendingReason.startsWith('[DECLINED]: ')) {
      return task.pendingReason.replace('[DECLINED]: ', '').trim();
    }
    return task.pendingReason.trim();
  }
  return null;
};
