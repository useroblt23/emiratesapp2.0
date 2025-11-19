import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Plane, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

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
      console.log('Attempting login with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase Auth successful, user:', user.uid);

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      console.log('Firestore user doc exists:', userDoc.exists());

      if (!userDoc.exists()) {
        console.error('User document not found in Firestore for uid:', user.uid);
        throw new Error('User profile not found. Please contact support.');
      }

      const userData = userDoc.data();
      console.log('User data from Firestore:', userData);

      const currentUser = {
        uid: user.uid,
        email: userData.email || user.email,
        name: userData.name || 'User',
        role: (userData.role || 'student') as 'student' | 'mentor' | 'governor',
        plan: (userData.plan || 'free') as 'free' | 'pro' | 'vip',
        country: userData.country || '',
        bio: userData.bio || '',
        expectations: userData.expectations || '',
        photoURL: userData.photo_base64 || '',
        hasCompletedOnboarding: userData.hasCompletedOnboarding || false,
        hasSeenWelcomeBanner: userData.hasSeenWelcomeBanner || false,
        onboardingCompletedAt: userData.onboardingCompletedAt,
        welcomeBannerSeenAt: userData.welcomeBannerSeenAt,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString(),
      };

      console.log('Setting current user:', currentUser);
      setCurrentUser(currentUser);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);

      let errorMessage = 'Invalid email or password';

      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="liquid-crystal-panel p-8">
          <div className="flex justify-center mb-6">
            <img
              src="/Crews (2).png"
              alt="The Crew Academy"
              className="h-24 w-auto"
            />
          </div>

          <h1 className="text-3xl font-bold text-center liquid-text-primary mb-2">
            Welcome Back
          </h1>
          <p className="text-center liquid-text-secondary mb-8">
            Sign in to The Crew Academy
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold liquid-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 liquid-input"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold liquid-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 liquid-input"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="liquid-card-overlay bg-red-500/20 border-red-400/40 text-white px-4 py-3 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full liquid-button-primary text-white py-3.5 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="liquid-text-secondary text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-white font-bold hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
