import { useState, useEffect } from 'react';
import { FolderPlus, Edit, Trash2, Plus, X, Save } from 'lucide-react';
import {
  Module,
  getAllModules,
  createModule,
  updateModule,
  deleteModule
} from '../../../services/moduleService';

export default function ModuleManager() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'grooming' as 'grooming' | 'service' | 'safety' | 'interview' | 'language',
    order: 1,
    quiz_id: ''
  });

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    try {
      console.log('Loading modules from Firestore...');
      const data = await getAllModules();
      console.log('Modules loaded:', data.length);
      console.log('Module data:', data);
      setModules(data);
    } catch (error) {
      console.error('Error loading modules:', error);
      alert('Failed to load modules. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingModule) {
        await updateModule(editingModule.id, formData);
        alert('Module updated successfully!');
      } else {
        const moduleData = {
          ...formData,
          lessons: []
        };
        await createModule(moduleData);
        alert('Module created successfully!');
      }

      resetForm();
      loadModules();
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Failed to save module. Check console for details.');
    }
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setFormData({
      name: module.name,
      description: module.description,
      category: module.category,
      order: module.order,
      quiz_id: module.quiz_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? Courses in this module will become standalone.')) {
      return;
    }

    try {
      await deleteModule(moduleId);
      alert('Module deleted successfully!');
      loadModules();
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'grooming',
      order: 1,
      quiz_id: ''
    });
    setEditingModule(null);
    setShowForm(false);
  };

  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderPlus className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-slate-100">Module Management</h2>
            <p className="text-slate-400 text-sm">Create and organize course modules</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Module'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-700 rounded-lg p-4 mb-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 mb-4">
            {editingModule ? 'Edit Module' : 'Create New Module'}
          </h3>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Module Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g., Module 1 - Open Day Basics"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Describe what this module covers..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                required
                className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="grooming">Grooming</option>
                <option value="service">Service</option>
                <option value="safety">Safety</option>
                <option value="interview">Interview</option>
                <option value="language">Language</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Order *
              </label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                required
                className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Quiz ID (Optional)
            </label>
            <input
              type="text"
              value={formData.quiz_id}
              onChange={(e) => setFormData({ ...formData, quiz_id: e.target.value })}
              className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Quiz ID to unlock next module"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingModule ? 'Update Module' : 'Create Module'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 mt-3">Loading modules...</p>
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-12 bg-slate-700 rounded-lg">
          <FolderPlus className="w-16 h-16 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">No modules created yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first module to organize courses</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedModules).map(([category, categoryModules]) => (
            <div key={category} className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-bold text-slate-100 mb-3 capitalize">
                {category} Modules
              </h3>
              <div className="space-y-2">
                {categoryModules.map((module) => (
                  <div
                    key={module.id}
                    className="bg-slate-600 rounded-lg p-4 flex items-center justify-between hover:bg-slate-550 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded">
                          #{module.order}
                        </span>
                        <h4 className="font-bold text-slate-100">{module.name}</h4>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{module.description}</p>
                      {module.quiz_id && (
                        <p className="text-xs text-green-400 mt-2">
                          Quiz Required: {module.quiz_id}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(module)}
                        className="p-2 bg-slate-700 hover:bg-slate-800 text-blue-400 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(module.id)}
                        className="p-2 bg-slate-700 hover:bg-slate-800 text-red-400 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
