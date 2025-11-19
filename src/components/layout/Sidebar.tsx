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
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { currentUser } = useApp();
  const location = useLocation();
  const [upgradePrompt, setUpgradePrompt] = useState<{ isOpen: boolean; feature: Feature; featureName: string } | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

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
        feature: 'ai-trainer' as Feature
      },
      {
        path: '/open-day',
        icon: Plane,
        label: 'Open Day Sim',
        locked: !simulatorAccess.allowed,
        feature: 'simulator' as Feature
      },
      {
        path: '/chat',
        icon: MessageCircle,
        label: 'Chat',
        locked: !chatAccess.allowed,
        feature: 'chat' as Feature
      },
      {
        path: '/recruiters',
        icon: Briefcase,
        label: 'Recruiters',
        locked: !recruitersAccess.allowed,
        feature: 'recruiters' as Feature
      },
      {
        path: '/open-days',
        icon: Calendar,
        label: 'Open Days',
        locked: !openDaysAccess.allowed,
        feature: 'opendays' as Feature
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
    <>
      {/* Mobile Sidebar */}
      <aside className="w-full md:hidden liquid-sidebar border-b border-white/20">
        <div className="p-3">
          <nav className="flex gap-1 overflow-x-auto pb-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              const isLocked = 'locked' in link && link.locked;

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
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'glass-primary text-gray-900 shadow-xl'
                      : isLocked
                      ? 'text-gray-400 glass-ultra-thin opacity-60'
                      : 'text-gray-700 glass-button-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium text-xs">{link.label}</span>
                  {isLocked && <Lock className="w-3 h-3 flex-shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Desktop Collapsible Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? '4.5rem' : '16rem'
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        className="hidden md:block liquid-sidebar border-r border-white/20 h-[calc(100vh-5rem)] sticky top-20 overflow-hidden"
      >
      <div className="p-3 h-full flex flex-col">
        {currentUser.role === 'governor' && (
          <motion.div
            initial={false}
            className="mb-3 p-3 glass-primary text-gray-900 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className={`flex items-center gap-2 mb-1 ${isCollapsed ? 'justify-center' : ''}`}>
              <Shield className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="text-sm font-bold whitespace-nowrap"
                  >
                    Governor Access
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="text-xs text-gray-300"
                >
                  Full system control
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400/20 scrollbar-track-transparent py-1">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl relative group ${
                  isActive
                    ? 'glass-primary text-gray-900'
                    : highlight
                    ? 'glass-primary text-gray-900 font-bold'
                    : isLocked
                    ? 'text-gray-400 glass-ultra-thin opacity-60'
                    : 'text-gray-700 glass-button-secondary'
                } ${isCollapsed ? 'justify-center' : ''}`}
                style={{
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : ''}`} />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="font-medium text-sm flex-1 whitespace-nowrap"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  {!isCollapsed && isLocked && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  {!isCollapsed && badge && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        badge === 'VIP'
                          ? 'bg-gradient-to-r from-[#3D4A52] to-[#2A3439] text-white'
                          : 'bg-gradient-to-r from-[#FF3B3F] to-[#E6282C] text-white'
                      }`}
                    >
                      {badge}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-2xl pointer-events-none whitespace-nowrap z-50"
                  >
                    {link.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.aside>

    {upgradePrompt && (
      <UpgradePrompt
        isOpen={upgradePrompt.isOpen}
        onClose={() => setUpgradePrompt(null)}
        requiredPlan={checkFeatureAccess(currentUser, upgradePrompt.feature).requiresPlan || 'pro'}
        message={checkFeatureAccess(currentUser, upgradePrompt.feature).message || ''}
        feature={upgradePrompt.featureName}
      />
    )}
    </>
  );
}
