import React, { useState, useEffect, useRef } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Check,
  CheckSquare,
  Clock,
  Calendar,
  Plus,
  Minus,
  X,
  GripHorizontal,
  Sparkles,
  Zap,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const FloatingTaskWidget: React.FC = () => {
  const {
    currentUser,
    tasks,
    toggleTaskStatus,
    createStaffTask,
    assignAdminTask,
    users,
    setCurrentPage,
    orgSettings,
  } = useTaskToggle();

  // Widget visibility & collapse states
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [filter, setFilter] = useState<'pending' | 'done' | 'all'>('pending');

  // Drag position state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Set default initial position on mount (bottom-right above navigation)
  useEffect(() => {
    const initX = Math.max(16, window.innerWidth - (window.innerWidth < 640 ? 340 : 390));
    const initY = Math.max(70, window.innerHeight - (window.innerWidth < 640 ? 460 : 520));
    setPosition({ x: initX, y: initY });

    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        const width = window.innerWidth < 640 ? 320 : 370;
        const height = 450;
        return {
          x: Math.min(Math.max(10, prev.x), window.innerWidth - width - 10),
          y: Math.min(Math.max(10, prev.y), window.innerHeight - height - 10),
        };
      });
    };

    window.addEventListener('resize', handleResize);

    const handleToggleCustom = () => {
      setIsVisible(true);
      setIsMinimized(false);
    };
    window.addEventListener('toggle-floating-widget', handleToggleCustom);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('toggle-floating-widget', handleToggleCustom);
    };
  }, []);

  // Mouse & Touch Drag Handlers
  const startDrag = (clientX: number, clientY: number) => {
    if (!position) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from handle / header
    startDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      const widgetWidth = isMinimized ? 220 : window.innerWidth < 640 ? 320 : 370;
      const widgetHeight = isMinimized ? 50 : 450;

      const newX = Math.min(Math.max(10, dragStartRef.current.startX + dx), window.innerWidth - widgetWidth - 10);
      const newY = Math.min(Math.max(10, dragStartRef.current.startY + dy), window.innerHeight - widgetHeight - 10);

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !dragStartRef.current || e.touches.length !== 1) return;
      e.preventDefault(); // Prevent scrolling while dragging widget
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.mouseX;
      const dy = touch.clientY - dragStartRef.current.mouseY;

      const widgetWidth = isMinimized ? 220 : window.innerWidth < 640 ? 320 : 370;
      const widgetHeight = isMinimized ? 50 : 450;

      const newX = Math.min(Math.max(10, dragStartRef.current.startX + dx), window.innerWidth - widgetWidth - 10);
      const newY = Math.min(Math.max(10, dragStartRef.current.startY + dy), window.innerHeight - widgetHeight - 10);

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isMinimized]);

  // Tasks relevant to current user
  const relevantTasks = tasks.filter((t) => {
    if (currentUser.role === 'admin') return true;
    return t.assignedTo === currentUser.id;
  });

  const pendingTasks = relevantTasks.filter((t) => t.status !== 'done');
  const completedTasks = relevantTasks.filter((t) => t.status === 'done');

  const displayedTasks =
    filter === 'pending'
      ? pendingTasks
      : filter === 'done'
      ? completedTasks
      : relevantTasks;

  // Fast Quick Add task handler
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const TODAY_STR = '24 Oct 2026';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (currentUser.role === 'admin') {
      // Admin quick creates for first staff member or all
      const staffList = users.filter((u) => u.role === 'staff');
      const targetStaffId = staffList.length > 0 ? staffList[0].id : currentUser.id;
      assignAdminTask({
        title: quickTitle,
        description: 'Created quickly via TaskToggle Mini Popup',
        staffIds: [targetStaffId],
        dueDate: TODAY_STR,
        dueTime: timeStr,
        priority: 'Medium',
      });
    } else {
      // Staff creates personal to-do directly
      createStaffTask({
        title: quickTitle,
        details: 'Quick task added via Mini Popup',
        createForUserId: currentUser.id,
        dueDate: TODAY_STR,
        dueTime: timeStr,
      });
    }

    setQuickTitle('');
  };

  if (!isVisible) {
    // If closed, return a floating launcher pill at bottom-right so user can re-open anytime
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-50 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-xl shadow-indigo-300/60 flex items-center gap-2 text-xs font-black cursor-pointer hover:scale-105 active:scale-95 transition-all border-2 border-white/80"
        title="Open TaskToggle Draggable Mini Popup"
      >
        <Zap className="w-4 h-4 text-cyan-300 fill-cyan-300" />
        <span>Quick Tasks ({pendingTasks.length})</span>
      </button>
    );
  }

  if (!position) return null;

  return (
    <div
      ref={widgetRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={`fixed z-50 select-none transition-shadow ${
        isDragging ? 'cursor-grabbing opacity-95 scale-[1.01]' : ''
      }`}
    >
      {/* 1. Minimized State: Sleek Draggable Floating Capsule */}
      {isMinimized ? (
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="bg-white/95 backdrop-blur-xl border border-indigo-200/90 shadow-2xl rounded-2xl p-2.5 flex items-center gap-3 cursor-grab hover:shadow-indigo-300/50 transition-all border-l-4 border-l-cyan-500 ring-2 ring-indigo-500/10"
        >
          <div className="flex items-center gap-1.5 text-slate-400 pl-0.5">
            <GripHorizontal className="w-4 h-4" />
          </div>

          <div
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-xs">
              <CheckSquare className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-slate-900 leading-tight flex items-center gap-1.5">
                <span>TaskToggle</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              </div>
              <div className="text-[10px] text-indigo-700 font-extrabold">
                {pendingTasks.length} Pending · Tap to Expand
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-1">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="w-7 h-7 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center transition-all cursor-pointer"
              title="Expand popup"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="w-7 h-7 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              title="Close popup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* 2. Expanded State: Full Draggable Fast Mini Popup */
        <div className="w-[320px] sm:w-[370px] bg-white/95 backdrop-blur-xl border border-indigo-200/90 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[490px] ring-4 ring-indigo-500/10 animate-in zoom-in-95 duration-150">
          {/* Draggable Header */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-white/10"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-cyan-200 shrink-0" />
              <div className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-black tracking-tight font-['Outfit']">TaskToggle Mini</span>
                <span className="text-[9px] font-black px-1.5 py-0.2 bg-white/20 rounded-md">
                  {orgSettings.orgName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-cyan-100/90 font-bold mr-1 hidden xs:inline">
                ⠿ Drag anywhere
              </span>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition-all"
                title="Minimize popup"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                className="w-6 h-6 rounded-lg bg-white/15 hover:bg-rose-500 flex items-center justify-center text-white cursor-pointer transition-all"
                title="Hide popup"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Super Fast Task Creator ("Fast for me") */}
          <form
            onSubmit={handleQuickAdd}
            className="p-3 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-cyan-50/30 border-b border-indigo-100/80 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="⚡ Fast task... press Enter to add"
                className="w-full pl-3 pr-2 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white text-xs font-black shadow-xs flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 transition-all"
              title="Add task immediately"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add</span>
            </button>
          </form>

          {/* Filter Pills & Fast Guidance */}
          <div className="px-3 pt-2 pb-1.5 flex items-center justify-between border-b border-slate-100 bg-white">
            <div className="flex items-center gap-1">
              {(['pending', 'done', 'all'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black capitalize transition-all cursor-pointer ${
                    filter === tab
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'pending'
                    ? `Pending (${pendingTasks.length})`
                    : tab === 'done'
                    ? `Done (${completedTasks.length})`
                    : `All (${relevantTasks.length})`}
                </button>
              ))}
            </div>

            <span className="text-[10px] text-slate-400 font-bold italic">
              Tap task to strike
            </span>
          </div>

          {/* Scrollable Tasks List with Click-to-Strike anywhere */}
          <div className="overflow-y-auto p-3 space-y-2 flex-1 max-h-[250px] divide-y divide-slate-50">
            {displayedTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-bold italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                {filter === 'pending' ? 'No pending tasks!' : 'No tasks in this tab'}
              </div>
            ) : (
              displayedTasks.map((task) => {
                const isDone = task.status === 'done';

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-2.5 group ${
                      isDone
                        ? 'bg-slate-50/80 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 hover:shadow-xs active:scale-[0.98]'
                    }`}
                    title="Click anywhere to strike & toggle completed"
                  >
                    {/* Checkbox button */}
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-2xs'
                          : 'border-2 border-slate-300 group-hover:border-indigo-600'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {/* Task Title & Details */}
                    <div className="min-w-0 flex-1 text-left">
                      <div
                        className={`text-xs font-extrabold leading-snug truncate transition-all ${
                          isDone
                            ? 'line-through text-slate-400 decoration-emerald-500 decoration-2'
                            : 'text-slate-900 group-hover:text-indigo-950'
                        }`}
                      >
                        {task.title}
                      </div>

                      {/* Prominent Target Deadline (Date & Time) */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold mt-1">
                        <span className="inline-flex items-center gap-1 text-indigo-900 bg-indigo-50/80 px-1.5 py-0.2 rounded border border-indigo-100">
                          <Calendar className="w-2.5 h-2.5 text-indigo-600" />
                          <span>{task.dueDate}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-cyan-800 bg-cyan-50/80 px-1.5 py-0.2 rounded border border-cyan-100">
                          <Clock className="w-2.5 h-2.5 text-cyan-600" />
                          <span>{task.dueTime}</span>
                        </span>

                        {isDone && task.completedAt && (
                          <span className="text-emerald-700 text-[9px] font-black ml-auto">
                            Done {task.completedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Footer Navigation */}
          <div className="p-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>
              {completedTasks.length}/{relevantTasks.length} Finished
            </span>
            <button
              type="button"
              onClick={() => {
                if (currentUser.role === 'admin') {
                  setCurrentPage('monitor');
                } else {
                  setCurrentPage('mytodo');
                }
              }}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-black"
            >
              <span>Open Full Page</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
