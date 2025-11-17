import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Lock, CheckCircle, Award } from 'lucide-react';
import { Module, ModuleLesson, markLessonComplete, isLessonUnlocked } from '../services/moduleService';

interface ModuleLessonViewerProps {
  module: Module;
  userId: string;
  completedLessons: string[];
  quizPassed: boolean;
  onLessonComplete: (lessonId: string) => void;
}

export default function ModuleLessonViewer({
  module,
  userId,
  completedLessons,
  quizPassed,
  onLessonComplete
}: ModuleLessonViewerProps) {
  const [selectedLesson, setSelectedLesson] = useState<ModuleLesson | null>(null);
  const [unlockedLessons, setUnlockedLessons] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    checkUnlockedLessons();
  }, [module, userId, completedLessons, quizPassed]);

  const checkUnlockedLessons = async () => {
    const unlocked = new Set<string>();
    for (const lesson of module.lessons) {
      const isUnlocked = await isLessonUnlocked(userId, module.id, module, lesson.id);
      if (isUnlocked) {
        unlocked.add(lesson.id);
      }
    }
    setUnlockedLessons(unlocked);

    if (!selectedLesson && module.lessons.length > 0) {
      const firstUnlocked = module.lessons.find(l => unlocked.has(l.id));
      if (firstUnlocked) {
        setSelectedLesson(firstUnlocked);
      }
    }
  };

  const handleLessonClick = (lesson: ModuleLesson) => {
    if (unlockedLessons.has(lesson.id)) {
      setSelectedLesson(lesson);
    }
  };

  const handleVideoEnd = async () => {
    if (selectedLesson && !completedLessons.includes(selectedLesson.id)) {
      await markLessonComplete(userId, module.id, selectedLesson.id);
      onLessonComplete(selectedLesson.id);
    }
  };

  const handleTakeQuiz = () => {
    navigate(`/quiz/${module.id}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {selectedLesson ? (
          <>
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="aspect-video bg-black">
                <iframe
                  src={selectedLesson.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onEnded={handleVideoEnd}
                />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-slate-100 mb-2">
                {selectedLesson.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{selectedLesson.duration}</span>
                {completedLessons.includes(selectedLesson.id) && (
                  <span className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </span>
                )}
              </div>

              {selectedLesson.isIntro && !quizPassed && (
                <div className="mt-6">
                  <button
                    onClick={handleTakeQuiz}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition"
                  >
                    <Award className="w-5 h-5" />
                    Take Quiz to Unlock Next Lessons
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-slate-800 rounded-lg p-12 text-center">
            <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Select a lesson to start learning</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Lessons</h3>
        {module.lessons.map((lesson, index) => {
          const isUnlocked = unlockedLessons.has(lesson.id);
          const isCompleted = completedLessons.includes(lesson.id);
          const isSelected = selectedLesson?.id === lesson.id;

          return (
            <button
              key={lesson.id}
              onClick={() => handleLessonClick(lesson)}
              disabled={!isUnlocked}
              className={`w-full text-left p-4 rounded-lg transition ${
                isSelected
                  ? 'bg-blue-600 border-blue-500'
                  : isUnlocked
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  : 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed'
              } border`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-300">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : isUnlocked ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold mb-1 ${
                    isSelected ? 'text-white' : isUnlocked ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    {lesson.title}
                  </h4>
                  <p className={`text-sm ${
                    isSelected ? 'text-blue-200' : isUnlocked ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {lesson.duration}
                    {lesson.isIntro && ' • Introduction'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
