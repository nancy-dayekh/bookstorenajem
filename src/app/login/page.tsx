'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleLogin() {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) return toast.error('Invalid login credentials');

    // ✅ خزّني session
    localStorage.setItem('admin-auth', JSON.stringify({
      id: data.id,
      email: data.email,
    }));

    toast.success('Welcome back!');
    router.push('/admin'); // go to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <Toaster position="top-right" />
      <div className="bg-pink-100 p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 text-center text-pink-700">
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm sm:text-base"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm sm:text-base"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-pink-500 text-white py-2 sm:py-3 rounded-lg hover:bg-pink-600 transition-all duration-300 font-semibold shadow-md text-sm sm:text-base"
        >
          Login
        </button>
      </div>
    </div>
  );
}
