import React, { useState, useEffect, useRef } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Check,
  CheckSquare,
  Clock,
  Calendar,
  Plus,
  X,
  GripHorizontal,
  ExternalLink,
  Minimize2,
  Mic,
  MicOff,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const ElectronFloatingBubble: React.FC = () => {
  const {
    currentUser,
    tasks,
    toggleTaskStatus,
    completeAllTasks,
    snoozeTask,
    createStaffTask,
    assignAdminTask,
    users,
    orgSettings,
  } = useTaskToggle();

  const [mode, setMode] = useState<'logo' | 'expanded'>('logo');
  const [quickTitle, setQuickTitle] = useState('');
  const [filter, setFilter] = useState<'pending' | 'done' | 'all'>('pending');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Dragging state using HTML5 Pointer Capture (smoothly moves OS window anywhere across all monitors)
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  // Switch between compact 72x72 bubble and 380x560 expanded window
  const handleSetMode = (nextMode: 'logo' | 'expanded') => {
    setMode(nextMode);
    if (window.electronAPI?.isElectron) {
      window.electronAPI.resizeFloating(nextMode);
    }
  };

  // Listen for global desktop hotkey (Ctrl+Alt+T) from Electron
  useEffect(() => {
    if (window.electronAPI?.onToggleFloating) {
      const unsub = window.electronAPI.onToggleFloating(() => {
        setMode((prev) => {
          const next = prev === 'logo' ? 'expanded' : 'logo';
          window.electronAPI?.resizeFloating(next);
          return next;
        });
      });
      return () => unsub?.();
    }
  }, []);

  // Web Speech API initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setQuickTitle((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleSpeechRecognition = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!recognitionRef.current) {
      alert('Speech-to-text is not supported or permission denied in this environment.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // =========================================================================
  // UNIVERSAL POINTER DRAG HANDLERS: Move Window to ANY place on ANY screen
  // =========================================================================
  const handleBubblePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only left-click
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    dragRef.current = {
      startX: e.screenX,
      startY: e.screenY,
      moved: false,
    };
    setIsDragging(true);
  };

  const handleBubblePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.screenX - dragRef.current.startX;
    const dy = e.screenY - dragRef.current.startY;

    // Movement threshold to distinguish tap from drag
    if (!dragRef.current.moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
      dragRef.current.moved = true;
    }

    if (dragRef.current.moved) {
      if (window.electronAPI?.moveFloatingBy) {
        window.electronAPI.moveFloatingBy(dx, dy);
      }
      dragRef.current.startX = e.screenX;
      dragRef.current.startY = e.screenY;
    }
  };

  const handleBubblePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const moved = dragRef.current.moved;
    dragRef.current = null;
    setIsDragging(false);

    // If tapped without dragging -> expand to full task details!
    if (!moved) {
      handleSetMode('expanded');
    }
  };

  // Drag handler for expanded card's header bar
  const handleHeaderPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    // Do not initiate drag if user clicked a control button in header
    if ((e.target as HTMLElement).closest('button')) return;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    dragRef.current = {
      startX: e.screenX,
      startY: e.screenY,
      moved: false,
    };
    setIsDragging(true);
  };

  const handleHeaderPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.screenX - dragRef.current.startX;
    const dy = e.screenY - dragRef.current.startY;

    if (!dragRef.current.moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
      dragRef.current.moved = true;
    }

    if (dragRef.current.moved) {
      if (window.electronAPI?.moveFloatingBy) {
        window.electronAPI.moveFloatingBy(dx, dy);
      }
      dragRef.current.startX = e.screenX;
      dragRef.current.startY = e.screenY;
    }
  };

  const handleHeaderPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    dragRef.current = null;
    setIsDragging(false);
  };

  // Filter tasks based on current user and selected tab
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

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const TODAY_STR = '24 Oct 2026';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (currentUser.role === 'admin') {
      const staffList = users.filter((u) => u.role === 'staff');
      const targetStaffId = staffList.length > 0 ? staffList[0].id : currentUser.id;
      assignAdminTask({
        title: quickTitle,
        description: 'Created quickly via TaskToggle Desktop Bubble',
        staffIds: [targetStaffId],
        dueDate: TODAY_STR,
        dueTime: timeStr,
        priority: 'Medium',
      });
    } else {
      createStaffTask({
        title: quickTitle,
        details: 'Quick task added via Desktop Bubble',
        createForUserId: currentUser.id,
        dueDate: TODAY_STR,
        dueTime: timeStr,
      });
    }

    setQuickTitle('');
  };

  const quickTemplates = [
    { label: '📞 Client Call', title: 'Client Follow-up Call' },
    { label: '📧 Daily Report', title: 'Submit Daily Activity Report' },
    { label: '📦 Stock Audit', title: 'Physical Stock & Inventory Audit' },
    { label: '💳 Payment Check', title: 'Vendor Payment Status Verification' },
  ];

  return (
    <div className="w-full h-full flex items-start justify-start select-none bg-transparent overflow-hidden">
      {mode === 'logo' ? (
        /* =========================================================================
           1. COMPACT LOGO-ONLY OS FLOATING BUBBLE (72x72)
           Seamless pointer capture dragging across ANY screen, monitor, or app!
           ========================================================================= */
        <div
          onPointerDown={handleBubblePointerDown}
          onPointerMove={handleBubblePointerMove}
          onPointerUp={handleBubblePointerUp}
          className={`w-[72px] h-[72px] flex items-center justify-center relative select-none transition-transform duration-100 ${
            isDragging ? 'cursor-grabbing scale-105 opacity-90' : 'cursor-grab hover:scale-105'
          }`}
          title="TaskToggle (Deepak) · Drag anywhere all over your PC screen · Click to open"
        >
          {/* Circular Glass Bubble */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 text-white flex items-center justify-center shadow-2xl ring-4 ring-white border border-indigo-200/80 pointer-events-none">
            <CheckSquare className="w-7 h-7 stroke-[2.5]" />
          </div>

          {/* Pending Task Badge */}
          {pendingTasks.length > 0 && (
            <span className="absolute top-1 right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-md ring-2 ring-white animate-pulse pointer-events-none">
              {pendingTasks.length}
            </span>
          )}

          {/* Quick Helper Pill */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-slate-900/90 text-white text-[8px] font-bold opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap shadow-xs pointer-events-none">
            Drag Anywhere
          </div>
        </div>
      ) : (
        /* =========================================================================
           2. EXPANDED TASK DETAILS CARD (370x540)
           Full interactive task strike, voice dictation, snooze, and templates.
           ========================================================================= */
        <div className="w-[370px] bg-white/95 backdrop-blur-xl border border-indigo-200/90 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[550px] ring-4 ring-indigo-500/10 animate-in zoom-in-95 duration-150">
          {/* Draggable Desktop Title Bar - grab anywhere on the header to move across screen */}
          <div
            onPointerDown={handleHeaderPointerDown}
            onPointerMove={handleHeaderPointerMove}
            onPointerUp={handleHeaderPointerUp}
            className={`bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white px-4 py-3 flex items-center justify-between border-b border-white/10 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            title="Drag header to move anywhere across screen"
          >
            <div className="flex items-center gap-2 pointer-events-none">
              <GripHorizontal className="w-4 h-4 text-cyan-200 shrink-0" />
              <div className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-black tracking-tight font-['Outfit']">TaskToggle</span>
                <span className="text-[9px] font-black px-1.5 py-0.2 bg-white/20 rounded-md">
                  {orgSettings.orgName}
                </span>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => window.electronAPI?.openMainWindow()}
                className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all"
                title="Open Full TaskToggle Dashboard"
              >
                <ExternalLink className="w-3 h-3 text-cyan-200" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetMode('logo')}
                className="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition-all"
                title="Minimize to Logo Size only"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => window.electronAPI?.closeFloating()}
                className="w-6 h-6 rounded-lg bg-white/15 hover:bg-rose-500 flex items-center justify-center text-white cursor-pointer transition-all"
                title="Hide floating bubble"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Task Creation with Voice Dictation */}
          <div className="p-3 bg-gradient-to-r from-indigo-50/60 via-slate-50 to-cyan-50/50 border-b border-indigo-100/80 space-y-2">
            <form onSubmit={handleQuickCreate} className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={isListening ? 'Listening... Speak your task now' : 'Quick add task (e.g. Call Client)...'}
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className={`w-full text-xs pl-3 pr-8 py-2 rounded-xl bg-white border font-medium focus:outline-hidden transition-all placeholder:text-slate-400 ${
                    isListening
                      ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/30 animate-pulse text-rose-900'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-bounce shadow-xs'
                      : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                  title={isListening ? 'Stop listening' : 'Dictate task by voice (Web Speech API)'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
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

            {/* Quick Templates */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 shrink-0">Fast:</span>
              {quickTemplates.map((tmpl) => (
                <button
                  key={tmpl.label}
                  type="button"
                  onClick={() => setQuickTitle(tmpl.title)}
                  className="px-2 py-0.5 rounded-lg bg-white/90 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 border border-slate-200/90 text-[10px] font-bold shrink-0 transition-all cursor-pointer shadow-2xs whitespace-nowrap active:scale-95"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Tabs & Strike Anywhere Prompt */}
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
              Tap card to strike
            </span>
          </div>

          {/* Tasks List with 1-Click Strike Anywhere */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[300px] divide-y divide-slate-100/50">
            {displayedTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                No {filter} tasks for today.
              </div>
            ) : (
              displayedTasks.map((task) => {
                const isDone = task.status === 'done';

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`pt-1.5 first:pt-0 flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer select-none border group ${
                      isDone
                        ? 'bg-emerald-50/50 border-emerald-200/60 opacity-75'
                        : 'bg-white hover:bg-indigo-50/40 border-slate-200/80 hover:border-indigo-300'
                    }`}
                    title="Click anywhere to toggle completed with sound"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 bg-white group-hover:border-indigo-500'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold truncate transition-all ${
                            isDone
                              ? 'line-through decoration-emerald-500 decoration-2 text-slate-400 font-medium'
                              : 'text-slate-800 group-hover:text-indigo-950'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {task.dueTime || '5:30 PM'}
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-0.5 text-slate-400">
                              <Calendar className="w-2.5 h-2.5" />
                              {task.dueDate}
                            </span>
                          )}
                          {task.priority === 'High' && (
                            <span className="px-1 rounded bg-rose-100 text-rose-700 font-bold text-[9px]">
                              HIGH
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick +30m Snooze Button */}
                    {!isDone && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          snoozeTask(task.id, 30);
                        }}
                        className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold transition-opacity cursor-pointer shrink-0"
                        title="Quick snooze deadline by +30 minutes"
                      >
                        +30m
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Strike All Bar */}
          {pendingTasks.length > 1 && (
            <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Done with all your tasks?
              </span>
              <button
                type="button"
                onClick={completeAllTasks}
                className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                title="Strike through and complete all pending tasks at once"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Strike All Finished</span>
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-bold">
              {pendingTasks.length} pending · {completedTasks.length} done
            </span>
            <button
              type="button"
              onClick={() => handleSetMode('logo')}
              className="text-indigo-600 font-black cursor-pointer hover:underline"
            >
              Minimize to Logo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
