import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import GoogleAuthButton from './GoogleAuthButton';

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '10px 16px',
  border: 'none',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  background: active ? 'linear-gradient(135deg, #006b5c, #41ddc2)' : 'rgba(255,255,255,0.06)',
  color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
  boxShadow: active ? '0 2px 8px rgba(0,107,92,0.3)' : 'none',
});

export default function AuthTabs() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Google OAuth (Tombol Utama) */}
      <GoogleAuthButton />

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          atau dengan NISN
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
      </div>

      {/* 2. NISN Tab Buttons (Masuk / Buat Akun) */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '4px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          style={tabStyle(activeTab === 'login')}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          style={tabStyle(activeTab === 'register')}
        >
          Buat Akun
        </button>
      </div>

      {/* Form Content */}
      {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
