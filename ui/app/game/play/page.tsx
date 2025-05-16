'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from "next/image";

interface InviterInfo {
  username: string;
  highest_score: number;
}

interface Story {
  id: number;
  title: string;
  image: string,
  description: string;
}

export default function PlayPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviterInfo, setInviterInfo] = useState<InviterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [story, setStory] = useState<Story | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) {
      setInviteToken(token);
      fetchInviterInfo(token);
    }
    fetchStory();
  }, []);

  const fetchStory = async () => {
    try {
      const response = await axios.get<Story>('/api/game/stories/3/');
      setStory(response.data);
    } catch (error) {
      console.error("Error fetching story:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInviterInfo = async (token: string) => {
    try {
      const response = await axios.get<InviterInfo>(`/api/game/invites/${token}/inviter-score/`);
      setInviterInfo(response.data);
    } catch (error) {
      console.error("Error fetching inviter's info:", error);
    }
  };

  const handleStartGame = () => {
    if (isAuthenticated) {
      router.push('/game/');
    } else {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  };

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl w-full bg-white shadow-md rounded-lg p-6">
        {story && (
          <>
            <h1 className="text-2xl font-bold mb-4">{story.title}</h1>
            <p className="mb-6">{story.description}</p>
            <Image
                  src={story.image}
                  alt="Adventure Intro"
                  className="mb-4 w-full max-w-xl rounded-lg"
                  width={300}
                  height={175}
                />
          </>
        )}

        {inviteToken && inviterInfo && (
          <div className="mb-4">
            <p><strong>Invited by:</strong> {inviterInfo.username}</p>
            <p><strong>Their Highest Score:</strong> {inviterInfo.highest_score}</p>
          </div>
        )}

        <Button onClick={handleStartGame} className="w-full mb-4">
          {isAuthenticated ? "Start Game" : "Log In to Play"}
        </Button>

        {!isAuthenticated && (
          <p className="text-center">
            Don&apos;t have an account?{' '}
            <Link href={`/signup?next=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
