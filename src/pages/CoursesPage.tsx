import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllModules, Module } from '../services/moduleService';
import { getCoursesByModule, Course } from '../services/courseService';
import { useApp } from '../context/AppContext';

interface ModuleWithContent extends Module {
  courses: Course[];
}

export default function CoursesPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [modulesWithContent, setModulesWithContent] = useState<ModuleWithContent[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'mentor' || currentUser.role === 'governor')) {
      navigate('/coach-dashboard');
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    try {
      console.log('CoursesPage: Fetching modules with content...');
      const modulesData = await getAllModules();
      console.log('CoursesPage: Modules fetched:', modulesData.length, modulesData);

      if (modulesData.length === 0) {
        console.log('CoursesPage: No modules found');
        setModulesWithContent([]);
        setLoading(false);
        return;
      }

      const modulesWithContentData = await Promise.all(
        modulesData.map(async (module) => {
          console.log(`CoursesPage: Fetching courses for module ${module.id}...`);
          const courses = await getCoursesByModule(module.id);
          console.log(`CoursesPage: Module ${module.id} has ${courses.length} courses`);

          return {
            ...module,
            courses
          };
        })
      );

      console.log('CoursesPage: Modules with content loaded:', modulesWithContentData.length, modulesWithContentData);
      setModulesWithContent(modulesWithContentData);
    } catch (error) {
      console.error('CoursesPage: Error fetching data:', error);
      setModulesWithContent([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#000000] mb-2">
          Training Modules
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Master the skills needed to become a successful cabin crew member
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D71920] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading modules...</p>
          </div>
        </div>
      ) : modulesWithContent.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg p-8">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Training Modules Found</h3>
          <p className="text-gray-600 mb-4">
            No modules have been created yet.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
            <p className="text-sm text-blue-900 mb-2">
              <strong>For Administrators:</strong> To create training modules:
            </p>
            <ol className="text-sm text-blue-800 space-y-1 ml-4">
              <li>1. Go to Coach Dashboard</li>
              <li>2. Click "Create Module" button</li>
              <li>3. Fill in the module details and create it</li>
              <li>4. Add courses to your module</li>
              <li>5. Your modules will appear here for students</li>
            </ol>
            <p className="text-xs text-blue-700 mt-3">
              Note: Check browser console for debugging information.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {modulesWithContent.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const totalCourses = module.courses.length;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div
                  className="cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex items-center gap-4 p-6">
                    {module.cover_image && (
                      <img
                        src={module.cover_image}
                        alt={module.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{module.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg font-semibold">{module.category}</span>
                        <span>{totalCourses} course{totalCourses !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-6 space-y-6">
                        {module.courses.length > 0 ? (
                          <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {module.courses.map((course) => (
                                <div
                                  key={course.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/course/${course.id}`);
                                  }}
                                  className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
                                >
                                  <div className="relative">
                                    <img
                                      src={course.thumbnail}
                                      alt={course.title}
                                      className="w-full h-32 object-cover"
                                    />
                                    {course.video_url && (
                                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <Play className="w-8 h-8 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-4">
                                    <h5 className="font-semibold text-gray-900 text-sm mb-1">{course.title}</h5>
                                    {course.subtitle && (
                                      <p className="text-xs text-gray-500 mb-1">{course.subtitle}</p>
                                    )}
                                    <p className="text-gray-600 text-xs line-clamp-2">{course.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p>No courses in this module yet</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
