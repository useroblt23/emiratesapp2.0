import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { initializeDefaultCourses } from '../../../utils/initializeCourses';
import { initializeDefaultModules } from '../../../utils/initializeModules';

export default function DataInitializer() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    courses?: 'success' | 'error';
    modules?: 'success' | 'error';
    message?: string;
  }>({});

  const handleInitializeAll = async () => {
    setLoading(true);
    setStatus({});

    console.log('===== STARTING DATA INITIALIZATION =====');

    try {
      console.log('Step 1: Initializing courses...');
      await initializeDefaultCourses();
      console.log('✅ Courses initialized successfully');

      console.log('Step 2: Initializing modules...');
      await initializeDefaultModules();
      console.log('✅ Modules initialized successfully');

      setStatus({
        courses: 'success',
        modules: 'success',
        message: 'Database initialized with sample courses and modules!'
      });
    } catch (error: any) {
      console.error('❌ INITIALIZATION ERROR:', error);
      console.error('Error name:', error.name);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', JSON.stringify(error, null, 2));

      let errorMessage = error.message || 'Failed to initialize data';

      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Make sure you are logged in as Governor and Firestore rules are deployed.';
      }

      setStatus({
        courses: 'error',
        modules: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
      console.log('===== INITIALIZATION COMPLETE =====');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
          <Database className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Database Initialization</h2>
          <p className="text-xs text-slate-400">Populate with sample data</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              This will add 9 sample courses and 10 training modules to the database. Only runs if database is empty.
            </div>
          </div>
        </div>

        {status.message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-3 rounded-lg border flex items-center gap-2 ${
              status.courses === 'success'
                ? 'bg-green-900/20 border-green-700 text-green-300'
                : 'bg-red-900/20 border-red-700 text-red-300'
            }`}
          >
            {status.courses === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-sm">{status.message}</span>
          </motion.div>
        )}

        <button
          onClick={handleInitializeAll}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-slate-100 rounded-lg font-semibold transition border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Initializing...' : 'Initialize Sample Data'}
        </button>
      </div>
    </motion.div>
  );
}
