import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { HelpCircle, User, Users, Calendar, Clock, Send, CheckCircle2 } from 'lucide-react';
import { QuickDatePicker, QuickTimePicker } from '../common/DateTimePicker';

export const CreateToDoView: React.FC = () => {
  const { currentUser, users, createStaffTask, tasks, setCurrentPage, orgSettings } = useTaskToggle();

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [targetUserId, setTargetUserId] = useState<string>(currentUser.id); // Default to 'Myself'
  const [dueDate, setDueDate] = useState('27 Oct 2026');
  const [dueTime, setDueTime] = useState('5:00 PM');
  const [successToast, setSuccessToast] = useState(false);

  // Filter other staff members
  const otherStaff = users.filter((u) => u.role === 'staff' && u.id !== currentUser.id);

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
      {/* Clean Corporate Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Create New Task
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-2xs">
              {orgSettings.orgName} Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Add a to-do item for yourself or delegate a task to a colleague
          </p>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-3 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            {targetUserId === currentUser.id
              ? 'Task added straight to your personal to-do list!'
              : 'Task sent to colleague! It now appears on their Requests tab awaiting confirmation.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Main Form (2 cols on xl) */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
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

            {/* Assignee Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                Assignee (Who should perform this task?)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {/* Myself pill */}
                <button
                  type="button"
                  onClick={() => setTargetUserId(currentUser.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    targetUserId === currentUser.id
                      ? 'bg-indigo-600 text-white shadow-xs'
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
                          ? 'bg-indigo-600 text-white shadow-xs'
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

            {/* Target Deadline (Interactive Mini Calendar & Fast Clock Picker) */}
            <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Target Deadline (Mini Calendar & Fast Clock)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Interactive Mini Calendar Picker */}
                <div>
                  <QuickDatePicker
                    value={dueDate}
                    onChange={setDueDate}
                    label="Fix Date (Mini Calendar)"
                  />
                </div>

                {/* Interactive Fast Clock Picker */}
                <div>
                  <QuickTimePicker
                    value={dueTime}
                    onChange={setDueTime}
                    label="Fix Time (Clock Face & Fast Presets)"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-95"
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
          {/* Rules Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Delegation Rules
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium mb-2">
                  <strong>For yourself:</strong> Added directly into your active daily to-do queue.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  <strong>For colleague:</strong> Appears in their incoming requests queue. It becomes active when they tap <em>Accept Task</em>.
                </p>
              </div>
            </div>
          </div>

          {/* Delegated by you list */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
              <span>Delegated by You</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </h3>
            {sentByMeTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic font-medium">No tasks delegated to colleagues yet.</p>
            ) : (
              <div className="space-y-3.5">
                {sentByMeTasks.map((task) => (
                  <div key={task.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{task.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          task.status === 'done'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : task.status === 'accepted'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {task.status === 'done' ? 'Done' : task.status === 'accepted' ? 'Accepted' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                      <span className="font-medium text-slate-600">To: {task.assignedToName}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        <Calendar className="w-3 h-3 text-slate-500" />
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
