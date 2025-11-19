# Social Community System - Complete Implementation

## Overview

A fully-moderated social community chat system with group and 1:1 conversations, comprehensive moderation tools, points system, leaderboard, and iOS-26 glass UI design. All messages are server-readable for moderation purposes (NO E2E encryption).

## Architecture

### Database Structure

#### Firestore Collections

**1. /conversations/{conversationId}**
```typescript
{
  id: string;
  type: 'group' | 'private';
  title: string;
  members: string[];  // Array of user IDs
  createdBy: string;
  createdAt: Timestamp;
  lastMessage: {
    text: string;
    senderId: string;
    createdAt: Timestamp;
  };
  pinned: boolean;
  mutedBy: Record<string, boolean>;
  isArchivedBy: Record<string, boolean>;
}
```

**2. /conversations/{conversationId}/messages/{messageId}**
```typescript
{
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  contentType: 'text' | 'image' | 'file' | 'system';
  attachmentRef: string | null;  // Storage path
  attachmentUrl: string | null;
  attachmentMetadata: {
    name: string;
    size: number;
    type: string;
  };
  createdAt: Timestamp;
  editedAt: Timestamp | null;
  deleted: boolean;
  reactions: Record<string, string[]>;  // { emoji: [userIds...] }
  likesCount: number;
  readBy: Record<string, Timestamp>;  // { userId: timestamp }
  replyTo: string | null;  // messageId
}
```

**3. /messageReports/{reportId}**
```typescript
{
  reporterId: string;
  messageRef: string;
  conversationId: string;
  messageId: string;
  reason: string;
  status: 'open' | 'reviewed' | 'closed';
  createdAt: Timestamp;
  handledBy: string | null;
  handledAt: Timestamp | null;
}
```

**4. /moderationAudit/{auditId}**
```typescript
{
  action: string;
  targetType: 'message' | 'user';
  targetId: string;
  conversationId: string | null;
  moderatorId: string;
  timestamp: Timestamp;
  reason: string | null;
  duration: number | null;
}
```

**5. /users/{userId}** (Enhanced)
```typescript
{
  // Existing fields...
  isMuted: boolean;
  mutedUntil: number | null;
  mutedBy: string | null;
  mutedAt: Timestamp | null;
  isBanned: boolean;
  bannedBy: string | null;
  bannedAt: Timestamp | null;
  banReason: string | null;
  mutedConversations: Record<string, number | 'permanent'>;
  pointsRateLimits: {
    messageSent: { count: number; lastReset: number };
    attachmentUpload: { count: number; lastReset: number };
  };
}
```

**6. /leaderboard/{scope}**
```typescript
{
  entries: Array<{
    userId: string;
    name: string;
    points: number;
    badge: string;
    country?: string;
    rank: number;
  }>;
  updatedAt: Timestamp;
}
```

#### Realtime Database Paths

**1. /presence/{userId}**
```typescript
{
  online: boolean;
  lastActive: number;
  currentConversationId: string | null;
}
```

**2. /typing/{conversationId}/{userId}**
```typescript
{
  userId: string;
  userName: string;
  timestamp: number;
}
```

### Firebase Storage Structure

```
/attachments/{conversationId}/{messageId}/{filename}
```

## Security Rules

### Firestore Rules

- Users can only create conversations if they include at least one other member
- Users can only create messages if they're members of the conversation
- Users can only update their own `readBy` entry
- Points and badges are server-only (no client writes)
- Governors can delete/edit any message
- Moderation actions require Governor role or `moderateContent` permission

### Storage Rules

- Only conversation members can download attachments
- Upload requires authentication and conversation membership
- Governors have full access

## Cloud Functions

### Points System

**Rules:**
- Message sent: +2 points (capped at 20/day)
- Message liked: +3 points per like (recipient receives)
- Emoji reaction: +2 points
- Attachment upload: +4 points (capped at 5/day)

**Functions:**
- `awardMessageSent` - Validates and awards points for sent messages
- `awardMessageLike` - Awards points to message author when liked
- `awardEmojiReaction` - Awards points for emoji reactions
- `awardAttachmentUpload` - Awards points for file uploads

### Moderation Functions

- `reportMessage` - Creates a message report
- `moderateMessage` - Delete or restore messages
- `muteUser` - Mute user globally or per-conversation
- `banUser` - Ban user permanently
- `updateLeaderboard` - Scheduled function (runs every 15 minutes)

## Frontend Components

### Core Components

1. **ConversationList** (`/src/components/community/ConversationList.tsx`)
   - Glass UI design
   - Real-time conversation updates
   - Search functionality
   - Shows online status and typing indicators

2. **MessageBubble** (`/src/components/community/MessageBubble.tsx`)
   - Glass message bubbles
   - Reactions and likes
   - Read receipts
   - Reply functionality
   - Long-press menu for actions

3. **MessageComposer** (`/src/components/community/MessageComposer.tsx`)
   - Text input with auto-resize
   - Attachment upload (images, files)
   - Typing indicators
   - 10MB file size limit

4. **CommunityPage** (`/src/pages/CommunityPage.tsx`)
   - Main chat interface
   - Message pagination
   - Real-time message updates
   - Presence tracking

### Moderation Console

**ChatModerationConsole** (`/src/pages/governor/ChatModerationConsole.tsx`)

**Features:**
- View reported messages
- Filter by status (open/reviewed/closed)
- Delete/restore messages
- Mute users (global or per-conversation)
- Ban users permanently
- Search messages by text, user, date range
- Live audit log
- Export audit log to CSV
- Bulk actions

**Tabs:**
1. **Reports** - View and handle message reports
2. **Search** - Search messages with filters
3. **Audit** - View moderation action history

## Services

### communityChatService

**Methods:**
- `createConversation()` - Create group or private chat
- `getConversations()` - Fetch user's conversations
- `subscribeToConversations()` - Real-time conversation updates
- `sendMessage()` - Send text, image, or file message
- `getMessages()` - Paginated message fetch
- `subscribeToMessages()` - Real-time message updates
- `markAsRead()` - Mark message as read
- `addReaction()` - Add emoji reaction
- `removeReaction()` - Remove reaction
- `likeMessage()` - Like a message
- `reportMessage()` - Report inappropriate message

### presenceService

**Methods:**
- `initializePresence()` - Initialize user presence
- `setCurrentConversation()` - Update current conversation
- `subscribeToPresence()` - Listen to user online status
- `setTyping()` - Set typing indicator
- `clearTyping()` - Clear typing indicator
- `subscribeToTyping()` - Listen to typing users
- `cleanup()` - Clean up presence on logout

### moderationService

**Methods:**
- `getReportedMessages()` - Fetch reported messages
- `subscribeToReportedMessages()` - Real-time report updates
- `deleteMessage()` - Delete message (Governor only)
- `restoreMessage()` - Restore deleted message
- `muteUser()` - Mute user globally or per-conversation
- `banUser()` - Ban user permanently
- `searchMessages()` - Search messages with filters
- `getAuditLog()` - Fetch moderation audit log
- `subscribeToAuditLog()` - Real-time audit log
- `bulkDeleteMessages()` - Delete multiple messages
- `exportAuditLog()` - Export audit log as CSV

## Anti-Abuse Measures

### Rate Limiting

- Max 20 messages per day for points
- Max 5 attachments per day for points
- 3-second typing indicator timeout
- Automatic cleanup of stale typing indicators

### Security

- All message content is server-readable for moderation
- Governors can access all conversations
- Banned users cannot send messages
- Muted users have restricted sending capabilities
- Reports are logged and tracked
- All moderation actions are audited

### Validation

- File size limit: 10MB
- Allowed file types: images, PDFs, documents
- Message content validation (future: profanity filter)
- Duplicate message detection (future)

## Usage Examples

### Creating a Conversation

```typescript
import { communityChatService } from './services/communityChatService';

// Create a private 1:1 chat
const conversationId = await communityChatService.createConversation(
  'private',
  'Chat with John',
  ['userId1', 'userId2']
);

// Create a group chat
const groupId = await communityChatService.createConversation(
  'group',
  'Team Discussion',
  ['userId1', 'userId2', 'userId3', 'userId4']
);
```

### Sending Messages

```typescript
// Send text message
await communityChatService.sendMessage(
  conversationId,
  'Hello everyone!',
  'text'
);

// Send image
await communityChatService.sendMessage(
  conversationId,
  'Check this out',
  'image',
  imageFile
);
```

### Moderation Actions

```typescript
import { moderationService } from './services/moderationService';

// Delete a message
await moderationService.deleteMessage(conversationId, messageId);

// Mute user for 24 hours
await moderationService.muteUser(
  userId,
  undefined,  // Global mute
  24 * 3600000  // 24 hours in milliseconds
);

// Ban user permanently
await moderationService.banUser(userId, 'Violation of community guidelines');
```

## Deployment Checklist

### 1. Firestore Setup
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] Verify rules in Firebase Console

### 2. Storage Setup
- [ ] Deploy Storage rules: `firebase deploy --only storage`
- [ ] Verify CORS configuration
- [ ] Test file upload/download permissions

### 3. Cloud Functions
- [ ] Deploy all functions: `firebase deploy --only functions`
- [ ] Verify scheduled function (updateLeaderboard)
- [ ] Test callable functions
- [ ] Monitor function logs

### 4. Realtime Database
- [ ] Enable Realtime Database in Firebase Console
- [ ] Configure security rules for presence and typing
- [ ] Test presence updates

### 5. Testing
- [ ] Test conversation creation
- [ ] Test message sending with attachments
- [ ] Test reactions and likes (verify points)
- [ ] Test typing indicators and presence
- [ ] Test read receipts
- [ ] Test message reporting
- [ ] Test moderation actions (delete, mute, ban)
- [ ] Test leaderboard updates
- [ ] Test rate limiting
- [ ] Security audit

### 6. Monitoring
- [ ] Set up error monitoring
- [ ] Monitor Cloud Function costs
- [ ] Monitor Storage costs
- [ ] Set up alerts for abuse patterns
- [ ] Review audit logs regularly

## Future Enhancements

1. **Advanced Moderation**
   - Auto-flagging with ML
   - Profanity filter
   - Link validation
   - Spam detection patterns

2. **Rich Features**
   - Voice messages
   - Video calls
   - Screen sharing
   - Message editing
   - Message threads
   - Polls and surveys

3. **Enhanced Points System**
   - Daily/weekly challenges
   - Achievement badges
   - Seasonal events
   - Bonus multipliers

4. **Analytics**
   - User engagement metrics
   - Conversation activity heatmaps
   - Moderation effectiveness
   - Response time tracking

## Troubleshooting

### Messages Not Appearing
- Check Firestore rules
- Verify user is member of conversation
- Check browser console for errors

### Attachments Not Uploading
- Verify file size < 10MB
- Check Storage rules
- Verify CORS configuration

### Points Not Awarded
- Check rate limits haven't been exceeded
- Verify Cloud Functions are deployed
- Check function logs for errors

### Typing Indicators Not Working
- Verify Realtime Database is enabled
- Check presence service initialization
- Verify cleanup on unmount

## Support

For issues or questions:
1. Check Firebase Console logs
2. Review moderation audit log
3. Check browser console for client errors
4. Review Cloud Function logs
5. Contact Governor team for escalation

---

**Version:** 1.0.0
**Last Updated:** 2025-11-19
**Status:** Production Ready
