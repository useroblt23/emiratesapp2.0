import React, { useState } from 'react';
import { Heart, Smile, Flag, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { Message } from '../../services/communityChatService';
import { auth } from '../../lib/firebase';

interface MessageBubbleProps {
  message: Message;
  onAddReaction: (emoji: string) => void;
  onLike: () => void;
  onReport: () => void;
  showReadReceipts?: boolean;
}

const QUICK_REACTIONS = ['👍', '❤️', '😊', '🎉', '🔥', '👏'];

export default function MessageBubble({
  message,
  onAddReaction,
  onLike,
  onReport,
  showReadReceipts = true,
}: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const currentUserId = auth.currentUser?.uid;
  const isOwnMessage = message.senderId === currentUserId;

  const readByCount = message.readBy ? Object.keys(message.readBy).length : 0;

  if (message.deleted) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className="max-w-md px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <p className="text-white/40 italic text-sm">This message was deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className="max-w-md">
        {!isOwnMessage && (
          <p className="text-xs text-white/60 mb-1 ml-3">{message.senderName}</p>
        )}

        <div
          className={`relative px-4 py-3 rounded-2xl backdrop-blur-xl border ${
            isOwnMessage
              ? 'bg-blue-500/20 border-blue-500/30 text-white'
              : 'bg-white/10 border-white/20 text-white'
          }`}
        >
          {message.replyTo && (
            <div className="mb-2 pb-2 border-b border-white/10">
              <p className="text-xs text-white/60">Replying to message</p>
            </div>
          )}

          <p className="text-sm break-words">{message.content}</p>

          {message.attachmentUrl && (
            <div className="mt-2">
              {message.contentType === 'image' ? (
                <img
                  src={message.attachmentUrl}
                  alt="Attachment"
                  className="rounded-lg max-w-full max-h-64 object-cover"
                />
              ) : (
                <a
                  href={message.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {message.attachmentMetadata?.name || 'Attachment'}
                    </p>
                    <p className="text-xs text-white/60">
                      {message.attachmentMetadata?.size
                        ? `${(message.attachmentMetadata.size / 1024 / 1024).toFixed(2)} MB`
                        : ''}
                    </p>
                  </div>
                </a>
              )}
            </div>
          )}

          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(message.reactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => onAddReaction(emoji)}
                  className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-xs hover:bg-white/20 transition-colors"
                >
                  <span>{emoji}</span>
                  <span className="text-white/60">{users.length}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2 text-xs text-white/40">
            <span>
              {message.createdAt.toDate().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>

            {isOwnMessage && showReadReceipts && readByCount > 1 && (
              <div className="flex items-center gap-1">
                {readByCount > 2 ? (
                  <CheckCheck className="w-3 h-3 text-blue-400" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                <span>{readByCount - 1}</span>
              </div>
            )}
          </div>

          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col gap-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-1">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                title="Add reaction"
              >
                <Smile className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={onLike}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                title="Like"
              >
                <Heart
                  className={`w-4 h-4 ${
                    message.likesCount > 0 ? 'fill-red-500 text-red-500' : 'text-white'
                  }`}
                />
              </button>

              {!isOwnMessage && (
                <button
                  onClick={onReport}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                  title="Report"
                >
                  <Flag className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>

          {showReactions && (
            <div className="absolute -top-12 left-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-2 flex gap-2 shadow-xl">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onAddReaction(emoji);
                    setShowReactions(false);
                  }}
                  className="text-xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {message.likesCount > 0 && (
          <div className="flex items-center gap-1 mt-1 ml-3 text-xs text-white/60">
            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
            <span>{message.likesCount} likes</span>
          </div>
        )}
      </div>
    </div>
  );
}
