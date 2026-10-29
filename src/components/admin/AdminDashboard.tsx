import React, { useState, useMemo } from 'react';
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
  Zap,
  XCircle,
  Target,
  GraduationCap,
} from 'lucide-react';
import { IssueModal } from '../common/IssueModal';
import { Task, TaskPriority, getTaskDeclineReason } from '../../types';
import {
  getTodayDateString,
  getTodayShortString,
  isDateToday,
  isDatePrevious,
  isDateUpcoming,
  useLiveDateTime,
} from '../../utils/dateUtils';

const isExcludedTask = (t: Task): boolean =>
  t.id === '__system_admissions_storage__' ||
  Boolean(t.id?.startsWith('adm_')) ||
  Boolean(t.title?.includes('[STUDENT_ADMISSION]')) ||
  Boolean(t.title?.startsWith('__SYSTEM_'));

export const AdminDashboard: React.FC = () => {
  const {
    tasks,
    users,
    admissions,
    currentUser,
    setCurrentPage,
    eventTiming,
    orgSettings,
    toggleTaskStatus,
    assignAdminPersonalTask,
    deleteTask,
  } = useTaskToggle();

  // Active Main Tab: 'all' (All Tasks) | 'staff' (Staff Target Tasks) | 'admin' (Admin Personal Tasks) | 'dual' (Side-by-Side Dual View)
  const [activeTab, setActiveTab] = useState<'all' | 'staff' | 'admin' | 'dual'>('all');

  // Selected Date Filter: 'today' | 'upcoming' | 'previous' | 'all'
  const [dateFilter, setDateFilter] = useState<'today' | 'previous' | 'upcoming' | 'all'>('today');
  const [selectedTaskForIssue, setSelectedTaskForIssue] = useState<Task | null>(null);

  // Group admissions by staff for quick ranking
  const staffAdmissionRankings = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    users.forEach((u) => {
      counts[u.id] = { name: u.name, count: 0 };
    });
    admissions.forEach((a) => {
      if (counts[a.staffId]) {
        counts[a.staffId].count += 1;
      } else {
        counts[a.staffId] = { name: a.staffName, count: 1 };
      }
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [users, admissions]);

  // Quick Add Admin Personal Task State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTime, setQuickTime] = useState('5:00 PM');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('High');
  const [showQuickSuccess, setShowQuickSuccess] = useState(false);

  // Dynamic live date reference string (updates in real-time)
  const { todayStandard: todayStr, todayShort } = useLiveDateTime();

  // 1. Separate Tasks: Admin Own Tasks vs Staff Target Tasks
  const adminOwnTasks = tasks.filter(
    (t) =>
      !isExcludedTask(t) &&
      (t.type === 'self' ||
      t.assignedTo === currentUser.id ||
      t.assignedTo === 'admin_deepak' ||
      t.assignedTo === 'admin_1' ||
      t.assignedTo === 'admin' ||
      Boolean(t.assignedToName?.toLowerCase().includes('admin')))
  );
  const staffTargetTasks = tasks.filter(
    (t) =>
      !isExcludedTask(t) &&
      t.type !== 'self' &&
      t.assignedTo !== currentUser.id &&
      t.assignedTo !== 'admin_deepak' &&
      t.assignedTo !== 'admin_1' &&
      t.assignedTo !== 'admin' &&
      !t.assignedToName?.toLowerCase().includes('admin')
  );

  // 2. Dynamic Real-Time Date Timeline Filter
  const filterByDate = (taskList: Task[]) => {
    return taskList.filter((t) => {
      if (dateFilter === 'today') return isDateToday(t.dueDate);
      if (dateFilter === 'previous') return isDatePrevious(t.dueDate);
      if (dateFilter === 'upcoming') return isDateUpcoming(t.dueDate);
      return true; // 'all'
    });
  };

  const filteredAdminTasks = filterByDate(adminOwnTasks);
  const filteredStaffTasks = filterByDate(staffTargetTasks);
  const filteredAllTasks = filterByDate(tasks.filter((t) => !isExcludedTask(t)));

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

  // Allotted Staff Members for Special Event (resolved with full names & avatar details)
  const allottedStaffMembers = useMemo(() => {
    if (!eventTiming) return [];
    if (Array.isArray(eventTiming.allottedStaffIds) && eventTiming.allottedStaffIds.length > 0) {
      const matched = users.filter((u) => eventTiming.allottedStaffIds.includes(u.id));
      if (matched.length > 0) return matched;
      const matchedByName = users.filter((u) =>
        eventTiming.allottedStaffIds.some(
          (val) =>
            u.id.toLowerCase().includes(val.toLowerCase()) ||
            u.name.toLowerCase().includes(val.toLowerCase())
        )
      );
      if (matchedByName.length > 0) return matchedByName;
    }
    // Fallback: list all staff team members if none explicitly allotted
    return users.filter((u) => u.role === 'staff');
  }, [eventTiming, users]);

  // Handle Quick Add for Admin's Personal Task (uses dynamic today date)
  const handleQuickAddAdminTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    assignAdminPersonalTask({
      title: quickTitle.trim(),
      dueDate: getTodayDateString(),
      dueTime: quickTime,
      priority: quickPriority,
    });

    setQuickTitle('');
    setShowQuickSuccess(true);
    setTimeout(() => setShowQuickSuccess(false), 2500);
  };

  // Determine tasks to display in the main table with prioritized sort (pending first, newest created first)
  const rawDisplayedTasks =
    activeTab === 'staff'
      ? filteredStaffTasks
      : activeTab === 'admin'
      ? filteredAdminTasks
      : filteredAllTasks;

  const displayedTableTasks = useMemo(() => {
    return [...rawDisplayedTasks].sort((a, b) => {
      const aDone = a.status === 'done' || a.status === 'rejected';
      const bDone = b.status === 'done' || b.status === 'rejected';
      if (aDone !== bDone) return aDone ? 1 : -1;

      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      if (timeA !== timeB) return timeB - timeA;

      return 0;
    });
  }, [rawDisplayedTasks]);

  return (
    <div className="w-full p-2.5 sm:p-4 lg:p-5 space-y-2.5 sm:space-y-3.5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 sm:pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Executive Dashboard
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-800 border border-primary-200/90">
              {orgSettings.orgName} Workspace
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium hidden sm:block">
            Dedicated separation: Admin personal daily tasks vs. staff team target deliverables
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setCurrentPage('assign')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Assign New Task</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Bar (Dynamic Real-Time Date Tracking) */}
      <div className="bg-white p-1.5 sm:p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 ml-0.5 border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-primary-500" />
          </div>
          <span className="text-xs font-bold text-slate-700 mr-1 shrink-0 hidden sm:inline">
            Timeline:
          </span>

          {(
            [
              { id: 'today', label: `Today (${todayShort})` },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'previous', label: 'Previous' },
              { id: 'all', label: 'All Dates' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setDateFilter(filter.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                dateFilter === filter.id
                  ? 'bg-primary-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="text-[10px] sm:text-xs text-slate-600 font-medium px-2 flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-primary-500 ring-2 ring-primary-200" />
          <span>
            <strong>{filteredAdminTasks.length}</strong> Admin Personal · <strong>{filteredStaffTasks.length}</strong> Staff Target
          </span>
        </div>
      </div>

      {/* =========================================================================
          EXECUTIVE STAT CARDS: SEPARATE ADMIN SCORE & STAFF RATE
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Card 1: 👑 ADMIN PERSONAL DAILY SCORE */}
        <div
          onClick={() => setActiveTab('admin')}
          className="bg-gradient-to-br from-primary-50/60 via-white to-white border border-primary-300 rounded-xl p-2.5 sm:p-3.5 shadow-2xs relative overflow-hidden cursor-pointer hover:border-primary-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-primary-700 bg-primary-100/70 px-2 py-0.5 rounded-md">
              👑 Admin Score
            </span>
            <div className="w-6 h-6 rounded-md bg-primary-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
              AD
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-black font-['Outfit'] text-primary-950">
              {adminPersonalScore}%
            </div>
            <span className="text-[11px] font-bold text-primary-600">
              {adminCompleted}/{adminTotal} Done
            </span>
          </div>
          <div className="w-full bg-primary-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-primary-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${adminPersonalScore}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1.5 flex items-center justify-between">
            <span>Admin Checklist</span>
            <span className="text-primary-600 font-bold">{adminPending} Pending</span>
          </div>
        </div>

        {/* Card 2: 👥 STAFF TEAM TARGET DELIVERY RATE (AUTO-CALCULATED) */}
        <div
          onClick={() => setActiveTab('staff')}
          className="bg-gradient-to-br from-emerald-50/60 via-white to-white border border-emerald-300 rounded-xl p-2.5 sm:p-3.5 shadow-2xs relative overflow-hidden cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              <span>Team Delivery</span>
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Auto
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-black font-['Outfit'] text-emerald-950">
              {staffTeamRate}%
            </div>
            <span className="text-[11px] font-bold text-emerald-700">
              {staffCompleted}/{staffTotal} Done
            </span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${staffTeamRate}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1.5 flex items-center justify-between">
            <span>By Staff Strikes</span>
            <span className="text-emerald-700 font-bold">{staffPending} Active</span>
          </div>
        </div>

        {/* Card 3: Staff Active Pending Workload */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3.5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Staff Queue
            </span>
            <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-900 mt-1">
            {staffPending}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1 truncate">
            Active staff tasks in queue
          </div>
        </div>

        {/* Card 4: Active Staff Team Members */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3.5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Team Roster
            </span>
            <div className="w-6 h-6 rounded-md bg-primary-50 flex items-center justify-center text-primary-500 border border-primary-200">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-900 mt-1">
            {staffCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1 truncate">
            Staff in {orgSettings.orgName}
          </div>
        </div>
      </div>

      {/* =========================================================================
          CATEGORY TABS: ALL TASKS (UNIFIED) | ADMIN AGENDA | STAFF TASKS | DUAL
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {/* Tab 1: All Tasks (Unified Master Table) */}
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'all'
                ? 'bg-primary-500 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Tasks</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {filteredAllTasks.length}
            </span>
          </button>

          {/* Tab 2: Admin Personal Agenda */}
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'admin'
                ? 'bg-primary-500 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Agenda</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'admin'
                  ? 'bg-white/20 text-white'
                  : 'bg-primary-50 text-primary-700 border border-primary-200'
              }`}
            >
              {filteredAdminTasks.length}
            </span>
          </button>

          {/* Tab 3: Staff Target Tasks */}
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'staff'
                ? 'bg-primary-500 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Tasks</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'staff'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {filteredStaffTasks.length}
            </span>
          </button>

          {/* Tab 4: Split View */}
          <button
            type="button"
            onClick={() => setActiveTab('dual')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'dual'
                ? 'bg-primary-500 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
        </div>

        <button
          onClick={() => setCurrentPage('monitor')}
          className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all shrink-0"
        >
          <span>Staff Monitor</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* =========================================================================
          VIEW 1: TASK TABLE (ALL TASKS, ADMIN AGENDA, OR STAFF TASKS)
          Displays Admin personal tasks with 👑 crown badge + interactive strike checkbox
          ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'staff' || activeTab === 'admin' || activeTab === 'dual') && (
        <div className="space-y-4">
          {/* Informative Banner */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                {activeTab === 'all' ? <Layers className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5 fill-white" />}
              </div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>{activeTab === 'all' ? '📋 Master Task Column (Admin + Staff)' : '⚡ Real-Time Staff Sync'}</span>
                <span className="text-[10px] text-slate-600 font-medium hidden md:inline">
                  {activeTab === 'all'
                    ? 'Admin personal tasks are interactive and can be struck completed directly in this table.'
                    : 'When staff strike tasks in their login, updates reflect here automatically.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {filteredAdminTasks.length > 0 && activeTab === 'staff' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className="text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg border border-primary-200 transition-all cursor-pointer"
                >
                  👑 You have {filteredAdminTasks.length} Admin personal tasks
                </button>
              )}
              <button
                type="button"
                onClick={() => setCurrentPage('admissions')}
                className="text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0 self-start sm:self-auto shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Click to view which staff put admissions and student details"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admissions: <strong>{admissions.length}</strong></span>
              </button>
              <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 self-start sm:self-auto shadow-2xs">
                Delivery: <strong>{staffTeamRate}%</strong> ({staffCompleted}/{staffTotal})
              </div>
            </div>
          </div>

          {/* Standalone Executive Overview Row: Staff Delivery, Event Schedule & Student Admissions */}
          {activeTab !== 'dual' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
              {/* Box 1: Staff Team Delivery Rate */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Staff Team Delivery Rate
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">Automatic live calculation from staff completed strikes</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {staffCompleted}/{staffTotal} tasks
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight mt-1">
                  {staffTeamRate}%
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden p-0.5">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${staffTeamRate}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-2.5 font-medium flex items-center justify-between">
                  <span className="text-emerald-700 font-semibold">✓ Delivered: <strong>{staffCompleted}</strong></span>
                  <span className="text-amber-700 font-semibold">⏳ In Queue: <strong>{staffPending}</strong></span>
                  {staffDeclined > 0 && <span className="text-rose-600 font-semibold">❌ Declined: <strong>{staffDeclined}</strong></span>}
                </div>
              </div>

              {/* Box 2: Special Event Schedule */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Special Event Schedule
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">Shift timing override for organization events</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('timing')}
                    className="text-[11px] font-bold text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg border border-primary-200 transition-all cursor-pointer"
                  >
                    Timing Settings →
                  </button>
                </div>

                {eventTiming ? (
                  <div>
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {eventTiming.eventName}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700 mt-1.5 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                      <span className="inline-flex items-center gap-1 text-primary-700 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                        <span>{eventTiming.date}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1 text-slate-900 font-bold">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{eventTiming.newTiming}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-600 font-bold">
                        {allottedStaffMembers.length} staff allotted
                      </span>
                    </div>

                    {/* Allotted Staff: Clear Avatar Circles with Full Visible Names */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Staff Allotted:</span>
                        <span className="text-[10px] font-semibold text-primary-600">
                          {allottedStaffMembers.length} member{allottedStaffMembers.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {allottedStaffMembers.map((staff) => (
                          <div
                            key={staff.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 transition-colors shadow-2xs"
                            title={staff.name}
                          >
                            <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 uppercase ring-1 ring-primary-300">
                              {staff.initials || staff.name.charAt(0)}
                            </span>
                            <span className="font-bold text-slate-900 capitalize whitespace-nowrap text-xs">
                              {staff.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic py-2">
                    No special event schedule currently active.
                  </div>
                )}
              </div>

              {/* Box 3: Total Student Admissions & Staff Breakdown (Clickable -> Opens Admissions Hub) */}
              <div
                onClick={() => setCurrentPage('admissions')}
                className="bg-white border-2 border-indigo-100 hover:border-primary-500 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group md:col-span-2 lg:col-span-1"
                title="Click to view student admission details & which staff enrolled them"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-4.5 h-4.5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <span>Student Admissions</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Live Count
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">Click to inspect students & staff breakdown</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-primary-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Details →</span>
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
                      {admissions.length}
                    </span>
                    <span className="text-xs font-bold text-slate-500">Students Enrolled</span>
                  </div>

                  {/* Staff breakdown pills preview */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                      <span>Staff Breakdown:</span>
                      <span className="text-[10px] text-primary-600 font-bold">
                        {staffAdmissionRankings.filter((s) => s.count > 0).length} staff members
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {staffAdmissionRankings.filter((s) => s.count > 0).length > 0 ? (
                        staffAdmissionRankings
                          .filter((s) => s.count > 0)
                          .slice(0, 4)
                          .map((s, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                            >
                              <span className="truncate max-w-[90px]">{s.name}</span>
                              <strong className="text-emerald-700 font-black">({s.count})</strong>
                            </span>
                          ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No admissions recorded yet</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-primary-700 font-bold flex items-center justify-between bg-primary-50/70 p-2 rounded-xl border border-primary-100">
                  <span>👥 Click to view which staff enrolled which student</span>
                  <span>View Details →</span>
                </div>
              </div>
            </div>
          )}

          {/* Standalone Full-Width Tasks Table: Completely Separate from Staff Delivery Box, No Scroll */}
          <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Table Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                  <span>
                    {activeTab === 'all'
                      ? '📋 All Assigned Tasks'
                      : activeTab === 'admin'
                      ? '👑 Admin Personal Tasks'
                      : '👥 Staff Target Tasks'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    ({displayedTableTasks.length} tasks scheduled)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {activeTab === 'all'
                    ? 'Live feed of Admin personal agenda items & staff team target deliverables'
                    : activeTab === 'admin'
                    ? 'Your personal tasks and executive daily milestones'
                    : 'Live feed of tasks allotted to staff members across departments'}
                </p>
              </div>

              {/* Quick Filter Pill Buttons directly on the Table Header */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-primary-500 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  All ({filteredAllTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'admin'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  👑 Admin ({filteredAdminTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('staff')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'staff'
                      ? 'bg-primary-500 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Staff ({filteredStaffTasks.length})
                </button>
              </div>
            </div>

            {/* 1. Mobile Responsive Cards (< md screens) - Zero horizontal scroll, touch-first cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {displayedTableTasks.length === 0 ? (
                <div className="py-10 px-4 text-center text-slate-400 font-medium italic text-xs">
                  No tasks found for this selected timeline filter.
                </div>
              ) : (
                displayedTableTasks.map((task) => {
                  const isAdminTask =
                    task.assignedTo === currentUser.id ||
                    task.assignedTo === 'admin_deepak' ||
                    task.assignedTo === 'admin_1' ||
                    task.assignedTo === 'admin' ||
                    task.type === 'self' ||
                    Boolean(task.assignedToName?.toLowerCase().includes('admin'));
                  const isDone = task.status === 'done';
                  const isRejected = task.status === 'rejected';

                  return (
                    <div
                      key={task.id}
                      className={`p-3 space-y-2 transition-all ${
                        isDone
                          ? 'bg-slate-50/60 opacity-80'
                          : isRejected
                          ? 'bg-rose-50/20'
                          : isAdminTask
                          ? 'bg-amber-50/20'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Top Row: Checkbox/Icon + Title + Action */}
                      <div className="flex items-start gap-2.5">
                        {isAdminTask ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskStatus(task.id);
                            }}
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                              isDone
                                ? 'bg-primary-500 text-white shadow-2xs'
                                : 'border-2 border-slate-300 hover:border-primary-500 bg-white'
                            }`}
                            title="Click to strike or unstrike this personal task"
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        ) : (
                          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : isRejected ? (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs font-bold leading-snug break-words ${
                              isDone
                                ? 'line-through text-slate-400 font-medium decoration-primary-500 decoration-2'
                                : isRejected
                                ? 'line-through text-slate-400 font-medium decoration-rose-400'
                                : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </div>

                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                            {isAdminTask ? (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-800">
                                👑 Admin Personal Task
                              </span>
                            ) : (
                              <span>
                                {task.type === 'admin' ? 'Staff Delegation' : `By ${task.createdByName}`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status / Strike Action Button */}
                        <div className="shrink-0">
                          {isAdminTask ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => toggleTaskStatus(task.id)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                  isDone
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {isDone ? '✓ Done' : '⏳ Pending'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTask(task.id);
                                }}
                                className="w-6 h-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isRejected
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {isDone ? '✓ Delivered' : isRejected ? '❌ Declined' : '⏳ In Queue'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Meta Row: Assignee, Priority, Deadline */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap pt-1 border-t border-slate-100 text-[10px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Assignee */}
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            <span className="w-3.5 h-3.5 rounded-full bg-primary-600 text-white text-[8px] font-bold flex items-center justify-center">
                              {isAdminTask ? '👑' : task.assignedToName?.charAt(0) || 'S'}
                            </span>
                            <span className="truncate max-w-[100px]">
                              {isAdminTask ? 'Admin (Myself)' : task.assignedToName}
                            </span>
                          </span>

                          {/* Priority */}
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold ${
                              task.priority === 'High'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : task.priority === 'Medium'
                                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>

                          {/* Deadline */}
                          <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                            <Calendar className="w-3 h-3 text-primary-500" />
                            <span>{task.dueDate}</span>
                            <span className="text-slate-400">·</span>
                            <span>{task.dueTime}</span>
                          </span>
                        </div>

                        {/* Reported Issue button on mobile if exists */}
                        {!isDone && !isRejected && task.pendingReason && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTaskForIssue(task);
                            }}
                            className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[9px] font-bold flex items-center gap-1 cursor-pointer max-w-[130px] truncate"
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                            <span className="truncate">Issue</span>
                          </button>
                        )}
                      </div>

                      {/* Declined reason banner on mobile if exists */}
                      {isRejected && (
                        <div className="p-1.5 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 text-[10px] font-medium leading-tight">
                          <strong>Why Declined:</strong> "{getTaskDeclineReason(task) || 'No message provided'}"
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* 2. Desktop Table (>= md screens) */}
            <div className="hidden md:block overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-3 sm:px-4">Task Details</th>
                    <th className="py-3 px-3 whitespace-nowrap">Assigned To</th>
                    <th className="py-3 px-3 whitespace-nowrap">Priority</th>
                    <th className="py-3 px-3 whitespace-nowrap">Deadline</th>
                    <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">Status & Action</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedTableTasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-medium italic">
                          No tasks found for this selected timeline filter.
                        </td>
                      </tr>
                    ) : (
                      displayedTableTasks.map((task) => {
                        const isAdminTask =
                          task.assignedTo === currentUser.id ||
                          task.assignedTo === 'admin_deepak' ||
                          task.assignedTo === 'admin_1' ||
                          task.assignedTo === 'admin' ||
                          task.type === 'self' ||
                          Boolean(task.assignedToName?.toLowerCase().includes('admin'));
                        const isDone = task.status === 'done';
                        const isRejected = task.status === 'rejected';

                        return (
                          <tr
                            key={task.id}
                            className={`hover:bg-slate-50/80 transition-all ${
                              isDone
                                ? 'bg-slate-50/50'
                                : isRejected
                                ? 'bg-rose-50/20'
                                : isAdminTask
                                ? 'bg-amber-50/15'
                                : ''
                            }`}
                          >
                            {/* Task Details */}
                            <td className="py-2.5 px-3 sm:px-4">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {isAdminTask ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTaskStatus(task.id);
                                    }}
                                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                                      isDone
                                        ? 'bg-primary-500 text-white shadow-2xs'
                                        : 'border-2 border-slate-300 hover:border-primary-500 bg-white'
                                    }`}
                                    title="Click to strike or unstrike this personal task"
                                  >
                                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>
                                ) : (
                                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                                    {isDone ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    ) : isRejected ? (
                                      <XCircle className="w-4 h-4 text-rose-500" />
                                    ) : (
                                      <Clock className="w-4 h-4 text-slate-300" />
                                    )}
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div
                                    className={`font-bold truncate text-[13px] transition-all ${
                                      isDone
                                        ? 'line-through text-slate-400 font-medium decoration-primary-500 decoration-2'
                                        : isRejected
                                        ? 'line-through text-slate-400 font-medium decoration-rose-400'
                                        : 'text-slate-900'
                                    }`}
                                  >
                                    {task.title}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium flex-wrap">
                                    {isAdminTask ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100/70 text-amber-900 border border-amber-300">
                                        👑 Admin Personal Task
                                      </span>
                                    ) : (
                                      <span className="text-slate-500">
                                        {task.type === 'admin' ? 'Staff Work Delegation' : `Staff: ${task.createdByName}`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Assigned Staff / Admin */}
                            <td className="py-2.5 px-3">
                              {isAdminTask ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                                    👑
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-slate-900 truncate block text-xs">
                                      {currentUser.name || 'Deepak (Admin)'}
                                    </span>
                                    <span className="text-[10px] text-primary-700 font-semibold">
                                      Admin (Myself)
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
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
                              )}
                            </td>

                            {/* Priority Badge */}
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${
                                  task.priority === 'High'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : task.priority === 'Medium'
                                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                <span>{task.priority}</span>
                              </span>
                            </td>

                            {/* Deadline */}
                            <td className="py-2.5 px-3">
                              <div className="inline-flex flex-col gap-0.5 items-start bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 whitespace-nowrap">
                                  <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                                  <span>{task.dueDate}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 whitespace-nowrap">
                                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>By {task.dueTime}</span>
                                </div>
                              </div>
                            </td>

                            {/* Status & Action */}
                            <td className="py-2.5 px-3 sm:px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isAdminTask ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => toggleTaskStatus(task.id)}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                                        isDone
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                          : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                      }`}
                                      title="Click to strike or unstrike this personal task"
                                    >
                                      {isDone ? (
                                        <>
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                          <span>✓ Done {task.completedAt ? `(${task.completedAt})` : ''}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                          <span>⏳ Admin Pending</span>
                                        </>
                                      )}
                                    </button>
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
                                  </>
                                ) : (
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
                                          ? `Completed by ${task.assignedToName} in their staff portal`
                                          : isRejected
                                          ? `Declined by ${task.assignedToName}`
                                          : `Awaiting execution by ${task.assignedToName}`
                                      }
                                    >
                                      {isDone ? (
                                        <>
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                          <span>✓ Done by {task.assignedToName.split(' ')[0]} {task.completedAt ? `(${task.completedAt})` : ''}</span>
                                        </>
                                      ) : isRejected ? (
                                        <>
                                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                          <span>❌ Declined by {task.assignedToName.split(' ')[0]}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                          <span>⏳ Pending with {task.assignedToName.split(' ')[0]}</span>
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
        </div>
      )}

      {/* =========================================================================
          VIEW 2: ADMIN PERSONAL DAILY TASKS (MY DAILY CHECKLIST & SCORE)
          ========================================================================= */}
      {(activeTab === 'admin' || activeTab === 'dual') && (
        <div className="space-y-4">
          {/* Informative Admin Personal Banner */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-primary-50/80 border border-primary-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                👑
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-primary-950 flex items-center gap-2">
                  <span>👑 Admin Personal Daily Agenda & Checklist</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 border border-primary-300">
                    Independent Score
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-primary-800 font-medium mt-0.5">
                  Tasks assigned to yourself. Click the checkbox or row to strike off completed items and increase your Admin Personal Daily Score.
                </div>
              </div>
            </div>

            <div className="text-xs font-bold text-primary-700 bg-white px-3 py-1.5 rounded-xl border border-primary-200 shrink-0 self-start sm:self-auto shadow-2xs">
              Personal Daily Score: <strong>{adminPersonalScore}%</strong> ({adminCompleted}/{adminTotal})
            </div>
          </div>

          {/* Quick-Add Personal Task Inline Form */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                <span>Quick Add Admin Daily Task (For Today: {todayStr})</span>
              </h4>
              {showQuickSuccess && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 animate-in fade-in">
                  ✓ Task added to your personal agenda!
                </span>
              )}
            </div>

            <form onSubmit={handleQuickAddAdminTask} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="What is your executive priority today, Admin? (e.g. Sign vendor contracts)"
                required
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-xs sm:text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 shadow-2xs"
              />

              <div className="flex items-center gap-2">
                <select
                  value={quickPriority}
                  onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white shadow-2xs cursor-pointer focus:outline-none focus:border-primary-500"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>

                <select
                  value={quickTime}
                  onChange={(e) => setQuickTime(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white shadow-2xs cursor-pointer focus:outline-none focus:border-primary-500"
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
                  className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Add to My Day</span>
                </button>
              </div>
            </form>
          </div>

          {/* Grid: Admin Tasks Checklist & Admin Score Analytics */}
          <div className={`grid grid-cols-1 ${activeTab === 'dual' ? 'xl:grid-cols-1' : 'xl:grid-cols-3'} gap-4 sm:gap-6 w-full`}>
            {/* Admin Checklist */}
            <div className={`${activeTab === 'dual' ? '' : 'xl:col-span-2'} bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden`}>
              <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                    <span>👑 Admin Personal Checklist</span>
                    <span className="text-xs font-semibold text-slate-500">
                      ({filteredAdminTasks.length} tasks)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Click any task checkbox or row to strike off completed items
                  </p>
                </div>

                <span className="text-xs font-bold text-primary-600 bg-primary-50 border border-primary-200 px-3 py-1 rounded-xl">
                  {adminCompleted} of {adminTotal} Finished
                </span>
              </div>

              {filteredAdminTasks.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Admin Personal Tasks Scheduled</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Use the quick-add bar above to assign your first daily goal for today ({todayStr}).
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
                        className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer select-none ${
                          isDone ? 'bg-slate-50/50 opacity-80' : ''
                        }`}
                        title="Click to strike or unstrike this personal task"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskStatus(task.id);
                            }}
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors duration-150 shrink-0 cursor-pointer ${
                              isDone
                                ? 'bg-primary-500 text-white shadow-2xs'
                                : 'border-2 border-slate-300 hover:border-primary-500'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div className="min-w-0">
                            <div
                              className={`text-sm font-bold transition-colors duration-150 ${
                                isDone
                                  ? 'line-through text-slate-400 font-medium decoration-primary-500 decoration-2'
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
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{task.dueDate}</span>
                              </span>
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
                                ? 'bg-primary-50 text-primary-600 border border-primary-200'
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
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-primary-50/50 via-white to-white rounded-2xl p-4 sm:p-5 border-2 border-primary-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700">
                      👑 Admin Personal Score
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 border border-primary-200">
                      {adminCompleted}/{adminTotal} items
                    </span>
                  </div>

                  <div className="text-3xl font-black font-['Outfit'] text-primary-950 tracking-tight">
                    {adminPersonalScore}%
                  </div>

                  <div className="w-full bg-primary-100 rounded-full h-2 mt-2.5 overflow-hidden p-0.5">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${adminPersonalScore}%` }}
                    />
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-primary-100 text-xs font-medium text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700 font-bold">Finished by Admin:</span>
                      <span className="font-bold text-slate-900">{adminCompleted} tasks</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold">Remaining Today:</span>
                      <span className="font-bold text-slate-900">{adminPending} tasks</span>
                    </div>
                  </div>

                  <div className="mt-3.5 p-2.5 rounded-xl bg-white border border-primary-200 text-xs text-primary-950 font-medium">
                    {adminPersonalScore === 100 ? (
                      <span className="text-emerald-800 font-bold">🎉 Outstanding! All personal daily targets completed!</span>
                    ) : adminPersonalScore >= 50 ? (
                      <span className="text-primary-800 font-semibold">🚀 Solid executive pace! Keep up the daily momentum.</span>
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
