import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronDown, ChevronRight, Folder, FileText, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  video_url?: string;
  order: number;
}

interface Submodule {
  id: string;
  title: string;
  description?: string;
  order: number;
  courses: Course[];
  expanded: boolean;
}

interface MainModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  submodules: Submodule[];
  courses: Course[];
  expanded: boolean;
}

export default function CoursesPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [mainModules, setMainModules] = useState<MainModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'mentor' || currentUser.role === 'governor')) {
      navigate('/coach-dashboard');
      return;
    }
    loadHierarchy();
  }, [currentUser, navigate]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);

      const mainModulesRef = collection(db, 'main_modules');
      const mainModulesQuery = query(mainModulesRef, orderBy('order', 'asc'));
      const mainModulesSnap = await getDocs(mainModulesQuery);

      const mainModulesData: MainModule[] = await Promise.all(
        mainModulesSnap.docs.map(async (doc) => {
          const mainModuleData = doc.data();

          const mainModuleCoursesRef = collection(db, 'main_modules', doc.id, 'courses');
          const mainModuleCoursesQuery = query(mainModuleCoursesRef, orderBy('order', 'asc'));
          const mainModuleCoursesSnap = await getDocs(mainModuleCoursesQuery);
          const mainModuleCourses = mainModuleCoursesSnap.docs.map(courseDoc => ({
            id: courseDoc.id,
            ...courseDoc.data(),
            order: courseDoc.data().order || 0
          } as Course));

          const submodulesRef = collection(db, 'submodules');
          const submodulesQuery = query(submodulesRef, orderBy('order', 'asc'));
          const submodulesSnap = await getDocs(submodulesQuery);

          const submodulesData: Submodule[] = await Promise.all(
            submodulesSnap.docs
              .filter(subDoc => subDoc.data().main_module_id === doc.id)
              .map(async (subDoc) => {
                const submoduleData = subDoc.data();

                const submoduleCoursesRef = collection(db, 'submodules', subDoc.id, 'courses');
                const submoduleCoursesQuery = query(submoduleCoursesRef, orderBy('order', 'asc'));
                const submoduleCoursesSnap = await getDocs(submoduleCoursesQuery);
                const submoduleCourses = submoduleCoursesSnap.docs.map(courseDoc => ({
                  id: courseDoc.id,
                  ...courseDoc.data(),
                  order: courseDoc.data().order || 0
                } as Course));

                return {
                  id: subDoc.id,
                  title: submoduleData.title || 'Untitled Submodule',
                  description: submoduleData.description,
                  order: submoduleData.order || 0,
                  courses: submoduleCourses,
                  expanded: false
                };
              })
          );

          return {
            id: doc.id,
            title: mainModuleData.title || 'Untitled Main Module',
            description: mainModuleData.description,
            order: mainModuleData.order || 0,
            submodules: submodulesData,
            courses: mainModuleCourses,
            expanded: false
          };
        })
      );

      setMainModules(mainModulesData);
    } catch (error) {
      console.error('Error loading course hierarchy:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMainModule = (mainModuleId: string) => {
    setMainModules(prev =>
      prev.map(mm =>
        mm.id === mainModuleId ? { ...mm, expanded: !mm.expanded } : mm
      )
    );
  };

  const toggleSubmodule = (mainModuleId: string, submoduleId: string) => {
    setMainModules(prev =>
      prev.map(mm =>
        mm.id === mainModuleId
          ? {
              ...mm,
              submodules: mm.submodules.map(sm =>
                sm.id === submoduleId ? { ...sm, expanded: !sm.expanded } : sm
              )
            }
          : mm
      )
    );
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D71920] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course structure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Courses</h1>
          <p className="text-gray-600">Explore our structured learning path</p>
        </div>

        {mainModules.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Content Available</h3>
            <p className="text-gray-600">Course content will be added soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mainModules.map((mainModule) => (
              <div key={mainModule.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between"
                  onClick={() => toggleMainModule(mainModule.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-[#D71920] rounded-lg">
                      <Folder className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{mainModule.title}</h2>
                      {mainModule.description && (
                        <p className="text-sm text-gray-600 mt-1">{mainModule.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{mainModule.courses.length} direct courses</span>
                        <span>{mainModule.submodules.length} submodules</span>
                      </div>
                    </div>
                  </div>
                  {mainModule.expanded ? (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <AnimatePresence>
                  {mainModule.expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 bg-gray-50"
                    >
                      <div className="p-6 space-y-4">
                        {mainModule.courses.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              Direct Courses
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {mainModule.courses.map((course) => (
                                <div
                                  key={course.id}
                                  onClick={() => handleCourseClick(course.id)}
                                  className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-[#D71920]"
                                >
                                  {course.thumbnail && (
                                    <img
                                      src={course.thumbnail}
                                      alt={course.title}
                                      className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                  )}
                                  <h4 className="font-bold text-gray-900 mb-1">{course.title}</h4>
                                  {course.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                                  )}
                                  {course.video_url && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-[#D71920]">
                                      <Play className="w-3 h-3" />
                                      <span>Video included</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {mainModule.submodules.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Submodules</h3>
                            <div className="space-y-3">
                              {mainModule.submodules.map((submodule) => (
                                <div key={submodule.id} className="bg-white rounded-lg shadow overflow-hidden">
                                  <div
                                    className="p-4 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between"
                                    onClick={() => toggleSubmodule(mainModule.id, submodule.id)}
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="p-2 bg-blue-100 rounded">
                                        <Folder className="w-5 h-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-gray-900">{submodule.title}</h4>
                                        {submodule.description && (
                                          <p className="text-sm text-gray-600">{submodule.description}</p>
                                        )}
                                        <span className="text-xs text-gray-500">{submodule.courses.length} courses</span>
                                      </div>
                                    </div>
                                    {submodule.expanded ? (
                                      <ChevronDown className="w-5 h-5 text-gray-400" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>

                                  <AnimatePresence>
                                    {submodule.expanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-t border-gray-200 bg-gray-50 p-4"
                                      >
                                        {submodule.courses.length === 0 ? (
                                          <p className="text-center text-gray-500 py-4">No courses in this submodule</p>
                                        ) : (
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {submodule.courses.map((course) => (
                                              <div
                                                key={course.id}
                                                onClick={() => handleCourseClick(course.id)}
                                                className="bg-white rounded-lg p-3 shadow hover:shadow-md transition cursor-pointer border-2 border-transparent hover:border-blue-500"
                                              >
                                                {course.thumbnail && (
                                                  <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-full h-24 object-cover rounded mb-2"
                                                  />
                                                )}
                                                <h5 className="font-semibold text-gray-900 text-sm mb-1">{course.title}</h5>
                                                {course.description && (
                                                  <p className="text-xs text-gray-600 line-clamp-2">{course.description}</p>
                                                )}
                                                {course.video_url && (
                                                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                                                    <Play className="w-3 h-3" />
                                                    <span>Video included</span>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
