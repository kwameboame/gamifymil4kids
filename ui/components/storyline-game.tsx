"use client"
import { ArrowLeft, Trophy, AlertCircle } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Confetti from "react-confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Story {
  id: number;
  title: string;
  description: string;
  levels: Level[];
  scenarios: Scenario[];
}

interface Level {
  id: number;
  title: string;
  intro_text: string;
  image: string;
  order: number;
  story: number;
}

interface Scenario {
  id: number;
  story: number;
  level: number;
  description: string;
  image: string;
  order: number;
  actions: Action[];
}

interface Action {
  id: number;
  text: string;
  is_correct: boolean;
  points: number;
  outcome: {
    id: number;
    text: string;
  };
}

interface LeaderboardEntry {
  name: string
  score: number
}

interface UserProfile {
  name: string
  highScores: {
    [key: string]: number
  }
  badges: string[]
}

// Define all possible game states
type GameState = 'start' | 'playing' | 'outcome' | 'end' | 'gameover' | 'leaderboard' | 'level-intro' | 'level-complete'

function LeaderboardComponent({ leaderboard, onBack }: { leaderboard: LeaderboardEntry[], onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"
    >
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Leaderboard</h2>
      </div>
      {leaderboard.length > 0 ? (
        <ul className="space-y-2">
          {leaderboard.map((entry, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex justify-between items-center bg-gray-100 p-2 rounded"
            >
              <span className="font-semibold">{index + 1}. {entry.name}</span>
              <span className="text-primary">{entry.score}</span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-muted-foreground">No entries yet. Be the first to make the leaderboard!</p>
      )}
    </motion.div>
  )
}

function AudioControl({ isGameStarted }: { isGameStarted: boolean }) {
  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (isGameStarted && !audioRef.current) {
      audioRef.current = new Audio("/audio/sound.mp3")
      audioRef.current.loop = true
      audioRef.current.volume = volume
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [isGameStarted, volume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
      if (isPlaying && !muted) {
        audioRef.current.play().catch(error => console.error("Audio playback failed:", error))
      } else {
        audioRef.current.pause()
      }
    }
  }, [volume, muted, isPlaying])

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    setMuted(false);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0];
    }
  };
  

  const toggleMute = () => {
    setMuted((prev) => {
      const newMutedState = !prev;
      if (audioRef.current) {
        if (newMutedState) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch((error) => {
            console.error("Audio playback failed:", error);
          });
        }
      }
      return newMutedState;
    });
  };
  

  if (!isGameStarted) return null;

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
      <Slider
        className="w-24"
        value={[muted ? 0 : volume]}
        max={1}
        step={0.01}
        onValueChange={handleVolumeChange}
        aria-label="Adjust volume"
      />
    </div>
  )
}

export function ProfileComponent({ profile }: { profile: UserProfile }) {
  const router = useRouter()

  const handleBack = () => {
    router.push('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"
    >
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={handleBack} className="mr-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Player Profile</h2>
      </div>
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-2">Name</h3>
          <p>{profile.name}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-xl font-semibold mb-2">Highest Scores</h3>
          <ul className="space-y-1">
            {Object.entries(profile.highScores).map(([game, score], index) => (
              <motion.li
                key={game}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                className="flex justify-between"
              >
                <span>{game}</span>
                <span>{score}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold mb-2">Badges</h3>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((badge, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                className="bg-white text-primary-foreground px-2 py-1 rounded-full text-sm"
              >
                {badge}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function StorylineGame() {
  const [gameState, setGameState] = useState<GameState>('start')
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(0)
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [story, setStory] = useState<Story | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [currentLevelScenarios, setCurrentLevelScenarios] = useState<Scenario[]>([])

  // DEBUG: Log level, scenarioIndex, and currentLevelScenarios whenever they change
  useEffect(() => {
    console.log('[DEBUG] Level:', level, 'ScenarioIndex:', scenarioIndex, 'GameState:', gameState)
    if (story && story.scenarios && story.levels && story.levels[level]) {
      const levelId = story.levels[level].id;
      const scenariosForLevel = story.scenarios.filter((s: Scenario) => s.level === levelId).sort((a: Scenario, b: Scenario) => a.order - b.order);
      setCurrentLevelScenarios(scenariosForLevel);
      console.log('[DEBUG] Updated currentLevelScenarios for level', level, scenariosForLevel);
    }
  }, [level, story, gameState, scenarioIndex]);
  
  // Debug function to help troubleshoot level transitions
  const debugLevelTransition = () => {
    if (story) {
      console.log("=== DEBUGGING LEVEL TRANSITION ===");
      console.log("Current level index:", level);
      console.log("Current level data:", story.levels[level]);
      
      if (level + 1 < story.levels.length) {
        console.log("Next level index:", level + 1);
        console.log("Next level data:", story.levels[level + 1]);
        
        // Get scenarios for next level
        const nextLevelId = story.levels[level + 1].id;
        const nextLevelScenarios = story.scenarios
          .filter(s => s.level === nextLevelId)
          .sort((a, b) => a.order - b.order);
        
        console.log("Next level ID:", nextLevelId);
        console.log("Scenarios for next level:", nextLevelScenarios);
        console.log("Scenarios count for next level:", nextLevelScenarios.length);
      } else {
        console.log("No next level available - at last level");
      }
      
      console.log("Current level scenarios:", currentLevelScenarios);
      console.log("Current scenario index:", scenarioIndex);
      console.log("Current game state:", gameState);
      console.log("=== END DEBUG ===");
    } else {
      console.error("Cannot debug: story is null");
    }
  }
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const gameOverAudioRef = useRef<HTMLAudioElement | null>(null)
  const congratsAudioRef = useRef<HTMLAudioElement | null>(null)
  const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_URL

  const fetchStory = useCallback(async () => {
    try {
      const response = await axios.get<Story>(`${backendBaseURL}/game/stories/3/`)
      setStory(response.data)
      // Initialize with appropriate level's scenarios based on restored progress
      if (response.data?.scenarios) {
        const progressData = localStorage.getItem('gameProgress')
        let targetLevel = 0
        
        if (progressData) {
          try {
            const progress = JSON.parse(progressData)
            if (progress.story === 3) {
              targetLevel = progress.level || 0
              
              // Set game state to playing if we have stored progress
              if (progress.level >= 0) {
                setGameState('playing')
              }
            }
          } catch (error) {
            console.error('Error parsing stored progress:', error)
          }
        }
        
        // Get scenarios for the current level
        const levelScenarios = response.data.scenarios
          .filter((s: Scenario) => s.level === response.data.levels[targetLevel]?.id)
          .sort((a: Scenario, b: Scenario) => a.order - b.order)
          
        setCurrentLevelScenarios(levelScenarios)
      }
    } catch (error) {
      console.error('Error fetching story:', error)
    } finally {
      setIsLoading(false)
    }
  }, [backendBaseURL])

  useEffect(() => {
    fetchStory()
    
    const storedLeaderboard = localStorage.getItem('leaderboard')
    if (storedLeaderboard) {
      setLeaderboard(JSON.parse(storedLeaderboard))
    }

    const storedProfile = localStorage.getItem('userProfile')
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile))
    }
    
    // Restore game progress if available
    const storedProgress = localStorage.getItem('gameProgress')
    if (storedProgress) {
      try {
        const progress = JSON.parse(storedProgress)
        if (progress.story === 3) { // Only restore if it's the Truth Quest game (id=3)
          setLevel(progress.level || 0)
          setScenarioIndex(progress.scenarioIndex || 0)
          setScore(progress.score || 0)
          setIsGameStarted(true)
          // Don't set the gameState yet - wait for story data to load first
        }
      } catch (error) {
        console.error('Error parsing stored game progress:', error)
      }
    }
  }, [fetchStory])

  const handleStart = () => {
    setGameState('playing')
    setScore(0)
    setLevel(0)
    setScenarioIndex(0)
    setShowConfetti(false)
    setPlayerName('')
    setSelectedAction(null)
    setIsGameStarted(true)
    
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/sound.mp3')
      audioRef.current.loop = true
    }
    audioRef.current.play().catch(error => console.error('Audio playback failed:', error))
    fetchStory()
  }

  const handleAction = (action: Action) => {
    console.log('handleAction called with action:', action)
    console.log('action.outcome:', action.outcome)
    setSelectedAction(action)
    const newScore = score + action.points
    setScore(Math.max(0, newScore))
    console.log('Setting gameState to outcome')
    setGameState('outcome')

    // Save game progress to localStorage to persist between sessions
    const gameProgress = {
      level,
      scenarioIndex,
      score: Math.max(0, newScore),
      story: story?.id
    }
    localStorage.setItem('gameProgress', JSON.stringify(gameProgress))

    if (newScore < 0) {
      handleGameOver()
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(error => console.error('Audio playback failed:', error))
      }
    }
  }

  const handleContinue = () => {
    console.log('=== HANDLE CONTINUE DEBUG ===');
    console.log('currentLevelScenarios:', currentLevelScenarios);
    console.log('currentLevelScenarios.length:', currentLevelScenarios.length);
    console.log('scenarioIndex:', scenarioIndex);
    console.log('isLastScenarioInLevel:', scenarioIndex === currentLevelScenarios.length - 1);
    
    if (!story) {
      console.log('No story found')
      return
    }
  
    setSelectedAction(null)
    
    // Get fresh scenarios to ensure we have current data
    const levelId = story.levels[level].id;
    const levelScenarios = story.scenarios
      .filter((s: Scenario) => s.level === levelId)
      .sort((a: Scenario, b: Scenario) => a.order - b.order);
    
    console.log('[DEBUG] Fresh level scenarios:', levelScenarios.length);
    
    // Use fresh data instead of state
    const isLastScenarioInLevel = scenarioIndex === levelScenarios.length - 1;
    
    if (!isLastScenarioInLevel) {
      setScenarioIndex(scenarioIndex + 1);
      setGameState('playing');
      console.log('[DEBUG] Moving to next scenario:', scenarioIndex + 1);
    } else {
      showConfettiEffect();
      setGameState('level-complete');
      console.log('[DEBUG] Level complete! Moving to level-complete screen');
    }
  }

  const handleStartNextLevel = () => {
    console.log('[DEBUG] Starting next level');
    
    // Check if story exists
    if (!story) {
      console.error('[ERROR] Cannot start next level: story is null');
      return;
    }
    
    // Check if there are more levels
    if (level < story.levels.length - 1) {
      const nextLevel = level + 1;
      
      // Get scenarios for the next level
      const nextLevelScenarios = story.scenarios
        .filter((s: Scenario) => s.level === story.levels[nextLevel].id)
        .sort((a: Scenario, b: Scenario) => a.order - b.order);
      
      console.log('[DEBUG] Next level scenarios:', nextLevelScenarios);
      
      // Update level and reset scenario index
      setLevel(nextLevel);
      setScenarioIndex(0);
      setSelectedAction(null);
      
      // Move to next level intro
      setGameState('level-intro');
    } else {
      // End of game
      showConfettiEffect();
      setGameState('end');
    }
  }

  const handleGameOver = () => {
    setGameState('gameover')
    audioRef.current?.pause()
    if (!gameOverAudioRef.current) {
      gameOverAudioRef.current = new Audio('/audio/GameOver.wav')
    }
    gameOverAudioRef.current.play().catch(error => console.error('Game over audio playback failed:', error))
  }
  
  const showConfettiEffect = () => {
    setShowConfetti(true)
    if (!congratsAudioRef.current) {
      congratsAudioRef.current = new Audio('/audio/congrats.mp3')
    }
    congratsAudioRef.current.play().catch(error => console.error('Congrats audio playback failed:', error))
  }

  const exitFullscreen = () => {
    if (document && document.exitFullscreen) {
      document.exitFullscreen().catch(console.error)
    }
  }

  const handleSubmitScore = () => {
    if (playerName && score > 0) {
      const newLeaderboard = [...leaderboard, { name: playerName, score }]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
      setLeaderboard(newLeaderboard)
      localStorage.setItem('leaderboard', JSON.stringify(newLeaderboard))

      const updatedProfile: UserProfile = userProfile || {
        name: playerName,
        highScores: {},
        badges: []
      }
      
      updatedProfile.name = playerName
      if (score > (updatedProfile.highScores["Forest Adventure"] || 0)) {
        updatedProfile.highScores["Forest Adventure"] = score
      }
      setUserProfile(updatedProfile)
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile))

      setPlayerName('')
      setGameState('leaderboard')
    }

    audioRef.current?.play()
  }

  useEffect(() => {
    console.log('Current gameState:', gameState)
    console.log('Selected action:', selectedAction)
  }, [gameState, selectedAction])

  return (
    <div className="w-full max-w-3xl p-4" id="game-area">
      {showConfetti && <Confetti />}
      
      {isGameStarted && (
        <div className="w-full mb-4 flex items-center bg-gray-800 p-2 rounded-lg">
          <Button 
            variant="ghost" 
            onClick={exitFullscreen}
            className="bg-gray-700 hover:bg-gray-600 text-white mr-auto"
          >
            Exit Fullscreen
          </Button>
          
          <motion.div
            className="text-xl font-bold text-center text-white flex-grow"
            key={score}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
          >
            Score: {score}
          </motion.div>

          <div className="flex items-center ml-auto">
            <AudioControl isGameStarted={isGameStarted} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-64"
          >
            <Loader2 className="w-8 h-8 animate-spin" />
          </motion.div>
        ) : (
          <>
            {story && (gameState === 'start' || gameState === 'playing' || gameState === 'outcome' || gameState === 'end' || gameState === 'level-intro' || gameState === 'level-complete' || gameState === 'gameover') && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center">{story.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    {gameState === 'start' && (
                      <motion.div
                        key="start"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Image
                          src="/images/placeholder.png"
                          alt="Game start scene"
                          width={600}
                          height={300}
                          className="rounded-lg w-full h-64 object-cover mb-6"
                        />
                        <p className="text-lg mb-4">{story.description}</p>
                        <div className="space-y-2">
                          <Button className="w-full text-lg py-3" onClick={handleStart}>
                            Start Game
                          </Button>
                          <Button className="w-full text-lg py-3" variant="outline" onClick={() => setGameState('leaderboard')}>
                            View Leaderboard
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {gameState === 'playing' && story.levels[level] && currentLevelScenarios[scenarioIndex] && (
                      <motion.div
                        key="playing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="mb-6">
                          <Image
                            src={currentLevelScenarios[scenarioIndex].image || '/images/placeholder.png'}
                            alt="Story scene"
                            width={600}
                            height={300}
                            className="rounded-lg w-full h-64 object-cover"
                          />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Level {level + 1}: {story.levels[level].title}</h3>
                        <p className="text-lg mb-4">{currentLevelScenarios[scenarioIndex].description}</p>
                        <div className="grid gap-3">
                          {currentLevelScenarios[scenarioIndex].actions.map((action, index) => (
                            <motion.div
                              key={action.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <Button
                                variant="outline"
                                className="w-full text-left justify-start"
                                onClick={() => handleAction(action)}
                              >
                                {action.text}
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {gameState === 'outcome' && selectedAction && (
                      <motion.div
                        key="outcome"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                          <h3 className="text-xl font-semibold mb-4">Outcome</h3>
                          <p className="text-lg mb-4">{selectedAction.outcome.text}</p>
                          <div className={`text-lg font-semibold ${selectedAction.points >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {selectedAction.points > 0 ? `+${selectedAction.points}` : selectedAction.points} points
                          </div>
                        </div>
                        <Button 
                          className="w-full text-lg py-3" 
                          onClick={handleContinue}
                        >
                          {scenarioIndex < currentLevelScenarios.length - 1
                            ? "Continue to Next Scene"
                            : "Finish Level"
                          }
                        </Button>
                      </motion.div>
                    )}

                    {gameState === 'level-intro' && story && story.levels && story.levels[level] && (
                      <motion.div
                        key="level-intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                          <h3 className="text-xl font-semibold mb-4">Level {level + 1}: {story.levels[level].title}</h3>
                          <p className="text-lg mb-4">{story.levels[level].intro_text}</p>
                        </div>
                        <Button 
                          className="w-full text-lg py-3" 
                          onClick={() => {
                            // Start playing the current level
                            setGameState('playing');
                            console.log('[DEBUG] Starting level with index:', level, 'and ID:', story.levels[level].id);
                          }}
                        >
                          Start Level
                        </Button>
                      </motion.div>
                    )}

                    {(gameState as GameState) === 'level-complete' && (
                      <motion.div
                        key="level-complete"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                          <motion.div
                            className="flex justify-center mb-4"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Trophy className="w-16 h-16 text-yellow-400" />
                          </motion.div>
                          <h3 className="text-xl font-semibold mb-4 text-center">Level {level + 1} Completed!</h3>
                          <p className="text-lg mb-4 text-center">Congratulations! You&apos;ve completed Level {level + 1} with a current score of {score}.</p>
                          {/* Debug button - only visible during development */}
                          {process.env.NODE_ENV === 'development' && (
                            <Button variant="outline" size="sm" onClick={debugLevelTransition} className="mt-2">
                              Debug Level Data
                            </Button>
                          )}
                        </div>
                        <Button 
                          className="w-full text-lg py-3" 
                          onClick={handleStartNextLevel}
                        >
                          Continue to Next Level
                        </Button>
                      </motion.div>
                    )}

                    {gameState === 'end' && (
                      <motion.div
                        key="end"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h2 className="text-2xl font-bold mb-4 text-center">Adventure Complete!</h2>
                        {score > 0 ? (
                          <>
                            <motion.div
                              className="flex justify-center mb-4"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Trophy className="w-16 h-16 text-yellow-400" />
                            </motion.div>
                            <p className="text-lg mb-4 text-center">Congratulations! You&apos;ve completed the adventure with a score of {score}!</p>
                            <div className="mb-6">
                              <Input
                                type="text"
                                placeholder="Enter your name"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="mb-2"
                              />
                              <Button className="w-full" onClick={handleSubmitScore}>
                                Submit Score
                              </Button>
                            </div>
                          </>
                        ) : (
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <p className="text-lg mb-4 text-center">Oh no! You&apos;ve completed the adventure, but your final score is 0. Better luck next time!</p>
                          </motion.div>
                        )}
                        <div className="space-y-2">
                          <Button className="w-full" onClick={handleStart}>
                            Play Again
                          </Button>
                          <Button className="w-full" variant="outline" onClick={() => setGameState('leaderboard')}>
                            View Leaderboard
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {gameState === 'gameover' && (
                      <motion.div
                        key="gameover"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="flex justify-center mb-4"
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                        >
                          <AlertCircle className="w-16 h-16 text-red-500" />
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-4 text-center">Game Over!</h2>
                        <p className="text-lg mb-4 text-center">Your score dropped below 0. The forest adventure has come to an end.</p>
                        <div className="space-y-2">
                          <Button className="w-full" onClick={handleStart}>
                            Try Again
                          </Button>
                          <Button className="w-full" variant="outline" onClick={() => setGameState('leaderboard')}>
                            View Leaderboard
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {gameState === 'leaderboard' && (
              <LeaderboardComponent
                leaderboard={leaderboard}
                onBack={() => setGameState('start')}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}