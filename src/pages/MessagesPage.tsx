import { useState } from 'react';
import { mockConversations, Conversation, Message } from '../data/mockData';
import { Send, Smile, Paperclip, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { encryptMessage } from '../utils/encryption';

export default function MessagesPage() {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(mockConversations[0]);
  const [messageText, setMessageText] = useState('');
  const [conversations, setConversations] = useState(mockConversations);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConv) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'student-001',
      senderName: 'Maria Rodriguez',
      text: messageText,
      timestamp: 'Just now',
      encrypted: true,
    };

    const updatedConvs = conversations.map((conv) =>
      conv.id === selectedConv.id
        ? {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: messageText,
            timestamp: 'Just now',
          }
        : conv
    );

    setConversations(updatedConvs);
    setSelectedConv({
      ...selectedConv,
      messages: [...selectedConv.messages, newMessage],
    });
    setMessageText('');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#1C1C1C] mb-2">Messages</h1>
        <p className="text-gray-600">Secure end-to-end encrypted conversations</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-16rem)]">
        <div className="flex h-full">
          <div className="w-80 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/20 transition"
              />
            </div>

            <div className="space-y-1 px-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full text-left p-4 rounded-xl transition ${
                    selectedConv?.id === conv.id
                      ? 'bg-[#EADBC8]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={conv.participantPhoto}
                        alt={conv.participantName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#D71920] text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {conv.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-[#1C1C1C] truncate">
                          {conv.participantName}
                        </h3>
                        <span className="text-xs text-gray-500">{conv.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {selectedConv ? (
              <>
                <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedConv.participantPhoto}
                      alt={selectedConv.participantName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    />
                    <div>
                      <h2 className="font-bold">{selectedConv.participantName}</h2>
                      <div className="flex items-center gap-1 text-xs text-red-100">
                        <Lock className="w-3 h-3" />
                        <span>End-to-end encrypted</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#EADBC8]/10">
                  {selectedConv.messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.senderId === 'student-001' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-md px-4 py-3 rounded-2xl shadow-sm group relative ${
                          message.senderId === 'student-001'
                            ? 'bg-gradient-to-r from-[#D71920] to-[#B91518] text-white'
                            : 'bg-white text-[#1C1C1C]'
                        }`}
                      >
                        <p className="leading-relaxed">{message.text}</p>
                        <div className={`flex items-center gap-2 mt-1 text-xs ${
                          message.senderId === 'student-001' ? 'text-red-100' : 'text-gray-500'
                        }`}>
                          <span>{message.timestamp}</span>
                          {message.encrypted && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <Lock className="w-3 h-3" />
                              <span>Encrypted</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-gray-200 p-4 bg-white">
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/20 transition"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-gradient-to-r from-[#D71920] to-[#B91518] text-white rounded-lg hover:shadow-lg transition"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Messages are encrypted end-to-end
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
