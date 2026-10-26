import React, { useMemo } from 'react';
import { TaskPulseProvider, useTaskPulse } from './context/TaskPulseContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AssignTaskView } from './components/admin/AssignTaskView';
import { TaskMonitorView } from './components/admin/TaskMonitorView';
import { TimingSettingsView } from './components/admin/TimingSettingsView';
import { MyToDoView } from './components/staff/MyToDoView';
import { CreateToDoView } from './components/staff/CreateToDoView';
import { TaskRequestsView } from './components/staff/TaskRequestsView';

const MainLayout: React.FC = () => {
  const { currentPage, currentUser } = useTaskPulse();

  // Detect if TaskPulse is embedded inside ConnectX (via ?embedded=true in URL)
  const isEmbedded = useMemo(() => {
    return new URLSearchParams(window.location.search).get('embedded') === 'true';
  }, []);

  if (currentPage === 'login' && !isEmbedded) {
    return <LoginView />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${isEmbedded ? 'bg-transparent' : 'bg-[#F4F6FB]'}`}>
      {/* If embedded inside ConnectX, hide redundant outer header so ConnectX controls header */}
      {!isEmbedded && <Header />}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
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
    </div>
  );
};

export function App() {
  return (
    <TaskPulseProvider>
      <MainLayout />
    </TaskPulseProvider>
  );
}

export default App;
