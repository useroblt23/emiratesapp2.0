import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Users, Search, ChevronLeft, Plus, UserPlus, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '../components/community/MessageBubble';
import MessageComposer from '../components/community/MessageComposer';
import { communityChatService, Message, Conversation } from '../services/communityChatService';
import { presenceService, TypingData } from '../services/presenceService';
import { auth, db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface User {
  uid: string;
  displayName: string;
  email: string;
}

export default function CommunityPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showGroupCreation, setShowGroupCreation] = useState(false);
  const [showPrivateChatCreation, setShowPrivateChatCreation] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (doc.id !== auth.currentUser?.uid) {
          users.push({
            uid: doc.id,
            displayName: data.displayName || data.name || 'Unknown User',
            email: data.email || '',
          });
        }
      });
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateGroupChat = async () => {
    setShowCreateMenu(false);
    setShowGroupCreation(true);
    await loadUsers();
  };

  const handleCreatePrivateChat = async () => {
    setShowCreateMenu(false);
    setShowPrivateChatCreation(true);
    await loadUsers();
  };

  const handleConfirmGroupCreation = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert('Please enter a group name and select at least one member');
      return;
    }

    try {
      await communityChatService.createConversation('group', groupName, selectedUsers);
      setShowGroupCreation(false);
      setGroupName('');
      setSelectedUsers([]);
      setSearchQuery('');
    } catch (error) {
      alert('Failed to create group chat');
    }
  };

  const handleConfirmPrivateChatCreation = async (userId: string) => {
    try {
      const selectedUser = availableUsers.find(u => u.uid === userId);
      if (selectedUser) {
        await communityChatService.createConversation('private', selectedUser.displayName, [userId]);
        setShowPrivateChatCreation(false);
        setSearchQuery('');
      }
    } catch (error) {
      alert('Failed to create private chat');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = availableUsers.filter(user =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupChats = conversations.filter(c => c.type === 'group' || c.id === 'publicRoom');
  const privateChats = conversations.filter(c => c.type === 'private');
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  if (showGroupCreation) {
    return (
      <div className="fixed left-0 right-0 bottom-0 top-16 md:static md:h-[calc(100vh-12rem)] flex flex-col glass-light overflow-hidden md:rounded-xl z-30 md:z-0">
        <div className="glass-light border-b border-white/20 px-3 md:px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowGroupCreation(false);
                setGroupName('');
                setSelectedUsers([]);
                setSearchQuery('');
              }}
              className="w-9 h-9 rounded-full glass-bubble flex items-center justify-center hover:bg-white/50 transition-all"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">New Group</h2>
          </div>
          <button
            onClick={handleConfirmGroupCreation}
            className="w-9 h-9 rounded-full bg-[#D71921] text-white flex items-center justify-center hover:bg-[#B01419] transition-all"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 md:p-4 glass-light border-b border-white/20 flex-shrink-0">
          <input
            type="text"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2.5 glass-bubble rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D71921]/20"
          />
        </div>

        <div className="px-3 md:px-4 py-2 glass-light border-b border-white/20 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glass-bubble rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D71921]/20"
            />
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="px-3 md:px-4 py-2 flex flex-wrap gap-2 glass-light border-b border-white/20 flex-shrink-0">
            {selectedUsers.map(userId => {
              const user = availableUsers.find(u => u.uid === userId);
              return user ? (
                <div key={userId} className="flex items-center gap-1 px-3 py-1 bg-[#D71921]/10 rounded-full">
                  <span className="text-sm text-gray-900">{user.displayName}</span>
                  <button
                    onClick={() => toggleUserSelection(userId)}
                    className="w-4 h-4 rounded-full hover:bg-white/50 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-gray-700" />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredUsers.map((user) => (
            <button
              key={user.uid}
              onClick={() => toggleUserSelection(user.uid)}
              className={`w-full px-3 md:px-4 py-2.5 flex items-center gap-3 transition-all hover:glass-bubble ${
                selectedUsers.includes(user.uid) ? 'bg-[#D71921]/5' : ''
              }`}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                selectedUsers.includes(user.uid) ? 'bg-[#D71921]' : 'bg-gray-600'
              }`}>
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{user.displayName}</h3>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              {selectedUsers.includes(user.uid) && (
                <div className="w-6 h-6 rounded-full bg-[#D71921] flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (showPrivateChatCreation) {
    return (
      <div className="fixed left-0 right-0 bottom-0 top-16 md:static md:h-[calc(100vh-12rem)] flex flex-col glass-light overflow-hidden md:rounded-xl z-30 md:z-0">
        <div className="glass-light border-b border-white/20 px-3 md:px-4 py-3 flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              setShowPrivateChatCreation(false);
              setSearchQuery('');
            }}
            className="w-9 h-9 rounded-full glass-bubble flex items-center justify-center hover:bg-white/50 transition-all"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">New Chat</h2>
        </div>

        <div className="px-3 md:px-4 py-2 glass-light border-b border-white/20 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glass-bubble rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D71921]/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredUsers.map((user) => (
            <button
              key={user.uid}
              onClick={() => handleConfirmPrivateChatCreation(user.uid)}
              className="w-full px-3 md:px-4 py-2.5 flex items-center gap-3 transition-all hover:glass-bubble"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold text-base md:text-lg flex-shrink-0">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{user.displayName}</h3>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (selectedConversationId) {
    return (
      <div className="fixed left-0 right-0 bottom-0 top-16 md:static md:h-[calc(100vh-12rem)] flex flex-col glass-light overflow-hidden md:rounded-xl z-30 md:z-0">
        <div className="glass-light border-b border-white/20 px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 flex-shrink-0">
          <button
            onClick={() => setSelectedConversationId(null)}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full glass-bubble flex items-center justify-center hover:bg-white/50 transition-all flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            selectedConversation?.id === 'publicRoom'
              ? 'bg-gradient-to-br from-[#FF6B35] to-[#FFA500] text-white text-base'
              : selectedConversation?.type === 'group'
                ? 'bg-[#D71921] text-white'
                : 'bg-gray-700 text-white font-bold'
          }`}>
            {selectedConversation?.id === 'publicRoom'
              ? '🌍'
              : selectedConversation?.type === 'group'
                ? <Users className="w-4 h-4 md:w-5 md:h-5" />
                : selectedConversation?.title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-gray-900 text-sm md:text-base truncate">{selectedConversation?.title}</h2>
            <p className="text-xs text-gray-500 truncate">{selectedConversation?.type === 'group' ? 'Group Chat' : 'Private Chat'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4 min-h-0" style={{ overflowX: 'hidden' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="relative">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-gray-200"></div>
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-[#D71921] border-t-transparent animate-spin absolute top-0 left-0"></div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center max-w-sm px-4"
              >
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-[#D71921]/10 to-[#B01419]/10 rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <MessageCircle className="w-8 h-8 md:w-12 md:h-12 text-[#D71921]" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
                <p className="text-sm text-gray-500">Be the first to break the ice and start the conversation!</p>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
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
            </div>
          )}
        </div>

        {typingUsers.length > 0 && (
          <div className="px-3 md:px-4 py-1.5 md:py-2 glass-light border-t border-white/20 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#D71921] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#D71921] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#D71921] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium">
                {typingUsers[0].userName} is typing...
              </p>
            </motion.div>
          </div>
        )}

        <div className="glass-light border-t border-white/20 px-3 md:px-4 py-2.5 md:py-3 flex-shrink-0">
          <MessageComposer onSendMessage={handleSendMessage} onTyping={handleTyping} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 right-0 bottom-0 top-16 md:static md:h-[calc(100vh-12rem)] flex flex-col glass-light overflow-hidden md:rounded-xl z-30 md:z-0">
      <div className="glass-light border-b border-white/20 p-3 md:p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Messages</h1>
          <div className="relative">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#D71921] text-white flex items-center justify-center hover:bg-[#B01419] transition-all shadow-lg"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {showCreateMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 md:w-56 glass-bubble rounded-xl shadow-xl border border-white/20 overflow-hidden z-50"
              >
                <button
                  onClick={handleCreateGroupChat}
                  className="w-full px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3 hover:bg-white/50 transition-all text-left"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#D71921] text-white flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">New Group</p>
                    <p className="text-xs text-gray-500 truncate">Create a group chat</p>
                  </div>
                </button>
                <button
                  onClick={handleCreatePrivateChat}
                  className="w-full px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3 hover:bg-white/50 transition-all text-left border-t border-white/20"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-700 text-white flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">New Chat</p>
                    <p className="text-xs text-gray-500 truncate">Start a private conversation</p>
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
            <div className="px-3 md:px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">Group Chats</p>
            </div>
            {groupChats.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 transition-all hover:glass-bubble"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  conversation.id === 'publicRoom'
                    ? 'bg-gradient-to-br from-[#FF6B35] to-[#FFA500] text-white text-lg md:text-xl'
                    : 'bg-[#D71921] text-white'
                }`}>
                  {conversation.id === 'publicRoom' ? '🌍' : <Users className="w-4 h-4 md:w-5 md:h-5" />}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{conversation.title}</h3>
                  <p className="text-xs text-gray-500">Tap to open</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {privateChats.length > 0 && (
          <div className="mt-4">
            <div className="px-3 md:px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">Private Messages</p>
            </div>
            {privateChats.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 transition-all hover:glass-bubble"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold text-base md:text-lg flex-shrink-0">
                  {conversation.title.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{conversation.title}</h3>
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
