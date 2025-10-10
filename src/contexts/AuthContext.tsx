'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
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
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
  completeRegistration: (name: string, role: UserRole) => Promise<void>;
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
        
        // Check if email is verified OR if user is admin (admin bypass)
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        let isAdmin = false;
        
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const profileData = snapshot.val();
            isAdmin = profileData && profileData.role === 'admin';
            console.log('User profile found:', profileData);
            
            // If user is admin, bypass email verification
            if (isAdmin || firebaseUser.emailVerified) {
              setProfile(profileData);
            } else {
              console.log('Email not verified and not admin, not loading profile');
              setProfile(null);
            }
          } else {
            // If no profile exists, check if email is verified first
            if (firebaseUser.emailVerified) {
              // Create a default profile for verified users
              const defaultProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                role: 'user',
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              };
              await set(userRef, defaultProfile);
              console.log('Created default profile:', defaultProfile);
              setProfile(defaultProfile);
            } else {
              console.log('No profile exists and email not verified, not loading profile');
              setProfile(null);
            }
          }
        } catch (error) {
          console.error('Error fetching/setting user profile:', error);
          // Create a minimal profile to prevent crashes
          const fallbackProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            role: 'user',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          };
          setProfile(fallbackProfile);
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is admin first (admin bypass)
      const userRef = ref(database, `users/${userCredential.user.uid}`);
      const snapshot = await get(userRef);
      let isAdmin = false;
      
      if (snapshot.exists()) {
        const profileData = snapshot.val();
        isAdmin = profileData.role === 'admin';
      }
      
      // Check if email is verified (unless user is admin)
      if (!userCredential.user.emailVerified && !isAdmin) {
        // Sign out the user since they're not verified and not admin
        await signOut(auth);
        throw new Error('Please verify your email address before logging in. Check your inbox for a verification email.');
      }
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
          throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole = 'user') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Store user data temporarily in sessionStorage for verification page
      sessionStorage.setItem('pendingUser', JSON.stringify({
        email,
        name,
        role,
        uid: userCredential.user.uid
      }));
      
      return userCredential.user;
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
          name: result.user.displayName || result.user.email?.split('@')[0] || 'Google User',
        };
        await set(userRef, userProfile);
        console.log('Created Google user profile:', userProfile);
      } else {
        console.log('Google user profile already exists:', snapshot.val());
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
          name: result.user.displayName || result.user.email?.split('@')[0] || 'Facebook User',
        };
        await set(userRef, userProfile);
        console.log('Created Facebook user profile:', userProfile);
      } else {
        console.log('Facebook user profile already exists:', snapshot.val());
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
    // Clear pending user data
    sessionStorage.removeItem('pendingUser');
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }
    
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (error: any) {
      // Handle Firebase rate limiting errors
      switch (error.code) {
        case 'auth/too-many-requests':
          throw new Error('Too many verification emails sent. Please wait 1 hour before trying again, or use Google/Facebook login instead.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection and try again.');
        case 'auth/user-not-found':
          throw new Error('User not found. Please try signing up again.');
        default:
          throw new Error(error.message || 'Failed to send verification email. Please try again later.');
      }
    }
  };

  const checkEmailVerified = async () => {
    if (!auth.currentUser) {
      return false;
    }
    await auth.currentUser.reload();
    return auth.currentUser.emailVerified;
  };

  const completeRegistration = async (name: string, role: UserRole) => {
    if (!auth.currentUser || !auth.currentUser.emailVerified) {
      throw new Error('User not verified');
    }
    
    const userProfile: UserProfile = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email!,
      role,
      name,
    };
    
    const userRef = ref(database, `users/${auth.currentUser.uid}`);
    await set(userRef, userProfile);
    
    // Clear pending user data
    sessionStorage.removeItem('pendingUser');
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
    sendVerificationEmail,
    checkEmailVerified,
    completeRegistration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
