import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { Clock, Calendar, Check, Info, Sparkles, ShieldCheck } from 'lucide-react';

export const TimingSettingsView: React.FC = () => {
  const { officeTiming, eventTiming, users, updateOfficeTiming, updateEventTiming } = useTaskToggle();

  // General Timing Form state
  const [openTime, setOpenTime] = useState(officeTiming.openTime);
  const [closeTime, setCloseTime] = useState(officeTiming.closeTime);
  const [workingDays, setWorkingDays] = useState<string[]>(officeTiming.workingDays);
  const [generalToast, setGeneralToast] = useState(false);

  // Event Timing Form state
  const [eventName, setEventName] = useState(eventTiming?.eventName || 'Annual Day Preparation');
  const [eventDate, setEventDate] = useState(eventTiming?.date || '26 Oct 2026');
  const [newEventTiming, setNewEventTiming] = useState(eventTiming?.newTiming || '8:00 AM - 6:00 PM');
  const [allottedStaffIds, setAllottedStaffIds] = useState<string[]>(
    eventTiming?.allottedStaffIds || ['staff_arun', 'staff_meena', 'staff_priya', 'staff_karthik']
  );
  const [eventToast, setEventToast] = useState(false);

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
    updateEventTiming({
      id: eventTiming?.id || `evt_${Date.now()}`,
      eventName,
      date: eventDate,
      newTiming: newEventTiming,
      allottedStaffIds,
      isActive: true,
    });
    setEventToast(true);
    setTimeout(() => setEventToast(false), 3000);
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900">Timing Settings</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Owner Access</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Control general office hours and event-day staff timings across the organization
          </p>
        </div>
      </div>

      {/* Toast Feedbacks */}
      {generalToast && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">
            General office timing updated! Changes reflected immediately on all pages and staff chips.
          </span>
        </div>
      )}

      {eventToast && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 animate-in fade-in">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">
            Event timing and staff allotment applied! Allotted staff will now see their revised schedule.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* General Office Timing (Full Admin Control) */}
        <div className="bg-white rounded-2xl p-4 sm:p-7 border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSaveGeneralTiming} className="space-y-5 sm:space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">General office timing</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Changes show on every staff page immediately as the header office hours chip.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 sm:mb-2">
                  Opens at
                </label>
                <input
                  type="text"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  placeholder="9:00 AM"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 sm:mb-2">
                  Closes at
                </label>
                <input
                  type="text"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  placeholder="5:00 PM"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Working days (click to toggle)
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {daysOfWeek.map((day) => {
                  const isActive = workingDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
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
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
              >
                Save timing
              </button>
            </div>
          </form>
        </div>

        {/* Event Timing Change (Full Admin Control) */}
        <div className="bg-white rounded-2xl p-4 sm:p-7 border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSaveEventTiming} className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Event timing change</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              For organisation events that need different staff hours.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Event name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Annual Day Preparation"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Date
                </label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="26 Oct 2026"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  New timing
                </label>
                <input
                  type="text"
                  value={newEventTiming}
                  onChange={(e) => setNewEventTiming(e.target.value)}
                  placeholder="8:00 AM - 6:00 PM"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Allot staff (click to toggle allotment)
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {users
                  .filter((u) => u.role === 'staff')
                  .map((staff) => {
                    const isAllotted = allottedStaffIds.includes(staff.id);
                    return (
                      <button
                        type="button"
                        key={staff.id}
                        onClick={() => toggleStaffAllotment(staff.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isAllotted
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {isAllotted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        <span>{staff.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
              >
                Apply to selected staff
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live Preview Line for Staff */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900 font-semibold">
        <Info className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          Preview for staff: *Sun {eventDate} · {eventName} : {newEventTiming}*
        </span>
      </div>
    </div>
  );
};
