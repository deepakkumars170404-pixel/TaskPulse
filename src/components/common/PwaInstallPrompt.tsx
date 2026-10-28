import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Sparkles,
  Smartphone,
  Laptop,
  CheckCircle2,
  Share,
  PlusSquare,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosInstructions, setShowIosInstructions] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if already running as an installed standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect iOS devices (Safari on iPhone/iPad has a different PWA installation flow)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // 3. Listen for browser's beforeinstallprompt (Chrome, Edge, Android, Opera)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Automatically show install option immediately when user opens the app
      const hasDismissed = sessionStorage.getItem('tasktoggle_pwa_dismissed');
      if (!hasDismissed) {
        setIsOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. Global custom event to open prompt from Sidebar or Header button
    const handleCustomOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-pwa-install', handleCustomOpen);

    // If on iOS or browsers where prompt event doesn't fire immediately, show after 1.5 seconds if not dismissed
    const timer = setTimeout(() => {
      if (!isStandalone) {
        const hasDismissed = sessionStorage.getItem('tasktoggle_pwa_dismissed');
        if (!hasDismissed) {
          setIsOpen(true);
        }
      }
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install', handleCustomOpen);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native browser install dialog
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsOpen(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosInstructions(true);
    } else {
      // Fallback instruction for browsers where deferred prompt was already handled or not yet triggered
      alert(
        'To install TaskToggle, click the Install App icon (💻 or ➕) located in your browser address bar at the top right.'
      );
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('tasktoggle_pwa_dismissed', 'true');
  };

  // If already running standalone, do not display install banner
  if (isInstalled || !isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-32px)] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-2xl p-4 shadow-2xl border border-blue-200 shadow-blue-500/10 relative overflow-hidden">
        {/* Top subtle indigo highlight band */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />

        <div className="flex items-start justify-between gap-3 pt-0.5">
          {/* Logo & App Info */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30">
              <Download className="w-5 h-5 text-white animate-bounce" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900 tracking-tight font-['Outfit']">
                  Install TaskToggle
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full border border-blue-200">
                  App
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                Install as a desktop or mobile application for instant 1-click access.
              </p>
            </div>
          </div>

          {/* Close / Dismiss */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-all"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Features / Benefits Pills */}
        <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <Laptop className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">Desktop & Mobile</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">Instant 1-Click Launch</span>
          </div>
        </div>

        {/* iOS Step-by-Step Instructions Modal (if on iPhone/iPad) */}
        {showIosInstructions ? (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5 animate-in fade-in duration-150">
            <p className="font-bold flex items-center gap-1.5">
              <span>📱 How to install on iOS Safari:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700">
              <li className="flex items-center gap-1.5">
                <span>1. Tap the</span>
                <span className="font-bold text-blue-700 inline-flex items-center gap-0.5">
                  <Share className="w-3 h-3" /> Share
                </span>
                <span>button in Safari's menu.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>2. Scroll down and tap</span>
                <span className="font-bold text-blue-700 inline-flex items-center gap-0.5">
                  <PlusSquare className="w-3 h-3" /> Add to Home Screen
                </span>.
              </li>
              <li>3. Tap <strong>Add</strong> at top right to install!</li>
            </ol>
          </div>
        ) : (
          /* Action Buttons */
          <div className="flex items-center gap-2 mt-3.5">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-600/20 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer active:scale-95 transition-all"
            >
              Maybe Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
