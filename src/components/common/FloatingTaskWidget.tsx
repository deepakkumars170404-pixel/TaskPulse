import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  ExternalLink,
  Minimize2,
  Maximize2,
  MonitorUp,
  Mic,
  MicOff,
  CheckCircle2,
  RotateCcw,
  Smartphone,
  Flame,
} from 'lucide-react';
import { Task } from '../../types';

export const FloatingTaskWidget: React.FC = () => {
  const {
    currentUser,
    tasks,
    toggleTaskStatus,
    completeAllTasks,
    snoozeTask,
    createStaffTask,
    assignAdminTask,
    users,
    setCurrentPage,
    orgSettings,
  } = useTaskToggle();

  // In-browser widget states: 'logo' (only logo size) | 'expanded' (full details)
  const [inBrowserMode, setInBrowserMode] = useState<'logo' | 'expanded'>('logo');
  const [isVisible, setIsVisible] = useState(true);
  const [quickTitle, setQuickTitle] = useState('');
  const [filter, setFilter] = useState<'pending' | 'done' | 'all'>('pending');
  const [isListening, setIsListening] = useState(false);
  const [showMobilePwaGuide, setShowMobilePwaGuide] = useState(false);

  // Document Picture-in-Picture state (OS-level floating window over all other apps)
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isPipLogoOnly, setIsPipLogoOnly] = useState(true);

  // In-browser drag position state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const isPiPSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  // Initialize position on mount (snapped near right edge)
  useEffect(() => {
    const initX = Math.max(12, window.innerWidth - (window.innerWidth < 640 ? 70 : 80));
    const initY = Math.max(70, window.innerHeight - (window.innerWidth < 640 ? 220 : 260));
    setPosition({ x: initX, y: initY });

    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        const width = inBrowserMode === 'logo' ? 65 : window.innerWidth < 640 ? 320 : 380;
        const height = inBrowserMode === 'logo' ? 65 : 460;
        return {
          x: Math.min(Math.max(10, prev.x), window.innerWidth - width - 10),
          y: Math.min(Math.max(10, prev.y), window.innerHeight - height - 10),
        };
      });
    };

    window.addEventListener('resize', handleResize);

    const handleToggleCustom = () => {
      setIsVisible(true);
      setInBrowserMode('expanded');
    };
    const handleOpenPipCustom = () => {
      openPiP(true);
    };

    window.addEventListener('toggle-floating-widget', handleToggleCustom);
    window.addEventListener('open-pip-window', handleOpenPipCustom);

    // Global keyboard shortcut: Ctrl+K or Alt+T to toggle widget
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.altKey && e.key.toLowerCase() === 't')) {
        e.preventDefault();
        setIsVisible(true);
        setInBrowserMode((prev) => (prev === 'logo' ? 'expanded' : 'logo'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('toggle-floating-widget', handleToggleCustom);
      window.removeEventListener('open-pip-window', handleOpenPipCustom);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inBrowserMode]);

  // Open Document Picture-in-Picture window (Floats over all other desktop apps!)
  const openPiP = async (startInLogoMode = true) => {
    if (!isPiPSupported || !window.documentPictureInPicture) {
      setShowMobilePwaGuide(true);
      return;
    }

    try {
      const initialWidth = startInLogoMode ? 220 : 370;
      const initialHeight = startInLogoMode ? 190 : 520;

      const pipWin = await window.documentPictureInPicture.requestWindow({
        width: initialWidth,
        height: initialHeight,
      });

      // Clone all stylesheets and link tags from main document into PiP window
      const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
      styleElements.forEach((el) => {
        pipWin.document.head.appendChild(el.cloneNode(true));
      });

      pipWin.document.title = 'TaskToggle (Deepak)';
      pipWin.document.body.style.margin = '0';
      pipWin.document.body.style.padding = '0';
      pipWin.document.body.style.fontFamily = "'Outfit', system-ui, sans-serif";
      pipWin.document.body.style.background = '#F8FAFD';
      pipWin.document.body.style.overflow = 'hidden';

      pipWin.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      setIsPipLogoOnly(startInLogoMode);
      setPipWindow(pipWin);
    } catch (err) {
      console.warn('[PiP] Could not open PiP window:', err);
    }
  };

  const closePiP = () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
  };

  const expandPiP = () => {
    setIsPipLogoOnly(false);
    try {
      pipWindow?.resizeTo(370, 520);
    } catch (e) {
      // Ignore if resizeTo restricted
    }
  };

  const shrinkPiPToLogo = () => {
    setIsPipLogoOnly(true);
    try {
      pipWindow?.resizeTo(220, 190);
    } catch (e) {
      // Ignore if resizeTo restricted
    }
  };

  // Mouse & Touch In-Browser Drag Handlers with Edge Snapping (Messenger Chat Head style)
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

      const widgetWidth = inBrowserMode === 'logo' ? 65 : window.innerWidth < 640 ? 320 : 380;
      const widgetHeight = inBrowserMode === 'logo' ? 65 : 460;

      const newX = Math.min(Math.max(8, dragStartRef.current.startX + dx), window.innerWidth - widgetWidth - 8);
      const newY = Math.min(Math.max(8, dragStartRef.current.startY + dy), window.innerHeight - widgetHeight - 8);

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !dragStartRef.current || e.touches.length !== 1) return;
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.mouseX;
      const dy = touch.clientY - dragStartRef.current.mouseY;

      const widgetWidth = inBrowserMode === 'logo' ? 65 : window.innerWidth < 640 ? 320 : 380;
      const widgetHeight = inBrowserMode === 'logo' ? 65 : 460;

      const newX = Math.min(Math.max(8, dragStartRef.current.startX + dx), window.innerWidth - widgetWidth - 8);
      const newY = Math.min(Math.max(8, dragStartRef.current.startY + dy), window.innerHeight - widgetHeight - 8);

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging && inBrowserMode === 'logo' && position) {
        // Messenger Chat Head Edge-Snapping!
        const snapX = position.x < window.innerWidth / 2 ? 12 : window.innerWidth - 68;
        setPosition((prev) => (prev ? { x: snapX, y: prev.y } : null));
      }
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
  }, [isDragging, inBrowserMode, position]);

  // Voice Dictation (Speech-to-Task) using Web Speech API
  const startVoiceInput = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert('Voice dictation is supported in Google Chrome. Please open this app in Chrome to use voice typing!');
      return;
    }
    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuickTitle(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // Common quick templates
  const quickTemplates = [
    { label: '📞 Client Call', title: 'Call client to review deliverable items' },
    { label: '📧 Daily Report', title: 'Compile and email daily progress report' },
    { label: '📦 Stock Audit', title: 'Audit warehouse stock and verify counts' },
    { label: '💳 Payment Check', title: 'Review vendor invoice and approve payment' },
  ];

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

  // Reusable Tasks List with Click-to-Strike & 1-Tap Snooze
  const renderTasksList = () => (
    <div className="overflow-y-auto p-3 space-y-2 flex-1 max-h-[260px] divide-y divide-slate-50">
      {displayedTasks.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs font-bold italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          {filter === 'pending' ? '🎉 All tasks completed!' : 'No tasks in this tab'}
        </div>
      ) : (
        displayedTasks.map((task) => {
          const isDone = task.status === 'done';

          return (
            <div
              key={task.id}
              onClick={() => toggleTaskStatus(task.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-2.5 group ${
                isDone
                  ? 'bg-slate-50/80 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 hover:shadow-xs active:scale-[0.98]'
              }`}
              title="Click anywhere to strike & toggle completed"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {/* Checkbox circle */}
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

                  {/* Target Deadline (Date & Time) */}
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

              {/* 1-Tap Snooze (+30 mins) on pending tasks */}
              {!isDone && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    snoozeTask(task.id, 30);
                  }}
                  className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 border border-slate-200 shrink-0 cursor-pointer transition-all shadow-2xs"
                  title="Push deadline by 30 mins (+30m)"
                >
                  +30m
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  // Reusable Quick Task Creator Input with Voice Dictation & Templates
  const renderQuickCreate = () => (
    <div className="p-3 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-cyan-50/30 border-b border-indigo-100/80 space-y-2">
      <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder={isListening ? '🎙️ Listening... speak now' : '⚡ Fast task... press Enter to add'}
            className={`w-full pl-3 pr-8 py-2 rounded-xl border text-xs font-bold text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-2xs transition-all ${
              isListening ? 'border-amber-500 ring-2 ring-amber-200 animate-pulse' : 'border-slate-200 focus:border-indigo-600'
            }`}
          />
          {/* Voice Dictation Mic Button */}
          <button
            type="button"
            onClick={startVoiceInput}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isListening ? 'bg-amber-500 text-white animate-bounce' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
            }`}
            title="Dictate task by voice"
          >
            <Mic className="w-3.5 h-3.5" />
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

      {/* Quick Task Template Chips */}
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
  );

  return (
    <>
      {/* =========================================================================
          1. OS-LEVEL PICTURE-IN-PICTURE (Floats over ALL other apps on Windows/Mac)
          ========================================================================= */}
      {pipWindow &&
        createPortal(
          <div className="w-full h-screen flex flex-col bg-[#F8FAFD] select-none overflow-hidden font-['Outfit']">
            {isPipLogoOnly ? (
              /* Logo-only display inside PiP: Clicking opens details */
              <div
                onClick={expandPiP}
                className="w-full h-full min-h-[170px] flex flex-col items-center justify-center p-3 cursor-pointer bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white hover:brightness-105 transition-all group relative overflow-hidden"
                title="Click logo to open task details"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

                {/* Logo Icon */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg ring-4 ring-white/20 group-hover:scale-110 transition-transform">
                    <CheckSquare className="w-8 h-8 stroke-[2.5] text-white" />
                  </div>
                  {pendingTasks.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-md ring-2 ring-indigo-900 animate-pulse">
                      {pendingTasks.length}
                    </span>
                  )}
                </div>

                {/* Title & Click Prompt */}
                <div className="mt-2 text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>TaskToggle</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded font-bold text-cyan-200">
                    {orgSettings.orgName}
                  </span>
                </div>
                <div className="text-[10px] text-cyan-200/90 font-bold mt-0.5 flex items-center gap-1">
                  <span>Click to open details</span>
                  <Maximize2 className="w-3 h-3 text-cyan-300" />
                </div>
              </div>
            ) : (
              /* Expanded details inside PiP */
              <div className="w-full h-full flex flex-col overflow-hidden bg-white">
                {/* Header with Shrink to Logo button */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white px-3.5 py-2.5 flex items-center justify-between border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                      <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-black">TaskToggle Mini</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-white/20 rounded-md">
                      {orgSettings.orgName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={shrinkPiPToLogo}
                      className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all"
                      title="Shrink back to logo size only"
                    >
                      <Minimize2 className="w-3 h-3" />
                      <span>Logo Size</span>
                    </button>
                    <button
                      type="button"
                      onClick={closePiP}
                      className="w-6 h-6 rounded-lg bg-white/20 hover:bg-rose-500 text-white flex items-center justify-center cursor-pointer transition-all"
                      title="Close window"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Task Creator */}
                {renderQuickCreate()}

                {/* Filter Pills */}
                <div className="px-3 pt-2 pb-1.5 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
                  <div className="flex items-center gap-1">
                    {(['pending', 'done', 'all'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setFilter(tab)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black capitalize transition-all cursor-pointer ${
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
                  <span className="text-[9px] text-slate-400 font-bold italic">
                    Tap to strike
                  </span>
                </div>

                {/* Tasks List */}
                {renderTasksList()}

                {/* Footer with 1-Click Strike All */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 shrink-0">
                  {pendingTasks.length > 0 ? (
                    <button
                      type="button"
                      onClick={completeAllTasks}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Strike All Done ({pendingTasks.length})</span>
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-black">All Done! 🎉</span>
                  )}
                  <button
                    type="button"
                    onClick={shrinkPiPToLogo}
                    className="text-indigo-600 font-black cursor-pointer hover:underline"
                  >
                    Minimize to Logo
                  </button>
                </div>
              </div>
            )}
          </div>,
          pipWindow.document.body
        )}

      {/* =========================================================================
          2. IN-BROWSER DRAGGABLE FLOATING WIDGET (With Edge-Snapping & Popout PiP)
          ========================================================================= */}
      {isVisible && position && !pipWindow && (
        <div
          ref={widgetRef}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transition: isDragging ? 'none' : 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className={`fixed z-50 select-none ${
            isDragging ? 'cursor-grabbing opacity-95 scale-[1.02]' : ''
          }`}
        >
          {inBrowserMode === 'logo' ? (
            /* =======================================================
               A. LOGO SIZE ONLY MODE: Floating Chat Head with Live Counter
               ======================================================= */
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onClick={() => {
                if (!isDragging) setInBrowserMode('expanded');
              }}
              className="relative group cursor-grab active:cursor-grabbing hover:scale-110 transition-all duration-200"
              title="Click logo to open task details · Drag to move anywhere"
            >
              {/* Floating Logo Badge */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 text-white flex items-center justify-center shadow-2xl ring-4 ring-white border border-indigo-200/80">
                <CheckSquare className="w-7 h-7 stroke-[2.5]" />
              </div>

              {/* Live Pending Counter Badge */}
              {pendingTasks.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-md ring-2 ring-white animate-pulse">
                  {pendingTasks.length}
                </span>
              )}

              {/* Drag Grip Indicator Dots */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-slate-900/80 text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xs">
                Drag or Tap
              </div>
            </div>
          ) : (
            /* =======================================================
               B. EXPANDED FULL DETAILS MODE
               ======================================================= */
            <div className="w-[320px] sm:w-[380px] bg-white/95 backdrop-blur-xl border border-indigo-200/90 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[500px] ring-4 ring-indigo-500/10 animate-in zoom-in-95 duration-150">
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
                    <span className="text-xs font-black tracking-tight font-['Outfit']">TaskToggle</span>
                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-white/20 rounded-md">
                      {orgSettings.orgName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* PiP Button (Float over all other apps on Windows) */}
                  <button
                    type="button"
                    onClick={() => openPiP(true)}
                    className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all"
                    title="Float logo over Word, Excel, WhatsApp, and all other desktop apps"
                  >
                    <MonitorUp className="w-3 h-3 text-cyan-200" />
                    <span>Float Over Apps</span>
                  </button>

                  {/* Shrink to Logo Size Only button */}
                  <button
                    type="button"
                    onClick={() => setInBrowserMode('logo')}
                    className="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition-all"
                    title="Minimize to Logo Size only"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setIsVisible(false)}
                    className="w-6 h-6 rounded-lg bg-white/15 hover:bg-rose-500 flex items-center justify-center text-white cursor-pointer transition-all"
                    title="Hide widget"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Fast Task Creator with Voice Dictation & Templates */}
              {renderQuickCreate()}

              {/* Filter Pills & Click-to-Strike Guidance */}
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

              {/* Scrollable Tasks List */}
              {renderTasksList()}

              {/* Quick Footer Navigation with 1-Click Strike All */}
              <div className="p-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                {pendingTasks.length > 0 ? (
                  <button
                    type="button"
                    onClick={completeAllTasks}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Strike All Done</span>
                  </button>
                ) : (
                  <span className="text-emerald-700 font-black">All Done! 🎉</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInBrowserMode('logo')}
                    className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer text-[10px]"
                  >
                    Shrink to Logo
                  </button>

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
                    <span>Full Page</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating launcher if closed */}
      {!isVisible && !pipWindow && (
        <button
          onClick={() => {
            setIsVisible(true);
            setInBrowserMode('logo');
          }}
          className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-xl shadow-indigo-300/60 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all border-2 border-white/80"
          title="Open TaskToggle Floating Logo"
        >
          <CheckSquare className="w-7 h-7 stroke-[2.5]" />
          {pendingTasks.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs ring-2 ring-white">
              {pendingTasks.length}
            </span>
          )}
        </button>
      )}

      {/* Mobile PWA & Desktop App Guide Modal */}
      {showMobilePwaGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-indigo-100 animate-in zoom-in-95 duration-150 text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-['Outfit']">Float Over All Apps Guide</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">How to float over other apps on PC & Mobile</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMobilePwaGuide(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 font-medium leading-relaxed">
              <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-950">
                <div className="font-black text-indigo-900 flex items-center gap-1.5 mb-1">
                  <MonitorUp className="w-4 h-4 text-indigo-600" />
                  <span>On Desktop (PC / Laptop):</span>
                </div>
                <span>
                  Open <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> and click the <strong>Float Over Apps</strong> button. Chrome creates a native always-on-top window that floats over Word, Excel, and all other desktop applications!
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-50/80 border border-cyan-100 text-cyan-950">
                <div className="font-black text-cyan-900 flex items-center gap-1.5 mb-1">
                  <Smartphone className="w-4 h-4 text-cyan-600" />
                  <span>On Mobile (Android / iPhone):</span>
                </div>
                <span>
                  In Chrome mobile browser, tap the three dots (<strong>⋮</strong>) and tap <strong>"Add to Home screen" / "Install app"</strong>. This installs TaskToggle as a native standalone app on your phone with independent floating Picture-in-Picture window access!
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMobilePwaGuide(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
