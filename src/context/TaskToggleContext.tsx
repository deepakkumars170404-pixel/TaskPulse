import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Task, OfficeTiming, EventTiming, OrgSettings, Role, TaskPriority } from '../types';
import {
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_OFFICE_TIMING,
  INITIAL_EVENT_TIMING,
  INITIAL_ORG_SETTINGS,
} from '../data/initialData';
import { backendApi } from '../services/backendApi';
import { mapDbTaskToFrontend } from '../lib/supabase';

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
  createStaffTask: (data: {
    title: string;
    details: string;
    createForUserId: string;
    dueDate: string;
    dueTime: string;
  }) => void;
  toggleTaskStatus: (taskId: string) => void;
  completeAllTasks: () => void;
  snoozeTask: (taskId: string, minutes: number) => void;
  playCompletionSound: () => void;
  playCalendarClickSound: () => void;
  sendTaskNotification: (title: string, body: string) => void;
  acceptTaskRequest: (taskId: string) => void;
  rejectTaskRequest: (taskId: string, reason: string) => void;
  sendTaskCompletedNotification: (taskTitle: string, staffName: string) => void;
  reportPendingReason: (taskId: string, reason: string) => void;
  updateOfficeTiming: (timing: OfficeTiming) => void;
  updateEventTiming: (event: EventTiming) => void;
  updateOrgSettings: (settings: Partial<OrgSettings>) => void;
  refreshData: () => Promise<void>;
}

const TaskToggleContext = createContext<TaskToggleContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'tasktoggle_';

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

  // Users state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current active user
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user_id`);
    if (savedId) {
      const found = INITIAL_USERS.find((u) => u.id === savedId);
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

  const [currentPage, setCurrentPage] = useState<string>(() => {
    return currentUser.role === 'admin' ? 'dashboard' : 'mytodo';
  });

  const [showCompleted, setShowCompleted] = useState<boolean>(true);

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

      if (fetchedUsers && fetchedUsers.length > 0) setUsers(fetchedUsers);
      if (fetchedTasks) setTasks(fetchedTasks);
      if (fetchedOffice) setOfficeTiming(fetchedOffice);
      if (fetchedEvent) setEventTiming(fetchedEvent);
      if (fetchedOrg && !new URLSearchParams(window.location.search).get('org')) {
        setOrgSettings(fetchedOrg);
      }
    } catch (err) {
      console.warn('[TaskToggleContext] Initial sync error:', err);
    }
  }, []);

  // Fetch initial data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time synchronization subscription
  useEffect(() => {
    const unsubscribe = backendApi.subscribeToTasks((payload) => {
      if (payload.eventType === 'INSERT') {
        const newTask = mapDbTaskToFrontend(payload.new);
        setTasks((prev) => {
          if (prev.some((t) => t.id === newTask.id)) return prev;
          return [newTask, ...prev];
        });
      } else if (payload.eventType === 'UPDATE') {
        const updatedTask = mapDbTaskToFrontend(payload.new);
        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
      } else if (payload.eventType === 'DELETE') {
        const deletedId = payload.old.id;
        setTasks((prev) => prev.filter((t) => t.id !== deletedId));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('mytodo');
      }
    }
  };

  const login = (email: string, role: Role) => {
    const user =
      users.find((u) => u.role === role && (u.email.toLowerCase() === email.toLowerCase() || !email)) ||
      users.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      setCurrentPage(user.role === 'admin' ? 'dashboard' : 'mytodo');
    }
  };

  const logout = () => {
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
      sendTaskAssignmentNotification(
        `New Task from ${currentUser.name}`,
        `${data.title} · Due: ${data.dueTime}`
      );
    }

    // Backend database persistence
    backendApi.createTask(newTask).catch((err) => console.warn('[Backend] create error:', err));
  };

  // Rule 3: Toggle task completed / pending with audio reward chime
  const toggleTaskStatus = (taskId: string) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const isDone = target.status === 'done';
    const updatedStatus: 'pending' | 'accepted' | 'done' = isDone
      ? target.type === 'staff' && !target.acceptedAt
        ? 'pending'
        : target.type === 'staff'
        ? 'accepted'
        : 'pending'
      : 'done';
    const updatedCompletedAt = isDone ? undefined : nowTimeStr;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: updatedStatus,
              completedAt: updatedCompletedAt,
            }
          : t
      )
    );

    // Play pleasant dopamine chime when task is marked done
    if (updatedStatus === 'done') {
      const target = tasks.find((t) => t.id === taskId);
      const taskTitle = target?.title || 'Assigned Task';
      const staffName = target?.assignedToName || currentUser.name;
      sendTaskCompletedNotification(taskTitle, staffName);
    }

    // Backend database update
    backendApi.updateTask(taskId, {
      status: updatedStatus,
      completedAt: updatedCompletedAt,
    }).catch((err) => console.warn('[Backend] toggle error:', err));
  };

  // Productivity Feature: 1-Click Strike All Finished
  const completeAllTasks = () => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTasks((prev) =>
      prev.map((t) => {
        const isEligible = currentUser.role === 'admin' || t.assignedTo === currentUser.id;
        if (isEligible && t.status !== 'done') {
          backendApi.updateTask(t.id, { status: 'done', completedAt: nowTimeStr }).catch(() => {});
          return {
            ...t,
            status: 'done',
            completedAt: nowTimeStr,
          };
        }
        return t;
      })
    );

    sendTaskCompletedNotification('All Assigned Tasks Batch', currentUser.name);
  };

  // Productivity Feature: Quick 1-Tap Snooze / Reschedule
  const snoozeTask = (taskId: string, minutes: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const now = new Date();
          now.setMinutes(now.getMinutes() + minutes);
          const newDueTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          backendApi.updateTask(taskId, { dueTime: newDueTime }).catch(() => {});
          return {
            ...t,
            dueTime: newDueTime,
          };
        }
        return t;
      })
    );
  };

  // Rule 4: Accept incoming staff-to-staff task request
  const acceptTaskRequest = (taskId: string) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'accepted',
            acceptedAt: nowTimeStr,
          };
        }
        return t;
      })
    );

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
    }).catch((err) => console.warn('[Backend] reject error:', err));
  };

  // Rule 5: Staff reports reason / issue for pending task
  const reportPendingReason = (taskId: string, reason: string) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const trimmed = reason.trim();

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            pendingReason: trimmed,
            pendingReasonUpdatedAt: nowTimeStr,
          };
        }
        return t;
      })
    );

    // Backend database update
    backendApi.updateTask(taskId, {
      pendingReason: trimmed,
      pendingReasonUpdatedAt: nowTimeStr,
    }).catch((err) => console.warn('[Backend] reason report error:', err));
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
        createStaffTask,
        toggleTaskStatus,
        completeAllTasks,
        snoozeTask,
        playCompletionSound: playRewardChime,
        playCalendarClickSound,
        sendTaskNotification: sendTaskAssignmentNotification,
        acceptTaskRequest,
        rejectTaskRequest,
        sendTaskCompletedNotification,
        reportPendingReason,
        updateOfficeTiming,
        updateEventTiming,
        updateOrgSettings,
        refreshData,
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
