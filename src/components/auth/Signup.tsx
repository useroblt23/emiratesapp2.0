import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { generateKeyPair } from '../../utils/encryption';
import { Plane } from 'lucide-react';

interface SignupProps {
  onToggleAuth: () => void;
}

export default function Signup({ onToggleAuth }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const { publicKey, privateKey } = generateKeyPair();

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        publicKey,
        hasStepProgram: false,
        progress: {
          recruitmentStages: false,
          interviewQA: false,
          dressGuide: false,
        },
      });

      localStorage.setItem('privateKey', privateKey);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const errorCode = (err as { code: string }).code;
        if (errorCode === 'auth/email-already-in-use') {
          setError('This email is already registered. Please sign in instead.');
        } else if (errorCode === 'auth/weak-password') {
          setError('Password should be at least 6 characters.');
        } else {
          setError('Failed to create account. Please try again.');
        }
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3EF] to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-[#D71920] p-4 rounded-full">
            <Plane className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#2C2C2C] text-center mb-2">
          Create Account
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Start your Emirates cabin crew preparation journey
        </p>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D71920] focus:border-transparent transition"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D71920] focus:border-transparent transition"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D71920] focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D71920] text-white py-3 rounded-xl font-semibold hover:bg-[#B91518] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onToggleAuth}
              className="text-[#D71920] font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
