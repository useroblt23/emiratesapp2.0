import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Ban, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import { useFirestoreCollection } from '../../../hooks/useFirestoreRealtime';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useApp } from '../../../context/AppContext';

interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  status?: string;
  banned?: boolean;
  muted?: boolean;
}

export default function UserManager() {
  const { currentUser } = useApp();
  const { data: users, loading } = useFirestoreCollection<User>('users');
  const [processing, setProcessing] = useState<string | null>(null);

  const isGovernor = currentUser?.role === 'governor';

  const logAction = async (action: string, targetUserId: string, details: string) => {
    try {
      await addDoc(collection(db, 'auditEvents'), {
        eventType: action,
        userId: currentUser?.uid,
        userName: currentUser?.name,
        targetUserId,
        details,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const handleDowngrade = async (user: User) => {
    if (!isGovernor) return;
    if (!confirm(`Downgrade ${user.name} to free plan?`)) return;

    setProcessing(user.id);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        plan: 'free',
        updatedAt: new Date().toISOString(),
      });
      await logAction('downgrade', user.uid, `User ${user.name} downgraded to free plan`);
    } catch (error) {
      console.error('Error downgrading user:', error);
      alert('Failed to downgrade user');
    } finally {
      setProcessing(null);
    }
  };

  const handleDisable = async (user: User) => {
    if (!isGovernor) return;
    if (!confirm(`${user.banned ? 'Enable' : 'Disable'} account for ${user.name}?`)) return;

    setProcessing(user.id);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        banned: !user.banned,
        updatedAt: new Date().toISOString(),
      });
      await logAction(
        user.banned ? 'enable' : 'disable',
        user.uid,
        `User ${user.name} ${user.banned ? 'enabled' : 'disabled'}`
      );
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status');
    } finally {
      setProcessing(null);
    }
  };

  const handlePromote = async (user: User) => {
    if (!isGovernor) return;
    if (!confirm(`Promote ${user.name} to sub-governor?`)) return;

    setProcessing(user.id);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        role: 'mentor',
        updatedAt: new Date().toISOString(),
      });
      await logAction('promote', user.uid, `User ${user.name} promoted to sub-governor (mentor)`);
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Failed to promote user');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg border border-gray-200/50 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">User Manager</h2>
        {!loading && (
          <span className="ml-auto text-xs text-gray-500">{users.length} users</span>
        )}
      </div>

      {!isGovernor && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          View only mode. User management requires governor access.
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 bg-gray-50/50 rounded-lg">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white/50 rounded-lg border border-gray-200/50 hover:bg-white/80 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                    {user.banned && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        Banned
                      </span>
                    )}
                    {user.status === 'online' && (
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {user.role}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {user.plan}
                    </span>
                  </div>
                </div>

                {isGovernor && user.id !== currentUser?.uid && (
                  <div className="flex gap-2">
                    {user.plan !== 'free' && (
                      <button
                        onClick={() => handleDowngrade(user)}
                        disabled={processing === user.id}
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition disabled:opacity-50"
                        title="Downgrade to free"
                      >
                        <TrendingDown className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDisable(user)}
                      disabled={processing === user.id}
                      className={`p-2 rounded-lg transition disabled:opacity-50 ${
                        user.banned
                          ? 'bg-green-100 hover:bg-green-200 text-green-700'
                          : 'bg-red-100 hover:bg-red-200 text-red-700'
                      }`}
                      title={user.banned ? 'Enable account' : 'Disable account'}
                    >
                      {user.banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </button>
                    {user.role === 'student' && (
                      <button
                        onClick={() => handlePromote(user)}
                        disabled={processing === user.id}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition disabled:opacity-50"
                        title="Promote to sub-governor"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
