"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";
import { AudioControl } from "./AudioControl";
import { LeaderboardComponent } from "./LeaderboardComponent";
import { ProfileComponent } from "./ProfileComponent";
import Confetti from "react-confetti";
import Image from "next/image";
import axios from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export interface Action {
  id: number;
  text: string;
  is_correct: boolean;
  points: number;
}


interface Level {
  id: number;
  prompt: string;
  image: string;
  actions: Action[];
}

export interface Story {
  id: number;
  title: string;
  description: string;
  image: string;
  levels: Level[];
}

export interface Scenarios {
  id: number;
  story: number;
  level: number;
  description: string;
  image: string | null;
  order: number;
  actions: Action[];
}

interface LeaderboardEntry {
  username: string;
  score: number;
}

interface UserProfile {
  id: number;
  name: string;
  highScores: Record<string, number>;
  badges: { id: number; name: string; description: string; image: string }[];
}

interface GameInviteResponse {
  id: number;
  inviter: number;
  story: number;
  token: string;
  created_at: string;
  expires_at: string;
}


export function StorylineGame() {
  const [gameState, setGameState] = useState<
    | "start"
    | "playing"
    | "end"
    | "gameover"
    | "leaderboard"
    | "profile"
    | "login"
    | "signup"
  >("start");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [story, setStory] = useState<Story | null>(null);
  const [scenarios, setScenarios] = useState<Scenarios[] | null>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const selectedScenario = scenarios ? scenarios[scenarioIndex] : null;
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lives, setLives] = useState(3);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  // Audio references
  const mainMusicRef = useRef<HTMLAudioElement>(null);
  const congratsSoundRef = useRef<HTMLAudioElement>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement>(null);
  const { isAuthenticated } = useAuth();
  const [vsMode, setVsMode] = useState<boolean>(false);
  const [inviterScore, setInviterScore] = useState<number | null>(null);
  // const [isMuted, setIsMuted] = useState<boolean>(false);

  // const gameAreaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const { invite } = getQueryParams();
    if (invite) {
      setVsMode(true);
      fetchInviterInfo(invite);
    } else {
      fetchInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const getQueryParams = () => {
    if (typeof window === "undefined") {
      return {};
    }
    const params = new URLSearchParams(window.location.search);
    return {
      invite: params.get("invite"),
    };
  };

  const fetchInitialData = async () => {
    try {
      // Fetch story information without authentication
      const storyResponse = await axios.get<Story>("/game/stories/3/");
      setStory(storyResponse.data);

      // Fetch story scenarios
      const scenariosResponse = await axios.get<Scenarios[]>("game/stories/3/levels/6/scenarios/");
      setScenarios(scenariosResponse.data);

      if (isAuthenticated) {
        // Fetch top-scores for the leaderboard
        const leaderboardResponse = await axios.get<LeaderboardEntry[]>("/game/leaderboard/top-scores/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setLeaderboard(leaderboardResponse.data);

        // Fetch the authenticated user's profile if not in VS Mode
        if (!vsMode) {
          const profileResponse = await axios.get<UserProfile>("/accounts/user/", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          });
          setUserProfile(profileResponse.data);
        }
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInviterInfo = async (token: string) => {
    try {
      const response = await axios.get<{ username: string; highest_score: number }>(
        `/game/invites/${token}/inviter-score/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setInviterScore(response.data.highest_score);
    } catch (error) {
      console.error("Error fetching inviter's info:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const createInvite = async () => {
    if (!story) return;
    try {
      const response = await axios.post<GameInviteResponse>("/game/invites/", {
        story: story.id,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const invite: GameInviteResponse = response.data;
      const frontendBaseURL = process.env.NEXT_PUBLIC_FRONTEND_URL;
      const fullInviteLink = `${frontendBaseURL}/game/play/?invite=${invite.token}`;
      setInviteLink(fullInviteLink);
    } catch (error) {
      console.error("Error creating invite:", error);
    }
  };

  const generateShareURLs = (inviteLink: string) => {
    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(inviteLink)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent("Join me in this game!")}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent("Join me in this game!")}`,
    };
  };


  // Function to handle entering fullscreen
  const enterFullscreen = async () => {
    if (gameContainerRef.current) {
      try {
        if (gameContainerRef.current.requestFullscreen) {
          await gameContainerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    }
  };

  // Function to handle exiting fullscreen
  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (err) {
      console.error("Error attempting to exit fullscreen:", err);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const playMainMusic = () => {
    if (mainMusicRef.current) {
      mainMusicRef.current.play();
    }
  };

  const pauseMainMusic = () => {
    if (mainMusicRef.current) {
      mainMusicRef.current.pause();
    }
  };

  const playCongratsSound = () => {
    if (congratsSoundRef.current) {
      congratsSoundRef.current.play();
    }
  };

  const playGameOverSound = () => {
    if (gameOverSoundRef.current) {
      gameOverSoundRef.current.play();
    }
  };

  useEffect(() => {
    if (gameState === "playing") {
      playMainMusic();
    } else {
      pauseMainMusic();
    }

    return () => {
      pauseMainMusic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const handleAction = (action: Action) => {
    const newScore = score + action.points;
    setScore(Math.max(0, newScore));
  
    if (action.is_correct) {
      // Check if there are more scenarios in the current level
      if (scenarioIndex < (scenarios?.length || 0) - 1) {
        // Move to the next scenario
        setScenarioIndex((prev) => prev + 1);
      } else if (level < (story?.levels.length || 0) - 1) {
        // Move to the next level if scenarios are finished
        setLevel((prev) => prev + 1);
        setScenarioIndex(0); // Reset scenario index for the new level
      } else {
        // Game end logic
        playCongratsSound();
        setShowConfetti(true);
        setGameState("end");
      }
    } else {
      // Handle incorrect action
      // Deduct a life and update game state if lives reach zero
      setLives((prevLives) => prevLives - 1);
      if (lives - 1 <= 0) {
        playGameOverSound();
        setGameState("gameover");
      }
    }
  };

  const handleEndGame = () => {
    // Reset game state or perform other end game actions
    setGameState("leaderboard");
  };

  const handleBack = () => {
    setGameState("start");
  };

  // Modified start game handler to enter fullscreen
  const handleStartGame = async () => {
    await enterFullscreen();
    setLives(3);  // Reset lives when starting a new game
    setScore(0);    // Reset score when starting a new game
    setShowConfetti(false); // Stop confetti
    setGameState("playing");
  };

  if (isLoading) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <div 
      ref={gameContainerRef}
      className="relative w-3/4 flex flex-col h-full"
      style={{ zIndex: 1 }}
    >
      {/* Show Confetti */}
      {showConfetti && <Confetti />}

      {/* Show Inviter Score */}
      {vsMode && inviterScore !== null && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
          Inviter&apos;s Score: {inviterScore}
        </div>
      )}

      {/* Audio Elements */}
      <audio ref={mainMusicRef} src="/audio/sound.mp3" loop />
      <audio ref={congratsSoundRef} src="/audio/congrats.mp3" />
      <audio ref={gameOverSoundRef} src="/audio/GameOver.wav" />

      {/* Game Controls */}
      <div className="flex justify-between items-center mb-4">
      {isAuthenticated && (
        <>

        {/* Only show exit fullscreen button when in fullscreen mode */}
        {isFullscreen && (
          <Button
            onClick={exitFullscreen}
            className="absolute top-4 right-4 bg-orange-700"
          >
            <Minimize2 className="mr-2 h-4 w-4" />
            Exit Fullscreen
          </Button>
        )}

        </>
      )}

  {isAuthenticated && !vsMode && (
    <Button className="bg-orange-700 text-xs" onClick={createInvite}>
      Create Invite
    </Button>
  )}

  {isAuthenticated && (
    <Button className="bg-orange-700 text-xs" onClick={() => setGameState("leaderboard")}>
      Leaderboard
    </Button>
  )}

  {gameState === "playing" && (
    <div className="flex items-center space-x-2">
      <span className="text-xl font-bold text-white">Score: {score}</span>
      {[...Array(lives)].map((_, index) => (
        <span key={index} className="text-red-500">❤️</span>
      ))}
    </div>
  )}
  {isAuthenticated && (
    <AudioControl isGameStarted={gameState === "playing"} />
  )}
  
</div>

      {/* Share Invite Link */}
      {inviteLink && (
        <div className="mb-4 text-center">
          <p>Share this link with your friends:</p>
          <p className="text-blue-500 break-all">{inviteLink}</p>
          <div className="flex justify-center space-x-2 mt-2">
            {/* WhatsApp */}
            <Button asChild>
              <a href={generateShareURLs(inviteLink).whatsapp} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
            {/* Twitter */}
            <Button asChild>
              <a href={generateShareURLs(inviteLink).twitter} target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
            </Button>
            {/* Facebook */}
            <Button asChild>
              <a href={generateShareURLs(inviteLink).facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </Button>
            {/* Telegram */}
            <Button asChild>
              <a href={generateShareURLs(inviteLink).telegram} target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence exitBeforeEnter>
        {gameState === "start" && story && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center flex-grow text-center"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="md:w-3/4">
                <h1 className="text-4xl font-bold mb-4 text-white">{story.title}</h1>
                <p className="mb-4 text-white">{story.description}</p>
              </div>
              <div className="md:w-1/4">
                <Image
                  src={story.image}
                  alt="Adventure Intro"
                  className="mb-4 w-full max-w-xl rounded-lg"
                  width={300}
                  height={175}
                />
              </div>
            </div>

            {isAuthenticated ? (
              <Button 
              className="bg-orange-700" 
              onClick={handleStartGame}
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              Start Game
            </Button>
              // <Button className="bg-orange-700" onClick={() => setGameState("playing")}>Start Game</Button>
            ) : (
              <>
                <p className="mb-4">Please log in or sign up to play the game.</p>
                <div className="flex space-x-4">
                  <Button variant="default" asChild className="bg-violet-950 hover:bg-violet-900">
                    <Link href="/login" className="text-yellow-300">
                      Login
                    </Link>
                  </Button>
                  <Button variant="default" asChild className="bg-blue-950 hover:bg-blue-900">
                    <Link href="/signup" className="text-yellow-300">
                      Sign Up
                    </Link>
                  </Button>
                </div>
              </>
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

<Card className="w-full max-w-full">
  <CardHeader>
    <CardTitle>{selectedScenario?.description}</CardTitle>
  </CardHeader>
  <CardContent className="flex flex-col items-center">
    {selectedScenario?.image ? (
      <Image
        src={selectedScenario.image}
        alt="Level Image"
        className="mb-4 w-full max-w-md rounded-lg"
        width={500}
        height={300}
      />
    ) : (
      <div className="mb-4 w-full max-w-md rounded-lg bg-gray-200 flex items-center justify-center h-48">
        <p>No Image Available</p>
      </div>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
      {selectedScenario?.actions.map((action) => (
        <Button
          key={action.id}
          onClick={() => handleAction(action)}
          className="w-full"
        >
          {action.text}
        </Button>
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
              <Button 
                onClick={() => {
                  setShowConfetti(false); // Stop confetti
                  setScore(0);            // Reset score
                  setLives(3);            // Reset lives
                  setScenarioIndex(0);    // Start from the first scenario
                  setGameState("start");  // Restart the game
                }} 
                className="w-full max-w-xs mx-auto text-lg py-3"
              >
                Play Again
              </Button>

                <Button onClick={handleEndGame} className="w-full max-w-xs mx-auto text-lg py-3">
                  View Leaderboard
                </Button>
              </div>
            </div>
            {gameState === "end" && <Confetti />}
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
  );
}