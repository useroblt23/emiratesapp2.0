import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, BarChart3, Lock, Crown, Zap, GraduationCap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { getAllCourses, Course } from '../services/courseService';
import { getAllModules, Module } from '../services/moduleService';

export default function CoursesPage() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'courses' | 'modules'>('courses');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Course['category']>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const userPlan = currentUser?.plan || 'free';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesData = await getAllCourses();
      const visibleCourses = coursesData.filter(course => !course.suppressed);
      setCourses(visibleCourses);

      const modulesData = await getAllModules();
      setModules(modulesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const getCoursesByPlan = (userPlan: 'free' | 'pro' | 'vip'): Course[] => {
    const planHierarchy = { 'free': 0, 'pro': 1, 'vip': 2 };
    const userPlanLevel = planHierarchy[userPlan];

    return courses.filter(course => {
      const coursePlanLevel = planHierarchy[course.plan as 'free' | 'pro' | 'vip'];
      return coursePlanLevel <= userPlanLevel;
    });
  };

  const availableCourses = useMemo(() => getCoursesByPlan(userPlan), [userPlan, courses]);

  const displayCourses = useMemo(() => {
    if (selectedCategory === 'all') return courses;
    return courses.filter(course => course.category === selectedCategory);
  }, [selectedCategory, courses]);

  const isCourseAvailable = (course: Course) => {
    return availableCourses.some(c => c.id === course.id);
  };

  const categories = [
    { id: 'all', label: 'All Courses' },
    { id: 'interview', label: 'Interview Prep' },
    { id: 'grooming', label: 'Grooming' },
    { id: 'service', label: 'Customer Service' },
    { id: 'safety', label: 'Safety' },
    { id: 'language', label: 'Language' },
  ];

  const getPlanBadge = (plan: 'free' | 'pro' | 'vip') => {
    if (plan === 'free') return null;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
        plan === 'vip'
          ? 'bg-gradient-to-r from-[#CBA135] to-[#B8941F] text-white'
          : 'bg-gradient-to-r from-[#D71920] to-[#B91518] text-white'
      }`}>
        {plan === 'vip' ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
        {plan.toUpperCase()}
      </span>
    );
  };

  const displayModules = useMemo(() => {
    if (selectedCategory === 'all') return modules;
    return modules.filter(module => module.category === selectedCategory);
  }, [selectedCategory, modules]);

  return (
    <div className="min-h-screen">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#000000] mb-2">
          Training {viewMode === 'courses' ? 'Courses' : 'Modules'}
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Master the skills needed to become a successful cabin crew member
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode('courses')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            viewMode === 'courses'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Courses
        </button>
        <button
          onClick={() => setViewMode('modules')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            viewMode === 'modules'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <GraduationCap className="w-4 h-4 inline mr-2" />
          Modules
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCategory === category.id
                ? 'bg-[#D71920] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {userPlan === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold mb-1">Unlock All Courses</p>
              <p className="text-sm text-white text-opacity-90">
                Upgrade to Pro or VIP to access premium training materials
              </p>
            </div>
            <button
              onClick={() => navigate('/upgrade')}
              className="px-4 py-2 bg-white text-[#D71920] rounded-lg font-bold hover:shadow-lg transition whitespace-nowrap"
            >
              Upgrade
            </button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D71920] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {viewMode}...</p>
          </div>
        </div>
      ) : viewMode === 'modules' ? (
        displayModules.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Modules Available</h3>
            <p className="text-gray-600">Modules will be available soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayModules.map((module) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={() => navigate(`/modules/${module.id}`)}
              >
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 h-48 flex items-center justify-center">
                  <GraduationCap className="w-20 h-20 text-white opacity-80" />
                </div>

                <div className="p-6">
                  <div className="mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase">
                      {module.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{module.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{module.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{module.lessons.length} Lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>Module {module.order}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : displayCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Courses Available</h3>
          <p className="text-gray-600">Courses will be uploaded by coaches soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCourses.map((course) => {
          const isAvailable = isCourseAvailable(course);

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                !isAvailable ? 'opacity-75' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                {!isAvailable && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Lock className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-bold">Locked</p>
                      <p className="text-sm">Upgrade to access</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {getPlanBadge(course.plan)}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded-full font-medium ${
                    course.level === 'beginner' ? 'bg-green-100 text-green-700' :
                    course.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {course.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {course.lessons} lessons
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {course.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    by {course.instructor}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (!isAvailable) {
                      navigate('/upgrade');
                    } else {
                      navigate(`/courses/${course.id}`);
                    }
                  }}
                  className={`mt-4 w-full py-2 rounded-lg font-bold transition ${
                    isAvailable
                      ? 'bg-[#D71920] text-white hover:bg-[#B91518]'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {isAvailable ? 'Start Learning' : 'Upgrade to Unlock'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}
    </div>
  );
}
