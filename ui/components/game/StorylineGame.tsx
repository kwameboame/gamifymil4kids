"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { AudioControl } from "./AudioControl";
import { LeaderboardComponent } from "./LeaderboardComponent";
import { ProfileComponent } from "./ProfileComponent";
import Confetti from "react-confetti";
import Image from 'next/image'; 
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext'


const API_BASE_URL = 'http://localhost:8000/api';
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;

// Add a response interceptor to handle CORS errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 0) {
      console.error('CORS error detected. Please ensure CORS is properly configured on the server.');
    }
    return Promise.reject(error);
  }
);

type Action = {
  id: number;
  text: string;
  is_correct: boolean;
  points: number;
};

type Level = {
  id: number;
  prompt: string;
  image: string;
  actions: Action[];
};

type Story = {
  id: number;
  title: string;
  description: string;
  levels: Level[];
};

type LeaderboardEntry = {
  username: string;
  score: number;
};

type UserProfile = {
  id: number;
  name: string;
  highScores: Record<string, number>;  // Changed from high_scores to highScores
  badges: { id: number; name: string; description: string; image: string }[];
};


export function StorylineGame() {
  const [gameState, setGameState] = useState<"start" | "playing" | "end" | "gameover" | "leaderboard" | "profile" | "login" | "signup">("start"); // Added "signup" to the type
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [story, setStory] = useState<Story | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const successAudioRef = useRef<HTMLAudioElement>(null);
  const gameOverAudioRef = useRef<HTMLAudioElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [initialWidth, setInitialWidth] = useState<string>('');
  const { isAuthenticated } = useAuth()
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (gameAreaRef.current) {
      setInitialWidth(window.getComputedStyle(gameAreaRef.current).width);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storyResponse = await fetch(`${API_BASE_URL}/stories/1/`);
        const storyData = await storyResponse.json();
        setStory(storyData);

        // Fetch top-scores for the leaderboard
        const leaderboardResponse = await fetch(`${API_BASE_URL}/leaderboard/top-scores/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData);

        // Fetch the authenticated user's profile
        if (isAuthenticated) {
          const profileResponse = await fetch(`${API_BASE_URL}/profiles/${userProfile?.id}/`, { // Adjusted to fetch user's own profile
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          });
          const profileData = await profileResponse.json();
          // Transform the data to match our UserProfile type
          setUserProfile({
            ...profileData,
            highScores: profileData.high_scores, // Assuming the API returns 'high_scores'
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, userProfile?.id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Update the submitScore function to accept the current score
  const submitScore = async (currentScore: number) => {
    if (userProfile && story) {
      try {
        const response = await fetch(`${API_BASE_URL}/leaderboard/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Include the auth token
          },
          body: JSON.stringify({
            score: currentScore, // Use the updated score
            story_id: story.id, // Ensure story_id is provided
          }),
        });

        if (response.ok) {
          // Fetch only the top scores
          const leaderboardResponse = await fetch(`${API_BASE_URL}/leaderboard/top-scores/`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          });
          const leaderboardData = await leaderboardResponse.json();
          
          // Update the leaderboard state with the top scores
          setLeaderboard(leaderboardData);

          // Update user's high score if necessary
          if (currentScore > (userProfile.highScores[story.title] || 0)) {
            const updatedProfile = {
              ...userProfile,
              highScores: {
                ...userProfile.highScores,
                [story.title]: currentScore,
              },
            };
            await fetch(`${API_BASE_URL}/profiles/${userProfile.id}/`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              },
              body: JSON.stringify(updatedProfile),
            });
            setUserProfile(updatedProfile);
          }
        } else {
          console.error('Failed to submit score:', await response.text());
        }
      } catch (error) {
        console.error("Error submitting score:", error);
      }
    }
  };

  // Modify handleAction to pass the updated score
  const handleAction = async (action: Action) => {
    const newScore = score + action.points;
    setScore(Math.max(0, newScore)); // Ensure score doesn't go below 0

    if (action.is_correct) {
      if (level < (story?.levels.length || 0) - 1) {
        setLevel((prev) => prev + 1);
      } else {
        setShowConfetti(true);
        successAudioRef.current?.play();
        await submitScore(newScore); // Pass the updated score
        setGameState("end");
      }
    } else {
      if (newScore <= 0) {
        gameOverAudioRef.current?.play();
        await submitScore(newScore); // Pass the updated score
        setGameState("gameover");
      }
    }
  };

  const handleStartGame = () => {
    setGameState("playing");
    setIsGameStarted(true);
    setScore(0);
    setLevel(0);
    setShowConfetti(false);
    
    const gameArea = gameAreaRef.current;
    if (gameArea && gameArea.requestFullscreen) {
      gameArea.requestFullscreen();
    }
  };

  const handleEndGame = () => {
    setGameState("leaderboard");
  };

  const handleBack = () => {
    setGameState("start");
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      gameAreaRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gray-50">
      <div 
        ref={gameAreaRef} 
        className="relative h-full max-w-7xl mx-auto p-4 bg-white shadow-md overflow-hidden"
        style={{ width: initialWidth }}
      >
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <Confetti
              width={gameAreaRef.current?.clientWidth}
              height={gameAreaRef.current?.clientHeight}
              recycle={false}
              numberOfPieces={200}
            />
          </div>
        )}
        <audio ref={audioRef} src="/audio/game_music.mp3" loop />
        <audio ref={successAudioRef} src="/audio/congrats.mp3" />
        <audio ref={gameOverAudioRef} src="/audio/GameOver.wav" />
        
        <div className="relative flex flex-col h-full" style={{ zIndex: 1 }}>
          <div className="flex justify-between items-center mb-4">
            {isFullscreen ? (
              <Button onClick={toggleFullscreen} className="text-xs">
                Exit Fullscreen
              </Button>
            ) : (
              <Button onClick={toggleFullscreen} className="text-xs">
                Fullscreen
              </Button>
            )}
            <Button onClick={() => setGameState("leaderboard")} className="text-xs">
              Leaderboard
            </Button>
            {gameState === "playing" && (
              <div className="text-xl font-bold">Score: {score}</div>
            )}
            <AudioControl isGameStarted={isGameStarted} />
          </div>

          <AnimatePresence exitBeforeEnter>
            {gameState === "start" && story && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center flex-grow text-center"
              >
                <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
                <p className="mb-4">{story.description}</p>
                <Image src="/images/placeholder.png" alt="Adventure Intro" className="mb-4 w-full max-w-xl rounded-lg" width={500} height={300} />
                {isAuthenticated ? (
                  <Button onClick={handleStartGame}>Start Game</Button>
                ) : (
                  <p>Please log in or sign up to play the game.</p>
                )}
              </motion.div>
            )}

            {gameState === "playing" && story && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex-grow flex items-center justify-center overflow-y-auto"
              >
                <Card className="w-full max-w-3xl">
                  <CardHeader>
                    <CardTitle>{story.levels[level].prompt}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <Image 
                      src={story.levels[level].image} 
                      alt="Level Image" 
                      className="mb-4 w-full max-w-md rounded-lg"
                      width={500} 
                      height={300} 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                      {story.levels[level].actions.map((action) => (
                        <Button key={action.id} onClick={() => handleAction(action)} className="w-full">{action.text}</Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {(gameState === "end" || gameState === "gameover") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex-grow flex items-center justify-center"
              >
                <div className="text-center p-8 bg-white rounded-lg shadow-md w-full max-w-2xl">
                  <h2 className="text-4xl font-bold mb-6">{gameState === "end" ? "Congratulations!" : "Game Over!"}</h2>
                  <p className="text-2xl mb-8">Your Score: {score}</p>
                  <div className="space-y-4">
                    <Button onClick={() => setGameState("start")} className="w-full max-w-xs mx-auto text-lg py-3">Play Again</Button>
                    <Button onClick={handleEndGame} className="w-full max-w-xs mx-auto text-lg py-3">View Leaderboard</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {gameState === "leaderboard" && (
              <LeaderboardComponent leaderboard={leaderboard} onBack={handleBack} />
            )}

            {gameState === "profile" && userProfile && (
              <ProfileComponent profile={userProfile} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}