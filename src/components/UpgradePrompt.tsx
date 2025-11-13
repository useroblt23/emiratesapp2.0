import { X, Crown, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPlan: 'pro' | 'vip';
  message: string;
  feature: string;
}

export default function UpgradePrompt({ isOpen, onClose, requiredPlan, message, feature }: UpgradePromptProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleUpgrade = () => {
    onClose();
    navigate('/upgrade');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className={`p-6 ${requiredPlan === 'vip' ? 'bg-gradient-to-r from-[#FFD700] to-[#D4AF37]' : 'bg-gradient-to-r from-[#D71921] to-[#B91518]'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {requiredPlan === 'vip' ? (
                      <Crown className="w-8 h-8 text-[#000000]" />
                    ) : (
                      <Zap className="w-8 h-8 text-white" />
                    )}
                    <h3 className={`text-2xl font-bold ${requiredPlan === 'vip' ? 'text-[#000000]' : 'text-white'}`}>
                      Upgrade to {requiredPlan.toUpperCase()}
                    </h3>
                  </div>
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-full hover:bg-black hover:bg-opacity-10 transition ${requiredPlan === 'vip' ? 'text-[#000000]' : 'text-white'}`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  {feature} is Locked
                </h4>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>

                <div className={`rounded-xl p-4 mb-6 ${requiredPlan === 'vip' ? 'bg-gradient-to-r from-[#FFD700] to-[#D4AF37]' : 'bg-gradient-to-r from-[#D71921] to-[#B91518]'}`}>
                  <h5 className={`font-bold mb-2 ${requiredPlan === 'vip' ? 'text-[#000000]' : 'text-white'}`}>
                    {requiredPlan === 'vip' ? 'VIP Plan Benefits:' : 'Pro Plan Benefits:'}
                  </h5>
                  <ul className={`space-y-1 text-sm ${requiredPlan === 'vip' ? 'text-[#000000]' : 'text-white'}`}>
                    {requiredPlan === 'vip' ? (
                      <>
                        <li>• Access to all features including AI Trainer</li>
                        <li>• Open Day Simulator with real scenarios</li>
                        <li>• Priority support and mentorship</li>
                        <li>• Exclusive recruiter connections</li>
                        <li>• Advanced course materials</li>
                      </>
                    ) : (
                      <>
                        <li>• Access to recruiter profiles</li>
                        <li>• View and register for open days</li>
                        <li>• Private messaging with mentors</li>
                        <li>• Group chat access</li>
                        <li>• Premium course content</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={handleUpgrade}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold text-white hover:shadow-lg transition ${
                      requiredPlan === 'vip'
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-[#000000]'
                        : 'bg-gradient-to-r from-[#D71921] to-[#B91518]'
                    }`}
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
