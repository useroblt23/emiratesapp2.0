import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  HelpCircle,
  Users,
  Upload,
  Bell,
  Settings,
  BarChart3,
  Shield,
  FolderOpen,
  MessagesSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) return null;

  const studentLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/courses', icon: BookOpen, label: 'Courses' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/support', icon: HelpCircle, label: 'Support' },
  ];

  const mentorLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
  ];

  const governorLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/alerts', icon: Bell, label: 'Alerts' },
    { path: '/maintenance', icon: Settings, label: 'Maintenance' },
    { path: '/hub', icon: FolderOpen, label: 'Hub' },
    { path: '/conversations', icon: MessagesSquare, label: 'Conversations' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const links =
    currentUser.role === 'governor' ? governorLinks :
    currentUser.role === 'mentor' ? mentorLinks :
    studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="p-4">
        {currentUser.role === 'governor' && (
          <div className="mb-4 p-3 bg-gradient-to-r from-[#B9975B] to-[#D4AF37] text-white rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-bold">Governor Access</span>
            </div>
            <p className="text-xs text-yellow-100">Full system control</p>
          </div>
        )}

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D71920] to-[#B91518] text-white shadow-md'
                    : 'text-gray-700 hover:bg-[#EADBC8]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
