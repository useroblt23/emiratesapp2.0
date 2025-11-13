import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

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
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('System under maintenance. Please check back soon.');
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    console.log('Setting up Firebase auth listener');

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('User authenticated:', firebaseUser.uid);

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
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
              photoURL: userData.photoURL || 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
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
            console.error('User document not found in Firestore');
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
          }
        }, (error) => {
          console.error('Error listening to user document:', error);
        });

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
