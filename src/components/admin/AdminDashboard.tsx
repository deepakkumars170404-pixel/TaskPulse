import React, { useState, useMemo } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Calendar,
  Crown,
  Users,
  Clock,
  ArrowUpRight,
  Zap,
  TrendingUp,
  Filter,
  CheckCircle2,
  MoreHorizontal,
  ChevronDown,
  Layers,
  Plus,
  Radio,
  FileText,
  UserPlus,
  BarChart3,
  CalendarDays,
  ShieldCheck,
  Check,
  Trash2,
} from 'lucide-react';
import { Task, TaskPriority } from '../../types';
import {
  AssignTaskModal,
  StaffDirectoryModal,
  ReportsModal,
} from './ExecutiveModals';

interface AdminDashboardProps {
  searchQuery?: string;
  onOpenAssignModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  searchQuery = '',
  onOpenAssignModal,
}) => {
  const {
    tasks,
    users,
    currentUser,
    setCurrentPage,
    eventTiming,
    orgSettings,
    toggleTaskStatus,
    deleteTask,
    assignAdminPersonalTask,
  } = useTaskToggle();

  // Active Main Tab: 'staff' (Staff Target Tasks) | 'admin' (Admin Personal Tasks) | 'dual' (Dual Split View)
  const [activeTab, setActiveTab] = useState<'staff' | 'admin' | 'dual'>('staff');

  // Selected Date Filter: 'today' | 'upcoming' | 'previous' | 'all'
  const [dateFilter, setDateFilter] = useState<'today' | 'upcoming' | 'previous' | 'all'>('today');

  // Priority filter for table
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Active action menu row ID
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  // Quick Add for Admin Personal Task
  const [quickPersonalTitle, setQuickPersonalTitle] = useState('');
  const [quickPersonalTime, setQuickPersonalTime] = useState('5:00 PM');
  const [quickPersonalPriority, setQuickPersonalPriority] = useState<TaskPriority>('Medium');

  // Dynamically formatted today's date (e.g. "28 Oct 2026") - never hardcoded
  const TODAY_STR = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day} ${month} ${year}`;
  }, []);

  // 1. Separate Tasks: Admin Personal Daily Tasks vs Staff Target Deliverables
  const adminOwnTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.assignedTo === currentUser.id || (t.type === 'self' && t.createdBy === currentUser.id)
    );
  }, [tasks, currentUser.id]);

  const staffTargetTasks = useMemo(() => {
    return tasks.filter((t) => t.assignedTo !== currentUser.id);
  }, [tasks, currentUser.id]);

  // 2. Filter by Date (Accurate Date comparison)
  const filterByDate = (taskList: Task[]) => {
    const todayDate = new Date(TODAY_STR);
    todayDate.setHours(0, 0, 0, 0);

    return taskList.filter((t) => {
      if (!t.dueDate) return dateFilter === 'today' || dateFilter === 'all';
      if (t.dueDate === TODAY_STR) return dateFilter === 'today' || dateFilter === 'all';

      const taskDate = new Date(t.dueDate);
      if (isNaN(taskDate.getTime())) return dateFilter === 'all';
      taskDate.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        return taskDate.getTime() === todayDate.getTime();
      }
      if (dateFilter === 'upcoming') {
        return taskDate.getTime() > todayDate.getTime();
      }
      if (dateFilter === 'previous') {
        return taskDate.getTime() < todayDate.getTime();
      }
      return true;
    });
  };

  const filteredAdminTasks = filterByDate(adminOwnTasks);
  const filteredStaffTasks = filterByDate(staffTargetTasks);

  // Search & Priority Filter on Staff Tasks
  const displayedStaffTasks = useMemo(() => {
    return filteredStaffTasks.filter((t) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.createdByName && t.createdByName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = priorityFilter === 'all' || t.priority.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesPriority;
    });
  }, [filteredStaffTasks, searchQuery, priorityFilter]);

  // KPI Calculations
  const adminTotal = filteredAdminTasks.length;
  const adminCompleted = filteredAdminTasks.filter((t) => t.status === 'done').length;
  const adminPending = adminTotal - adminCompleted;
  const adminPersonalScore = adminTotal > 0 ? Math.round((adminCompleted / adminTotal) * 100) : 0;

  const staffTotal = filteredStaffTasks.length;
  const staffCompleted = filteredStaffTasks.filter((t) => t.status === 'done').length;
  const staffPending = filteredStaffTasks.filter((t) => t.status !== 'done' && t.status !== 'rejected').length;
  const staffTeamRate = staffTotal > 0 ? Math.round((staffCompleted / staffTotal) * 100) : 100;
  const staffCount = users.filter((u) => u.role === 'staff').length;

  const handleCreatePersonalTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPersonalTitle.trim()) return;
    assignAdminPersonalTask({
      title: quickPersonalTitle.trim(),
      dueDate: TODAY_STR,
      dueTime: quickPersonalTime,
      priority: quickPersonalPriority,
    });
    setQuickPersonalTitle('');
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 text-slate-800 font-jakarta select-none">
      {/* =========================================================================
          2. HEADER TITLE SECTION (Sleek, Proportional, Executive)
          ========================================================================= */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold text-slate-400 tracking-[0.08em] uppercase">
          EXECUTIVE DASHBOARD
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Executive Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold border border-indigo-100">
              <span>👑</span>
              <span>{orgSettings.orgName} Workspace</span>
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-[13px] text-slate-500 font-normal">
          Dedicated separation: Admin personal daily tasks vs. staff team target deliverables
        </p>
      </div>

      {/* =========================================================================
          3. DATE TAB BAR (Compact, Clean SaaS)
          ========================================================================= */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] shrink-0 ml-0.5">
            <Calendar className="w-3.5 h-3.5 stroke-[2]" />
          </div>

          {[
            { id: 'today', label: `Today (${TODAY_STR})` },
            { id: 'upcoming', label: 'Upcoming Deadlines' },
            { id: 'previous', label: 'Previous Records' },
            { id: 'all', label: 'All Tasks Directory' },
          ].map((tab) => {
            const isActive = dateFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDateFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'btn-primary-gradient text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right timeline indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 text-xs text-slate-500 font-medium shrink-0 bg-slate-50 md:bg-transparent rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Active Timeline:{' '}
            <strong className="text-slate-900 font-semibold">{filteredAdminTasks.length} Admin</strong> •{' '}
            <strong className="text-slate-900 font-semibold">{filteredStaffTasks.length} Staff</strong>
          </span>
        </div>
      </div>

      {/* =========================================================================
          4. FOUR KPI CARDS (Well-Proportioned Numbers & Spacing)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Admin Personal Score */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-7.5 h-7.5 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#F59E0B]">
                <Crown className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold uppercase tracking-wider">
                AD
              </span>
            </div>

            <div className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ADMIN PERSONAL SCORE
            </div>

            <div className="mt-1.5 flex items-baseline justify-between">
              <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">
                {adminPersonalScore}%
              </div>
              <span className="text-xs font-semibold text-[#4F46E5]">
                {adminCompleted}/{adminTotal} Finished
              </span>
            </div>

            {/* Light indigo progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-[#4F46E5] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${adminPersonalScore}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Admin Checklist</span>
            <span className="font-semibold text-slate-800">{adminPending} Pending</span>
          </div>
        </div>

        {/* KPI 2: Staff Team Delivery (Soft Green Tint) */}
        <div className="bg-white rounded-xl border border-emerald-200/90 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between bg-gradient-to-b from-emerald-50/20 to-white">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-7.5 h-7.5 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                Auto-Synced
              </span>
            </div>

            <div className="mt-3 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              STAFF TEAM DELIVERY
            </div>

            <div className="mt-1.5 flex items-baseline justify-between">
              <div className="text-2xl sm:text-[26px] font-extrabold text-emerald-600 leading-none tracking-tight">
                {staffTeamRate}%
              </div>
              <span className="text-xs font-semibold text-emerald-600">
                {staffCompleted}/{staffTotal} Delivered
              </span>
            </div>

            {/* Full green progress bar */}
            <div className="w-full bg-emerald-50 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${staffTeamRate}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Struck automatically by staff</span>
            <span className="font-semibold text-emerald-700">{staffPending} In Progress</span>
          </div>
        </div>

        {/* KPI 3: Pending Staff Queue */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-7.5 h-7.5 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50 transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              PENDING STAFF QUEUE
            </div>

            <div className="mt-1.5 text-2xl sm:text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">
              {staffPending}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            Tasks currently being executed by staff
          </div>
        </div>

        {/* KPI 4: Active Team Roster */}
        <div
          onClick={() => setIsDirectoryModalOpen(true)}
          className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-7.5 h-7.5 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
                <Users className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#4F46E5] group-hover:bg-[#EEF2FF] transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ACTIVE TEAM ROSTER
            </div>

            <div className="mt-1.5 text-2xl sm:text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">
              {staffCount}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Operating under Deepak</span>
            <span className="text-[#4F46E5] font-semibold text-[10px] group-hover:underline">View roster</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. VIEW TOGGLE TABS (Modern Segmented Pill Bar)
          ========================================================================= */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/90 border border-slate-200/60 rounded-xl w-fit shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'staff'
              ? 'bg-white text-[#4F46E5] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>Staff Target Tasks</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'staff' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-slate-200/70 text-slate-600'
            }`}
          >
            {filteredStaffTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'admin'
              ? 'bg-white text-[#4F46E5] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span>Admin Personal Daily Tasks</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'admin' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-slate-200/70 text-slate-600'
            }`}
          >
            {filteredAdminTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dual')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'dual'
              ? 'bg-white text-[#4F46E5] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>Dual Split View</span>
        </button>
      </div>

      {/* =========================================================================
          6. SYNC BANNER (Subtle, High-End SaaS Card)
          ========================================================================= */}
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3 sm:p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Zap className="w-4 h-4 fill-white stroke-[2]" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-[13px] font-bold text-slate-900">
                Real-Time Staff Execution Sync Active
              </h2>
              <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Auto-Calculated
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal max-w-xl">
              All target progress metrics update instantly as staff complete tasks across web and mobile apps. No
              manual refresh required.
            </p>
          </div>
        </div>

        {/* Right mini card */}
        <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Staff Delivery Rate
            </div>
            <div className="text-xs font-bold text-emerald-700">
              {staffTeamRate}% ({staffCompleted}/{staffTotal})
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          7. MAIN GRID (2/3 + 1/3)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* LEFT COLUMN (2/3): Staff Target Tasks (or Admin / Dual View) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Card: Staff Target Tasks Table */}
          {(activeTab === 'staff' || activeTab === 'dual') && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3.5">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Staff Target Tasks
                    </h2>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.2 rounded-full">
                      {filteredStaffTasks.length} tasks scheduled
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live feed of tasks allotted to staff members (auto-syncs when marked complete by staff)
                  </p>
                </div>

                {/* Filter Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Filter className="w-3 h-3 text-slate-500" />
                    <span>Filter</span>
                    {priorityFilter !== 'all' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                    )}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Filter Dropdown */}
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-1 animate-in fade-in duration-100">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                        Filter by Priority
                      </div>
                      {['all', 'High', 'Medium', 'Low'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setPriorityFilter(p);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs rounded-md transition-colors cursor-pointer capitalize ${
                            priorityFilter.toLowerCase() === p.toLowerCase()
                              ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {p === 'all' ? 'All Priorities' : `${p} Priority`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[620px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2 px-2.5 w-8 text-center">#</th>
                      <th className="py-2 px-2.5">TASK DETAILS</th>
                      <th className="py-2 px-2.5">ALLOTTED STAFF</th>
                      <th className="py-2 px-2.5">PRIORITY</th>
                      <th className="py-2 px-2.5">DEADLINE</th>
                      <th className="py-2 px-2.5 text-center">
                        <span className="inline-flex items-center gap-1">
                          <span>STATUS</span>
                          <span className="text-[9px] font-normal text-slate-400 lowercase tracking-normal">
                            (auto-sync)
                          </span>
                        </span>
                      </th>
                      <th className="py-2 px-2.5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 text-xs">
                    {displayedStaffTasks.map((task, index) => {
                      const isCompleted = task.status === 'done';
                      const isStaffCreator = task.type === 'staff';

                      return (
                        <tr
                          key={task.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* # */}
                          <td className="py-2.5 px-2.5 text-center text-[11px] font-semibold text-slate-400">
                            {index + 1}
                          </td>

                          {/* TASK DETAILS */}
                          <td className="py-2.5 px-2.5 max-w-[260px]">
                            <div className="font-semibold text-slate-900 leading-snug truncate">
                              {task.title}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              {isStaffCreator ? (
                                <span>Staff: {task.createdByName}</span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[#4F46E5] font-medium">
                                  <ShieldCheck className="w-2.5 h-2.5 text-[#4F46E5]" />
                                  <span>Admin Allotted</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* ALLOTTED STAFF */}
                          <td className="py-2.5 px-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5.5 h-5.5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[9px] font-bold uppercase shadow-2xs">
                                {task.assignedToName?.slice(0, 1) || 'S'}
                              </div>
                              <span className="font-medium text-slate-800 capitalize">
                                {task.assignedToName}
                              </span>
                            </div>
                          </td>

                          {/* PRIORITY */}
                          <td className="py-2.5 px-2.5 whitespace-nowrap">
                            {task.priority === 'High' ? (
                              <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                                High
                              </span>
                            ) : task.priority === 'Medium' ? (
                              <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100">
                                Medium
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                Low
                              </span>
                            )}
                          </td>

                          {/* DEADLINE */}
                          <td className="py-2.5 px-2.5 whitespace-nowrap text-[11px] text-slate-500">
                            <div className="font-medium text-slate-800">
                              {task.dueDate || TODAY_STR}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              By {task.dueTime || '5:00 PM'}
                            </div>
                          </td>

                          {/* STATUS (Live Auto-Sync from Staff Execution) */}
                          <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                            {isCompleted ? (
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 select-none shadow-2xs"
                                title={`Completed by staff${task.completedAt ? ` at ${task.completedAt}` : ''}`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.4]" />
                                <span>Completed</span>
                                {task.completedAt && (
                                  <span className="text-[10px] text-emerald-600/80 font-normal">
                                    • {task.completedAt}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 select-none"
                                title="Awaiting staff completion. Auto-syncs live when completed by staff."
                              >
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                                <span>In Progress</span>
                              </span>
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td className="py-2.5 px-2.5 text-right whitespace-nowrap relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveActionMenuId(activeActionMenuId === task.id ? null : task.id)
                              }
                              className="w-7 h-7 rounded-md border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-400 hover:text-slate-700 inline-flex items-center justify-center transition-all cursor-pointer"
                              title="Task actions"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5 stroke-[2]" />
                            </button>

                            {/* Actions Dropdown */}
                            {activeActionMenuId === task.id && (
                              <div className="absolute right-2.5 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1 text-left animate-in fade-in duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleTaskStatus(task.id);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md flex items-center gap-1.5 cursor-pointer"
                                  title="Admin override to mark task manually"
                                >
                                  <Check className="w-3 h-3 text-slate-400" />
                                  <span>Admin Override: Mark {isCompleted ? 'Pending' : 'Completed'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteTask(task.id);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md flex items-center gap-1.5 cursor-pointer font-medium"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete Task</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {displayedStaffTasks.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                          No tasks found matching current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Personal Daily Tasks View */}
          {(activeTab === 'admin' || activeTab === 'dual') && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Admin Personal Daily Tasks
                    </h2>
                    <span className="text-[11px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.2 rounded-full">
                      {filteredAdminTasks.length} items
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Strictly personal checklist for Deepak — isolated from staff deliverables
                  </p>
                </div>
              </div>

              {/* Quick Add Input for Admin Personal Task */}
              <form onSubmit={handleCreatePersonalTask} className="flex gap-2">
                <input
                  type="text"
                  value={quickPersonalTitle}
                  onChange={(e) => setQuickPersonalTitle(e.target.value)}
                  placeholder="Add a new personal daily task for Deepak..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200/80 focus:border-[#4F46E5] bg-slate-50 focus:bg-white text-xs outline-none transition-all text-slate-800"
                />
                <button
                  type="submit"
                  className="btn-primary-gradient px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add</span>
                </button>
              </form>

              {/* Admin Tasks List */}
              <div className="divide-y divide-slate-100">
                {filteredAdminTasks.map((task) => {
                  const isDone = task.status === 'done';
                  return (
                    <div
                      key={task.id}
                      className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`w-4.5 h-4.5 rounded flex items-center justify-center cursor-pointer transition-colors ${
                            isDone
                              ? 'bg-[#4F46E5] text-white'
                              : 'border-2 border-slate-300 hover:border-[#4F46E5]'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <span
                          className={`text-xs font-medium ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">{task.dueTime}</span>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredAdminTasks.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No personal admin tasks scheduled for today. Use the input above to add items.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (1/3): Staff Delivery Rate Card & Special Event Schedule */}
        <div className="space-y-4">
          {/* Card 1: Staff Delivery Rate */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900">
                Staff Delivery Rate
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
                <span>This Week</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-0.5">
              <div className="text-2xl sm:text-[26px] font-extrabold text-emerald-600 leading-none tracking-tight">
                {staffTeamRate}%
              </div>
              <div className="text-right text-[11px]">
                <span className="font-semibold text-emerald-600">Delivered: {staffCompleted}</span>
                <span className="text-slate-300 mx-1">•</span>
                <span className="font-medium text-slate-500">Pending: {staffPending}</span>
              </div>
            </div>

            {/* Green progress bar */}
            <div className="w-full bg-emerald-50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${staffTeamRate}%` }}
              />
            </div>

            {/* Dynamic Staff Delivery Mini Digest */}
            <div className="pt-1.5 space-y-1.5 text-xs">
              {users.filter(u => u.role === 'staff').slice(0, 3).map((staff) => {
                const staffTasks = filteredStaffTasks.filter(t => t.assignedTo === staff.id);
                const completed = staffTasks.filter(t => t.status === 'done').length;
                const total = staffTasks.length;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 100;
                return (
                  <div key={staff.id} className="flex items-center justify-between text-slate-600">
                    <span className="capitalize">{staff.name}</span>
                    <span className={`font-bold ${percent === 100 ? 'text-emerald-600' : 'text-[#4F46E5]'}`}>
                      {completed}/{total} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Special Event Schedule */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900">
                Special Event Schedule
              </h3>
              <button
                type="button"
                onClick={() => setCurrentPage('timing')}
                className="text-[11px] font-semibold text-[#4F46E5] hover:text-[#4338CA] cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs sm:text-[13px] font-bold text-slate-900">
                {eventTiming?.eventName || 'No Special Event Scheduled'}
              </h4>

              {/* Date Box */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-800 font-semibold">
                <CalendarDays className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                <span>
                  {eventTiming ? `${eventTiming.date} • ${eventTiming.newTiming}` : 'Regular organization hours apply'}
                </span>
              </div>

              {/* Staff Allotted with Overlapping Avatars */}
              <div className="pt-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Staff Allotted:
                </div>
                <div className="flex items-center -space-x-1.5 overflow-hidden py-0.5">
                  {users.filter(u => u.role === 'staff').map((staff) => (
                    <div
                      key={staff.id}
                      className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-white bg-[#4F46E5] text-white text-[10px] font-bold flex items-center justify-center shadow-2xs capitalize"
                      title={staff.name}
                    >
                      {staff.initials || staff.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          8. BOTTOM ROW: Recent Activity & Quick Actions
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 pt-1">
        {/* Recent Activity Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
                <Radio className="w-3 h-3 stroke-[2] animate-pulse" />
              </div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900">
                Recent Activity
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage('monitor')}
              className="text-[11px] font-semibold text-[#4F46E5] hover:text-[#4338CA] cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 pt-0.5">
            {tasks.filter((t) => t.status === 'done').slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-800 font-medium leading-snug">
                    <strong>{t.assignedToName || 'Staff'}</strong> completed{' '}
                    <span className="text-[#4F46E5]">{t.title}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t.dueDate || '28 Oct 2026'}{t.completedAt ? `, ${t.completedAt}` : ` · ${t.dueTime || 'Delivered'}`}
                  </p>
                </div>
              </div>
            ))}
            {tasks.filter((t) => t.status === 'done').length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Card with 4 tinted square buttons */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-[#FFFBEB] flex items-center justify-center text-[#D97706]">
                <Zap className="w-3 h-3 fill-[#D97706] stroke-[1.8]" />
              </div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900">
                Quick Actions
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            {/* Button 1: Indigo (people) */}
            <button
              type="button"
              onClick={() => {
                if (onOpenAssignModal) {
                  onOpenAssignModal();
                } else {
                  setIsAssignModalOpen(true);
                }
              }}
              className="p-3 rounded-xl bg-[#EEF2FF] hover:bg-indigo-100/60 border border-indigo-100 transition-all text-left flex items-start gap-2.5 group cursor-pointer active:scale-98"
            >
              <div className="w-7 h-7 rounded-lg bg-white text-[#4F46E5] flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                <UserPlus className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-[#4F46E5] transition-colors truncate">
                  Assign Task
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Delegate to staff
                </div>
              </div>
            </button>

            {/* Button 2: Orange (document) */}
            <button
              type="button"
              onClick={() => setIsReportsModalOpen(true)}
              className="p-3 rounded-xl bg-[#FFFBEB] hover:bg-amber-100/60 border border-amber-100 transition-all text-left flex items-start gap-2.5 group cursor-pointer active:scale-98"
            >
              <div className="w-7 h-7 rounded-lg bg-white text-[#D97706] flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                <FileText className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-[#D97706] transition-colors truncate">
                  Export Report
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  PDF & Excel
                </div>
              </div>
            </button>

            {/* Button 3: Indigo (calendar) */}
            <button
              type="button"
              onClick={() => setCurrentPage('timing')}
              className="p-3 rounded-xl bg-[#EEF2FF] hover:bg-indigo-100/60 border border-indigo-100 transition-all text-left flex items-start gap-2.5 group cursor-pointer active:scale-98"
            >
              <div className="w-7 h-7 rounded-lg bg-white text-[#4F46E5] flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                <Clock className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-[#4F46E5] transition-colors truncate">
                  Shift Timings
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Office & event hours
                </div>
              </div>
            </button>

            {/* Button 4: Green (chart) */}
            <button
              type="button"
              onClick={() => setCurrentPage('monitor')}
              className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/60 border border-emerald-100 transition-all text-left flex items-start gap-2.5 group cursor-pointer active:scale-98"
            >
              <div className="w-7 h-7 rounded-lg bg-white text-emerald-600 flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                <BarChart3 className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                  Audit Execution
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Efficiency monitor
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Modals */}
      <AssignTaskModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} />
      <StaffDirectoryModal isOpen={isDirectoryModalOpen} onClose={() => setIsDirectoryModalOpen(false)} />
      <ReportsModal isOpen={isReportsModalOpen} onClose={() => setIsReportsModalOpen(false)} />
    </div>
  );
};
