import { Bell, ChevronDown, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import SystemAnnouncementBanner from '../SystemAnnouncementBanner';

export default function Navbar() {
  const { currentUser, logout } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isCommunityPage = location.pathname === '/chat';

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return unsubscribe;
  }, [currentUser]);

  if (!currentUser) return null;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/courses', label: 'Courses' },
    { path: '/chat', label: 'Chat' },
    { path: '/my-progress', label: 'My Progress' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/profile', label: 'Profile' },
    { path: '/support', label: 'Support' },
  ];

  return (
    <>
      <nav className="liquid-navbar sticky top-0 z-40">
        <SystemAnnouncementBanner />
        <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/dashboard" className="flex items-center">
              <img
                src="/Crews (2).png"
                alt="The Crew Academy"
                className="h-16 md:h-24 w-auto object-contain"
              />
            </Link>

            <div className="flex items-center gap-2 md:gap-4">
              {isCommunityPage && (
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden relative p-1.5 liquid-button-secondary rounded-full transition-all"
                >
                  {showMobileMenu ? (
                    <X className="w-4 h-4 text-gray-900" />
                  ) : (
                    <Menu className="w-4 h-4 text-gray-900" />
                  )}
                </button>
              )}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-1.5 md:p-2 liquid-button-secondary rounded-full transition-all"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-900" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D71920] text-white rounded-full text-xs font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1 md:gap-3 liquid-button-secondary rounded-3xl px-2 md:px-3 py-1.5 md:py-2 transition-all"
              >
                <img
                  src={currentUser.photoURL || `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2260%22 dy=%2210.5rem%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3E${currentUser.name?.[0] || 'U'}%3C/text%3E%3C/svg%3E`}
                  alt={currentUser.name}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border-2 border-white/20"
                />
                <div className="text-left hidden md:block">
                  <div className="text-sm font-bold liquid-text-primary">{currentUser.name}</div>
                  <div className="text-xs liquid-text-secondary capitalize">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-900" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute right-0 mt-2 w-56 liquid-crystal-strong py-2 liquid-text-primary"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/50 rounded-xl mx-2 transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        alert('Settings page coming soon!');
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/50 rounded-xl mx-2 transition-all w-full text-left"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-2 border-white/20" />
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('/');
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-50/50 rounded-xl mx-2 transition-all w-full text-left text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <AnimatePresence>
      {showMobileMenu && isCommunityPage && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-64 liquid-navbar z-50 md:hidden shadow-2xl"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 liquid-button-secondary rounded-full"
                >
                  <X className="w-5 h-5 text-gray-900" />
                </button>
              </div>

              <nav className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`block px-4 py-3 rounded-xl transition-all ${
                      location.pathname === link.path
                        ? 'glass-primary text-gray-900 font-semibold'
                        : 'glass-button-secondary text-gray-700 hover:glass-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-white/20">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    logout();
                    navigate('/');
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl glass-button-secondary text-red-600 hover:bg-red-50/50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
