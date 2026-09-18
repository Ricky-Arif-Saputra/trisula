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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanNisn = nisn.trim();
    let email = `${cleanNisn}@trisula.internal`;

    try {
      // 1. Coba login dengan ${nisn}@trisula.internal
      let { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      // 2. Jika gagal atau email invalid, coba fallback ke ${nisn}@trisula.com
      if (authError) {
        email = `${cleanNisn}@trisula.com`;
        const retryRes = await supabase.auth.signInWithPassword({ email, password });
        if (!retryRes.error) {
          authError = null;
        } else {
          // Jika keduanya gagal, gunakan error akhir atau error yang lebih spesifik
          authError = retryRes.error.message.includes('Invalid login credentials') ? retryRes.error : authError;
        }
      }

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('NISN atau kata sandi salah. Silakan periksa kembali.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Email belum dikonfirmasi oleh Supabase. Harap hilangkan centang "Confirm email" di Supabase Dashboard (Authentication > Providers > Email).');
        } else if (authError.message.includes('Failed to fetch')) {
          setError('Gagal terhubung ke Supabase. Periksa koneksi internet Anda.');
        } else {
          setError(authError.message);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setLoading(false);
    }
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
          lineHeight: '1.4',
        }}>
          {error}
        </div>
      )}

      {/* Input NISN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
          NISN (Nomor Induk Siswa Nasional)
        </label>
        <input
          type="text"
          placeholder="Masukkan NISN Anda"
          value={nisn}
          onChange={(e) => setNisn(e.target.value)}
          onFocus={inputFocusHandler}
          onBlur={inputBlurHandler}
          style={inputStyle}
          required
        />
      </div>

      {/* Input Kata Sandi + Toggle Eye */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
          Kata Sandi
        </label>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan kata sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
            style={{ ...inputStyle, paddingRight: '44px' }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
          >
            {showPassword ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a19.16 19.16 0 014.188-4.898M9.88 9.88a3 3 0 104.24 4.24M1 1l22 22" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          marginTop: '6px',
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
        {loading ? 'Memproses...' : 'Masuk dengan NISN'}
      </button>
    </form>
  );
}
