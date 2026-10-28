import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Task, OfficeTiming, EventTiming, OrgSettings, Role, TaskPriority, TaskAlert, ThemePreset, BgCanvas, FontFamily } from '../types';
import {
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_OFFICE_TIMING,
  INITIAL_EVENT_TIMING,
  INITIAL_ORG_SETTINGS,
} from '../data/initialData';
import { backendApi } from '../services/backendApi';
import { mapDbTaskToFrontend } from '../lib/supabase';
import { parseEventStartDateTime } from '../utils/dateUtils';

interface TaskToggleContextType {
  currentUser: User;
  users: User[];
  tasks: Task[];
  officeTiming: OfficeTiming;
  eventTiming: EventTiming | null;
  orgSettings: OrgSettings;
  currentPage: string;
  showCompleted: boolean;
  isBackendConnected: boolean;
  setShowCompleted: (val: boolean) => void;
  setCurrentPage: (page: string) => void;
  switchUser: (userId: string) => void;
  login: (email: string, role: Role) => void;
  logout: () => void;
  assignAdminTask: (data: {
    title: string;
    description: string;
    staffIds: string[];
    dueDate: string;
    dueTime: string;
    priority: TaskPriority;
  }) => void;
  assignAdminPersonalTask: (data: {
    title: string;
    description?: string;
    dueDate: string;
    dueTime: string;
    priority: TaskPriority;
  }) => void;
  createStaffTask: (data: {
    title: string;
    details: string;
    createForUserId: string;
    dueDate: string;
    dueTime: string;
  }) => void;
  toggleTaskStatus: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  completeAllTasks: () => void;
  snoozeTask: (taskId: string, minutes: number) => void;
  playCompletionSound: () => void;
  playCalendarClickSound: () => void;
  playAssignmentAlertSound: () => void;
  sendTaskNotification: (title: string, body: string) => void;
  acceptTaskRequest: (taskId: string) => void;
  rejectTaskRequest: (taskId: string, reason: string) => void;
  moveToMyOwnToDo: (taskId: string) => void;
  reassignTask: (taskId: string, newAssignedToId: string) => void;
  requestViewTab: 'incoming' | 'sent';
  setRequestViewTab: (tab: 'incoming' | 'sent') => void;
  sendTaskCompletedNotification: (taskTitle: string, staffName: string) => void;
  reportPendingReason: (taskId: string, reason: string) => void;
  activeDueReminder: { task: Task; minutesRemaining: number } | null;
  dismissDueReminder: () => void;
  triggerDueReminderPreview: (customTitle?: string, minutes?: number) => void;
  playThirtyMinReminderSound: () => void;
  addStaffUser: (name: string, email: string) => void;
  deleteStaffUser: (userId: string) => void;
  clearAllTasks: () => void;
  updateOfficeTiming: (timing: OfficeTiming) => void;
  updateEventTiming: (event: EventTiming) => void;
  updateOrgSettings: (settings: Partial<OrgSettings>) => void;
  refreshData: () => Promise<void>;
  activeTaskAlert: TaskAlert | null;
  dismissTaskAlert: () => void;
  triggerTaskAlert: (alert: TaskAlert) => void;
  themePreset: ThemePreset;
  setThemePreset: (preset: ThemePreset) => void;
  bgCanvas: BgCanvas;
  setBgCanvas: (canvas: BgCanvas) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
}

const TaskToggleContext = createContext<TaskToggleContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'tasktoggle_';
const STORAGE_CLEAN_VERSION = 'v7_disable_auto_due_popup';
const PENDING_STAFF_ALERTS_KEY = 'tasktoggle_pending_staff_alerts';

export function queuePendingStaffAlert(userId: string, alert: TaskAlert) {
  try {
    const existing = localStorage.getItem(PENDING_STAFF_ALERTS_KEY);
    const parsed: Record<string, TaskAlert[]> = existing ? JSON.parse(existing) : {};
    if (!parsed[userId]) parsed[userId] = [];
    if (!parsed[userId].some((a) => a.id === alert.id)) {
      parsed[userId].push(alert);
    }
    localStorage.setItem(PENDING_STAFF_ALERTS_KEY, JSON.stringify(parsed));
  } catch (e) {}
}

export function checkAndTriggerPendingStaffAlerts(userId: string, triggerFn: (alert: TaskAlert) => void) {
  try {
    const existing = localStorage.getItem(PENDING_STAFF_ALERTS_KEY);
    if (!existing) return;
    const parsed: Record<string, TaskAlert[]> = JSON.parse(existing);
    const userAlerts = parsed[userId];
    if (userAlerts && userAlerts.length > 0) {
      const alert = userAlerts[userAlerts.length - 1];
      delete parsed[userId];
      localStorage.setItem(PENDING_STAFF_ALERTS_KEY, JSON.stringify(parsed));
      setTimeout(() => {
        triggerFn(alert);
      }, 400);
    }
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  if (localStorage.getItem('tasktoggle_data_version') !== STORAGE_CLEAN_VERSION) {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}tasks`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}users`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user_id`);
    localStorage.setItem('tasktoggle_data_version', STORAGE_CLEAN_VERSION);
  }
}

// Browser-native Web Audio API synthesizer for positive completion feedback
const playRewardChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Note 1: 523.25 Hz (C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.22);

    // Note 2: 1046.5 Hz (C6) high pleasant chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.08);
    gain2.gain.setValueAtTime(0.15, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.42);
  } catch (e) {
    // Ignore if audio permissions not yet activated by user click
  }
};

// High-frequency audible alert chime for new task assignment (audible over games & music)
export const playAssignmentAlertSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // High 4-tone ascending alert chime: F#5 (740Hz) -> A5 (880Hz) -> D6 (1175Hz) -> F#6 (1480Hz)
    const tones = [
      { freq: 739.99, time: now, dur: 0.12, vol: 0.35 },
      { freq: 880.00, time: now + 0.08, dur: 0.14, vol: 0.40 },
      { freq: 1174.66, time: now + 0.18, dur: 0.20, vol: 0.45 },
      { freq: 1479.98, time: now + 0.32, dur: 0.40, vol: 0.50 },
    ];

    tones.forEach(({ freq, time, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
    });
  } catch (e) {
    // Ignore if audio permissions not yet activated
  }
};

// Clean interaction chime for calendar date clicks
export const playCalendarClickSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5 crisp note
    gain.gain.setValueAtTime(0.20, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {}
};

// Distinct, crisp alert chime for 30-minute task deadline reminder (audible & urgent)
export const playThirtyMinReminderSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // 2 ascending alert pulses: E5 (659Hz) -> A5 (880Hz) -> C#6 (1108Hz)
    const burstTones = [
      { freq: 659.25, time: now, dur: 0.10, vol: 0.35 },
      { freq: 880.00, time: now + 0.07, dur: 0.12, vol: 0.40 },
      { freq: 1108.73, time: now + 0.15, dur: 0.20, vol: 0.45 },
      { freq: 659.25, time: now + 0.28, dur: 0.10, vol: 0.40 },
      { freq: 880.00, time: now + 0.35, dur: 0.14, vol: 0.48 },
      { freq: 1108.73, time: now + 0.44, dur: 0.35, vol: 0.55 },
    ];

    burstTones.forEach(({ freq, time, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
    });
  } catch (e) {}
};

// Helper to parse dueDate and dueTime strings into a Date object
export function parseTaskDeadline(dueDateStr?: string, dueTimeStr?: string): Date | null {
  if (!dueDateStr) return null;
  const now = new Date();
  let targetYear = now.getFullYear();
  let targetMonth = now.getMonth();
  let targetDate = now.getDate();

  const trimmedDate = dueDateStr.trim().toLowerCase();
  if (trimmedDate === 'today') {
    // Current date
  } else if (trimmedDate === 'tomorrow') {
    targetDate += 1;
  } else {
    const parts = dueDateStr.trim().split(/\s+/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const mIdx = months.findIndex((m) => parts[1].toLowerCase().startsWith(m));
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && mIdx !== -1 && !isNaN(year)) {
        targetYear = year;
        targetMonth = mIdx;
        targetDate = day;
      }
    } else {
      const parsed = new Date(dueDateStr);
      if (!isNaN(parsed.getTime())) {
        targetYear = parsed.getFullYear();
        targetMonth = parsed.getMonth();
        targetDate = parsed.getDate();
      }
    }
  }

  const deadline = new Date(targetYear, targetMonth, targetDate);

  if (dueTimeStr) {
    const timeMatch = dueTimeStr.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3]?.toLowerCase();

      if (meridiem === 'pm' && hours < 12) {
        hours += 12;
      } else if (meridiem === 'am' && hours === 12) {
        hours = 0;
      }
      deadline.setHours(hours, minutes, 0, 0);
      return deadline;
    }
  }

  deadline.setHours(18, 0, 0, 0);
  return deadline;
}


export const sendTaskCompletedNotification = (title: string, staffName: string) => {
  // 1. Play joyful completion chime
  playRewardChime();

  // 2. Native OS Desktop Notification (pops over Word, Excel, Desktop, all apps & games)
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const notifTitle = `Task Completed: ${title}`;
    const notifBody = `${staffName} has marked this task as finished!`;

    if (Notification.permission === 'granted') {
      try {
        new Notification(notifTitle, {
          body: notifBody,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Native notification error:', e);
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          try {
            new Notification(notifTitle, { body: notifBody, icon: '/favicon.ico' });
          } catch (e) {}
        }
      });
    }
  }
};

export const sendTaskAssignmentNotification = (title: string, body: string) => {
  // 1. Play alert chime
  playAssignmentAlertSound();

  // 2. Native OS Desktop Notification (pops over Word, Excel, Desktop, all apps)
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Native notification error:', e);
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          try {
            new Notification(title, { body, icon: '/favicon.ico' });
          } catch (e) {}
        }
      });
    }
  }
};

export const TaskToggleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBackendConnected] = useState<boolean>(backendApi.isConnected());

  // Users state (dynamically refreshed to match Supabase database)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If saved users still have the old 'Arun Kumar' or legacy 'admin_1', refresh to INITIAL_USERS with 'Arun Patel'
        if (parsed.some((u: User) => ['staff_arun', 'staff_priya', 'staff_meena', 'staff_karthik', 'staff_divya', 'admin_1'].includes(u.id) || u.name === 'Arun Kumar')) {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(INITIAL_USERS));
          localStorage.removeItem(`${STORAGE_KEY_PREFIX}tasks`);
          return INITIAL_USERS;
        }
        return parsed;
      } catch (e) {}
    }
    return INITIAL_USERS;
  });

  // Current active user
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user_id`);
    if (savedId) {
      // Map legacy 'admin_1' to 'admin_deepak'
      const targetId = savedId === 'admin_1' ? 'admin_deepak' : savedId;
      const found = INITIAL_USERS.find((u) => u.id === targetId);
      if (found) return found;
    }
    return INITIAL_USERS[0];
  });

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // Office hours state
  const [officeTiming, setOfficeTiming] = useState<OfficeTiming>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}office_timing`);
    return saved ? JSON.parse(saved) : INITIAL_OFFICE_TIMING;
  });

  // Event timing state
  const [eventTiming, setEventTiming] = useState<EventTiming | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}event_timing`);
    return saved ? JSON.parse(saved) : INITIAL_EVENT_TIMING;
  });

  // Organization settings (Default: Deepak)
  const [orgSettings, setOrgSettings] = useState<OrgSettings>(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const orgParam = params?.get('org');
    if (orgParam) {
      return { orgName: orgParam };
    }
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}org_settings`);
    return saved ? JSON.parse(saved) : INITIAL_ORG_SETTINGS;
  });

  // Executive Theme, Background & Font Customizer States
  const [themePreset, setThemePreset] = useState<ThemePreset>(() => {
    return (localStorage.getItem(`${STORAGE_KEY_PREFIX}theme_preset`) as ThemePreset) || 'navy';
  });

  const [bgCanvas, setBgCanvas] = useState<BgCanvas>(() => {
    return (localStorage.getItem(`${STORAGE_KEY_PREFIX}bg_canvas`) as BgCanvas) || 'slate';
  });

  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    return (localStorage.getItem(`${STORAGE_KEY_PREFIX}font_family`) as FontFamily) || 'inter';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themePreset);
    document.documentElement.setAttribute('data-bg', bgCanvas);
    document.documentElement.setAttribute('data-font', fontFamily);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}theme_preset`, themePreset);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}bg_canvas`, bgCanvas);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}font_family`, fontFamily);
  }, [themePreset, bgCanvas, fontFamily]);

  const [currentPage, setCurrentPage] = useState<string>(() => {
    return currentUser.role === 'admin' ? 'dashboard' : 'mytodo';
  });

  const [requestViewTab, setRequestViewTab] = useState<'incoming' | 'sent'>('incoming');

  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  // 30-Minute Pending Task Due Reminder State
  const [activeDueReminder, setActiveDueReminder] = useState<{ task: Task; minutesRemaining: number } | null>(null);
  const notifiedRemindersRef = React.useRef<Set<string>>(new Set());

  // In-App Visual Task Alert Banner State (pops up on screen when a task is allotted)
  const [activeTaskAlert, setActiveTaskAlert] = useState<TaskAlert | null>(null);

  const dismissTaskAlert = useCallback(() => {
    setActiveTaskAlert(null);
  }, []);

  const triggerTaskAlert = useCallback((alert: TaskAlert) => {
    // 1. Play audible sound
    playAssignmentAlertSound();

    // 2. Display prominent in-app visual popup banner on screen
    setActiveTaskAlert(alert);

    // 3. Desktop OS Native Notification (if supported & allowed)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(alert.title, {
            body: `${alert.taskTitle} · ${alert.message}`,
            icon: '/favicon.ico',
          });
        } catch (e) {}
      }
    }
  }, []);

  const initialTasksLoadedRef = useRef<boolean>(false);
  const knownTaskIdsRef = useRef<Set<string>>(new Set());

  // Cross-Tab & Cross-Window Instant Real-Time Sync Channel
  const broadcastChannelRef = React.useRef<BroadcastChannel | null>(null);
  const currentTabIdRef = useRef<string>(Math.random().toString(36).substring(2));
  const tasksRef = useRef<Task[]>(tasks);
  const usersRef = useRef<User[]>(users);
  const recentlyUpdatedTasksRef = useRef<Map<string, number>>(new Map());
  const inFlightTogglesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const broadcastEvent = useCallback((eventData: any) => {
    try {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ ...eventData, senderTabId: currentTabIdRef.current });
      }
    } catch (e) {}
  }, []);

  const dismissDueReminder = useCallback(() => {
    setActiveDueReminder(null);
  }, []);

  const triggerDueReminderPreview = useCallback(
    (customTitle: string = 'Prepare Monthly Sales Review', minutes: number = 25) => {
      playThirtyMinReminderSound();
      const now = new Date();
      const targetTime = new Date(now.getTime() + minutes * 60 * 1000);
      const previewTask: Task = {
        id: `test_due_${Date.now()}`,
        title: customTitle,
        createdBy: currentUser.id,
        createdByName: currentUser.name,
        assignedTo: currentUser.id,
        assignedToName: currentUser.name,
        type: 'admin',
        status: 'pending',
        priority: 'High',
        dueDate: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        dueTime: targetTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        createdAt: now.toISOString(),
      };
      setActiveDueReminder({
        task: previewTask,
        minutesRemaining: minutes,
      });

      if (typeof window !== 'undefined' && 'Notification' in window) {
        const notifTitle = `⏰ 30-Min Due Reminder: "${previewTask.title}"`;
        const notifBody = `Due in ${minutes} minutes (at ${previewTask.dueTime})! Please complete or strike it.`;
        if (Notification.permission === 'granted') {
          try {
            new Notification(notifTitle, { body: notifBody, icon: '/favicon.ico' });
          } catch (e) {}
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              try {
                new Notification(notifTitle, { body: notifBody, icon: '/favicon.ico' });
              } catch (e) {}
            }
          });
        }
      }
    },
    [currentUser]
  );

  // Function to pull latest data from backend / database
  const refreshData = useCallback(async () => {
    try {
      const [fetchedUsers, fetchedTasks, fetchedOffice, fetchedEvent, fetchedOrg] = await Promise.all([
        backendApi.getUsers(),
        backendApi.getTasks(),
        backendApi.getOfficeTiming(),
        backendApi.getEventTiming(),
        backendApi.getOrgSettings(),
      ]);

      if (fetchedUsers && fetchedUsers.length > 0) {
        const usersChanged =
          fetchedUsers.length !== usersRef.current.length ||
          fetchedUsers.some((u, i) => {
            const curr = usersRef.current[i];
            return !curr || curr.id !== u.id || curr.name !== u.name || curr.role !== u.role;
          });

        if (usersChanged) {
          usersRef.current = fetchedUsers;
          setUsers(fetchedUsers);
          setCurrentUser((curr) => {
            const match = fetchedUsers.find((u) => u.id === curr.id || (curr.role === 'admin' && u.role === 'admin'));
            return match || curr;
          });
        }
      }

      if (fetchedTasks) {
        const now = Date.now();
        const currentTasks = tasksRef.current;

        // Detect newly allotted tasks for the active user and trigger prominent visual popup
        if (initialTasksLoadedRef.current) {
          fetchedTasks.forEach((t) => {
            if (
              t.assignedTo === currentUser.id &&
              t.status !== 'done' &&
              t.status !== 'rejected' &&
              !knownTaskIdsRef.current.has(t.id)
            ) {
              knownTaskIdsRef.current.add(t.id);
              triggerTaskAlert({
                id: t.id,
                title: t.type === 'admin' ? 'New Task from Admin' : `Task from ${t.createdByName || 'Colleague'}`,
                message: `Due: ${t.dueDate} ${t.dueTime}`,
                taskTitle: t.title,
                senderName: t.createdByName || (t.type === 'admin' ? 'Deepak (Admin)' : 'Colleague'),
                dueDate: t.dueDate,
                dueTime: t.dueTime,
                priority: t.priority,
                type: t.type === 'admin' ? 'admin' : 'staff',
              });
            }
          });
        } else {
          fetchedTasks.forEach((t) => knownTaskIdsRef.current.add(t.id));
          initialTasksLoadedRef.current = true;
        }

        // Avoid re-rendering if tasks haven't meaningfully changed
        let hasDiff = fetchedTasks.length !== currentTasks.length;
        if (!hasDiff) {
          for (const ft of fetchedTasks) {
            const ct = currentTasks.find((t) => t.id === ft.id);
            if (!ct) {
              hasDiff = true;
              break;
            }
            const lastUpdated = recentlyUpdatedTasksRef.current.get(ft.id);
            if (lastUpdated && now - lastUpdated < 4000) {
              continue;
            }
            if (
              ct.status !== ft.status ||
              (ct.completedAt || undefined) !== (ft.completedAt || undefined) ||
              (ct.pendingReason || undefined) !== (ft.pendingReason || undefined) ||
              (ct.rejectReason || undefined) !== (ft.rejectReason || undefined) ||
              ct.title !== ft.title ||
              ct.dueDate !== ft.dueDate ||
              ct.dueTime !== ft.dueTime ||
              ct.assignedTo !== ft.assignedTo
            ) {
              hasDiff = true;
              break;
            }
          }
        }

        if (hasDiff) {
          const mergedTasks = fetchedTasks.map((ft) => {
            const lastUpdated = recentlyUpdatedTasksRef.current.get(ft.id);
            if (lastUpdated && now - lastUpdated < 4000) {
              const localTask = currentTasks.find((t) => t.id === ft.id);
              return localTask || ft;
            }
            return ft;
          });

          tasksRef.current = mergedTasks;
          setTasks(mergedTasks);
        }
      }

      if (fetchedOffice) {
        setOfficeTiming((curr) => (JSON.stringify(curr) !== JSON.stringify(fetchedOffice) ? fetchedOffice : curr));
      }
      if (fetchedEvent) {
        setEventTiming((curr) => (JSON.stringify(curr) !== JSON.stringify(fetchedEvent) ? fetchedEvent : curr));
      }
      if (fetchedOrg && !new URLSearchParams(window.location.search).get('org')) {
        setOrgSettings((curr) => (JSON.stringify(curr) !== JSON.stringify(fetchedOrg) ? fetchedOrg : curr));
      }
    } catch (err) {
      console.warn('[TaskToggleContext] Initial sync error:', err);
    }
  }, [currentUser, triggerTaskAlert]);

  // Fetch initial data on mount + periodic cloud sync poll (every 30 seconds fallback)
  useEffect(() => {
    refreshData();
    const pollInterval = setInterval(() => {
      refreshData();
    }, 30000);
    return () => clearInterval(pollInterval);
  }, [refreshData]);

  // Real-time synchronization subscription (Cloud WebSockets via Supabase)
  useEffect(() => {
    const unsubscribe = backendApi.subscribeToTasks((payload) => {
      if (payload.eventType === 'INSERT') {
        const newTask = mapDbTaskToFrontend(payload.new);
        setTasks((prev) => {
          if (prev.some((t) => t.id === newTask.id)) return prev;
          return [newTask, ...prev];
        });

        // Trigger sound & prominent in-app visual popup card if allotted to current user
        if (newTask.assignedTo === currentUser.id) {
          knownTaskIdsRef.current.add(newTask.id);
          triggerTaskAlert({
            id: newTask.id,
            title: newTask.type === 'admin' ? 'New Task from Admin' : `Task from ${newTask.createdByName || 'Colleague'}`,
            message: `Due: ${newTask.dueDate} ${newTask.dueTime}`,
            taskTitle: newTask.title,
            senderName: newTask.createdByName || (newTask.type === 'admin' ? 'Deepak (Admin)' : 'Colleague'),
            dueDate: newTask.dueDate,
            dueTime: newTask.dueTime,
            priority: newTask.priority,
            type: newTask.type === 'admin' ? 'admin' : 'staff',
          });
        }
      } else if (payload.eventType === 'UPDATE') {
        const updatedTask = mapDbTaskToFrontend(payload.new);

        // Deduplication: If this task was updated by the current client in the last 4 seconds, ignore server echo
        const lastUpdated = recentlyUpdatedTasksRef.current.get(updatedTask.id);
        if (lastUpdated && Date.now() - lastUpdated < 6000) {
          return;
        }

        const prevTask = tasksRef.current.find((t) => t.id === updatedTask.id);

        // Deduplication: Only trigger re-render if the incoming update differs from local state
        const hasChange =
          !prevTask ||
          prevTask.status !== updatedTask.status ||
          (prevTask.completedAt || undefined) !== (updatedTask.completedAt || undefined) ||
          (prevTask.pendingReason || undefined) !== (updatedTask.pendingReason || undefined) ||
          (prevTask.rejectReason || undefined) !== (updatedTask.rejectReason || undefined) ||
          prevTask.title !== updatedTask.title ||
          prevTask.dueDate !== updatedTask.dueDate ||
          prevTask.dueTime !== updatedTask.dueTime ||
          prevTask.assignedTo !== updatedTask.assignedTo;

        if (hasChange) {
          const next = tasksRef.current.map((t) => (t.id === updatedTask.id ? updatedTask : t));
          tasksRef.current = next;
          setTasks(next);
        }

        const isCreator = updatedTask.createdBy === currentUser.id;
        const newReasonReported =
          updatedTask.pendingReason &&
          (!prevTask || prevTask.pendingReason !== updatedTask.pendingReason);

        if (isCreator && updatedTask.pendingReason && newReasonReported) {
          playAssignmentAlertSound();
          triggerTaskAlert({
            id: updatedTask.id,
            title: `⚠️ Issue Reported by ${updatedTask.assignedToName}`,
            message: `"${updatedTask.pendingReason.replace(/^\[DECLINED\]:\s*/, '')}"`,
            taskTitle: updatedTask.title,
            senderName: updatedTask.assignedToName,
            dueDate: updatedTask.dueDate,
            dueTime: updatedTask.dueTime,
            priority: updatedTask.priority,
            type: 'issue',
          });
        } else if (
          isCreator &&
          updatedTask.status === 'rejected' &&
          (!prevTask || prevTask.status !== 'rejected')
        ) {
          playAssignmentAlertSound();
          triggerTaskAlert({
            id: updatedTask.id,
            title: `❌ Task Declined by ${updatedTask.assignedToName}`,
            message: `"${updatedTask.rejectReason || updatedTask.pendingReason?.replace(/^\[DECLINED\]:\s*/, '') || 'Declined'}"`,
            taskTitle: updatedTask.title,
            senderName: updatedTask.assignedToName,
            dueDate: updatedTask.dueDate,
            dueTime: updatedTask.dueTime,
            priority: updatedTask.priority,
            type: 'decline',
          });
        } else if (
          isCreator &&
          updatedTask.status === 'done' &&
          prevTask?.status !== 'done' &&
          updatedTask.assignedTo !== currentUser.id
        ) {
          playAssignmentAlertSound();
          triggerTaskAlert({
            id: updatedTask.id,
            title: `🎉 Task Completed by ${updatedTask.assignedToName}`,
            message: `Finished at ${updatedTask.completedAt || 'today'}`,
            taskTitle: updatedTask.title,
            senderName: updatedTask.assignedToName,
            dueDate: updatedTask.dueDate,
            dueTime: updatedTask.dueTime,
            priority: updatedTask.priority,
            type: 'staff',
          });
        }
      } else if (payload.eventType === 'DELETE') {
        const deletedId = payload.old.id;
        setTasks((prev) => prev.filter((t) => t.id !== deletedId));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, triggerTaskAlert]);

  // Cross-Tab Instant Synchronization (BroadcastChannel + LocalStorage Event)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel('tasktoggle_realtime_sync');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;
        if (data.senderTabId && data.senderTabId === currentTabIdRef.current) return;

        if (data.type === 'TASKS_UPDATE' && Array.isArray(data.tasks)) {
          if (data.taskId) {
            const lastUpdated = recentlyUpdatedTasksRef.current.get(data.taskId);
            if (lastUpdated && Date.now() - lastUpdated < 6000) {
              return;
            }
          }
          tasksRef.current = data.tasks;
          setTasks(data.tasks);

          // If a new task was assigned to the currently logged-in user in this tab
          const isTargeted =
            data.assignedTo === currentUser.id ||
            (Array.isArray(data.staffIds) && data.staffIds.includes(currentUser.id));

          if (data.action === 'ASSIGN' && isTargeted) {
            playAssignmentAlertSound();
            triggerTaskAlert({
              id: `assign_${Date.now()}`,
              title: `New Task from ${data.senderName || 'Admin'}`,
              message: `Due: ${data.dueDate || ''} ${data.dueTime || ''}`,
              taskTitle: data.taskTitle || 'Assigned Work',
              senderName: data.senderName || 'Admin',
              dueDate: data.dueDate,
              dueTime: data.dueTime,
              priority: data.priority,
              type: data.isStaffToStaff ? 'staff' : 'admin',
            });
          } else if (data.action === 'COMPLETED_BY_STAFF' && data.taskCreatorId === currentUser.id && data.completedByUserId !== currentUser.id) {
            playAssignmentAlertSound();
            triggerTaskAlert({
              id: `completed_${Date.now()}`,
              title: `🎉 Task Completed by ${data.completedBy || 'Staff'}`,
              message: `Finished and struck done at ${data.completedAt || 'today'}.`,
              taskTitle: data.taskTitle || 'Assigned Work',
              senderName: data.completedBy || 'Staff',
              dueDate: data.dueDate,
              dueTime: data.dueTime,
              type: 'staff',
            });
          } else if (data.action === 'DECLINE' && data.taskCreatorId === currentUser.id) {
            playAssignmentAlertSound();
            triggerTaskAlert({
              id: `decline_${Date.now()}`,
              title: `Task Declined by ${data.declinedBy || 'Colleague'}`,
              message: `"${data.reason || 'Declined'}"`,
              taskTitle: data.taskTitle || 'Assigned Work',
              senderName: data.declinedBy || 'Colleague',
              type: 'decline',
            });
          } else if (data.action === 'ISSUE_REPORTED' && data.taskCreatorId === currentUser.id) {
            playAssignmentAlertSound();
            triggerTaskAlert({
              id: `issue_${Date.now()}`,
              title: `⚠️ Issue Reported by ${data.reportedBy || 'Colleague'}`,
              message: `"${data.reason || 'Pending Issue'}"`,
              taskTitle: data.taskTitle || 'Assigned Work',
              senderName: data.reportedBy || 'Colleague',
              type: 'issue',
            });
          }
        }

        if (data.type === 'EVENT_TIMING_UPDATE') {
          if (data.eventTiming) {
            setEventTiming(data.eventTiming);
          }
          const isAllotted =
            Array.isArray(data.allottedStaffIds) && data.allottedStaffIds.includes(currentUser.id);
          if (isAllotted) {
            playAssignmentAlertSound();
            triggerTaskAlert({
              id: `event_${Date.now()}`,
              title: `🗓️ Special Schedule Allotted by ${data.senderName || 'Admin'}`,
              taskTitle: data.eventName || 'Special Event Schedule',
              message: `Special Office Hours: ${data.timing} on ${data.date}`,
              senderName: data.senderName || 'Admin',
              dueDate: data.date,
              dueTime: data.timing,
              priority: 'High',
              type: 'event',
            });
          }
        }
      };
    }

    return () => {
      if (channel) channel.close();
    };
  }, [currentUser, sendTaskAssignmentNotification]);

  // Sync role and view from URL if embedded from ConnectX
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'admin' || roleParam === 'staff') {
      const match = users.find((u) => u.role === roleParam);
      if (match) {
        setCurrentUser(match);
        setCurrentPage(roleParam === 'admin' ? 'dashboard' : 'mytodo');
      }
    }
  }, [users]);

  // Sync state to localStorage for offline cache
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}office_timing`, JSON.stringify(officeTiming));
  }, [officeTiming]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}event_timing`, JSON.stringify(eventTiming));
  }, [eventTiming]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user_id`, currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}org_settings`, JSON.stringify(orgSettings));
  }, [orgSettings]);

  // 30-Minute Pending Task Due Reminder Engine
  useEffect(() => {
    const checkUpcomingDeadlines = () => {
      const now = new Date();

      tasks.forEach((task) => {
        // STRICT USER REQUIREMENT:
        // "if the staff completd the work no notification needs to create if its pending only give a notification sound"
        if (task.status === 'done' || task.status === 'rejected') {
          // If the task is completed or rejected, absolutely NO notification or sound is created!
          return;
        }

        // STRICT USER REQUIREMENT:
        // Only alert the person who is personally assigned to execute this task!
        // Admin only receives due reminders for Admin's personal tasks; Staff only receives due reminders for their own tasks.
        // Admin will NEVER receive due reminder popups for staff target tasks.
        if (task.assignedTo !== currentUser.id) {
          return;
        }

        if (!task.dueDate || !task.dueTime) return;

        const deadline = parseTaskDeadline(task.dueDate, task.dueTime);
        if (!deadline) return;

        const diffMs = deadline.getTime() - now.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        // Check if within the 30-minute window before due time (diffMinutes <= 30 and deadline hasn't expired by more than 2 mins)
        if (diffMinutes >= -2 && diffMinutes <= 30) {
          const reminderKey = `${task.id}_${task.dueTime}`;

          if (!notifiedRemindersRef.current.has(reminderKey)) {
            notifiedRemindersRef.current.add(reminderKey);

            const minsLeft = Math.max(1, Math.round(diffMinutes));

            // 1. Play dedicated 30-minute alert reminder sound (audible tone)
            playThirtyMinReminderSound();

            // 2. Desktop Native OS Notification (pops up over other apps without injecting an in-app card)
            if (typeof window !== 'undefined' && 'Notification' in window) {
              const notifTitle = `⏰ 30-Min Due Reminder: "${task.title}"`;
              const notifBody = `Due in ${minsLeft} minutes (at ${task.dueTime})! Please complete or strike it.`;

              if (Notification.permission === 'granted') {
                try {
                  new Notification(notifTitle, {
                    body: notifBody,
                    icon: '/favicon.ico',
                    tag: `reminder_${task.id}`,
                  });
                } catch (e) {}
              } else if (Notification.permission === 'default') {
                Notification.requestPermission().then((perm) => {
                  if (perm === 'granted') {
                    try {
                      new Notification(notifTitle, { body: notifBody, icon: '/favicon.ico' });
                    } catch (e) {}
                  }
                });
              }
            }
          }
        }
      });
    };

    checkUpcomingDeadlines();
    const interval = setInterval(checkUpcomingDeadlines, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [tasks, currentUser]);

  useEffect(() => {
    if (currentUser?.id) {
      checkAndTriggerPendingStaffAlerts(currentUser.id, triggerTaskAlert);
    }
  }, [currentUser?.id, triggerTaskAlert]);

  // Automated 1-Hour-Before Special Event Duty Notification for Allotted Staff
  useEffect(() => {
    if (!eventTiming?.isActive || !Array.isArray(eventTiming.allottedStaffIds)) {
      return;
    }

    const checkOneHourReminder = () => {
      // Only proceed if current active user is one of the allotted staff members
      if (!eventTiming.allottedStaffIds.includes(currentUser.id)) {
        return;
      }

      const eventStart = parseEventStartDateTime(eventTiming.date, eventTiming.newTiming);
      if (!eventStart) return;

      const now = Date.now();
      const diffMs = eventStart.getTime() - now;
      // If within 60 minutes before start time (0 < diffMs <= 60 * 60 * 1000)
      const isWithinOneHourBefore = diffMs > 0 && diffMs <= 60 * 60 * 1000;

      if (isWithinOneHourBefore) {
        const reminderKey = `event_1hr_notified_${eventTiming.id}_${eventTiming.date}_${currentUser.id}`;
        if (!sessionStorage.getItem(reminderKey)) {
          sessionStorage.setItem(reminderKey, 'true');
          const minutesLeft = Math.max(1, Math.round(diffMs / 60000));
          const startTimeStr = eventTiming.newTiming?.split(/[-–—]/)[0]?.trim() || '';

          playAssignmentAlertSound();
          triggerTaskAlert({
            id: `event_1hr_${Date.now()}`,
            title: `⏰ 1-Hour Special Event Reminder (${minutesLeft}m left)`,
            taskTitle: eventTiming.eventName,
            message: `Starts in ${minutesLeft} minutes at ${startTimeStr}! Special Shift: ${eventTiming.newTiming} on ${eventTiming.date}.`,
            senderName: 'Admin',
            dueDate: eventTiming.date,
            dueTime: eventTiming.newTiming,
            priority: 'High',
            type: 'event',
          });
        }
      }
    };

    checkOneHourReminder();
    const interval = setInterval(checkOneHourReminder, 20000); // Check every 20 seconds
    return () => clearInterval(interval);
  }, [eventTiming, currentUser.id, triggerTaskAlert]);

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setActiveDueReminder(null);
      setCurrentUser(user);
      if (user.role === 'admin') {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('mytodo');
      }
      checkAndTriggerPendingStaffAlerts(user.id, triggerTaskAlert);
    }
  };

  const login = (email: string, role: Role) => {
    const user =
      users.find((u) => u.role === role && (u.email.toLowerCase() === email.toLowerCase() || !email)) ||
      users.find((u) => u.role === role);
    if (user) {
      setActiveDueReminder(null);
      setCurrentUser(user);
      setCurrentPage(user.role === 'admin' ? 'dashboard' : 'mytodo');
      checkAndTriggerPendingStaffAlerts(user.id, triggerTaskAlert);
    }
  };

  const logout = () => {
    setActiveDueReminder(null);
    setCurrentPage('login');
  };

  // Rule 1: Admin assigns task to one or more staff (Compulsory)
  const assignAdminTask = (data: {
    title: string;
    description: string;
    staffIds: string[];
    dueDate: string;
    dueTime: string;
    priority: TaskPriority;
  }) => {
    const newTasks: Task[] = data.staffIds.map((staffId) => {
      const staffUser = users.find((u) => u.id === staffId);
      return {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: data.title,
        description: data.description,
        createdBy: currentUser.id,
        createdByName: 'Admin',
        assignedTo: staffId,
        assignedToName: staffUser?.name || 'Staff Member',
        type: 'admin',
        priority: data.priority,
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
    });

    // Optimistic UI update
    setTasks((prev) => [...newTasks, ...prev]);

    // Trigger notification sound and native desktop alert over all apps
    sendTaskAssignmentNotification(
      'New Task from Admin (Deepak)',
      `${data.title} · Due: ${data.dueDate} ${data.dueTime}`
    );

    // Backend database persistence
    newTasks.forEach((t) => {
      backendApi.createTask(t).catch((err) => console.warn('[Backend] assign error:', err));
    });

    // Queue persistent notification alert for each assigned staff member
    if (Array.isArray(data.staffIds)) {
      data.staffIds.forEach((staffId) => {
        const alert: TaskAlert = {
          id: `task_${Date.now()}_${staffId}`,
          title: `New Task from ${currentUser.name || 'Admin'}`,
          taskTitle: data.title,
          message: `Due: ${data.dueDate} · ${data.dueTime}`,
          senderName: currentUser.name || (orgSettings.orgName ? `${orgSettings.orgName} (Admin)` : 'Deepak (Admin)'),
          dueDate: data.dueDate,
          dueTime: data.dueTime,
          priority: data.priority,
          type: 'admin',
        };
        queuePendingStaffAlert(staffId, alert);
      });
    }

    // Cross-tab / cross-window instant broadcast
    broadcastEvent({
      type: 'TASKS_UPDATE',
      action: 'ASSIGN',
      tasks: [...newTasks, ...tasks],
      staffIds: data.staffIds,
      assignedTo: data.staffIds[0],
      taskTitle: data.title,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      senderName: 'Admin',
    });
  };

  // Rule 1b: Admin assigns daily task to themselves (Personal Daily Agenda)
  const assignAdminPersonalTask = (data: {
    title: string;
    description?: string;
    dueDate: string;
    dueTime: string;
    priority: TaskPriority;
  }) => {
    const newTask: Task = {
      id: `task_admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: data.title,
      description: data.description || '',
      createdBy: currentUser.id,
      createdByName: currentUser.name || 'Admin',
      assignedTo: currentUser.id,
      assignedToName: currentUser.name || 'Admin',
      type: 'self',
      priority: data.priority,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    playRewardChime();
    backendApi.createTask(newTask).catch((err) => console.warn('[Backend] assignAdminPersonalTask error:', err));
  };

  // Rule 2: Staff creates task for self or other staff
  const createStaffTask = (data: {
    title: string;
    details: string;
    createForUserId: string;
    dueDate: string;
    dueTime: string;
  }) => {
    const isSelf = data.createForUserId === currentUser.id;
    const targetUser = users.find((u) => u.id === data.createForUserId);

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: data.title,
      description: data.details,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      assignedTo: data.createForUserId,
      assignedToName: targetUser?.name || currentUser.name,
      type: isSelf ? 'self' : 'staff',
      priority: 'Medium',
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setTasks((prev) => [newTask, ...prev]);

    if (!isSelf) {
      const alert: TaskAlert = {
        id: `staff_task_${Date.now()}_${data.createForUserId}`,
        title: `New Task from ${currentUser.name}`,
        taskTitle: data.title,
        message: `Due: ${data.dueDate} · ${data.dueTime}`,
        senderName: currentUser.name,
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        priority: 'Medium',
        type: 'staff',
      };
      queuePendingStaffAlert(data.createForUserId, alert);

      sendTaskAssignmentNotification(
        `New Task from ${currentUser.name}`,
        `${data.title} · Due: ${data.dueTime}`
      );
    }

    // Backend database persistence
    backendApi.createTask(newTask).catch((err) => console.warn('[Backend] create error:', err));

    // Cross-tab / cross-window instant broadcast
    broadcastEvent({
      type: 'TASKS_UPDATE',
      action: 'ASSIGN',
      tasks: [newTask, ...tasks],
      assignedTo: data.createForUserId,
      taskTitle: data.title,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      senderName: currentUser.name,
      priority: 'Medium',
      isStaffToStaff: !isSelf,
    });
  };

  // Rule 3: Toggle task completed / pending with audio reward chime (single-click strike & revoke lock)
  const toggleTaskStatus = (taskId: string) => {
    // Fast in-flight debouncing lock: prevent accidental double-clicks or duplicate browser events
    if (inFlightTogglesRef.current.has(taskId)) {
      return;
    }
    inFlightTogglesRef.current.add(taskId);
    setTimeout(() => {
      inFlightTogglesRef.current.delete(taskId);
    }, 600);

    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentTasks = tasksRef.current;
    const target = currentTasks.find((t) => t.id === taskId);
    if (!target) return;

    // STRICT USER REQUIREMENT:
    // If a task has been rejected/declined, it CANNOT be struck or completed!
    if (target.status === 'rejected') {
      return;
    }

    // STRICT PERMISSION RULE:
    // Only the staff member assigned to complete the work (or Admin) can strike the task done!
    // A staff member who gave/delegated the task cannot strike it for someone else.
    if (currentUser.role === 'staff' && target.assignedTo !== currentUser.id) {
      return;
    }

    const isDone = target.status === 'done';
    const updatedStatus: 'pending' | 'accepted' | 'done' = isDone
      ? target.type === 'staff' && !target.acceptedAt
        ? 'pending'
        : target.type === 'staff'
        ? 'accepted'
        : 'pending'
      : 'done';
    const updatedCompletedAt = isDone ? undefined : nowTimeStr;

    // Stamp with timestamp to block all incoming server echo updates for 6 seconds
    recentlyUpdatedTasksRef.current.set(taskId, Date.now());

    const nextTasks: Task[] = currentTasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: updatedStatus,
            completedAt: updatedCompletedAt,
          }
        : t
    );

    tasksRef.current = nextTasks;
    setTasks(nextTasks);

    // Play pleasant dopamine chime when task is marked done
    if (updatedStatus === 'done') {
      setActiveDueReminder((prev) => (prev?.task.id === taskId ? null : prev));
      const taskTitle = target.title || 'Assigned Task';
      const staffName = target.assignedToName || currentUser.name;
      sendTaskCompletedNotification(taskTitle, staffName);

      // Notify the work giver (Admin or colleague who assigned this task)
      if (target.createdBy && target.createdBy !== currentUser.id) {
        const completionAlert: TaskAlert = {
          id: `completed_${Date.now()}_${target.id}`,
          title: `🎉 Task Completed by ${currentUser.name}`,
          taskTitle: target.title,
          message: `Finished and struck completed at ${nowTimeStr}.`,
          senderName: currentUser.name,
          dueDate: target.dueDate,
          dueTime: target.dueTime,
          priority: target.priority,
          type: 'staff',
        };
        queuePendingStaffAlert(target.createdBy, completionAlert);
      }
    }

    // Backend database update
    backendApi.updateTask(taskId, {
      status: updatedStatus,
      completedAt: updatedCompletedAt,
    }).catch((err) => console.warn('[Backend] toggle error:', err));

    // Cross-tab / cross-window instant broadcast
    broadcastEvent({
      type: 'TASKS_UPDATE',
      action: updatedStatus === 'done' ? 'COMPLETED_BY_STAFF' : 'TOGGLE',
      tasks: nextTasks,
      taskId,
      status: updatedStatus,
      completedBy: currentUser.name,
      completedByUserId: currentUser.id,
      taskCreatorId: target.createdBy,
      taskTitle: target.title,
      dueDate: target.dueDate,
      dueTime: target.dueTime,
      completedAt: nowTimeStr,
    });
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    backendApi.deleteTask(taskId).catch((err) => console.warn('[Backend] deleteTask error:', err));
  };

  // Productivity Feature: 1-Click Strike All Finished
  const completeAllTasks = () => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const now = Date.now();

    const nextTasks: Task[] = tasks.map((t) => {
      const isEligible = currentUser.role === 'admin' || t.assignedTo === currentUser.id;
      if (isEligible && t.status !== 'done' && t.status !== 'rejected') {
        recentlyUpdatedTasksRef.current.set(t.id, now);
        backendApi.updateTask(t.id, { status: 'done', completedAt: nowTimeStr }).catch(() => {});
        return {
          ...t,
          status: 'done' as const,
          completedAt: nowTimeStr,
        };
      }
      return t;
    });

    tasksRef.current = nextTasks;
    setTasks(nextTasks);

    sendTaskCompletedNotification('All Assigned Tasks Batch', currentUser.name);
  };

  // Productivity Feature: Quick 1-Tap Snooze / Reschedule
  const snoozeTask = (taskId: string, minutes: number) => {
    setActiveDueReminder((prev) => (prev?.task.id === taskId ? null : prev));
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const newDueTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    recentlyUpdatedTasksRef.current.set(taskId, Date.now());
    backendApi.updateTask(taskId, { dueTime: newDueTime }).catch(() => {});

    const nextTasks = tasks.map((t) => (t.id === taskId ? { ...t, dueTime: newDueTime } : t));
    tasksRef.current = nextTasks;
    setTasks(nextTasks);
  };

  // Rule 4: Accept incoming staff-to-staff task request
  const acceptTaskRequest = (taskId: string) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    recentlyUpdatedTasksRef.current.set(taskId, Date.now());

    const nextTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'accepted' as const,
          acceptedAt: nowTimeStr,
        };
      }
      return t;
    });

    tasksRef.current = nextTasks;
    setTasks(nextTasks);

    // Backend database update
    backendApi.updateTask(taskId, {
      status: 'accepted',
      acceptedAt: nowTimeStr,
    }).catch((err) => console.warn('[Backend] accept error:', err));
  };


  // Reject incoming staff-to-staff task request with reason
  const rejectTaskRequest = (taskId: string, reason: string) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const trimmedReason = reason.trim();
    const target = tasks.find((t) => t.id === taskId);

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'rejected' as const,
            rejectReason: trimmedReason,
            rejectedAt: nowTimeStr,
            pendingReason: `[DECLINED]: ${trimmedReason}`,
            pendingReasonUpdatedAt: nowTimeStr,
          };
        }
        return t;
      })
    );

    // Send alert sound and native notification to task creator & admin
    playAssignmentAlertSound();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const notifTitle = `Task Declined: ${target?.title || 'Assigned Work'}`;
      const notifBody = `${currentUser.name} declined: "${trimmedReason}"`;
      if (Notification.permission === 'granted') {
        try {
          new Notification(notifTitle, { body: notifBody, icon: '/favicon.ico' });
        } catch (e) {}
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            try {
              new Notification(notifTitle, { body: notifBody, icon: '/favicon.ico' });
            } catch (e) {}
          }
        });
      }
    }

    // Backend database update
    backendApi.updateTask(taskId, {
      status: 'rejected',
      pendingReason: `[DECLINED]: ${trimmedReason}`,
      rejectReason: trimmedReason,
      rejectedAt: nowTimeStr,
    }).catch((err) => console.warn('[Backend] reject error:', err));

    // Cross-tab / cross-window instant broadcast
    broadcastEvent({
      type: 'TASKS_UPDATE',
      action: 'DECLINE',
      tasks: tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'rejected' as const,
              rejectReason: trimmedReason,
              rejectedAt: nowTimeStr,
              pendingReason: `[DECLINED]: ${trimmedReason}`,
              pendingReasonUpdatedAt: nowTimeStr,
            }
          : t
      ),
      taskCreatorId: target?.createdBy,
      declinedBy: currentUser.name,
      reason: trimmedReason,
    });
  };

  // Move a declined/delegated task to the current user's own to-do list
  const moveToMyOwnToDo = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            assignedTo: currentUser.id,
            assignedToName: currentUser.name,
            type: 'self' as const,
            status: 'pending' as const,
            rejectReason: undefined,
            rejectedAt: undefined,
            pendingReason: undefined,
            pendingReasonUpdatedAt: undefined,
          };
        }
        return t;
      })
    );
    backendApi.updateTask(taskId, {
      assignedTo: currentUser.id,
      assignedToName: currentUser.name,
      type: 'self',
      status: 'pending',
      pendingReason: undefined,
      rejectReason: undefined,
      rejectedAt: undefined,
    }).catch(() => {});
  };

  // Reassign a declined/delegated task to another colleague
  const reassignTask = (taskId: string, newAssignedToId: string) => {
    const targetUser = users.find((u) => u.id === newAssignedToId);
    if (!targetUser) return;
    const isSelf = newAssignedToId === currentUser.id;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            assignedTo: newAssignedToId,
            assignedToName: targetUser.name,
            type: isSelf ? ('self' as const) : ('staff' as const),
            status: 'pending' as const,
            rejectReason: undefined,
            rejectedAt: undefined,
            pendingReason: undefined,
            pendingReasonUpdatedAt: undefined,
          };
        }
        return t;
      })
    );

    sendTaskAssignmentNotification(
      `Task Delegated from ${currentUser.name}`,
      `Task reassigned to ${targetUser.name}`
    );

    backendApi.updateTask(taskId, {
      assignedTo: newAssignedToId,
      assignedToName: targetUser.name,
      type: isSelf ? 'self' : 'staff',
      status: 'pending',
      pendingReason: undefined,
      rejectReason: undefined,
      rejectedAt: undefined,
    }).catch(() => {});
  };

  // Rule 5: Staff reports reason / issue for pending task
  const reportPendingReason = (taskId: string, reason: string) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const trimmed = reason.trim();
    const target = tasks.find((t) => t.id === taskId);

    recentlyUpdatedTasksRef.current.set(taskId, Date.now());

    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          pendingReason: trimmed,
          pendingReasonUpdatedAt: nowTimeStr,
        };
      }
      return t;
    });

    tasksRef.current = updatedTasks;
    setTasks(updatedTasks);

    // Backend database update
    backendApi.updateTask(taskId, {
      pendingReason: trimmed,
      pendingReasonUpdatedAt: nowTimeStr,
    }).catch((err) => console.warn('[Backend] reason report error:', err));

    // Native browser notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const notifTitle = `Issue Reported: ${target?.title || 'Assigned Work'}`;
      const notifBody = `${currentUser.name} reported: "${trimmed}"`;
      if (Notification.permission === 'granted') {
        try {
          new Notification(notifTitle, { body: notifBody, icon: '/favicon.ico' });
        } catch (e) {}
      }
    }

    // Cross-tab broadcast
    broadcastEvent({
      type: 'TASKS_UPDATE',
      action: 'ISSUE_REPORTED',
      tasks: updatedTasks,
      taskId,
      taskTitle: target?.title || 'Assigned Task',
      reason: trimmed,
      reportedBy: currentUser.name,
      taskCreatorId: target?.createdBy,
    });
  };

  // Rule 6: Admin updates office timing (Owner access)
  const updateOfficeTiming = (newTiming: OfficeTiming) => {
    setOfficeTiming(newTiming);
    backendApi.updateOfficeTiming(newTiming).catch((err) => console.warn('[Backend] timing error:', err));
  };

  // Rule 7: Admin updates event timing & staff allotment (Owner access)
  const updateEventTiming = (newEvent: EventTiming) => {
    setEventTiming(newEvent);
    backendApi.updateEventTiming(newEvent).catch((err) => console.warn('[Backend] event timing error:', err));

    const sender = currentUser.name || (orgSettings.orgName ? `${orgSettings.orgName} (Admin)` : 'Deepak (Admin)');

    // 1. Play alert sound feedback
    playAssignmentAlertSound();

    // 2. Queue persistent notification alert for each allotted staff member
    if (Array.isArray(newEvent.allottedStaffIds)) {
      newEvent.allottedStaffIds.forEach((staffId) => {
        const alert: TaskAlert = {
          id: `event_${Date.now()}_${staffId}`,
          title: `🗓️ Special Schedule Allotted by ${sender}`,
          taskTitle: newEvent.eventName || 'Special Event Schedule',
          message: `Special Office Hours: ${newEvent.newTiming} on ${newEvent.date}`,
          senderName: sender,
          dueDate: newEvent.date,
          dueTime: newEvent.newTiming,
          priority: 'High',
          type: 'event',
        };
        queuePendingStaffAlert(staffId, alert);
      });
    }

    // 3. Real-time broadcast across all open tabs and windows
    broadcastEvent({
      type: 'EVENT_TIMING_UPDATE',
      eventTiming: newEvent,
      allottedStaffIds: newEvent.allottedStaffIds,
      eventName: newEvent.eventName,
      date: newEvent.date,
      timing: newEvent.newTiming,
      senderName: sender,
    });

    // 4. If current active user in this tab is one of the allotted staff members
    if (Array.isArray(newEvent.allottedStaffIds) && newEvent.allottedStaffIds.includes(currentUser.id)) {
      triggerTaskAlert({
        id: `event_${Date.now()}_self`,
        title: `🗓️ Special Schedule Allotted by ${sender}`,
        taskTitle: newEvent.eventName || 'Special Event Schedule',
        message: `Special Office Hours: ${newEvent.newTiming} on ${newEvent.date}`,
        senderName: sender,
        dueDate: newEvent.date,
        dueTime: newEvent.newTiming,
        priority: 'High',
        type: 'event',
      });
    }
  };

  const addStaffUser = (name: string, email: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const initials = trimmedName
      .split(/\s+/)
      .map((part) => part[0]?.toUpperCase() || '')
      .slice(0, 2)
      .join('');

    const colors = [
      'bg-indigo-600',
      'bg-blue-600',
      'bg-purple-600',
      'bg-teal-600',
      'bg-rose-600',
      'bg-emerald-600',
      'bg-fuchsia-600',
      'bg-amber-600',
    ];
    const avatarBg = colors[Math.floor(Math.random() * colors.length)];

    const newStaff: User = {
      id: `staff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      email: email.trim().toLowerCase() || `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      role: 'staff',
      initials: initials || 'ST',
      avatarBg,
    };

    setUsers((prev) => [...prev, newStaff]);
    backendApi.createUser(newStaff).catch((err) => console.warn('[Backend] createUser error:', err));
  };

  const deleteStaffUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setTasks((prev) => prev.filter((t) => t.assignedTo !== userId));
    backendApi.deleteUser(userId).catch((err) => console.warn('[Backend] deleteUser error:', err));
  };

  const clearAllTasks = () => {
    setTasks([]);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify([]));
  };

  const updateOrgSettings = (settings: Partial<OrgSettings>) => {
    setOrgSettings((prev) => {
      const updated = { ...prev, ...settings };
      backendApi.updateOrgSettings(updated).catch((err) => console.warn('[Backend] org error:', err));
      return updated;
    });
  };

  return (
    <TaskToggleContext.Provider
      value={{
        currentUser,
        users,
        tasks,
        officeTiming,
        eventTiming,
        orgSettings,
        currentPage,
        showCompleted,
        isBackendConnected,
        setShowCompleted,
        setCurrentPage,
        switchUser,
        login,
        logout,
        assignAdminTask,
        assignAdminPersonalTask,
        createStaffTask,
        toggleTaskStatus,
        deleteTask,
        completeAllTasks,
        snoozeTask,
        playCompletionSound: playRewardChime,
        playCalendarClickSound,
        playAssignmentAlertSound,
        sendTaskNotification: sendTaskAssignmentNotification,
        acceptTaskRequest,
        rejectTaskRequest,
        moveToMyOwnToDo,
        reassignTask,
        requestViewTab,
        setRequestViewTab,
        sendTaskCompletedNotification,
        reportPendingReason,
        updateOfficeTiming,
        updateEventTiming,
        updateOrgSettings,
        activeDueReminder,
        dismissDueReminder,
        triggerDueReminderPreview,
        playThirtyMinReminderSound,
        addStaffUser,
        deleteStaffUser,
        clearAllTasks,
        refreshData,
        activeTaskAlert,
        dismissTaskAlert,
        triggerTaskAlert,
        themePreset,
        setThemePreset,
        bgCanvas,
        setBgCanvas,
        fontFamily,
        setFontFamily,
      }}
    >
      {children}
    </TaskToggleContext.Provider>
  );
};

export const useTaskToggle = () => {
  const context = useContext(TaskToggleContext);
  if (!context) {
    throw new Error('useTaskToggle must be used within a TaskToggleProvider');
  }
  return context;
};
