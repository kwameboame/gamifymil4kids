"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface GameAuthButtonsProps {
  level: number;
  score: number;
  lives: number;
  scenarioIndex: number;
  variant?: "level-complete" | "game-end";
}

export function GameAuthButtons({
  level,
  score,
  lives,
  scenarioIndex,
  variant = "level-complete"
}: GameAuthButtonsProps) {
  const { isLoading } = useAuth();
  const saveGameState = (redirectTo: string) => {
    // Save detailed game state to localStorage before redirecting
    const gameState = {
      // If we're at level-complete, increment the level for after login
      level: variant === 'level-complete' ? level + 1 : level,
      score,
      lives,
      // Reset scenario index if moving to next level
      scenarioIndex: variant === 'level-complete' ? 0 : scenarioIndex,
      timestamp: Date.now(),
      variant: variant,
      returnPath: window.location.pathname,
      gameInProgress: true,
      advanceToNextLevel: variant === 'level-complete'
    };
    
    // Save to localStorage with more descriptive key
    localStorage.setItem('gamify_saved_game_state', JSON.stringify(gameState));
    console.log('Game state saved before auth:', gameState);
    
    // Redirect to the login or signup page with return URL
    window.location.href = `/${redirectTo}?next=${encodeURIComponent(window.location.pathname)}`;
  };

  return (
    <div className={`mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg ${variant === 'game-end' ? 'w-full max-w-lg mx-auto' : ''}`}>
      <h3 className="text-lg font-semibold text-blue-800 mb-2">
        {variant === 'level-complete' 
          ? "Save Your Progress!" 
          : "Don&apos;t Lose Your Progress!"}
      </h3>
      <p className="text-blue-600 mb-3">
        {variant === 'level-complete'
          ? `You've completed level ${level}! Sign up or log in to save your progress and continue to level ${level + 1} after logging in.`
          : `Your score of ${score} points isn&apos;t saved! Create an account or log in to save your achievements and continue playing later.`}
      </p>
      <p className="text-sm text-blue-500 mb-3">
        {variant === 'level-complete'
          ? "Your game progress will be securely saved to your account and available on any device."
          : "Once logged in, your progress will be automatically saved as you play."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={() => saveGameState('login')} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            'Log In'
          )}
        </Button>
        <Button 
          onClick={() => saveGameState('signup')}
          className="bg-green-600 hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing up...
            </>
          ) : (
            'Sign Up'
          )}
        </Button>
      </div>
    </div>
  );
}
