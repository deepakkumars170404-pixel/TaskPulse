import React from 'react';
import { useTaskPulse } from '../../context/TaskPulseContext';
import { Clock, Calendar, Check, Info } from 'lucide-react';

export const TimingSettingsView: React.FC = () => {
  const { officeTiming, eventTiming, users } = useTaskPulse();

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Timing Settings</h1>
        <p className="text-sm text-slate-500">
          Control office hours and event-day timing (Currently in review mode)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Office Timing Card */}
        <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">General office timing</h2>
          </div>
          <p className="text-xs text-slate-500">
            Changes show on every staff page immediately as the header chip.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Opens at
              </label>
              <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50/50">
                {officeTiming.openTime}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Closes at
              </label>
              <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50/50">
                {officeTiming.closeTime}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Working days
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const isActive = officeTiming.workingDays.includes(day);
                return (
                  <span
                    key={day}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Timing Change Card (Untouched / Review view as requested) */}
        <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Event timing change</h2>
          </div>
          <p className="text-xs text-slate-500">
            For organization events that need different staff hours.
          </p>

          {eventTiming ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Event name
                </label>
                <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50/50">
                  {eventTiming.eventName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Date
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50/50">
                    {eventTiming.date}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    New timing
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50/50">
                    {eventTiming.newTiming}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Allotted staff
                </label>
                <div className="flex flex-wrap gap-2">
                  {users
                    .filter((u) => u.role === 'staff')
                    .map((staff) => {
                      const isAllotted = eventTiming.allottedStaffIds.includes(staff.id);
                      return (
                        <span
                          key={staff.id}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                            isAllotted
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isAllotted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                          <span>{staff.name}</span>
                        </span>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No event timing configured.</p>
          )}
        </div>
      </div>

      {/* Preview Line for Staff */}
      {eventTiming && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900 font-semibold">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Preview for staff: *{eventTiming.date} · {eventTiming.eventName} : {eventTiming.newTiming}*
          </span>
        </div>
      )}
    </div>
  );
};
