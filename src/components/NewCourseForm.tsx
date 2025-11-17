import { useState, useRef, useEffect } from 'react';
import { X, Upload, Plus, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createCourse, updateCourse, Course } from '../services/courseService';
import { getAllMainModules, getSubmodulesByParent, MainModule, Submodule } from '../services/mainModuleService';
import { useApp } from '../context/AppContext';

interface NewCourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedSubmoduleId?: string;
  editingCourse?: Course;
}

export default function NewCourseForm({ isOpen, onClose, onSuccess, preselectedSubmoduleId, editingCourse }: NewCourseFormProps) {
  const { currentUser } = useApp();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [submoduleId, setSubmoduleId] = useState(preselectedSubmoduleId || '');
  const [mainModules, setMainModules] = useState<MainModule[]>([]);
  const [submodules, setSubmodules] = useState<Submodule[]>([]);
  const [selectedMainModule, setSelectedMainModule] = useState('');
  const [loading, setLoading] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMainModules();
      if (editingCourse) {
        setTitle(editingCourse.title);
        setSubtitle(editingCourse.subtitle || '');
        setDescription(editingCourse.description);
        setVideoUrl(editingCourse.video_url || '');
        setThumbnail(editingCourse.thumbnail);
        setSubmoduleId(editingCourse.submodule_id || '');
      } else if (preselectedSubmoduleId) {
        setSubmoduleId(preselectedSubmoduleId);
      }
    }
  }, [isOpen, preselectedSubmoduleId, editingCourse]);

  useEffect(() => {
    if (selectedMainModule) {
      loadSubmodules(selectedMainModule);
    } else {
      setSubmodules([]);
    }
  }, [selectedMainModule]);

  const loadMainModules = async () => {
    const modules = await getAllMainModules();
    setMainModules(modules);
  };

  const loadSubmodules = async (mainModuleId: string) => {
    const subs = await getSubmodulesByParent(mainModuleId);
    setSubmodules(subs);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG or JPG)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !videoUrl.trim() || !thumbnail) {
      alert('Please fill in all required fields');
      return;
    }

    if (!selectedMainModule && !preselectedSubmoduleId) {
      alert('Please select a main module');
      return;
    }

    if (!currentUser) {
      alert('You must be logged in to create courses');
      return;
    }

    setLoading(true);
    try {
      const embedUrl = convertToEmbedUrl(videoUrl);

      if (editingCourse) {
        await updateCourse(editingCourse.id, {
          title: title.trim(),
          description: description.trim(),
          thumbnail,
          video_url: embedUrl,
          subtitle: subtitle.trim() || undefined,
          module_id: selectedMainModule || undefined,
          submodule_id: submoduleId || undefined
        });
        alert('Course updated successfully!');
      } else {
        await createCourse({
          title: title.trim(),
          description: description.trim(),
          instructor: currentUser.name,
          thumbnail,
          duration: '45 min',
          level: 'beginner',
          plan: 'free',
          category: 'interview',
          lessons: 1,
          allow_download: false,
          content_type: 'video',
          video_url: embedUrl,
          subtitle: subtitle.trim() || undefined,
          module_id: selectedMainModule || undefined,
          submodule_id: submoduleId || undefined,
          visible: true
        }, currentUser.uid);
        alert('Course created successfully!');
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setDescription('');
    setVideoUrl('');
    setThumbnail('');
    setSubmoduleId(preselectedSubmoduleId || '');
    setSelectedMainModule('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="sticky top-0 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white p-4 sm:p-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                {editingCourse ? <Edit className="w-5 h-5 sm:w-6 sm:h-6" /> : <Upload className="w-5 h-5 sm:w-6 sm:h-6" />}
                <h2 className="text-xl sm:text-2xl font-bold">{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Fire Safety Training"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g., Emergency Response Basics"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what students will learn..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-none transition resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  YouTube Video URL *
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-none transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Will be converted to embedded format</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Thumbnail * (PNG or JPG)
                </label>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#D71920] transition"
                >
                  {thumbnail ? (
                    <div className="space-y-3">
                      <img
                        src={thumbnail}
                        alt="Thumbnail preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <p className="text-sm text-gray-600">Click to change thumbnail</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600 font-semibold">Click to upload thumbnail</p>
                      <p className="text-sm text-gray-500">PNG or JPG (recommended: 1280x720px)</p>
                    </div>
                  )}
                </div>
              </div>

              {!preselectedSubmoduleId && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Select Main Module *
                    </label>
                    <select
                      value={selectedMainModule}
                      onChange={(e) => {
                        setSelectedMainModule(e.target.value);
                        setSubmoduleId('');
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-none transition"
                      required
                    >
                      <option value="">Select main module...</option>
                      {mainModules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Assign to Submodule (Optional)
                    </label>
                    <select
                      value={submoduleId}
                      onChange={(e) => setSubmoduleId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-none transition"
                      disabled={!selectedMainModule}
                    >
                      <option value="">No submodule (assign to main module only)</option>
                      {submodules.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          Submodule {sub.order}: {sub.title}
                        </option>
                      ))}
                    </select>
                    {!selectedMainModule ? (
                      <p className="text-xs text-gray-500 mt-1">Select a main module first</p>
                    ) : submodules.length === 0 ? (
                      <p className="text-xs text-gray-500 mt-1">This module has no submodules yet</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Leave empty to assign to main module only</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white py-3 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base">{editingCourse ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      {editingCourse ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      <span className="text-sm sm:text-base">{editingCourse ? 'Update Course' : 'Create Course'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
