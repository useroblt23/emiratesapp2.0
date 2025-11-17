import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FolderPlus, Upload } from 'lucide-react';
import { getMainModule, getSubmodulesByParent, MainModule, Submodule } from '../services/mainModuleService';
import { motion } from 'framer-motion';
import CreateModuleForm from '../components/CreateModuleForm';
import NewCourseForm from '../components/NewCourseForm';

export default function MainModuleViewerPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [mainModule, setMainModule] = useState<MainModule | null>(null);
  const [submodules, setSubmodules] = useState<Submodule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);

  useEffect(() => {
    if (moduleId) {
      loadModuleData();
    }
  }, [moduleId]);

  const loadModuleData = async () => {
    if (!moduleId) return;

    try {
      const module = await getMainModule(moduleId);
      setMainModule(module);

      if (module) {
        const subs = await getSubmodulesByParent(moduleId);
        setSubmodules(subs);
      }
    } catch (error) {
      console.error('Error loading main module:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D71920] border-t-transparent"></div>
      </div>
    );
  }

  if (!mainModule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Module Not Found</h1>
        <button
          onClick={() => navigate('/coach/dashboard')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-lg font-semibold hover:shadow-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <button
        onClick={() => navigate('/coach/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <img
          src={mainModule.coverImage}
          alt={mainModule.title}
          className="w-full h-80 object-cover"
        />
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{mainModule.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{mainModule.description}</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Submodule
            </button>
            <button
              onClick={() => setShowAddCourse(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              <Upload className="w-5 h-5" />
              Add Course
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Submodules ({submodules.length})
        </h2>
      </div>

      {submodules.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FolderPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Submodules Yet</h3>
          <p className="text-gray-600 mb-6">
            Start building your module by adding submodules
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create First Submodule
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submodules.map((submodule) => (
            <motion.div
              key={submodule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
              onClick={() => navigate(`/submodules/${submodule.id}`)}
            >
              <img
                src={submodule.coverImage}
                alt={submodule.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    Submodule {submodule.order}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{submodule.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{submodule.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateModuleForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={loadModuleData}
      />

      <NewCourseForm
        isOpen={showAddCourse}
        onClose={() => setShowAddCourse(false)}
        onSuccess={loadModuleData}
      />
    </div>
  );
}
