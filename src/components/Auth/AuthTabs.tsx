import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import GoogleAuthButton from './GoogleAuthButton';

export default function AuthTabs() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Buttons */}
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === 'login'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low hover:bg-surface-container-high'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === 'register'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low hover:bg-surface-container-high'
          }`}
        >
          Buat Akun
        </button>
      </div>

      {/* Google OAuth */}
      <GoogleAuthButton />

      {/* Form */}
      {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
