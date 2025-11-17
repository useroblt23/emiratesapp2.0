import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, Clock, Award, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllCourses, Course, enrollInCourse, isEnrolledInCourse } from '../services/courseService';
import { useApp } from '../context/AppContext';

interface CourseWithEnrollment extends Course {
  isEnrolled: boolean;
}

export default function CoursesPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [courses, setCourses] = useState<CourseWithEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'mentor' || currentUser.role === 'governor')) {
      navigate('/coach-dashboard');
      return;
    }
    fetchCourses();
  }, [currentUser, navigate]);

  const fetchCourses = async () => {
    try {
      const allCourses = await getAllCourses();

      if (currentUser) {
        const coursesWithEnrollment = await Promise.all(
          allCourses.map(async (course) => {
            const isEnrolled = await isEnrolledInCourse(currentUser.uid, course.id);
            return { ...course, isEnrolled };
          })
        );
        setCourses(coursesWithEnrollment);
      } else {
        setCourses(allCourses.map(course => ({ ...course, isEnrolled: false })));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setEnrollingCourseId(courseId);
      await enrollInCourse(currentUser.uid, courseId);
      await fetchCourses();
      alert('Successfully enrolled in the course!');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course. Please try again.');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'free': return { color: 'bg-gray-500', label: 'FREE' };
      case 'pro': return { color: 'bg-blue-500', label: 'PRO' };
      case 'vip': return { color: 'bg-purple-500', label: 'VIP' };
      default: return { color: 'bg-gray-500', label: 'FREE' };
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#000000] mb-2">
          All Courses
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Explore and enroll in courses to start your Emirates cabin crew journey
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D71920] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg p-8">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Courses Available</h3>
          <p className="text-gray-600">
            Courses will be available soon. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const planBadge = getPlanBadge(course.plan);
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col"
              >
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  {course.video_url && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 ${planBadge.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                    {planBadge.label}
                  </div>
                  {course.isEnrolled && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      ENROLLED
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{course.title}</h3>
                    {course.subtitle && (
                      <p className="text-sm text-gray-500 mb-2">{course.subtitle}</p>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {course.lessons} lessons
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 mb-4">
                    <p className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      By {course.instructor}
                    </p>
                  </div>

                  <div className="mt-auto">
                    {course.isEnrolled ? (
                      <button
                        onClick={() => handleViewCourse(course.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition"
                      >
                        Continue Learning
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollingCourseId === course.id}
                        className="w-full bg-[#D71920] hover:bg-[#B91518] text-white py-2 px-4 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enrollingCourseId === course.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Enrolling...
                          </span>
                        ) : (
                          'Enroll Now'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
