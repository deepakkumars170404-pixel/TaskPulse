import React, { useState, useEffect } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Volume2,
  Bell,
  Play,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  X,
  PlusCircle,
  Check,
  Send,
} from 'lucide-react';

interface SoundTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundTestModal: React.FC<SoundTestModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    playThirtyMinReminderSound,
    playAssignmentAlertSound,
    playCompletionSound,
    playCalendarClickSound,
    triggerDueReminderPreview,
    triggerTaskAlert,
    sendTaskNotification,
    sendTaskCompletedNotification,
    assignAdminTask,
  } = useTaskToggle();

  const [permStatus, setPermStatus] = useState<NotificationPermission>('default');
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [createdSimulatedTask, setCreatedSimulatedTask] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermStatus(Notification.permission);
    }
  }, [isOpen]);

  const showActionFeedback = (msg: string) => {
    setLastActionMessage(msg);
    setTimeout(() => {
      setLastActionMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setPermStatus(res);
        if (res === 'granted') {
          showActionFeedback('✅ Desktop OS notifications granted successfully!');
          new Notification('TaskToggle Notifications Active', {
            body: 'Desktop notifications will now pop up over apps and games.',
            icon: '/favicon.ico',
          });
        } else {
          showActionFeedback('⚠️ Desktop OS notifications were not granted.');
        }
      } catch (err) {
        console.error('Error requesting permission', err);
      }
    }
  };

  const handleSimulate25MinTask = () => {
    const now = new Date();
    // 25 minutes into the future
    const target = new Date(now.getTime() + 25 * 60 * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dueDateStr = `${String(target.getDate()).padStart(2, '0')} ${months[target.getMonth()]} ${target.getFullYear()}`;
    const dueTimeStr = target.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    assignAdminTask({
      title: 'Urgent Client Submission (Simulated 25m Due)',
      description: 'Simulated task created to test the live 10-second background deadline checker and 30-min reminder banner.',
      staffIds: [currentUser.id],
      dueDate: dueDateStr,
      dueTime: dueTimeStr,
      priority: 'High',
    });

    setCreatedSimulatedTask(true);
    showActionFeedback(`⚡ Live test task created! Due at ${dueTimeStr} (in 25 min). Watch for the automatic chime within 10s!`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-orange-50/80 via-white to-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Sound & Notification Test Lab
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">
                  Interactive
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Test audio chimes, desktop push alerts, and reminder banners with 1 click.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-all"
            title="Close test lab"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4.5 max-h-[75vh] overflow-y-auto">
          {/* Action Feedback Banner */}
          {lastActionMessage && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs font-semibold text-orange-700 flex items-center gap-2 animate-in fade-in duration-150">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{lastActionMessage}</span>
            </div>
          )}

          {/* Desktop Permission Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-slate-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  Browser / OS Push Status:
                  <span
                    className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${
                      permStatus === 'granted'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : permStatus === 'denied'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {permStatus}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500">
                  {permStatus === 'granted'
                    ? 'Push notifications are enabled and will pop over external apps.'
                    : 'Grant permission so deadline and task alerts can reach you outside the browser.'}
                </p>
              </div>
            </div>

            {permStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
              >
                Request Permission
              </button>
            )}
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 gap-3.5">
            {/* 1. 30-Minute Due Reminder Chime & Banner */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
                  <Clock className="w-4.5 h-4.5 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      1. 30-Minute Due Reminder Chime & Banner
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded">
                      2-Pulse Harmonic
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Ascending triangle harmonic pulses (E5 → A5 → C#6). Fires automatically 30 min before task deadline for pending tasks only.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    playThirtyMinReminderSound();
                    showActionFeedback('🔊 Played 30-Minute Due Reminder sound!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-2xs"
                  title="Play audio only"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Sound</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerDueReminderPreview('Prepare Monthly Sales Review', 25);
                    showActionFeedback('🔔 Triggered full 30-min reminder banner + sound + desktop push!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
                  title="Test full experience: sound, top reminder banner, and desktop notification"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Test Full Alert</span>
                </button>
              </div>
            </div>

            {/* 2. Task Assignment Allotment Chime */}
            <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/30 hover:bg-orange-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
                  <Send className="w-4.5 h-4.5 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      2. New Task Allotment Chime
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                      4-Tone Ascending
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    High 4-tone ascending alert (F#5 → A5 → D6 → F#6). Plays when admin assigns tasks to staff or staff requests a task.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    playAssignmentAlertSound();
                    showActionFeedback('🔊 Played New Task Allotment sound!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-2xs"
                  title="Play audio only"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Sound</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerTaskAlert({
                      id: `test_${Date.now()}`,
                      title: 'New Task from Admin',
                      message: 'Due: 27 Oct at 6:30 PM',
                      taskTitle: 'Client Brief & Deliverables Review',
                      senderName: 'Deepak (Admin)',
                      dueDate: '27 Oct 2026',
                      dueTime: '6:30 PM',
                      priority: 'High',
                      type: 'admin',
                    });
                    showActionFeedback('🔔 Triggered Task Alert chime + visual text popup banner!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Test Full Alert</span>
                </button>
              </div>
            </div>

            {/* 3. Task Completion Dopamine Chime */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      3. Task Completed Dopamine Chime
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
                      C5 → C6 Harmony
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Uplifting harmonic victory chime (C5 → C6). Plays upon striking any task complete or batch completing tasks.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    playCompletionSound();
                    showActionFeedback('🔊 Played Task Completion victory chime!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-2xs"
                  title="Play audio only"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Sound</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sendTaskCompletedNotification('Quarterly Budget Audit', currentUser.name);
                    showActionFeedback('🎉 Triggered Task Completed chime + desktop push notification!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Test Full Alert</span>
                </button>
              </div>
            </div>

            {/* 4. Calendar Date Tap Interaction Chime */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 border border-slate-300">
                  <Calendar className="w-4.5 h-4.5 text-slate-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      4. Calendar Date Tap Interaction Chime
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                      B5 Marimba
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Gentle high-clarity wooden marimba tap (B5). Plays fluidly when tapping any calendar date cell to inspect tasks.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    playCalendarClickSound();
                    showActionFeedback('🔊 Played Calendar Date Click tap sound!');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Tap Sound</span>
                </button>
              </div>
            </div>

            {/* 5. Live Automated Background Checker Simulator */}
            <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/40 hover:bg-violet-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-800 flex items-center justify-center shrink-0 border border-violet-300">
                  <Sparkles className="w-4.5 h-4.5 text-violet-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      5. Live Background Checker Simulation (25-Min Deadline)
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-violet-200/80 text-violet-900 px-1.5 py-0.5 rounded">
                      Automated 10s Loop
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Instantly creates a live pending task due in 25 minutes. The automated engine checks every 10 seconds; it will detect this task and automatically trigger the chime & banner!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSimulate25MinTask}
                  className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{createdSimulatedTask ? 'Add Another Task' : 'Simulate 25m Due Task'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-medium">
            💡 Sound requires at least one click in your browser tab to initialize audio output.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer transition-all active:scale-95"
          >
            Done Testing
          </button>
        </div>
      </div>
    </div>
  );
};
