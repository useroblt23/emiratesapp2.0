import { useState, useEffect } from 'react';
import { FolderPlus } from 'lucide-react';
import {
  Module,
  getAllModules
} from '../../../services/moduleService';

export default function ModuleManager() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grouped' | 'all'>('grouped');

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

  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <div className="glass-light border border-gray-200 rounded-xl p-3 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <FolderPlus className="w-5 h-5 md:w-6 md:h-6 text-blue-400 flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="text-base md:text-xl font-bold text-gray-900 truncate">Module Management</h2>
            <p className="text-gray-600 text-xs md:text-sm">Modules: {modules.length}</p>
            <p className="text-gray-600 text-xs hidden md:block">Create from Coach Dashboard</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <div className="flex glass-light rounded-xl p-1">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-2 md:px-3 py-1.5 rounded text-xs md:text-sm font-semibold transition ${
                viewMode === 'grouped'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              Grouped
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-2 md:px-3 py-1.5 rounded text-xs md:text-sm font-semibold transition ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-3">Loading modules...</p>
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-12 glass-light rounded-xl">
          <FolderPlus className="w-16 h-16 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">No modules created yet</p>
          <p className="text-gray-600 text-sm mt-1">Modules are created from Coach Dashboard</p>
        </div>
      ) : viewMode === 'all' ? (
        <div className="glass-light rounded-xl p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            All Modules ({modules.length})
          </h3>
          <div className="space-y-2">
            {modules
              .sort((a, b) => {
                if (a.category !== b.category) {
                  return a.category.localeCompare(b.category);
                }
                return a.order - b.order;
              })
              .map((module) => (
                <div
                  key={module.id}
                  className="glass-light rounded-xl p-4 hover:glass-bubble transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">
                      {module.category}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                      #{module.order}
                    </span>
                    <h4 className="font-bold text-gray-900">{module.name}</h4>
                    {module.visible && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                        VISIBLE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                  {module.quiz_id && (
                    <p className="text-xs text-green-600 mt-2">
                      Quiz Required: {module.quiz_id}
                    </p>
                  )}
                  {module.cover_image && (
                    <p className="text-xs text-cyan-400 mt-1">
                      Has cover image
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedModules).map(([category, categoryModules]) => (
            <div key={category} className="glass-light rounded-xl p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-3 capitalize">
                {category} Modules
              </h3>
              <div className="space-y-2">
                {categoryModules.map((module) => (
                  <div
                    key={module.id}
                    className="glass-light rounded-xl p-4 hover:glass-bubble transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                        #{module.order}
                      </span>
                      <h4 className="font-bold text-gray-900">{module.name}</h4>
                      {module.visible && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                          VISIBLE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    {module.quiz_id && (
                      <p className="text-xs text-green-600 mt-2">
                        Quiz Required: {module.quiz_id}
                      </p>
                    )}
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
