import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Star, Brain, FileText, Target, ChevronDown, CheckCircle, Lock } from 'lucide-react';
import PremiumCard from '../components/PremiumCard';
import ProgressTracker from '../components/ProgressTracker';
import AICVAnalyzerPlaceholder from '../components/AICVAnalyzerPlaceholder';
import { motion } from 'framer-motion';

const mockInterviewModules = [
  {
    title: 'Group Exercise: Building a Tower',
    content: `Master the most common Emirates group assessment:

• Common recruiter evaluation points: leadership, respect, participation
• How to contribute without dominating the conversation
• Building consensus and managing different personalities
• Time management and delegation strategies
• What recruiters look for in team dynamics

🧠 AI Practice Mode: Get personalized feedback on your group interaction style (coming soon)`
  },
  {
    title: 'Teamwork Evaluation Scenarios',
    content: `Navigate complex team challenges with confidence:

• Handling disagreements professionally
• Supporting struggling team members
• Taking initiative without overstepping
• Cultural sensitivity in diverse groups
• Conflict resolution techniques

Example scenarios with model responses and recruiter insights included.`
  },
  {
    title: 'English Proficiency & Communication',
    content: `Perfect your communication for Emirates standards:

• Clear articulation and professional vocabulary
• Active listening demonstration techniques
• Non-verbal communication mastery
• Handling language barriers with passengers
• Cultural communication styles

Practice with AI-powered pronunciation feedback (coming soon)`
  }
];

const strategySteps = [
  {
    title: 'Pre-Open Day Preparation',
    description: 'Complete checklist and mindset preparation',
    completed: true
  },
  {
    title: 'Energy & First Impressions',
    description: 'Master the art of positive presence',
    completed: true
  },
  {
    title: 'Common Recruiter Red Flags',
    description: 'Avoid the mistakes that eliminate candidates',
    completed: false
  },
  {
    title: 'Emirates Communication Style',
    description: 'Speak the language recruiters want to hear',
    completed: false
  },
  {
    title: 'Confidence Mastery',
    description: 'Project authentic confidence under pressure',
    completed: false
  }
];

export default function OneStepProgram() {
  const [hasStepProgram, setHasStepProgram] = useState(false);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [progress, setProgress] = useState(45);
  const [activeTab, setActiveTab] = useState('cv-analyzer');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setHasStepProgram(data.hasStepProgram || false);
        }
      }
    };
    fetchUserData();
  }, []);

  if (!hasStepProgram) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3EF] to-white pb-24">
        <div className="bg-gradient-to-r from-[#C8A14B] to-[#D4AF37] text-white px-6 py-12 rounded-b-3xl shadow-xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-8 h-8" />
              <h1 className="text-3xl font-bold">One Step Program</h1>
            </div>
            <p className="text-yellow-100">
              Unlock advanced tools for Emirates success
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 -mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="bg-gradient-to-r from-[#C8A14B] to-[#D4AF37] p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Lock className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-[#2C2C2C] mb-4">
              Unlock the One Step Program
            </h2>
            
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Get full access to tailored tools that boost your chances of passing Emirates recruitment with confidence.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="text-left">
                <h3 className="font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#C8A14B]" />
                  Premium Features
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#C8A14B] rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">AI CV Analyzer and Emirates CV adaptation guide</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#C8A14B] rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Full question bank for group and individual tasks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#C8A14B] rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">80% success method guide</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#C8A14B] rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Pre-interview confidence checklist</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-[#F5F3EF] rounded-xl p-6">
                <h4 className="font-bold text-[#2C2C2C] mb-3">Success Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-bold text-[#C8A14B]">80%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Score Improvement</span>
                    <span className="font-bold text-[#C8A14B]">+35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time to Preparation</span>
                    <span className="font-bold text-[#C8A14B]">2 weeks</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-2">Special Launch Price</h3>
              <div className="flex items-center justify-center gap-4 mb-3">
                <span className="text-3xl font-bold">$15</span>
                <span className="text-red-200 line-through">$49</span>
                <span className="bg-white text-[#D71920] px-3 py-1 rounded-full text-sm font-semibold">
                  70% OFF
                </span>
              </div>
              <p className="text-red-100 text-sm">
                Limited time offer • Full access • 30-day money-back guarantee
              </p>
            </div>

            <button className="bg-[#C8A14B] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#B8914B] transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Upgrade for $15 (Coming Soon)
            </button>
            
            <p className="text-gray-500 text-sm mt-4">
              Payment processing will be available soon. Join the waitlist to be notified!
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3EF] to-white pb-24">
      <div className="bg-gradient-to-r from-[#C8A14B] to-[#D4AF37] text-white px-6 py-12 rounded-b-3xl shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8" />
            <h1 className="text-3xl font-bold">One Step Program</h1>
          </div>
          <p className="text-yellow-100">
            Your premium Emirates preparation toolkit
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8">
        <ProgressTracker progress={progress} />

        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-lg">
          <button
            onClick={() => setActiveTab('cv-analyzer')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition ${
              activeTab === 'cv-analyzer'
                ? 'bg-[#C8A14B] text-white'
                : 'text-[#2C2C2C] hover:bg-[#F5F3EF]'
            }`}
          >
            AI CV Analyzer
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition ${
              activeTab === 'practice'
                ? 'bg-[#C8A14B] text-white'
                : 'text-[#2C2C2C] hover:bg-[#F5F3EF]'
            }`}
          >
            Interview Practice
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition ${
              activeTab === 'strategy'
                ? 'bg-[#C8A14B] text-white'
                : 'text-[#2C2C2C] hover:bg-[#F5F3EF]'
            }`}
          >
            80% Strategy
          </button>
        </div>

        {activeTab === 'cv-analyzer' && (
          <PremiumCard
            title="AI CV Analyzer"
            icon={<FileText className="w-6 h-6" />}
            locked={false}
          >
            <AICVAnalyzerPlaceholder hasAccess={true} />
          </PremiumCard>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-4">
            <PremiumCard
              title="Interview & Group Task Practice"
              icon={<Brain className="w-6 h-6" />}
              locked={false}
            >
              <p className="text-gray-600 mb-4">
                Master the most challenging parts of Emirates recruitment with detailed guidance and AI-powered practice.
              </p>
              
              <div className="space-y-3">
                {mockInterviewModules.map((module, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#F5F3EF] transition"
                    >
                      <span className="font-semibold text-[#2C2C2C]">{module.title}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#C8A14B] transition-transform ${
                          expandedModule === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedModule === index && (
                      <div className="px-4 pb-4">
                        <div className="bg-[#F5F3EF] rounded-lg p-4 whitespace-pre-line text-[#2C2C2C] text-sm leading-relaxed">
                          {module.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-gradient-to-r from-[#D71920] to-[#B91518] rounded-xl p-4 text-white">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Practice Mode
                </h4>
                <p className="text-sm text-red-100 mb-3">
                  Get personalized feedback on your responses and practice with realistic scenarios
                </p>
                <button className="bg-white text-[#D71920] px-4 py-2 rounded-lg font-semibold text-sm">
                  Coming Soon
                </button>
              </div>
            </PremiumCard>
          </div>
        )}

        {activeTab === 'strategy' && (
          <PremiumCard
            title="80% Win Rate Strategy Guide"
            icon={<Target className="w-6 h-6" />}
            locked={false}
          >
            <p className="text-gray-600 mb-6">
              Follow our proven step-by-step method that has helped 80% of candidates succeed in Emirates recruitment.
            </p>
            
            <div className="space-y-4">
              {strategySteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                    step.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-[#C8A14B] hover:bg-[#F5F3EF]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="font-bold text-sm">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-bold ${
                      step.completed ? 'text-green-700' : 'text-[#2C2C2C]'
                    }`}>
                      {step.title}
                    </h4>
                    <p className={`text-sm ${
                      step.completed ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  
                  {step.completed && (
                    <div className="text-green-500 font-semibold text-sm">
                      Complete
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 bg-[#F5F3EF] rounded-xl p-4">
              <h4 className="font-bold text-[#2C2C2C] mb-2">Next Steps</h4>
              <p className="text-gray-600 text-sm">
                Complete the remaining steps to maximize your chances. Each step builds on the previous one for optimal results.
              </p>
            </div>
          </PremiumCard>
        )}
      </div>
    </div>
  );
}