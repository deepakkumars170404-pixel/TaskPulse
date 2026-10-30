import React, { useState, useEffect } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { Clock, Calendar, Check, CheckCircle2, Bell, Sparkles, ArrowLeft } from 'lucide-react';
import { QuickDatePicker, QuickTimePicker } from '../common/DateTimePicker';
import { getTodayDateString } from '../../utils/dateUtils';

// Helper to parse timing range strings e.g. "8:00 AM - 6:00 PM" or "4:00 AM - 7:00 PM"
const parseTimingRange = (timingStr?: string) => {
  if (!timingStr) return { start: '8:00 AM', end: '6:00 PM' };
  const parts = timingStr.split('-').map((s) => s.trim());
  return {
    start: parts[0] || '8:00 AM',
    end: parts[1] || '6:00 PM',
  };
};

export const TimingSettingsView: React.FC = () => {
  const {
    officeTiming,
    eventTiming,
    users,
    updateOfficeTiming,
    updateEventTiming,
    orgSettings,
    triggerTaskAlert,
    setCurrentPage,
  } = useTaskToggle();

  // General Timing Form state (Clock settings)
  const [openTime, setOpenTime] = useState(officeTiming.openTime);
  const [closeTime, setCloseTime] = useState(officeTiming.closeTime);
  const [workingDays, setWorkingDays] = useState<string[]>(officeTiming.workingDays);
  const [generalToast, setGeneralToast] = useState(false);

  // Event Timing Form state (Calendar + Clock settings)
  const initialRange = parseTimingRange(eventTiming?.newTiming);
  const [eventName, setEventName] = useState(eventTiming?.eventName || 'Annual Day Preparation');
  const [eventDate, setEventDate] = useState(() => eventTiming?.date || getTodayDateString());
  const [eventStartTime, setEventStartTime] = useState(initialRange.start);
  const [eventEndTime, setEventEndTime] = useState(initialRange.end);
  const [allottedStaffIds, setAllottedStaffIds] = useState<string[]>(() => {
    const raw = eventTiming?.allottedStaffIds || [];
    return raw.filter((id) => users.some((u) => u.id === id));
  });
  const [eventToast, setEventToast] = useState(false);

  useEffect(() => {
    if (eventTiming?.allottedStaffIds) {
      setAllottedStaffIds(eventTiming.allottedStaffIds.filter((id) => users.some((u) => u.id === id)));
    }
  }, [eventTiming, users]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleStaffAllotment = (staffId: string) => {
    setAllottedStaffIds((prev) =>
      prev.includes(staffId) ? prev.filter((id) => id !== staffId) : [...prev, staffId]
    );
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
    const finalTiming = `${eventStartTime} - ${eventEndTime}`;
    updateEventTiming({
      id: eventTiming?.id || `evt_${Date.now()}`,
      eventName,
      date: eventDate,
      newTiming: finalTiming,
      allottedStaffIds: allottedStaffIds.filter((id) => users.some((u) => u.id === id)),
      isActive: true,
    });
    setEventToast(true);
    setTimeout(() => setEventToast(false), 3000);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      setCurrentPage('dashboard');
    }
  };

  return (
    <div className="w-full p-2.5 sm:p-4 lg:p-5 space-y-2.5 sm:space-y-3.5">
      {/* Clean Corporate Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 sm:pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
            title="1-click return to previous page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-900 tracking-tight">
                Timing & Office Hours
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary-500 text-white shadow-2xs">
                {orgSettings.orgName} Executive
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium hidden sm:block">
              Configure general office hours and special event dates/timings using interactive calendar and clock controls
            </p>
          </div>
        </div>
      </div>

      {/* Toast Feedbacks */}
      {generalToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-3 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            General office timing updated! Opens at {openTime}, closes at {closeTime}. Changes reflected across all pages.
          </span>
        </div>
      )}

      {eventToast && (
        <div className="p-4 rounded-xl bg-primary-50 border border-primary-200 text-primary-950 flex items-center gap-3 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            Special event schedule saved! {allottedStaffIds.length} staff member{allottedStaffIds.length === 1 ? '' : 's'} assigned and notified with alert sound & on-screen message banner.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* =========================================================================
            CARD 1: GENERAL OFFICE TIMING (CLOCK PICKERS FOR OPENS & CLOSES AT)
            ========================================================================= */}
        <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200 shadow-2xs">
          <form onSubmit={handleSaveGeneralTiming} className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                <Clock className="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Outfit']">General Office Timing</h2>
                <p className="text-[11px] text-slate-400 font-medium">Standard operating hours with interactive clock picker</p>
              </div>
            </div>

            {/* Interactive Clock Pickers for Office Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <QuickTimePicker
                label="Office Opens At"
                value={openTime}
                onChange={(newTime) => setOpenTime(newTime)}
              />
              <QuickTimePicker
                label="Office Closes At"
                value={closeTime}
                onChange={(newTime) => setCloseTime(newTime)}
              />
            </div>

            {/* Configured Hours Display */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <Clock className="w-4 h-4 text-primary-500 shrink-0" />
              <span>
                Standard Operating Hours: <strong className="text-slate-900">{openTime} – {closeTime}</strong>
              </span>
            </div>

            {/* Working Days Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Working Days (Toggle active days)
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => {
                  const isActive = workingDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Save General Timing
              </button>
            </div>
          </form>
        </div>

        {/* =========================================================================
            CARD 2: SPECIAL EVENT SCHEDULE (CALENDAR & CLOCK PICKERS)
            ========================================================================= */}
        <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200 shadow-2xs">
          <form onSubmit={handleSaveEventTiming} className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                <Calendar className="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Outfit']">Special Event Schedule</h2>
                <p className="text-[11px] text-slate-400 font-medium">Overriding date & shift schedule with calendar and clock controls</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Annual Day Preparation or Hackathon"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 shadow-2xs"
              />
            </div>

            {/* Event Date: Interactive Mini Calendar Picker */}
            <div>
              <QuickDatePicker
                label="Event Date (Interactive Calendar)"
                value={eventDate}
                onChange={(newDate) => setEventDate(newDate)}
              />
            </div>

            {/* Special Timing: Interactive Clock Pickers (Start & End) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <QuickTimePicker
                label="Special Shift Starts At"
                value={eventStartTime}
                onChange={(newStart) => setEventStartTime(newStart)}
              />
              <QuickTimePicker
                label="Special Shift Ends At"
                value={eventEndTime}
                onChange={(newEnd) => setEventEndTime(newEnd)}
              />
            </div>

            {/* Configured Event Range Preview */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary-50/70 border border-primary-200 text-xs font-semibold text-primary-950">
              <Clock className="w-4 h-4 text-primary-600 shrink-0" />
              <span>
                Configured Event Shift: <strong className="text-primary-950 font-black">{eventDate}</strong> · <strong className="text-primary-950 font-black">{eventStartTime} – {eventEndTime}</strong>
              </span>
            </div>

            {/* Staff Allotment Checkboxes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Allot Staff & Managers to Event
                </label>
                <div className="flex items-center gap-2">
                  {allottedStaffIds.filter((id) => users.some((u) => u.id === id)).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAllottedStaffIds([])}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  )}
                  <span className="text-[11px] font-bold text-primary-700">
                    {allottedStaffIds.filter((id) => users.some((u) => u.id === id)).length} members selected
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                {users
                  .filter((u) => u.role === 'staff' || u.role === 'branch_manager')
                  .map((staff) => {
                    const isAllotted = allottedStaffIds.includes(staff.id);
                    return (
                      <button
                        type="button"
                        key={staff.id}
                        onClick={() => toggleStaffAllotment(staff.id)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                          isAllotted
                            ? 'bg-primary-500 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isAllotted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span className="truncate">{staff.name}</span>
                        {staff.role === 'branch_manager' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-900 ml-auto shrink-0 font-bold">
                            Mgr
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Apply Event Schedule & Notify Staff
              </button>

              <button
                type="button"
                onClick={() => {
                  const finalTiming = `${eventStartTime} - ${eventEndTime}`;
                  triggerTaskAlert({
                    id: `test_event_${Date.now()}`,
                    title: `🗓️ Special Schedule Allotted by ${orgSettings.orgName} (Admin)`,
                    taskTitle: eventName,
                    message: `Special Office Hours: ${finalTiming} on ${eventDate}`,
                    senderName: `${orgSettings.orgName} (Admin)`,
                    dueDate: eventDate,
                    dueTime: finalTiming,
                    priority: 'High',
                    type: 'event',
                  });
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                title="Preview the exact notify sound and screen message that the allotted staff will receive"
              >
                <Bell className="w-4 h-4 text-primary-500" />
                <span>Test Staff Sound & Screen Message</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live Preview Line for Staff */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-700 font-medium shadow-2xs">
        <Clock className="w-4 h-4 text-primary-500 shrink-0" />
        <span>
          Live staff notification preview: *Scheduled for {eventDate} · {eventName} ({eventStartTime} – {eventEndTime}) for {allottedStaffIds.length} allotted team members.*
        </span>
      </div>
    </div>
  );
};
