import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BarChart3, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { getVisibleRootModules, Module } from '../services/moduleService';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'all' | Module['category']>('all');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      console.log('CoursesPage: Fetching visible root modules (Module 1 only)...');
      const modulesData = await getVisibleRootModules();
      console.log('CoursesPage: Visible root modules fetched:', modulesData.length);
      setModules(modulesData);
    } catch (error) {
      console.error('CoursesPage: Error fetching modules:', error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Modules' },
    { id: 'interview', label: 'Interview Prep' },
    { id: 'grooming', label: 'Grooming' },
    { id: 'service', label: 'Customer Service' },
    { id: 'safety', label: 'Safety' },
    { id: 'language', label: 'Language' },
  ];

  const displayModules = useMemo(() => {
    if (selectedCategory === 'all') return modules;
    return modules.filter(module => module.category === selectedCategory);
  }, [selectedCategory, modules]);

  return (
    <div className="min-h-screen">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#000000] mb-2">
          Training Modules
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Master the skills needed to become a successful cabin crew member
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-[#D71920] to-[#B91518] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D71920] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading modules...</p>
          </div>
        </div>
      ) : displayModules.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Modules Available</h3>
          <p className="text-gray-600">Training modules will be available soon.</p>
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
                    <span>{module.lessons?.length || 0} Lessons</span>
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
      )}
    </div>
  );
}
