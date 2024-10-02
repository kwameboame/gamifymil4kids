'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function EndGamePage() {
  const router = useRouter();
  const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_URL;


  const handleViewLeaderboard = () => {
    router.push(`${backendBaseURL}/game/play/leaderboard`); // Implement this route
  };

  const handlePlayAgain = () => {
    router.push('/game'); // Redirect to game start
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">Congratulations!</h1>
        <p className="mb-4">You have completed the game.</p>
        <div className="space-y-2">
          <Button onClick={handleViewLeaderboard} className="w-full">View Leaderboard</Button>
          <Button onClick={handlePlayAgain} variant="secondary" className="w-full">Play Again</Button>
        </div>
      </div>
    </div>
  );
}