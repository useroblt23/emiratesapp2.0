import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function MessagesPage() {
  const navigate = useNavigate();
  const conversations: any[] = [];

  return (
    <div className="min-h-screen">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#000000] mb-2">
          Messages
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Connect with mentors and students
        </p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No Messages Yet"
          description="You haven't started any conversations yet. Reach out to mentors for guidance or connect with fellow students. You can also contact support anytime."
          action={{
            label: 'Contact Support',
            onClick: () => navigate('/support'),
          }}
          secondaryAction={{
            label: 'Find Mentors',
            onClick: () => alert('Mentor directory coming soon!'),
          }}
        />
      ) : (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
          {mockConversations.map((conversation) => (
            <div key={conversation.id} className="p-4 border-b last:border-b-0">
              <p className="text-gray-600">{conversation.participantName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
