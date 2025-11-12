import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Role = 'student' | 'mentor' | 'governor';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: Role;
  country: string;
  bio: string;
  photoURL: string;
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
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const logout = () => {
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
