import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface MiniCalendarProps {
  selectedDate: string; // e.g. "24 Oct 2026"
  onSelectDate: (dateStr: string) => void;
  taskDates?: string[]; // list of dates with tasks to show workload dots
  onClose?: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  onSelectDate,
  taskDates = [],
  onClose,
}) => {
  // Parse initial month and year from selectedDate or default to Oct 2026
  const parseSelected = () => {
    const parts = selectedDate.split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const monthIdx = MONTH_SHORT.findIndex((m) => m.toLowerCase() === parts[1].toLowerCase());
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && monthIdx !== -1 && !isNaN(year)) {
        return { day, month: monthIdx, year };
      }
    }
    return { day: 24, month: 9, year: 2026 }; // October 2026 default
  };

  const initial = parseSelected();
  const [currentMonth, setCurrentMonth] = useState<number>(initial.month);
  const [currentYear, setCurrentYear] = useState<number>(initial.year);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust so Monday is 0 and Sunday is 6
  const startOffset = (firstDayOfWeek + 6) % 7;

  // Format date helper
  const formatDateStr = (day: number) => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    return `${dayStr} ${MONTH_SHORT[currentMonth]} ${currentYear}`;
  };

  const handleSelectDay = (day: number) => {
    const formatted = formatDateStr(day);
    onSelectDate(formatted);
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-3.5 sm:p-4 w-72 max-w-[calc(100vw-2.5rem)] select-none z-50">
      {/* Month & Year Header with Navigation */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
        <button
          type="button"
          onClick={prevMonth}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-xs font-bold font-['Outfit'] text-slate-900 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-primary-500" />
          <span>{MONTH_NAMES[currentMonth]} {currentYear}</span>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-[10px] font-bold uppercase text-slate-400 py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Leading empty cells */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDateStr(day);
          const isSelected = selectedDate.toLowerCase().includes(dateStr.toLowerCase()) ||
            (day === initial.day && currentMonth === initial.month && currentYear === initial.year);
          const isToday = day === 24 && currentMonth === 9 && currentYear === 2026;
          const hasTasks = taskDates.some((td) => td && td.toLowerCase().includes(`${day} ${MONTH_SHORT[currentMonth].toLowerCase()}`));

          return (
            <button
              type="button"
              key={`day-${day}`}
              onClick={() => handleSelectDay(day)}
              className={`h-8 w-8 mx-auto rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                isSelected
                  ? 'bg-primary-500 text-white shadow-xs'
                  : isToday
                  ? 'bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{day}</span>
              {/* Task dot indicator */}
              {hasTasks && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-primary-500 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick shortcuts at bottom */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <button
          type="button"
          onClick={() => {
            onSelectDate('24 Oct 2026');
            setCurrentMonth(9);
            setCurrentYear(2026);
            if (onClose) onClose();
          }}
          className="text-primary-500 hover:text-primary-700 font-bold transition-colors cursor-pointer"
        >
          Today (24 Oct)
        </button>

        <span className="text-[10px] text-slate-400 font-medium">Click day to assign</span>
      </div>
    </div>
  );
};
