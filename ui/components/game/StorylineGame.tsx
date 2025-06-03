"use client";
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { LeaderboardComponent } from "./LeaderboardComponent";
import { ProfileComponent } from "./ProfileComponent";
import PowerUpModal, { PowerUp } from "./PowerUpModal";
import Confetti from "react-confetti";
import Image from "next/image";
import axios from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import PowerUpService from "@/services/PowerUpService";
import './Game.module.css';
import { GameAuthButtons } from "./GameAuthButtons";
import { GameState } from "./types";
// Import Material Symbols font for icons
import "material-symbols";
import "@/styles/material-symbols.css";


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

export interface UserProgressResponse {
  id: number;
  user: number;
  username: string;
  story: number;
  story_title: string;
  level: number;
  score: number;
  lives: number;
  scenario_index: number;
  state_data: {
    advanceToNextLevel?: boolean;
    returnPath?: string;
    variant?: string;
  };
  last_updated: string;
}

export function StorylineGame() {
  const [gameState, setGameState] = useState<GameState>("start");
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
  
  // PowerUp related states
  const [earnedPowerUp, setEarnedPowerUp] = useState<PowerUp | null>(null); // Used in the PowerUpModal and checkForPowerUp
  const [showPowerUpModal, setShowPowerUpModal] = useState(false);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0); // Used to determine power-up eligibility
  const [activePowerUps, setActivePowerUps] = useState<PowerUp[]>([]);
  const powerUpIconsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  
  // Animate power-up icons when they're added
  useEffect(() => {
    // Get the latest power-up that was added
    if (activePowerUps.length > 0) {
      const latestPowerUp = activePowerUps[activePowerUps.length - 1];
      const powerUpElement = powerUpIconsRef.current.get(latestPowerUp.id);
      
      if (powerUpElement) {
        // Initial animation when power-up is added
        gsap.fromTo(powerUpElement,
          { scale: 0, opacity: 0 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.5,
            ease: "back.out(1.7)"
          }
        );
        
        // Add a subtle continuous pulse animation
        gsap.to(powerUpElement, {
          scale: 1.1,
          repeat: -1,
          yoyo: true,
          duration: 1,
          delay: 0.5
        });
      }
    }
  }, [activePowerUps]);
  
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
  const MAX_LIVES = 3;
  const [lives, setLives] = useState(MAX_LIVES);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  // Audio references
  const mainMusicRef = useRef<HTMLAudioElement>(null);
  const congratsSoundRef = useRef<HTMLAudioElement>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement>(null);
  const powerUpSoundRef = useRef<HTMLAudioElement>(null);
  const correctSoundRef = useRef<HTMLAudioElement>(null);
  const partiallySoundRef = useRef<HTMLAudioElement>(null);
  const wrongSoundRef = useRef<HTMLAudioElement>(null);
  const { isAuthenticated } = useAuth();
  // Get token from localStorage
  const getToken = () => localStorage.getItem('authToken');
  const [vsMode, setVsMode] = useState<boolean>(false);
  const [inviterScore, setInviterScore] = useState<number | null>(null);

  // Function to check if player earned a power-up and apply it automatically
  const checkForPowerUp = async () => {
    console.log('[DEBUG] Checking for power-up with correct answers:', correctAnswerCount);
    
    try {
      // Skip if no story
      if (!story) {
        console.log('[DEBUG] Skipping power-up check - no story available');
        return;
      }
      
      let powerUp = null;
      
      // For authenticated users, fetch from backend
      const token = localStorage.getItem('authToken');
      if (token && isAuthenticated) {
        console.log(`[DEBUG] Authenticated user: Checking power-ups for story ID: ${story.id}`);
        
        // Fetch power-up from backend based on current story and correct answers
        powerUp = await PowerUpService.checkEarnPowerUp(
          token,
          story.id,
          correctAnswerCount
        );
      } else {
        // For non-authenticated users, use local power-up logic
        console.log('[DEBUG] Non-authenticated user: Using local power-up logic');
        
        // Define local power-ups that match the structure expected by the PowerUp interface
        const localPowerUps: (PowerUp & { required_correct_answers: number })[] = [
          {
            id: 1,
            name: 'Extra Life',
            description: 'Gives you an extra life!',
            power_up_type: 'extra_life',
            power_up_type_display: 'Extra Life',
            bonus_lives: 1,
            required_correct_answers: 3,
            score_multiplier: 1,
            time_extension_seconds: 0,
            user_power_up_id: 0
          },
          {
            id: 2,
            name: 'Score Booster',
            description: 'Doubles your current score!',
            power_up_type: 'score_booster',
            power_up_type_display: 'Score Booster',
            bonus_lives: 0,
            required_correct_answers: 4,
            score_multiplier: 2,
            time_extension_seconds: 0,
            user_power_up_id: 0
          }
        ];
        
        // Filter eligible power-ups
        const eligiblePowerUps = localPowerUps.filter(
          p => correctAnswerCount >= p.required_correct_answers
        );
        
        // Find the best match (highest required_correct_answers)
        if (eligiblePowerUps.length > 0) {
          const bestMatchPowerUp = eligiblePowerUps.reduce((best, current) => {
            if (!best) return current;
            return current.required_correct_answers > best.required_correct_answers ? current : best;
          }, eligiblePowerUps[0]);
          
          // Create a new power-up object with a unique ID
          powerUp = {
            ...bestMatchPowerUp,
            user_power_up_id: Date.now() // Use timestamp as a unique ID
          };
        }
      }
      
      if (powerUp) {
        const source = token && isAuthenticated ? 'backend' : 'local game logic';
        console.log(`[DEBUG] Earned power-up from ${source}:`, powerUp.name);
        
        // Play power-up sound
        if (powerUpSoundRef.current && !isMuted) {
          powerUpSoundRef.current.currentTime = 0;
          powerUpSoundRef.current.play();
        }
        
        // Show the modal
        setEarnedPowerUp(powerUp);
        setShowPowerUpModal(true);
        setActivePowerUps(prev => [...prev, powerUp]);
        
        // Apply power-up effects immediately
        if (powerUp.power_up_type === 'extra_life') {
          setLives(prev => prev + powerUp.bonus_lives);
          console.log('[DEBUG] Applied extra life:', powerUp.bonus_lives);
        } else if (powerUp.power_up_type === 'score_booster' || powerUp.power_up_type === 'score_boost') {
          setScore(prev => prev * powerUp.score_multiplier);

          // reset correct‐answer streak so the same booster can’t fire again immediately
          setCorrectAnswerCount(0);
          // clear/reset the multiplier so it doesn’t apply again
          setActivePowerUps(p => p.filter(pu => pu.id !== powerUp.id));
          console.log('[DEBUG] Applied score multiplier:', powerUp.score_multiplier);
        }
      } else {
        console.log('[DEBUG] No power-up earned for', correctAnswerCount, 'correct answers');
      }
    } catch (error) {
      console.error('[ERROR] Failed to check for power-ups:', error);
    }
  };
  
  // We don't need a separate function to handle using power-ups since they're automatically applied

  // Function to save game progress to backend
  const saveGameProgressToBackend = async () => {
    if (!isAuthenticated || !story?.id) return false;
    
    try {
      const stateData = {
        variant: gameState,
        advanceToNextLevel: gameState === 'level-complete',
        returnPath: window.location.pathname
      };
      
      const response = await axios.post('/api/game/user-progress/save-progress/', {
        story_id: story.id,
        level: gameState === 'level-complete' ? level + 1 : level,
        score: score,
        lives: lives,
        scenario_index: gameState === 'level-complete' ? 0 : scenarioIndex,
        state_data: stateData
      });
      
      console.log('Game progress saved to backend:', response.data);
      return true;
    } catch (error) {
      console.error('Error saving game progress to backend:', error instanceof Error ? error.message : String(error));
      return false;
    }
  };
  
  /* This function is not currently used but is kept for potential future use
  const fetchGameProgressFromBackend = async () => {
    if (!isAuthenticated || !story?.id) return null;
    
    try {
      const response = await axios.get<UserProgressResponse>(`/api/game/user-progress/get-progress/?story_id=${story.id}`);
      console.log('Retrieved game progress from backend:', response.data);
      return response.data;
    } catch (error) {
      // 404 is expected when no progress exists yet
      // Using type checking for axios error response
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response) {
        const errorResponse = error.response as {status: number};
        if (errorResponse.status !== 404) {
          console.error('Error fetching game progress from backend:', error instanceof Error ? error.message : String(error));
        }
      } else {
        console.error('Unexpected error fetching game progress:', error instanceof Error ? error.message : String(error));
      }
      return null;
    }
  };
  */

  /**
   * Function to restore saved game state
   */
  const restoreSavedGameState = async (progress: UserProgressResponse) => {
    // Set game state and variables from the saved progress
    setScore(progress.score);
    setLives(progress.lives);
    setLevel(progress.level);
    // Load active power-ups if user is authenticated
    if (isAuthenticated && story) {
      const token = getToken();
      if (token) {
        try {
          const userPowerUps = await PowerUpService.getUserActivePowerUps(token, progress.story);
          setActivePowerUps(userPowerUps);
        } catch (error) {
          console.error("Error loading power-ups:", error);
        }
      }
    }
  };

  /**
   * Function to check for saved state and handle game continuation
   */
  const checkForSavedState = async () => {
    if (isAuthenticated && story) {
      try {
        const response = await axios.get<UserProgressResponse[]>(`/api/user-progress/?story=${story.id}`);
        const progressData = response.data as UserProgressResponse[];

        if (progressData && progressData.length > 0) {
          const latestProgress = progressData[0]; // Assuming it's sorted by last_updated
          await restoreSavedGameState(latestProgress);
          
          // Set correct answer count based on score (approximation)
          if (latestProgress.score > 0) {
            // Assume average of 10 points per correct answer (adjust as needed)
            setCorrectAnswerCount(Math.floor(latestProgress.score / 10));
          }
          
          return true;
        }
      } catch (error) {
        console.error("Error fetching saved game state:", error);
      }
    }
    return false;
  };

  useEffect(() => {
    const { invite } = getQueryParams();
    if (invite) {
      setVsMode(true);
      fetchInviterInfo(invite);
    } else {
      fetchInitialData();
      
      // Check for saved game state after login/signup or when returning to the game page
      checkForSavedState();
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
          const profileResponse = await axios.get<UserProfile>("/api/accounts/user/", {
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
    // Play whenever we’re “playing” or in-between levels
    if (gameState === "playing" || gameState === "level-intro" || gameState === "level-complete") {
      playMainMusic();
    }
    // Only pause when the game is over or truly stopped
    if (gameState === "gameover" || gameState === "end") {
      pauseMainMusic();
    }
  }, [gameState]);


  const handleAction = (action: Action) => {
    setSelectedAction(action);
    setShowOutcome(true);
  
    // Determine if the action is partially correct (has some points but is not marked as correct)
    const isPartiallyCorrect = action.is_correct && (action.points || 0) < maxPointsForCurrentScenario;

    // Play appropriate sound based on outcome
    if (!isMuted) {
      if (action.is_correct && correctSoundRef.current) {
        // Play correct sound
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play();
      } else if (isPartiallyCorrect && partiallySoundRef.current) {
        // Play partially correct sound
        partiallySoundRef.current.currentTime = 0;
        partiallySoundRef.current.play();
      } else if (!action.is_correct && wrongSoundRef.current) {
        // Play wrong sound
        wrongSoundRef.current.currentTime = 0;
        wrongSoundRef.current.play();
      }
    }
  
    if (action.is_correct) {
      setScore(prev => prev + (action.points || 0));
      setCorrectAnswerCount(count => count + 1);
      console.log('[DEBUG] Consecutive correct answers increased to:', correctAnswerCount + 1);
    } else {
      // Still add points if partially correct
      if (action.points && action.points > 0) {
        setScore(prev => prev + action.points);
      }
      

      
      // Reset consecutive correct answer count when user answers incorrectly
      setCorrectAnswerCount(0);
      console.log('[DEBUG] Consecutive correct answers reset to 0 due to incorrect answer');
    }
  };

  // Handle proceeding to the next scenario after showing the outcome
  const handleProceedToNextScenario = () => {
    setShowOutcome(false);
    setSelectedAction(null);
  
    if (selectedAction?.is_correct) {
      checkForPowerUp();
    }
  
    let newLives = lives;
  
    // Only reduce lives here, based on previous action
    if (selectedAction && !selectedAction.is_correct && selectedAction.points === 0) {
      newLives = lives - 1;
      setLives(newLives);
    }
  
    if (newLives <= 0) {
      setGameState("gameover");
      playGameOverSound();
      if (isAuthenticated && story?.id) {
        saveGameProgressToBackend();
      }
      return;
    }
  
    if (selectedAction?.is_correct) {
      if (scenarioIndex < (scenarios?.length || 0) - 1) {
        setScenarioIndex(prev => prev + 1);
      } else if (level < (story?.levels?.length || 0) - 1) {
        playCongratsSound();
        setShowConfetti(true);
        setGameState("level-complete");
      } else {
        playCongratsSound();
        setShowConfetti(true);
        setGameState("end");
      }
    } else {
      if (scenarioIndex < (scenarios?.length || 0) - 1) {
        setScenarioIndex(prev => prev + 1);
      } else if (level < (story?.levels?.length || 0) - 1) {
        playCongratsSound();
        setShowConfetti(true);
        setGameState("level-complete");
      } else {
        setGameState("gameover");
      }
    }
  
    if (isAuthenticated && story) {
      saveGameProgressToBackend();
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

    // Reset all power-up state here:
    setActivePowerUps([]);
    setCorrectAnswerCount(0);
    setEarnedPowerUp(null);
    setShowPowerUpModal(false);
    
    // Set game state to playing
    setGameState("playing");
    
    console.log('[DEBUG] Game fully reset and started from beginning');
  }

  // Function to start playing the current level from its intro screen
  const playCurrentLevel = async () => {
    await enterFullscreen(); // Maintain fullscreen consistency
    // We don't reset score, lives, or level here.
    // Scenario index should be 0 if coming from a fresh level intro or restored state.
    setShowConfetti(false);   // Ensure confetti is off
    setShowOutcome(false);    // Ensure no lingering outcome from a previous action
    setSelectedAction(null); // Ensure no lingering action

    // Set game state to playing for the current level
    setGameState("playing");
    
    console.log(`[DEBUG] Starting to play current level: ${level}, scenario: ${scenarioIndex}. Score: ${score}, Lives: ${lives}`);
  };
  
  // Handler for continuing to next level
  const handleContinueToNextLevel = async () => {
    if (!story) return;
    
    console.log('[DEBUG] handleContinueToNextLevel');
    console.log('[DEBUG] Current level:', level);
    console.log('[DEBUG] Next level:', level + 1);
    
    const nextLevel = level + 1;
    
    if (nextLevel < story.levels.length) {
      // reset power-ups and consecutive answer tracking for the new level:
      setActivePowerUps([]);
      setCorrectAnswerCount(0); // Reset consecutive correct answers
      console.log('[DEBUG] Consecutive correct answers reset to 0 for new level');
      setEarnedPowerUp(null);
      setShowPowerUpModal(false);

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
      <audio ref={congratsSoundRef} src="/audio/congrats.wav" />
      <audio ref={gameOverSoundRef} src="/audio/gameover.wav" />
      <audio ref={powerUpSoundRef} src="/audio/powerup.wav" />
      <audio ref={correctSoundRef} src="/audio/correct.mp3" />
      <audio ref={partiallySoundRef} src="/audio/partially.mp3" />
      <audio ref={wrongSoundRef} src="/audio/wrong.mp3" />

      {/* Game Controls */}
      <div className="flex justify-between items-center mb-4">
      {/* Removed redundant fullscreen controls - now handled in the game header */}

  {/* Controls have been moved to the game state UI */}

  {gameState === "playing" && (
    <div className="flex flex-col my-1 w-full">
      <div className="flex items-center justify-between mb-1 w-full bg-black px-4 py-2 rounded-md">
        {/* Game score with icon - left side */}
        <div className="flex items-center">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-1 text-amber-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
            </svg>
            <span className="text-amber-400 text-sm font-bold mr-1">Score:</span>
            <span className="text-amber-400 text-xl font-mono font-bold">{score}</span>
          </div>
          {isAuthenticated && !vsMode && (
            <Button 
              className="bg-orange-700 text-xs ml-4" 
              onClick={createInvite}
            >
              Create Invite
            </Button>
          )}
          {isAuthenticated && (
            <Button 
              className="bg-orange-700 text-xs ml-2" 
              onClick={() => setGameState("leaderboard")}
            >
              Leaderboard
            </Button>
          )}
        </div>

        {/* Hearts/Lives and Power-ups in center */}
        <div className="flex items-center">
          {/* Lives display */}
          <div className="flex items-center">
             {[...Array(MAX_LIVES)].map((_, i) => (
                <span key={i} className={`mx-1 ${i < lives ? 'text-red-500' : 'text-gray-600'}`}>
                  {i < lives ? '❤️' : '🖤'}
                </span>
              ))}
              {lives > MAX_LIVES && <span className="ml-2 text-green-500 font-bold">+1</span>}
          </div>
          
        </div>

        {/* Level indicator and controls - right side */}
        <div className="flex items-center space-x-3 justify-end">
          <div className="bg-slate-800 text-orange-300 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold orbitron shadow-inner">
            LVL {level + 1} : {scenarioIndex + 1}/{scenarios?.length || 1}
          </div>
          {/* Fullscreen toggle button */}
          <button 
            className="text-slate-400 hover:text-orange-400 transition-colors duration-300 p-2 rounded-full hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
            onClick={() => {
              if (isFullscreen) {
                exitFullscreen();
              } else {
                enterFullscreen();
              }
            }}
          >
            <span className="material-symbols-outlined">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
          {/* Mute button */}
          <button 
            className="bg-slate-700 p-2 rounded-full text-orange-400 hover:bg-slate-600 hover:text-orange-300 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            onClick={() => {
              setIsMuted((prev) => !prev);
              // Mute/unmute all audio refs
              if (mainMusicRef.current) mainMusicRef.current.muted = !isMuted;
              if (congratsSoundRef.current) congratsSoundRef.current.muted = !isMuted;
              if (gameOverSoundRef.current) gameOverSoundRef.current.muted = !isMuted;
              if (powerUpSoundRef.current) powerUpSoundRef.current.muted = !isMuted;
              if (correctSoundRef.current) correctSoundRef.current.muted = !isMuted;
              if (partiallySoundRef.current) partiallySoundRef.current.muted = !isMuted;
              if (wrongSoundRef.current) wrongSoundRef.current.muted = !isMuted;
            }}
          >
            <span className="material-symbols-outlined">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-1 mb-1">
        <div 
          className="bg-orange-500 h-1 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${(scenarioIndex / (scenarios?.length || 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  )}
  {/* Audio control removed to prevent duplication */}
  
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
            className="flex flex-col items-center justify-center flex-grow text-center px-6 md:px-12"
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
              <span className="material-symbols-outlined mr-2">play_arrow</span>
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
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center flex-grow text-center px-6 md:px-12"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="md:w-3/4">
                <h1 className="text-4xl font-bold mb-4 text-white">Level {level + 1}: {story.levels[level].title}</h1>
                <p className="mb-4 text-white">{story.levels[level].intro_text || "Get ready for the next level!"}</p>
              </div>
              <div className="md:w-1/4">
                {story.levels[level].image ? (
                  <Image
                    src={story.levels[level].image}
                    alt={`Level ${level + 1}`}
                    className="mb-4 w-full max-w-xl rounded-lg"
                    width={300}
                    height={175}
                  />
                ) : (
                  <div className="mb-4 w-full max-w-xl rounded-lg bg-gray-600 flex items-center justify-center h-[175px]">
                    <p className="text-white">No Image Available</p>
                  </div>
                )}
              </div>
            </div>

            <Button 
              className="bg-orange-700" 
              onClick={playCurrentLevel}
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
                
                {!isAuthenticated && (
                  <GameAuthButtons 
                    level={level}
                    score={score}
                    lives={lives}
                    scenarioIndex={scenarioIndex}
                    variant="level-complete"
                  />
                )}
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
              
                {!isAuthenticated && (
                  <GameAuthButtons 
                    level={level}
                    score={score}
                    lives={lives}
                    scenarioIndex={scenarioIndex}
                    variant="game-end"
                  />
                )}
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
      
      {/* PowerUp Modal - Auto-applied (placed outside AnimatePresence for reliability) */}
      <AnimatePresence>
        {showPowerUpModal && earnedPowerUp && (
          <PowerUpModal
            powerUp={earnedPowerUp}
            isOpen={true}
            onClose={() => setShowPowerUpModal(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Power-ups are now shown next to the lives indicator */}
    </div>
  );
}
