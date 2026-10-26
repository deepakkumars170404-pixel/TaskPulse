import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Task, OfficeTiming, EventTiming, OrgSettings, Role, TaskPriority } from '../types';
import {
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_OFFICE_TIMING,
  INITIAL_EVENT_TIMING,
  INITIAL_ORG_SETTINGS,
} from '../data/initialData';

interface TaskToggleContextType {
  currentUser: User;
  users: User[];
  tasks: Task[];
  officeTiming: OfficeTiming;
  eventTiming: EventTiming | null;
  orgSettings: OrgSettings;
  currentPage: string;
  showCompleted: boolean;
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
}

const TaskToggleContext = createContext<TaskToggleContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'tasktoggle_';

export const TaskToggleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent state or fall back to mock data
  const [users] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user_id`);
    if (savedId) {
      const found = INITIAL_USERS.find((u) => u.id === savedId);
      if (found) return found;
    }
    return INITIAL_USERS[0];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [officeTiming, setOfficeTiming] = useState<OfficeTiming>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}office_timing`);
    return saved ? JSON.parse(saved) : INITIAL_OFFICE_TIMING;
  });

  const [eventTiming, setEventTiming] = useState<EventTiming | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}event_timing`);
    return saved ? JSON.parse(saved) : INITIAL_EVENT_TIMING;
  });

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

  // Sync state to localStorage
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

    setTasks((prev) => [...newTasks, ...prev]);
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

    setTasks((prev) => [newTask, ...prev]);
  };

  // Rule 3: Toggle task completed / pending
  const toggleTaskStatus = (taskId: string) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === 'done';
          return {
            ...t,
            status: isDone
              ? t.type === 'staff' && !t.acceptedAt
                ? 'pending'
                : t.type === 'staff'
                ? 'accepted'
                : 'pending'
              : 'done',
            completedAt: isDone ? undefined : nowTimeStr,
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
  };

  // Rule 5: Staff reports reason / issue for pending task
  const reportPendingReason = (taskId: string, reason: string) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            pendingReason: reason.trim(),
            pendingReasonUpdatedAt: nowTimeStr,
          };
        }
        return t;
      })
    );
  };

  // Rule 6: Admin updates office timing (Owner access)
  const updateOfficeTiming = (newTiming: OfficeTiming) => {
    setOfficeTiming(newTiming);
  };

  // Rule 7: Admin updates event timing & staff allotment (Owner access)
  const updateEventTiming = (newEvent: EventTiming) => {
    setEventTiming(newEvent);
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
