import React, { useState, useRef, useEffect } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { TaskPriority } from '../../types';
import { Check, ShieldAlert, Sparkles, Calendar, CalendarDays, Clock, Send, Users } from 'lucide-react';
import { MiniCalendar } from '../common/MiniCalendar';

export const AssignTaskView: React.FC = () => {
  const { users, assignAdminTask, tasks, setCurrentPage, orgSettings } = useTaskToggle();

  const staffList = users.filter((u) => u.role === 'staff');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('24 Oct 2026');
  const [dueTime, setDueTime] = useState('2:30 PM');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [successToast, setSuccessToast] = useState(false);
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendarPopover(false);
      }
    };
    if (showCalendarPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendarPopover]);

  // Extract dates that already have tasks assigned for workload dots
  const existingTaskDates = tasks.map((t) => t.dueDate);

  // Quick Date presets
  const datePresets = [
    { label: 'Today (24 Oct)', value: '24 Oct 2026' },
    { label: 'Tomorrow (25 Oct)', value: '25 Oct 2026' },
    { label: 'Upcoming (26 Oct)', value: '26 Oct 2026' },
    { label: 'Next Week (02 Nov)', value: '02 Nov 2026' },
  ];

  // Toggle staff selection
  const toggleStaff = (id: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((staffId) => staffId !== id) : [...prev, id]
    );
  };

  const handleSelectAllStaff = () => {
    if (selectedStaffIds.length === staffList.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(staffList.map((s) => s.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedStaffIds.length === 0) {
      alert('Please enter a task title and select at least one staff member.');
      return;
    }

    assignAdminTask({
      title,
      description,
      staffIds: selectedStaffIds,
      dueDate,
      dueTime,
      priority,
    });

    setTitle('');
    setDescription('');
    setSelectedStaffIds([]);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  // Recently assigned admin tasks
  const recentlyAssigned = tasks
    .filter((t) => t.type === 'admin')
    .slice(0, 6);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Page Header with Rich Multi-Color Gradients */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-indigo-100/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Assign Work to Team
            </h1>
            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-xs shadow-indigo-300/40">
              {orgSettings.orgName} Executive
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Dispatch official assignments to one or more staff members with strict completion dates</span>
          </p>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-950 flex items-center gap-3 animate-in fade-in shadow-xs">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">
            Task assigned for {dueDate} by {dueTime}! Dispatched to selected staff members.
          </span>
        </div>
      )}

      {/* Full-width Responsive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Main Assignment Form (2 cols on xl) */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 sm:p-8 border border-indigo-100/90 shadow-md shadow-indigo-100/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task title */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Update inventory sheet and audit stock"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Task Description & Instructions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add all stock received this week and mark low-stock items for procurement."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 resize-none shadow-2xs"
              />
            </div>

            {/* Staff multi-select pills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  Assign To (Select one or more staff)
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllStaff}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {selectedStaffIds.length === staffList.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {staffList.map((staff) => {
                  const isSelected = selectedStaffIds.includes(staff.id);
                  return (
                    <button
                      type="button"
                      key={staff.id}
                      onClick={() => toggleStaff(staff.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/90 border border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                          isSelected ? 'bg-white text-indigo-700' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {staff.initials}
                      </div>
                      <span>{staff.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date & Time with Mini Calendar Popover */}
            <div className="space-y-3 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 p-4 sm:p-5 rounded-2xl border border-indigo-100/80">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Target Completion Deadline</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCalendarPopover(!showCalendarPopover)}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1 rounded-xl border border-indigo-100 shadow-2xs"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{showCalendarPopover ? 'Close Calendar' : 'Pick from Calendar'}</span>
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {datePresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.value}
                    onClick={() => setDueDate(preset.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dueDate === preset.value
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200/90'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative mt-2">
                {/* Due Date Input with Mini Calendar Trigger */}
                <div className="relative">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Completion Date
                  </span>
                  <div
                    onClick={() => setShowCalendarPopover(!showCalendarPopover)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 text-sm font-bold text-slate-900 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                  >
                    <span>{dueDate}</span>
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>

                  {/* Mini Calendar Popover */}
                  {showCalendarPopover && (
                    <div
                      ref={calendarRef}
                      className="absolute left-0 sm:left-auto right-auto top-16 z-50 animate-in fade-in zoom-in-95 duration-150 max-w-[calc(100vw-2.5rem)]"
                    >
                      <MiniCalendar
                        selectedDate={dueDate}
                        onSelectDate={(newDate) => {
                          setDueDate(newDate);
                          setShowCalendarPopover(false);
                        }}
                        taskDates={existingTaskDates}
                        onClose={() => setShowCalendarPopover(false)}
                      />
                    </div>
                  )}
                </div>

                {/* Due Time Input */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Completion Time
                  </span>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-cyan-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      placeholder="2:30 PM"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 text-sm font-bold text-slate-900 bg-white shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Priority pills */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Task Priority Level
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                {(['Low', 'Medium', 'High'] as TaskPriority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? p === 'High'
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                            : p === 'Medium'
                            ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-200'
                            : 'bg-slate-800 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-white' : p === 'High' ? 'bg-rose-500' : p === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                      />
                      <span>{p} Priority</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit & Cancel buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white text-xs sm:text-sm font-black shadow-md shadow-indigo-300/60 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Assign Task to Team</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('dashboard')}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Cards (1 col on xl) */}
        <div className="space-y-5 sm:space-y-6">
          {/* Compulsory work card */}
          <div className="bg-gradient-to-br from-indigo-50/90 to-violet-50/70 border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 mb-1">
                  Mandatory Execution Policy
                </h3>
                <p className="text-xs text-indigo-800 leading-relaxed font-semibold">
                  Tasks dispatched by Admin are compulsory and lock directly into staff to-do lists. Staff cannot reject or delete them.
                </p>
              </div>
            </div>
          </div>

          {/* Recently assigned list with prominent date & time */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100/90 shadow-md shadow-indigo-100/30">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Recently Assigned</span>
              <Clock className="w-4 h-4 text-cyan-600" />
            </h3>
            <div className="space-y-3.5">
              {recentlyAssigned.map((task) => (
                <div key={task.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {task.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                    <span className="font-semibold text-slate-600">{task.assignedToName}</span>
                    <span className="inline-flex items-center gap-1 font-black text-indigo-700 bg-indigo-50/90 px-2 py-0.5 rounded-md border border-indigo-100">
                      <Calendar className="w-3 h-3 text-indigo-500" />
                      <span>{task.dueDate} · {task.dueTime}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
