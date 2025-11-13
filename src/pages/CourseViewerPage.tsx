import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { getCourseById, Course } from '../services/courseService';
import { useApp } from '../context/AppContext';
import PDFViewer from '../components/PDFViewer';
import UpgradePrompt from '../components/UpgradePrompt';

export default function CourseViewerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    if (!courseId) return;

    try {
      const courseData = await getCourseById(courseId);
      setCourse(courseData);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = () => {
    if (!course || !currentUser) return false;

    const planHierarchy = { free: 0, pro: 1, vip: 2 };
    const userPlanLevel = planHierarchy[currentUser.plan];
    const coursePlanLevel = planHierarchy[course.plan];

    return coursePlanLevel <= userPlanLevel;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      let videoId = '';

      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
      }
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
    }
    return url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF3B3F] border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h1>
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF3B3F] to-[#E6282C] text-white rounded-xl font-bold hover:shadow-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Courses
        </button>
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Course Locked</h1>
          <p className="text-gray-600 mb-6">
            This course requires a {course.plan.toUpperCase()} plan to access.
          </p>
          <button
            onClick={() => setShowUpgradePrompt(true)}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#FF3B3F] to-[#E6282C] text-white rounded-xl font-bold hover:shadow-lg transition mb-3"
          >
            Upgrade Now
          </button>
          <button
            onClick={() => navigate('/courses')}
            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            Back to Courses
          </button>
        </div>

        {showUpgradePrompt && (
          <UpgradePrompt
            isOpen={showUpgradePrompt}
            onClose={() => setShowUpgradePrompt(false)}
            requiredPlan={course.plan === 'vip' ? 'vip' : 'pro'}
            message={`This course requires ${course.plan.toUpperCase()} access`}
            feature={course.title}
          />
        )}
      </div>
    );
  }

  if (!course.pdf_url && !course.video_url) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">No Content Available</h1>
        <p className="text-gray-600 mb-6">This course doesn't have any content yet.</p>
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF3B3F] to-[#E6282C] text-white rounded-xl font-bold hover:shadow-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Courses
        </button>
      </div>
    );
  }

  if (course.video_url) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Courses
          </button>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="aspect-video w-full bg-black">
              <iframe
                src={getYouTubeEmbedUrl(course.video_url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={course.title}
                frameBorder="0"
                loading="lazy"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-[#1C1C1C] mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                {course.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                {course.level}
              </span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                {course.duration}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PDFViewer
      pdfUrl={course.pdf_url!}
      allowDownload={course.allow_download}
      onClose={() => navigate('/courses')}
    />
  );
}
