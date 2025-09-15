'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from '@/lib/firebase';

export type UserRole = 'user' | 'volunteer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !auth.app) {
      console.log('Firebase auth not initialized');
      setLoading(false);
      return;
    }
    console.log('Setting up onAuthStateChanged listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('onAuthStateChanged triggered:', firebaseUser);
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user profile from database
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            console.log('User profile found:', snapshot.val());
            setProfile(snapshot.val());
          } else {
            // Create default profile
            const defaultProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              role: 'user',
            };
            await set(userRef, defaultProfile);
            console.log('Created default profile:', defaultProfile);
            setProfile(defaultProfile);
          }
        } catch (error) {
          console.error('Error fetching/setting user profile:', error);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string, role: UserRole = 'user') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userProfile: UserProfile = {
      uid: userCredential.user.uid,
      email,
      role,
      name,
    };
    const userRef = ref(database, `users/${userCredential.user.uid}`);
    await set(userRef, userProfile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
