import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg glassmorphism">
        {children}
      </div>
    </div>
  );
}
