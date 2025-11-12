import { useState } from 'react';
import { mockCourses, Course } from '../data/mockData';
import { Play, Clock, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#1C1C1C] mb-2">Courses</h1>
        <p className="text-gray-600">Explore and learn from our comprehensive training library</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
          <motion.div
            key={course.id}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedCourse(course)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg mb-1">{course.title}</h3>
                <p className="text-white/90 text-sm">{course.instructor}</p>
              </div>
            </div>

            <div className="p-4">
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                {course.progress !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#D71920] to-[#B91518] h-2 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-[#D71920] font-bold">{course.progress}%</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCourse(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-64 bg-gray-900">
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
                    <Play className="w-8 h-8 text-[#D71920] ml-1" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <h2 className="text-3xl font-bold text-[#1C1C1C] mb-2">
                  {selectedCourse.title}
                </h2>
                <p className="text-gray-600 mb-6">By {selectedCourse.instructor}</p>

                <div className="bg-[#EADBC8]/30 rounded-xl p-6 mb-6">
                  <p className="text-[#1C1C1C] leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#B9975B]" />
                    <span className="text-gray-600">{selectedCourse.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#B9975B]" />
                    <span className="text-gray-600">12 Lessons</span>
                  </div>
                </div>

                {selectedCourse.progress !== undefined && (
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-bold text-[#1C1C1C]">Your Progress</span>
                      <span className="text-sm font-bold text-[#D71920]">{selectedCourse.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#D71920] to-[#B91518] h-3 rounded-full transition-all"
                        style={{ width: `${selectedCourse.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button className="w-full bg-gradient-to-r from-[#D71920] to-[#B91518] text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition">
                  {selectedCourse.progress === 100 ? 'Review Course' : 'Continue Learning'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
