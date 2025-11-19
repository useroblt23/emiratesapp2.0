import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
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
  const [reportingMessage, setReportingMessage] = useState<string | null>(null);
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
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="w-80 flex-shrink-0">
        <ConversationList
          onSelectConversation={setSelectedConversationId}
          selectedConversationId={selectedConversationId || undefined}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center gap-3">
              <button
                onClick={() => setSelectedConversationId(null)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">Conversation</h2>
                {typingUsers.length > 0 && (
                  <p className="text-sm text-white/60">
                    {typingUsers[0].userName} is typing...
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/40">
                  <p>No messages yet. Start the conversation!</p>
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
          <div className="flex items-center justify-center h-full text-white/40">
            <div className="text-center">
              <p className="text-lg mb-2">Select a conversation to start chatting</p>
              <p className="text-sm">Choose from the list on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
