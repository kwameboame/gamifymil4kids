'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout';
import Login from '@/components/login';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [next, setNext] = useState<string>('/game');

  useEffect(() => {
    setIsMounted(true);
    const params = new URLSearchParams(window.location.search);
    const nextParam = params.get('next');
    if (nextParam) {
      setNext(nextParam);
    }
  }, []);

  const handleLogin = async (username_or_email: string, password: string) => {
    if (!isMounted) return;

    try {
      // Login function has been updated to handle loading state internally
      await login(username_or_email, password);
      console.log('Login successful, redirecting to:', next);
      router.push(next);
    } catch (error) {
      console.error('Login attempt failed:', error);
    }
  };

  if (!isMounted) return null;

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        {/* <h1 className="text-2xl font-bold mb-4">Log In to Your Account</h1> */}
        <Login onSubmit={handleLogin} />
      </div>
    </Layout>
  );
}