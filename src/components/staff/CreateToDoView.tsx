import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { HelpCircle, Sparkles, User, Users, Calendar, Clock, Send, ArrowRight } from 'lucide-react';

export const CreateToDoView: React.FC = () => {
  const { currentUser, users, createStaffTask, tasks, setCurrentPage, orgSettings } = useTaskToggle();

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [targetUserId, setTargetUserId] = useState<string>(currentUser.id); // Default to 'Myself'
  const [dueDate, setDueDate] = useState('24 Oct 2026');
  const [dueTime, setDueTime] = useState('5:00 PM');
  const [successToast, setSuccessToast] = useState(false);

  // Filter other staff members
  const otherStaff = users.filter((u) => u.role === 'staff' && u.id !== currentUser.id);

  // Quick date presets
  const datePresets = [
    { label: 'Today (24 Oct)', value: '24 Oct 2026' },
    { label: 'Tomorrow (25 Oct)', value: '25 Oct 2026' },
    { label: 'Upcoming (26 Oct)', value: '26 Oct 2026' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a task title.');
      return;
    }

    createStaffTask({
      title,
      details,
      createForUserId: targetUserId,
      dueDate,
      dueTime,
    });

    setTitle('');
    setDetails('');
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  // Sent by me tasks
  const sentByMeTasks = tasks
    .filter((t) => t.createdBy === currentUser.id && t.type === 'staff')
    .slice(0, 6);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header with Rich Multi-Color Gradients */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-indigo-100/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Create New Task
            </h1>
            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs shadow-indigo-300/40">
              {orgSettings.orgName} Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Add a to-do item for yourself or delegate a task to a colleague</span>
          </p>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-950 flex items-center gap-3 animate-in fade-in shadow-xs">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">
            {targetUserId === currentUser.id
              ? 'Task added straight to your personal to-do list!'
              : 'Task sent to colleague! It now appears on their Requests tab awaiting confirmation.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Main Form (2 cols on xl) */}
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
                placeholder="e.g. Share call notes template with team"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Task Details & Context
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Send the template used for client calls to the team with updated questions."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 resize-none shadow-2xs"
              />
            </div>

            {/* Create for - Vibrant Pills */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
                Assignee (Who should perform this task?)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {/* Myself pill */}
                <button
                  type="button"
                  onClick={() => setTargetUserId(currentUser.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    targetUserId === currentUser.id
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Myself (Personal To-Do)</span>
                </button>

                {/* Other staff pills */}
                {otherStaff.map((staff) => {
                  const isSelected = targetUserId === staff.id;
                  return (
                    <button
                      type="button"
                      key={staff.id}
                      onClick={() => setTargetUserId(staff.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{staff.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Deadline (Date & Time) */}
            <div className="space-y-3 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 p-4 sm:p-5 rounded-2xl border border-indigo-100/80">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Target Deadline (Date & Time)</span>
                </label>
              </div>

              {/* Quick Presets */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Completion Date
                  </span>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-indigo-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      placeholder="24 Oct 2026"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-bold text-slate-900 bg-white shadow-2xs"
                    />
                  </div>
                </div>

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
                      placeholder="5:00 PM"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 text-sm font-bold text-slate-900 bg-white shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white text-xs sm:text-sm font-black shadow-md shadow-indigo-300/60 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Create & Schedule Task</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('mytodo')}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info & Sent by Me */}
        <div className="space-y-5 sm:space-y-6">
          {/* How it works card */}
          <div className="bg-gradient-to-br from-cyan-50/90 to-blue-50/50 border border-cyan-100/90 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-950 mb-2">
                  Delegation Rules
                </h3>
                <p className="text-xs text-cyan-900 leading-relaxed font-semibold mb-2">
                  <strong>For yourself:</strong> Added directly into your active daily to-do queue.
                </p>
                <p className="text-xs text-cyan-900 leading-relaxed font-semibold">
                  <strong>For colleague:</strong> Appears in their incoming requests queue. It becomes active when they tap <em>Accept Task</em>.
                </p>
              </div>
            </div>
          </div>

          {/* Sent by me */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100/90 shadow-md shadow-indigo-100/30">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Delegated by You</span>
              <Users className="w-4 h-4 text-cyan-600" />
            </h3>
            {sentByMeTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic font-semibold">No tasks delegated to colleagues yet.</p>
            ) : (
              <div className="space-y-3.5">
                {sentByMeTasks.map((task) => (
                  <div key={task.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{task.title}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                          task.status === 'done'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : task.status === 'accepted'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {task.status === 'done' ? 'Done' : task.status === 'accepted' ? 'Accepted' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                      <span className="font-semibold text-slate-600">To: {task.assignedToName}</span>
                      <span className="inline-flex items-center gap-1 font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        <span>{task.dueDate} · {task.dueTime}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
