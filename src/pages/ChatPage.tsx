import { useState, useEffect, useRef } from 'react';
import { MessageCircle, ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
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
        className="mb-4 md:mb-6"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[#000000] mb-2">Messages</h1>
        <p className="text-sm md:text-base text-gray-600">
          Connect with mentors, students, and the community
        </p>
      </motion.div>

      <div className="flex-1 bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden flex">
        {showConversationList && (
          <div className="w-full md:w-80 border-r border-gray-200 md:flex-shrink-0">
            <ConversationList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId}
              onClose={() => setShowConversationList(false)}
            />
          </div>
        )}

        <div className={`flex-1 flex flex-col ${showConversationList ? 'hidden md:flex' : ''}`}>
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            {selectedConversationId !== COMMUNITY_CHAT_ID && (
              <button
                onClick={handleBackToCommunity}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Back to Community Chat"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[#000000]">{conversationTitle}</h2>
              {typingUsers.length > 0 && (
                <p className="text-sm text-gray-500">
                  {typingUsers[0].userName} is typing...
                </p>
              )}
            </div>
            <button
              onClick={() => setShowConversationList(!showConversationList)}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              title="New conversation"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
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
