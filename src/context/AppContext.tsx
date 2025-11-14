import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  getSystemControl,
  subscribeToSystemControl,
  SystemControl,
  SystemFeatures,
  SystemAnnouncement,
} from '../services/systemControlService';

export type Role = 'student' | 'mentor' | 'governor';
export type Plan = 'free' | 'pro' | 'vip';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: Role;
  plan: Plan;
  country: string;
  bio: string;
  photoURL: string;
  expectations: string;
  hasCompletedOnboarding: boolean;
  hasSeenWelcomeBanner: boolean;
  onboardingCompletedAt?: string;
  welcomeBannerSeenAt?: string;
  createdAt: string;
  updatedAt: string;
  banned?: boolean;
  muted?: boolean;
}

export interface Banner {
  id: string;
  title: string;
  color: string;
  expiration: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  maintenanceMode: boolean;
  setMaintenanceMode: (enabled: boolean) => void;
  maintenanceMessage: string;
  setMaintenanceMessage: (message: string) => void;
  banners: Banner[];
  setBanners: (banners: Banner[]) => void;
  systemFeatures: SystemFeatures;
  systemAnnouncement: SystemAnnouncement;
  isFeatureEnabled: (feature: keyof SystemFeatures) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('System under maintenance. Please check back soon.');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [systemFeatures, setSystemFeatures] = useState<SystemFeatures>({
    chat: true,
    quiz: true,
    englishTest: true,
    profileEdit: true,
    openDayModule: true,
  });
  const [systemAnnouncement, setSystemAnnouncement] = useState<SystemAnnouncement>({
    active: false,
    message: '',
    type: 'info',
    timestamp: null,
  });

  useEffect(() => {
    const loadSystemControl = async () => {
      const control = await getSystemControl();
      if (control) {
        setSystemFeatures(control.features);
        setSystemAnnouncement(control.announcement);
      }
    };

    loadSystemControl();

    const unsubscribe = subscribeToSystemControl((control) => {
      if (control) {
        setSystemFeatures(control.features);
        setSystemAnnouncement(control.announcement);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log('Setting up Firebase auth listener');

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('User authenticated:', firebaseUser.uid);

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              console.log('User data updated from Firestore:', userData);

              const updatedUser: User = {
                uid: firebaseUser.uid,
                email: userData.email || firebaseUser.email || '',
                name: userData.name || 'User',
                role: (userData.role || 'student') as Role,
                plan: (userData.plan || 'free') as Plan,
                country: userData.country || '',
                bio: userData.bio || '',
                expectations: userData.expectations || '',
                photoURL: userData.photo_base64 || userData.photoURL || 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
                hasCompletedOnboarding: userData.hasCompletedOnboarding || false,
                hasSeenWelcomeBanner: userData.hasSeenWelcomeBanner || false,
                onboardingCompletedAt: userData.onboardingCompletedAt,
                welcomeBannerSeenAt: userData.welcomeBannerSeenAt,
                createdAt: userData.createdAt || new Date().toISOString(),
                updatedAt: userData.updatedAt || new Date().toISOString(),
                banned: userData.banned,
                muted: userData.muted,
              };

              setCurrentUser(updatedUser);
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            } else {
              console.warn('User document not found in Firestore. User may need to complete registration.');
              const basicUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'User',
                role: 'student',
                plan: 'free',
                country: '',
                bio: '',
                expectations: '',
                photoURL: firebaseUser.photoURL || 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
                hasCompletedOnboarding: false,
                hasSeenWelcomeBanner: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setCurrentUser(basicUser);
              localStorage.setItem('currentUser', JSON.stringify(basicUser));
            }
          },
          (error) => {
            console.error('Error listening to user document:', error);
            if (error.code === 'permission-denied') {
              console.warn('Permission denied for user document. This may happen if the user document does not exist yet.');
              const basicUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'User',
                role: 'student',
                plan: 'free',
                country: '',
                bio: '',
                expectations: '',
                photoURL: firebaseUser.photoURL || 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
                hasCompletedOnboarding: false,
                hasSeenWelcomeBanner: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setCurrentUser(basicUser);
              localStorage.setItem('currentUser', JSON.stringify(basicUser));
            }
          }
        );

        return () => {
          console.log('Cleaning up Firestore listener');
          unsubscribeFirestore();
        };
      } else {
        console.log('User signed out');
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      }
    });

    return () => {
      console.log('Cleaning up auth listener');
      unsubscribeAuth();
    };
  }, []);

  const logout = () => {
    console.log('Logging out user');
    auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const isFeatureEnabled = (feature: keyof SystemFeatures): boolean => {
    return systemFeatures[feature] === true;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        maintenanceMode,
        setMaintenanceMode,
        maintenanceMessage,
        setMaintenanceMessage,
        banners,
        setBanners,
        systemFeatures,
        systemAnnouncement,
        isFeatureEnabled,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
