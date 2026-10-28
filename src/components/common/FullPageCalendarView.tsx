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
  ShieldCheck,
  UserCheck,
  User,
  X,
  Flag,
  CalendarDays,
  Check,
  Search,
  Filter,
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
  // 2027 Upcoming Holidays
  { dateStr: '2027-01-01', month: 0, day: 1, name: "New Year's Day 2027", type: 'Public' },
  { dateStr: '2027-01-14', month: 0, day: 14, name: 'Pongal 2027', type: 'Festival' },
  { dateStr: '2027-01-26', month: 0, day: 26, name: 'Republic Day 2027', type: 'National' },
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
  const { tasks, currentUser, orgSettings, playCalendarClickSound, toggleTaskStatus } = useTaskToggle();

  // Calendar active viewing month (dynamic, defaults to current system date)
  const [activeDate, setActiveDate] = useState<Date>(() => new Date());

  // View filter for main calendar grid
  const [viewFilter, setViewFilter] = useState<'all' | 'admin' | 'staff' | 'mine'>('all');

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

  // Helper: Robust date matching across diverse date formats (e.g. '28 Oct 2026', 'today', '2026-10-28')
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

  // Helper: Check if task belongs to the active viewing month
  const isSameCalendarMonth = (dueDateStr?: string, year?: number, month?: number): boolean => {
    if (!dueDateStr || year === undefined || month === undefined) return false;
    const trimmed = dueDateStr.trim().toLowerCase();
    const now = new Date();
    if (trimmed === 'today') {
      return now.getFullYear() === year && now.getMonth() === month;
    }
    if (trimmed === 'tomorrow') {
      const tmrw = new Date(now);
      tmrw.setDate(now.getDate() + 1);
      return tmrw.getFullYear() === year && tmrw.getMonth() === month;
    }
    const parts = dueDateStr.trim().split(/\s+/);
    if (parts.length === 3) {
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const mIdx = months.findIndex((m) => parts[1].toLowerCase().startsWith(m));
      const y = parseInt(parts[2], 10);
      return mIdx === month && y === year;
    }
    const parsed = new Date(dueDateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.getFullYear() === year && parsed.getMonth() === month;
    }
    return false;
  };

  // Helper: Format date to user-friendly string
  const formatLongDate = (d: Date): string => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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

  // Tasks visible to current user (Admin sees all company tasks, Staff sees assigned & created)
  const relevantTasks = useMemo(() => {
    let list: Task[] = [];
    if (currentUser.role === 'admin') {
      list = tasks;
    } else {
      list = tasks.filter((t) => (t.assignedTo === currentUser.id && t.status !== 'rejected') || t.createdBy === currentUser.id);
    }

    if (viewFilter === 'admin') {
      return list.filter((t) => t.type === 'admin');
    }
    if (viewFilter === 'staff') {
      return list.filter((t) => t.type === 'staff');
    }
    if (viewFilter === 'mine') {
      return list.filter((t) => t.assignedTo === currentUser.id);
    }
    return list;
  }, [tasks, currentUser, viewFilter]);

  // Monthly Summary Stats
  const { monthTasks, monthCompletedCount, monthPendingCount, monthHolidays } = useMemo(() => {
    const inMonth = relevantTasks.filter((t) => isSameCalendarMonth(t.dueDate, currentYear, currentMonth));
    const completed = inMonth.filter((t) => t.status === 'done').length;
    const pending = inMonth.filter((t) => t.status !== 'done' && t.status !== 'rejected').length;
    const hols = GOVERNMENT_HOLIDAYS.filter((h) => h.month === currentMonth);
    return {
      monthTasks: inMonth,
      monthCompletedCount: completed,
      monthPendingCount: pending,
      monthHolidays: hols,
    };
  }, [relevantTasks, currentYear, currentMonth]);

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
    <div className="w-full px-0 py-3 sm:py-4 space-y-3 sm:space-y-4 select-none animate-in fade-in duration-200">
      {/* =========================================================================
          1. HEADER & CONTROLS
          ========================================================================= */}
      <div className="px-3 sm:px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shadow-xs">
                <CalendarDays className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 tracking-tight">
                Company Calendar
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                {orgSettings.orgName || 'Workspace'} Schedule
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Interactive roster of assigned deliverables, company deadlines, and official holidays
            </p>
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-all cursor-pointer active:scale-95"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs sm:text-sm font-bold text-slate-900 px-3 min-w-[140px] text-center font-['Outfit']">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-all cursor-pointer active:scale-95"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetToToday}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-2xs"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Today</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MONTH SUMMARY METRICS (4 CARDS)
          ========================================================================= */}
      <div className="px-3 sm:px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Deliverables */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Month Deliverables
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {monthTasks.length}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {MONTH_NAMES[currentMonth]}
            </span>
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-600">
              {monthCompletedCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-700">
              {monthTasks.length > 0 ? Math.round((monthCompletedCount / monthTasks.length) * 100) : 100}%
            </span>
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>In Progress</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-amber-600">
              {monthPendingCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {monthPendingCount === 1 ? 'task left' : 'tasks left'}
            </span>
          </div>
        </div>

        {/* Card 4: Official Holidays */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
            <Flag className="w-3 h-3" />
            <span>Govt Holidays</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-indigo-600">
              {monthHolidays.length}
            </span>
            <span
              className="text-[11px] font-medium text-slate-500 truncate max-w-[110px]"
              title={monthHolidays.map((h) => h.name).join(', ')}
            >
              {monthHolidays.length > 0 ? monthHolidays[0].name.split('/')[0] : 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>

      {/* =========================================================================
          3. FILTER PILLS & COLOR LEGEND
          ========================================================================= */}
      <div className="px-3 sm:px-4">
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setViewFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewFilter === 'all'
                  ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Work ({tasks.length})
            </button>

            <button
              type="button"
              onClick={() => setViewFilter('admin')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                viewFilter === 'admin'
                  ? 'bg-[#4F46E5] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Allotted ({tasks.filter((t) => t.type === 'admin').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewFilter('staff')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                viewFilter === 'staff'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Staff Allotted ({tasks.filter((t) => t.type === 'staff').length})</span>
            </button>

            {currentUser.role === 'staff' && (
              <button
                type="button"
                onClick={() => setViewFilter('mine')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  viewFilter === 'mine'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Tasks ({tasks.filter((t) => t.assignedTo === currentUser.id).length})</span>
              </button>
            )}
          </div>

          {/* Legend Chips */}
          <div className="flex items-center gap-2.5 flex-wrap text-[11px] font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
              <span>Completed</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs" />
              <span>Pending</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs" />
              <span>Overdue</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Flag className="w-3 h-3 text-amber-600" />
              <span>Govt Holiday</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] shadow-2xs" />
              <span>Today</span>
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. CALENDAR GRID (EDGE-TO-EDGE, NO LEFT/RIGHT PADDING)
          ========================================================================= */}
      <div className="bg-white border-y border-slate-200/90 shadow-2xs overflow-hidden w-full">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-slate-50/80 border-b border-slate-200 text-center py-2.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          {WEEKDAY_NAMES.map((name, idx) => (
            <div key={name} className={idx >= 5 ? 'text-indigo-600 font-extrabold' : ''}>
              {name}
            </div>
          ))}
        </div>

        {/* 42 Calendar Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-white">
          {calendarDays.map(({ date, isCurrentMonth }, idx) => {
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

            // Find tasks scheduled on this day
            const dayTasks = relevantTasks.filter((t) => isSameCalendarDay(date, t.dueDate));
            const pendingDayTasks = dayTasks.filter((t) => t.status !== 'done' && t.status !== 'rejected');
            const hasTasks = dayTasks.length > 0;
            const allTasksDone = hasTasks && pendingDayTasks.length === 0;

            // Check overdue
            const hasOverdueTask =
              isCurrentMonth &&
              pendingDayTasks.some((t) => {
                if (!t.dueDate) return false;
                const deadline = parseTaskDeadline(t.dueDate, t.dueTime || '11:59 PM');
                return deadline ? deadline.getTime() < Date.now() : false;
              });
            const hasPendingTask = isCurrentMonth && pendingDayTasks.length > 0 && !hasOverdueTask;

            // Compute background color class
            let cellBgClass = 'hover:bg-slate-50/80';
            if (!isCurrentMonth) {
              cellBgClass = 'bg-slate-50/40 text-slate-300';
            } else if (hasOverdueTask) {
              cellBgClass = 'bg-amber-50/60 hover:bg-amber-100/70 text-amber-950 border-amber-200';
            } else if (hasPendingTask) {
              cellBgClass = 'bg-rose-50/40 hover:bg-rose-100/60 text-rose-950 border-rose-200';
            } else if (allTasksDone) {
              cellBgClass = 'bg-emerald-50/40 hover:bg-emerald-100/60 text-emerald-950 border-emerald-200';
            } else if (isToday) {
              cellBgClass = 'bg-indigo-50/30 hover:bg-indigo-50/60';
            } else if (holiday) {
              cellBgClass = 'bg-amber-50/30 hover:bg-amber-50/60';
            }

            const selectionRing = isSelected ? 'ring-2 ring-[#4F46E5] z-10 shadow-md' : '';

            // Compute date badge class
            let dateBadgeClass = isCurrentMonth ? 'text-slate-800' : 'text-slate-400';
            if (isToday) {
              dateBadgeClass = 'bg-[#4F46E5] text-white font-extrabold shadow-xs';
            } else if (hasOverdueTask) {
              dateBadgeClass = 'bg-amber-500 text-white font-bold shadow-2xs';
            } else if (hasPendingTask) {
              dateBadgeClass = 'bg-rose-500 text-white font-bold shadow-2xs';
            } else if (allTasksDone) {
              dateBadgeClass = 'bg-emerald-600 text-white font-bold shadow-2xs';
            }

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(date)}
                className={`min-h-[82px] sm:min-h-[105px] p-1.5 sm:p-2.5 transition-all cursor-pointer flex flex-col justify-between group select-none relative overflow-hidden ${cellBgClass} ${selectionRing}`}
                title="Click to view full day details & tasks"
              >
                {/* Top Row: Date Number & Holiday Indicator */}
                <div className="flex items-center justify-between gap-1 overflow-hidden">
                  <span
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all shrink-0 ${dateBadgeClass}`}
                  >
                    {date.getDate()}
                  </span>

                  {/* Holiday Flag Badge */}
                  {holiday && isCurrentMonth && (
                    <>
                      <span className="sm:hidden text-amber-600 shrink-0" title={`Holiday: ${holiday.name}`}>
                        <Flag className="w-2.5 h-2.5 fill-current" />
                      </span>
                      <span
                        className="hidden sm:inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 truncate max-w-[110px] items-center gap-0.5 shadow-2xs"
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
                <div className="sm:hidden flex items-center gap-1 my-1 flex-wrap overflow-hidden">
                  {dayTasks.slice(0, 3).map((task) => (
                    <span
                      key={task.id}
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        task.status === 'done'
                          ? 'bg-emerald-500'
                          : task.type === 'admin'
                          ? 'bg-[#4F46E5]'
                          : 'bg-purple-600'
                      }`}
                      title={`${task.title} (${task.assignedToName})`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[8px] font-bold text-slate-500 leading-none">
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>

                {/* Desktop: Task Title Chips */}
                <div className="hidden sm:block space-y-1 my-1 overflow-hidden">
                  {dayTasks.slice(0, 2).map((task) => {
                    const isDone = task.status === 'done';
                    const isAdmin = task.type === 'admin';
                    return (
                      <div
                        key={task.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate flex items-center gap-1 border ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700 line-through border-emerald-200'
                            : isAdmin
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                        title={`${task.title} (Assigned to ${task.assignedToName})`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isDone ? 'bg-emerald-500' : isAdmin ? 'bg-[#4F46E5]' : 'bg-purple-600'
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
                  <div className="flex items-center justify-between pt-0.5 border-t border-slate-100/60 text-[9px] font-bold">
                    {hasOverdueTask ? (
                      <span className="text-amber-700 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{pendingDayTasks.length} Overdue</span>
                      </span>
                    ) : hasPendingTask ? (
                      <span className="text-rose-600 flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>{pendingDayTasks.length} Pending</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>All Done</span>
                      </span>
                    )}

                    <span className="text-slate-400 font-medium">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          5. CENTERED MODAL DIALOG: PERFECT ON DESKTOP & MOBILE
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
            <div className="bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 border-b border-slate-200 px-4 sm:px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CalendarDays className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate font-['Outfit']">
                    {selectedDateDetails.longDate}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-semibold flex-wrap">
                    <span>
                      {selectedDateDetails.allTasks.length}{' '}
                      {selectedDateDetails.allTasks.length === 1 ? 'task scheduled' : 'tasks scheduled'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-indigo-700 font-bold">
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
                    ? 'bg-white text-indigo-700 shadow-2xs border border-indigo-200'
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
                    ? 'bg-[#4F46E5] text-white shadow-xs'
                    : 'text-indigo-700 hover:bg-indigo-100/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Allot ({selectedDateDetails.adminTasks.length})</span>
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
                <span>Staff Allot ({selectedDateDetails.staffTasks.length})</span>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 max-h-[55vh]">
              {/* Government Public Holiday Banner if matched */}
              {selectedDateDetails.holiday && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-2.5 shadow-2xs">
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

              {/* Status Notice Banner */}
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
                    const canToggle =
                      (currentUser.role === 'staff' && task.assignedTo === currentUser.id) ||
                      (currentUser.role === 'admin' && task.assignedTo === currentUser.id);

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isDone
                            ? 'bg-emerald-50/20 border-emerald-200 opacity-90'
                            : isRejected
                            ? 'bg-rose-50/30 border-rose-300 shadow-2xs'
                            : isAdmin
                            ? 'bg-indigo-50/25 border-indigo-200 hover:border-indigo-300'
                            : 'bg-purple-50/25 border-purple-200 hover:border-purple-300'
                        }`}
                      >
                        {/* Top: Category Pill, Priority, Status */}
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-2xs">
                                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                <span>Admin Allot Work</span>
                              </span>
                            ) : isStaffAllot ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs">
                                <UserCheck className="w-3 h-3 text-purple-600" />
                                <span>Staff Allot Work</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                <User className="w-3 h-3 text-slate-500" />
                                <span>Personal Task</span>
                              </span>
                            )}

                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                task.priority === 'High'
                                  ? 'bg-rose-100 text-rose-800'
                                  : task.priority === 'Medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          {/* Status Badge / Interactive Button */}
                          <div className="flex items-center gap-1.5">
                            {canToggle && !isRejected ? (
                              <button
                                type="button"
                                onClick={() => toggleTaskStatus(task.id)}
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                }`}
                                title="Click to strike / toggle completion"
                              >
                                {isDone ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-700 stroke-[2.5]" />
                                    <span>Completed</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>In Progress (Click to Done)</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : isRejected
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                                }`}
                              >
                                {isDone
                                  ? `✓ Completed${task.completedAt ? ` (${task.completedAt})` : ''}`
                                  : isRejected
                                  ? `❌ Declined`
                                  : '⏰ In Progress'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h4
                          className={`text-sm font-bold leading-snug ${
                            isDone
                              ? 'line-through text-slate-400 decoration-emerald-500'
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

                        {/* Declined message box */}
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
                            <Clock className="w-3 h-3 text-indigo-600" />
                            <span>Due: {task.dueTime}</span>
                          </span>

                          <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                            Allotted To: <strong className="text-slate-900 capitalize">{task.assignedToName}</strong>
                          </span>

                          <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                            By: <strong className="text-slate-900 capitalize">{task.createdByName}</strong>
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
