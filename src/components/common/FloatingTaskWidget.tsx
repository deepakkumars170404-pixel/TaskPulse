import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Check,
  CheckSquare,
  Clock,
  Calendar,
  Plus,
  X,
  GripHorizontal,
  Minimize2,
  Maximize2,
  MonitorUp,
  Mic,
  MicOff,
  CheckCircle2,
  Smartphone,
  ShieldAlert,
  Users,
  User,
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
  const [showMobilePwaGuide, setShowMobilePwaGuide] = useState(false);

  // Document Picture-in-Picture state (OS-level floating window over all other apps)
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isPipLogoOnly, setIsPipLogoOnly] = useState(true);

  const isPiPSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  // Listen to open-pip-window custom event from the Header button
  useEffect(() => {
    const handleOpenPipCustom = () => {
      openPiP(true);
    };

    window.addEventListener('open-pip-window', handleOpenPipCustom);

    return () => {
      window.removeEventListener('open-pip-window', handleOpenPipCustom);
    };
  }, [pipWindow]);

  // Open Document Picture-in-Picture window (Floats over all other desktop apps!)
  const openPiP = async (startInLogoMode = true) => {
    if (window.electronAPI?.isElectron) {
      window.electronAPI.resizeFloating(startInLogoMode ? 'logo' : 'expanded');
      return;
    }

    if (!isPiPSupported || !window.documentPictureInPicture) {
      setShowMobilePwaGuide(true);
      return;
    }

    try {
      const initialWidth = startInLogoMode ? 220 : 380;
      const initialHeight = startInLogoMode ? 190 : 540;

      const pipWin = await window.documentPictureInPicture.requestWindow({
        width: initialWidth,
        height: initialHeight,
      });

      // Clone all stylesheets and link tags from main document into PiP window
      const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
      styleElements.forEach((el) => {
        pipWin.document.head.appendChild(el.cloneNode(true));
      });

      // Inject custom font and base styling
      const baseStyle = pipWin.document.createElement('style');
      baseStyle.textContent = `
        body {
          margin: 0;
          padding: 0;
          font-family: 'Open Sans', sans-serif;
          background: #F8FAFC;
          overflow: hidden;
          user-select: none;
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
      setShowMobilePwaGuide(true);
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
      pipWindow?.resizeTo(380, 540);
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

  // Voice Dictation (Speech-to-Task) using Web Speech API
  const startVoiceInput = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert('Voice dictation is supported in Google Chrome. Please open this app in Chrome to use voice typing!');
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

  // Filter tasks based on role and active tab
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

  const quickTemplates = [
    { label: '📞 Client Call', title: 'Client Follow-up Call' },
    { label: '📧 Daily Report', title: 'Submit Daily Activity Report' },
    { label: '📦 Stock Audit', title: 'Physical Stock & Inventory Audit' },
    { label: '💳 Payment Check', title: 'Vendor Payment Status Verification' },
  ];

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
        description: 'Created quickly via TaskToggle Float',
        staffIds: [targetStaffId],
        dueDate: TODAY_STR,
        dueTime: timeStr,
        priority: 'Medium',
      });
    } else {
      createStaffTask({
        title: quickTitle,
        details: 'Quick task added via TaskToggle Float',
        createForUserId: currentUser.id,
        dueDate: TODAY_STR,
        dueTime: timeStr,
      });
    }

    setQuickTitle('');
  };

  // Reusable Tasks List with Click-to-Strike, Snooze, and Provenance Badge
  const renderTasksList = () => (
    <div className="overflow-y-auto p-3 space-y-2 flex-1 max-h-[280px] divide-y divide-slate-100">
      {displayedTasks.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs font-semibold italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          {filter === 'pending' ? '🎉 All tasks completed!' : 'No tasks in this tab'}
        </div>
      ) : (
        displayedTasks.map((task) => {
          const isDone = task.status === 'done';
          const senderUser = users.find((u) => u.id === task.createdBy);

          return (
            <div
              key={task.id}
              onClick={() => toggleTaskStatus(task.id)}
              className={`pt-2 first:pt-0 flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none group ${
                isDone
                  ? 'bg-slate-50/60 border-slate-200 opacity-75'
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
              title="Click anywhere to strike through & complete task"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {/* Strike Checkbox */}
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
                        : 'text-slate-900 group-hover:text-indigo-950'
                    }`}
                  >
                    {task.title}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-1 flex-wrap">
                    <span className="flex items-center gap-0.5 text-slate-600 font-bold">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {task.dueTime}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{task.dueDate}</span>

                    {/* Sender Provenance Badge */}
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

              {/* 1-Tap Snooze (+30m) */}
              {!isDone && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    snoozeTask(task.id, 30);
                  }}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shrink-0"
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

  return (
    <>
      {/* =========================================================================
          OS-LEVEL PICTURE-IN-PICTURE (Floats over ALL other apps on Windows / Mac)
          ========================================================================= */}
      {pipWindow &&
        createPortal(
          <div className="w-full h-screen flex flex-col bg-[#F8FAFC] select-none overflow-hidden font-['Open_Sans',sans-serif]">
            {isPipLogoOnly ? (
              /* Logo-only display inside PiP: Clicking opens details */
              <div
                onClick={expandPiP}
                className="w-full h-full min-h-[170px] flex flex-col items-center justify-center p-3 cursor-pointer bg-slate-900 text-white hover:bg-slate-800 transition-all group relative overflow-hidden select-none"
                title="Click logo to open details · Drag top title bar to move across desktop"
              >
                {/* Top drag instruction */}
                <div className="text-[10px] text-slate-400 font-semibold mb-2 flex items-center gap-1">
                  <GripHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Drag top bar to move window</span>
                </div>

                {/* Logo Icon */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg ring-4 ring-white/10 group-hover:scale-105 transition-transform">
                    <CheckSquare className="w-8 h-8 stroke-[2.5] text-white" />
                  </div>
                  {pendingTasks.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-md ring-2 ring-slate-900 animate-pulse">
                      {pendingTasks.length}
                    </span>
                  )}
                </div>

                {/* Title & Click Prompt */}
                <div className="mt-2 text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>TaskToggle</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded font-semibold text-slate-200">
                    {orgSettings.orgName}
                  </span>
                </div>
                <div className="text-[10px] text-indigo-300 font-bold mt-0.5 flex items-center gap-1">
                  <span>Click to open details</span>
                  <Maximize2 className="w-3 h-3" />
                </div>
              </div>
            ) : (
              /* Expanded details inside PiP */
              <div className="w-full h-full flex flex-col overflow-hidden bg-white">
                {/* Clean Professional Title Bar */}
                <div className="bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                      <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold">TaskToggle Float</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-white/15 rounded-md">
                      {orgSettings.orgName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={shrinkPiPToLogo}
                      className="px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="Shrink back to logo size"
                    >
                      <Minimize2 className="w-3 h-3" />
                      <span>Logo</span>
                    </button>
                    <button
                      type="button"
                      onClick={closePiP}
                      className="w-6 h-6 rounded-lg bg-white/15 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer transition-all"
                      title="Close window"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Add with Voice */}
                <div className="p-2.5 bg-slate-50 border-b border-slate-200/80 space-y-1.5 shrink-0">
                  <form onSubmit={handleQuickAdd} className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={isListening ? 'Listening...' : 'Add task...'}
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        className={`w-full text-xs pl-2.5 pr-7 py-1.5 rounded-lg border bg-white font-medium focus:outline-none transition-all placeholder:text-slate-400 ${
                          isListening
                            ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/50 animate-pulse text-rose-900'
                            : 'border-slate-300 focus:border-indigo-600 text-slate-800'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={startVoiceInput}
                        className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all cursor-pointer ${
                          isListening
                            ? 'bg-rose-600 text-white animate-bounce'
                            : 'text-slate-400 hover:text-indigo-600'
                        }`}
                        title="Voice dictation"
                      >
                        {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </form>

                  {/* Fast Template Chips */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                    {quickTemplates.map((tmpl) => (
                      <button
                        key={tmpl.label}
                        type="button"
                        onClick={() => setQuickTitle(tmpl.title)}
                        className="px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-semibold shrink-0 cursor-pointer whitespace-nowrap"
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
                  <div className="flex items-center gap-1">
                    {(['pending', 'done', 'all'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setFilter(tab)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize transition-all cursor-pointer ${
                          filter === tab
                            ? 'bg-slate-900 text-white'
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
                {renderTasksList()}

                {/* Footer with 1-Click Strike All */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] font-semibold text-slate-500 shrink-0">
                  {pendingTasks.length > 0 ? (
                    <button
                      type="button"
                      onClick={completeAllTasks}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                      <span>Strike All ({pendingTasks.length})</span>
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold">All Completed! 🎉</span>
                  )}
                  <button
                    type="button"
                    onClick={shrinkPiPToLogo}
                    className="text-indigo-600 font-bold cursor-pointer hover:underline"
                  >
                    Minimize to Logo
                  </button>
                </div>
              </div>
            )}
          </div>,
          pipWindow.document.body
        )}

      {/* Mobile PWA & Desktop App Guide Modal */}
      {showMobilePwaGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Float Over All Apps Guide</h3>
                  <p className="text-[11px] text-slate-400 font-medium">How to float over other apps on PC & Mobile</p>
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
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <MonitorUp className="w-4 h-4 text-indigo-600" />
                  <span>On Desktop (PC / Laptop):</span>
                </div>
                <span>
                  Open <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> and click the <strong>Float Over Apps</strong> button. Chrome creates a native always-on-top window that floats over Word, Excel, and all other desktop applications!
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>On Mobile (Android / iPhone):</span>
                </div>
                <span>
                  In Chrome mobile browser, tap the three dots (<strong>⋮</strong>) and tap <strong>"Add to Home screen" / "Install app"</strong>. This installs TaskToggle as a native standalone app on your phone.
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMobilePwaGuide(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
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
