import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Ambil sesi awal langsung (reliable untuk initial render)
    supabase.auth.getSession()
      .then(({ data: { session: sess } }) => {
        setUser(sess?.user ?? null);
        setSession(sess);
      })
      .catch((err) => {
        console.error('Gagal mengambil sesi Supabase:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Dengarkan perubahan sesi setelahnya (login, logout, refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setUser(sess?.user ?? null);
      setSession(sess);
      // Pastikan loading selesai jika onAuthStateChange tiba lebih dulu
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
