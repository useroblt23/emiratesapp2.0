import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SystemAnnouncementBanner() {
  const { systemAnnouncement } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  console.log('SystemAnnouncementBanner - systemAnnouncement:', systemAnnouncement);

  if (!systemAnnouncement.active || isDismissed) return null;

  const getAnnouncementConfig = () => {
    switch (systemAnnouncement.type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgGradient: 'from-green-500/90 to-emerald-600/90',
          iconColor: 'text-white',
          borderColor: 'border-green-400/50',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgGradient: 'from-yellow-500/90 to-orange-600/90',
          iconColor: 'text-white',
          borderColor: 'border-yellow-400/50',
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgGradient: 'from-red-500/90 to-rose-600/90',
          iconColor: 'text-white',
          borderColor: 'border-red-400/50',
        };
      default:
        return {
          icon: Info,
          bgGradient: 'from-blue-500/90 to-indigo-600/90',
          iconColor: 'text-white',
          borderColor: 'border-blue-400/50',
        };
    }
  };

  const config = getAnnouncementConfig();
  const Icon = config.icon;

  return (
    <>
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`bg-gradient-to-r ${config.bgGradient} rounded-full px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1.5 md:gap-2 w-full cursor-pointer hover:opacity-90 transition-opacity`}
            style={{ originX: 0 }}
            onClick={() => setIsExpanded(true)}
          >
            <div className={`${config.iconColor} flex-shrink-0`}>
              <Icon className="w-3 h-3 md:w-4 md:h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-[10px] md:text-xs truncate">
                {systemAnnouncement.message}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-0.5 transition flex-shrink-0"
              aria-label="Dismiss announcement"
            >
              <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className={`bg-gradient-to-br ${config.bgGradient} rounded-2xl shadow-2xl p-6 md:p-8`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`${config.iconColor} flex-shrink-0`}>
                    <Icon className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl md:text-2xl mb-2">System Announcement</h3>
                    <p className="text-white/90 text-sm md:text-base leading-relaxed">
                      {systemAnnouncement.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition flex-shrink-0"
                    aria-label="Close announcement"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setIsExpanded(false);
                      setIsDismissed(true);
                    }}
                    className="px-4 py-2 bg-white hover:bg-white/90 text-gray-900 rounded-lg font-semibold transition"
                  >
                    Dismiss
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
