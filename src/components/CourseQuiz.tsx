import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw, Award, AlertCircle } from 'lucide-react';
import { Quiz, QuizQuestion, shuffleOptions } from '../data/quizData';
import { saveQuizResult } from '../services/quizService';
import { useApp } from '../context/AppContext';

interface CourseQuizProps {
  quiz?: Quiz;
  moduleId?: string;
  onComplete: (score: number, passed: boolean) => void;
  onBack?: () => void;
}

interface QuizResult {
  quizStatus: 'PASS' | 'FAIL';
  score: number;
}

export default function CourseQuiz({ quiz, moduleId, onComplete, onBack }: CourseQuizProps) {
  const { currentUser } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);

  const defaultQuiz: Quiz = {
    courseId: moduleId || 'default',
    title: 'Module Quiz',
    passingScore: 70,
    questions: [
      {
        questionText: 'What is the minimum watch time required to complete a video?',
        options: ['50%', '60%', '70%', '80%'],
        correctAnswer: '80%'
      },
      {
        questionText: 'How many videos must you complete before taking the quiz?',
        options: ['1 video', '2 videos', '3 videos', 'No videos required'],
        correctAnswer: '2 videos'
      },
      {
        questionText: 'What score do you need to unlock submodules?',
        options: ['50%', '60%', '70%', '80%'],
        correctAnswer: '70%'
      }
    ]
  };

  const activeQuiz = quiz || defaultQuiz;

  useEffect(() => {
    const shuffled = activeQuiz.questions.map(q => shuffleOptions(q));
    setShuffledQuestions(shuffled);
  }, [activeQuiz]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const totalQuestions = activeQuiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);

    if (isLastQuestion) {
      evaluateQuiz(newAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    }
  };

  const evaluateQuiz = async (answers: number[]) => {
    let correctCount = 0;

    shuffledQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswerIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= activeQuiz.passingScore;

    const result: QuizResult = {
      quizStatus: passed ? 'PASS' : 'FAIL',
      score: scorePercentage
    };

    setQuizResult(result);
    setShowResult(true);
    onComplete(scorePercentage, passed);

    if (currentUser) {
      await saveQuizResult({
        user_id: currentUser.uid,
        course_id: activeQuiz.courseId,
        score: scorePercentage,
        passed: passed,
        answers: answers,
        completed_at: new Date().toISOString()
      });
    }
  };

  const handleRetry = () => {
    const shuffled = activeQuiz.questions.map(q => shuffleOptions(q));
    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizResult(null);
  };

  if (shuffledQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D71921]"></div>
      </div>
    );
  }

  if (showResult && quizResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className={`rounded-2xl shadow-xl p-8 ${
          quizResult.quizStatus === 'PASS'
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300'
            : 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300'
        }`}>
          <div className="text-center">
            {quizResult.quizStatus === 'PASS' ? (
              <>
                <Award className="w-20 h-20 text-green-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-green-800 mb-2">Congratulations!</h2>
                <p className="text-lg text-green-700 mb-6">You passed the quiz!</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-red-800 mb-2">Not Quite There</h2>
                <p className="text-lg text-red-700 mb-6">You need 80% or higher to pass.</p>
              </>
            )}

            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="text-5xl font-bold text-gray-800 mb-2">{quizResult.score}%</div>
              <div className="text-gray-600">Your Score</div>
            </div>

            <div className="bg-white rounded-xl p-4 mb-6">
              <pre className="text-left text-sm">
                {JSON.stringify(quizResult, null, 2)}
              </pre>
            </div>

            {quizResult.quizStatus === 'FAIL' && (
              <button
                onClick={handleRetry}
                className="px-8 py-3 bg-gradient-to-r from-[#D71921] to-[#B91518] text-white rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                Retry Quiz
              </button>
            )}

            {quizResult.quizStatus === 'PASS' && (
              <div className="text-green-700 font-semibold">
                Course completed successfully!
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-4">Review Your Answers:</h3>
          <div className="space-y-4">
            {shuffledQuestions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswerIndex;

              return (
                <div key={question.id} className="border-l-4 pl-4" style={{
                  borderColor: isCorrect ? '#22c55e' : '#ef4444'
                }}>
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Q{index + 1}: {question.question}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your answer: <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                          {question.options[userAnswer]}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 mt-1">
                          Correct answer: {question.options[question.correctAnswerIndex]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#000000]">{quiz.courseName} Quiz</h2>
            <span className="text-sm font-semibold text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#D71921] to-[#B91518] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {currentQuestion.question}
              </h3>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition ${
                      selectedAnswer === index
                        ? 'border-[#D71921] bg-[#EADBC8] shadow-md'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedAnswer === index
                          ? 'border-[#D71921] bg-[#D71921]'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswer === index && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#D71921] to-[#B91518] text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        You need {quiz.passingScore}% or higher to pass this quiz
      </div>
    </div>
  );
}
