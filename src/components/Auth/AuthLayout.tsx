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
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #006b5c, #41ddc2)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(0,107,92,0.4)',
          }}>
            <span style={{ fontSize: '28px' }}>📐</span>
          </div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#ffffff',
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
          }}>
            TRISULA EduMath
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.55)',
            margin: 0,
          }}>
            Pembelajaran Matematika Kelas XII SMA
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
