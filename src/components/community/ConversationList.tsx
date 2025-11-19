import React, { useEffect, useState } from 'react';
import { Users, MessageCircle, Search, Plus } from 'lucide-react';
import { communityChatService, Conversation } from '../../services/communityChatService';
import { presenceService } from '../../services/presenceService';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

export default function ConversationList({
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = communityChatService.subscribeToConversations((convs) => {
      setConversations(convs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-xl border-r border-white/10">
      <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-xl"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40 p-8">
            <MessageCircle className="w-12 h-12 mb-4" />
            <p>No conversations yet</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-white/10 transition-all border-b border-white/5 ${
                selectedConversationId === conversation.id
                  ? 'bg-blue-500/20 border-l-4 border-l-blue-500'
                  : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold backdrop-blur-xl">
                {conversation.type === 'group' ? (
                  <Users className="w-6 h-6" />
                ) : (
                  conversation.title.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white truncate">{conversation.title}</h3>
                  {conversation.lastMessage && (
                    <span className="text-xs text-white/40">
                      {conversation.lastMessage.createdAt.toDate().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                {conversation.lastMessage && (
                  <p className="text-sm text-white/60 truncate">
                    {conversation.lastMessage.text}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/40">
                    {conversation.members.length} members
                  </span>
                  {conversation.pinned && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                      Pinned
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
