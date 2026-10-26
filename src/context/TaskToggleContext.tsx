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
  acceptTaskRequest: (taskId: string) => void;
  reportPendingReason: (taskId: string, reason: string) => void;
  updateOfficeTiming: (timing: OfficeTiming) => void;
  updateEventTiming: (event: EventTiming) => void;
  updateOrgSettings: (settings: Partial<OrgSettings>) => void;
  refreshData: () => Promise<void>;
}

const TaskToggleContext = createContext<TaskToggleContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'tasktoggle_';

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

  // Organization settings
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
      const [fetchedUsers, fetchedTasks, fetchedOffice, fetchedEvent] = await Promise.all([
        backendApi.getUsers(),
        backendApi.getTasks(),
        backendApi.getOfficeTiming(),
        backendApi.getEventTiming(),
      ]);

      if (fetchedUsers && fetchedUsers.length > 0) setUsers(fetchedUsers);
      if (fetchedTasks) setTasks(fetchedTasks);
      if (fetchedOffice) setOfficeTiming(fetchedOffice);
      if (fetchedEvent) setEventTiming(fetchedEvent);
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

    // Backend database persistence
    backendApi.createTask(newTask).catch((err) => console.warn('[Backend] create error:', err));
  };

  // Rule 3: Toggle task completed / pending
  const toggleTaskStatus = (taskId: string) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let updatedStatus: 'pending' | 'accepted' | 'done' = 'pending';
    let updatedCompletedAt: string | undefined = undefined;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === 'done';
          updatedStatus = isDone
            ? t.type === 'staff' && !t.acceptedAt
              ? 'pending'
              : t.type === 'staff'
              ? 'accepted'
              : 'pending'
            : 'done';
          updatedCompletedAt = isDone ? undefined : nowTimeStr;

          return {
            ...t,
            status: updatedStatus,
            completedAt: updatedCompletedAt,
          };
        }
        return t;
      })
    );

    // Backend database update
    backendApi.updateTask(taskId, {
      status: updatedStatus,
      completedAt: updatedCompletedAt,
    }).catch((err) => console.warn('[Backend] toggle error:', err));
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
    setOrgSettings((prev) => ({ ...prev, ...settings }));
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
        acceptTaskRequest,
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
