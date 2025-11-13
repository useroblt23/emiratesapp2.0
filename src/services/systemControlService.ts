import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface SystemFeatures {
  chat: boolean;
  quiz: boolean;
  englishTest: boolean;
  profileEdit: boolean;
  openDayModule: boolean;
}

export interface SystemAnnouncement {
  active: boolean;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string | null;
}

export interface SystemControl {
  id: string;
  features: SystemFeatures;
  announcement: SystemAnnouncement;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export const getSystemControl = async (): Promise<SystemControl | null> => {
  try {
    const docRef = doc(db, 'system_control', 'status');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log('No system control entry found, creating default...');
      return await createDefaultSystemControl();
    }

    return docSnap.data() as SystemControl;
  } catch (error) {
    console.error('Error fetching system control:', error);
    return null;
  }
};

const createDefaultSystemControl = async (): Promise<SystemControl | null> => {
  try {
    const defaultControl: SystemControl = {
      id: 'status',
      features: {
        chat: true,
        quiz: true,
        englishTest: true,
        profileEdit: true,
        openDayModule: true,
      },
      announcement: {
        active: false,
        message: '',
        type: 'info' as const,
        timestamp: null,
      },
      updated_by: null,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const docRef = doc(db, 'system_control', 'status');
    await setDoc(docRef, defaultControl);
    console.log('Default system control created successfully');
    return defaultControl;
  } catch (error) {
    console.error('Error creating default system control:', error);
    return null;
  }
};

export const updateSystemControl = async (
  features: SystemFeatures,
  announcement: SystemAnnouncement,
  userId: string
): Promise<SystemControl | null> => {
  try {
    const docRef = doc(db, 'system_control', 'status');
    const updateData = {
      features,
      announcement: {
        ...announcement,
        timestamp: announcement.active ? new Date().toISOString() : null,
      },
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    await updateDoc(docRef, updateData);

    const docSnap = await getDoc(docRef);
    return docSnap.data() as SystemControl;
  } catch (error) {
    console.error('Error updating system control:', error);
    throw error;
  }
};

export const subscribeToSystemControl = (
  callback: (control: SystemControl | null) => void
) => {
  const docRef = doc(db, 'system_control', 'status');

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as SystemControl);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to system control:', error);
    callback(null);
  });

  return unsubscribe;
};
