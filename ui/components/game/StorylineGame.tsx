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


// Sample storyline data with images
const storyline = [
  {
    prompt: "You find a mysterious door in the forest. What do you do?",
    actions: [
      { text: "Open the door", correct: true },
      { text: "Walk away", correct: false },
      { text: "Knock on the door", correct: false },
    ],
    image: "/images/placeholder.png",
  },
  {
    prompt: "Inside, you see a glowing artifact. How do you proceed?",
    actions: [
      { text: "Touch the artifact", correct: false },
      { text: "Examine it closely", correct: true },
      { text: "Ignore it and explore further", correct: false },
    ],
    image: "/images/placeholder.png",
  },
  {
    prompt: "A guardian appears and asks for the password. What do you say?",
    actions: [
      { text: "Say 'Open Sesame'", correct: false },
      { text: "Remain silent", correct: true },
      { text: "Try to run past the guardian", correct: false },
    ],
    image: "/images/placeholder.png",
  },
];

export function StorylineGame() {
  const [gameState, setGameState] = useState<"start" | "playing" | "end" | "gameover" | "leaderboard" | "profile">("start");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([]);
  const [userProfile, setUserProfile] = useState({ name: "Player", highScores: { "Forest Adventure": 0 }, badges: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false); // Track fullscreen state
  const [showConfetti, setShowConfetti] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const successAudioRef = useRef<HTMLAudioElement>(null);
  const gameOverAudioRef = useRef<HTMLAudioElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedLeaderboard = localStorage.getItem("leaderboard");
    const storedProfile = localStorage.getItem("userProfile");
    if (storedLeaderboard) setLeaderboard(JSON.parse(storedLeaderboard));
    if (storedProfile) setUserProfile(JSON.parse(storedProfile));
    setIsLoading(false);
  }, []);

  const handleAction = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (level < storyline.length - 1) {
        setLevel((prev) => prev + 1);
      } else {
        setShowConfetti(true);
        successAudioRef.current?.play(); // Play success sound
        setGameState("end");
      }
    } else {
      gameOverAudioRef.current?.play(); // Play game over sound
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

  const handleEndGame = () => {
    setGameState("leaderboard");
    setLeaderboard((prev) => [...prev, { name: "Player", score }]); // Update with the actual player name if needed
    localStorage.setItem("leaderboard", JSON.stringify([...leaderboard, { name: "Player", score }]));
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
          {gameState === "start" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4">Storyline Game</h1>
              <p className="mb-4">Embark on an adventurous journey where your choices determine the outcome. Will you succeed or fail? Only you can decide!</p>
              <Image src="/images/placeholder.png" alt="Adventure Intro" className="mb-4 w-full max-w-full rounded-lg" width={500} height={300}  />
              <Button onClick={handleStartGame}>Start Game</Button>
              <Button variant="outline" className="mt-4" onClick={handleProfile}>Profile</Button>
            </motion.div>
          )}

          {gameState === "playing" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{storyline[level].prompt}</CardTitle>
                </CardHeader>
                <CardContent>
                <Image src="/images/placeholder.png" alt="Adventure Intro" className="mb-4 w-full max-w-full rounded-lg" width={500} height={300} />
                  {storyline[level].actions.map((action, index) => (
                    <Button key={index} onClick={() => handleAction(action.correct)} className="w-full mb-2">{action.text}</Button>
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

          {gameState === "profile" && (
            <ProfileComponent profile={userProfile} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
