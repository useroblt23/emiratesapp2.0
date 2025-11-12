import { useApp } from '../context/AppContext';
import { BookOpen, MessageCircle, Users, TrendingUp, Award, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockCourses } from '../data/mockData';

export default function Dashboard() {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (currentUser.role === 'student') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-[#1C1C1C] mb-2">
            Welcome back, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">Continue your journey to Emirates excellence</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-[#D71920] to-[#B91518] rounded-2xl shadow-lg p-6 text-white"
          >
            <BookOpen className="w-10 h-10 mb-4 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Courses Enrolled</p>
            <p className="text-4xl font-bold">4</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-[#B9975B] to-[#A8865A] rounded-2xl shadow-lg p-6 text-white"
          >
            <TrendingUp className="w-10 h-10 mb-4 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Overall Progress</p>
            <p className="text-4xl font-bold">48%</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-[#1C1C1C] to-[#2C2C2C] rounded-2xl shadow-lg p-6 text-white"
          >
            <Award className="w-10 h-10 mb-4 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Certificates Earned</p>
            <p className="text-4xl font-bold">1</p>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#1C1C1C] mb-6">Continue Learning</h2>
          <div className="space-y-4">
            {mockCourses.filter(c => c.progress && c.progress < 100).map((course) => (
              <div key={course.id} className="flex items-center gap-4 p-4 bg-[#EADBC8]/30 rounded-xl hover:bg-[#EADBC8]/50 transition cursor-pointer">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-[#1C1C1C]">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.instructor}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">{course.progress}% complete</span>
                      <span className="text-xs text-gray-500">{course.duration}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#D71920] to-[#B91518] h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-r from-[#D71920] to-[#B91518] rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Ready for your next challenge?</h3>
          <p className="mb-4 text-red-100">Explore new courses and continue building your skills</p>
          <button className="bg-white text-[#D71920] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition">
            Browse All Courses
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (currentUser.role === 'mentor') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-[#1C1C1C] mb-2">
            Mentor Dashboard
          </h1>
          <p className="text-gray-600">Guide students on their journey to success</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <Users className="w-10 h-10 text-[#D71920] mb-4" />
            <p className="text-sm text-gray-600 mb-1">Active Students</p>
            <p className="text-4xl font-bold text-[#1C1C1C]">23</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <BookOpen className="w-10 h-10 text-[#B9975B] mb-4" />
            <p className="text-sm text-gray-600 mb-1">Courses Published</p>
            <p className="text-4xl font-bold text-[#1C1C1C]">8</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <MessageCircle className="w-10 h-10 text-[#D71920] mb-4" />
            <p className="text-sm text-gray-600 mb-1">Unread Messages</p>
            <p className="text-4xl font-bold text-[#1C1C1C]">5</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <Clock className="w-10 h-10 text-[#B9975B] mb-4" />
            <p className="text-sm text-gray-600 mb-1">This Week</p>
            <p className="text-4xl font-bold text-[#1C1C1C]">12h</p>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-[#1C1C1C] mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-[#EADBC8]/30 rounded-xl">
              <div className="w-2 h-2 bg-[#D71920] rounded-full"></div>
              <p className="text-[#1C1C1C]">Ahmed Ali completed Service Excellence course</p>
              <span className="ml-auto text-sm text-gray-500">2h ago</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-[#EADBC8]/30 rounded-xl">
              <div className="w-2 h-2 bg-[#B9975B] rounded-full"></div>
              <p className="text-[#1C1C1C]">Sophie Martin sent you a message</p>
              <span className="ml-auto text-sm text-gray-500">5h ago</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-[#EADBC8]/30 rounded-xl">
              <div className="w-2 h-2 bg-[#D71920] rounded-full"></div>
              <p className="text-[#1C1C1C]">New student enrolled: Yuki Tanaka</p>
              <span className="ml-auto text-sm text-gray-500">1d ago</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-4xl font-bold text-[#1C1C1C] mb-2">
          Governor Overview
        </h1>
        <p className="text-gray-600">System administration and control center</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-[#D71920] to-[#B91518] rounded-2xl shadow-lg p-6 text-white"
        >
          <Users className="w-10 h-10 mb-4 opacity-80" />
          <p className="text-sm opacity-90 mb-1">Total Users</p>
          <p className="text-4xl font-bold">127</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-[#B9975B] to-[#A8865A] rounded-2xl shadow-lg p-6 text-white"
        >
          <BookOpen className="w-10 h-10 mb-4 opacity-80" />
          <p className="text-sm opacity-90 mb-1">Total Courses</p>
          <p className="text-4xl font-bold">24</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2C2C2C] rounded-2xl shadow-lg p-6 text-white"
        >
          <MessageCircle className="w-10 h-10 mb-4 opacity-80" />
          <p className="text-sm opacity-90 mb-1">Active Chats</p>
          <p className="text-4xl font-bold">43</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-[#D71920] to-[#B91518] rounded-2xl shadow-lg p-6 text-white"
        >
          <TrendingUp className="w-10 h-10 mb-4 opacity-80" />
          <p className="text-sm opacity-90 mb-1">Engagement Rate</p>
          <p className="text-4xl font-bold">89%</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-[#1C1C1C] mb-4">System Health</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Server Status</span>
                <span className="text-green-600 font-bold">Operational</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600 font-bold">98%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Storage</span>
                <span className="text-yellow-600 font-bold">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-[#1C1C1C] mb-4">Recent Actions</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-[#EADBC8]/30 rounded-xl">
              <div className="w-2 h-2 bg-[#B9975B] rounded-full"></div>
              <p className="text-[#1C1C1C] text-sm">Global alert created</p>
              <span className="ml-auto text-xs text-gray-500">10m ago</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-[#EADBC8]/30 rounded-xl">
              <div className="w-2 h-2 bg-[#D71920] rounded-full"></div>
              <p className="text-[#1C1C1C] text-sm">New course approved</p>
              <span className="ml-auto text-xs text-gray-500">1h ago</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-[#EADBC8]/30 rounded-xl">
              <div className="w-2 h-2 bg-[#1C1C1C] rounded-full"></div>
              <p className="text-[#1C1C1C] text-sm">User promoted to mentor</p>
              <span className="ml-auto text-xs text-gray-500">3h ago</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
