import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { currentUser, logout } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!currentUser) return null;

  return (
    <nav className="bg-gradient-to-r from-[#D71920] to-[#B91518] text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#B9975B] rounded-lg flex items-center justify-center font-bold text-lg">
              EA
            </div>
            <h1 className="text-xl font-bold">Emirates Academy</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-white/10 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#B9975B] rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 hover:bg-white/10 rounded-lg px-3 py-2 transition"
              >
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                />
                <div className="text-left hidden md:block">
                  <div className="text-sm font-bold">{currentUser.name}</div>
                  <div className="text-xs text-red-100 capitalize">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 text-[#1C1C1C]"
                  >
                    <a
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#EADBC8] transition"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#EADBC8] transition"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </a>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition w-full text-left text-red-600"
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
