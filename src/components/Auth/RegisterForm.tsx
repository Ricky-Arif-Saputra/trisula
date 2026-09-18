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

export default function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const cleanNisn = nisn.trim();
    const cleanName = fullName.trim();
    const email = `${cleanNisn}@trisula.com`;

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nama_lengkap: cleanName,
            nisn: cleanNisn,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('rate limit') || signUpError.status === 429) {
          setError('⚠️ Batas email Supabase tercapai (Email Rate Limit 429). Harap matikan "Confirm email" di Supabase Dashboard (Authentication > Providers > Email) agar tidak perlu konfirmasi email.');
        } else if (signUpError.message.includes('already registered')) {
          setError('NISN ini sudah terdaftar. Silakan beralih ke tab "Masuk".');
        } else if (signUpError.message.includes('invalid')) {
          setError('Format NISN tidak valid. Pastikan hanya memasukkan angka NISN.');
        } else if (signUpError.message.includes('Failed to fetch')) {
          setError('Gagal terhubung ke Supabase. Periksa koneksi internet Anda.');
        } else {
          setError(signUpError.message);
        }
      } else {
        if (data?.user) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              nama_lengkap: cleanName,
              nisn: cleanNisn,
              updated_at: new Date().toISOString(),
            });
          } catch (profileErr) {
            console.error('Gagal menyimpan profil:', profileErr);
          }
        }

        if (data?.session) {
          setSuccess('Pendaftaran berhasil! Anda otomatis masuk.');
        } else {
          setSuccess('Akun berhasil dibuat! Silakan beralih ke tab "Masuk". (Jika gagal masuk, matikan "Confirm email" di Supabase Dashboard).');
        }
        setFullName('');
        setNisn('');
        setPassword('');
      }
    } catch (err: any) {
      if (err?.message?.includes('rate limit') || err?.status === 429) {
        setError('⚠️ Batas pengiriman email Supabase tercapai. Harap matikan "Confirm email" di Supabase Dashboard (Authentication > Providers > Email).');
      } else {
        setError(err?.message || 'Terjadi kesalahan saat mendaftar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

      {success && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(65,221,194,0.15)',
          border: '1px solid rgba(65,221,194,0.3)',
          color: '#41ddc2',
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: '1.4',
        }}>
          {success}
        </div>
      )}

      {/* Input Nama Lengkap */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
          Nama Lengkap
        </label>
        <input
          type="text"
          placeholder="Masukkan Nama Lengkap Anda"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onFocus={inputFocusHandler}
          onBlur={inputBlurHandler}
          style={inputStyle}
          required
        />
      </div>

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
          Buat Kata Sandi
        </label>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
            style={{ ...inputStyle, paddingRight: '44px' }}
            minLength={6}
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
        {loading ? 'Mendaftarkan...' : 'Buat Akun'}
      </button>
    </form>
  );
}
