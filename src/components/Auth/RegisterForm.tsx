import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from './AuthProvider';

export default function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signOut } = useAuth(); // keep hook context if needed

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const email = `${nisn}@trisula.internal`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nama_lengkap: fullName, nisn },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Pendaftaran berhasil! Silakan cek email (jika ada) atau login langsung.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4">
      {error && <p className="text-sm text-error">{error}</p>}
      {success && <p className="text-sm text-success">{success}</p>}
      <input
        type="text"
        placeholder="Nama Lengkap"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="input"
        required
      />
      <input
        type="text"
        placeholder="NISN"
        value={nisn}
        onChange={(e) => setNisn(e.target.value)}
        className="input"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? 'Mendaftarkan...' : 'Buat Akun'}
      </button>
    </form>
  );
}
