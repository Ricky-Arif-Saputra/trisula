import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userName: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('Siswa TRISULA');

  const fetchProfileName = async (currentUser: User | null) => {
    if (!currentUser) {
      setUserName('Siswa TRISULA');
      return;
    }

    // 1. Coba ambil dari user metadata
    const metaName =
      currentUser.user_metadata?.nama_lengkap ||
      currentUser.user_metadata?.display_name ||
      currentUser.user_metadata?.full_name;

    if (metaName) {
      setUserName(metaName);
    }

    // 2. Coba fetch dari tabel profiles di Supabase
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nama_lengkap')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (data?.nama_lengkap) {
        setUserName(data.nama_lengkap);
      } else if (!metaName) {
        // Fallback jika tidak ada metadata & profiles: gunakan bagian depan email atau NISN
        const emailFront = currentUser.email?.split('@')[0] || 'Siswa TRISULA';
        setUserName(emailFront);
      }
    } catch (err) {
      console.error('Fetch profile name error:', err);
      if (!metaName) {
        const emailFront = currentUser.email?.split('@')[0] || 'Siswa TRISULA';
        setUserName(emailFront);
      }
    }
  };

  useEffect(() => {
    // 1. Ambil sesi awal langsung
    supabase.auth.getSession()
      .then(({ data: { session: sess } }) => {
        setUser(sess?.user ?? null);
        setSession(sess);
        fetchProfileName(sess?.user ?? null);
      })
      .catch((err) => {
        console.error('Gagal mengambil sesi Supabase:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Dengarkan perubahan sesi setelahnya (login, logout, refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      const currentUser = sess?.user ?? null;
      setUser(currentUser);
      setSession(sess);
      fetchProfileName(currentUser);
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
    <AuthContext.Provider value={{ user, session, loading, userName, signOut }}>
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
