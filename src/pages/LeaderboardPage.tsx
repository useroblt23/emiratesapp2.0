import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { getLeaderboard, UserPoints } from '../services/rewardsService';
import BadgeDisplay from '../components/BadgeDisplay';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UserWithName extends UserPoints {
  userName: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<UserWithName[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(100);

      const leaderboardWithNames = await Promise.all(
        data.map(async (entry) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', entry.user_id));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                ...entry,
                userName: userData.name || userData.email || 'Unknown User'
              };
            }
            return {
              ...entry,
              userName: 'Unknown User'
            };
          } catch (error) {
            console.error('Error fetching user name:', error);
            return {
              ...entry,
              userName: 'Unknown User'
            };
          }
        })
      );

      setLeaderboard(leaderboardWithNames);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-gray-500 font-bold">#{index + 1}</span>;
  };

  const getRankBackground = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300';
    if (index === 1) return 'glass-light border-gray-300';
    if (index === 2) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-[#D71920] to-[#B91518] rounded-2xl p-8 text-white mb-6" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center gap-4">
            <TrendingUp className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold">Leaderboard</h1>
              <p className="text-white/90 mt-1">Top 100 Academy Members by Points</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#D71920] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4 font-semibold">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center shadow-lg">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">No members on the leaderboard yet</p>
            <p className="text-gray-500 text-sm mt-2">Be the first to earn points!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`${getRankBackground(index)} border-2 rounded-xl p-4 shadow-md hover:shadow-lg transition flex items-center gap-4`}
              >
                <div className="flex items-center justify-center w-12 h-12">
                  {getRankIcon(index)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-gray-800">
                      {entry.userName}
                    </h3>
                    <BadgeDisplay
                      rank={entry.current_rank}
                      size="sm"
                      verifiedCrew={entry.verified_crew}
                    />
                  </div>
                  {entry.daily_login_streak > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      🔥 {entry.daily_login_streak} day streak
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-[#D71920]">
                    {entry.total_points.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
