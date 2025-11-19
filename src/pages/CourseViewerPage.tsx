import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle, Award } from 'lucide-react';
import { getCourseById, Course, updateCourseProgress, isCourseUnlocked } from '../services/courseService';
import { useApp } from '../context/AppContext';
import PDFViewer from '../components/PDFViewer';
import UpgradePrompt from '../components/UpgradePrompt';
import { markLessonWatched } from '../services/rewardsService';
import { trackCourseProgress } from '../services/enrollmentService';
import { getExamByCourseId, getUserExamResult, Exam, ExamResult } from '../services/examService';
import FeatureAccessGuard from '../components/FeatureAccessGuard';
import ExamInterface from '../components/ExamInterface';
import ExamResultModal from '../components/ExamResultModal';
import { AnimatePresence } from 'framer-motion';

function CourseViewerPageContent() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [showExam, setShowExam] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [hasPassed, setHasPassed] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [videoStartTime] = useState(Date.now());
  const [isUnlocked, setIsUnlocked] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  useEffect(() => {
    if (currentUser && courseId && course) {
      markLessonWatched(currentUser.uid, courseId);
    }
  }, [currentUser, courseId, course]);

  useEffect(() => {
    const trackProgress = () => {
      const timeWatching = (Date.now() - videoStartTime) / 1000;
      const estimatedProgress = Math.min((timeWatching / 180) * 100, 99);

      setWatchProgress(estimatedProgress);

      if (estimatedProgress >= 80 && !videoWatched && currentUser && courseId && course) {
        setVideoWatched(true);
        console.log('Video watched 80%, tracking progress...');
        const moduleId = course.main_module_id || course.submodule_id;
        if (moduleId) {
          trackCourseProgress(currentUser.uid, courseId, moduleId, 80, 100);
        }
      }
    };

    const interval = setInterval(trackProgress, 3000);
    return () => clearInterval(interval);
  }, [videoStartTime, videoWatched, currentUser, courseId, course]);

  const loadCourse = async () => {
    if (!courseId) return;

    try {
      const courseData = await getCourseById(courseId);
      setCourse(courseData);

      if (currentUser) {
        const unlocked = await isCourseUnlocked(currentUser.uid, courseData);
        setIsUnlocked(unlocked);
      }

      const examData = await getExamByCourseId(courseId);

      if (examData) {
        if (!examData.courseId) {
          console.warn('Exam missing courseId, setting it to:', courseId);
          examData.courseId = courseId;
        }
        setExam(examData);

        if (currentUser) {
          const result = await getUserExamResult(
            currentUser.uid,
            examData.moduleId,
            examData.lessonId
          );
          if (result && result.passed) {
            setHasPassed(true);
          }
        }
      } else {
        setExam(null);
      }
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

  const getYouTubeEmbedUrl = (url: string): string => {
    if (!url) {
      console.error('No video URL provided');
      return '';
    }

    try {
      let videoId = '';

      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('/')[0] || '';
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1]?.split('?')[0]?.split('/')[0] || '';
      } else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('/')[0] || '';
      }

      videoId = videoId.trim();

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
      }
    } catch (error) {
      console.error('Error parsing YouTube URL:', error, url);
    }
    return url;
  };

  const handleVideoWatchComplete = async () => {
    if (currentUser && courseId && course) {
      setVideoWatched(true);
      setWatchProgress(100);
      const moduleId = course.main_module_id || course.submodule_id;
      if (moduleId) {
        await trackCourseProgress(currentUser.uid, courseId, moduleId, 100, 100);
        await updateCourseProgress(currentUser.uid, courseId, 100);
      }
    }
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

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="glass-modal p-8 max-w-md w-full text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Course Locked</h1>
          <p className="text-gray-600 mb-6">
            Complete the previous course and pass its exam with 80% or higher to unlock this course.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="glass-modal p-8 max-w-md w-full text-center">
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

  const handleExamComplete = async (result: ExamResult) => {
    setExamResult(result);
    setShowExam(false);
    setShowResultModal(true);

    if (result.passed && currentUser && courseId && course) {
      setHasPassed(true);
      await updateCourseProgress(currentUser.uid, courseId, 100);

      if (course.main_module_id) {
        await trackCourseProgress(currentUser.uid, courseId, course.main_module_id, 100, 100);
      } else if (course.submodule_id) {
        await trackCourseProgress(currentUser.uid, courseId, course.submodule_id, 100, 100);
      }
    }
  };

  const handleStartExam = () => {
    setShowExam(true);
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    if (examResult?.passed) {
      navigate(-1);
    }
  };

  if (course.video_url) {
    return (
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Courses
          </button>

          <div className="glass-video overflow-hidden mb-6">
            <div className="aspect-video w-full bg-black relative">
              {course.video_url ? (
                <iframe
                  src={getYouTubeEmbedUrl(course.video_url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={course.title}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <p>No video available</p>
                </div>
              )}
            </div>
            {watchProgress > 0 && watchProgress < 100 && (
              <div className="bg-gray-800 h-1.5">
                <div
                  className="h-full bg-[#D71920] transition-all duration-500"
                  style={{ width: `${watchProgress}%` }}
                />
              </div>
            )}
          </div>

          <div className="glass-card p-6 mb-6">
            <h1 className="text-3xl font-bold text-[#1C1C1C] mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-4">
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
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-900">Video Progress</span>
                <span className="text-sm font-bold text-blue-600">{Math.round(watchProgress)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${watchProgress}%` }}
                />
              </div>
              {watchProgress >= 80 ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleVideoWatchComplete}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition text-sm"
                  >
                    ✓ Mark Complete
                  </button>
                  {exam && !hasPassed && (
                    <button
                      onClick={handleStartExam}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#D71921] to-[#B91518] hover:shadow-lg text-white rounded-lg font-semibold transition text-sm"
                    >
                      Take Exam
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    Watch video to unlock exam (need 80%)
                  </p>
                </div>
              )}
            </div>
          </div>

          {exam && !hasPassed && watchProgress < 80 && (
            <div
              className="bg-gradient-to-br from-[#EADBC8] to-[#F5E6D3] rounded-2xl shadow-lg p-8 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(234, 219, 200, 0.9) 0%, rgba(245, 230, 211, 0.9) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#000000] mb-3">Exam Locked</h2>
              <p className="text-gray-700 mb-4">
                Watch at least 80% of the video to unlock the exam.
              </p>
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                <p className="text-orange-800 text-sm font-semibold">
                  Progress: {Math.round(watchProgress)}% / 80% required
                </p>
              </div>
            </div>
          )}

          {hasPassed && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl shadow-lg p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">Course Completed!</h2>
              <p className="text-green-700">
                You have successfully completed this course and passed the exam.
              </p>
            </div>
          )}

          <AnimatePresence>
            {showExam && exam && currentUser && (
              <ExamInterface
                exam={exam}
                userId={currentUser.uid}
                onClose={() => setShowExam(false)}
                onComplete={handleExamComplete}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showResultModal && examResult && exam && (
              <ExamResultModal
                result={examResult}
                examTitle={exam.examTitle}
                onClose={handleCloseResultModal}
                cooldownMinutes={exam.cooldownMinutes}
              />
            )}
          </AnimatePresence>
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

export default function CourseViewerPage() {
  return (
    <FeatureAccessGuard featureKey="videos">
      <CourseViewerPageContent />
    </FeatureAccessGuard>
  );
}
