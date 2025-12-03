import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  birthDate: string; // ISO string format
  sex: 'masculino' | 'femenino' | 'otro';
  hasCompletedOnboarding: boolean;
}

interface UserContextType {
  userData: UserData | null;
  setUserData: (data: UserData) => Promise<void>;
  getAge: () => number | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserDataState(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserData = async (data: UserData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(data));
      setUserDataState(data);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const getAge = (): number | null => {
    if (!userData?.birthDate) return null;

    const birthDate = new Date(userData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, getAge, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
