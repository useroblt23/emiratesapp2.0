import { useState, useEffect, useRef } from 'react';
import { MessageCircle, ArrowLeft, Plus, Users, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConversationList from '../components/community/ConversationList';
import MessageBubble from '../components/community/MessageBubble';
import MessageComposer from '../components/community/MessageComposer';
import { communityChatService, Message } from '../services/communityChatService';
import { presenceService, TypingData } from '../services/presenceService';
import { auth } from '../lib/firebase';
import FeatureAccessGuard from '../components/FeatureAccessGuard';

const COMMUNITY_CHAT_ID = 'publicRoom';

function ChatPageContent() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState('Community Chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    presenceService.initializePresence();
    ensureCommunityChat();

    // On desktop, auto-select community chat
    if (window.innerWidth >= 768) {
      setSelectedConversationId(COMMUNITY_CHAT_ID);
      setShowConversationList(false);
    }

    return () => {
      presenceService.cleanup();
    };
  }, []);

  useEffect(() => {
    if (!selectedConversationId) return;

    setLoading(true);
    let unsubscribe: (() => void) | undefined;
    let unsubscribeTyping: (() => void) | undefined;

    try {
      unsubscribe = communityChatService.subscribeToMessages(
        selectedConversationId,
        (msgs) => {
          setMessages(msgs);
          setLoading(false);
          scrollToBottom();
        },
        (error) => {
          console.error('Error subscribing to messages:', error);
          setLoading(false);
        }
      );

      presenceService.setCurrentConversation(selectedConversationId);

      unsubscribeTyping = presenceService.subscribeToTyping(
        selectedConversationId,
        setTypingUsers
      );
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (unsubscribeTyping) unsubscribeTyping();
      presenceService.clearTyping(selectedConversationId);
    };
  }, [selectedConversationId]);

  const ensureCommunityChat = async () => {
    try {
      await communityChatService.ensureCommunityChat();
      console.log('Community chat ensured');
    } catch (error) {
      console.error('Error ensuring community chat:', error);
      alert('Failed to initialize community chat. Please check your connection and try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, file?: File) => {
    if (!selectedConversationId) return;

    const contentType = file
      ? file.type.startsWith('image/')
        ? 'image'
        : 'file'
      : 'text';

    await communityChatService.sendMessage(
      selectedConversationId,
      content,
      contentType,
      file
    );
  };

  const handleTyping = () => {
    if (!selectedConversationId) return;
    const userName = auth.currentUser?.displayName || 'User';
    presenceService.setTyping(selectedConversationId, userName);
  };

  const handleReaction = async (messageId: string, emoji: string, recipientId: string) => {
    if (!selectedConversationId) return;
    await communityChatService.addReaction(
      selectedConversationId,
      messageId,
      emoji,
      recipientId
    );
  };

  const handleLike = async (messageId: string, recipientId: string) => {
    if (!selectedConversationId) return;
    await communityChatService.likeMessage(selectedConversationId, messageId, recipientId);
  };

  const handleReport = async (messageId: string) => {
    if (!selectedConversationId) return;

    const reason = prompt('Please provide a reason for reporting this message:');
    if (!reason) return;

    try {
      await communityChatService.reportMessage(selectedConversationId, messageId, reason);
      alert('Message reported successfully');
    } catch (error) {
      alert('Failed to report message');
    }
  };

  const handleSelectConversation = (conversationId: string, title: string) => {
    setSelectedConversationId(conversationId);
    setConversationTitle(title);
    setShowConversationList(false);
  };

  const handleBackToCommunity = () => {
    setSelectedConversationId(COMMUNITY_CHAT_ID);
    setConversationTitle('Community Chat');
    setShowConversationList(false);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden">
      {/* Mobile: Show conversation list OR chat. Desktop: Show both side by side */}
      <div className={`w-full md:w-96 md:border-r border-gray-200 flex-shrink-0 ${
        selectedConversationId && !showConversationList ? 'hidden md:block' : 'block'
      }`}>
        <div className="h-full flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200 bg-white">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-600 mt-1">Connect with the community</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId}
              onClose={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col bg-white ${
        !selectedConversationId || showConversationList ? 'hidden md:flex' : 'flex'
      }`}>
          <div className="px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConversationList(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-all"
                title="Back to conversations"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{conversationTitle}</h2>
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#D71920] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#D71920] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#D71920] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span>{typingUsers[0].userName} is typing...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-500">Start the conversation and connect with others!</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.messageId}
                    message={message}
                    onAddReaction={(emoji) =>
                      handleReaction(message.messageId, emoji, message.senderId)
                    }
                    onLike={() => handleLike(message.messageId, message.senderId)}
                    onReport={() => handleReport(message.messageId)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <MessageComposer onSendMessage={handleSendMessage} onTyping={handleTyping} />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <FeatureAccessGuard featureKey="communityChat">
      <ChatPageContent />
    </FeatureAccessGuard>
  );
}
