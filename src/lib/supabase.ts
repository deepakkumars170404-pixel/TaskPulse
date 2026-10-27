import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task } from '../types';

const env = (import.meta as any).env || {};

// Read credentials from build environment variables or custom localStorage override
export const getSupabaseConfig = (): { url: string; key: string } => {
  let url = env.VITE_SUPABASE_URL || '';
  let key = env.VITE_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('tasktoggle_supabase_url');
    const customKey = localStorage.getItem('tasktoggle_supabase_anon_key');
    if (customUrl && customKey) {
      url = customUrl.trim();
      key = customKey.trim();
    }
  }

  return { url, key };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(
    url &&
    key &&
    typeof url === 'string' &&
    url.startsWith('https://') &&
    key.length > 10
  );
};

const { url: activeUrl, key: activeKey } = getSupabaseConfig();

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(activeUrl, activeKey)
  : null;

// Helper: Convert Database row (snake_case) to Frontend Task (camelCase)
export const mapDbTaskToFrontend = (row: any): Task => {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    assignedTo: row.assigned_to,
    assignedToName: row.assigned_to_name,
    type: row.type,
    priority: row.priority || 'Medium',
    dueDate: row.due_date,
    dueTime: row.due_time,
    status: row.status,
    rejectReason: row.reject_reason || (row.pending_reason?.startsWith('[DECLINED]: ') ? row.pending_reason.replace('[DECLINED]: ', '') : undefined),
    rejectedAt: row.rejected_at || undefined,
    pendingReason: row.pending_reason || undefined,
    pendingReasonUpdatedAt: row.pending_reason_updated_at || undefined,
    acceptedAt: row.accepted_at || undefined,
    completedAt: row.completed_at || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
};

// Helper: Convert Frontend Task (camelCase) to Database row (snake_case)
export const mapFrontendTaskToDb = (task: Task): any => {
  // Gracefully map legacy admin_1 to admin_deepak to avoid foreign key errors with public.users
  const createdBy = task.createdBy === 'admin_1' ? 'admin_deepak' : task.createdBy;
  const assignedTo = task.assignedTo === 'admin_1' ? 'admin_deepak' : task.assignedTo;

  return {
    id: task.id,
    title: task.title,
    description: task.description || '',
    created_by: createdBy,
    created_by_name: task.createdByName,
    assigned_to: assignedTo,
    assigned_to_name: task.assignedToName,
    type: task.type,
    priority: task.priority,
    due_date: task.dueDate,
    due_time: task.dueTime,
    status: task.status,
    reject_reason: task.rejectReason || (task.pendingReason?.startsWith('[DECLINED]: ') ? task.pendingReason.replace('[DECLINED]: ', '') : null),
    rejected_at: task.rejectedAt || null,
    pending_reason: task.pendingReason || null,
    pending_reason_updated_at: task.pendingReasonUpdatedAt || null,
    accepted_at: task.acceptedAt || null,
    completed_at: task.completedAt || null,
  };
};
