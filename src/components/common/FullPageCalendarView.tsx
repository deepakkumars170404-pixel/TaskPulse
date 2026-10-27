import React, { useState, useMemo } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Users,
  ShieldAlert,
  User,
  X,
  Flag,
  CalendarDays,
} from 'lucide-react';
import { Task } from '../../types';

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

  // Selected date for the space-saving bottom drawer popup
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);

  const currentYear = activeDate.getFullYear();
  const currentMonth = activeDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setActiveDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setActiveDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleResetToToday = () => {
    const today = new Date();
    setActiveDate(today);
    handleDateClick(today);
  };

  // Date click handler with sound
  const handleDateClick = (date: Date) => {
    if (playCalendarClickSound) {
      playCalendarClickSound();
    }
    setSelectedCalendarDate(date);
  };

  // Helper: Format date to 'DD MMM YYYY' matching task.dueDate
  const formatTaskDate = (d: Date): string => {
    const day = d.getDate();
    const month = SHORT_MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
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

  // Tasks visible to current user (Admin sees all company tasks, Staff sees assigned & delegated)
  const relevantTasks = useMemo(() => {
    if (currentUser.role === 'admin') return tasks;
    return tasks.filter((t) => t.assignedTo === currentUser.id || t.createdBy === currentUser.id);
  }, [tasks, currentUser]);

  // Tasks & holiday for selected date
  const selectedDateDetails = useMemo(() => {
    if (!selectedCalendarDate) return null;
    const formatted = formatTaskDate(selectedCalendarDate);

    const matchingTasks = relevantTasks.filter((t) => t.dueDate === formatted);
    const matchingHoliday = GOVERNMENT_HOLIDAYS.find(
      (h) =>
        h.month === selectedCalendarDate.getMonth() &&
        h.day === selectedCalendarDate.getDate()
    );

    return {
      date: selectedCalendarDate,
      formattedDate: formatted,
      holiday: matchingHoliday,
      tasks: matchingTasks,
    };
  }, [selectedCalendarDate, relevantTasks]);

  const today = new Date();

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      {/* Calendar Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Company Schedule Calendar
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-xs">
              {orgSettings.orgName} Calendar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <span>Interactive month view with automatic Government Holidays and color-coded task assignments</span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Govt Holiday</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>Admin Task</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>Staff Task</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Done</span>
          </span>
        </div>
      </div>

      {/* Month Navigation Toolbar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer active:scale-95"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] min-w-[170px] text-center">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer active:scale-95"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleResetToToday}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Jump to Today</span>
        </button>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          {WEEKDAY_NAMES.map((name) => (
            <div key={name}>{name}</div>
          ))}
        </div>

        {/* 42 Calendar Date Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-white">
          {calendarDays.map(({ date, isCurrentMonth }, idx) => {
            const formatted = formatTaskDate(date);
            const isToday =
              date.getFullYear() === today.getFullYear() &&
              date.getMonth() === today.getMonth() &&
              date.getDate() === today.getDate();

            const isSelected =
              selectedCalendarDate &&
              date.getFullYear() === selectedCalendarDate.getFullYear() &&
              date.getMonth() === selectedCalendarDate.getMonth() &&
              date.getDate() === selectedCalendarDate.getDate();

            // Find matching government holiday
            const holiday = GOVERNMENT_HOLIDAYS.find(
              (h) => h.month === date.getMonth() && h.day === date.getDate()
            );

            // Find tasks scheduled on this day
            const dayTasks = relevantTasks.filter((t) => t.dueDate === formatted);
            const pendingDayTasks = dayTasks.filter((t) => t.status !== 'done');
            const completedDayTasks = dayTasks.filter((t) => t.status === 'done');

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(date)}
                className={`min-h-[95px] sm:min-h-[110px] p-1.5 sm:p-2 transition-all cursor-pointer flex flex-col justify-between group select-none relative ${
                  !isCurrentMonth
                    ? 'bg-slate-50/40 text-slate-300'
                    : isSelected
                    ? 'bg-indigo-50/60 ring-2 ring-indigo-500 z-10'
                    : isToday
                    ? 'bg-indigo-50/20 hover:bg-slate-50'
                    : holiday
                    ? 'bg-amber-50/30 hover:bg-amber-50/60'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Top Row: Date Number & Holiday Indicator */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                      isToday
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isSelected
                        ? 'bg-indigo-900 text-white'
                        : isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  {/* Holiday Flag Badge */}
                  {holiday && isCurrentMonth && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300 truncate max-w-[70px] sm:max-w-[100px] flex items-center gap-0.5" title={`Government Holiday: ${holiday.name}`}>
                      <Flag className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                      <span className="truncate">{holiday.name}</span>
                    </span>
                  )}
                </div>

                {/* Middle: Color-coded Task Chips */}
                <div className="space-y-1 my-1 overflow-hidden">
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
                            ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                            : 'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}
                        title={`${task.title} (${task.assignedToName})`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isDone ? 'bg-emerald-500' : isAdmin ? 'bg-indigo-600' : 'bg-purple-600'
                          }`}
                        />
                        <span className="truncate">{task.title}</span>
                      </div>
                    );
                  })}

                  {dayTasks.length > 2 && (
                    <div className="text-[9px] font-bold text-slate-500 px-1">
                      +{dayTasks.length - 2} more tasks
                    </div>
                  )}
                </div>

                {/* Bottom: Task Counter Badge */}
                {dayTasks.length > 0 && isCurrentMonth && (
                  <div className="text-[9px] font-bold text-slate-500 flex items-center justify-between pt-0.5">
                    <span>{dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}</span>
                    {pendingDayTasks.length === 0 && dayTasks.length > 0 && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SPACE-SAVING BOTTOM DRAWER / POPOVER ON DATE CLICK
          Pops up the date's task details without taking excess screen space
          ========================================================================= */}
      {selectedDateDetails && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-3.5 animate-in slide-in-from-bottom-3 duration-200">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit']">
                  Schedule for {selectedDateDetails.formattedDate}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {selectedDateDetails.tasks.length} tasks scheduled on this day
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCalendarDate(null)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              title="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* If Government Holiday */}
          {selectedDateDetails.holiday && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-2.5">
              <Flag className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-extrabold text-xs">🏛️ Government Public Holiday: </span>
                <span className="font-bold text-xs">{selectedDateDetails.holiday.name}</span>
                <span className="text-[10px] text-amber-800 ml-2 font-medium">({selectedDateDetails.holiday.type} Holiday)</span>
              </div>
            </div>
          )}

          {/* Tasks List */}
          {selectedDateDetails.tasks.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs font-medium">
              No tasks scheduled for this date. Complete free day!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {selectedDateDetails.tasks.map((task) => {
                const isDone = task.status === 'done';
                const isAdmin = task.type === 'admin';

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-slate-50/80 border-slate-200 opacity-80'
                        : isAdmin
                        ? 'bg-indigo-50/30 border-indigo-200'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isDone
                                ? 'line-through text-slate-400 decoration-emerald-500 decoration-2'
                                : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 shrink-0">
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{task.dueTime}</span>
                          </span>

                          <span className="text-slate-300">•</span>

                          <span>Assigned to: <strong>{task.assignedToName}</strong></span>

                          <span className="text-slate-300">•</span>

                          <span>
                            {task.type === 'admin'
                              ? 'Admin Assigned'
                              : `By ${task.createdByName}`}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isDone ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

