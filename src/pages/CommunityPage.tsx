import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ConversationList from '../components/community/ConversationList';
import MessageBubble from '../components/community/MessageBubble';
import MessageComposer from '../components/community/MessageComposer';
import { communityChatService, Message } from '../services/communityChatService';
import { presenceService, TypingData } from '../services/presenceService';
import { auth } from '../lib/firebase';

export default function CommunityPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    presenceService.initializePresence();

    return () => {
      presenceService.cleanup();
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
        <div className="w-80 border-r border-gray-200 flex-shrink-0">
          <ConversationList
            onSelectConversation={(id) => setSelectedConversationId(id)}
            selectedConversationId={selectedConversationId || undefined}
          />
        </div>

        <div className="flex-1 flex flex-col">
          {selectedConversationId ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="lg:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-[#000000]">Conversation</h2>
                  {typingUsers.length > 0 && (
                    <p className="text-sm text-gray-500">
                      {typingUsers[0].userName} is typing...
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#D71921]"></div>
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold mb-2">Select a conversation</p>
                <p className="text-sm">Choose from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
