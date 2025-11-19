import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  HelpCircle,
  Users,
  GraduationCap,
  Brain,
  Plane,
  Briefcase,
  Crown,
  Lock,
  Calendar,
  UserCircle,
  Zap,
  Shield,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { checkFeatureAccess, Feature } from '../../utils/featureAccess';
import UpgradePrompt from '../UpgradePrompt';

export default function Sidebar() {
  const { currentUser } = useApp();
  const location = useLocation();
  const [upgradePrompt, setUpgradePrompt] = useState<{ isOpen: boolean; feature: Feature; featureName: string } | null>(null);

  if (!currentUser) return null;

  const getStudentLinks = () => {
    const aiTrainerAccess = checkFeatureAccess(currentUser, 'ai-trainer');
    const simulatorAccess = checkFeatureAccess(currentUser, 'simulator');
    const recruitersAccess = checkFeatureAccess(currentUser, 'recruiters');
    const openDaysAccess = checkFeatureAccess(currentUser, 'opendays');
    const chatAccess = checkFeatureAccess(currentUser, 'chat');

    const baseLinks = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', feature: null },
      { path: '/my-progress', icon: TrendingUp, label: 'My Progress', feature: null },
      { path: '/courses', icon: BookOpen, label: 'Courses', feature: null },
      {
        path: '/ai-trainer',
        icon: Brain,
        label: 'AI Trainer',
        locked: !aiTrainerAccess.allowed,
        feature: 'ai-trainer' as Feature,
        badge: aiTrainerAccess.allowed && currentUser.plan === 'vip' ? 'VIP' : undefined
      },
      {
        path: '/open-day',
        icon: Plane,
        label: 'Open Day Sim',
        locked: !simulatorAccess.allowed,
        feature: 'simulator' as Feature,
        badge: simulatorAccess.allowed && currentUser.plan === 'vip' ? 'VIP' : undefined
      },
      {
        path: '/chat',
        icon: MessageCircle,
        label: 'Chat',
        locked: !chatAccess.allowed,
        feature: 'chat' as Feature,
        badge: chatAccess.allowed && currentUser.plan !== 'free' ? 'PRO' : undefined
      },
      {
        path: '/recruiters',
        icon: Briefcase,
        label: 'Recruiters',
        locked: !recruitersAccess.allowed,
        feature: 'recruiters' as Feature,
        badge: recruitersAccess.allowed && currentUser.plan !== 'free' ? 'PRO' : undefined
      },
      {
        path: '/open-days',
        icon: Calendar,
        label: 'Open Days',
        locked: !openDaysAccess.allowed,
        feature: 'opendays' as Feature,
        badge: openDaysAccess.allowed && currentUser.plan !== 'free' ? 'PRO' : undefined
      },
      { path: '/leaderboard', icon: Trophy, label: 'Leaderboard', feature: null },
      { path: '/profile', icon: UserCircle, label: 'Profile', feature: null },
      { path: '/support', icon: HelpCircle, label: 'Support', feature: null },
      { path: '/upgrade', icon: Crown, label: 'Upgrade Plan', highlight: currentUser.plan !== 'vip', feature: null },
      ...(currentUser.role !== 'student' ? [{ path: '/support-manager', icon: MessageCircle, label: 'Support Manager', feature: null }] : [])
    ];

    return baseLinks;
  };

  const studentLinks = currentUser.role === 'student' ? getStudentLinks() : [];

  const mentorLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/coach-dashboard', icon: GraduationCap, label: 'Coach Dashboard' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/recruiters', icon: Briefcase, label: 'Recruiters' },
    { path: '/open-days', icon: Calendar, label: 'Open Days' },
    { path: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  const governorLinks = [
    { path: '/governor/nexus', icon: Zap, label: 'Control Nexus', highlight: true },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/coach-dashboard', icon: GraduationCap, label: 'Coach Dashboard' },
    { path: '/ai-trainer', icon: Brain, label: 'AI Trainer', badge: 'ALL' },
    { path: '/open-day', icon: Plane, label: 'Open Day Sim', badge: 'ALL' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/recruiters', icon: Briefcase, label: 'Recruiters' },
    { path: '/open-days', icon: Calendar, label: 'Open Days' },
    { path: '/support-manager', icon: MessageCircle, label: 'Support Manager' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/profile', icon: UserCircle, label: 'Profile' },
    { path: '/support', icon: HelpCircle, label: 'Support' },
  ];

  const links =
    currentUser.role === 'governor' ? governorLinks :
    currentUser.role === 'mentor' ? mentorLinks :
    studentLinks;

  return (
    <aside className="w-full md:w-64 glass-sidebar border-b md:border-b-0 md:border-r border-white/20 md:h-[calc(100vh-5rem)] md:sticky md:top-20 overflow-y-auto">
      <div className="p-3 md:p-4">
        {currentUser.role === 'governor' && (
          <div className="mb-3 md:mb-4 p-2 md:p-3 glass-primary text-white rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm font-bold">Governor Access</span>
            </div>
            <p className="text-xs text-gray-300 hidden md:block">Full system control</p>
          </div>
        )}

        <nav className="flex md:flex-col gap-1 md:space-y-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            const isLocked = 'locked' in link && link.locked;
            const badge = 'badge' in link ? link.badge : undefined;
            const highlight = 'highlight' in link && link.highlight;

            return (
              <Link
                key={link.path}
                to={isLocked ? '#' : link.path}
                onClick={(e) => {
                  if (isLocked && 'feature' in link && link.feature) {
                    e.preventDefault();
                    setUpgradePrompt({ isOpen: true, feature: link.feature, featureName: link.label });
                  }
                }}
                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-2xl transition-all whitespace-nowrap md:whitespace-normal relative parallax-hover ${
                  isActive
                    ? 'glass-primary text-white shadow-xl'
                    : highlight
                    ? 'glass-primary text-white font-bold'
                    : isLocked
                    ? 'text-gray-400 glass-ultra-thin opacity-60'
                    : 'text-gray-700 glass-button-secondary'
                }`}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span className="font-medium text-xs md:text-base flex-1">{link.label}</span>
                {isLocked && <Lock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />}
                {badge && (
                  <span className={`px-2 py-0.5 text-[10px] md:text-xs font-bold rounded-full ${
                    badge === 'VIP'
                      ? 'bg-gradient-to-r from-[#3D4A52] to-[#2A3439] text-white'
                      : 'bg-gradient-to-r from-[#FF3B3F] to-[#E6282C] text-white'
                  }`}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      {upgradePrompt && (
        <UpgradePrompt
          isOpen={upgradePrompt.isOpen}
          onClose={() => setUpgradePrompt(null)}
          requiredPlan={checkFeatureAccess(currentUser, upgradePrompt.feature).requiresPlan || 'pro'}
          message={checkFeatureAccess(currentUser, upgradePrompt.feature).message || ''}
          feature={upgradePrompt.featureName}
        />
      )}
    </aside>
  );
}
