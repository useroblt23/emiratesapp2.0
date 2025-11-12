import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp, AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';
import UsersControl from './pages/governor/UsersControl';
import GlobalAlerts from './pages/governor/GlobalAlerts';
import MaintenanceMode from './pages/governor/MaintenanceMode';
import PlaceholderPage from './pages/PlaceholderPage';
import { Users, Upload, FolderOpen, MessagesSquare, BarChart3 } from 'lucide-react';

function MaintenanceScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EADBC8] via-[#F5E6D3] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <h1 className="text-3xl font-bold text-[#1C1C1C] mb-4">System Maintenance</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentUser, maintenanceMode, maintenanceMessage } = useApp();

  if (maintenanceMode && currentUser?.role !== 'governor') {
    return <MaintenanceScreen message={maintenanceMessage} />;
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/support" element={<SupportPage />} />

        <Route
          path="/students"
          element={<PlaceholderPage icon={Users} title="Students" description="View and manage your student roster" />}
        />
        <Route
          path="/upload"
          element={<PlaceholderPage icon={Upload} title="Upload Content" description="Upload courses and educational materials" />}
        />

        {currentUser.role === 'governor' && (
          <>
            <Route path="/users" element={<UsersControl />} />
            <Route path="/alerts" element={<GlobalAlerts />} />
            <Route path="/maintenance" element={<MaintenanceMode />} />
            <Route
              path="/hub"
              element={<PlaceholderPage icon={FolderOpen} title="Hub Management" description="Manage educational content library" />}
            />
            <Route
              path="/conversations"
              element={<PlaceholderPage icon={MessagesSquare} title="Conversations Control" description="Monitor and manage platform conversations" />}
            />
            <Route
              path="/analytics"
              element={<PlaceholderPage icon={BarChart3} title="Analytics" description="View platform statistics and insights" />}
            />
          </>
        )}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
