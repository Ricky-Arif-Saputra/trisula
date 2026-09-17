import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.06)',
  color: '#ffffff',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box' as const,
};

const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = '#41ddc2';
  e.target.style.boxShadow = '0 0 0 3px rgba(65,221,194,0.15)';
};

const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = 'rgba(255,255,255,0.12)';
  e.target.style.boxShadow = 'none';
};

export default function LoginForm() {
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = `${nisn}@trisula.internal`;
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'NISN atau sandi salah. Silakan coba lagi.'
        : authError.message
      );
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {error && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(186,26,26,0.15)',
          border: '1px solid rgba(186,26,26,0.3)',
          color: '#ff8a80',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          {error}
        </div>
      )}
      <input
        type="text"
        placeholder="NISN"
        value={nisn}
        onChange={(e) => setNisn(e.target.value)}
        onFocus={inputFocusHandler}
        onBlur={inputBlurHandler}
        style={inputStyle}
        required
      />
      <input
        type="password"
        placeholder="Sandi"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onFocus={inputFocusHandler}
        onBlur={inputBlurHandler}
        style={inputStyle}
        required
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '13px',
          border: 'none',
          borderRadius: '12px',
          background: loading ? 'rgba(0,107,92,0.5)' : 'linear-gradient(135deg, #006b5c, #008575)',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,107,92,0.3)',
          fontFamily: 'inherit',
        }}
      >
        {loading ? 'Memproses...' : 'Masuk'}
      </button>
    </form>
  );
}
