import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  onSnapshot,
  updateDoc,
  arrayUnion,
  DocumentSnapshot,
  QueryConstraint,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth, functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';

export interface Conversation {
  id: string;
  type: 'group' | 'private';
  title: string;
  members: string[];
  createdBy: string;
  createdAt: Timestamp;
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: Timestamp;
  };
  pinned?: boolean;
  mutedBy?: Record<string, boolean>;
  isArchivedBy?: Record<string, boolean>;
}

export interface Message {
  messageId: string;
  senderId: string;
  senderName?: string;
  content: string;
  contentType: 'text' | 'image' | 'file' | 'system';
  attachmentRef?: string;
  attachmentUrl?: string;
  attachmentMetadata?: {
    name: string;
    size: number;
    type: string;
  };
  createdAt: Timestamp;
  editedAt?: Timestamp;
  deleted: boolean;
  reactions?: Record<string, string[]>;
  likesCount: number;
  readBy?: Record<string, Timestamp>;
  replyTo?: string;
}

export interface MessageReport {
  reporterId: string;
  messageRef: string;
  conversationId: string;
  messageId: string;
  reason: string;
  status: 'open' | 'reviewed' | 'closed';
  createdAt: Timestamp;
  handledBy?: string;
  handledAt?: Timestamp;
}

const PAGE_SIZE = 50;

export const communityChatService = {
  async createConversation(
    type: 'group' | 'private',
    title: string,
    memberIds: string[]
  ): Promise<string> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    if (!memberIds.includes(userId)) {
      memberIds.push(userId);
    }

    if (memberIds.length < 2) {
      throw new Error('Conversation must have at least 2 members');
    }

    if (type === 'private' && memberIds.length > 2) {
      throw new Error('Private conversations can only have 2 members');
    }

    if (type === 'private') {
      const existingConv = await this.findPrivateConversation(memberIds);
      if (existingConv) {
        return existingConv.id;
      }
    }

    const conversationRef = doc(collection(db, 'conversations'));
    const conversationData: Conversation = {
      id: conversationRef.id,
      type,
      title,
      members: memberIds,
      createdBy: userId,
      createdAt: Timestamp.now(),
      pinned: false,
      mutedBy: {},
      isArchivedBy: {},
    };

    await setDoc(conversationRef, conversationData);
    return conversationRef.id;
  },

  async findPrivateConversation(memberIds: string[]): Promise<Conversation | null> {
    if (memberIds.length !== 2) return null;

    const q = query(
      collection(db, 'conversations'),
      where('type', '==', 'private'),
      where('members', 'array-contains', memberIds[0])
    );

    const snapshot = await getDocs(q);
    const conv = snapshot.docs.find(
      (doc) =>
        doc.data().members.length === 2 &&
        doc.data().members.includes(memberIds[1])
    );

    if (conv) {
      return { id: conv.id, ...conv.data() } as Conversation;
    }

    return null;
  },

  async getConversations(): Promise<Conversation[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const q = query(
      collection(db, 'conversations'),
      where('members', 'array-contains', userId),
      orderBy('lastMessage.createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Conversation));
  },

  subscribeToConversations(callback: (conversations: Conversation[]) => void) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const q = query(
      collection(db, 'conversations'),
      where('members', 'array-contains', userId),
      orderBy('lastMessage.createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Conversation));
      callback(conversations);
    });
  },

  async sendMessage(
    conversationId: string,
    content: string,
    contentType: 'text' | 'image' | 'file' = 'text',
    attachmentFile?: File,
    replyTo?: string
  ): Promise<string> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const messageRef = doc(collection(db, 'conversations', conversationId, 'messages'));
    let attachmentUrl: string | undefined;
    let attachmentRef: string | undefined;
    let attachmentMetadata: any;

    if (attachmentFile) {
      const storagePath = `attachments/${conversationId}/${messageRef.id}/${attachmentFile.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, attachmentFile);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          reject,
          async () => {
            attachmentUrl = await getDownloadURL(uploadTask.snapshot.ref);
            attachmentRef = storagePath;
            attachmentMetadata = {
              name: attachmentFile.name,
              size: attachmentFile.size,
              type: attachmentFile.type,
            };
            resolve(true);
          }
        );
      });

      const awardAttachment = httpsCallable(functions, 'awardAttachmentUpload');
      await awardAttachment({ conversationId });
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    const userName = userDoc.data()?.name || 'Unknown User';

    const messageData: Message = {
      messageId: messageRef.id,
      senderId: userId,
      senderName: userName,
      content,
      contentType,
      attachmentRef,
      attachmentUrl,
      attachmentMetadata,
      createdAt: Timestamp.now(),
      deleted: false,
      reactions: {},
      likesCount: 0,
      readBy: { [userId]: Timestamp.now() },
      replyTo,
    };

    await setDoc(messageRef, messageData);

    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: {
        text: content,
        senderId: userId,
        createdAt: Timestamp.now(),
      },
    });

    const awardMessage = httpsCallable(functions, 'awardMessageSent');
    await awardMessage({ conversationId });

    return messageRef.id;
  },

  async getMessages(
    conversationId: string,
    pageSize: number = PAGE_SIZE,
    lastDoc?: DocumentSnapshot
  ): Promise<{ messages: Message[]; lastDoc: DocumentSnapshot | null }> {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(pageSize)];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      ...constraints
    );

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map((doc) => doc.data() as Message);

    return {
      messages: messages.reverse(),
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  },

  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void,
    limitCount: number = 50
  ) {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => doc.data() as Message);
      callback(messages.reverse());
    });
  },

  async markAsRead(conversationId: string, messageId: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, {
      [`readBy.${userId}`]: Timestamp.now(),
    });
  },

  async addReaction(
    conversationId: string,
    messageId: string,
    emoji: string,
    recipientId: string
  ): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    const messageData = messageDoc.data();

    if (!messageData) throw new Error('Message not found');

    const reactions = messageData.reactions || {};
    const emojiReactions = reactions[emoji] || [];

    if (!emojiReactions.includes(userId)) {
      emojiReactions.push(userId);
      reactions[emoji] = emojiReactions;

      await updateDoc(messageRef, { reactions });

      if (recipientId !== userId) {
        const awardReaction = httpsCallable(functions, 'awardEmojiReaction');
        await awardReaction({ messageId, conversationId, recipientId, emoji });
      }
    }
  },

  async removeReaction(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    const messageData = messageDoc.data();

    if (!messageData) throw new Error('Message not found');

    const reactions = messageData.reactions || {};
    const emojiReactions = reactions[emoji] || [];

    const updatedReactions = emojiReactions.filter((id: string) => id !== userId);

    if (updatedReactions.length > 0) {
      reactions[emoji] = updatedReactions;
    } else {
      delete reactions[emoji];
    }

    await updateDoc(messageRef, { reactions });
  },

  async likeMessage(
    conversationId: string,
    messageId: string,
    recipientId: string
  ): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, {
      likesCount: increment(1),
    });

    if (recipientId !== userId) {
      const awardLike = httpsCallable(functions, 'awardMessageLike');
      await awardLike({ messageId, conversationId, recipientId });
    }
  },

  async reportMessage(
    conversationId: string,
    messageId: string,
    reason: string
  ): Promise<void> {
    const reportFunc = httpsCallable(functions, 'reportMessage');
    await reportFunc({ conversationId, messageId, reason });
  },

  async deleteAttachment(attachmentPath: string): Promise<void> {
    const storageRef = ref(storage, attachmentPath);
    await deleteObject(storageRef);
  },
};
