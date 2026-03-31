"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type UserRole = 'admin' | 'employee';

type User = {
  id: string;
  email: string;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', userId)
        .single();
        
      if (error || !data) return null;
      
      const profile = { id: userId, email: data.email, role: data.role as UserRole };
      
      // OPTIMIZATION: Cache profile locally for next load
      localStorage.setItem('pdfsa_profile', JSON.stringify(profile));
      return profile;
    } catch (err) {
      console.error('Profile fetch error:', err);
      return null;
    }
  };

  useEffect(() => {
    // 1. OPTIMISTIC LOAD: Check local cache first to avoid initial spinner
    const cached = localStorage.getItem('pdfsa_profile');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('pdfsa_profile');
      }
    }

    // 2. Verified Load & Sync
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) setUser(profile);
      } else {
        setUser(null);
        localStorage.removeItem('pdfsa_profile');
      }
      setLoading(false);
    };

    initAuth();

    // 3. Listener for session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('pdfsa_profile');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    if (data.session?.user) {
      const profile = await fetchProfile(data.session.user.id);
      setUser(profile);
      // Removed the 500ms delay and router.refresh() for instant transition
      router.push('/');
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('pdfsa_profile');
    router.push('/login');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
