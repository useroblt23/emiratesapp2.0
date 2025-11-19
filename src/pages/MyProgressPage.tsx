import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, BookOpen, Award, PlayCircle, ChevronRight, CheckCircle, Folder, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getUserEnrollments, ModuleEnrollment } from '../services/enrollmentService';
import { getMainModule, getSubmodule } from '../services/mainModuleService';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface EnrolledModule {
  id: string;
  title: string;
  description: string;
  type: 'main_module' | 'submodule';
  coverImage: string;
  enrolled_at: string;
  progress_percentage: number;
  completed: boolean;
  last_accessed: string;
}

export default function MyProgressPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [enrolledModules, setEnrolledModules] = useState<EnrolledModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completed: 0,
    inProgress: 0,
    averageProgress: 0
  });

  useEffect(() => {
    if (currentUser) {
      loadProgressData();
    }
  }, [currentUser]);

  const loadProgressData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const enrollments = await getUserEnrollments(currentUser.uid);
      console.log('User enrollments:', enrollments);

      const modulesWithDetails = await Promise.all(
        enrollments.map(async (enrollment) => {
          try {
            if (enrollment.module_type === 'main_module') {
              const mainModule = await getMainModule(enrollment.module_id);
              if (mainModule) {
                return {
                  id: enrollment.module_id,
                  title: mainModule.title,
                  description: mainModule.description,
                  type: 'main_module' as const,
                  coverImage: mainModule.coverImage,
                  enrolled_at: enrollment.enrolled_at,
                  progress_percentage: enrollment.progress_percentage,
                  completed: enrollment.completed,
                  last_accessed: enrollment.last_accessed
                };
              }
            } else {
              const submodule = await getSubmodule(enrollment.module_id);
              if (submodule) {
                return {
                  id: enrollment.module_id,
                  title: submodule.title,
                  description: submodule.description,
                  type: 'submodule' as const,
                  coverImage: submodule.coverImage,
                  enrolled_at: enrollment.enrolled_at,
                  progress_percentage: enrollment.progress_percentage,
                  completed: enrollment.completed,
                  last_accessed: enrollment.last_accessed
                };
              }
            }
          } catch (error) {
            console.error('Error loading module details:', error);
          }
          return null;
        })
      );

      const validModules = modulesWithDetails.filter((m): m is EnrolledModule => m !== null);
      validModules.sort((a, b) => new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime());
      setEnrolledModules(validModules);

      const completed = validModules.filter(m => m.completed).length;
      const inProgress = validModules.filter(m => !m.completed && m.progress_percentage > 0).length;
      const avgProgress = validModules.length > 0
        ? Math.round(validModules.reduce((sum, m) => sum + m.progress_percentage, 0) / validModules.length)
        : 0;

      setStats({
        totalEnrolled: validModules.length,
        completed,
        inProgress,
        averageProgress: avgProgress
      });

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (moduleId: string, moduleType: 'main_module' | 'submodule') => {
    if (moduleType === 'main_module') {
      navigate(`/main-modules/${moduleId}`);
    } else {
      navigate(`/submodules/${moduleId}`);
    }
  };

  const handleContinueLearning = () => {
    if (enrolledModules.length > 0) {
      const lastModule = enrolledModules[0];
      handleModuleClick(lastModule.id, lastModule.type);
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
    <div className="min-h-screen bg-white pb-8">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Progress</h1>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#D71920] to-[#B91518] rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Average Progress</p>
                <p className="text-3xl font-bold">{stats.averageProgress}%</p>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${stats.averageProgress}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-widget p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Enrolled Modules</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalEnrolled}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Active enrollments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-widget p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Modules finished</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-widget p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <PlayCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.inProgress}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Currently learning</p>
          </motion.div>
        </div>

        {enrolledModules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-[#EADBC8] to-[#F5E6D3] rounded-2xl p-8 mb-8 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Continue Where You Left Off</h2>
                <p className="text-gray-700 mb-4">
                  Last module: <span className="font-semibold">{enrolledModules[0].title}</span>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Enrolled Modules</h2>
          <p className="text-gray-600">Click on any module to continue learning</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolledModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => handleModuleClick(module.id, module.type)}
              className="glass-course overflow-hidden transition cursor-pointer border border-transparent hover:border-[#D71920]"
            >
              <div className="relative">
                {module.coverImage ? (
                  <img
                    src={module.coverImage}
                    alt={module.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    {module.type === 'main_module' ? (
                      <Folder className="w-16 h-16 text-gray-400" />
                    ) : (
                      <Layers className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                )}
                {module.completed && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${module.type === 'main_module' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    {module.type === 'main_module' ? (
                      <Folder className="w-5 h-5 text-[#D71920]" />
                    ) : (
                      <Layers className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    {module.type === 'main_module' ? 'Main Module' : 'Submodule'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{module.description}</p>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-[#D71920]">{module.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        module.completed
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : 'bg-gradient-to-r from-[#D71920] to-[#B91518]'
                      }`}
                      style={{ width: `${module.progress_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last accessed: {new Date(module.last_accessed).toLocaleDateString()}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}

          {enrolledModules.length === 0 && (
            <div className="col-span-2 bg-white rounded-2xl p-12 text-center shadow-lg">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Enrolled Modules</h3>
              <p className="text-gray-600 mb-6">
                Start your learning journey by enrolling in available modules.
              </p>
              <button
                onClick={() => navigate('/courses')}
                className="px-6 py-3 bg-[#D71920] hover:bg-[#B91518] text-white rounded-xl font-bold transition"
              >
                Browse Modules
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
