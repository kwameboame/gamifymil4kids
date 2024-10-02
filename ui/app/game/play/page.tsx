'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface InviterInfo {
  username: string;
  highest_score: number;
}

export default function PlayPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviterInfo, setInviterInfo] = useState<InviterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) {
      setInviteToken(token);
      fetchInviterInfo(token);
    } else {
      setIsLoading(false);
      // Optionally, redirect to a default game page
      router.push('/'); // Redirect to home or another page
    }
  }, [router]);

  const fetchInviterInfo = async (token: string) => {
    try {
      const response = await axios.get<InviterInfo>(`/game/invites/${token}/inviter-score/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setInviterInfo(response.data);
    } catch (error) {
      console.error("Error fetching inviter's info:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    router.push('/game/play/game'); // Redirect to the actual game page
  };

  const handleLogin = () => {
    // Preserve the current URL to redirect back after login
    router.push(`/login?next=${encodeURIComponent(window.location.href)}`);
  };

//   const handleSignup = () => {
//     // Preserve the current URL to redirect back after signup
//     router.push(`/signup?next=${encodeURIComponent(window.location.href)}`);
//   };

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {inviteToken && (
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">You&apos;ve been invited to compete!</h1>
          {inviterInfo ? (
            <div className="mb-4">
              <p><strong>Invited by:</strong> {inviterInfo.username}</p>
              <p><strong>Their Highest Score:</strong> {inviterInfo.highest_score}</p>
            </div>
          ) : (
            <p className="mb-4 text-red-500">Unable to fetch inviter information. The invite might be invalid or expired.</p>
          )}
          {isAuthenticated ? (
            <Button onClick={handleStartGame} disabled={!inviterInfo} className="w-full">
              Start Game
            </Button>
          ) : (
            <div className="space-x-2 w-full">
              <Button onClick={handleLogin} className="flex-1">
                Log In
              </Button>
              <Button onClick={() => router.push('/signup')} variant="secondary" className="flex-1">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      )}
      {!inviteToken && (
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Welcome to the Game</h1>
          <p className="mb-4">Join a game by following an invite link.</p>
          <Button onClick={() => router.push('/')} className="w-full">
            Go Home
          </Button>
        </div>
      )}
    </div>
  );
}