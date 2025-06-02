'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout'
import { ProfileComponent } from '@/components/game/ProfileComponent'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'

interface UserProfile {
  id: number;
  username?: string;
  name?: string;
  email?: string;
  highScores?: {
    [key: string]: number;
  };
  badges?: { id: number; name: string; description: string; image: string }[];
}

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        // Use the same backendBaseURL format as in AuthContext
        const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('authToken'); // Use the same token key as in AuthContext
        
        if (!token) {
          console.error('No auth token found');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${backendBaseURL}/accounts/user/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        // Add type assertion to fix the type error
        setProfile(response.data as UserProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile()
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b flex items-center justify-center py-12">
          <div className="text-red-500">Failed to load profile</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b flex items-center justify-center py-12">
        <ProfileComponent profile={profile} />
      </div>
    </Layout>
  )
}