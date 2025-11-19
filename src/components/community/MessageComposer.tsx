import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (content: string, file?: File) => Promise<void>;
  onTyping: () => void;
  placeholder?: string;
}

export default function MessageComposer({
  onSendMessage,
  onTyping,
  placeholder = 'Type a message...',
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    onTyping();

    typingTimeoutRef.current = setTimeout(() => {
      // Typing stopped
    }, 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setAttachment(file);
    }
  };

  const handleSend = async () => {
    if ((!message.trim() && !attachment) || sending) return;

    setSending(true);
    try {
      await onSendMessage(message, attachment || undefined);
      setMessage('');
      setAttachment(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl p-4">
      {attachment && (
        <div className="mb-3 flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20">
          <ImageIcon className="w-5 h-5 text-blue-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-white/60">
              {(attachment.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={() => setAttachment(null)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-xl border border-white/20"
          disabled={sending}
        >
          <Paperclip className="w-5 h-5 text-white" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex-1">
          <textarea
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            rows={1}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-xl resize-none"
            disabled={sending}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={(!message.trim() && !attachment) || sending}
          className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl shadow-lg"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      <p className="text-xs text-white/40 mt-2">
        Press Enter to send, Shift+Enter for new line. Max file size: 10MB
      </p>
    </div>
  );
}
