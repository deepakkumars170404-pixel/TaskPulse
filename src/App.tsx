import React, { useEffect, useMemo, useState } from 'react';
import { TaskToggleProvider, useTaskToggle } from './context/TaskToggleContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { LoginView } from './components/LoginView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AssignTaskView } from './components/admin/AssignTaskView';
import { TaskMonitorView } from './components/admin/TaskMonitorView';
import { TimingSettingsView } from './components/admin/TimingSettingsView';
import { MyToDoView } from './components/staff/MyToDoView';
import { CreateToDoView } from './components/staff/CreateToDoView';
import { TaskRequestsView } from './components/staff/TaskRequestsView';
import { FloatingTaskWidget } from './components/common/FloatingTaskWidget';
import { FullPageCalendarView } from './components/common/FullPageCalendarView';
import { ElectronFloatingBubble } from './components/common/ElectronFloatingBubble';
import { DueReminderBanner } from './components/common/DueReminderBanner';
import { TaskAlertBanner } from './components/common/TaskAlertBanner';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';

const MainLayout: React.FC = () => {
  const { currentPage, currentUser } = useTaskToggle();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect if TaskToggle is embedded inside ConnectX (via ?embedded=true in URL)
  const isEmbedded = useMemo(() => {
    return new URLSearchParams(window.location.search).get('embedded') === 'true';
  }, []);

  if (currentPage === 'login' && !isEmbedded) {
    return <LoginView />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${isEmbedded ? 'bg-transparent' : 'bg-[#FAFAF9]'}`}>
      {/* Top Header */}
      {!isEmbedded && (
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area - Full width edge-to-edge with smooth scrolling */}
        <main className={`flex-1 overflow-y-auto min-w-0 w-full ${currentPage === 'calendar' ? 'pb-20 md:pb-0 flex flex-col p-0' : 'pb-20 md:pb-4'}`}>
          {currentPage === 'calendar' && <FullPageCalendarView />}
          {currentUser.role === 'admin' ? (
            <>
              {currentPage === 'dashboard' && <AdminDashboard />}
              {currentPage === 'assign' && <AssignTaskView />}
              {currentPage === 'monitor' && <TaskMonitorView />}
              {currentPage === 'timing' && <TimingSettingsView />}
            </>
          ) : (
            <>
              {currentPage === 'mytodo' && <MyToDoView />}
              {currentPage === 'create' && <CreateToDoView />}
              {currentPage === 'requests' && <TaskRequestsView />}
            </>
          )}
        </main>
      </div>

      {/* Modern Bottom Navigation Bar for Mobile Phones */}
      {!isEmbedded && <BottomNav />}

      {/* Document Picture-in-Picture Handler (renders 0 DOM in page, handles PiP popup when clicked) */}
      <FloatingTaskWidget />

      {/* 30-Minute Task Due Reminder Banner for Staff */}
      <DueReminderBanner />

      {/* Prominent Real-time In-App Visual Task Alert Banner */}
      <TaskAlertBanner />

      {/* Progressive Web App (PWA) Automated Install Prompt */}
      <PwaInstallPrompt />
    </div>
  );
};

export function App() {
  // Detect if this instance is running as the dedicated Electron OS-level floating bubble
  const isFloatingMode = useMemo(() => {
    return (
      new URLSearchParams(window.location.search).get('mode') === 'floating-bubble' ||
      window.location.hash.includes('floating-bubble')
    );
  }, []);

  useEffect(() => {
    if (isFloatingMode) {
      document.documentElement.style.backgroundColor = 'transparent';
      document.body.style.backgroundColor = 'transparent';
      document.documentElement.classList.add('floating-mode');
      document.body.classList.add('floating-mode');
      document.body.className = 'floating-mode bg-transparent text-slate-900 antialiased font-[\'Open_Sans\',sans-serif] overflow-hidden';
    }
  }, [isFloatingMode]);

  return (
    <TaskToggleProvider>
      {isFloatingMode ? (
        <ElectronFloatingBubble />
      ) : (
        <MainLayout />
      )}
    </TaskToggleProvider>
  );
}

export default App;
