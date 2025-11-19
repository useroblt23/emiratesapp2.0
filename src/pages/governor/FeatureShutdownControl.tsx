import { useState, useEffect } from 'react';
import { Power, PowerOff, AlertTriangle, Check, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  FeatureKey,
  FeatureShutdown,
  FEATURE_LABELS,
  subscribeToFeatureShutdowns,
  activateFeatureShutdown,
  deactivateFeatureShutdown
} from '../../services/featureShutdownService';

export default function FeatureShutdownControl() {
  const { currentUser } = useApp();
  const [shutdowns, setShutdowns] = useState<Record<string, FeatureShutdown>>({});
  const [selectedFeature, setSelectedFeature] = useState<FeatureKey | null>(null);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [shutdownReason, setShutdownReason] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceEndDate, setMaintenanceEndDate] = useState('');
  const [maintenanceEndTime, setMaintenanceEndTime] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToFeatureShutdowns((data) => {
      setShutdowns(data);
    });

    return () => unsubscribe();
  }, []);

  const allFeatures: FeatureKey[] = [
    'chat',
    'modules',
    'submodules',
    'courses',
    'videos',
    'quizzes',
    'exams',
    'notifications',
    'certificateSystem',
    'communityChat',
    'pointsSystem',
    'fileUpload',
    'profileEdit'
  ];

  const handleActivate = async () => {
    if (!selectedFeature || !currentUser) return;

    if (!shutdownReason.trim() || !maintenanceMessage.trim() || !maintenanceEndDate || !maintenanceEndTime) {
      alert('Please fill in all fields');
      return;
    }

    const endDateTime = new Date(`${maintenanceEndDate}T${maintenanceEndTime}`);
    if (endDateTime <= new Date()) {
      alert('Maintenance end time must be in the future');
      return;
    }

    setLoading(true);
    try {
      await activateFeatureShutdown(
        selectedFeature,
        shutdownReason.trim(),
        maintenanceMessage.trim(),
        endDateTime,
        currentUser.id
      );

      setShowActivateModal(false);
      setSelectedFeature(null);
      resetForm();
      alert(`${FEATURE_LABELS[selectedFeature]} shutdown activated successfully!`);
    } catch (error) {
      console.error('Error activating shutdown:', error);
      alert('Failed to activate shutdown. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedFeature || !currentUser) return;

    setLoading(true);
    try {
      await deactivateFeatureShutdown(selectedFeature, currentUser.id);

      setShowDeactivateModal(false);
      setSelectedFeature(null);
      alert(`${FEATURE_LABELS[selectedFeature]} shutdown deactivated successfully!`);
    } catch (error) {
      console.error('Error deactivating shutdown:', error);
      alert('Failed to deactivate shutdown. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShutdownReason('');
    setMaintenanceMessage('');
    setMaintenanceEndDate('');
    setMaintenanceEndTime('');
  };

  const openActivateModal = (feature: FeatureKey) => {
    setSelectedFeature(feature);
    setShowActivateModal(true);
  };

  const openDeactivateModal = (feature: FeatureKey) => {
    setSelectedFeature(feature);
    setShowDeactivateModal(true);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
          <PowerOff className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feature Shutdown Control</h1>
          <p className="text-gray-600">Emergency maintenance controls for all major features</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {allFeatures.map((featureKey) => {
          const shutdown = shutdowns[featureKey];
          const isShutdown = shutdown?.isShutdown || false;

          return (
            <motion.div
              key={featureKey}
              layout
              className="glass-light rounded-2xl p-6 border-2 border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {FEATURE_LABELS[featureKey]}
                  </h3>
                  <div className="flex items-center gap-2">
                    {isShutdown ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <PowerOff className="w-3 h-3" />
                        SHUTDOWN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <Power className="w-3 h-3" />
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isShutdown && shutdown && (
                <div className="space-y-3 mb-4">
                  <div className="p-3 glass-bubble rounded-xl">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Reason:</p>
                    <p className="text-sm text-gray-800 line-clamp-2">{shutdown.shutdownReason}</p>
                  </div>
                  {shutdown.maintenanceEndsAt && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Ends: {shutdown.maintenanceEndsAt.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {isShutdown ? (
                  <button
                    onClick={() => openDeactivateModal(featureKey)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Power className="w-4 h-4" />
                      Reactivate
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => openActivateModal(featureKey)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <PowerOff className="w-4 h-4" />
                      Shutdown
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showActivateModal && selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !loading && setShowActivateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-modal w-full max-w-2xl p-6 sm:p-8 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Activate Feature Shutdown</h2>
                  <p className="text-gray-600">For: {FEATURE_LABELS[selectedFeature]}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shutdown Reason *
                  </label>
                  <input
                    type="text"
                    value={shutdownReason}
                    onChange={(e) => setShutdownReason(e.target.value)}
                    placeholder="e.g., Critical security update required"
                    className="w-full px-4 py-3 glass-light border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maintenance Message *
                  </label>
                  <textarea
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="Message to display to users..."
                    rows={4}
                    className="w-full px-4 py-3 glass-light border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={maintenanceEndDate}
                      onChange={(e) => setMaintenanceEndDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 glass-light border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={maintenanceEndTime}
                      onChange={(e) => setMaintenanceEndTime(e.target.value)}
                      className="w-full px-4 py-3 glass-light border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowActivateModal(false);
                    resetForm();
                  }}
                  disabled={loading}
                  className="flex-1 px-6 py-3 glass-light border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivate}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-orange-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Activating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      Activate Shutdown
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeactivateModal && selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !loading && setShowDeactivateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-modal w-full max-w-md p-6 sm:p-8 rounded-3xl text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Power className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Deactivate Shutdown?</h2>
              <p className="text-gray-600 mb-6">
                This will restore access to <strong>{FEATURE_LABELS[selectedFeature]}</strong> immediately.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 glass-light border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deactivating...
                    </span>
                  ) : (
                    'Deactivate'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
