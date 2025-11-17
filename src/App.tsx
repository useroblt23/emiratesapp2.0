import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp, AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';
import SupportChatManagerPage from './pages/SupportChatManagerPage';
import CoachDashboard from './pages/CoachDashboard';
import GovernorControlNexus from './pages/governor/GovernorControlNexus';
import PlaceholderPage from './pages/PlaceholderPage';
import NotificationsPage from './pages/NotificationsPage';
import AITrainerPage from './pages/AITrainerPage';
import OpenDaySimulatorPage from './pages/OpenDaySimulatorPage';
import RecruiterListPage from './pages/RecruiterListPage';
import RecruitersPage from './pages/RecruitersPage';
import OpenDaysPage from './pages/OpenDaysPage';
import UpgradePlanPage from './pages/UpgradePlanPage';
import CourseViewerPage from './pages/CourseViewerPage';
import DocumentationPage from './pages/DocumentationPage';
import StudentsPage from './pages/StudentsPage';

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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseViewerPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/ai-trainer" element={<AITrainerPage />} />
        <Route path="/open-day" element={<OpenDaySimulatorPage />} />
        <Route path="/recruiters" element={<RecruitersPage />} />
        <Route path="/open-days" element={<OpenDaysPage />} />
        <Route path="/upgrade" element={<UpgradePlanPage />} />

        <Route path="/students" element={<StudentsPage />} />

        {(currentUser.role === 'mentor' || currentUser.role === 'governor') && (
          <Route path="/coach-dashboard" element={<CoachDashboard />} />
        )}

        {currentUser.role !== 'student' && (
          <Route path="/support-manager" element={<SupportChatManagerPage />} />
        )}

        {(currentUser.role === 'governor' || currentUser.role === 'mentor') && (
          <>
            <Route path="/governor/nexus" element={<GovernorControlNexus />} />
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
