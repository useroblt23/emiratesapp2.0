import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Users, Search, ChevronLeft, Plus, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '../components/community/MessageBubble';
import MessageComposer from '../components/community/MessageComposer';
import { communityChatService, Message, Conversation } from '../services/communityChatService';
import { presenceService, TypingData } from '../services/presenceService';
import { auth } from '../lib/firebase';

export default function CommunityPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
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

  const handleCreateGroupChat = async () => {
    const groupName = prompt('Enter group chat name:');
    if (!groupName) return;

    try {
      await communityChatService.createGroupConversation(groupName);
      setShowCreateMenu(false);
      alert('Group chat created successfully!');
    } catch (error) {
      alert('Failed to create group chat');
    }
  };

  const handleCreatePrivateChat = async () => {
    const username = prompt('Enter username to chat with:');
    if (!username) return;

    try {
      await communityChatService.createPrivateConversation(username);
      setShowCreateMenu(false);
      alert('Private chat created successfully!');
    } catch (error) {
      alert('Failed to create private chat');
    }
  };

  const groupChats = conversations.filter(c => c.type === 'group' || c.id === 'publicRoom');
  const privateChats = conversations.filter(c => c.type === 'private');
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  if (selectedConversationId) {
    return (
      <div className="fixed inset-0 flex flex-col glass-light overflow-hidden">
        <div className="glass-light border-b border-white/20 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSelectedConversationId(null)}
            className="w-10 h-10 rounded-full glass-bubble flex items-center justify-center hover:bg-white/50 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            selectedConversation?.id === 'publicRoom'
              ? 'bg-gradient-to-br from-[#FF6B35] to-[#FFA500] text-white text-base'
              : selectedConversation?.type === 'group'
                ? 'bg-[#D71921] text-white'
                : 'bg-gray-700 text-white font-bold'
          }`}>
            {selectedConversation?.id === 'publicRoom'
              ? '🌍'
              : selectedConversation?.type === 'group'
                ? <Users className="w-5 h-5" />
                : selectedConversation?.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{selectedConversation?.title}</h2>
            <p className="text-xs text-gray-500">{selectedConversation?.type === 'group' ? 'Group Chat' : 'Private Chat'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
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
          <div className="px-4 py-2 glass-light border-t border-white/20 flex-shrink-0">
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

        <div className="glass-light border-t border-white/20 px-4 py-4 flex-shrink-0">
          <MessageComposer onSendMessage={handleSendMessage} onTyping={handleTyping} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col glass-light overflow-hidden">
      <div className="glass-light border-b border-white/20 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <div className="relative">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="w-10 h-10 rounded-full bg-[#D71921] text-white flex items-center justify-center hover:bg-[#B01419] transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
            </button>

            {showCreateMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 mt-2 w-56 glass-bubble rounded-xl shadow-xl border border-white/20 overflow-hidden z-50"
              >
                <button
                  onClick={handleCreateGroupChat}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/50 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#D71921] text-white flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">New Group</p>
                    <p className="text-xs text-gray-500">Create a group chat</p>
                  </div>
                </button>
                <button
                  onClick={handleCreatePrivateChat}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/50 transition-all text-left border-t border-white/20"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">New Chat</p>
                    <p className="text-xs text-gray-500">Start a private conversation</p>
                  </div>
                </button>
              </motion.div>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 glass-bubble rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D71921]/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {groupChats.length > 0 && (
          <div>
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">Group Chats</p>
            </div>
            {groupChats.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:glass-bubble"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  conversation.id === 'publicRoom'
                    ? 'bg-gradient-to-br from-[#FF6B35] to-[#FFA500] text-white text-xl'
                    : 'bg-[#D71921] text-white'
                }`}>
                  {conversation.id === 'publicRoom' ? '🌍' : <Users className="w-5 h-5" />}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{conversation.title}</h3>
                  <p className="text-xs text-gray-500">Tap to open</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {privateChats.length > 0 && (
          <div className="mt-4">
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">Private Messages</p>
            </div>
            {privateChats.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:glass-bubble"
              >
                <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {conversation.title.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{conversation.title}</h3>
                  <p className="text-xs text-gray-500">Tap to open</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
