'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
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
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
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
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // Handle Firebase authentication errors with user-friendly messages
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No account found with this email address.');
        case 'auth/wrong-password':
          throw new Error('Incorrect password. Please try again.');
        case 'auth/invalid-credential':
          throw new Error('Invalid email or password. Please check your credentials.');
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled. Please contact support.');
        case 'auth/too-many-requests':
          throw new Error('Too many failed attempts. Please try again later.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection.');
        default:
          throw new Error('Login failed. Please try again.');
      }
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole = 'user') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email,
        role,
        name,
      };
      const userRef = ref(database, `users/${userCredential.user.uid}`);
      await set(userRef, userProfile);
    } catch (error: any) {
      // Handle Firebase registration errors with user-friendly messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('An account with this email already exists. Please sign in instead.');
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.');
        case 'auth/weak-password':
          throw new Error('Password should be at least 6 characters long.');
        case 'auth/operation-not-allowed':
          throw new Error('Email registration is not enabled. Please contact support.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection.');
        default:
          throw new Error('Registration failed. Please try again.');
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create one
      const userRef = ref(database, `users/${result.user.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          role: 'user',
          name: result.user.displayName || 'Google User',
        };
        await set(userRef, userProfile);
      }
    } catch (error: any) {
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          throw new Error('Sign-in cancelled. Please try again.');
        case 'auth/popup-blocked':
          throw new Error('Popup was blocked. Please allow popups and try again.');
        case 'auth/cancelled-popup-request':
          throw new Error('Sign-in cancelled. Please try again.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection.');
        default:
          throw new Error('Google sign-in failed. Please try again.');
      }
    }
  };

  const loginWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create one
      const userRef = ref(database, `users/${result.user.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          role: 'user',
          name: result.user.displayName || 'Facebook User',
        };
        await set(userRef, userProfile);
      }
    } catch (error: any) {
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          throw new Error('Sign-in cancelled. Please try again.');
        case 'auth/popup-blocked':
          throw new Error('Popup was blocked. Please allow popups and try again.');
        case 'auth/cancelled-popup-request':
          throw new Error('Sign-in cancelled. Please try again.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection.');
        default:
          throw new Error('Facebook sign-in failed. Please try again.');
      }
    }
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
    loginWithGoogle,
    loginWithFacebook,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
