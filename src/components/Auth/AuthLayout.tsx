import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a2540 0%, #131b2e 50%, #006b5c 100%)',
      padding: '16px',
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '32px',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}>
        {/* Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '28px' }}>
          <img src="/logo.jpeg" alt="Logo TRISULA" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#ffffff',
            margin: 0,
            letterSpacing: '2px',
          }}>
            TRISULA
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
