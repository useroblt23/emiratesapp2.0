import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRef } from 'react';
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
import { handleDailyLogin, initializeUserPoints } from '../services/rewardsService';

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
  cvUrl?: string;
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
  const firestoreUnsubscribeRef = useRef<(() => void) | null>(null);
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
      // Clean up any existing Firestore listener
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
        firestoreUnsubscribeRef.current = null;
      }

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
                photoURL: userData.photo_base64 || '',
                hasCompletedOnboarding: userData.hasCompletedOnboarding || false,
                hasSeenWelcomeBanner: userData.hasSeenWelcomeBanner || false,
                onboardingCompletedAt: userData.onboardingCompletedAt,
                welcomeBannerSeenAt: userData.welcomeBannerSeenAt,
                createdAt: userData.createdAt || new Date().toISOString(),
                updatedAt: userData.updatedAt || new Date().toISOString(),
                banned: userData.banned,
                muted: userData.muted,
                cvUrl: userData.cvUrl,
              };

              setCurrentUser(updatedUser);
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));

              initializeUserPoints(firebaseUser.uid).catch(console.error);
              handleDailyLogin(firebaseUser.uid).catch(console.error);
            } else {
              console.warn('User document not found in Firestore. User may need to complete registration.');
              console.warn('User document missing, forcing logout');
              auth.signOut();
              setCurrentUser(null);
              localStorage.removeItem('currentUser');
              sessionStorage.clear();
            }
          },
          (error) => {
            console.error('Error listening to user document:', error);

            if (error.code === 'permission-denied') {
              console.warn('Permission denied - auth token may not have propagated yet. Retrying in 2s...');
              setTimeout(() => {
                console.log('Forcing token refresh and retry');
                firebaseUser.getIdToken(true).then(() => {
                  console.log('Token refreshed successfully');
                }).catch((tokenError) => {
                  console.error('Token refresh failed:', tokenError);
                  console.warn('Forcing logout due to persistent permission error');
                  auth.signOut();
                  setCurrentUser(null);
                  localStorage.removeItem('currentUser');
                  sessionStorage.clear();
                });
              }, 2000);
            } else {
              console.warn('Firestore error, forcing logout to prevent auth loop');
              auth.signOut();
              setCurrentUser(null);
              localStorage.removeItem('currentUser');
              sessionStorage.clear();
            }
          }
        );

        firestoreUnsubscribeRef.current = unsubscribeFirestore;
      } else {
        console.log('User signed out');
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      }
    });

    return () => {
      console.log('Cleaning up auth listener');
      // Clean up Firestore listener if it exists
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
        firestoreUnsubscribeRef.current = null;
      }
      unsubscribeAuth();
    };
  }, []);

  const logout = async () => {
    console.log('Logging out user');
    try {
      await auth.signOut();
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      sessionStorage.clear();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
