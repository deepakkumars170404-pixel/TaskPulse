import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { Clock, Calendar, Check, CheckCircle2 } from 'lucide-react';

export const TimingSettingsView: React.FC = () => {
  const { officeTiming, eventTiming, users, updateOfficeTiming, updateEventTiming, orgSettings } = useTaskToggle();

  // General Timing Form state
  const [openTime, setOpenTime] = useState(officeTiming.openTime);
  const [closeTime, setCloseTime] = useState(officeTiming.closeTime);
  const [workingDays, setWorkingDays] = useState<string[]>(officeTiming.workingDays);
  const [generalToast, setGeneralToast] = useState(false);

  // Event Timing Form state
  const [eventName, setEventName] = useState(eventTiming?.eventName || 'Annual Day Preparation');
  const [eventDate, setEventDate] = useState(eventTiming?.date || '27 Oct 2026');
  const [newEventTiming, setNewEventTiming] = useState(eventTiming?.newTiming || '8:00 AM - 6:00 PM');
  const [allottedStaffIds, setAllottedStaffIds] = useState<string[]>(
    eventTiming?.allottedStaffIds || []
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
    <div className="w-full p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Clean Corporate Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Timing & Office Hours
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-orange-500 text-white shadow-2xs">
              {orgSettings.orgName} Executive
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Control general office hours and event-day staff timings across the organization
          </p>
        </div>
      </div>

      {/* Toast Feedbacks */}
      {generalToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-3 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            General office timing updated! Changes reflected immediately across all pages and staff chips.
          </span>
        </div>
      )}

      {eventToast && (
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 flex items-center gap-3 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            Event timing and staff allotment applied! Allotted staff now see the revised schedule.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* General Office Timing Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs">
          <form onSubmit={handleSaveGeneralTiming} className="space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Outfit']">General Office Timing</h2>
                <p className="text-[11px] text-slate-400 font-medium">Standard operating hours for regular days</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Opens at
                </label>
                <input
                  type="text"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  placeholder="9:00 AM"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Closes at
                </label>
                <input
                  type="text"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  placeholder="5:00 PM"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold text-slate-900 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
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
                          ? 'bg-orange-500 text-white shadow-xs'
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
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Save General Timing
              </button>
            </div>
          </form>
        </div>

        {/* Event Timing Change Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs">
          <form onSubmit={handleSaveEventTiming} className="space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Outfit']">Special Event Hours</h2>
                <p className="text-[11px] text-slate-400 font-medium">Overriding schedule for organization events</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Annual Day Preparation"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold text-slate-900 shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Event Date
                </label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="27 Oct 2026"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Special Timing
                </label>
                <input
                  type="text"
                  value={newEventTiming}
                  onChange={(e) => setNewEventTiming(e.target.value)}
                  placeholder="8:00 AM - 6:00 PM"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold text-slate-900 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                Allot Staff to Event
              </label>
              <div className="flex flex-wrap gap-2">
                {users
                  .filter((u) => u.role === 'staff')
                  .map((staff) => {
                    const isAllotted = allottedStaffIds.includes(staff.id);
                    return (
                      <button
                        type="button"
                        key={staff.id}
                        onClick={() => toggleStaffAllotment(staff.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isAllotted
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {isAllotted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{staff.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Apply Event Schedule
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live Preview Line for Staff */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-700 font-medium shadow-2xs">
        <Clock className="w-4 h-4 text-orange-500 shrink-0" />
        <span>
          Live staff notification preview: *Scheduled for {eventDate} · {eventName} ({newEventTiming}) for {allottedStaffIds.length} allotted team members.*
        </span>
      </div>
    </div>
  );
};
