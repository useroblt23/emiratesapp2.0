import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Plane, User, Mail, Lock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { countries } from '../../data/countries';
import { supabase } from '../../lib/supabase';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan');
  const priceId = searchParams.get('priceId');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [expectations, setExpectations] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useApp();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        name,
        role: 'student',
        plan: 'free',
        country,
        bio,
        expectations,
        photo_base64: '',
        points: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const newUser = {
        uid: user.uid,
        email,
        name,
        role: 'student' as const,
        plan: 'free' as const,
        country,
        bio,
        photoURL: '',
      };

      setCurrentUser(newUser);

      if (selectedPlan && selectedPlan !== 'free' && priceId) {
        try {
          const { data: { session } } = await supabase.auth.getSession();

          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.access_token || user.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              price_id: priceId,
              success_url: `${window.location.origin}/dashboard?upgrade=success&plan=${selectedPlan}`,
              cancel_url: `${window.location.origin}/upgrade?upgrade=cancelled`,
              mode: 'subscription',
            }),
          });

          const data = await response.json();

          if (data.url) {
            window.location.href = data.url;
            return;
          }
        } catch (checkoutError) {
          console.error('Checkout error:', checkoutError);
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error details:', err);
      let errorMessage = 'Registration failed. Please try again.';

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="liquid-crystal-panel p-6 md:p-8">
          <div className="flex justify-center mb-6">
            <img
              src="/Crews (2).png"
              alt="The Crew Academy"
              className="h-16 w-auto"
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">
            Join The Crew Academy
          </h1>
          <p className="text-center text-sm md:text-base text-gray-600 mb-4">
            Start your Emirates cabin crew journey
          </p>

          {selectedPlan && selectedPlan !== 'free' && (
            <div className="bg-gradient-to-r from-[#D71920]/10 to-[#CBA135]/10 border border-[#D71920]/20 rounded-xl p-3 mb-4">
              <p className="text-center text-sm font-semibold text-gray-900">
                Selected Plan: <span className="text-[#D71920] uppercase">{selectedPlan}</span>
              </p>
              <p className="text-center text-xs text-gray-600 mt-1">
                You'll be redirected to checkout after registration
              </p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 liquid-input"
                  placeholder="John Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3 liquid-input"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Country *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 liquid-input appearance-none bg-white"
                >
                  <option value="">Select your country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Brief Description About Yourself
              </label>
              <div className="relative">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 liquid-input resize-none"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                What I Expect From This Academy
              </label>
              <div className="relative">
                <textarea
                  value={expectations}
                  onChange={(e) => setExpectations(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 liquid-input resize-none"
                  placeholder="What are your goals and expectations?"
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
              className="w-full liquid-button-primary text-gray-900 py-3.5 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#D71920] font-bold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
