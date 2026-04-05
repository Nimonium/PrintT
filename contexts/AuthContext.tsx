// Auth Context - Firebase Phone Authentication 
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { User, AuthContextType } from '../types';
import { auth } from '../services/firebase';
import { sendSmsOtp, verifySmsOtp } from '../services/phoneAuth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPhone, setPendingPhone] = useState<string>('');

  // Handle Firebase user to Application user mapping
  const mapFirebaseUser = (fbUser: FirebaseUser): User => ({
    id: fbUser.uid,
    phoneNumber: fbUser.phoneNumber || '',
    displayName: fbUser.displayName || undefined,
    createdAt: new Date(fbUser.metadata.creationTime || Date.now()),
  });

  useEffect(() => {
    // Listen for authentication state changes and persist user session
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser(mapFirebaseUser(fbUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (phoneNumber: string) => {
    setLoading(true);
    try {
      await sendSmsOtp(phoneNumber);
      setPendingPhone(phoneNumber);
      console.log('OTP sent to:', phoneNumber);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    setLoading(true);
    try {
      const fbUser = await verifySmsOtp(otp);
      if (fbUser) {
        setUser(mapFirebaseUser(fbUser));
        setPendingPhone('');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setPendingPhone('');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, verifyOTP, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

