import React from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function GoogleAuthButton() {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white text-black rounded-md shadow hover:bg-gray-100 transition"
    >
      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
      Masuk dengan Google
    </button>
  );
}
