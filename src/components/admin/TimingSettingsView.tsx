import React, { useState, useMemo } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Clock,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  Users,
  ShieldCheck,
  Sparkles,
  Zap,
  Briefcase,
  Sun,
  Moon,
  ToggleLeft,
  ToggleRight,
  Info,
} from 'lucide-react';
import { EventTiming } from '../../types';

export const TimingSettingsView: React.FC = () => {
  const {
    officeTiming,
    eventTiming,
    users,
    updateOfficeTiming,
    updateEventTiming,
    orgSettings,
  } = useTaskToggle();

  // General Timing Form state
  const [openTime, setOpenTime] = useState(officeTiming.openTime || '9:00 AM');
  const [closeTime, setCloseTime] = useState(officeTiming.closeTime || '5:00 PM');
  const [workingDays, setWorkingDays] = useState<string[]>(
    officeTiming.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  );
  const [generalToast, setGeneralToast] = useState(false);

  // Dynamic today's date
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}`;
  }, []);

  // Event Timing Form state
  const [eventName, setEventName] = useState(
    eventTiming?.eventName || 'Annual Day Preparation'
  );
  const [eventDate, setEventDate] = useState(eventTiming?.date || todayStr);
  const [newEventTiming, setNewEventTiming] = useState(
    eventTiming?.newTiming || '8:00 AM - 6:00 PM'
  );
  const [allottedStaffIds, setAllottedStaffIds] = useState<string[]>(
    eventTiming?.allottedStaffIds || []
  );
  const [isEventActive, setIsEventActive] = useState(
    eventTiming ? eventTiming.isActive : true
  );
  const [eventToast, setEventToast] = useState(false);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const staffMembers = useMemo(() => {
    return users.filter((u) => u.role === 'staff');
  }, [users]);

  const toggleDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const applyDayPreset = (preset: 'weekdays' | 'standard6' | 'all') => {
    if (preset === 'weekdays') {
      setWorkingDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    } else if (preset === 'standard6') {
      setWorkingDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    } else {
      setWorkingDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    }
  };

  const applyShiftPreset = (open: string, close: string) => {
    setOpenTime(open);
    setCloseTime(close);
  };

  const toggleStaffAllotment = (staffId: string) => {
    setAllottedStaffIds((prev) =>
      prev.includes(staffId) ? prev.filter((id) => id !== staffId) : [...prev, staffId]
    );
  };

  const selectAllStaff = () => {
    setAllottedStaffIds(staffMembers.map((s) => s.id));
  };

  const clearAllStaff = () => {
    setAllottedStaffIds([]);
  };

  // Save General Office Timing
  const handleSaveGeneralTiming = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfficeTiming({
      openTime,
      closeTime,
      workingDays,
    });
    setGeneralToast(true);
    setTimeout(() => setGeneralToast(false), 3000);
  };

  // Save Event Timing & Staff Allotment
  const handleSaveEventTiming = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventTiming({
      id: eventTiming?.id || `evt_${Date.now()}`,
      eventName,
      date: eventDate,
      newTiming: newEventTiming,
      allottedStaffIds,
      isActive: isEventActive,
    });
    setEventToast(true);
    setTimeout(() => setEventToast(false), 3000);
  };

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 max-w-7xl mx-auto select-none animate-in fade-in duration-200">
      {/* =========================================================================
          1. HEADER & CONTROLS
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 tracking-tight">
              Shift Policy & Operating Hours
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
              {orgSettings.orgName || 'Workspace'} Shift Policy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Configure official daily operating hours, active working days, and event-day staff schedule overrides
          </p>
        </div>
      </div>

      {/* Toast Notifications */}
      {generalToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2.5 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">
            General office timing updated successfully! Standard hours are now live across all dashboards.
          </span>
        </div>
      )}

      {eventToast && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center gap-2.5 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0" />
          <span className="text-xs font-semibold">
            Special event schedule and staff allotments saved! Allotted members receive the revised schedule.
          </span>
        </div>
      )}

      {/* =========================================================================
          2. KPI OVERVIEW SUMMARY (3 CARDS)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Shift Hours */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-500" />
            <span>Regular Shift Hours</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-black text-slate-900">
              {officeTiming.openTime} – {officeTiming.closeTime}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
              Active
            </span>
          </div>
        </div>

        {/* Card 2: Operating Days */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Operating Schedule</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-black text-[#4F46E5]">
              {officeTiming.workingDays.length} Days / Week
            </span>
            <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[120px]">
              {officeTiming.workingDays.join(', ')}
            </span>
          </div>
        </div>

        {/* Card 3: Event Override */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Special Event Status</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-black text-purple-900 truncate max-w-[180px]">
              {eventTiming?.isActive ? eventTiming.eventName : 'No Override'}
            </span>
            {eventTiming?.isActive ? (
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {eventTiming.allottedStaffIds.length} Staff
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">
                Standard Hours
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN FORMS (SIDE-BY-SIDE 2-COLUMN GRID)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* =====================================================================
            CARD 1: GENERAL OFFICE HOURS POLICY
            ===================================================================== */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                <Clock className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  General Office Hours
                </h2>
                <p className="text-[11px] text-slate-400">
                  Standard daily working shift for the entire company
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Default Policy
            </span>
          </div>

          <form onSubmit={handleSaveGeneralTiming} className="space-y-4">
            {/* Quick Shift Presets */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Quick Shift Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '9:00 AM – 5:00 PM (8h)', open: '9:00 AM', close: '5:00 PM' },
                  { label: '9:30 AM – 6:30 PM (9h)', open: '9:30 AM', close: '6:30 PM' },
                  { label: '10:00 AM – 7:00 PM (Late)', open: '10:00 AM', close: '7:00 PM' },
                ].map((preset) => {
                  const isSelected = openTime === preset.open && closeTime === preset.close;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyShiftPreset(preset.open, preset.close)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold border border-indigo-200 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Shift Opens At *
                </label>
                <div className="relative">
                  <Sun className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    placeholder="9:00 AM"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Shift Closes At *
                </label>
                <div className="relative">
                  <Moon className="w-3.5 h-3.5 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    placeholder="5:00 PM"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Working Days Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Operating Working Days ({workingDays.length} Active)
                </label>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => applyDayPreset('weekdays')}
                    className="text-[#4F46E5] hover:underline font-semibold cursor-pointer"
                  >
                    Mon–Fri
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => applyDayPreset('standard6')}
                    className="text-[#4F46E5] hover:underline font-semibold cursor-pointer"
                  >
                    Mon–Sat
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => applyDayPreset('all')}
                    className="text-[#4F46E5] hover:underline font-semibold cursor-pointer"
                  >
                    All 7
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {daysOfWeek.map((day, idx) => {
                  const isActive = workingDays.includes(day);
                  const isWeekend = idx >= 5;
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        isActive
                          ? 'bg-[#4F46E5] text-white shadow-2xs'
                          : isWeekend
                          ? 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-200/80'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary-gradient w-full sm:w-auto px-5 py-2 rounded-lg text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Save General Timing</span>
              </button>
            </div>
          </form>
        </div>

        {/* =====================================================================
            CARD 2: SPECIAL EVENT SCHEDULE OVERRIDE
            ===================================================================== */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Special Event Hours
                </h2>
                <p className="text-[11px] text-slate-400">
                  Override schedule for organization events & allotted staff
                </p>
              </div>
            </div>

            {/* Active Toggle Switch */}
            <button
              type="button"
              onClick={() => setIsEventActive(!isEventActive)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isEventActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isEventActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span>{isEventActive ? 'Override Active' : 'Disabled'}</span>
            </button>
          </div>

          <form onSubmit={handleSaveEventTiming} className="space-y-4">
            {/* Event Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Event Title *
                </label>
                <div className="flex items-center gap-1.5 text-[10px]">
                  {['Annual Day', 'Client Audit', 'Sprint Launch'].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setEventName(`${sample} Preparation`)}
                      className="text-[#4F46E5] hover:underline font-semibold cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Annual Day Preparation"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs"
              />
            </div>

            {/* Event Date & Special Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Event Date *
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder={todayStr}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Special Timing *
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newEventTiming}
                    onChange={(e) => setNewEventTiming(e.target.value)}
                    placeholder="8:00 AM - 6:00 PM"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Allot Staff to Event */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Allot Staff to Event ({allottedStaffIds.length}/{staffMembers.length} Selected)
                </label>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={selectAllStaff}
                    className="text-[#4F46E5] hover:underline font-semibold cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={clearAllStaff}
                    className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {staffMembers.map((staff) => {
                  const isAllotted = allottedStaffIds.includes(staff.id);
                  return (
                    <button
                      type="button"
                      key={staff.id}
                      onClick={() => toggleStaffAllotment(staff.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isAllotted
                          ? 'bg-purple-600 text-white shadow-2xs font-bold'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isAllotted ? 'bg-white/20 text-white' : 'bg-[#4F46E5] text-white'
                        }`}
                      >
                        {isAllotted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : staff.name[0]}
                      </div>
                      <span className="capitalize">{staff.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Apply Event Schedule</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* =========================================================================
          4. LIVE STAFF SCHEDULE PREVIEW BANNER
          ========================================================================= */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#4F46E5] shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900">Live Organization Schedule: </span>
            <span>
              Operating from <strong>{openTime} to {closeTime}</strong> on{' '}
              <strong>{workingDays.join(', ')}</strong>.
              {isEventActive && allottedStaffIds.length > 0 && (
                <span className="text-purple-700 ml-1 font-semibold">
                  (Event override "{eventName}" for {allottedStaffIds.length} allotted staff on {eventDate}: {newEventTiming}).
                </span>
              )}
            </span>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-400 shrink-0">
          Synced across all staff devices
        </span>
      </div>
    </div>
  );
};
