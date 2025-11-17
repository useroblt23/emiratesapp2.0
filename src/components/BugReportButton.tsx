import { useState } from 'react';
import { Bug, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { createBugReport, BugPriority } from '../services/bugReportService';

export default function BugReportButton() {
  const { currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState<BugPriority>('medium');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'general', label: 'General Issue' },
    { value: 'chat', label: 'Chat System' },
    { value: 'courses', label: 'Courses' },
    { value: 'ai-assistant', label: 'AI Assistant' },
    { value: 'cv-optimizer', label: 'CV Optimizer' },
    { value: 'open-days', label: 'Open Days' },
    { value: 'profile', label: 'Profile' },
    { value: 'authentication', label: 'Login/Registration' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      await createBugReport({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        reportedBy: currentUser.uid,
        reportedByName: currentUser.name,
        reportedByRole: currentUser.role
      });

      alert('Bug report submitted successfully! Our team will review it shortly.');
      setTitle('');
      setDescription('');
      setCategory('general');
      setPriority('medium');
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      alert('Failed to submit bug report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#D71921] to-[#B91518] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center gap-2"
        title="Report a Bug"
      >
        <Bug className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setIsOpen(false)}
            />

            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="sticky top-0 bg-gradient-to-r from-[#D71921] to-[#B91518] text-white p-4 sm:p-6 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Bug className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-xl sm:text-2xl font-bold">Report a Bug</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Bug Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71921] focus:outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71921] focus:outline-none transition"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Priority
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['low', 'medium', 'high', 'critical'] as BugPriority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition ${
                          priority === p
                            ? p === 'critical' ? 'bg-red-600 text-white' :
                              p === 'high' ? 'bg-orange-600 text-white' :
                              p === 'medium' ? 'bg-yellow-600 text-white' :
                              'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe the bug in detail. Include steps to reproduce if possible..."
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71921] focus:outline-none transition resize-none"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading || !title.trim() || !description.trim()}
                    className="flex-1 bg-gradient-to-r from-[#D71921] to-[#B91518] text-white py-3 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm sm:text-base">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span className="text-sm sm:text-base">Submit Report</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
