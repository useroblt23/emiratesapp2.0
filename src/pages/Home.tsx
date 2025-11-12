import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useEffect, useState } from 'react';
import { Plane, Users, MessageCircle, Shirt, TrendingUp, Star, Crown } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

interface Progress {
  recruitmentStages: boolean;
  interviewQA: boolean;
  dressGuide: boolean;
}

export default function Home({ onNavigate }: HomeProps) {
  const [progress, setProgress] = useState<Progress>({
    recruitmentStages: false,
    interviewQA: false,
    dressGuide: false,
  });
  const [userName, setUserName] = useState('');
  const [hasStepProgram, setHasStepProgram] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.name);
          setProgress(data.progress);
          setHasStepProgram(data.hasStepProgram || false);
        }
      }
    };
    fetchUserData();
  }, []);

  const completedCount = Object.values(progress).filter(Boolean).length;

  const cards = [
    {
      title: 'Recruitment Stages',
      description: 'Learn about Open Day, Assessment, and Final Interview',
      icon: Users,
      color: 'bg-[#D71920]',
      page: 'recruitment',
    },
    {
      title: 'Interview Q&A',
      description: 'Practice with real Emirates interview questions',
      icon: MessageCircle,
      color: 'bg-[#C8A14B]',
      page: 'interview',
    },
    {
      title: 'Dress & Conduct',
      description: 'Master grooming standards and professional etiquette',
      icon: Shirt,
      color: 'bg-[#2C2C2C]',
      page: 'dress',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3EF] to-white pb-24">
      <div className="bg-[#D71920] text-white px-6 py-12 rounded-b-3xl shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Plane className="w-8 h-8" />
            <h1 className="text-3xl font-bold">CabinPro</h1>
          </div>
          <h2 className="text-xl mb-2">Welcome back, {userName}!</h2>
          <p className="text-red-100">
            Your Emirates Cabin Crew Trainer
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-[#C8A14B]" />
            <h3 className="text-xl font-bold text-[#2C2C2C]">Your Progress</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className="bg-[#C8A14B] h-3 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / 3) * 100}%` }}
              />
            </div>
            <span className="text-[#2C2C2C] font-semibold">
              {completedCount} of 3
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            You've completed {completedCount} module{completedCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid gap-4 mb-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.page}
                onClick={() => onNavigate(card.page)}
                className="bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className={`${card.color} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600">{card.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {hasStepProgram ? (
          <button
            onClick={() => onNavigate('onestep')}
            className="w-full bg-gradient-to-r from-[#C8A14B] to-[#D4AF37] rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6" />
              <h3 className="text-xl font-bold">One Step Program</h3>
            </div>
            <p className="text-sm text-yellow-100">
              Access your premium AI tools, advanced practice modules, and success strategies
            </p>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('onestep')}
            className="w-full bg-gradient-to-r from-[#C8A14B] to-[#D4AF37] rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6" />
              <h3 className="text-xl font-bold">✨ Unlock One Step Program</h3>
            </div>
            <p className="text-sm text-yellow-100 mb-3">
              Get AI-powered CV analysis, personalized interview coaching, and advanced preparation materials
            </p>
            <div className="inline-block bg-white text-[#C8A14B] px-4 py-2 rounded-xl font-semibold text-sm">
              Coming Soon
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
