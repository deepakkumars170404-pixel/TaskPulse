import React, { useState, useMemo } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { Task, getTaskDeclineReason } from '../../types';
import {
  Check,
  Clock,
  Calendar,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  MessageSquare,
  ShieldAlert,
  Send,
  X,
  CheckCircle2,
  MousePointerClick,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ArrowRight,
  Filter,
  CheckCheck,
  XCircle,
  RotateCcw,
  Trash2,
  Inbox,
  AlertCircle,
} from 'lucide-react';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ROUTINE_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

type RoutineDay = (typeof ROUTINE_DAYS)[number];

// Helper: Format date to 'DD MMM YYYY' matching task.dueDate (e.g. '27 Oct 2026')
function formatTaskDate(d: Date): string {
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

// Helper: Short format '27 Oct'
function formatShortDate(d: Date): string {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

// Helper: Check if two dates represent the exact same calendar day
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Helper: Get Monday 00:00:00 of the week containing date `d`
function getMondayOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); // 0 is Sun, 1 is Mon, ..., 6 is Sat
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Helper: Parse task dueDate string into Date
function parseTaskDueDate(str: string): Date | null {
  if (!str) return null;
  const parts = str.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthIdx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === parts[1].toLowerCase());
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && monthIdx !== -1 && !isNaN(year)) {
      return new Date(year, monthIdx, day);
    }
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export const MyToDoView: React.FC = () => {
  const {
    tasks,
    currentUser,
    users,
    toggleTaskStatus,
    completeAllTasks,
    snoozeTask,
    reportPendingReason,
    eventTiming,
    orgSettings,
    setCurrentPage,
    moveToMyOwnToDo,
    reassignTask,
    deleteTask,
    setRequestViewTab,
  } = useTaskToggle();

  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [editingReasonTaskId, setEditingReasonTaskId] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState<string>('');
  const [reasonToast, setReasonToast] = useState<string | null>(null);
  const [reassigningTaskId, setReassigningTaskId] = useState<string | null>(null);
  const [reassignTargetUserId, setReassignTargetUserId] = useState<string>('');

  // Routine Calendar Navigation State
  const [referenceDate, setReferenceDate] = useState<Date>(() => new Date());
  const [selectedDay, setSelectedDay] = useState<RoutineDay | 'all'>('all');
  const [viewScope, setViewScope] = useState<'routine' | 'month' | 'all'>('routine');

  // Display all tasks assigned to the current staff member AND tasks delegated by current user to colleagues
  const myTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.assignedTo === currentUser.id && t.status !== 'rejected') return true;
      if (t.createdBy === currentUser.id && t.assignedTo !== currentUser.id) return true;
      return false;
    });
  }, [tasks, currentUser.id]);

  const [taskSourceFilter, setTaskSourceFilter] = useState<'all' | 'assigned' | 'delegated'>('all');

  // Delegated tasks created by current user that were declined by colleagues (any type)
  const declinedDelegations = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.createdBy === currentUser.id &&
        t.assignedTo !== currentUser.id &&
        t.status === 'rejected'
    );
  }, [tasks, currentUser.id]);

  // Compute Active Monday
  const activeMonday = useMemo(() => getMondayOfWeek(referenceDate), [referenceDate]);

  // Compute 7 days of the active Routine Cycle (Monday to Sunday)
  const weekDays = useMemo(() => {
    return ROUTINE_DAYS.map((dayName, index) => {
      const date = new Date(activeMonday);
      date.setDate(activeMonday.getDate() + index);
      const formattedDate = formatTaskDate(date);
      const shortDate = formatShortDate(date);
      const isToday = isSameDay(date, new Date());

      // Find tasks matching this specific day
      const dayTasks = myTasks.filter((t) => {
        if (!t.dueDate) return false;
        if (t.dueDate === formattedDate) return true;
        const parsed = parseTaskDueDate(t.dueDate);
        return parsed ? isSameDay(parsed, date) : false;
      });

      const pendingCount = dayTasks.filter((t) => t.status !== 'done').length;
      const completedCount = dayTasks.filter((t) => t.status === 'done').length;

      return {
        dayName,
        shortDay: dayName.slice(0, 3),
        date,
        formattedDate,
        shortDate,
        isToday,
        tasks: dayTasks,
        totalCount: dayTasks.length,
        pendingCount,
        completedCount,
        isAllDone: dayTasks.length > 0 && pendingCount === 0,
      };
    });
  }, [activeMonday, myTasks]);

  // Active Sunday of the current routine week
  const activeSunday = useMemo(() => {
    const sun = new Date(activeMonday);
    sun.setDate(activeMonday.getDate() + 6);
    return sun;
  }, [activeMonday]);

  // Active Week Date Range Label (e.g. "26 Oct – 1 Nov 2026")
  const weekRangeLabel = useMemo(() => {
    const startStr = `${activeMonday.getDate()} ${MONTH_NAMES[activeMonday.getMonth()]}`;
    const endStr = `${activeSunday.getDate()} ${MONTH_NAMES[activeSunday.getMonth()]} ${activeSunday.getFullYear()}`;
    return `${startStr} – ${endStr}`;
  }, [activeMonday, activeSunday]);

  // Check if active week is current calendar week
  const isCurrentCalendarWeek = useMemo(() => {
    const currentMonday = getMondayOfWeek(new Date());
    return isSameDay(activeMonday, currentMonday);
  }, [activeMonday]);

  // Multi-Month Horizon Options (Current month + up to 5 months in advance: Oct, Nov, Dec, Jan, Feb, Mar)
  const monthOptions = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let offset = 0; offset <= 5; offset++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const monthIdx = targetDate.getMonth();
      const year = targetDate.getFullYear();
      const monthLabel = `${MONTH_NAMES[monthIdx]} ${year}`;
      let tag = '';
      if (offset === 0) tag = 'Current';
      else if (offset === 1) tag = '+1 Mo';
      else if (offset === 2) tag = '+2 Mo';
      else tag = `+${offset} Mo`;

      list.push({
        date: targetDate,
        label: monthLabel,
        fullLabel: `${FULL_MONTH_NAMES[monthIdx]} ${year}`,
        tag,
        isCurrent: offset === 0,
      });
    }
    return list;
  }, []);

  // Filter tasks based on viewScope and selectedDay
  const filteredTasks = useMemo(() => {
    let result = myTasks;

    if (viewScope === 'routine') {
      if (selectedDay === 'all') {
        // All tasks within the 7 days of the active week routine
        const weekDates = new Set(weekDays.map((d) => d.formattedDate));
        result = myTasks.filter((t) => {
          if (!t.dueDate) return false;
          if (weekDates.has(t.dueDate)) return true;
          const parsed = parseTaskDueDate(t.dueDate);
          return parsed ? weekDays.some((w) => isSameDay(w.date, parsed)) : false;
        });
      } else {
        // Specific day of the week routine
        const dayInfo = weekDays.find((d) => d.dayName === selectedDay);
        if (dayInfo) {
          result = dayInfo.tasks;
        }
      }
    } else if (viewScope === 'month') {
      // All tasks scheduled in the reference month
      const refMonth = referenceDate.getMonth();
      const refYear = referenceDate.getFullYear();
      result = myTasks.filter((t) => {
        if (!t.dueDate) return false;
        const parsed = parseTaskDueDate(t.dueDate);
        return parsed && parsed.getMonth() === refMonth && parsed.getFullYear() === refYear;
      });
    }

    // Filter by task source (Assigned to Me vs Sent to Colleagues)
    if (taskSourceFilter === 'assigned') {
      result = result.filter((t) => t.assignedTo === currentUser.id);
    } else if (taskSourceFilter === 'delegated') {
      result = result.filter((t) => t.createdBy === currentUser.id && t.assignedTo !== currentUser.id);
    }

    // Filter completed tasks if toggled off
    if (!showCompleted) {
      result = result.filter((t) => t.status !== 'done');
    }

    return result;
  }, [myTasks, viewScope, selectedDay, weekDays, referenceDate, showCompleted, taskSourceFilter, currentUser.id]);

  // Delegated counts
  const assignedToMeCount = myTasks.filter((t) => t.assignedTo === currentUser.id).length;
  const delegatedByMeCount = myTasks.filter((t) => t.createdBy === currentUser.id && t.assignedTo !== currentUser.id).length;

  // Overall metrics
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter((t) => t.status === 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingCountInView = filteredTasks.filter((t) => t.status !== 'done').length;
  const strikablePendingCountInView = filteredTasks.filter((t) => t.status !== 'done' && t.status !== 'rejected' && (currentUser.role === 'admin' || t.assignedTo === currentUser.id)).length;

  // Sunday routine status check
  const sundayInfo = weekDays.find((d) => d.dayName === 'Sunday');
  const isSundayCompleted = sundayInfo && sundayInfo.totalCount > 0 && sundayInfo.isAllDone;
  const isEntireWeekCompleted =
    weekDays.every((d) => d.totalCount === 0 || d.isAllDone) &&
    weekDays.some((d) => d.totalCount > 0);

  // Check event allotment
  const isAllottedToEvent =
    eventTiming?.isActive && eventTiming.allottedStaffIds.includes(currentUser.id);

  // Handlers for Navigation
  const handlePrevWeek = () => {
    const next = new Date(activeMonday);
    next.setDate(activeMonday.getDate() - 7);
    setReferenceDate(next);
  };

  const handleNextWeek = () => {
    const next = new Date(activeMonday);
    next.setDate(activeMonday.getDate() + 7);
    setReferenceDate(next);
  };

  const handleResetToCurrentWeek = () => {
    setReferenceDate(new Date());
    setSelectedDay('all');
    setViewScope('routine');
  };

  const handleSelectMonth = (targetDate: Date) => {
    setReferenceDate(targetDate);
    setSelectedDay('all');
    setViewScope('routine');
  };

  const handleCycleToNextWeekRoutine = () => {
    const nextMon = new Date(activeMonday);
    nextMon.setDate(activeMonday.getDate() + 7);
    setReferenceDate(nextMon);
    setSelectedDay('Monday');
    setViewScope('routine');
  };

  const handleOpenReasonBox = (taskId: string, currentReason?: string) => {
    setEditingReasonTaskId(taskId);
    setReasonInput(currentReason || '');
  };

  const handleSaveReason = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    reportPendingReason(taskId, reasonInput);
    setEditingReasonTaskId(null);
    const dest = targetTask?.type === 'admin' ? 'Admin' : targetTask?.createdByName || 'Colleague';
    setReasonToast(`Reason reported directly to ${dest}`);
    setTimeout(() => setReasonToast(null), 3000);
  };

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Toast Notification */}
      {reasonToast && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-indigo-600 text-white flex items-center gap-3 animate-in fade-in shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{reasonToast}</span>
        </div>
      )}

      {/* Header - Light Crisp Professional Architecture (No Black) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
              My Routine & To-Do
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-xs">
              {orgSettings.orgName} Staff
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {totalTasks} Total Tasks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Weekly routine filter · Tap anywhere on your assigned cards to strike & complete</span>
          </p>
        </div>

        {/* Header Action: Strike All Finished */}
        {strikablePendingCountInView > 0 && (
          <button
            type="button"
            onClick={completeAllTasks}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-all self-start sm:self-auto"
            title="Mark all pending tasks completed in 1 click"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Strike All Finished ({strikablePendingCountInView})</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          TASKS DECLINED BY COLLEAGUES (HIGH PRIORITY ACTION SECTION)
          Shows work giver (e.g. Arun) that colleague (e.g. Priya) declined their task,
          prominently showing the colleague's reason message with 1-click action buttons!
          ========================================================================= */}
      {declinedDelegations.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-rose-50/80 to-amber-50/50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between gap-3 border-b border-rose-200 pb-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-rose-950 font-['Outfit'] flex items-center gap-2">
                  <span>Tasks Declined by Colleagues</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-200 text-rose-900 border border-rose-300">
                    {declinedDelegations.length} {declinedDelegations.length === 1 ? 'Task' : 'Tasks'}
                  </span>
                </h2>
                <p className="text-xs text-rose-800 font-medium">
                  A colleague declined your task and explained why below. Take over or reassign.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setRequestViewTab('sent');
                setCurrentPage('requests');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold shadow-2xs cursor-pointer transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Open in Task Requests</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {declinedDelegations.map((task) => {
              const declineMsg = getTaskDeclineReason(task) || 'No message provided';
              return (
                <div
                  key={task.id}
                  className="bg-white rounded-xl p-4 border-2 border-rose-200 shadow-2xs space-y-3 flex flex-col justify-between hover:border-rose-300 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        {task.title}
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
                        Declined
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600 font-semibold flex-wrap">
                      <span className="text-slate-800 font-bold">Assigned to: {task.assignedToName}</span>
                      <span>•</span>
                      <span className="text-slate-500">Due: {task.dueDate} · {task.dueTime}</span>
                    </div>

                    {/* Colleague's Why Reject Message Box */}
                    <div className="mt-3 p-3 rounded-xl bg-rose-50/90 border border-rose-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Why {task.assignedToName} Declined:</span>
                        </div>
                        {task.rejectedAt && (
                          <span className="text-[10px] text-rose-600 font-medium">
                            at {task.rejectedAt}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-rose-100 text-xs text-rose-950 font-bold leading-relaxed shadow-2xs">
                        "{declineMsg}"
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        moveToMyOwnToDo(task.id);
                        setReasonToast('Task moved to your own daily routine schedule!');
                        setTimeout(() => setReasonToast(null), 3500);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
                      title="Add this task to your own daily to-do routine list"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Move to My Routine</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setReassigningTaskId(task.id);
                          const firstOther = users.find((u) => u.role === 'staff' && u.id !== currentUser.id && u.id !== task.assignedTo);
                          setReassignTargetUserId(firstOther?.id || '');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold cursor-pointer transition-all flex items-center gap-1 active:scale-95"
                        title="Reassign to another colleague"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reassign</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Dismiss task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          ROUTINE HORIZON SWITCHER: Multi-Month Switcher & Week Navigator
          Allows staff to easily view and switch tasks 2+ months in advance
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Month Switcher Bar (Easily jump +1 Mo, +2 Mo, +3 Mo etc.) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Month Horizon (View up to 2+ months advance):
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {monthOptions.map((m) => {
              const isSelected =
                referenceDate.getMonth() === m.date.getMonth() &&
                referenceDate.getFullYear() === m.date.getFullYear();

              return (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => handleSelectMonth(m.date)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                  title={`View routine schedule for ${m.fullLabel}`}
                >
                  <span>{m.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {m.tag}
                  </span>
                </button>
              );
            })}

            {/* View Scope Toggle: Routine Week vs Full Month vs All */}
            <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />
            <button
              type="button"
              onClick={() => setViewScope('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                viewScope === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
              title="View all assigned tasks across all dates"
            >
              All Tasks ({totalTasks})
            </button>
          </div>
        </div>

        {/* Week Cycle Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all cursor-pointer active:scale-95"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 font-['Outfit']">
                Week: {weekRangeLabel}
              </span>
              {!isCurrentCalendarWeek && (
                <button
                  type="button"
                  onClick={handleResetToCurrentWeek}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer"
                  title="Snap back to current week"
                >
                  This Week
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextWeek}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all cursor-pointer active:scale-95"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Routine Cycle: <strong className="text-slate-800">Monday ➔ Sunday</strong>
          </div>
        </div>

        {/* =========================================================================
            WEEKLY ROUTINE BAR (Monday to Sunday Filter Pills)
            ========================================================================= */}
        {viewScope === 'routine' && (
          <div className="pt-2">
            <div className="flex sm:grid sm:grid-cols-4 md:grid-cols-8 gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {/* All Days in Routine Week */}
              <button
                type="button"
                onClick={() => setSelectedDay('all')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedDay === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider">All Days</div>
                <div className="text-xs font-semibold mt-1">Full Week</div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                      selectedDay === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {weekDays.reduce((acc, d) => acc + d.totalCount, 0)} Tasks
                  </span>
                </div>
              </button>

              {/* Monday through Sunday individual routine tabs */}
              {weekDays.map((day) => {
                const isSelected = selectedDay === day.dayName;
                return (
                  <button
                    key={day.dayName}
                    type="button"
                    onClick={() => setSelectedDay(day.dayName)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : day.isAllDone
                        ? 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-300 text-emerald-950'
                        : day.isToday
                        ? 'bg-indigo-50/70 hover:bg-indigo-50 border-indigo-300 text-indigo-950'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {/* Today indicator dot */}
                    {day.isToday && (
                      <span
                        className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-indigo-600 animate-pulse'
                        }`}
                        title="Today"
                      />
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-['Outfit']">{day.shortDay}</span>
                        {day.isAllDone && (
                          <CheckCheck
                            className={`w-3.5 h-3.5 ${
                              isSelected ? 'text-emerald-200' : 'text-emerald-600'
                            }`}
                          />
                        )}
                      </div>
                      <div
                        className={`text-[11px] font-medium mt-0.5 ${
                          isSelected ? 'text-indigo-100' : 'text-slate-500'
                        }`}
                      >
                        {day.shortDate}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : day.totalCount > 0
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {day.totalCount} {day.totalCount === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Routine Cycle Completion Notice (Sunday complete -> Roll over to next Monday) */}
        {(isSundayCompleted || isEntireWeekCompleted) && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold">
                  {isEntireWeekCompleted
                    ? '🎉 Entire routine week completed!'
                    : '🎉 Sunday routine completed!'}
                </p>
                <p className="text-[11px] text-emerald-800 font-medium">
                  Ready for new work allotted for the next cycle starting next Monday.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCycleToNextWeekRoutine}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-all active:scale-95"
            >
              <span>Switch to Next Routine Cycle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Task List & Metrics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Main Task Cards (2 cols on xl) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
            {/* List Header with Click-to-Strike Notice & Show Completed Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit']">
                    {viewScope === 'all'
                      ? 'All Assigned Tasks'
                      : selectedDay === 'all'
                      ? `Active Routine Tasks (${weekRangeLabel})`
                      : `${selectedDay} Tasks (${weekDays.find((d) => d.dayName === selectedDay)?.shortDate || ''})`}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <MousePointerClick className="w-3 h-3 text-emerald-600" />
                    <span>Click anywhere on card to strike</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Clicking anywhere on a task strikes it through as completed and notifies Admin
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {/* Source Filter Pills: All / Assigned to Me / Sent to Colleagues */}
                {delegatedByMeCount > 0 && (
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setTaskSourceFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        taskSourceFilter === 'all'
                          ? 'bg-white text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({myTasks.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskSourceFilter('assigned')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        taskSourceFilter === 'assigned'
                          ? 'bg-white text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="sm:hidden">Mine ({assignedToMeCount})</span><span className="hidden sm:inline">Assigned to Me ({assignedToMeCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskSourceFilter('delegated')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        taskSourceFilter === 'delegated'
                          ? 'bg-white text-purple-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="sm:hidden">Sent ({delegatedByMeCount})</span><span className="hidden sm:inline">Sent to Colleagues ({delegatedByMeCount})</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700">Completed</span>
                  <button
                    type="button"
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      showCompleted ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        showCompleted ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Task Cards List */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">
                  {selectedDay !== 'all'
                    ? `No tasks scheduled for ${selectedDay}`
                    : 'No tasks found for this view'}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedDay !== 'all'
                    ? 'Switch to another routine day or click "All Days" to view the entire week.'
                    : 'Great job, your task queue is clear!'}
                </p>
                {selectedDay !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay('all')}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>View All Days in Week</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const isDone = task.status === 'done';
                  const isRejected = task.status === 'rejected';
                  const isCompulsory = task.type === 'admin';
                  const isEditingReason = editingReasonTaskId === task.id;
                  const senderUser = users.find((u) => u.id === task.createdBy);
                  const isDelegatedByMe = task.createdBy === currentUser.id && task.assignedTo !== currentUser.id;
                  const canStrike = currentUser.role === 'admin' || task.assignedTo === currentUser.id;

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        if (isRejected || !canStrike) return;
                        toggleTaskStatus(task.id);
                      }}
                      className={`relative rounded-xl border transition-colors duration-150 select-none group ${
                        isRejected
                          ? 'bg-rose-50/40 border-rose-200 cursor-not-allowed opacity-80'
                          : !canStrike
                          ? (isDone ? 'bg-slate-50/60 border-slate-200 opacity-85 cursor-default' : 'bg-white border-slate-200 shadow-2xs cursor-default')
                          : isDone
                          ? 'bg-slate-50/60 border-slate-200 opacity-75 cursor-pointer'
                          : isCompulsory
                          ? 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-indigo-400 shadow-xs cursor-pointer'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer'
                      }`}
                    >
                      {/* Left status indicator accent line */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                          isRejected
                            ? 'bg-rose-500'
                            : isDone
                            ? 'bg-emerald-500'
                            : isDelegatedByMe
                            ? (task.pendingReason ? 'bg-amber-500' : 'bg-purple-600')
                            : isCompulsory
                            ? 'bg-indigo-600'
                            : 'bg-slate-300 group-hover:bg-indigo-500'
                        }`}
                      />

                      <div className="p-3.5 sm:p-4.5 pl-4 sm:pl-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            {/* Strike Checkbox - ONLY rendered if the current user has permission to strike this task */}
                            {canStrike && (
                              <button
                                type="button"
                                disabled={isRejected}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isRejected) return;
                                  toggleTaskStatus(task.id);
                                }}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors duration-150 shrink-0 mt-0.5 ${
                                  isRejected
                                    ? 'bg-rose-100 text-rose-600 border border-rose-300 cursor-not-allowed'
                                    : isDone
                                    ? 'bg-emerald-600 text-white cursor-pointer'
                                    : 'border-2 border-slate-300 hover:border-indigo-600 hover:bg-indigo-50/40 bg-white cursor-pointer'
                                }`}
                                aria-label={
                                  isRejected
                                    ? 'Declined task cannot be struck'
                                    : isDone
                                    ? 'Mark task as pending'
                                    : 'Mark task as done'
                                }
                                title={
                                  isRejected
                                    ? 'Declined task cannot be struck'
                                    : isDone
                                    ? 'Mark task as pending'
                                    : 'Mark task as done'
                                }
                              >
                                {isRejected ? (
                                  <XCircle className="w-4 h-4 stroke-[2.5]" />
                                ) : isDone ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : null}
                              </button>
                            )}

                            {/* Title & Details */}
                            <div className="min-w-0 flex-1">
                              <h3
                                className={`text-sm sm:text-base font-bold transition-colors duration-150 ${
                                  isDone
                                    ? 'line-through text-slate-400 font-medium decoration-emerald-500 decoration-2'
                                    : isRejected
                                    ? 'line-through text-slate-400 font-medium decoration-rose-400'
                                    : 'text-slate-900 group-hover:text-indigo-950'
                                }`}
                              >
                                {task.title}
                              </h3>

                              {task.description && (
                                <p
                                  className={`text-xs mt-1 leading-relaxed font-normal transition-colors duration-150 ${
                                    isDone ? 'line-through text-slate-400/80' : 'text-slate-500'
                                  }`}
                                >
                                  {task.description}
                                </p>
                              )}

                              {/* Prominent Metadata Badges */}
                              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                {/* Clear Due Date & Time */}
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span>{task.dueDate}</span>
                                  {task.dueTime && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span>{task.dueTime}</span>
                                    </>
                                  )}
                                </div>

                                {/* Who it is FROM or Sent TO */}
                                {isDelegatedByMe ? (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                                    <Send className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Sent to: {task.assignedToName || 'Colleague'}</span>
                                  </span>
                                ) : task.type === 'admin' ? (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>From Admin ({orgSettings.orgName})</span>
                                  </span>
                                ) : task.type === 'staff' ? (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                                    <Users className="w-3.5 h-3.5 text-slate-600" />
                                    <span>
                                      From Colleague:{' '}
                                      {senderUser?.name || task.createdByName || 'Staff'}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Self Created</span>
                                  </span>
                                )}

                                {/* Priority Pill */}
                                {task.priority === 'High' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    <span>High Priority</span>
                                  </span>
                                )}

                                {isDelegatedByMe ? (
                                  isDone ? (
                                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>✓ Completed by {task.assignedToName?.split(' ')[0]} {task.completedAt ? `(${task.completedAt})` : ''}</span>
                                    </span>
                                  ) : isRejected ? (
                                    <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Declined by {task.assignedToName?.split(' ')[0]}</span>
                                    </span>
                                  ) : task.pendingReason ? (
                                    <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Issue Reported</span>
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                                      <span>In Progress with {task.assignedToName?.split(' ')[0]}</span>
                                    </span>
                                  )
                                ) : (
                                  <>
                                    {isRejected && (
                                      <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                        <span>Declined {task.rejectedAt ? `(${task.rejectedAt})` : ''}</span>
                                      </span>
                                    )}

                                    {isDone && task.completedAt && (
                                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Done at {task.completedAt}</span>
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Snooze, Issue Reporting, or Delegated Reassign */}
                          <div className="flex items-center gap-2 shrink-0 pl-10 sm:pl-0 flex-wrap">
                            {isDelegatedByMe ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReassigningTaskId(task.id);
                                  const firstOther = users.find((u) => u.role === 'staff' && u.id !== currentUser.id && u.id !== task.assignedTo);
                                  setReassignTargetUserId(firstOther?.id || '');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
                                title="Reassign to another colleague"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                                <span>Reassign</span>
                              </button>
                            ) : (
                              <>
                                {!isDone && !isRejected && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      snoozeTask(task.id, 30);
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                                    title="Snooze deadline by +30 minutes"
                                  >
                                    +30m Snooze
                                  </button>
                                )}

                                {!isDone && !isRejected && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenReasonBox(task.id, task.pendingReason);
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                      task.pendingReason
                                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{task.pendingReason ? 'Reason Sent' : 'Report Issue'}</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Reported Pending / Decline / Issue Reason Display */}
                        {task.pendingReason && !isEditingReason && (
                          <div className={`mt-3 p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                            isRejected
                              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                              : 'bg-amber-50/70 border-amber-200 text-amber-950'
                          }`}>
                            <div className="flex items-start gap-2">
                              {isRejected ? (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <span className="font-bold">
                                  {isDelegatedByMe
                                    ? `Issue Reported by ${task.assignedToName}: `
                                    : isRejected
                                    ? `Decline Reason to ${senderUser?.name || task.createdByName || 'Colleague'}: `
                                    : task.type === 'admin'
                                    ? 'Pending Reason to Admin: '
                                    : `Pending Reason to ${senderUser?.name || task.createdByName || 'Colleague'}: `}
                                </span>
                                <span className="font-semibold italic">"{task.pendingReason.replace(/^\[DECLINED\]:\s*/, '')}"</span>
                                {task.pendingReasonUpdatedAt && (
                                  <span className={`text-[10px] ml-2 font-medium ${isRejected ? 'text-rose-700' : 'text-amber-700'}`}>
                                    ({task.pendingReasonUpdatedAt})
                                  </span>
                                )}
                              </div>
                            </div>
                            {isDelegatedByMe ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReassigningTaskId(task.id);
                                  const firstOther = users.find((u) => u.role === 'staff' && u.id !== currentUser.id && u.id !== task.assignedTo);
                                  setReassignTargetUserId(firstOther?.id || '');
                                }}
                                className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950 shrink-0 cursor-pointer"
                              >
                                Reassign
                              </button>
                            ) : !isRejected ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReasonBox(task.id, task.pendingReason);
                                }}
                                className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950 shrink-0 cursor-pointer"
                              >
                                Edit
                              </button>
                            ) : null}
                          </div>
                        )}

                        {/* Interactive Blank Box to Report Issue / Reason */}
                        {isEditingReason && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in cursor-default"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                                <span>
                                  Reason why this task is delayed (Visible to{' '}
                                  {task.type === 'admin' ? 'Admin' : senderUser?.name || task.createdByName || 'Colleague'}):
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingReasonTaskId(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <textarea
                              value={reasonInput}
                              onChange={(e) => setReasonInput(e.target.value)}
                              placeholder={
                                task.type === 'admin'
                                  ? "Write the exact issue or reason why it's pending (e.g. Waiting on client confirmation)..."
                                  : `Explain to ${senderUser?.name || task.createdByName || 'colleague'} why work is pending...`
                              }
                              rows={2}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            />

                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingReasonTaskId(null);
                                }}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveReason(task.id);
                                }}
                                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                              >
                                <Send className="w-3 h-3" />
                                <span>
                                  Send to {task.type === 'admin' ? 'Admin' : senderUser?.name || task.createdByName || 'Colleague'}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Progress & Special Duty Notice */}
        <div className="space-y-5 sm:space-y-6">
          {/* Progress Card - Crisp Clean Light Design */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
                <span>Overall Progress</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {completedTasks}/{totalTasks} done
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
              {progressPercent}%
            </div>

            {/* Clean Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-4">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progressPercent === 100 ? 'bg-emerald-600' : 'bg-indigo-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 font-medium mt-3 flex items-center justify-between">
              <span>{pendingCountInView} in view</span>
              {progressPercent === 100 ? (
                <span className="text-emerald-700 font-bold">All Completed! 🎉</span>
              ) : (
                <span className="text-slate-600 font-semibold">
                  {totalTasks - completedTasks} left
                </span>
              )}
            </p>
          </div>

          {/* Event or Special Schedule Notice (Light theme, no black) */}
          {isAllottedToEvent && (
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-200 shadow-xs space-y-2 text-indigo-950">
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Special Event Duty Active</span>
              </div>
              <h4 className="font-bold text-sm text-indigo-950">{eventTiming.eventName}</h4>
              <p className="text-xs text-indigo-800 leading-relaxed font-normal">
                Special office schedule assigned by Admin for today.
              </p>
              <div className="pt-2 text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-700" />
                <span>Special Timing: {eventTiming.newTiming}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reassign Colleague Modal */}
      {reassigningTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                  Reassign Task to Colleague
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReassigningTaskId(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Select another colleague to reassign this task to. They will receive an instant notification.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Choose Colleague:</label>
              <select
                value={reassignTargetUserId}
                onChange={(e) => setReassignTargetUserId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-indigo-600 bg-white"
              >
                <option value="">-- Select a Colleague --</option>
                {users
                  .filter((u) => u.role === 'staff' && u.id !== currentUser.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReassigningTaskId(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reassignTargetUserId}
                onClick={() => {
                  if (reassigningTaskId && reassignTargetUserId) {
                    reassignTask(reassigningTaskId, reassignTargetUserId);
                    const targetUser = users.find((u) => u.id === reassignTargetUserId);
                    setReassigningTaskId(null);
                    setReasonToast(`Task successfully reassigned to ${targetUser?.name || 'colleague'}!`);
                    setTimeout(() => setReasonToast(null), 3500);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
