import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, Unsubscribe } from 'firebase/firestore';

export interface SystemFeatures {
  aiTrainer: boolean;
  openDay: boolean;
  chat: boolean;
  courses: boolean;
  profileEdit: boolean;
  downloads: boolean;
  stripePayments: boolean;
}

export interface SystemAnnouncement {
  active: boolean;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  startedAt: any;
  expiresAt: any;
}

export interface SystemMaintenance {
  active: boolean;
  message: string;
  startedAt: any;
}

export interface SystemControl {
  features: SystemFeatures;
  announcement: SystemAnnouncement;
  maintenance: SystemMaintenance;
  updatedBy: string;
  updatedAt: any;
}

const SYSTEM_CONTROL_DOC_ID = 'status';

export const getSystemControl = async (): Promise<SystemControl | null> => {
  try {
    const docRef = doc(db, 'systemControl', SYSTEM_CONTROL_DOC_ID);
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
    const defaultControl = {
      features: {
        aiTrainer: true,
        openDay: true,
        chat: true,
        courses: true,
        profileEdit: true,
        downloads: true,
        stripePayments: true,
      },
      announcement: {
        active: false,
        message: '',
        type: 'info' as const,
        startedAt: null,
        expiresAt: null,
      },
      maintenance: {
        active: false,
        message: '',
        startedAt: null,
      },
      updatedBy: 'system',
      updatedAt: serverTimestamp(),
    };

    const docRef = doc(db, 'systemControl', SYSTEM_CONTROL_DOC_ID);
    await setDoc(docRef, defaultControl);
    console.log('Default system control created successfully');
    return defaultControl;
  } catch (error) {
    console.error('Error creating default system control:', error);
    return null;
  }
};

export const updateSystemControl = async (
  updates: Partial<SystemControl>,
  userId: string
): Promise<SystemControl | null> => {
  try {
    const docRef = doc(db, 'systemControl', SYSTEM_CONTROL_DOC_ID);
    const updateData = {
      ...updates,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updateData);

    const docSnap = await getDoc(docRef);
    return docSnap.data() as SystemControl;
  } catch (error) {
    console.error('Error updating system control:', error);
    throw error;
  }
};

export const toggleFeature = async (
  featureName: keyof SystemFeatures,
  enabled: boolean,
  userId: string
): Promise<void> => {
  try {
    const systemControl = await getSystemControl();
    if (!systemControl) throw new Error('System control not found');

    const updatedFeatures = {
      ...systemControl.features,
      [featureName]: enabled,
    };

    await updateSystemControl({ features: updatedFeatures }, userId);
  } catch (error) {
    console.error('Error toggling feature:', error);
    throw error;
  }
};

export const updateAnnouncement = async (
  announcement: Partial<SystemAnnouncement>,
  userId: string
): Promise<void> => {
  try {
    const systemControl = await getSystemControl();
    if (!systemControl) throw new Error('System control not found');

    const updatedAnnouncement = {
      ...systemControl.announcement,
      ...announcement,
    };

    await updateSystemControl({ announcement: updatedAnnouncement }, userId);
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

export const updateMaintenance = async (
  maintenance: Partial<SystemMaintenance>,
  userId: string
): Promise<void> => {
  try {
    const systemControl = await getSystemControl();
    if (!systemControl) throw new Error('System control not found');

    const updatedMaintenance = {
      ...systemControl.maintenance,
      ...maintenance,
    };

    await updateSystemControl({ maintenance: updatedMaintenance }, userId);
  } catch (error) {
    console.error('Error updating maintenance:', error);
    throw error;
  }
};

export const subscribeToSystemControl = (
  callback: (control: SystemControl | null) => void
): Unsubscribe => {
  const docRef = doc(db, 'systemControl', SYSTEM_CONTROL_DOC_ID);

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
