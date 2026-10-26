import React, { useMemo, useState } from 'react';
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
    <div className={`min-h-screen flex flex-col ${isEmbedded ? 'bg-transparent' : 'bg-[#F4F6FB]'}`}>
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

        {/* Main Content Area - padded at bottom on mobile to accommodate BottomNav */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
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
    </div>
  );
};

export function App() {
  return (
    <TaskToggleProvider>
      <MainLayout />
    </TaskToggleProvider>
  );
}

export default App;
