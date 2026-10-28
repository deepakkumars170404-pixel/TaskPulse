import { supabase, isSupabaseConfigured, mapDbTaskToFrontend, mapFrontendTaskToDb } from '../lib/supabase';
import { Task, User, OfficeTiming, EventTiming, OrgSettings } from '../types';
import {
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_OFFICE_TIMING,
  INITIAL_EVENT_TIMING,
  INITIAL_ORG_SETTINGS,
} from '../data/initialData';

const STORAGE_PREFIX = 'tasktoggle_';

class BackendApiService {
  private hasSupabase = isSupabaseConfigured();

  // Check if real cloud database is connected
  public isConnected(): boolean {
    return this.hasSupabase;
  }

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    if (this.hasSupabase && supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data && data.length > 0) {
          return data.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            initials: u.initials,
            avatarBg: u.avatar_bg,
          }));
        }
      } catch (err) {
        console.warn('[BackendAPI] Error fetching users from Supabase, using local cache:', err);
      }
    }
    const saved = localStorage.getItem(`${STORAGE_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  }

  async createUser(user: User): Promise<User> {
    if (this.hasSupabase && supabase) {
      try {
        const { data, error } = await supabase.from('users').insert([
          {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            initials: user.initials,
            avatar_bg: user.avatarBg,
          },
        ]).select();
        if (error) {
          console.warn('[BackendAPI] Error inserting user into Supabase:', error);
        } else if (data && data[0]) {
          return {
            id: data[0].id,
            name: data[0].name,
            email: data[0].email,
            role: data[0].role,
            initials: data[0].initials,
            avatarBg: data[0].avatar_bg,
          };
        }
      } catch (err) {
        console.warn('[BackendAPI] Error creating user in Supabase:', err);
      }
    }
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    if (this.hasSupabase && supabase) {
      try {
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (error) {
          console.warn('[BackendAPI] Error deleting user in Supabase:', error);
        }
      } catch (err) {
        console.warn('[BackendAPI] Error deleting user in Supabase:', err);
      }
    }
  }

  // --- TASKS ---
  async getTasks(): Promise<Task[]> {
    if (this.hasSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapDbTaskToFrontend);
          // Cache in local storage for offline speed
          localStorage.setItem(`${STORAGE_PREFIX}tasks`, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('[BackendAPI] Error fetching tasks from Supabase:', err);
      }
    }

    const saved = localStorage.getItem(`${STORAGE_PREFIX}tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  }

  async createTask(task: Task): Promise<Task> {
    if (this.hasSupabase && supabase) {
      try {
        const row = mapFrontendTaskToDb(task);
        const { data, error } = await supabase.from('tasks').insert([row]).select();
        if (!error && data && data[0]) {
          return mapDbTaskToFrontend(data[0]);
        }
      } catch (err) {
        console.warn('[BackendAPI] Error saving task to Supabase:', err);
      }
    }
    return task;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    if (this.hasSupabase && supabase) {
      try {
        const dbUpdates: any = {};
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
        if (updates.assignedToName !== undefined) dbUpdates.assigned_to_name = updates.assignedToName;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
        if (updates.dueTime !== undefined) dbUpdates.due_time = updates.dueTime;
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if ('pendingReason' in updates) dbUpdates.pending_reason = updates.pendingReason || null;
        if ('pendingReasonUpdatedAt' in updates)
          dbUpdates.pending_reason_updated_at = updates.pendingReasonUpdatedAt || null;
        if ('rejectReason' in updates) dbUpdates.reject_reason = updates.rejectReason || null;
        if ('rejectedAt' in updates) dbUpdates.rejected_at = updates.rejectedAt || null;
        if ('acceptedAt' in updates) dbUpdates.accepted_at = updates.acceptedAt || null;
        if ('completedAt' in updates) dbUpdates.completed_at = updates.completedAt || null;

        const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', taskId);
        if (error && updates.status === 'rejected') {
          // If the DB constraint hasn't been altered to accept 'rejected', fallback to pending with [DECLINED]: reason
          await supabase.from('tasks').update({
            ...dbUpdates,
            status: 'pending',
          }).eq('id', taskId);
        }
      } catch (err) {
        console.warn('[BackendAPI] Error updating task in Supabase:', err);
      }
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    if (this.hasSupabase && supabase) {
      try {
        await supabase.from('tasks').delete().eq('id', taskId);
      } catch (err) {
        console.warn('[BackendAPI] Error deleting task from Supabase:', err);
      }
    }
  }

  // --- TIMING ---
  async getOfficeTiming(): Promise<OfficeTiming> {
    if (this.hasSupabase && supabase) {
      try {
        const { data, error } = await supabase.from('office_timing').select('*').limit(1).maybeSingle();
        if (!error && data) {
          const timing: OfficeTiming = {
            openTime: data.open_time,
            closeTime: data.close_time,
            workingDays: data.working_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          };
          localStorage.setItem(`${STORAGE_PREFIX}office_timing`, JSON.stringify(timing));
          return timing;
        }
      } catch (err) {
        console.warn('[BackendAPI] Error fetching office timing from Supabase:', err);
      }
    }

    const saved = localStorage.getItem(`${STORAGE_PREFIX}office_timing`);
    return saved ? JSON.parse(saved) : INITIAL_OFFICE_TIMING;
  }

  async updateOfficeTiming(timing: OfficeTiming): Promise<void> {
    if (this.hasSupabase && supabase) {
      try {
        await supabase
          .from('office_timing')
          .upsert({
            id: 'primary',
            open_time: timing.openTime,
            close_time: timing.closeTime,
            working_days: timing.workingDays,
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn('[BackendAPI] Error updating office timing in Supabase:', err);
      }
    }
  }

  async getEventTiming(): Promise<EventTiming | null> {
    if (this.hasSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('event_timing')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const evt: EventTiming = {
            id: data.id,
            eventName: data.event_name,
            date: data.date,
            newTiming: data.new_timing,
            allottedStaffIds: data.allotted_staff_ids || [],
            isActive: data.is_active,
          };
          localStorage.setItem(`${STORAGE_PREFIX}event_timing`, JSON.stringify(evt));
          return evt;
        }
      } catch (err) {
        console.warn('[BackendAPI] Error fetching event timing from Supabase:', err);
      }
    }

    const saved = localStorage.getItem(`${STORAGE_PREFIX}event_timing`);
    return saved ? JSON.parse(saved) : INITIAL_EVENT_TIMING;
  }

  async updateEventTiming(event: EventTiming): Promise<void> {
    if (this.hasSupabase && supabase) {
      try {
        await supabase
          .from('event_timing')
          .upsert({
            id: event.id,
            event_name: event.eventName,
            date: event.date,
            new_timing: event.newTiming,
            allotted_staff_ids: event.allottedStaffIds,
            is_active: event.isActive,
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn('[BackendAPI] Error updating event timing in Supabase:', err);
      }
    }
  }

  // --- ORGANIZATION SETTINGS ---
  async getOrgSettings(): Promise<OrgSettings> {
    if (this.hasSupabase && supabase) {
      try {
        const { data, error } = await supabase.from('org_settings').select('*').limit(1).maybeSingle();
        if (!error && data && data.org_name) {
          const org: OrgSettings = { orgName: data.org_name, contactEmail: data.contact_email || 'deepak@organization.com', accentColor: '#4F46E5' };
          localStorage.setItem(`${STORAGE_PREFIX}org_settings`, JSON.stringify(org));
          return org;
        }
      } catch (err) {
        console.warn('[BackendAPI] Error fetching org settings from Supabase:', err);
      }
    }

    const saved = localStorage.getItem(`${STORAGE_PREFIX}org_settings`);
    return saved ? JSON.parse(saved) : INITIAL_ORG_SETTINGS;
  }

  async updateOrgSettings(settings: Partial<OrgSettings>): Promise<void> {
    if (this.hasSupabase && supabase && settings.orgName) {
      try {
        await supabase.from('org_settings').upsert({
          id: 'primary',
          org_name: settings.orgName,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[BackendAPI] Error updating org settings in Supabase:', err);
      }
    }
  }

  // --- REAL-TIME SUBSCRIPTION ---
  subscribeToTasks(onUpdate: (payload: any) => void): (() => void) | null {
    if (!this.hasSupabase || !supabase) return null;

    try {
      const activeClient = supabase;
      const channel = activeClient
        .channel('tasks-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          (payload) => {
            onUpdate(payload);
          }
        )
        .subscribe();

      return () => {
        activeClient.removeChannel(channel);
      };
    } catch (err) {
      console.warn('[BackendAPI] Could not start real-time subscription:', err);
      return null;
    }
  }
}

export const backendApi = new BackendApiService();
