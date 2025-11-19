import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import PlanBadge from '../PlanBadge';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Navbar() {
  const { currentUser, logout } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

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

  return (
    <nav className="glass-nav sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/dashboard" className="flex items-center">
            <img
              src="/logo.png"
              alt="The Crew Academy"
              className="h-12 md:h-16 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:block">
              <PlanBadge plan={currentUser.plan} size="sm" />
            </div>

            <button
              onClick={() => navigate('/notifications')}
              className="relative p-1.5 md:p-2 glass-button-secondary rounded-full transition-all"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D71920] text-white rounded-full text-xs font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1 md:gap-3 glass-button-secondary rounded-3xl px-2 md:px-3 py-1.5 md:py-2 transition-all"
              >
                <img
                  src={currentUser.photoURL || `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2260%22 dy=%2210.5rem%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3E${currentUser.name?.[0] || 'U'}%3C/text%3E%3C/svg%3E`}
                  alt={currentUser.name}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="text-left hidden md:block">
                  <div className="text-sm font-bold text-gray-800">{currentUser.name}</div>
                  <div className="text-xs text-gray-600 capitalize">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-700" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute right-0 mt-2 w-56 glass-modal py-2 text-[#1C1C1C]"
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
                    <hr className="my-2 border-gray-200" />
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
  );
}
