import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  subject: string;
  createdAt: any;
  updatedAt: any;
  lastMessageAt: any;
  assignedTo?: string;
  unreadByUser: number;
  unreadByGovernor: number;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'governor';
  message: string;
  timestamp: any;
  read: boolean;
}

export const createSupportTicket = async (
  userId: string,
  userName: string,
  userEmail: string,
  subject: string,
  initialMessage: string
): Promise<string> => {
  try {
    console.log('Creating support ticket with data:', { userId, userName, userEmail, subject });

    const ticketRef = doc(collection(db, 'supportTickets'));
    const ticketId = ticketRef.id;

    console.log('Generated ticket ID:', ticketId);

    const ticketData: Omit<SupportTicket, 'id'> = {
      userId,
      userName,
      userEmail,
      status: 'open',
      priority: 'medium',
      subject,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      unreadByUser: 0,
      unreadByGovernor: 1,
    };

    console.log('Writing ticket to Firestore...');
    await setDoc(ticketRef, ticketData);
    console.log('Ticket created successfully');

    console.log('Adding initial message...');
    await addDoc(collection(db, 'supportTickets', ticketId, 'messages'), {
      ticketId,
      senderId: userId,
      senderName: userName,
      senderRole: 'user',
      message: initialMessage,
      timestamp: serverTimestamp(),
      read: false,
    });
    console.log('Initial message added successfully');

    return ticketId;
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

export const sendSupportMessage = async (
  ticketId: string,
  senderId: string,
  senderName: string,
  senderRole: 'user' | 'governor',
  message: string
): Promise<void> => {
  try {
    await addDoc(collection(db, 'supportTickets', ticketId, 'messages'), {
      ticketId,
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: serverTimestamp(),
      read: false,
    });

    const updateData: any = {
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (senderRole === 'user') {
      updateData.unreadByGovernor = (await getUnreadCount(ticketId, 'governor')) + 1;
    } else {
      updateData.unreadByUser = (await getUnreadCount(ticketId, 'user')) + 1;
    }

    await updateDoc(doc(db, 'supportTickets', ticketId), updateData);
  } catch (error) {
    console.error('Error sending support message:', error);
    throw error;
  }
};

const getUnreadCount = async (ticketId: string, role: 'user' | 'governor'): Promise<number> => {
  try {
    const ticketDoc = await getDoc(doc(db, 'supportTickets', ticketId));
    if (!ticketDoc.exists()) return 0;
    const data = ticketDoc.data();
    return role === 'user' ? (data.unreadByUser || 0) : (data.unreadByGovernor || 0);
  } catch (error) {
    return 0;
  }
};

export const markMessagesAsRead = async (ticketId: string, role: 'user' | 'governor'): Promise<void> => {
  try {
    const updateData: any = {};
    if (role === 'user') {
      updateData.unreadByUser = 0;
    } else {
      updateData.unreadByGovernor = 0;
    }

    await updateDoc(doc(db, 'supportTickets', ticketId), updateData);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

export const getUserSupportTickets = async (userId: string): Promise<SupportTicket[]> => {
  try {
    const q = query(
      collection(db, 'supportTickets'),
      where('userId', '==', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SupportTicket));
  } catch (error) {
    console.error('Error fetching user support tickets:', error);
    return [];
  }
};

export const getAllSupportTickets = async (): Promise<SupportTicket[]> => {
  try {
    const q = query(
      collection(db, 'supportTickets'),
      orderBy('lastMessageAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SupportTicket));
  } catch (error) {
    console.error('Error fetching all support tickets:', error);
    return [];
  }
};

export const updateTicketStatus = async (
  ticketId: string,
  status: SupportTicket['status']
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'supportTickets', ticketId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
};

export const subscribeToTicketMessages = (
  ticketId: string,
  callback: (messages: SupportMessage[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'supportTickets', ticketId, 'messages'),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SupportMessage));
    callback(messages);
  });
};

export const subscribeToUserTickets = (
  userId: string,
  callback: (tickets: SupportTicket[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'supportTickets'),
    where('userId', '==', userId),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SupportTicket));
    callback(tickets);
  });
};

export const subscribeToAllTickets = (
  callback: (tickets: SupportTicket[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'supportTickets'),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SupportTicket));
    callback(tickets);
  });
};
