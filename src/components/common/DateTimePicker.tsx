import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock as ClockIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

// ============================================================================
// 1. MINI CALENDAR PICKER POPUP
// ============================================================================
interface QuickDatePickerProps {
  value: string;
  onChange: (newDate: string) => void;
  label?: string;
}

export const QuickDatePicker: React.FC<QuickDatePickerProps> = ({
  value,
  onChange,
  label = 'Completion Date',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse current value or fallback to today
  const today = new Date();
  const parsedDate = parseDateString(value) || today;

  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth()); // 0-11

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const selectDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const dayStr = String(day).padStart(2, '0');
    const monthShort = monthNames[viewMonth].slice(0, 3);
    const formatted = `${dayStr} ${monthShort} ${viewYear}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const setPreset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dayStr = String(d.getDate()).padStart(2, '0');
    const monthShort = monthNames[d.getMonth()].slice(0, 3);
    const formatted = `${dayStr} ${monthShort} ${d.getFullYear()}`;
    onChange(formatted);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
          {label}
        </span>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 text-sm font-semibold text-slate-900 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
      >
        <span className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-600" />
          <span>{value || 'Select Date'}</span>
        </span>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
          Pick
        </span>
      </button>

      {/* Mini Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3.5 animate-in fade-in zoom-in-95 duration-100">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-slate-100 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setPreset(0)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPreset(1)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setPreset(2)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              +2 Days
            </button>
            <button
              type="button"
              onClick={() => setPreset(7)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              Next Week
            </button>
          </div>

          {/* Month & Year Navigation */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-900">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-slate-400">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}
            {daysArray.map((day) => {
              const isSelected =
                parsedDate.getDate() === day &&
                parsedDate.getMonth() === viewMonth &&
                parsedDate.getFullYear() === viewYear;

              const isToday =
                today.getDate() === day &&
                today.getMonth() === viewMonth &&
                today.getFullYear() === viewYear;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : isToday
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 hover:bg-indigo-100'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. FAST CLOCK PICKER POPUP (Interactive Clock Face + Fast Presets)
// ============================================================================
interface QuickTimePickerProps {
  value: string;
  onChange: (newTime: string) => void;
  label?: string;
}

export const QuickTimePicker: React.FC<QuickTimePickerProps> = ({
  value,
  onChange,
  label = 'Completion Time',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse hour, minute, am/pm from value (e.g. "5:00 PM")
  const { hour, minute, period } = parseTimeString(value);

  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(period);

  useEffect(() => {
    const p = parseTimeString(value);
    setSelectedHour(p.hour);
    setSelectedMinute(p.minute);
    setSelectedPeriod(p.period);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const updateTime = (h: number, m: number, p: 'AM' | 'PM') => {
    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedPeriod(p);
    const mStr = String(m).padStart(2, '0');
    const formatted = `${h}:${mStr} ${p}`;
    onChange(formatted);
  };

  const handleApply = () => {
    const mStr = String(selectedMinute).padStart(2, '0');
    onChange(`${selectedHour}:${mStr} ${selectedPeriod}`);
    setIsOpen(false);
  };

  const applyFastPreset = (presetTime: string) => {
    onChange(presetTime);
    setIsOpen(false);
  };

  const addMinutes = (mins: number) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + mins);
    let h = now.getHours();
    const p: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const m = Math.round(now.getMinutes() / 5) * 5;
    const mStr = String(m % 60).padStart(2, '0');
    onChange(`${h}:${mStr} ${p}`);
    setIsOpen(false);
  };

  const clockHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <div className="relative" ref={popoverRef}>
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
          {label}
        </span>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 text-sm font-semibold text-slate-900 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
      >
        <span className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-indigo-600" />
          <span>{value || 'Select Time'}</span>
        </span>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
          Clock
        </span>
      </button>

      {/* Clock Popup */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto z-50 w-76 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 animate-in fade-in zoom-in-95 duration-100">
          {/* Header & Fast Presets */}
          <div className="pb-3 border-b border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ClockIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Fast Time Picker</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => updateTime(selectedHour, selectedMinute, 'AM')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    selectedPeriod === 'AM'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => updateTime(selectedHour, selectedMinute, 'PM')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    selectedPeriod === 'PM'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Instant Fast Chips */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => addMinutes(30)}
                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer whitespace-nowrap"
              >
                +30m
              </button>
              <button
                type="button"
                onClick={() => addMinutes(60)}
                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer whitespace-nowrap"
              >
                +1 Hr
              </button>
              <button
                type="button"
                onClick={() => applyFastPreset('1:00 PM')}
                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer whitespace-nowrap"
              >
                1:00 PM
              </button>
              <button
                type="button"
                onClick={() => applyFastPreset('5:00 PM')}
                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer whitespace-nowrap"
              >
                5:00 PM
              </button>
              <button
                type="button"
                onClick={() => applyFastPreset('7:00 PM')}
                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer whitespace-nowrap"
              >
                7:00 PM
              </button>
            </div>
          </div>

          {/* Interactive Clock Face (Circular 12-Hour Dial) */}
          <div className="py-3 flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Hour (Clock Face)
            </span>
            <div className="relative w-44 h-44 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center shadow-inner">
              {/* Center point */}
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 z-10" />

              {/* Clock Numbers 1-12 arranged in circle */}
              {clockHours.map((h, idx) => {
                const angle = idx * 30 - 90; // 12 is top (-90deg)
                const radius = 64; // px from center
                const rad = (angle * Math.PI) / 180;
                const x = Math.round(88 + radius * Math.cos(rad) - 14);
                const y = Math.round(88 + radius * Math.sin(rad) - 14);

                const isSelected = selectedHour === h;

                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => updateTime(h, selectedMinute, selectedPeriod)}
                    style={{ left: `${x}px`, top: `${y}px` }}
                    className={`absolute w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs scale-110 z-20'
                        : 'text-slate-700 hover:bg-indigo-100 hover:text-indigo-900'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minute Selection Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Minutes:</span>
            <div className="flex items-center gap-1.5">
              {[0, 15, 30, 45].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => updateTime(selectedHour, m, selectedPeriod)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedMinute === m
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  :{String(m).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleApply}
            className="w-full mt-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Set Time ({selectedHour}:{String(selectedMinute).padStart(2, '0')} {selectedPeriod})</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function parseDateString(str: string): Date | null {
  if (!str) return null;
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;
  return null;
}

function parseTimeString(str: string): { hour: number; minute: number; period: 'AM' | 'PM' } {
  const fallback = { hour: 5, minute: 0, period: 'PM' as const };
  if (!str) return fallback;

  const match = str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return fallback;

  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const p = (match[3] ? match[3].toUpperCase() : h >= 12 ? 'PM' : 'AM') as 'AM' | 'PM';

  if (h > 12) h = h % 12 || 12;
  if (h === 0) h = 12;

  return { hour: h, minute: isNaN(m) ? 0 : m, period: p };
}

