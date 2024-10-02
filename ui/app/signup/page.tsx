'use client';

import Layout from '@/components/layout'
import Signup from '@/components/signup'

export default function SignupPage() {
  const handleSubmit = (username: string, email: string, password: string) => {
    // Handle form submission logic here
    console.log('Form submitted:', { username, email, password });
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Create an Account</h1>
        <Signup onSubmit={handleSubmit} />
      </div>
    </Layout>
  )
}