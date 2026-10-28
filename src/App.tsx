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
import {
  AssignTaskModal,
  StaffDirectoryModal,
  DepartmentsModal,
  ReportsModal,
  SettingsModal,
  HelpModal,
} from './components/admin/ExecutiveModals';

const MainLayout: React.FC = () => {
  const { currentPage, currentUser } = useTaskToggle();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Global Modals State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);
  const [isDepartmentsModalOpen, setIsDepartmentsModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Detect if TaskToggle is embedded inside ConnectX (via ?embedded=true in URL)
  const isEmbedded = useMemo(() => {
    return new URLSearchParams(window.location.search).get('embedded') === 'true';
  }, []);

  if (currentPage === 'login' && !isEmbedded) {
    return <LoginView />;
  }

  return (
    <div className={`min-h-screen flex ${isEmbedded ? 'bg-transparent' : 'bg-[#F6F7FB]'}`}>
      {/* 1. Left Sidebar (~270px) */}
      {!isEmbedded && (
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenDirectory={() => setIsDirectoryModalOpen(true)}
          onOpenDepartments={() => setIsDepartmentsModalOpen(true)}
          onOpenReports={() => setIsReportsModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onOpenAssignModal={() => setIsAssignModalOpen(true)}
        />
      )}

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        {!isEmbedded && (
          <Header
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenAssignModal={() => setIsAssignModalOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto min-w-0 w-full pb-24 lg:pb-8">
          {currentPage === 'calendar' && <FullPageCalendarView />}
          {currentUser.role === 'admin' ? (
            <>
              {currentPage === 'dashboard' && (
                <AdminDashboard
                  searchQuery={searchQuery}
                  onOpenAssignModal={() => setIsAssignModalOpen(true)}
                />
              )}
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

      {/* Bottom Navigation for Mobile Phones */}
      {!isEmbedded && <BottomNav />}

      {/* Document Picture-in-Picture Handler */}
      <FloatingTaskWidget />

      {/* 30-Minute Task Due Reminder Banner for Staff */}
      <DueReminderBanner />

      {/* Prominent Real-time In-App Visual Task Alert Banner */}
      <TaskAlertBanner />

      {/* Progressive Web App (PWA) Automated Install Prompt */}
      <PwaInstallPrompt />

      {/* Interactive Global Modals */}
      <AssignTaskModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} />
      <StaffDirectoryModal isOpen={isDirectoryModalOpen} onClose={() => setIsDirectoryModalOpen(false)} />
      <DepartmentsModal isOpen={isDepartmentsModalOpen} onClose={() => setIsDepartmentsModalOpen(false)} />
      <ReportsModal isOpen={isReportsModalOpen} onClose={() => setIsReportsModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
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
      document.body.className =
        'floating-mode bg-transparent text-[#1E293B] antialiased font-[\'Plus_Jakarta_Sans\',sans-serif] overflow-hidden';
    }
  }, [isFloatingMode]);

  return (
    <TaskToggleProvider>
      {isFloatingMode ? <ElectronFloatingBubble /> : <MainLayout />}
    </TaskToggleProvider>
  );
}

export default App;
