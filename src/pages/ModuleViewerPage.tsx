import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Play } from 'lucide-react';
import { getModule, Module, getUserModuleProgress, UserModuleProgress } from '../services/moduleService';
import { enrollInCourse, isEnrolledInCourse } from '../services/courseService';
import { useApp } from '../context/AppContext';
import ModuleLessonViewer from '../components/ModuleLessonViewer';

export default function ModuleViewerPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [module, setModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<UserModuleProgress | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (moduleId && currentUser) {
      loadModule();
    }
  }, [moduleId, currentUser]);

  const loadModule = async () => {
    if (!moduleId || !currentUser) return;

    try {
      const moduleData = await getModule(moduleId);
      setModule(moduleData);

      if (moduleData) {
        const isEnrolled = await isEnrolledInCourse(currentUser.uid, moduleId);
        setEnrolled(isEnrolled);

        const progressData = await getUserModuleProgress(currentUser.uid, moduleId);
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Error loading module:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!currentUser || !moduleId) return;

    try {
      await enrollInCourse(currentUser.uid, moduleId);
      setEnrolled(true);
      await loadModule();
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  const handleLessonComplete = async (lessonId: string) => {
    await loadModule();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Module Not Found</h1>
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Courses
        </button>

        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <span className="text-sm text-blue-400 font-semibold uppercase">
                  {module.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-100 mb-3">{module.name}</h1>
              <p className="text-slate-300 mb-4">{module.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{module.lessons.length} Lessons</span>
                {progress && (
                  <span>{progress.completed_lessons.length} / {module.lessons.length} Completed</span>
                )}
              </div>
            </div>

            {!enrolled && (
              <button
                onClick={handleEnroll}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition shadow-lg"
              >
                <Play className="w-5 h-5" />
                Enroll Now
              </button>
            )}
          </div>
        </div>

        {enrolled && currentUser && module && progress ? (
          <ModuleLessonViewer
            module={module}
            userId={currentUser.uid}
            completedLessons={progress.completed_lessons}
            quizPassed={progress.quiz_passed}
            onLessonComplete={handleLessonComplete}
          />
        ) : !enrolled ? (
          <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Ready to Start Learning?</h2>
            <p className="text-slate-400 mb-6">
              Enroll in this module to access {module.lessons.length} video lessons and quizzes.
            </p>
            <button
              onClick={handleEnroll}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition shadow-lg"
            >
              Enroll Now - It's Free!
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
