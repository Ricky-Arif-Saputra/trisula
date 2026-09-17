import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from './AuthProvider';

export default function LoginForm() {
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signOut } = useAuth(); // not used but keeps hook context

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = `${nisn}@trisula.internal`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      {error && <p className="text-sm text-error">{error}</p>}
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
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
