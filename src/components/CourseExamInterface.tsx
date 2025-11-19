import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, Trophy, RefreshCw } from 'lucide-react';
import { Exam, submitExam, ExamResult } from '../services/examService';

interface CourseExamInterfaceProps {
  exam: Exam;
  userId: string;
  onComplete: (result: ExamResult) => void;
  isRetake?: boolean;
}

export default function CourseExamInterface({ exam, userId, onComplete, isRetake }: CourseExamInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number>(-1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers] = useState<Record<number, { selected: number; correct: boolean }>>({});
  const [startTime] = useState(Date.now());

  const question = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;
  const isLastQuestion = currentQuestion === exam.questions.length - 1;

  const handleSubmit = () => {
    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    setAnswers({
      ...answers,
      [currentQuestion]: {
        selected: selectedAnswer,
        correct
      }
    });
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      const finalAnswers = {
        ...answers,
        [currentQuestion]: {
          selected: selectedAnswer,
          correct: isCorrect
        }
      };
      const correctCount = Object.values(finalAnswers).filter(a => a.correct).length;
      const score = Math.round((correctCount / exam.questions.length) * 100);
      const passed = score >= exam.passingScore;

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      try {
        const result = await submitExam(userId, exam.moduleId, exam.lessonId, exam.courseId, {
          answers: Object.values(finalAnswers).map(a => a.selected),
          timeSpent
        });

        onComplete(result);
      } catch (error) {
        console.error('Error submitting exam:', error);
      }
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(-1);
      setShowFeedback(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {isRetake && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium">Retaking Exam</p>
            <p className="text-xs text-blue-700 mt-1">
              This is a practice retake. Your score won't affect your progress and you won't earn additional points.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-gray-900">{exam.examTitle}</h2>
          <div className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {exam.questions.length}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[#D71920] to-[#B91518]"
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showFeedback ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">{question.question}</h3>

            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    selectedAnswer === index
                      ? 'border-[#D71920] bg-red-50'
                      : 'border-gray-200 hover:border-[#D71920] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedAnswer === index
                          ? 'border-[#D71920] bg-[#D71920]'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedAnswer === index && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === -1}
              className="w-full bg-gradient-to-r from-[#D71920] to-[#B91518] text-white py-4 rounded-xl font-bold hover:from-[#B91518] hover:to-[#A01316] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Submit Answer
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`rounded-2xl shadow-lg p-8 border-2 ${
              isCorrect
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-4 mb-6">
              {isCorrect ? (
                <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
              )}
              <div>
                <h3 className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </h3>
                <p className={`text-lg ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? 'Well done! Your answer is correct.' : 'That\'s not the right answer.'}
                </p>
              </div>
            </div>

            {question.explanation && (
              <div className="bg-white rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-2">Explanation:</p>
                <p className="text-sm text-gray-700">{question.explanation}</p>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-[#D71920] to-[#B91518] text-white py-4 rounded-xl font-bold hover:from-[#B91518] hover:to-[#A01316] transition flex items-center justify-center gap-2"
            >
              {isLastQuestion ? (
                <>
                  <Trophy className="w-5 h-5" />
                  View Results
                </>
              ) : (
                <>
                  Next Question
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
