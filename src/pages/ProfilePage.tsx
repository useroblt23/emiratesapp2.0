import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, MapPin, Mail, Shield, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    country: currentUser?.country || '',
    bio: currentUser?.bio || '',
  });

  if (!currentUser) return null;

  const handleSave = () => {
    setCurrentUser({
      ...currentUser,
      ...formData,
    });
    setIsEditing(false);
  };

  const canEdit = currentUser.role === 'governor' || !isEditing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#1C1C1C] mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="relative inline-block mb-6">
              <img
                src={currentUser.photoURL}
                alt={currentUser.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-[#EADBC8]"
              />
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-[#1C1C1C] mb-1">
              {currentUser.name}
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <Shield className={`w-4 h-4 ${
                currentUser.role === 'governor' ? 'text-[#B9975B]' :
                currentUser.role === 'mentor' ? 'text-[#D71920]' :
                'text-gray-500'
              }`} />
              <span className={`text-sm font-bold capitalize ${
                currentUser.role === 'governor' ? 'text-[#B9975B]' :
                currentUser.role === 'mentor' ? 'text-[#D71920]' :
                'text-gray-600'
              }`}>
                {currentUser.role}
              </span>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{currentUser.country}</span>
              </div>
            </div>

            {currentUser.role === 'governor' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-[#B9975B] to-[#A8865A] rounded-xl text-white">
                <p className="text-sm font-bold mb-1">Governor Status</p>
                <p className="text-xs opacity-90">Full system access granted</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1C1C1C]">
                Account Information
              </h3>
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
                      setFormData({
                        name: currentUser.name,
                        email: currentUser.email,
                        country: currentUser.country,
                        bio: currentUser.bio,
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-[#1C1C1C] rounded-xl font-bold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1C1C1C] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/20 transition disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1C1C1C] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/20 transition disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1C1C1C] mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/20 transition disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1C1C1C] mb-2">
                  Role
                </label>
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
                <label className="block text-sm font-bold text-[#1C1C1C] mb-2">
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

          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <h3 className="text-2xl font-bold text-[#1C1C1C] mb-4">Activity Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#EADBC8]/30 rounded-xl">
                <p className="text-3xl font-bold text-[#D71920] mb-1">12</p>
                <p className="text-sm text-gray-600">Courses</p>
              </div>
              <div className="p-4 bg-[#EADBC8]/30 rounded-xl">
                <p className="text-3xl font-bold text-[#B9975B] mb-1">48</p>
                <p className="text-sm text-gray-600">Messages</p>
              </div>
              <div className="p-4 bg-[#EADBC8]/30 rounded-xl">
                <p className="text-3xl font-bold text-[#D71920] mb-1">3</p>
                <p className="text-sm text-gray-600">Certificates</p>
              </div>
              <div className="p-4 bg-[#EADBC8]/30 rounded-xl">
                <p className="text-3xl font-bold text-[#B9975B] mb-1">89%</p>
                <p className="text-sm text-gray-600">Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
