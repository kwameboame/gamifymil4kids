'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout';
import Login from '@/components/login';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth(); // Moved useAuth here
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async (username_or_email: string, password: string) => {
    if (!isMounted) return; // Prevent running on server-side

    await login(username_or_email, password); // Ensure the login function is called
    console.log('Login attempt:', username_or_email, password);
  };

  if (!isMounted) return null; // Prevent SSR issues

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Log In to Your Account</h1>
        <Login onSubmit={handleLogin} />
      </div>
    </Layout>
  );
}
