import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, MapPin, Mail, Shield, Save, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    country: currentUser?.country || '',
    bio: currentUser?.bio || '',
    photo_base64: currentUser?.photoURL || '',
  });

  if (!currentUser) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoPreview(base64String);
      setFormData({ ...formData, photo_base64: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          country: formData.country,
          bio: formData.bio,
          photo_base64: formData.photo_base64,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.uid);

      if (error) throw error;

      setCurrentUser({
        ...currentUser,
        name: formData.name,
        country: formData.country,
        bio: formData.bio,
        photoURL: formData.photo_base64,
      });

      setIsEditing(false);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const displayPhoto = photoPreview || formData.photo_base64 || currentUser.photoURL;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <img
                  src={displayPhoto}
                  alt={currentUser.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#EADBC8] shadow-lg"
                />
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Change Photo
                </button>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">
              {currentUser.name}
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield
                className={`w-4 h-4 ${
                  currentUser.role === 'governor'
                    ? 'text-[#CBA135]'
                    : currentUser.role === 'mentor'
                    ? 'text-[#D71920]'
                    : 'text-gray-500'
                }`}
              />
              <span
                className={`text-sm font-bold capitalize ${
                  currentUser.role === 'governor'
                    ? 'text-[#CBA135]'
                    : currentUser.role === 'mentor'
                    ? 'text-[#D71920]'
                    : 'text-gray-600'
                }`}
              >
                {currentUser.role}
              </span>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="break-all">{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{currentUser.country}</span>
              </div>
            </div>

            {currentUser.role === 'governor' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-[#CBA135] to-[#B8941E] rounded-xl text-white">
                <p className="text-sm font-bold mb-1">Governor Status</p>
                <p className="text-xs opacity-90">Full system access granted</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Account Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-xl font-bold hover:shadow-lg transition"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setPhotoPreview(null);
                      setFormData({
                        name: currentUser.name,
                        email: currentUser.email,
                        country: currentUser.country,
                        bio: currentUser.bio,
                        photo_base64: currentUser.photoURL,
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/20 transition disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/20 transition disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Membership Plan
                </label>
                <input
                  type="text"
                  value={currentUser.plan.toUpperCase()}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 capitalize"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Role</label>
                <input
                  type="text"
                  value={currentUser.role}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 capitalize"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Role can only be changed by a Governor
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Bio / About Me
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/20 transition disabled:bg-gray-50 disabled:text-gray-600 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
