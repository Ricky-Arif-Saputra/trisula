import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '12px 16px',
  border: 'none',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  background: active ? 'linear-gradient(135deg, #006b5c, #41ddc2)' : 'rgba(255,255,255,0.06)',
  color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
  boxShadow: active ? '0 2px 8px rgba(0,107,92,0.3)' : 'none',
  fontFamily: 'inherit',
});

export default function AuthTabs() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Tab Switcher (Masuk / Buat Akun) */}
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

      {/* Active Form */}
      {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
