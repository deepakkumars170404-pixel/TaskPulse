import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Check,
  CheckSquare,
  Clock,
  Plus,
  X,
  Minimize2,
  Mic,
  CheckCircle2,
  MonitorUp,
} from 'lucide-react';

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
    orgSettings,
  } = useTaskToggle();

  const [quickTitle, setQuickTitle] = useState('');
  const [filter, setFilter] = useState<'pending' | 'done' | 'all'>('pending');
  const [isListening, setIsListening] = useState(false);

  // 1. In-Page Floating State (pure logo inside TaskToggle, zero window box)
  const [isInPageVisible, setIsInPageVisible] = useState(true);
  const [isInPageMinimized, setIsInPageMinimized] = useState(true);

  // 2. Document Picture-in-Picture State (floats over OTHER BROWSER TABS & desktop apps)
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isPipLogoOnly, setIsPipLogoOnly] = useState(true);

  // Draggable position state for in-page logo
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const isPiPSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  // Listen to Navbar Events
  useEffect(() => {
    // Event A: Toggle In-Page Floating Logo
    const handleToggleInPage = () => {
      setIsInPageVisible(true);
      setIsInPageMinimized((prev) => !prev);
    };

    // Event B: Open Always-on-Top Floating Logo (Floats over OTHER BROWSER TABS)
    const handleOpenPiP = () => {
      if (pipWindow && !pipWindow.closed) {
        pipWindow.focus();
        if (isPipLogoOnly) {
          expandPiP();
        } else {
          shrinkPiPToLogo();
        }
      } else if (isPiPSupported) {
        openPiP(true); // Start directly as pure circular logo
      } else {
        handleToggleInPage();
      }
    };

    window.addEventListener('toggle-inpage-logo', handleToggleInPage);
    window.addEventListener('open-pip-logo', handleOpenPiP);
    window.addEventListener('toggle-floating-logo', handleToggleInPage);
    window.addEventListener('open-pip-window', handleOpenPiP);

    return () => {
      window.removeEventListener('toggle-inpage-logo', handleToggleInPage);
      window.removeEventListener('open-pip-logo', handleOpenPiP);
      window.removeEventListener('toggle-floating-logo', handleToggleInPage);
      window.removeEventListener('open-pip-window', handleOpenPiP);
    };
  }, [pipWindow, isPipLogoOnly, isPiPSupported]);

  // Open Always-on-Top Window over other browser tabs
  const openPiP = async (startInLogoMode = true) => {
    if (!isPiPSupported || !(window as any).documentPictureInPicture) {
      setIsInPageVisible(true);
      setIsInPageMinimized(false);
      return;
    }

    try {
      const initialWidth = startInLogoMode ? 100 : 360;
      const initialHeight = startInLogoMode ? 100 : 520;

      const pipWin = await (window as any).documentPictureInPicture.requestWindow({
        width: initialWidth,
        height: initialHeight,
      });

      // Synchronously inline stylesheet rules so there's 0ms render delay
      let inlinedStyles = '';
      try {
        Array.from(document.styleSheets).forEach((sheet) => {
          try {
            if (sheet.cssRules) {
              for (let i = 0; i < sheet.cssRules.length; i++) {
                inlinedStyles += sheet.cssRules[i].cssText + '\n';
              }
            }
          } catch (e) {
            if (sheet.href) {
              const link = pipWin.document.createElement('link');
              link.rel = 'stylesheet';
              link.href = sheet.href;
              pipWin.document.head.appendChild(link);
            }
          }
        });
      } catch (err) {
        console.warn('Style inlining warning:', err);
      }

      if (inlinedStyles) {
        const compiledStyle = pipWin.document.createElement('style');
        compiledStyle.textContent = inlinedStyles;
        pipWin.document.head.appendChild(compiledStyle);
      }

      document.querySelectorAll('style, link[rel="preconnect"], link[rel="stylesheet"]').forEach((el) => {
        pipWin.document.head.appendChild(el.cloneNode(true));
      });

      // Style Document PiP body with matching dark background to seamlessly blend with Chrome's title bar (#202124)!
      const baseStyle = pipWin.document.createElement('style');
      baseStyle.textContent = `
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
          background-color: #202124 !important;
          color: #FFFFFF !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          user-select: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      `;
      pipWin.document.head.appendChild(baseStyle);

      pipWin.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      setIsPipLogoOnly(startInLogoMode);
      setPipWindow(pipWin);
    } catch (err) {
      console.warn('PiP open error:', err);
      setIsInPageVisible(true);
      setIsInPageMinimized(false);
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
    if (pipWindow) {
      try {
        pipWindow.resizeTo(360, 520);
      } catch (e) {}
    }
  };

  const shrinkPiPToLogo = () => {
    setIsPipLogoOnly(true);
    if (pipWindow) {
      try {
        pipWindow.resizeTo(100, 100);
      } catch (e) {}
    }
  };

  // Filter tasks based on role and active tab
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

  // Draggable Mouse Handlers for the In-Page Floating Logo
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    const rect = widgetRef.current?.getBoundingClientRect();
    const currentX = rect ? rect.left : window.innerWidth - 80;
    const currentY = rect ? rect.top : window.innerHeight - 80;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: currentX,
      startY: currentY,
    };
    isDraggingRef.current = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = moveEvent.clientX - dragStartRef.current.mouseX;
      const deltaY = moveEvent.clientY - dragStartRef.current.mouseY;

      if (Math.hypot(deltaX, deltaY) > 5) {
        isDraggingRef.current = true;
      }

      const nextX = Math.max(10, Math.min(window.innerWidth - 70, dragStartRef.current.startX + deltaX));
      const nextY = Math.max(10, Math.min(window.innerHeight - 70, dragStartRef.current.startY + deltaY));

      setPosition({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      if (!isDraggingRef.current && isInPageMinimized) {
        setIsInPageMinimized(false);
      }
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Voice Input
  const startVoiceInput = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert('Voice dictation is supported in Google Chrome & Edge.');
      return;
    }
    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuickTitle((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const now = new Date();
    const TODAY_STR = `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (currentUser.role === 'admin') {
      const staffList = users.filter((u) => u.role === 'staff');
      const targetStaffId = staffList.length > 0 ? staffList[0].id : currentUser.id;
      assignAdminTask({
        title: quickTitle,
        description: 'Created via Floating Widget',
        staffIds: [targetStaffId],
        dueDate: TODAY_STR,
        dueTime: timeStr,
        priority: 'Medium',
      });
    } else {
      createStaffTask({
        title: quickTitle,
        details: 'Quick task added via Floating Widget',
        createForUserId: currentUser.id,
        dueDate: TODAY_STR,
        dueTime: timeStr,
      });
    }

    setQuickTitle('');
  };

  // Render tasks list
  const renderTasksList = (isDark = false) => (
    <div className={`overflow-y-auto p-2.5 space-y-1.5 flex-1 max-h-[250px] divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
      {displayedTasks.length === 0 ? (
        <div className={`py-6 text-center text-xs font-medium italic rounded-xl border border-dashed ${
          isDark ? 'bg-slate-900/60 border-slate-700 text-slate-400' : 'bg-slate-50/50 border-slate-200 text-slate-400'
        }`}>
          {filter === 'pending' ? '🎉 All tasks completed!' : 'No tasks in this tab'}
        </div>
      ) : (
        displayedTasks.map((task) => {
          const isDone = task.status === 'done';

          return (
            <div
              key={task.id}
              onClick={() => toggleTaskStatus(task.id)}
              className={`pt-1.5 first:pt-0 flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none group ${
                isDone
                  ? isDark ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-50/60 border-slate-200 opacity-75'
                  : isDark ? 'bg-slate-900 hover:bg-slate-850 border-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs'
              }`}
              title="Click to toggle status"
            >
              <div className="flex items-center gap-2 min-w-0 pr-1.5">
                <div
                  className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 border transition-all ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isDark ? 'border-slate-600 bg-slate-800 group-hover:border-[#4F46E5]' : 'border-slate-300 bg-white group-hover:border-[#4F46E5]'
                  }`}
                >
                  {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-xs truncate transition-all ${
                      isDone
                        ? 'line-through text-slate-400 font-medium'
                        : isDark ? 'font-semibold text-slate-100 group-hover:text-indigo-400' : 'font-semibold text-slate-900 group-hover:text-[#4F46E5]'
                    }`}
                  >
                    {task.title}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-0.5">
                    <span className={`flex items-center gap-0.5 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <Clock className="w-2.5 h-2.5 text-slate-400" />
                      {task.dueTime}
                    </span>
                    <span>•</span>
                    <span>{task.dueDate}</span>
                    {task.type === 'admin' && (
                      <span className="px-1 py-0.1 rounded bg-[#EEF2FF] text-[#4F46E5] font-semibold text-[9px]">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isDone && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    snoozeTask(task.id, 30);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                  title="Snooze deadline by 30 mins (+30m)"
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

  const inPageStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: 'auto',
        right: 'auto',
      }
    : {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
      };

  return (
    <>
      {/* =========================================================================
          1. IN-PAGE FLOATING LOGO (Active on all tabs inside TaskToggle)
          - Persistent across Dashboard, Assign, Monitor, Timing, Calendar, etc.
          - Zero browser box, zero "localhost:5173" bar!
          - Drag to move anywhere on screen · Click to open tasks.
          ========================================================================= */}
      {isInPageVisible && !pipWindow && (
        <div ref={widgetRef} style={inPageStyle} className="z-50 select-none font-jakarta">
          {isInPageMinimized ? (
            /* MINIMIZED: PURE TASKTOGGLE LOGO ICON */
            <div
              onMouseDown={handleMouseDown}
              className="relative group cursor-grab active:cursor-grabbing"
              title="TaskToggle Floating Logo (Click to open tasks · Drag to move)"
            >
              <div className="w-13 h-13 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 ring-3 ring-white hover:scale-108 active:scale-95 transition-all duration-150">
                <CheckSquare className="w-6 h-6 stroke-[2.4]" />
              </div>

              {pendingTasks.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-md">
                  {pendingTasks.length}
                </span>
              )}
            </div>
          ) : (
            /* EXPANDED IN-PAGE PANEL */
            <div className="w-[320px] sm:w-[350px] bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[480px] animate-in zoom-in-95 duration-150">
              <div className="bg-[#4F46E5] text-white px-3.5 py-2.5 flex items-center justify-between cursor-default">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <CheckSquare className="w-3.5 h-3.5 stroke-[2.4]" />
                  </div>
                  <span className="text-xs font-bold">TaskToggle Float</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-white/15 rounded-md">
                    {orgSettings.orgName}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Float over other tabs button */}
                  {isPiPSupported && (
                    <button
                      type="button"
                      onClick={() => openPiP(true)}
                      className="w-6 h-6 rounded-md hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Float over OTHER browser tabs and PC apps (Always on top)"
                    >
                      <MonitorUp className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Minimize button -> back to LOGO ONLY */}
                  <button
                    type="button"
                    onClick={() => setIsInPageMinimized(true)}
                    className="w-6 h-6 rounded-md hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Minimize to Logo Only"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInPageMinimized(true)}
                    className="w-6 h-6 rounded-md hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Add with Voice */}
              <div className="p-2.5 bg-slate-50 border-b border-slate-200/80">
                <form onSubmit={handleQuickAdd} className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={isListening ? 'Listening...' : 'Add task...'}
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      className="w-full pl-2.5 pr-8 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:border-[#4F46E5] outline-none text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={startVoiceInput}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded cursor-pointer ${
                        isListening ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-[#4F46E5]'
                      }`}
                      title="Voice typing"
                    >
                      <Mic className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary-gradient px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Filter Pills */}
              <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-100 bg-white">
                <div className="flex items-center gap-1">
                  {(['pending', 'done', 'all'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilter(tab)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize transition-all cursor-pointer ${
                        filter === tab
                          ? 'bg-[#4F46E5] text-white'
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
                <span className="text-[9px] text-slate-400 font-medium italic">
                  Tap to strike
                </span>
              </div>

              {/* Tasks List */}
              {renderTasksList(false)}

              {/* Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                {pendingTasks.length > 0 ? (
                  <button
                    type="button"
                    onClick={completeAllTasks}
                    className="px-2 py-0.5 rounded-md bg-[#EEF2FF] hover:bg-indigo-100 text-[#4F46E5] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#4F46E5]" />
                    <span>Strike All ({pendingTasks.length})</span>
                  </button>
                ) : (
                  <span className="text-emerald-700 font-bold">All Completed! 🎉</span>
                )}

                <button
                  type="button"
                  onClick={() => setIsInPageMinimized(true)}
                  className="text-[#4F46E5] hover:text-[#4338CA] font-bold cursor-pointer flex items-center gap-1"
                  title="Minimize to Logo Only"
                >
                  <Minimize2 className="w-3 h-3" />
                  <span>Minimize to Logo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          2. ALWAYS-ON-TOP OS FLOAT (Document Picture-in-Picture)
          - Seamless dark background (#0F172A) that matches Chrome's black title bar!
          - Stays on top when you switch to OTHER BROWSER TABS, Word, Excel, Desktop!
          ========================================================================= */}
      {pipWindow &&
        createPortal(
          <div className="w-full h-full flex flex-col select-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] bg-[#202124]">
            {isPipLogoOnly ? (
              /* PURE LOGO ONLY - Smoothly blended with dark window */
              <div
                onClick={expandPiP}
                className="w-full h-full flex items-center justify-center bg-[#202124] hover:bg-[#2A2B2E] cursor-pointer select-none p-1 transition-colors group"
                title="TaskToggle (Floats over all tabs) · Click logo to open tasks"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center shadow-2xl ring-2 ring-indigo-400 group-hover:scale-105 active:scale-95 transition-transform duration-150">
                    <CheckSquare className="w-7 h-7 stroke-[2.4]" />
                  </div>
                  {pendingTasks.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md ring-2 ring-[#202124]">
                      {pendingTasks.length}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* EXPANDED TASKS WINDOW */
              <div className="w-full h-full flex flex-col overflow-hidden bg-[#202124] text-white">
                <div className="bg-[#4F46E5] text-white px-3 py-2 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                      <CheckSquare className="w-3 h-3 stroke-[2.4]" />
                    </div>
                    <span className="text-xs font-bold">TaskToggle Float</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={shrinkPiPToLogo}
                      className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="Minimize to Logo Only"
                    >
                      <Minimize2 className="w-3 h-3" />
                      <span>Logo Only</span>
                    </button>
                    <button
                      type="button"
                      onClick={closePiP}
                      className="w-5 h-5 rounded bg-white/15 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer transition-all"
                      title="Close window"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="p-2 bg-slate-900 border-b border-slate-800 shrink-0">
                  <form onSubmit={handleQuickAdd} className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Add task..."
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-slate-800 text-white rounded border border-slate-700 outline-none"
                    />
                    <button
                      type="submit"
                      className="btn-primary-gradient px-2 py-1 rounded text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </form>
                </div>

                {renderTasksList(true)}

                <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] font-semibold text-slate-400 shrink-0">
                  <span className="text-slate-300 font-bold">{pendingTasks.length} pending</span>
                  <button
                    type="button"
                    onClick={shrinkPiPToLogo}
                    className="text-indigo-400 hover:underline font-bold cursor-pointer flex items-center gap-0.5"
                  >
                    <Minimize2 className="w-2.5 h-2.5" />
                    <span>Minimize to Logo</span>
                  </button>
                </div>
              </div>
            )}
          </div>,
          pipWindow.document.body
        )}
    </>
  );
};
