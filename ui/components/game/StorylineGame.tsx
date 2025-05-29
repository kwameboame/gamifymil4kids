"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Maximize2, Minimize2, Volume2, VolumeX, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { AudioControl } from "./AudioControl";
import { LeaderboardComponent } from "./LeaderboardComponent";
import { ProfileComponent } from "./ProfileComponent";
import Confetti from "react-confetti";
import Image from "next/image";
import axios from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import './Game.module.css';


export interface Outcome {
  id: number;
  text: string;
}

export interface Action {
  id: number;
  text: string;
  is_correct: boolean;
  points: number;
  outcome?: Outcome;
}

interface Level {
  id: number;
  title: string;
  intro_text?: string;
  image?: string;
  order: number;
  story: number;
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
    | "level-complete"
    | "level-intro"
  >("start");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [story, setStory] = useState<Story | null>(null);
  const [scenarios, setScenarios] = useState<Scenarios[] | null>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showOutcome, setShowOutcome] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [maxPointsForCurrentScenario, setMaxPointsForCurrentScenario] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const selectedScenario = scenarios ? scenarios[scenarioIndex] : null;
  
  // Calculate maximum points available for the current scenario
  useEffect(() => {
    if (selectedScenario && selectedScenario.actions && selectedScenario.actions.length > 0) {
      const maxPoints = Math.max(...selectedScenario.actions.map(action => action.points || 0));
      setMaxPointsForCurrentScenario(maxPoints);
    }
  }, [selectedScenario]);
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
      const storyResponse = await axios.get<Story>("/api/game/stories/3/");
      setStory(storyResponse.data);

      // Fetch story scenarios
      const scenariosResponse = await axios.get<Scenarios[]>("/api/game/stories/3/levels/6/scenarios/");
      setScenarios(scenariosResponse.data);

      if (isAuthenticated) {
        // Fetch top-scores for the leaderboard
        const leaderboardResponse = await axios.get<LeaderboardEntry[]>("/api/game/leaderboard/top-scores/", {
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
    // Calculate new score immediately
    const pointsToAdd = action.points || 0;
    const newScore = score + pointsToAdd;
    setScore(Math.max(0, newScore));
    
    // Store the selected action to display its outcome
    setSelectedAction(action);
    // Show the outcome screen
    setShowOutcome(true);
  };

  // Handle proceeding to the next scenario after showing the outcome
  const handleProceedToNextScenario = () => {
    // Hide the outcome screen
    setShowOutcome(false);
    setSelectedAction(null);
    
    if (!selectedAction) return;
    
    // Debug info
    console.log('[DEBUG] handleProceedToNextScenario');
    console.log('[DEBUG] scenarioIndex:', scenarioIndex, 'total scenarios:', scenarios?.length);
    console.log('[DEBUG] level:', level, 'total levels:', story?.levels.length);
    
    if (selectedAction.is_correct) {
      // Check if there are more scenarios in the current level
      if (scenarioIndex < (scenarios?.length || 0) - 1) {
        // Move to next scenario in current level
        setScenarioIndex((prev) => prev + 1);
        console.log('[DEBUG] Moving to next scenario:', scenarioIndex + 1);
      } else if (level < (story?.levels.length || 0) - 1) {
        // Show level complete screen
        playCongratsSound();
        setShowConfetti(true);
        setGameState("level-complete");
        console.log('[DEBUG] Level complete! Showing level-complete screen');
      } else {
        // Game end logic
        playCongratsSound();
        setShowConfetti(true);
        setGameState("end");
      }
    } else {
      // Handle incorrect action - Deduct a life
      setLives((prevLives) => prevLives - 1);
      if (lives - 1 <= 0) {
        playGameOverSound();
        setGameState("gameover");
      } else {
        // Move to the next scenario after deducting a life
        if (scenarioIndex < (scenarios?.length || 0) - 1) {
          setScenarioIndex((prev) => prev + 1);
        } else if (level < (story?.levels.length || 0) - 1) {
          // Show level complete screen even for incorrect action if it's the last scenario
          playCongratsSound();
          setShowConfetti(true);
          setGameState("level-complete");
        } else {
          // Game end logic if no more levels
          setGameState("gameover");
        }
      }
    }
  };

  const handleEndGame = () => {
    // Reset game state or perform other end game actions
    setGameState("leaderboard");
  };

  const handleBack = () => {
    // Reset all game state when going back to start
    setLevel(0);
    setScenarioIndex(0);
    setScore(0);
    setLives(3);
    setShowConfetti(false);
    setShowOutcome(false);
    setSelectedAction(null);
    // Fetch initial level scenarios again
    fetchInitialData();
    // Finally, set game state back to start
    setGameState("start");
    console.log('[DEBUG] Game reset to initial state');
  };

  // Modified start game handler to enter fullscreen and reset game state
  const handleStartGame = async () => {
    await enterFullscreen();
    // Reset all game state
    setLevel(0);
    setScenarioIndex(0);
    setScore(0);
    setLives(3);
    setShowConfetti(false);
    setShowOutcome(false);
    setSelectedAction(null);
    
    // Fetch initial level scenarios again to ensure we're starting with level 1
    fetchInitialData();
    
    // Set game state to playing
    setGameState("playing");
    
    console.log('[DEBUG] Game fully reset and started from beginning');
  }
  
  // Handler for continuing to next level
  const handleContinueToNextLevel = async () => {
    if (!story) return;
    
    console.log('[DEBUG] handleContinueToNextLevel');
    console.log('[DEBUG] Current level:', level);
    console.log('[DEBUG] Next level:', level + 1);
    
    const nextLevel = level + 1;
    
    if (nextLevel < story.levels.length) {
      // Increment level and reset scenario index
      setLevel(nextLevel);
      setScenarioIndex(0);
      setShowConfetti(false);
      
      // Fetch scenarios for the new level
      try {
        console.log('[DEBUG] Fetching scenarios for level ID:', story.levels[nextLevel].id);
        const scenariosResponse = await axios.get<Scenarios[]>(`/api/game/stories/3/levels/${story.levels[nextLevel].id}/scenarios/`);
        setScenarios(scenariosResponse.data);
        console.log('[DEBUG] Fetched scenarios:', scenariosResponse.data);
        
        // Show level intro before starting the level
        setGameState("level-intro");
        console.log('[DEBUG] Showing level intro for level:', nextLevel);
      } catch (error) {
        console.error('Error fetching scenarios for next level:', error);
      }
    } else {
      // No more levels, end the game
      setGameState("end");
    }
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
    <Button className="bg-orange-700 text-sm" onClick={() => setGameState("leaderboard")}>
      Leaderboard
    </Button>
  )}

  {gameState === "playing" && (
    <div className="flex flex-col my-1 w-full">
  <div className="flex flex-wrap items-center justify-between mb-1 w-full bg-black px-4 py-2 rounded-md">
        {/* Game score with game-like UI */}
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-2 rounded-lg shadow-lg flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
            </svg>
            <span className="text-xl font-bold text-white">{score}</span>
          </div>
          
          {/* Lives with animated heart icons */}
          <div className="ml-4 flex items-center">
            {[...Array(lives)].map((_, index) => (
              <span key={index} className="text-red-500 text-xl mx-1 animate-pulse">❤️</span>
            ))}
          </div>
        </div>

        {/* Scenario counter and mute button */}
        <div className="flex items-center gap-2">
  <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-medium">
    Level {level + 1} : Scenario {scenarioIndex + 1}/{scenarios?.length || 1}
  </div>
  {/* Fullscreen toggle button */}
  <Button
    variant="ghost"
    size="icon"
    aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    className="ml-2 group hover:bg-gray-700 focus:bg-gray-700 transition"
    onClick={() => {
      if (isFullscreen) {
        exitFullscreen();
      } else {
        enterFullscreen();
      }
    }}
  >
    {isFullscreen ? (
      <Minimize2 className="w-5 h-5 text-gray-200 group-hover:text-yellow-300 group-focus:text-yellow-300 transition" />
    ) : (
      <Maximize2 className="w-5 h-5 text-gray-200 group-hover:text-yellow-300 group-focus:text-yellow-300 transition" />
    )}
  </Button>
  {/* Mute button */}
  <Button
    variant="ghost"
    size="icon"
    aria-label={isMuted ? 'Unmute' : 'Mute'}
    className="ml-2 group hover:bg-gray-700 focus:bg-gray-700 transition"
    onClick={() => {
      setIsMuted((prev) => !prev);
      // Mute/unmute all audio refs
      if (mainMusicRef.current) mainMusicRef.current.muted = !isMuted;
      if (congratsSoundRef.current) congratsSoundRef.current.muted = !isMuted;
      if (gameOverSoundRef.current) gameOverSoundRef.current.muted = !isMuted;
    }}
  >
    {isMuted ? (
      <VolumeX className="w-5 h-5 text-gray-200 group-hover:text-yellow-300 group-focus:text-yellow-300 transition" />
    ) : (
      <Volume2 className="w-5 h-5 text-gray-200 group-hover:text-yellow-300 group-focus:text-yellow-300 transition" />
    )}
  </Button>
</div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-300 rounded-full h-2 mb-1">
        <div 
          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${(scenarioIndex / (scenarios?.length || 1)) * 100}%` }}
        ></div>
      </div>
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

            <Button 
              className="bg-orange-700" 
              onClick={handleStartGame}
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              Start Game
            </Button>

            {}
          </motion.div>
        )}

        {gameState === "playing" && story && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-grow flex items-center justify-center mt-1"
          >
            {showOutcome && selectedAction ? (
              <Card className="w-full max-w-2xl shadow-2xl">
                <CardContent className="p-8 md:p-12 text-center">
                  <div className="flex items-center justify-center mb-6 space-x-4">
                    <div className="w-24 h-36 bg-gray-300 rounded-md flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Character Placeholder</span>
                    </div>
                    <div className="flex flex-col items-center">
                      {selectedAction.is_correct 
                        ? (selectedAction.points < maxPointsForCurrentScenario 
                          ? <AlertCircle className="text-orange-500" size={48} /> 
                          : <CheckCircle className="text-green-500" size={48} />) 
                        : <XCircle className="text-red-500" size={48} />}
                      <h1 className="text-3xl font-bold text-gray-800 mt-2">
                        {selectedAction.is_correct 
                          ? (selectedAction.points < maxPointsForCurrentScenario ? "Partially Correct!" : "Correct Choice!") 
                          : "Incorrect Choice!"}
                      </h1>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg mb-6">
                    {selectedAction.outcome?.text || 
                      (selectedAction.is_correct 
                        ? (selectedAction.points < maxPointsForCurrentScenario ? "Good try! You were partially correct." : "Good job! You made the right choice.") 
                        : "That wasn't the best choice.")}
                  </p>
                  {selectedAction.is_correct 
                    ? (
                      <div className={`${selectedAction.points < maxPointsForCurrentScenario ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-yellow-100 border-yellow-500 text-yellow-700'} border-l-4 p-4 rounded-lg mb-8`}>
                        <p className="text-lg font-semibold">
                          You earned {selectedAction.points || 0} points! Your score is now {score}.
                        </p>
                      </div>
                    ) 
                    : (
                      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8">
                        <p className="text-lg font-semibold">
                          You earned 0 points. You lost a life.
                        </p>
                      </div>
                    )
                  }
                  <Button 
                    onClick={handleProceedToNextScenario} 
                    className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full max-w-full">
                <CardHeader className="pb-2">
  <CardTitle>
    <span style={{ fontSize: '0.9rem' }}>{selectedScenario?.description}</span>
  </CardTitle>
</CardHeader>
                <CardContent className="p-3">
                  <div className="flex flex-col gap-4 items-center">
                    {/* Scenario Image on top */}
                    <div className="w-full flex justify-center">
  {selectedScenario?.image ? (
    <Image
      src={selectedScenario.image}
      alt="Level Image"
      className="w-full max-w-xs rounded-lg" // Reduced width
      width={350}
      height={210}
    />
                      ) : (
                        <div className="w-full max-w-md rounded-lg bg-gray-200 flex items-center justify-center h-48">
                          <p>No Image Available</p>
                        </div>
                      )}
                    </div>
                    {/* Actions below image */}
                    <div className="w-full grid grid-cols-2 gap-4 justify-items-center">
  {selectedScenario?.actions.map((action) => (
    <Button
      key={action.id}
      onClick={() => handleAction(action)}
      className="w-[95%] min-h-[3rem] py-2 px-2 whitespace-normal text-center text-sm flex items-center justify-center"
      variant="default"
      size="sm"
    >
      {action.text}
    </Button>
  ))}
</div>
                  </div>
                </CardContent>
              </Card>
            )
          }

          </motion.div>
        )}

        {gameState === "level-intro" && story && level < story.levels.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-grow flex items-center justify-center"
          >
            <div className="text-center p-8 bg-white rounded-lg shadow-md w-full max-w-2xl">
              <h2 className="text-4xl font-bold mb-6 text-gray-900">Level {level + 1}: {story.levels[level].title}</h2>
              
              {/* Level Image if available */}
              {story.levels[level].image && (
                <div className="mb-6 flex justify-center">
                  <Image
                    src={story.levels[level].image}
                    alt={`Level ${level + 1}`}
                    width={400}
                    height={250}
                    className="rounded-lg shadow-md"
                  />
                </div>
              )}
              
              {/* Level intro text */}
              <div className="mb-8 text-lg text-left p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800">{story.levels[level].intro_text || "Get ready for the next level!"}</p>
              </div>
              
              <Button 
                onClick={() => {
                  setGameState("playing");
                  console.log('[DEBUG] Starting level', level + 1);
                }}
                className="bg-orange-700 text-lg py-3"
              >
                Start Level
              </Button>
              
              {/* Debug info in development mode */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-gray-100 rounded text-left text-sm">
                  <p>Debug Info:</p>
                  <p>Current Level: {level}</p>
                  <p>Level ID: {story.levels[level].id}</p>
                  <p>Scenarios Loaded: {scenarios?.length}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {gameState === "level-complete" && story && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-grow flex items-center justify-center"
          >
            <div className="text-center p-8 bg-white rounded-lg shadow-md w-full max-w-2xl">
              <h2 className="text-4xl font-bold mb-6 text-gray-900">Level {level + 1} Complete!</h2>
              <p className="text-2xl mb-4 text-gray-800">Current Score: {score}</p>
              <p className="text-lg mb-8 text-gray-600">Congratulations! You&apos;ve completed this level.</p>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleContinueToNextLevel} 
                  className="bg-orange-700 text-lg py-3"
                >
                  Continue to Next Level
                </Button>
              </div>
              
              {/* Debug info in development mode */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-gray-100 rounded text-left text-sm">
                  <p>Debug Info:</p>
                  <p>Current Level: {level}</p>
                  <p>Total Levels: {story.levels.length}</p>
                  <p>Scenarios in Current Level: {scenarios?.length}</p>
                </div>
              )}
            </div>
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
              <h2 className="text-4xl font-bold mb-6 text-gray-900">{gameState === "end" ? "Congratulations!" : "Game Over!"}</h2>
              <p className="text-2xl mb-8 text-gray-800">Your Score: {score}</p>
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