export type Role = 'admin' | 'staff';

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
}

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

export interface TaskAlert {
  id: string;
  title: string;
  message: string;
  taskTitle: string;
  senderName: string;
  dueDate?: string;
  dueTime?: string;
  priority?: string;
  type?: 'admin' | 'staff' | 'decline' | 'issue';
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

