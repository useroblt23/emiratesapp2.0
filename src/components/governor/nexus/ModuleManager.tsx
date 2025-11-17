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
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderPlus className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-slate-100">Module Management</h2>
            <p className="text-slate-400 text-sm">View course modules ({modules.length} total)</p>
            <p className="text-slate-400 text-xs mt-1">Create modules from Coach Dashboard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                viewMode === 'grouped'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Grouped
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              All Modules
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 mt-3">Loading modules...</p>
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-12 bg-slate-700 rounded-lg">
          <FolderPlus className="w-16 h-16 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">No modules created yet</p>
          <p className="text-slate-400 text-sm mt-1">Modules are created from Coach Dashboard</p>
        </div>
      ) : viewMode === 'all' ? (
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-bold text-slate-100 mb-3">
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
                  className="bg-slate-600 rounded-lg p-4 hover:bg-slate-550 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded uppercase">
                      {module.category}
                    </span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded">
                      #{module.order}
                    </span>
                    <h4 className="font-bold text-slate-100">{module.name}</h4>
                    {module.visible && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded">
                        VISIBLE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{module.description}</p>
                  {module.quiz_id && (
                    <p className="text-xs text-green-400 mt-2">
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
            <div key={category} className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-bold text-slate-100 mb-3 capitalize">
                {category} Modules
              </h3>
              <div className="space-y-2">
                {categoryModules.map((module) => (
                  <div
                    key={module.id}
                    className="bg-slate-600 rounded-lg p-4 hover:bg-slate-550 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded">
                        #{module.order}
                      </span>
                      <h4 className="font-bold text-slate-100">{module.name}</h4>
                      {module.visible && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded">
                          VISIBLE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{module.description}</p>
                    {module.quiz_id && (
                      <p className="text-xs text-green-400 mt-2">
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
