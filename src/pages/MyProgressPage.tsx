import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, BookOpen, Award, PlayCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  getUserProgress,
  getAllModulesProgress,
  getModuleLessons,
  UserProgress,
  ModuleProgress
} from '../services/progressService';
import { getAllModules, Module } from '../services/moduleService';
import ModuleProgressCard from '../components/ModuleProgressCard';

export default function MyProgressPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedLessons: 0,
    totalLessons: 0,
    progressPercentage: 0,
    lastActive: '',
    recentActivity: []
  });
  const [modules, setModules] = useState<Module[]>([]);
  const [modulesProgress, setModulesProgress] = useState<Map<string, ModuleProgress>>(new Map());
  const [modulesLessons, setModulesLessons] = useState<Map<string, any[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [courseId] = useState('global-modules');

  useEffect(() => {
    if (currentUser) {
      loadProgressData();
    }
  }, [currentUser]);

  const loadProgressData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const progress = await getUserProgress(currentUser.uid);
      setUserProgress(progress);

      const modulesList = await getAllModules();

      setModules(modulesList);

      const progressMap = await getAllModulesProgress(currentUser.uid, 'global-modules');
      setModulesProgress(progressMap);

      const lessonsMap = new Map<string, any[]>();
      for (const module of modulesList) {
        const lessons = await getModuleLessons('global-modules', module.id);
        lessonsMap.set(module.id, lessons);
      }
      setModulesLessons(lessonsMap);

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lessonId: string, moduleId: string) => {
    navigate(`/lesson/global-modules/${moduleId}/${lessonId}`);
  };

  const handleContinueLearning = () => {
    if (userProgress.recentActivity.length > 0) {
      const lastActivity = userProgress.recentActivity[0];
      navigate(`/lesson/global-modules/${lastActivity.moduleId}/${lastActivity.lessonId}`);
    } else {
      navigate('/courses');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D71920] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Progress</h1>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#D71920] to-[#B91518] rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Overall Progress</p>
                <p className="text-3xl font-bold">{userProgress.progressPercentage}%</p>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${userProgress.progressPercentage}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lessons Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {userProgress.completedLessons}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              out of {userProgress.totalLessons} total lessons
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Modules Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Array.from(modulesProgress.values()).filter(p => p.progressPercentage === 100).length}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              out of {modules.length} total modules
            </p>
          </motion.div>
        </div>

        {userProgress.recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-[#EADBC8] to-[#F5E6D3] rounded-2xl p-8 mb-8 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Continue Where You Left Off</h2>
                <p className="text-gray-700 mb-4">
                  Last lesson: <span className="font-semibold">{userProgress.recentActivity[0].lessonTitle}</span>
                </p>
                <button
                  onClick={handleContinueLearning}
                  className="flex items-center gap-2 px-6 py-3 bg-[#D71920] hover:bg-[#B91518] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition"
                >
                  <PlayCircle className="w-5 h-5" />
                  Continue Learning
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <PlayCircle className="w-24 h-24 text-[#D71920] opacity-20" />
            </div>
          </motion.div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Modules</h2>
          <p className="text-gray-600">Expand each module to see your lesson progress</p>
        </div>

        <div className="space-y-6">
          {modules.map((module, index) => {
            const progress = modulesProgress.get(module.id) || {
              completedLessons: 0,
              totalLessons: module.lessonCount || 0,
              progressPercentage: 0
            };

            const lessons = modulesLessons.get(module.id) || [];

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <ModuleProgressCard
                  moduleId={module.id}
                  moduleTitle={module.title}
                  completedLessons={progress.completedLessons}
                  totalLessons={progress.totalLessons}
                  progressPercentage={progress.progressPercentage}
                  lessons={lessons}
                  userId={currentUser!.uid}
                 courseId="global-modules"
                  onLessonClick={(lessonId) => handleLessonClick(lessonId, module.id)}
                />
              </motion.div>
            );
          })}

          {modules.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Modules Available</h3>
              <p className="text-gray-600 mb-6">
                Start your learning journey by exploring available courses.
              </p>
              <button
                onClick={() => navigate('/courses')}
                className="px-6 py-3 bg-[#D71920] hover:bg-[#B91518] text-white rounded-xl font-bold transition"
              >
                Browse Courses
              </button>
            </div>
          )}
        </div>

        {userProgress.recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {userProgress.recentActivity.slice(0, 10).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => handleLessonClick(activity.lessonId, activity.moduleId)}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{activity.lessonTitle}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
