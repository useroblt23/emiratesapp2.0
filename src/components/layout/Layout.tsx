import { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import SystemAnnouncementBanner from '../SystemAnnouncementBanner';
import { useApp } from '../../context/AppContext';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { banners } = useApp();

  return (
    <div className="min-h-screen relative flex flex-col">
      <Navbar />
      <SystemAnnouncementBanner />

      <AnimatePresence>
        {banners.map((banner) => (
          <motion.div
            key={banner.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="liquid-card-overlay text-white px-4 py-3 mx-4 my-2 rounded-2xl"
          >
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold">{banner.title}</p>
                <p className="text-sm opacity-90">Expires: {banner.expiration}</p>
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
