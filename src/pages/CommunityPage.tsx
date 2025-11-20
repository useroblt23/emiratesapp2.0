import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Users, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '../components/community/MessageBubble';
import MessageComposer from '../components/community/MessageComposer';
import { communityChatService, Message, Conversation } from '../services/communityChatService';
import { presenceService, TypingData } from '../services/presenceService';
import { auth } from '../lib/firebase';

export default function CommunityPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>('publicRoom');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initCommunityChat = async () => {
      try {
        await communityChatService.ensureCommunityChat();
        const userId = auth.currentUser?.uid;
        if (userId) {
          await communityChatService.joinCommunityChat(userId);
        }
      } catch (error) {
        console.error('Error initializing community chat:', error);
      }
    };

    initCommunityChat();
    presenceService.initializePresence();

    const unsubscribeConversations = communityChatService.subscribeToConversations((convs) => {
      setConversations(convs);
    });

    return () => {
      presenceService.cleanup();
      unsubscribeConversations();
    };
  }, []);

  useEffect(() => {
    if (!selectedConversationId) return;

    setLoading(true);
    const unsubscribe = communityChatService.subscribeToMessages(
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

    const unsubscribeTyping = presenceService.subscribeToTyping(
      selectedConversationId,
      setTypingUsers
    );

    return () => {
      unsubscribe();
      unsubscribeTyping();
      presenceService.clearTyping(selectedConversationId);
    };
  }, [selectedConversationId]);

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

  const groupChats = conversations.filter(c => c.type === 'group' || c.id === 'publicRoom');
  const privateChats = conversations.filter(c => c.type === 'private');
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D71921] to-[#B01419] rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Messages v2.0</h1>
              <p className="text-xs text-gray-600">
                {selectedConversation?.title || 'Select a conversation'}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100">
          <div className="flex items-center gap-6 px-6 py-3 overflow-x-auto bg-gray-50">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Groups</span>
            </div>
            {groupChats.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  selectedConversationId === conversation.id
                    ? 'bg-[#D71921] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  conversation.id === 'publicRoom'
                    ? 'bg-gradient-to-br from-[#FF6B35] to-[#FFA500] text-white text-base'
                    : selectedConversationId === conversation.id
                      ? 'bg-white/20 text-white'
                      : 'bg-[#D71921] text-white'
                }`}>
                  {conversation.id === 'publicRoom' ? '🌍' : <Users className="w-4 h-4" />}
                </div>
                <span className="font-semibold text-sm">{conversation.title}</span>
              </button>
            ))}

            {privateChats.length > 0 && (
              <>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Private</span>
                </div>
                {privateChats.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      selectedConversationId === conversation.id
                        ? 'bg-gray-800 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${
                      selectedConversationId === conversation.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-700 text-white'
                    }`}>
                      {conversation.title.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm">{conversation.title}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedConversationId ? (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
                  <div className="w-16 h-16 rounded-full border-4 border-[#D71921] border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center max-w-sm"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-[#D71921]/10 to-[#B01419]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-[#D71921]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-500">Be the first to break the ice and start the conversation!</p>
                </motion.div>
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

          {typingUsers.length > 0 && (
            <div className="px-6 py-2 border-t border-gray-100 bg-white">
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#D71921] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-[#D71921] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-[#D71921] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {typingUsers[0].userName} is typing...
                </p>
              </motion.div>
            </div>
          )}

          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <MessageComposer onSendMessage={handleSendMessage} onTyping={handleTyping} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-sm"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#D71921]/10 to-[#B01419]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-12 h-12 text-[#D71921]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose from the navigation above to start chatting</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
