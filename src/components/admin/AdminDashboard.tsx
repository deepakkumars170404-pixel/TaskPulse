import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Plus,
  CheckCircle2,
  Clock,
  Users,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  Layers,
  Check,
  Trash2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Target,
  Send,
  Zap,
  XCircle,
} from 'lucide-react';
import { IssueModal } from '../common/IssueModal';
import { Task, TaskPriority, getTaskDeclineReason } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    tasks,
    users,
    currentUser,
    setCurrentPage,
    eventTiming,
    orgSettings,
    toggleTaskStatus,
    assignAdminPersonalTask,
    deleteTask,
  } = useTaskToggle();

  // Active Main Tab: 'staff' (Staff Target Tasks) | 'admin' (Admin Personal Tasks) | 'dual' (Side-by-Side Dual View)
  const [activeTab, setActiveTab] = useState<'staff' | 'admin' | 'dual'>('staff');

  // Selected Date Filter: 'today' | 'upcoming' | 'previous' | 'all'
  const [dateFilter, setDateFilter] = useState<'today' | 'previous' | 'upcoming' | 'all'>('today');
  const [selectedTaskForIssue, setSelectedTaskForIssue] = useState<Task | null>(null);

  // Quick Add Admin Personal Task State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTime, setQuickTime] = useState('5:00 PM');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('High');
  const [showQuickSuccess, setShowQuickSuccess] = useState(false);

  // Standard today reference string
  const TODAY_STR = '27 Oct 2026';

  // 1. Separate Tasks: Admin Own Tasks vs Staff Target Tasks
  const adminOwnTasks = tasks.filter(
    (t) => t.assignedTo === currentUser.id || (t.type === 'self' && t.createdBy === currentUser.id)
  );
  const staffTargetTasks = tasks.filter(
    (t) => t.assignedTo !== currentUser.id
  );

  // 2. Apply Date Timeline Filter
  const filterByDate = (taskList: Task[]) => {
    return taskList.filter((t) => {
      if (dateFilter === 'today') return t.dueDate === TODAY_STR || !t.dueDate;
      if (dateFilter === 'previous') return t.dueDate && t.dueDate < TODAY_STR;
      if (dateFilter === 'upcoming') return t.dueDate && t.dueDate > TODAY_STR;
      return true; // 'all'
    });
  };

  const filteredAdminTasks = filterByDate(adminOwnTasks);
  const filteredStaffTasks = filterByDate(staffTargetTasks);

  // 3. Admin Personal Completion Score (Strictly Calculated from Admin's Own Daily Tasks)
  const adminTotal = filteredAdminTasks.length;
  const adminCompleted = filteredAdminTasks.filter((t) => t.status === 'done').length;
  const adminPending = filteredAdminTasks.filter((t) => t.status !== 'done').length;
  const adminPersonalScore = adminTotal > 0 ? Math.round((adminCompleted / adminTotal) * 100) : 0;

  // 4. Staff Team Target Completion Rate (Strictly Calculated from Staff Tasks, Auto-Updated by Staff Strikes)
  const staffTotal = filteredStaffTasks.length;
  const staffCompleted = filteredStaffTasks.filter((t) => t.status === 'done').length;
  const staffDeclined = filteredStaffTasks.filter((t) => t.status === 'rejected').length;
  const staffPending = filteredStaffTasks.filter((t) => t.status !== 'done' && t.status !== 'rejected').length;
  const staffTeamRate = staffTotal > 0 ? Math.round((staffCompleted / staffTotal) * 100) : 0;
  const staffCount = users.filter((u) => u.role === 'staff').length;

  // Handle Quick Add for Admin's Personal Task
  const handleQuickAddAdminTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    assignAdminPersonalTask({
      title: quickTitle.trim(),
      dueDate: TODAY_STR,
      dueTime: quickTime,
      priority: quickPriority,
    });

    setQuickTitle('');
    setShowQuickSuccess(true);
    setTimeout(() => setShowQuickSuccess(false), 2500);
  };

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Executive Dashboard
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-2xs">
              {orgSettings.orgName} Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Dedicated separation: Admin personal daily tasks vs. staff team target deliverables
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setCurrentPage('assign')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Assign New Task</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 ml-1 border border-slate-200">
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-xs font-bold text-slate-700 mr-1.5 shrink-0 hidden xs:inline">
            Timeline View:
          </span>

          {(
            [
              { id: 'today', label: 'Today (27 Oct)' },
              { id: 'upcoming', label: 'Upcoming Deadlines' },
              { id: 'previous', label: 'Previous Records' },
              { id: 'all', label: 'All Tasks Directory' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setDateFilter(filter.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                dateFilter === filter.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] sm:text-xs text-slate-600 font-medium px-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-indigo-200" />
          <span>Active Timeline: <strong>{filteredAdminTasks.length}</strong> Admin · <strong>{filteredStaffTasks.length}</strong> Staff</span>
        </div>
      </div>

      {/* =========================================================================
          EXECUTIVE STAT CARDS: COMPLETELY SEPARATE ADMIN SCORE & STAFF RATE
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Card 1: 👑 ADMIN PERSONAL DAILY SCORE */}
        <div className="bg-gradient-to-br from-indigo-50/60 via-white to-white border-2 border-indigo-200 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded-lg">
              <span>👑 Admin Personal Score</span>
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              AD
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black font-['Outfit'] text-indigo-950">
              {adminPersonalScore}%
            </div>
            <span className="text-xs font-bold text-indigo-700">
              {adminCompleted}/{adminTotal} Finished
            </span>
          </div>
          {/* Dedicated Admin Progress Bar */}
          <div className="w-full bg-indigo-100/80 rounded-full h-2 mt-2.5 overflow-hidden p-0.5">
            <div
              className="bg-indigo-600 h-1 rounded-full transition-all duration-500"
              style={{ width: `${adminPersonalScore}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-2 flex items-center justify-between">
            <span>Admin Checklist</span>
            <span className="text-indigo-700 font-bold">{adminPending} Pending</span>
          </div>
        </div>

        {/* Card 2: 👥 STAFF TEAM TARGET DELIVERY RATE (AUTO-CALCULATED) */}
        <div className="bg-gradient-to-br from-emerald-50/60 via-white to-white border-2 border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
              <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              <span>Staff Team Delivery</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              Auto-Synced
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black font-['Outfit'] text-emerald-950">
              {staffTeamRate}%
            </div>
            <span className="text-xs font-bold text-emerald-700">
              {staffCompleted}/{staffTotal} Delivered
            </span>
          </div>
          {/* Dedicated Staff Progress Bar */}
          <div className="w-full bg-emerald-100/80 rounded-full h-2 mt-2.5 overflow-hidden p-0.5">
            <div
              className="bg-emerald-600 h-1 rounded-full transition-all duration-500"
              style={{ width: `${staffTeamRate}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-2 flex items-center justify-between">
            <span>Struck automatically by staff</span>
            <span className="text-emerald-700 font-bold">{staffPending} In Progress</span>
          </div>
        </div>

        {/* Card 3: Staff Active Pending Workload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Staff Queue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 mt-2">
            {staffPending}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Tasks currently being executed by staff
          </div>
        </div>

        {/* Card 4: Active Staff Team Members */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Team Roster
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 mt-2">
            {staffCount}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Operating under {orgSettings.orgName}
          </div>
        </div>
      </div>

      {/* =========================================================================
          CATEGORY TABS: COMPLETELY SEPARATE STAFF TARGET TASKS VS ADMIN TASKS
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'staff'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>👥 Staff Target Tasks</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'staff'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {filteredStaffTasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>👑 Admin Personal Daily Tasks</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'admin'
                  ? 'bg-white/20 text-white'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              {filteredAdminTasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dual')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'dual'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>📊 Dual Split View</span>
          </button>
        </div>

        <button
          onClick={() => setCurrentPage('monitor')}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all shrink-0"
        >
          <span>Open Staff Monitor</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* =========================================================================
          TAB 1: STAFF TARGET TASKS (AUTO-SYNCED FROM STAFF LOGINS)
          Admin does NOT need to strike staff tasks! Staff strikes in their login
          automatically reflect here and calculate the staff completion rate.
          ========================================================================= */}
      {(activeTab === 'staff' || activeTab === 'dual') && (
        <div className="space-y-4">
          {/* Informative Live Synchronization Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <span>⚡ Real-Time Staff Execution Sync Active</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Auto-Calculated
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-emerald-900 font-medium mt-0.5">
                  Admin does not need to strike staff target tasks. When staff strike tasks in their login, they automatically strike and update here in real time.
                </div>
              </div>
            </div>

            <div className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0 self-start sm:self-auto shadow-2xs">
              Staff Delivery Rate: <strong>{staffTeamRate}%</strong> ({staffCompleted}/{staffTotal})
            </div>
          </div>

          {/* Grid: Staff Tasks Table (2 cols) & Analytics / Event (1 col) */}
          <div className={`grid grid-cols-1 ${activeTab === 'dual' ? 'xl:grid-cols-1' : 'xl:grid-cols-3'} gap-6 sm:gap-8 w-full`}>
            {/* Staff Tasks Table */}
            <div className={`${activeTab === 'dual' ? '' : 'xl:col-span-2'} bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden`}>
              {/* Table Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                    <span>👥 Staff Target Tasks</span>
                    <span className="text-xs font-semibold text-slate-500">
                      ({filteredStaffTasks.length} tasks scheduled)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Live feed of tasks allotted to staff members across departments
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4 sm:px-5">Task Details</th>
                      <th className="py-3 px-4">Allotted Staff</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Deadline</th>
                      <th className="py-3 px-4 sm:px-5 text-right">Staff Execution Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStaffTasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-medium italic">
                          No staff target tasks found for this selected timeline.
                        </td>
                      </tr>
                    ) : (
                      filteredStaffTasks.map((task) => {
                        const isDone = task.status === 'done';
                        const isRejected = task.status === 'rejected';

                        return (
                          <tr
                            key={task.id}
                            className={`hover:bg-slate-50/80 transition-all ${
                              isDone ? 'bg-slate-50/50' : isRejected ? 'bg-rose-50/20' : ''
                            }`}
                          >
                            {/* Task Title */}
                            <td className="py-3.5 px-4 sm:px-5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                                    isDone
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : isRejected
                                      ? 'bg-rose-50 text-rose-600 border border-rose-300'
                                      : 'border-2 border-slate-300'
                                  }`}
                                  title={
                                    isDone
                                      ? `Struck done by ${task.assignedToName}`
                                      : isRejected
                                      ? `Declined by ${task.assignedToName}`
                                      : 'Awaiting staff action'
                                  }
                                >
                                  {isDone ? (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  ) : isRejected ? (
                                    <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div
                                    className={`font-bold truncate text-[13px] transition-all ${
                                      isDone
                                        ? 'line-through text-slate-400 font-medium decoration-emerald-500 decoration-2'
                                        : isRejected
                                        ? 'line-through text-slate-400 font-medium decoration-rose-400'
                                        : 'text-slate-900'
                                    }`}
                                  >
                                    {task.title}
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5 capitalize flex items-center gap-1 font-medium">
                                    <span>{task.type === 'admin' ? 'Admin Allotted' : `Staff: ${task.createdByName}`}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Assigned Staff */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                                  {task.assignedToName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .substring(0, 2)}
                                </div>
                                <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                                  {task.assignedToName}
                                </span>
                              </div>
                            </td>

                            {/* Priority Badge */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${
                                  task.priority === 'High'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : task.priority === 'Medium'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                <span>{task.priority}</span>
                              </span>
                            </td>

                            {/* Prominent Target Deadline */}
                            <td className="py-3.5 px-4">
                              <div className="inline-flex flex-col gap-0.5 items-start bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 whitespace-nowrap">
                                  <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span>{task.dueDate}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 whitespace-nowrap">
                                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>By {task.dueTime}</span>
                                </div>
                              </div>
                            </td>

                            {/* Status Column: Auto-Struck by Staff */}
                            <td className="py-3.5 px-4 sm:px-5 text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                <div
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                    isDone
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : isRejected
                                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                  title={
                                    isDone
                                      ? `Auto-struck by ${task.assignedToName} in their login`
                                      : isRejected
                                      ? `Declined by ${task.assignedToName}`
                                      : 'Awaiting staff execution in their portal'
                                  }
                                >
                                  {isDone ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>✓ Auto-Struck by {task.assignedToName.split(' ')[0]} {task.completedAt ? `(${task.completedAt})` : ''}</span>
                                    </>
                                  ) : isRejected ? (
                                    <>
                                      <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                      <span>❌ Declined by {task.assignedToName.split(' ')[0]}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span>⏳ Pending Staff Action</span>
                                    </>
                                  )}
                                </div>

                                {/* Rejection reason pill if declined */}
                                {isRejected && (
                                  <div
                                    className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-900 border border-rose-200 text-[10px] font-bold"
                                    title={getTaskDeclineReason(task) || 'No message provided'}
                                  >
                                    Why {task.assignedToName} Declined: "{getTaskDeclineReason(task) || 'No message provided'}"
                                  </div>
                                )}

                                {/* Nearby Written Issue Button / Popup Trigger */}
                                {!isDone && !isRejected && task.pendingReason && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTaskForIssue(task);
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer max-w-[190px] truncate"
                                    title="Click to view full issue in readable popup"
                                  >
                                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                    <span className="truncate">Issue: "{task.pendingReason}"</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Staff Team Delivery Analytics & Event Card */}
            {activeTab !== 'dual' && (
              <div className="space-y-5 sm:space-y-6">
                {/* Team Delivery Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Staff Delivery Rate
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {staffCompleted}/{staffTotal} tasks
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black font-['Outfit'] text-slate-900 tracking-tight">
                    {staffTeamRate}%
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden p-0.5">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${staffTeamRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2.5 font-medium flex items-center justify-between">
                    <span className="text-emerald-700 font-semibold">Delivered: <strong>{staffCompleted}</strong></span>
                    <span className="text-slate-600">Pending: <strong>{staffPending}</strong></span>
                  </p>
                </div>

                {/* Upcoming event card */}
                {eventTiming && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Special Event Schedule</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{eventTiming.eventName}</h4>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mt-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{eventTiming.date} · {eventTiming.newTiming}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                      <span>Staff Allotted:</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200">
                        {eventTiming.allottedStaffIds.length} members
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ADMIN PERSONAL DAILY TASKS (MY DAILY CHECKLIST & SCORE)
          Admin has options to assign daily tasks for their own self.
          Admin's completion score is completely separate from staff rate!
          ========================================================================= */}
      {(activeTab === 'admin' || activeTab === 'dual') && (
        <div className="space-y-4">
          {/* Informative Admin Personal Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                👑
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <span>👑 Admin Personal Daily Agenda & Checklist</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-300">
                    Independent Score
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-indigo-900 font-medium mt-0.5">
                  Tasks assigned to yourself. Click the checkbox or row to strike off completed items and increase your Admin Personal Daily Score.
                </div>
              </div>
            </div>

            <div className="text-xs font-bold text-indigo-800 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shrink-0 self-start sm:self-auto shadow-2xs">
              Personal Daily Score: <strong>{adminPersonalScore}%</strong> ({adminCompleted}/{adminTotal})
            </div>
          </div>

          {/* Quick-Add Personal Task Inline Form */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Quick Add Admin Daily Task</span>
              </h4>
              {showQuickSuccess && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 animate-in fade-in">
                  ✓ Task added to your personal agenda!
                </span>
              )}
            </div>

            <form onSubmit={handleQuickAddAdminTask} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="What is your executive priority today, Admin? (e.g. Sign vendor contracts)"
                required
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs sm:text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 shadow-2xs"
              />

              <div className="flex items-center gap-2">
                <select
                  value={quickPriority}
                  onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white shadow-2xs cursor-pointer focus:outline-none focus:border-indigo-600"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>

                <select
                  value={quickTime}
                  onChange={(e) => setQuickTime(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white shadow-2xs cursor-pointer focus:outline-none focus:border-indigo-600"
                >
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="2:30 PM">2:30 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="6:30 PM">6:30 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                </select>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Add to My Day</span>
                </button>
              </div>
            </form>
          </div>

          {/* Grid: Admin Tasks Checklist & Admin Score Analytics */}
          <div className={`grid grid-cols-1 ${activeTab === 'dual' ? 'xl:grid-cols-1' : 'xl:grid-cols-3'} gap-6 sm:gap-8 w-full`}>
            {/* Admin Checklist */}
            <div className={`${activeTab === 'dual' ? '' : 'xl:col-span-2'} bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden`}>
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                    <span>👑 Admin Personal Checklist</span>
                    <span className="text-xs font-semibold text-slate-500">
                      ({filteredAdminTasks.length} tasks)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Click any task checkbox or row to strike it complete with reward chime
                  </p>
                </div>

                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl">
                  {adminCompleted} of {adminTotal} Finished
                </span>
              </div>

              {filteredAdminTasks.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Admin Personal Tasks Scheduled</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Use the quick-add bar above to assign your first daily goal for today.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredAdminTasks.map((task) => {
                    const isDone = task.status === 'done';

                    return (
                      <div
                        key={task.id}
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`p-4 sm:p-4.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-all cursor-pointer select-none ${
                          isDone ? 'bg-slate-50/50 opacity-80' : ''
                        }`}
                        title="Click to strike or unstrike this personal task"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskStatus(task.id);
                            }}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              isDone
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'border-2 border-slate-300 hover:border-indigo-500'
                            }`}
                          >
                            {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>

                          <div className="min-w-0">
                            <div
                              className={`text-sm font-bold transition-all ${
                                isDone
                                  ? 'line-through text-slate-400 font-medium decoration-indigo-600 decoration-2'
                                  : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </div>
                            {task.description && (
                              <p className="text-xs text-slate-500 truncate max-w-md mt-0.5 font-medium">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-semibold flex-wrap">
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>Due: {task.dueTime}</span>
                              </span>
                              {task.completedAt && (
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  ✓ Completed at {task.completedAt}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                              task.priority === 'High'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : task.priority === 'Medium'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {task.priority}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer"
                            title="Delete personal task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Admin Personal Completion Score Analytics */}
            {activeTab !== 'dual' && (
              <div className="space-y-5 sm:space-y-6">
                <div className="bg-gradient-to-br from-indigo-50/50 via-white to-white rounded-2xl p-5 sm:p-6 border-2 border-indigo-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                      👑 Admin Personal Score
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {adminCompleted}/{adminTotal} items
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black font-['Outfit'] text-indigo-950 tracking-tight">
                    {adminPersonalScore}%
                  </div>

                  <div className="w-full bg-indigo-100 rounded-full h-2.5 mt-3 overflow-hidden p-0.5">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${adminPersonalScore}%` }}
                    />
                  </div>

                  <div className="mt-4 pt-3 border-t border-indigo-100 text-xs font-medium text-slate-600 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700 font-bold">Finished by Admin:</span>
                      <span className="font-bold text-slate-900">{adminCompleted} tasks</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold">Remaining Today:</span>
                      <span className="font-bold text-slate-900">{adminPending} tasks</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-white border border-indigo-200 text-xs text-indigo-950 font-medium">
                    {adminPersonalScore === 100 ? (
                      <span className="text-emerald-800 font-bold">🎉 Outstanding! All personal daily targets completed!</span>
                    ) : adminPersonalScore >= 50 ? (
                      <span className="text-indigo-900 font-semibold">🚀 Solid executive pace! Keep up the daily momentum.</span>
                    ) : (
                      <span className="text-slate-700 font-medium">🎯 Click any row to strike off completed daily goals.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Readable Issue Popup Modal */}
      <IssueModal
        task={selectedTaskForIssue}
        onClose={() => setSelectedTaskForIssue(null)}
      />
    </div>
  );
};
