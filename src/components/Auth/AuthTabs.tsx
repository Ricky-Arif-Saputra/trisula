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
      {/* Tab Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '4px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.04)',
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

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>atau</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* Google OAuth */}
      <GoogleAuthButton />

      {/* Another Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {activeTab === 'login' ? 'masuk dengan nisn' : 'daftar dengan nisn'}
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* Form */}
      {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
