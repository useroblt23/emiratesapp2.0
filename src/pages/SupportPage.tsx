import { HelpCircle, Mail, MessageCircle, FileText } from 'lucide-react';

export default function SupportPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#1C1C1C] mb-2">Support</h1>
        <p className="text-gray-600">Get help and contact our team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer">
          <div className="w-16 h-16 bg-gradient-to-br from-[#D71920] to-[#B91518] rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#1C1C1C] mb-2">Email Support</h3>
          <p className="text-gray-600 mb-4">Get help via email within 24 hours</p>
          <button className="text-[#D71920] font-bold hover:underline">
            support@emirates.academy
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer">
          <div className="w-16 h-16 bg-gradient-to-br from-[#B9975B] to-[#A8865A] rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#1C1C1C] mb-2">Live Chat</h3>
          <p className="text-gray-600 mb-4">Chat with our support team</p>
          <button className="text-[#B9975B] font-bold hover:underline">
            Start Chat
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer">
          <div className="w-16 h-16 bg-gradient-to-br from-[#1C1C1C] to-[#2C2C2C] rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#1C1C1C] mb-2">Documentation</h3>
          <p className="text-gray-600 mb-4">Browse help articles and guides</p>
          <button className="text-[#1C1C1C] font-bold hover:underline">
            View Docs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-[#1C1C1C] mb-6">Frequently Asked Questions</h2>
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
            <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
              <h3 className="font-bold text-[#1C1C1C] mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#D71920]" />
                {faq.q}
              </h3>
              <p className="text-gray-600 pl-7">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
