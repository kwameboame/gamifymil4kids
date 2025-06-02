'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout'
import Signup from '@/components/signup'
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const { signup } = useAuth();
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

  const handleSubmit = async (username: string, email: string, password: string) => {
    if (!isMounted) return;
    
    try {
      await signup(username, email, password);
      console.log('Signup successful, redirecting to:', next);
      router.push(next);
    } catch (error) {
      console.error('Signup attempt failed:', error);
      throw error; // Pass the error back to the component for display
    }
  };

  if (!isMounted) return null;
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Signup onSubmit={handleSubmit} />
      </div>
    </Layout>
  )
}