'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Story, Action } from '@/components/game/StorylineGame'; // Adjust the path as necessary
import Image from 'next/image';

export default function GamePlayPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviterScore, setInviterScore] = useState<number | null>(null);
  const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) {
      setInviteToken(token);
      fetchInviterScore(token);
    }
    fetchStory();
  }, []);

  const fetchStory = async () => {
    try {
      const response = await axios.get(`${backendBaseURL}/game/stories/1/`);
      setStory(response.data as Story);
    } catch (error) {
      console.error("Error fetching story:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInviterScore = async (token: string) => {
    try {
      const response = await axios.get<{ username: string; highest_score: number }>(`/game/invites/${token}/inviter-score/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setInviterScore(response.data.highest_score);
    } catch (error) {
      console.error("Error fetching inviter's score:", error);
    }
  };

  const handleAction = (action: Action) => {
    const newScore = score + action.points;
    setScore(Math.max(0, newScore));

    if (action.is_correct) {
      if (levelIndex < (story?.levels.length || 0) - 1) {
        setLevelIndex((prev) => prev + 1);
      } else {
        // Game end logic
        router.push('/game/play/end'); // Implement the end game route
      }
    } else {
      // Handle incorrect action
      // Show game over logic
      router.push('/game/play/gameover'); // Implement the game over route
    }
  };

  if (isLoading) return <Loader2 className="animate-spin" />;

  if (!isAuthenticated && inviteToken) {
    // If user is not authenticated but accessed the game via invite, prompt login/signup
    router.push(`/login?next=${encodeURIComponent(window.location.href)}`);
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {story && (
        <div className="max-w-xl w-full bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">{story.title}</h1>
          <p className="mb-4">{story.description}</p>
          {/* Render current level */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Level {levelIndex + 1}</h2>
            <p>{story.levels[levelIndex].prompt}</p>
            <Image src={story.levels[levelIndex].image} alt={`Level ${levelIndex + 1} Image`} width={500} height={300} className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {story.levels[levelIndex].actions.map((action) => (
                <Button key={action.id} onClick={() => handleAction(action)} className="w-full">
                  {action.text}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-lg font-bold">Score: {score}</p>
          {inviterScore !== null && (
            <p className="mt-2">Inviter&apos;s Highest Score: {inviterScore}</p>
          )}
        </div>
      )}
      {!story && (
        <p className="text-red-500">Unable to load the game. Please try again later.</p>
      )}
    </div>
  );
}