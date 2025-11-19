import { useState } from 'react';
import { HelpCircle, Mail, MessageCircle, FileText, BookOpen, Bug, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { createSupportTicket, Department, Topic } from '../services/supportChatService';
import { createBugReport, BugPriority } from '../services/bugReportService';

type Tab = 'overview' | 'live-chat' | 'bug-report';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [department, setDepartment] = useState<Department>('general');
  const [topic, setTopic] = useState<Topic>('other');
  const [loading, setLoading] = useState(false);

  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [bugCategory, setBugCategory] = useState('general');
  const [bugPriority, setBugPriority] = useState<BugPriority>('medium');
  const [bugLoading, setBugLoading] = useState(false);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !subject.trim() || !message.trim()) return;

    setLoading(true);
    try {
      const ticketId = await createSupportTicket(
        currentUser.uid,
        currentUser.name,
        currentUser.email,
        subject,
        message,
        department,
        topic
      );

      navigate('/support-chat', {
        state: {
          ticket: {
            id: ticketId,
            userId: currentUser.uid,
            userName: currentUser.name,
            userEmail: currentUser.email,
            status: 'open',
            priority: 'medium',
            subject,
            department,
            topic,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastMessageAt: new Date(),
            unreadByUser: 0,
            unreadByStaff: 1,
            participants: [{ id: currentUser.uid, name: currentUser.name, role: currentUser.role, joinedAt: new Date() }],
          }
        }
      });
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      alert(`Failed to create support ticket: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBugReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !bugTitle.trim() || !bugDescription.trim()) return;

    setBugLoading(true);
    try {
      await createBugReport({
        title: bugTitle.trim(),
        description: bugDescription.trim(),
        category: bugCategory,
        priority: bugPriority,
        reportedBy: currentUser.uid,
        reportedByName: currentUser.name,
        reportedByRole: currentUser.role
      });

      alert('Bug report submitted successfully! Our team will review it shortly.');
      setBugTitle('');
      setBugDescription('');
      setBugCategory('general');
      setBugPriority('medium');
    } catch (error) {
      console.error('Error submitting bug report:', error);
      alert('Failed to submit bug report. Please try again.');
    } finally {
      setBugLoading(false);
    }
  };

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: HelpCircle },
    { id: 'live-chat' as Tab, label: 'Live Chat', icon: MessageCircle },
    { id: 'bug-report' as Tab, label: 'Bug Report', icon: Bug }
  ];

  const bugCategories = [
    { value: 'general', label: 'General Issue' },
    { value: 'chat', label: 'Chat System' },
    { value: 'courses', label: 'Courses' },
    { value: 'ai-assistant', label: 'AI Assistant' },
    { value: 'cv-optimizer', label: 'CV Optimizer' },
    { value: 'open-days', label: 'Open Days' },
    { value: 'profile', label: 'Profile' },
    { value: 'authentication', label: 'Login/Registration' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Support Center</h1>
        <p className="text-gray-600">Get help and contact our team</p>
      </div>

      <div className="glass-card rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 glass-light">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-bold transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-[#D71921] border-b-2 border-[#D71921] bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:glass-bubble'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 text-center border border-red-100 hover:shadow-lg transition">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#D71920] to-[#E6282C] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
                  <p className="text-gray-600 mb-4">Get help via email within 24 hours</p>
                  <a href="mailto:support@emirates.academy" className="text-[#D71920] font-bold hover:underline">
                    support@emirates.academy
                  </a>
                </div>

                <div
                  onClick={() => setActiveTab('live-chat')}
                  className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-6 text-center border border-yellow-100 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#B9975B] to-[#A8865A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
                  <p className="text-gray-600 mb-4">Chat with our support team</p>
                  <span className="text-[#B9975B] font-bold">Start Chat →</span>
                </div>

                <div
                  onClick={() => navigate('/documentation')}
                  className="glass-card rounded-2xl p-6 text-center border border-gray-100 hover:shadow-md transition cursor-pointer"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Documentation</h3>
                  <p className="text-gray-600 mb-4">Browse help articles and guides</p>
                  <span className="text-gray-900 font-bold">View Docs →</span>
                </div>
              </div>

              <div className="glass-light rounded-2xl p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-[#D71921]" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      q: 'How do I reset my password?',
                      a: 'Click on the "Forgot Password" link on the login page and follow the instructions sent to your email.'
                    },
                    {
                      q: 'How can I track my course progress?',
                      a: 'Visit your Dashboard to see detailed progress for all enrolled courses.'
                    },
                    {
                      q: 'Can I download course materials?',
                      a: 'Yes, course materials are available for download within each course module.'
                    },
                    {
                      q: 'How do I contact a mentor?',
                      a: 'Navigate to the Messages section and select your mentor from the contacts list.'
                    }
                  ].map((faq, index) => (
                    <div key={index} className="glass-card rounded-xl p-4 border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#D71921] rounded-full"></div>
                        {faq.q}
                      </h3>
                      <p className="text-gray-600 pl-4">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'live-chat' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D71921] to-[#B01419] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Start a Live Chat</h2>
                <p className="text-gray-600">Our support team will respond as soon as possible</p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-6 glass-light rounded-2xl p-6 md:p-8 border border-gray-200">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D71921] focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as Department)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D71921] focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="academic">Academic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Topic
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value as Topic)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D71921] focus:border-transparent"
                    >
                      <option value="account">Account</option>
                      <option value="courses">Courses</option>
                      <option value="technical-issue">Technical Issue</option>
                      <option value="payment">Payment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please describe your issue in detail..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D71921] focus:border-transparent resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !subject.trim() || !message.trim()}
                  className="w-full bg-gradient-to-r from-[#D71921] to-[#B01419] text-white py-4 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Chat...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Start Chat Session</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'bug-report' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bug className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Report a Bug</h2>
                <p className="text-gray-600">Help us improve by reporting any issues you encounter</p>
              </div>

              <form onSubmit={handleBugReport} className="space-y-6 glass-light rounded-2xl p-6 md:p-8 border border-gray-200">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Bug Title *
                  </label>
                  <input
                    type="text"
                    value={bugTitle}
                    onChange={(e) => setBugTitle(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={bugCategory}
                      onChange={(e) => setBugCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {bugCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Priority
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['low', 'medium', 'high', 'critical'] as BugPriority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setBugPriority(p)}
                          className={`px-3 py-2 rounded-xl font-semibold text-sm transition ${
                            bugPriority === p
                              ? p === 'critical' ? 'bg-red-600 text-white' :
                                p === 'high' ? 'bg-orange-600 text-white' :
                                p === 'medium' ? 'bg-yellow-600 text-white' :
                                'bg-green-600 text-white'
                              : 'bg-white text-gray-700 hover:glass-bubble border border-gray-300'
                          }`}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    placeholder="Please describe the bug in detail. Include steps to reproduce if possible..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={bugLoading || !bugTitle.trim() || !bugDescription.trim()}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bugLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Bug Report</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
