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


type Action = {
  id: number;
  text: string;
  is_correct: boolean;
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
  id: number;
  name: string;
  score: number;
};

type UserProfile = {
  id: number;
  name: string;
  highScores: Record<string, number>;  // Changed from high_scores to highScores
  badges: { id: number; name: string; description: string; image: string }[];
};

const API_BASE_URL = 'http://localhost:8000/api';

// Sample storyline data with images
// const storyline = [
//   {
//     prompt: "You find a mysterious door in the forest. What do you do?",
//     actions: [
//       { text: "Open the door", correct: true },
//       { text: "Walk away", correct: false },
//       { text: "Knock on the door", correct: false },
//     ],
//     image: "/images/placeholder.png",
//   },
//   {
//     prompt: "Inside, you see a glowing artifact. How do you proceed?",
//     actions: [
//       { text: "Touch the artifact", correct: false },
//       { text: "Examine it closely", correct: true },
//       { text: "Ignore it and explore further", correct: false },
//     ],
//     image: "/images/placeholder.png",
//   },
//   {
//     prompt: "A guardian appears and asks for the password. What do you say?",
//     actions: [
//       { text: "Say 'Open Sesame'", correct: false },
//       { text: "Remain silent", correct: true },
//       { text: "Try to run past the guardian", correct: false },
//     ],
//     image: "/images/placeholder.png",
//   },
// ];

export function StorylineGame() {
  const [gameState, setGameState] = useState<"start" | "playing" | "end" | "gameover" | "leaderboard" | "profile">("start");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [story, setStory] = useState<Story | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const successAudioRef = useRef<HTMLAudioElement>(null);
  const gameOverAudioRef = useRef<HTMLAudioElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storyResponse = await fetch(`${API_BASE_URL}/stories/1/`);
        const storyData = await storyResponse.json();
        setStory(storyData);

        const leaderboardResponse = await fetch(`${API_BASE_URL}/leaderboard/`);
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData);

        const profileResponse = await fetch(`${API_BASE_URL}/profiles/1/`);
        const profileData = await profileResponse.json();
        // Transform the data to match our UserProfile type
        setUserProfile({
          ...profileData,
          highScores: profileData.high_scores, // Assuming the API returns 'high_scores'
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAction = async (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (level < (story?.levels.length || 0) - 1) {
        setLevel((prev) => prev + 1);
      } else {
        setShowConfetti(true);
        successAudioRef.current?.play();
        setGameState("end");
      }
    } else {
      gameOverAudioRef.current?.play();
      setGameState("gameover");
    }
  };

  const handleStartGame = () => {
    setGameState("playing");
    setIsGameStarted(true);
    setScore(0);
    setLevel(0);
    setShowConfetti(false);
  };

  const handleEndGame = async () => {
    setGameState("leaderboard");
    if (userProfile) {
      try {
        const response = await fetch(`${API_BASE_URL}/leaderboard/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userProfile.name,
            score: score,
            story: story?.id,
          }),
        });

        if (response.ok) {
          const leaderboardResponse = await fetch(`${API_BASE_URL}/leaderboard/`);
          const leaderboardData = await leaderboardResponse.json();
          setLeaderboard(leaderboardData);

          if (score > (userProfile.highScores[story?.title || ''] || 0)) {
            const updatedProfile = {
              ...userProfile,
              highScores: {
                ...userProfile.highScores,
                [story?.title || '']: score,
              },
            };
            await fetch(`${API_BASE_URL}/profiles/${userProfile.id}/`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedProfile),
            });
            setUserProfile(updatedProfile);
          }
        }
      } catch (error) {
        console.error("Error submitting score:", error);
      }
    }
  };

  const handleBack = () => {
    setGameState("start");
  };

  const handleProfile = () => {
    setGameState("profile");
  };

  const handleFullscreen = () => {
    const gameArea = gameAreaRef.current;
    if (gameArea) {
      if (!isFullscreen) {
        if (gameArea.requestFullscreen) {
          gameArea.requestFullscreen();
        } 
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    }
  };

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {showConfetti && <Confetti />}
      <audio ref={audioRef} src="/sounds/game_music.mp3" loop />
      <audio ref={successAudioRef} src="/sounds/success.mp3" />
      <audio ref={gameOverAudioRef} src="/sounds/game_over.mp3" />
      
      <div ref={gameAreaRef} className="relative w-full max-w-full p-4 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={handleFullscreen} className="text-xs">
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
          <h2 className="text-xl font-bold">Score: {score}</h2>
          <AudioControl isGameStarted={isGameStarted} />
        </div>

        <AnimatePresence exitBeforeEnter>
          {gameState === "start" && story && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
              <p className="mb-4">{story.description}</p>
              <Image src="/images/placeholder.png" alt="Adventure Intro" className="mb-4 w-full max-w-full rounded-lg" width={500} height={300} />
              <Button onClick={handleStartGame}>Start Game</Button>
              <Button variant="outline" className="mt-4" onClick={handleProfile}>Profile</Button>
            </motion.div>
          )}

          {gameState === "playing" && story && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{story.levels[level].prompt}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image src={story.levels[level].image} alt="Level Image" className="mb-4 w-full max-w-full rounded-lg" width={500} height={300} />
                  {story.levels[level].actions.map((action) => (
                    <Button key={action.id} onClick={() => handleAction(action.is_correct)} className="w-full mb-2">{action.text}</Button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {gameState === "end" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold">Congratulations!</h2>
              <p>Your Score: {score}</p>
              <Button onClick={() => setGameState("start")}>Play Again</Button>
              <Button onClick={handleEndGame} className="mt-4">Submit Score</Button>
            </motion.div>
          )}

          {gameState === "gameover" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold">Game Over!</h2>
              <p>Your Score: {score}</p>
              <Button onClick={handleStartGame}>Try Again</Button>
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
  );
}
