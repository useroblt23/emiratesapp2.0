import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { demoUsers } from '../../data/mockData';
import { Plane, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const demoUser = demoUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (demoUser) {
        const { password: _, ...userWithoutPassword } = demoUser;
        setCurrentUser(userWithoutPassword);
        navigate('/dashboard');
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Login failed. Please try again.');
      }

      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (dbError) throw dbError;

      if (!userData) {
        throw new Error('User profile not found. Please contact support.');
      }

      const user = {
        uid: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as 'student' | 'mentor' | 'governor',
        country: userData.country,
        bio: userData.bio || '',
        photoURL: userData.photo_url || 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
      };

      setCurrentUser(user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EADBC8] via-[#F5E6D3] to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D71921] to-[#B91518] rounded-2xl flex items-center justify-center shadow-lg">
              <Plane className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-[#000000] mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Sign in to Crew's Academy
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#000000] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71921] focus:ring-2 focus:ring-[#D71921]/20 transition"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#000000] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71921] focus:ring-2 focus:ring-[#D71921]/20 transition"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D71921] to-[#B91518] text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-[#FFD700]/30 transform hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#D71921] font-bold hover:underline"
              >
                Register
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-bold text-gray-700 mb-3">Test Accounts (Dev Only):</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => quickLogin('governor@crewsacademy.com', 'test123')}
                className="w-full text-left px-4 py-2 bg-[#FFD700] hover:bg-[#D4AF37] text-[#000000] rounded-lg transition text-sm font-bold"
              >
                Governor: governor@crewsacademy.com / test123
              </button>
              <button
                type="button"
                onClick={() => quickLogin('mentor@crewsacademy.com', 'test123')}
                className="w-full text-left px-4 py-2 bg-[#D71921] hover:bg-[#B91518] text-white rounded-lg transition text-sm font-bold"
              >
                Mentor: mentor@crewsacademy.com / test123
              </button>
              <button
                type="button"
                onClick={() => quickLogin('student@crewsacademy.com', 'test123')}
                className="w-full text-left px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition text-sm font-bold"
              >
                Student: student@crewsacademy.com / test123
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
