import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useApp } from '../../context/AppContext';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { banners } = useApp();
  const location = useLocation();
  const isCommunityPage = location.pathname === '/chat';

  if (isCommunityPage) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />

        <AnimatePresence>
          {banners.map((banner) => (
            <motion.div
              key={banner.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="liquid-card-overlay text-white px-4 py-2 mx-4 rounded-xl"
            >
              <div className="max-w-7xl mx-auto flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold">{banner.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-hidden relative">
            {children}
          </main>
        </div>

        <div className="flex-shrink-0 z-20">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      <Navbar />

      <AnimatePresence>
        {banners.map((banner) => (
          <motion.div
            key={banner.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="liquid-card-overlay text-white px-4 py-2 mx-4 rounded-xl"
          >
            <div className="max-w-7xl mx-auto flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold">{banner.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row relative z-10 flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 w-full overflow-x-hidden pb-20">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto">
        <Footer />
      </div>
    </div>
  );
}
