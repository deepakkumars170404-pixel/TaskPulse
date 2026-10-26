import React, { useState } from 'react';
import { useTaskPulse } from '../../context/TaskPulseContext';
import { HelpCircle, Sparkles, User, Users } from 'lucide-react';

export const CreateToDoView: React.FC = () => {
  const { currentUser, users, createStaffTask, tasks, setCurrentPage } = useTaskPulse();

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [targetUserId, setTargetUserId] = useState<string>(currentUser.id); // Default to 'Myself'
  const [dueDate, setDueDate] = useState('24 Oct 2026');
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
    .slice(0, 5);

  return (
    <div className="w-full p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Create To-Do</h1>
        <p className="text-sm text-slate-500">Add a task for yourself or for another staff member</p>
      </div>

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold">
            {targetUserId === currentUser.id
              ? 'Task added straight to your to-do list!'
              : 'Task sent to colleague! It will appear on their Requests tab awaiting acceptance.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
        {/* Main Form */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Task title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Share call notes template"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Details
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Send the template used for client calls to the team."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Create for */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Create for
              </label>
              <div className="flex flex-wrap gap-2">
                {/* Myself pill */}
                <button
                  type="button"
                  onClick={() => setTargetUserId(currentUser.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    targetUserId === currentUser.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Myself</span>
                </button>

                {/* Other staff pills */}
                {otherStaff.map((staff) => {
                  const isSelected = targetUserId === staff.id;
                  return (
                    <button
                      type="button"
                      key={staff.id}
                      onClick={() => setTargetUserId(staff.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{staff.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due date & Due time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Due date
                </label>
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Due time
                </label>
                <input
                  type="text"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
              >
                Create to-do
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('mytodo')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info & Sent by Me */}
        <div className="space-y-6">
          {/* How it works card */}
          <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900 mb-2">
                  How it works
                </h3>
                <p className="text-xs text-sky-800 leading-relaxed font-medium mb-2">
                  <strong>For yourself:</strong> added straight to your list.
                </p>
                <p className="text-xs text-sky-800 leading-relaxed font-medium">
                  <strong>For another staff:</strong> they must accept it. Until then the task stays <em>Pending</em>.
                </p>
              </div>
            </div>
          </div>

          {/* Sent by me */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Sent by me
            </h3>
            {sentByMeTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tasks delegated yet.</p>
            ) : (
              <div className="space-y-3.5">
                {sentByMeTasks.map((task) => (
                  <div key={task.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">{task.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.status === 'accepted' || task.status === 'done'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {task.status === 'done' ? 'Done' : task.status === 'accepted' ? 'Accepted' : 'Pending'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">To: {task.assignedToName}</div>
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

