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
  // GLOBAL OS CURSOR DRAG & DROP ENGINE (Smooth 100fps movement anywhere on PC)
  // =========================================================================
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleBubbleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    dragStartPosRef.current = { x: e.screenX, y: e.screenY };

    if (window.electronAPI?.startDrag) {
      window.electronAPI.startDrag();
    }

    const handleMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mouseup', handleMouseUp);

      if (window.electronAPI?.stopDrag) {
        window.electronAPI.stopDrag();
      }

      if (dragStartPosRef.current) {
        const dist = Math.hypot(
          upEvent.screenX - dragStartPosRef.current.x,
          upEvent.screenY - dragStartPosRef.current.y
        );
        dragStartPosRef.current = null;

        // If the user clicked without dragging more than 8px, expand to full task card!
        if (dist < 8) {
          handleSetMode('expanded');
        }
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;

    if (window.electronAPI?.startDrag) {
      window.electronAPI.startDrag();
    }

    const handleMouseUp = () => {
      window.removeEventListener('mouseup', handleMouseUp);
      if (window.electronAPI?.stopDrag) {
        window.electronAPI.stopDrag();
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
  };

  // Filter tasks based on current user and selected tab (exclude declined tasks for staff)
  const relevantTasks = tasks.filter((t) => {
    if (currentUser.role === 'admin') return true;
    return t.assignedTo === currentUser.id && t.status !== 'rejected';
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
        description: 'Created via Desktop Float',
        staffIds: [targetStaffId],
        dueDate: TODAY_STR,
        dueTime: timeStr,
        priority: 'Medium',
      });
    } else {
      createStaffTask({
        title: quickTitle,
        details: 'Quick task added via Desktop Float',
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
    <div className="w-full h-full flex items-center justify-center select-none bg-transparent overflow-hidden">
      {mode === 'logo' ? (
        /* =========================================================================
           1. COMPACT LOGO-ONLY OS FLOATING BUBBLE (72x72)
           Drags smoothly anywhere on desktop · Click to open
           ========================================================================= */
        <div
          onMouseDown={handleBubbleMouseDown}
          className="w-20 h-20 flex items-center justify-center select-none cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-100"
          title="TaskToggle (Deepak) · Drag anywhere on PC screen · Click to open"
        >
          <div className="relative">
            {/* Solid Indigo Circular Logo - Zero white background */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl ring-3 ring-white pointer-events-none">
              <CheckSquare className="w-8 h-8 stroke-[2.5]" />
            </div>

            {/* Red Pending Task Badge */}
            {pendingTasks.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[24px] h-[24px] px-1.5 rounded-full bg-rose-600 text-white text-xs font-black flex items-center justify-center shadow-lg ring-2 ring-white pointer-events-none">
                {pendingTasks.length}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* =========================================================================
           2. EXPANDED TASK DETAILS CARD (370x540)
           ========================================================================= */
        <div className="w-[370px] bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[550px] animate-in zoom-in-95 duration-150">
          {/* Draggable Desktop Title Bar - Slate-900 */}
          <div
            onMouseDown={handleHeaderMouseDown}
            className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between border-b border-indigo-700 cursor-grab active:cursor-grabbing"
            title="Drag header to move anywhere across screen"
          >
            <div className="flex items-center gap-2 pointer-events-none">
              <GripHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                  <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold tracking-tight font-['Outfit']">TaskToggle</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-white/15 rounded-md">
                  {orgSettings.orgName}
                </span>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => window.electronAPI?.openMainWindow()}
                className="px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                title="Open Full TaskToggle Dashboard"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetMode('logo')}
                className="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer transition-all"
                title="Minimize to Logo Size only"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => window.electronAPI?.closeFloating()}
                className="w-6 h-6 rounded-lg bg-white/15 hover:bg-rose-600 flex items-center justify-center text-white cursor-pointer transition-all"
                title="Hide floating bubble"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Task Creation with Voice Dictation */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
            <form onSubmit={handleQuickCreate} className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={isListening ? 'Listening... Speak now' : 'Quick add task (e.g. Call Client)...'}
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className={`w-full text-xs pl-3 pr-8 py-2 rounded-xl bg-white border font-medium focus:outline-none transition-all placeholder:text-slate-400 ${
                    isListening
                      ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/30 animate-pulse text-rose-900'
                      : 'border-slate-300 focus:border-indigo-600 text-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-bounce'
                      : 'text-slate-400 hover:text-indigo-600'
                  }`}
                  title="Voice dictation"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 transition-all"
                title="Add task immediately"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add</span>
              </button>
            </form>

            {/* Quick Templates */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Fast:</span>
              {quickTemplates.map((tmpl) => (
                <button
                  key={tmpl.label}
                  type="button"
                  onClick={() => setQuickTitle(tmpl.title)}
                  className="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-3 pt-2 pb-1.5 flex items-center justify-between border-b border-slate-100 bg-white">
            <div className="flex items-center gap-1">
              {(['pending', 'done', 'all'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                    filter === tab
                      ? 'bg-indigo-600 text-white'
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

            <span className="text-[10px] text-slate-400 font-medium italic">
              Tap card to strike
            </span>
          </div>

          {/* Tasks List with 1-Click Strike Anywhere */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[300px] divide-y divide-slate-100">
            {displayedTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                No {filter} tasks for today.
              </div>
            ) : (
              displayedTasks.map((task) => {
                const isDone = task.status === 'done';
                const senderUser = users.find((u) => u.id === task.createdBy);

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`pt-1.5 first:pt-0 flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer select-none border group ${
                      isDone
                        ? 'bg-slate-50/60 border-slate-200 opacity-75'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                    title="Click anywhere to toggle completed with sound"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white group-hover:border-indigo-600'
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
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-0.5 flex-wrap">
                          <span className="flex items-center gap-0.5 text-slate-600 font-bold">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {task.dueTime || '5:30 PM'}
                          </span>
                          <span className="text-slate-300">•</span>
                          {task.dueDate && <span>{task.dueDate}</span>}

                          {/* Provenance Badge */}
                          {task.type === 'admin' && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-800 font-bold text-[9px] border border-indigo-200">
                              From Admin
                            </span>
                          )}
                          {task.type === 'staff' && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold text-[9px] border border-slate-200">
                              From: {senderUser?.name || task.createdByName || 'Staff'}
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
                        className="px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer shrink-0 border border-slate-200"
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
            <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Done with all your tasks?
              </span>
              <button
                type="button"
                onClick={completeAllTasks}
                className="px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                title="Strike through and complete all pending tasks at once"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Strike All Finished</span>
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-bold">
              {pendingTasks.length} pending · {completedTasks.length} done
            </span>
            <button
              type="button"
              onClick={() => handleSetMode('logo')}
              className="text-indigo-600 font-bold cursor-pointer hover:underline"
            >
              Minimize to Logo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
