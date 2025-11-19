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
  TrendingUp,
  ChevronLeft,
  ChevronRight
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
          width: isCollapsed ? '5rem' : '16rem'
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        className="hidden md:block liquid-sidebar border-r border-white/20 h-[calc(100vh-5rem)] sticky top-20 overflow-hidden"
      >
      <div className="p-4 h-full flex flex-col">
        {currentUser.role === 'governor' && (
          <motion.div
            initial={false}
            className="mb-4 p-3 glass-primary text-gray-900 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-bold whitespace-nowrap overflow-hidden"
                  >
                    Governor Access
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-gray-300 overflow-hidden"
                >
                  Full system control
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400/20 scrollbar-track-transparent">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative parallax-hover group ${
                  isActive
                    ? 'glass-primary text-gray-900 shadow-xl'
                    : highlight
                    ? 'glass-primary text-gray-900 font-bold'
                    : isLocked
                    ? 'text-gray-400 glass-ultra-thin opacity-60'
                    : 'text-gray-700 glass-button-secondary'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium text-base flex-1 whitespace-nowrap overflow-hidden"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {!isCollapsed && isLocked && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Lock className="w-4 h-4 flex-shrink-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {!isCollapsed && badge && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        badge === 'VIP'
                          ? 'bg-gradient-to-r from-[#3D4A52] to-[#2A3439] text-gray-900'
                          : 'bg-gradient-to-r from-[#FF3B3F] to-[#E6282C] text-gray-900'
                      }`}
                    >
                      {badge}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 glass-primary text-gray-900 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                    {link.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass-button-secondary text-gray-700 transition-all hover:shadow-lg"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-medium text-base whitespace-nowrap overflow-hidden"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
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
