import { useState, useEffect, useRef } from 'react';
import { MessageCircle, ArrowLeft, Plus, Users, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConversationList from '../components/community/ConversationList';
import MessageBubble from '../components/community/MessageBubble';
import MessageComposer from '../components/community/MessageComposer';
import { communityChatService, Message } from '../services/communityChatService';
import { presenceService, TypingData } from '../services/presenceService';
import { auth } from '../lib/firebase';

const COMMUNITY_CHAT_ID = 'publicRoom';

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>(COMMUNITY_CHAT_ID);
  const [conversationTitle, setConversationTitle] = useState('Community Chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    presenceService.initializePresence();
    ensureCommunityChat();

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
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Messages
            </h1>
            <p className="text-gray-600">
              Connect with mentors, students, and the community
            </p>
          </div>
          <button
            onClick={() => setShowConversationList(!showConversationList)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            <Users className="w-5 h-5" />
            <span className="hidden sm:inline">Conversations</span>
          </button>
        </div>
      </motion.div>

      <div className="flex-1 bg-white rounded-2xl shadow-2xl overflow-hidden flex border border-gray-100">
        <AnimatePresence>
          {showConversationList && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full md:w-96 border-r border-gray-100 md:flex-shrink-0 bg-gradient-to-b from-gray-50 to-white"
            >
              <ConversationList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversationId}
                onClose={() => setShowConversationList(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex-1 flex flex-col ${showConversationList ? 'hidden md:flex' : ''}`}>
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-gray-100 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              {selectedConversationId !== COMMUNITY_CHAT_ID && (
                <button
                  onClick={handleBackToCommunity}
                  className="p-2 hover:bg-white/60 rounded-xl transition-all"
                  title="Back to Community Chat"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">{conversationTitle}</h2>
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span>{typingUsers[0].userName} is typing...</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowConversationList(!showConversationList)}
                className="p-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all shadow-lg"
                title="New conversation"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
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
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-blue-600" />
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
