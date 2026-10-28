import React, { useState, useMemo, useEffect } from 'react';
import { useTaskToggle, parseTaskDeadline } from '../../context/TaskToggleContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Users,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  User,
  X,
  Flag,
  CalendarDays,
} from 'lucide-react';
import { Task, getTaskDeclineReason } from '../../types';

interface Holiday {
  dateStr: string; // 'YYYY-MM-DD'
  month: number; // 0-indexed (0 = Jan, 9 = Oct)
  day: number;
  name: string;
  type: 'National' | 'Festival' | 'Public';
}

// Built-in Indian & National Public Government Holidays for 2026 & 2027
const GOVERNMENT_HOLIDAYS: Holiday[] = [
  { dateStr: '2026-01-01', month: 0, day: 1, name: "New Year's Day", type: 'Public' },
  { dateStr: '2026-01-14', month: 0, day: 14, name: 'Pongal / Makar Sankranti', type: 'Festival' },
  { dateStr: '2026-01-15', month: 0, day: 15, name: 'Mattu Pongal / Thiruvalluvar Day', type: 'Festival' },
  { dateStr: '2026-01-26', month: 0, day: 26, name: 'Republic Day', type: 'National' },
  { dateStr: '2026-02-18', month: 1, day: 18, name: 'Maha Shivratri', type: 'Festival' },
  { dateStr: '2026-03-20', month: 2, day: 20, name: 'Telugu New Year (Ugadi)', type: 'Festival' },
  { dateStr: '2026-04-03', month: 3, day: 3, name: 'Good Friday', type: 'Public' },
  { dateStr: '2026-04-14', month: 3, day: 14, name: 'Tamil New Year / Dr. Ambedkar Jayanti', type: 'National' },
  { dateStr: '2026-05-01', month: 4, day: 1, name: 'May Day / Labour Day', type: 'National' },
  { dateStr: '2026-05-28', month: 4, day: 28, name: 'Bakrid / Eid al-Adha', type: 'Festival' },
  { dateStr: '2026-08-15', month: 7, day: 15, name: 'Independence Day', type: 'National' },
  { dateStr: '2026-09-04', month: 8, day: 4, name: 'Krishna Jayanti / Janmashtami', type: 'Festival' },
  { dateStr: '2026-09-14', month: 8, day: 14, name: 'Vinayakar Chathurthi / Ganesh Utsav', type: 'Festival' },
  { dateStr: '2026-10-02', month: 9, day: 2, name: 'Gandhi Jayanti', type: 'National' },
  { dateStr: '2026-10-19', month: 9, day: 19, name: 'Ayutha Pooja / Saraswathi Pooja', type: 'Festival' },
  { dateStr: '2026-10-20', month: 9, day: 20, name: 'Vijaya Dasami / Dussehra', type: 'Festival' },
  { dateStr: '2026-11-08', month: 10, day: 8, name: 'Deepavali / Diwali', type: 'Festival' },
  { dateStr: '2026-12-25', month: 11, day: 25, name: 'Christmas Day', type: 'Public' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const FullPageCalendarView: React.FC = () => {
  const { tasks, currentUser, orgSettings, playCalendarClickSound } = useTaskToggle();

  // Calendar active viewing month (default: current month)
  const [activeDate, setActiveDate] = useState<Date>(() => new Date(2026, 9, 27)); // Oct 2026

  // Centered date details modal state
  const [selectedModalDate, setSelectedModalDate] = useState<Date | null>(null);
  const [modalTaskFilter, setModalTaskFilter] = useState<'all' | 'admin' | 'staff'>('all');

  const currentYear = activeDate.getFullYear();
  const currentMonth = activeDate.getMonth();

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedModalDate(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Navigation handlers
  const handlePrevMonth = () => {
    setSelectedModalDate(null);
    setActiveDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedModalDate(null);
    setActiveDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleResetToToday = () => {
    setSelectedModalDate(null);
    setActiveDate(new Date());
  };

  // Date click handler: opens the centered modal with sound
  const handleDateClick = (date: Date) => {
    if (playCalendarClickSound) {
      playCalendarClickSound();
    }
    setModalTaskFilter('all');
    setSelectedModalDate(date);
  };

  // Helper: Format date to 'DD MMM YYYY' matching task.dueDate
  const formatTaskDate = (d: Date): string => {
    const day = d.getDate();
    const month = SHORT_MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Helper: Robust date matching across diverse date formats (e.g. '27 Oct 2026', 'today', '2026-10-27')
  const isSameCalendarDay = (d: Date, dueDateStr?: string): boolean => {
    if (!dueDateStr) return false;
    const trimmed = dueDateStr.trim().toLowerCase();
    const today = new Date();
    if (trimmed === 'today') {
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    }
    if (trimmed === 'tomorrow') {
      const tmrw = new Date(today);
      tmrw.setDate(today.getDate() + 1);
      return (
        d.getFullYear() === tmrw.getFullYear() &&
        d.getMonth() === tmrw.getMonth() &&
        d.getDate() === tmrw.getDate()
      );
    }
    const parts = dueDateStr.trim().split(/\s+/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const mIdx = months.findIndex((m) => parts[1].toLowerCase().startsWith(m));
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && mIdx !== -1 && !isNaN(year)) {
        return d.getFullYear() === year && d.getMonth() === mIdx && d.getDate() === day;
      }
    }
    const parsed = new Date(dueDateStr);
    if (!isNaN(parsed.getTime())) {
      return (
        d.getFullYear() === parsed.getFullYear() &&
        d.getMonth() === parsed.getMonth() &&
        d.getDate() === parsed.getDate()
      );
    }
    return false;
  };

  // Helper: Format date to user-friendly string
  const formatLongDate = (d: Date): string => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Build 42 calendar grid cells (Monday to Sunday)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Monday-based day of week (0 is Mon, 6 is Sun)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Previous month filler days
    const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthLastDate - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Next month filler days (fill to 42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Tasks visible to current user (Admin sees all company tasks, Staff sees assigned & delegated, excluding declined)
  const relevantTasks = useMemo(() => {
    if (currentUser.role === 'admin') return tasks;
    return tasks.filter((t) => (t.assignedTo === currentUser.id && t.status !== 'rejected') || t.createdBy === currentUser.id);
  }, [tasks, currentUser]);

  // Tasks & holiday for selected modal date
  const selectedDateDetails = useMemo(() => {
    if (!selectedModalDate) return null;
    const date = selectedModalDate;
    const formatted = formatTaskDate(date);

    const matchingTasks = relevantTasks.filter((t) => isSameCalendarDay(date, t.dueDate));
    const pendingTasks = matchingTasks.filter((t) => t.status !== 'done' && t.status !== 'rejected');
    const adminTasks = matchingTasks.filter((t) => t.type === 'admin');
    const staffTasks = matchingTasks.filter((t) => t.type === 'staff' || t.type === 'self');

    const hasOverdue = pendingTasks.some((t) => {
      if (!t.dueDate) return false;
      const dl = parseTaskDeadline(t.dueDate, t.dueTime || '11:59 PM');
      return dl ? dl.getTime() < Date.now() : false;
    });
    const hasPending = pendingTasks.length > 0;
    const allDone = matchingTasks.length > 0 && pendingTasks.length === 0;

    const matchingHoliday = GOVERNMENT_HOLIDAYS.find(
      (h) => h.month === date.getMonth() && h.day === date.getDate()
    );

    const displayedTasks =
      modalTaskFilter === 'admin'
        ? adminTasks
        : modalTaskFilter === 'staff'
        ? staffTasks
        : matchingTasks;

    return {
      date,
      formattedDate: formatted,
      longDate: formatLongDate(date),
      holiday: matchingHoliday,
      allTasks: matchingTasks,
      adminTasks,
      staffTasks,
      displayedTasks,
      hasOverdue,
      hasPending,
      allDone,
    };
  }, [selectedModalDate, relevantTasks, modalTaskFilter]);

  const today = new Date();

  return (
    <div className="w-full h-full flex-1 flex flex-col p-2 sm:p-3 space-y-2.5 min-h-0 select-none">
      {/* 1. Sleek Compact Control Toolbar (Unified Navigation & Legend) */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        {/* Left: Navigation & Month */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-all cursor-pointer active:scale-95 hover:shadow-2xs"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm sm:text-base font-black text-slate-900 font-['Outfit'] px-2 min-w-[140px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-all cursor-pointer active:scale-95 hover:shadow-2xs"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetToToday}
            className="px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>

          <span className="hidden md:inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary-500 text-white shadow-2xs">
            {orgSettings.orgName} Calendar
          </span>
        </div>

        {/* Right: Legend Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>Pending (Red Date)</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Overdue (Yellow Date)</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Completed (Green Date)</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
            <Flag className="w-2.5 h-2.5 text-amber-600" />
            <span>Govt Holiday</span>
          </span>
        </div>
      </div>

      {/* 2. Full-Space Responsive Calendar Grid */}
      <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden min-h-[500px]">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider shrink-0">
          {WEEKDAY_NAMES.map((name) => (
            <div key={name}>{name}</div>
          ))}
        </div>

        {/* 42 Calendar Date Cells filling full space */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 divide-x divide-y divide-slate-100 bg-white">
          {calendarDays.map(({ date, isCurrentMonth }, idx) => {
            const formatted = formatTaskDate(date);
            const isToday =
              date.getFullYear() === today.getFullYear() &&
              date.getMonth() === today.getMonth() &&
              date.getDate() === today.getDate();

            const isSelected =
              selectedModalDate &&
              date.getFullYear() === selectedModalDate.getFullYear() &&
              date.getMonth() === selectedModalDate.getMonth() &&
              date.getDate() === selectedModalDate.getDate();

            // Find matching government holiday
            const holiday = GOVERNMENT_HOLIDAYS.find(
              (h) => h.month === date.getMonth() && h.day === date.getDate()
            );

            // Find tasks scheduled on this day using robust date comparison
            const dayTasks = relevantTasks.filter((t) => isSameCalendarDay(date, t.dueDate));
            const pendingDayTasks = dayTasks.filter((t) => t.status !== 'done' && t.status !== 'rejected');
            const hasTasks = dayTasks.length > 0;
            const allTasksDone = hasTasks && pendingDayTasks.length === 0;

            // Check if any pending task on this date is overdue (staff did not complete over due time)
            const hasOverdueTask =
              isCurrentMonth &&
              pendingDayTasks.some((t) => {
                if (!t.dueDate) return false;
                const deadline = parseTaskDeadline(t.dueDate, t.dueTime || '11:59 PM');
                return deadline ? deadline.getTime() < Date.now() : false;
              });
            const hasPendingTask = isCurrentMonth && pendingDayTasks.length > 0 && !hasOverdueTask;

            // Compute background color class for this day cell
            let cellBgClass = 'hover:bg-slate-50/80';
            if (!isCurrentMonth) {
              cellBgClass = 'bg-slate-50/40 text-slate-300';
            } else if (hasOverdueTask) {
              // Staff did not complete task over their due time -> Date FULLY YELLOW!
              cellBgClass = 'bg-amber-100 hover:bg-amber-200/90 text-amber-950 border-amber-300 shadow-2xs';
            } else if (hasPendingTask) {
              // Task is pending -> Date FULLY RED!
              cellBgClass = 'bg-rose-100 hover:bg-rose-200/90 text-rose-950 border-rose-300 shadow-2xs';
            } else if (allTasksDone) {
              // All tasks completed -> Date FULLY GREEN!
              cellBgClass = 'bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 border-emerald-300 shadow-2xs';
            } else if (isToday) {
              cellBgClass = 'bg-primary-50/25 hover:bg-slate-50';
            } else if (holiday) {
              cellBgClass = 'bg-amber-50/30 hover:bg-amber-50/60';
            }

            const selectionRing = isSelected ? 'ring-3 ring-primary-500 z-10 shadow-md' : '';

            // Compute date badge class
            let dateBadgeClass = isCurrentMonth ? 'text-slate-800' : 'text-slate-400';
            if (hasOverdueTask) {
              dateBadgeClass = 'bg-amber-500 text-white font-black shadow-2xs';
            } else if (hasPendingTask) {
              dateBadgeClass = 'bg-rose-600 text-white font-black shadow-2xs';
            } else if (allTasksDone) {
              dateBadgeClass = 'bg-emerald-600 text-white font-black shadow-2xs';
            } else if (isToday) {
              dateBadgeClass = 'bg-primary-500 text-white shadow-xs';
            } else if (isSelected) {
              dateBadgeClass = 'bg-primary-800 text-white font-bold';
            }

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(date)}
                className={`min-h-[58px] sm:min-h-[85px] p-1 sm:p-2 transition-all cursor-pointer flex flex-col justify-between group select-none relative overflow-hidden ${cellBgClass} ${selectionRing}`}
                title="Click to view details"
              >
                {/* Top Row: Date Number & Holiday Indicator */}
                <div className="flex items-center justify-between gap-1 overflow-hidden">
                  <span
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-extrabold transition-all shrink-0 ${dateBadgeClass}`}
                  >
                    {date.getDate()}
                  </span>

                  {/* Holiday Flag Badge */}
                  {holiday && isCurrentMonth && (
                    <>
                      {/* Mobile Holiday Icon */}
                      <span className="sm:hidden text-amber-600 shrink-0" title={`Holiday: ${holiday.name}`}>
                        <Flag className="w-2.5 h-2.5 fill-current" />
                      </span>
                      {/* Desktop Holiday Badge */}
                      <span
                        className="hidden sm:inline-flex text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300 truncate max-w-[110px] items-center gap-0.5"
                        title={`Government Holiday: ${holiday.name}`}
                      >
                        <Flag className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                        <span className="truncate">{holiday.name}</span>
                      </span>
                    </>
                  )}
                </div>

                {/* Middle: Color-coded Task Chips */}
                {/* Mobile: Compact Dots */}
                <div className="sm:hidden flex items-center gap-1 my-0.5 flex-wrap overflow-hidden">
                  {dayTasks.slice(0, 3).map((task) => (
                    <span
                      key={task.id}
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        task.status === 'done'
                          ? 'bg-emerald-500'
                          : task.type === 'admin'
                          ? 'bg-primary-500'
                          : 'bg-purple-600'
                      }`}
                      title={`${task.title} (${task.assignedToName})`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[7px] font-bold text-slate-500 leading-none">
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>

                {/* Desktop: Full Title Chips */}
                <div className="hidden sm:block space-y-1 my-0.5 overflow-hidden">
                  {dayTasks.slice(0, 2).map((task) => {
                    const isDone = task.status === 'done';
                    const isAdmin = task.type === 'admin';
                    return (
                      <div
                        key={task.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate flex items-center gap-1 ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700 line-through border border-emerald-200'
                            : isAdmin
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}
                        title={`${task.title} (${task.assignedToName})`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isDone ? 'bg-emerald-500' : isAdmin ? 'bg-primary-500' : 'bg-purple-600'
                          }`}
                        />
                        <span className="truncate">{task.title}</span>
                      </div>
                    );
                  })}

                  {dayTasks.length > 2 && (
                    <div className="text-[9px] font-bold text-slate-500 px-1">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>

                {/* Bottom: Task Counter Badge */}
                {dayTasks.length > 0 && isCurrentMonth && (
                  <>
                    {/* Mobile: Compact Pill */}
                    <div className="sm:hidden flex items-center justify-center pt-0.5 overflow-hidden">
                      {hasOverdueTask ? (
                        <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-0.5 leading-tight truncate">
                          <Clock className="w-2 h-2 text-amber-700 animate-pulse shrink-0" />
                          <span>{pendingDayTasks.length}</span>
                        </span>
                      ) : hasPendingTask ? (
                        <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-rose-200 text-rose-900 border border-rose-300 flex items-center gap-0.5 leading-tight truncate">
                          <AlertCircle className="w-2 h-2 text-rose-700 shrink-0" />
                          <span>{pendingDayTasks.length}</span>
                        </span>
                      ) : (
                        <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-emerald-200 text-emerald-900 border border-emerald-300 flex items-center gap-0.5 leading-tight truncate">
                          <CheckCircle2 className="w-2 h-2 text-emerald-700 shrink-0" />
                          <span>{dayTasks.length}</span>
                        </span>
                      )}
                    </div>

                    {/* Desktop: Expanded Pill */}
                    <div className="hidden sm:flex items-center justify-between pt-1 flex-wrap gap-1">
                      {hasOverdueTask ? (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                          <Clock className="w-2.5 h-2.5 text-amber-700 animate-pulse" />
                          <span>Overdue ({pendingDayTasks.length})</span>
                        </span>
                      ) : hasPendingTask ? (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-rose-200 text-rose-900 border border-rose-300 flex items-center gap-1 shadow-2xs">
                          <AlertCircle className="w-2.5 h-2.5 text-rose-700" />
                          <span>Pending ({pendingDayTasks.length})</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-900 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                          <span>Done ({dayTasks.length})</span>
                        </span>
                      )}

                      <span
                        className={`text-[9px] font-bold ${
                          hasOverdueTask
                            ? 'text-amber-800 font-extrabold'
                            : hasPendingTask
                            ? 'text-rose-800 font-extrabold'
                            : 'text-slate-500'
                        }`}
                      >
                        {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. CENTERED MODAL DIALOG: PERFECT ON DESKTOP & MOBILE
          Displays directly in the CENTER OF THE SCREEN with clean backdrop
          ========================================================================= */}
      {selectedDateDetails && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setSelectedModalDate(null)}
        >
          <div
            className="relative bg-white w-full max-w-xl max-h-[85vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-50/80 via-white to-slate-50 border-b border-slate-200 px-4 sm:px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CalendarDays className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate font-['Outfit']">
                    {selectedDateDetails.longDate}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-semibold flex-wrap">
                    <span>
                      {selectedDateDetails.allTasks.length}{' '}
                      {selectedDateDetails.allTasks.length === 1 ? 'task scheduled' : 'tasks scheduled'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-primary-600 font-bold">
                      {selectedDateDetails.adminTasks.length} Admin Allot
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-purple-700 font-bold">
                      {selectedDateDetails.staffTasks.length} Staff Allot
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedModalDate(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Filter Tabs: Admin Allot Work vs Staff Allot Work */}
            <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => setModalTaskFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  modalTaskFilter === 'all'
                    ? 'bg-white text-primary-600 shadow-2xs border border-primary-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Work ({selectedDateDetails.allTasks.length})
              </button>

              <button
                type="button"
                onClick={() => setModalTaskFilter('admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTaskFilter === 'admin'
                    ? 'bg-primary-500 text-white shadow-xs'
                    : 'text-primary-600 hover:bg-primary-100/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Allot Work ({selectedDateDetails.adminTasks.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTaskFilter('staff')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTaskFilter === 'staff'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 hover:bg-purple-100/60'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Staff Allot Work ({selectedDateDetails.staffTasks.length})</span>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 max-h-[55vh]">
              {/* Government Public Holiday Banner if matched */}
              {selectedDateDetails.holiday && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-2.5 shadow-2xs">
                  <Flag className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs leading-tight text-amber-900">
                      🏛️ {selectedDateDetails.holiday.name}
                    </p>
                    <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                      Government {selectedDateDetails.holiday.type} Public Holiday
                    </p>
                  </div>
                </div>
              )}

              {/* Status Notice Banner (Yellow Overdue / Red Pending / Green Completed) */}
              {selectedDateDetails.hasOverdue && (
                <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 flex items-center gap-2 shadow-2xs">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 animate-pulse" />
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs leading-tight text-amber-900">
                      ⚠️ Overdue Tasks Notice (Yellow Date)
                    </p>
                    <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                      Staff did not complete task(s) over their due time.
                    </p>
                  </div>
                </div>
              )}

              {selectedDateDetails.hasPending && !selectedDateDetails.hasOverdue && (
                <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-950 flex items-center gap-2 shadow-2xs">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs leading-tight text-rose-900">
                      ⏳ Pending Tasks Scheduled (Red Date)
                    </p>
                    <p className="text-[11px] text-rose-800 font-medium mt-0.5">
                      Active pending assignments for this date.
                    </p>
                  </div>
                </div>
              )}

              {selectedDateDetails.allDone && (
                <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 flex items-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs leading-tight text-emerald-900">
                      ✅ All Tasks Completed (Green Date)
                    </p>
                    <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                      All assigned work for this date has been finished successfully!
                    </p>
                  </div>
                </div>
              )}

              {/* Tasks List */}
              {selectedDateDetails.displayedTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No{' '}
                  {modalTaskFilter === 'admin'
                    ? 'Admin allotted'
                    : modalTaskFilter === 'staff'
                    ? 'Staff allotted'
                    : ''}{' '}
                  tasks found for this date.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDateDetails.displayedTasks.map((task) => {
                    const isDone = task.status === 'done';
                    const isRejected = task.status === 'rejected';
                    const isAdmin = task.type === 'admin';
                    const isStaffAllot = task.type === 'staff';

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isDone
                            ? 'bg-emerald-50/20 border-emerald-200 opacity-90'
                            : isRejected
                            ? 'bg-rose-50/30 border-rose-300 shadow-2xs'
                            : isAdmin
                            ? 'bg-primary-50/25 border-primary-200 hover:border-primary-300'
                            : 'bg-purple-50/25 border-purple-200 hover:border-purple-300'
                        }`}
                      >
                        {/* Top: Category Pill, Priority, Status */}
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary-100 text-primary-700 border border-primary-200 shadow-2xs">
                                <ShieldCheck className="w-3 h-3 text-primary-500" />
                                <span>Admin Allot Work</span>
                              </span>
                            ) : isStaffAllot ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs">
                                <UserCheck className="w-3 h-3 text-purple-600" />
                                <span>Staff Allot Work</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                <User className="w-3 h-3 text-slate-500" />
                                <span>Self To-Do</span>
                              </span>
                            )}

                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                task.priority === 'High'
                                  ? 'bg-rose-100 text-rose-800'
                                  : task.priority === 'Medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {task.priority} Priority
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isRejected
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {isDone
                              ? '✓ Completed'
                              : isRejected
                              ? `❌ Declined by ${task.assignedToName}`
                              : '⏰ Pending'}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4
                          className={`text-sm font-bold leading-snug ${
                            isDone
                              ? 'line-through text-slate-400 decoration-emerald-500'
                              : isRejected
                              ? 'text-slate-900'
                              : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Colleague Rejection Message Box */}
                        {isRejected && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                            <div className="text-[11px] font-bold text-rose-900 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>Why {task.assignedToName} Declined {task.rejectedAt ? `(${task.rejectedAt})` : ''}:</span>
                            </div>
                            <div className="text-xs text-rose-950 font-bold italic mt-1 bg-white p-2 rounded-lg border border-rose-100 shadow-2xs">
                              "{getTaskDeclineReason(task) || 'No message provided'}"
                            </div>
                          </div>
                        )}

                        {/* Meta strip: Due Time, Allotted To, Created By */}
                        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-700 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            <Clock className="w-3 h-3 text-primary-500" />
                            <span>Due: {task.dueTime}</span>
                          </span>

                          <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                            Allotted To: <strong className="text-slate-900">{task.assignedToName}</strong>
                          </span>

                          <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                            By: <strong className="text-slate-900">{task.createdByName}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Showing {selectedDateDetails.displayedTasks.length} of{' '}
                {selectedDateDetails.allTasks.length} tasks
              </span>
              <button
                type="button"
                onClick={() => setSelectedModalDate(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
