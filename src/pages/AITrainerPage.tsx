import { Brain, Upload, FileText, Sparkles, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useState, useRef, useEffect } from 'react';
import { analyzeCVForEmirates, getCabinCrewGuidance } from '../utils/aiService';
import { checkFeatureAccess } from '../utils/featureAccess';
import FeatureLock from '../components/FeatureLock';
import CVAnalyzer from '../components/CVAnalyzer';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AITrainerPage() {
  const { currentUser } = useApp();
  const access = checkFeatureAccess(currentUser, 'ai-trainer');

  if (!access.allowed) {
    return (
      <FeatureLock
        requiredPlan={access.requiresPlan || 'vip'}
        featureName="AI Trainer"
        description={access.message || 'Upgrade to access the AI Trainer'}
      />
    );
  }

  const isPro = currentUser?.plan === 'pro' || currentUser?.plan === 'vip';
  const [activeTab, setActiveTab] = useState<'cv' | 'chat'>('cv');

  const [cvText, setCvText] = useState('');
  const [cvFeedback, setCvFeedback] = useState('');
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState('');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['txt', 'pdf', 'doc', 'docx'].includes(fileType || '')) {
      setCvError('Please upload a .txt, .pdf, .doc, or .docx file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCvError('File size must be less than 5MB');
      return;
    }

    if (fileType === 'txt') {
      const text = await file.text();
      setCvText(text);
      setCvError('');
    } else {
      setCvError('PDF and DOC files coming soon. Please use .txt or paste your CV text for now.');
    }
  };

  const handleAnalyzeCV = async () => {
    if (!cvText.trim()) {
      setCvError('Please enter or upload your CV content first');
      return;
    }

    if (!currentUser) {
      setCvError('You must be logged in to use this feature');
      return;
    }

    setCvLoading(true);
    setCvError('');
    setCvFeedback('');

    try {
      const feedback = await analyzeCVForEmirates(cvText, currentUser.uid);
      setCvFeedback(feedback);
    } catch (error: any) {
      setCvError(error.message || 'Failed to analyze CV. Please try again.');
    } finally {
      setCvLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    if (!currentUser) {
      setChatError('You must be logged in to use this feature');
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    setChatError('');

    try {
      const response = await getCabinCrewGuidance(chatInput, currentUser.uid);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      setChatError(error.message || 'Failed to get response. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const suggestedQuestions = [
    "How should I answer 'Tell me about yourself'?",
    "What should I wear for Emirates assessment?",
    "How do I show confidence in group activities?",
    "What are the most important grooming standards?",
    "How can I improve my English for the interview?",
  ];

  if (!isPro) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#D71921] to-[#B91518] rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#000000] mb-4">AI Trainer</h1>
          <p className="text-lg text-gray-700 mb-6">
            This feature is exclusive to Pro and VIP members. Upgrade to unlock your AI Trainer and get personalized CV feedback and interview coaching.
          </p>
          <button
            onClick={() => window.location.href = '/upgrade'}
            className="px-8 py-3 bg-gradient-to-r from-[#D71921] to-[#B91518] text-white rounded-xl font-bold hover:shadow-lg transition"
          >
            Upgrade Now
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D71921] to-[#B91518] rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#000000]">Your AI Cabin Crew Trainer</h1>
            <p className="text-gray-600">Get personalized help to craft the perfect Emirates-ready CV and receive recruiter-style feedback.</p>
          </div>
        </div>
      </motion.div>

      <div className="mb-6 flex gap-2 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('cv')}
          className={`px-6 py-3 font-bold transition ${
            activeTab === 'cv'
              ? 'text-[#D71921] border-b-4 border-[#D71921] -mb-0.5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span>CV Optimization</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-6 py-3 font-bold transition ${
            activeTab === 'chat'
              ? 'text-[#D71921] border-b-4 border-[#D71921] -mb-0.5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>Interactive Guidance</span>
          </div>
        </button>
      </div>

      {activeTab === 'cv' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {currentUser?.cvUrl ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#000000] mb-4">CV Optimization & Analysis</h2>
              <p className="text-sm text-gray-600 mb-6">
                Your CV has been uploaded. Use the tools below to analyze, convert to ATS format, or get interactive guidance.
              </p>
              <CVAnalyzer cvUrl={currentUser.cvUrl} userId={currentUser.uid} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#000000] mb-2">No CV Uploaded</h2>
              <p className="text-gray-600 mb-6">
                Please upload your CV in your profile first to use CV optimization features.
              </p>
              <button
                onClick={() => window.location.href = '/profile'}
                className="px-6 py-3 bg-gradient-to-r from-[#D71921] to-[#B91518] text-white rounded-xl font-bold hover:shadow-lg transition"
              >
                Go to Profile
              </button>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'chat' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
          style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D71921] to-[#B91518] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#000000] mb-2">Your AI Trainer is Ready!</h3>
                <p className="text-gray-600 mb-6">Ask your first question or try one of these:</p>
                <div className="max-w-2xl mx-auto space-y-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setChatInput(q)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-[#EADBC8] border-2 border-gray-200 hover:border-[#D71921] rounded-xl text-left text-sm text-gray-700 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-[#D71921] to-[#B91518] text-white'
                          : 'bg-gradient-to-br from-[#EADBC8] to-[#F5E6D3] text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-[#EADBC8] to-[#F5E6D3] px-4 py-3 rounded-2xl">
                      <Loader2 className="w-5 h-5 animate-spin text-[#D71921]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {chatError && (
            <div className="px-6 py-3 bg-red-50 border-t-2 border-red-200 text-red-700 text-sm">
              {chatError}
            </div>
          )}

          <div className="border-t-2 border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about Emirates cabin crew..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D71921] focus:ring-2 focus:ring-[#D71921]/20 transition"
                disabled={chatLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#D71921] to-[#B91518] text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
