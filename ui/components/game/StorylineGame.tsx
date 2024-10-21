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
import Image from "next/image";
import axios from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
// import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa'; // Import sound control icons
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
  levels: Level[];
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [isGameStarted, setIsGameStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  // Audio references
  const mainMusicRef = useRef<HTMLAudioElement>(null);
  const congratsSoundRef = useRef<HTMLAudioElement>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement>(null);
  const { isAuthenticated } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [vsMode, setVsMode] = useState<boolean>(false);
  const [inviterScore, setInviterScore] = useState<number | null>(null);
  // const [isMuted, setIsMuted] = useState<boolean>(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);


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
      const storyResponse = await axios.get<Story>("/game/stories/1/");
      setStory(storyResponse.data);

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


  // const toggleFullscreen = () => {
  //   if (!document.fullscreenElement) {
  //     gameAreaRef.current?.requestFullscreen();
  //     setIsFullscreen(true);
  //   } else {
  //     document.exitFullscreen();
  //     setIsFullscreen(false);
  //   }
  // };

  // const handleMuteToggle = () => {
  //   setIsMuted(!isMuted);
  // };

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
      if (level < (story?.levels.length || 0) - 1) {
        setLevel((prev) => prev + 1);
      } else {
        // Game end logic
        playCongratsSound();
        setShowConfetti(true);
        setGameState("end");
      }
    } else {
      // Handle incorrect action
      playGameOverSound();
      setGameState("gameover");
    }
  };

  const handleEndGame = () => {
    // Reset game state or perform other end game actions
    setGameState("leaderboard");
  };

  const handleBack = () => {
    setGameState("start");
  };


  if (isLoading) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <div className="relative flex flex-col h-full" style={{ zIndex: 1 }}>
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

      {/* Sound Control */}
      {/* <div className="absolute top-4 right-4 flex items-center space-x-2">
        <Button onClick={handleMuteToggle} variant="ghost" size="icon">
          {isMuted ? <FaVolumeMute className="h-4 w-4" /> : <FaVolumeUp className="h-4 w-4" />}
        </Button>
      </div> */}

      {/* Game Controls */}
      <div className="flex justify-between items-center mb-4">
      {isAuthenticated && (
        <>
          {isFullscreen ? (
            <Button
              onClick={() => {
                if (document.exitFullscreen) {
                  document.exitFullscreen();
                }
                setIsFullscreen(false);
              }}
              className="text-xs"
            >
              Exit Fullscreen
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (gameAreaRef.current && gameAreaRef.current.requestFullscreen) {
                  gameAreaRef.current.requestFullscreen();
                }
                setIsFullscreen(true);
              }}
              className="text-xs"
            >
              Fullscreen
            </Button>
          )}
        </>
      )}

  {isAuthenticated && !vsMode && (
    <Button onClick={createInvite} className="text-xs">
      Create Invite
    </Button>
  )}

  {/* {isAuthenticated && (
    <Button onClick={handleLogout} className="text-xs">
      Logout
    </Button>
  )} */}

  {isAuthenticated && (
    <Button onClick={() => setGameState("leaderboard")} className="text-xs">
      Leaderboard
    </Button>
  )}

  {gameState === "playing" && (
    <div className="text-xl font-bold">Score: {score}</div>
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
            <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
            <p className="mb-4">{story.description}</p>
            <Image
              src="/images/placeholder.png"
              alt="Adventure Intro"
              className="mb-4 w-full max-w-xl rounded-lg"
              width={500}
              height={300}
            />
            {isAuthenticated ? (
              <Button onClick={() => setGameState("playing")}>Start Game</Button>
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
                <Button variant="ghost" asChild>
                  <Link href="/login" className="text-white hover:text-orange-500">
                    Login
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                      <Link href="/signup" className="text-white hover:text-orange-500">
                        Sign Up
                      </Link>
                    </Button>
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
                    <Button key={action.id} onClick={() => handleAction(action)} className="w-full">
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
                <Button onClick={() => setGameState("start")} className="w-full max-w-xs mx-auto text-lg py-3">
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