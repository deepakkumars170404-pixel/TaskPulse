import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { Clock, Calendar, Check, Info, Sparkles, ShieldCheck, UserCheck } from 'lucide-react';

export const TimingSettingsView: React.FC = () => {
  const { officeTiming, eventTiming, users, updateOfficeTiming, updateEventTiming, orgSettings } = useTaskToggle();

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
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header with Rich Multi-Color Gradients */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-indigo-100/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Timing & Office Hours
            </h1>
            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-xs shadow-indigo-300/40">
              {orgSettings.orgName} Executive
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Control general office hours and event-day staff timings across the organization</span>
          </p>
        </div>
      </div>

      {/* Toast Feedbacks */}
      {generalToast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-950 flex items-center gap-3 animate-in fade-in shadow-xs">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">
            General office timing updated! Changes reflected immediately across all pages and staff chips.
          </span>
        </div>
      )}

      {eventToast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-950 flex items-center gap-3 animate-in fade-in shadow-xs">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">
            Event timing and staff allotment applied! Allotted staff now see the revised schedule.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* General Office Timing Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-indigo-100/90 shadow-md shadow-indigo-100/30">
          <form onSubmit={handleSaveGeneralTiming} className="space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 font-['Outfit']">General Office Timing</h2>
                <p className="text-[11px] text-slate-400 font-semibold">Standard operating hours for regular days</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Opens at
                </label>
                <input
                  type="text"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  placeholder="9:00 AM"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-bold text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Closes at
                </label>
                <input
                  type="text"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  placeholder="5:00 PM"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-bold text-slate-900 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
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
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200/80 border border-slate-200'
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
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white text-xs sm:text-sm font-black shadow-md shadow-indigo-300/60 transition-all cursor-pointer active:scale-95"
              >
                Save General Timing
              </button>
            </div>
          </form>
        </div>

        {/* Event Timing Change Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-amber-200/80 shadow-md shadow-amber-100/30">
          <form onSubmit={handleSaveEventTiming} className="space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-amber-100">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 font-['Outfit']">Special Event Hours</h2>
                <p className="text-[11px] text-amber-800 font-semibold">Overriding schedule for organization events</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Annual Day Preparation"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-bold text-slate-900 shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Event Date
                </label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="26 Oct 2026"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-bold text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Special Timing
                </label>
                <input
                  type="text"
                  value={newEventTiming}
                  onChange={(e) => setNewEventTiming(e.target.value)}
                  placeholder="8:00 AM - 6:00 PM"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-bold text-slate-900 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
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
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                          isAllotted
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200'
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
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs sm:text-sm font-black shadow-md shadow-amber-300 transition-all cursor-pointer active:scale-95"
              >
                Apply Event Schedule
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live Preview Line for Staff */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 to-orange-50/80 border border-amber-300 flex items-center gap-3 text-xs text-amber-950 font-bold shadow-xs">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Live staff notification preview: *Scheduled for {eventDate} · {eventName} ({newEventTiming}) for {allottedStaffIds.length} allotted team members.*
        </span>
      </div>
    </div>
  );
};
