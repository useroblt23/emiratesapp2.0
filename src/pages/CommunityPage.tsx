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
    <div className="h-[calc(100vh-100px)] flex flex-col max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D71921] to-[#B01419] rounded-2xl flex items-center justify-center shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">
              Community Chat
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Connect with students and mentors worldwide
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col min-h-0">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Group Chats</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {groupChats.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 flex-shrink-0 transition-all ${
                    selectedConversationId === conversation.id
                      ? 'bg-gradient-to-r from-[#D71921] to-[#B01419] border-[#D71921] text-white shadow-lg'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-[#D71921] hover:shadow-md'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    conversation.id === 'publicRoom'
                      ? 'bg-gradient-to-br from-[#FF6B35] to-[#FFA500] text-white text-lg'
                      : selectedConversationId === conversation.id
                        ? 'bg-white/20'
                        : 'bg-gradient-to-br from-[#D71921] to-[#B01419]'
                  }`}>
                    {conversation.id === 'publicRoom' ? '🌍' : <Users className={`w-4 h-4 ${selectedConversationId === conversation.id ? 'text-white' : 'text-white'}`} />}
                  </div>
                  <span className="font-bold text-sm whitespace-nowrap">{conversation.title}</span>
                </button>
              ))}
            </div>
          </div>

          {privateChats.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-gray-500" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Private Chats</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {privateChats.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 flex-shrink-0 transition-all ${
                      selectedConversationId === conversation.id
                        ? 'bg-gradient-to-r from-gray-700 to-gray-900 border-gray-700 text-white shadow-lg'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                      selectedConversationId === conversation.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gradient-to-br from-gray-600 to-gray-800 text-white'
                    }`}>
                      {conversation.title.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm whitespace-nowrap">{conversation.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedConversationId ? (
          <>
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#D71921] to-[#B01419] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">
                    {selectedConversation?.id === 'publicRoom' ? '🌍' : selectedConversation?.type === 'group' ? '👥' : selectedConversation?.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">
                    {selectedConversation?.title || 'Conversation'}
                  </h2>
                  <AnimatePresence mode="wait">
                    {typingUsers.length > 0 ? (
                      <motion.div
                        key="typing"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2"
                      >
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <p className="text-sm text-white/90 font-medium">
                          {typingUsers[0].userName} is typing
                        </p>
                      </motion.div>
                    ) : (
                      <motion.p
                        key="subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-white/80"
                      >
                        {selectedConversation?.members.length || 0} members
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
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

            <div className="border-t border-gray-200 bg-white flex-shrink-0">
              <MessageComposer onSendMessage={handleSendMessage} onTyping={handleTyping} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center max-w-sm"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-[#D71921]/10 to-[#B01419]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-[#D71921]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose from the list above to start chatting</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
