import { useState, useEffect } from 'react';
import { Power, AlertTriangle, Check, X, Clock, Shield, Terminal } from 'lucide-react';
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
      alert('All fields are required');
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
    } catch (error) {
      console.error('Error activating shutdown:', error);
      alert('Failed to activate shutdown. Check console for details.');
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
    } catch (error) {
      console.error('Error deactivating shutdown:', error);
      alert('Failed to deactivate shutdown. Check console for details.');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 sm:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8 pb-6 border-b border-red-900/30">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50"></div>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-500" strokeWidth={1.5} />
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight uppercase">Emergency Shutdown Control</h1>
                <p className="text-gray-400 text-sm font-mono mt-1">SYSTEM-WIDE FEATURE MANAGEMENT INTERFACE</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 glass-light border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-300 font-medium">
                <span className="text-yellow-500 font-bold">WARNING:</span> Activating a shutdown will immediately block all users from accessing the selected feature. Use with extreme caution.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-light border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-black/40">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Feature ID
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Shutdown Reason
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Scheduled Restore
                </th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {allFeatures.map((featureKey, index) => {
                const shutdown = shutdowns[featureKey];
                const isShutdown = shutdown?.isShutdown || false;

                return (
                  <motion.tr
                    key={featureKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Terminal className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-bold text-white font-mono">{FEATURE_LABELS[featureKey]}</div>
                          <div className="text-xs text-gray-500 font-mono">{featureKey}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {isShutdown ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-950/50 border border-red-900/50 rounded text-xs font-bold text-red-400 uppercase tracking-wide">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                          OFFLINE
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-950/50 border border-green-900/50 rounded text-xs font-bold text-green-400 uppercase tracking-wide">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          ONLINE
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {isShutdown && shutdown ? (
                        <div className="text-sm text-gray-300 max-w-xs truncate" title={shutdown.shutdownReason}>
                          {shutdown.shutdownReason}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">—</div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {isShutdown && shutdown?.maintenanceEndsAt ? (
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {shutdown.maintenanceEndsAt.toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">—</div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isShutdown ? (
                          <button
                            onClick={() => openDeactivateModal(featureKey)}
                            className="px-4 py-2 bg-green-900/30 hover:bg-green-900/50 border border-green-700/50 text-green-400 rounded text-xs font-bold uppercase tracking-wide transition-all"
                          >
                            <span className="flex items-center gap-2">
                              <Power className="w-3.5 h-3.5" />
                              Restore
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openActivateModal(featureKey)}
                            className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 text-red-400 rounded text-xs font-bold uppercase tracking-wide transition-all"
                          >
                            <span className="flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Shutdown
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showActivateModal && selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => !loading && setShowActivateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-gradient-to-br from-gray-900 to-gray-800 border border-red-900/50 rounded-lg p-8 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-700">
                <div className="w-12 h-12 rounded-lg bg-red-900/30 border border-red-700/50 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Initiate Feature Shutdown</h2>
                  <p className="text-gray-400 text-sm font-mono mt-1">TARGET: {FEATURE_LABELS[selectedFeature]}</p>
                </div>
              </div>

              <div className="space-y-5 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Shutdown Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shutdownReason}
                    onChange={(e) => setShutdownReason(e.target.value)}
                    placeholder="e.g., Critical security vulnerability detected"
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white placeholder-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    User-Facing Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="Message displayed to users during shutdown..."
                    rows={4}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white placeholder-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none resize-none font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Restore Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={maintenanceEndDate}
                      onChange={(e) => setMaintenanceEndDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Restore Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={maintenanceEndTime}
                      onChange={(e) => setMaintenanceEndTime(e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none font-mono text-sm"
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
                  className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded font-bold uppercase text-sm tracking-wide hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivate}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-900/50 border border-red-700 text-red-400 rounded font-bold uppercase text-sm tracking-wide hover:bg-red-900/70 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      Initiating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Execute Shutdown
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
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => !loading && setShowDeactivateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-green-900/50 rounded-lg p-8 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-700">
                <div className="w-12 h-12 rounded-lg bg-green-900/30 border border-green-700/50 flex items-center justify-center">
                  <Power className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Restore Feature Access</h2>
                  <p className="text-gray-400 text-sm font-mono mt-1">TARGET: {FEATURE_LABELS[selectedFeature]}</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                This will immediately restore user access to <span className="text-white font-bold">{FEATURE_LABELS[selectedFeature]}</span>. The feature will become operational across all connected clients.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded font-bold uppercase text-sm tracking-wide hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-900/50 border border-green-700 text-green-400 rounded font-bold uppercase text-sm tracking-wide hover:bg-green-900/70 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                      Restoring...
                    </span>
                  ) : (
                    'Confirm Restore'
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
