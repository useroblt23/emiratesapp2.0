import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FolderPlus, Upload, BookOpen, Play, Folder } from 'lucide-react';
import { getMainModule, getSubmodulesByParent, MainModule, Submodule } from '../services/mainModuleService';
import { getCoursesByModule, Course } from '../services/courseService';
import { motion } from 'framer-motion';
import CreateModuleForm from '../components/CreateModuleForm';
import NewCourseForm from '../components/NewCourseForm';
import { useApp } from '../context/AppContext';
import { updateLastAccessed, isEnrolledInModule } from '../services/enrollmentService';

export default function MainModuleViewerPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [mainModule, setMainModule] = useState<MainModule | null>(null);
  const [submodules, setSubmodules] = useState<Submodule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);

  const isAdmin = currentUser?.role === 'mentor' || currentUser?.role === 'governor';

  useEffect(() => {
    if (moduleId) {
      loadModuleData();
    }
  }, [moduleId]);

  const loadModuleData = async () => {
    if (!moduleId) return;

    try {
      const module = await getMainModule(moduleId);
      setMainModule(module);

      if (module) {
        if (currentUser && !isAdmin) {
          const enrolled = await isEnrolledInModule(currentUser.uid, moduleId);
          if (!enrolled) {
            navigate('/courses');
            return;
          }
          await updateLastAccessed(currentUser.uid, moduleId);
        }

        const subs = await getSubmodulesByParent(moduleId);
        setSubmodules(subs);

        const coursesData = await getCoursesByModule(moduleId);
        const mainModuleCourses = coursesData.filter(course => !course.submodule_id);
        setCourses(mainModuleCourses);
      }
    } catch (error) {
      console.error('Error loading main module:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D71920] border-t-transparent"></div>
      </div>
    );
  }

  if (!mainModule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Module Not Found</h1>
        <button
          onClick={() => navigate(isAdmin ? '/coach-dashboard' : '/courses')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-lg font-semibold hover:shadow-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to {isAdmin ? 'Dashboard' : 'Courses'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(isAdmin ? '/coach-dashboard' : '/courses')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to {isAdmin ? 'Dashboard' : 'Courses'}
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {mainModule.coverImage && (
            <img
              src={mainModule.coverImage}
              alt={mainModule.title}
              className="w-full h-80 object-cover"
            />
          )}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{mainModule.title}</h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">{mainModule.description}</p>

            {isAdmin && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition"
                >
                  <Plus className="w-5 h-5" />
                  Add Submodule
                </button>
                <button
                  onClick={() => setShowAddCourse(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-xl font-semibold hover:shadow-lg transition"
                >
                  <Upload className="w-5 h-5" />
                  Add Course
                </button>
              </div>
            )}
          </div>
        </div>

        {courses.length > 0 && (
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-[#D71920]" />
                Courses
              </h2>
              <p className="text-gray-600">Direct courses in this module</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-[#D71920]"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <div className="relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {course.video_url && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{course.title}</h3>
                    {course.subtitle && (
                      <p className="text-sm text-gray-500 mb-2">{course.subtitle}</p>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{course.duration}</span>
                      <span className="capitalize">{course.level}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {submodules.length > 0 && (
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Folder className="w-8 h-8 text-blue-600" />
                Submodules
              </h2>
              <p className="text-gray-600">Explore submodules within this module</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submodules.map((submodule) => (
                <motion.div
                  key={submodule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500"
                  onClick={() => navigate(`/submodules/${submodule.id}`)}
                >
                  {submodule.coverImage ? (
                    <img
                      src={submodule.coverImage}
                      alt={submodule.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <Folder className="w-16 h-16 text-blue-400" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        Submodule #{submodule.order}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{submodule.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{submodule.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {courses.length === 0 && submodules.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Content Yet</h3>
            <p className="text-gray-600 mb-6">
              {isAdmin
                ? 'Start building this module by adding courses or submodules'
                : 'This module is being prepared. Check back soon!'
              }
            </p>
            {isAdmin && (
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setShowAddCourse(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Add Course
                </button>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Submodule
                </button>
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <>
            <CreateModuleForm
              isOpen={showCreateForm}
              onClose={() => setShowCreateForm(false)}
              onSuccess={loadModuleData}
            />

            <NewCourseForm
              isOpen={showAddCourse}
              onClose={() => setShowAddCourse(false)}
              onSuccess={loadModuleData}
              preselectedMainModuleId={moduleId}
            />
          </>
        )}
      </div>
    </div>
  );
}
