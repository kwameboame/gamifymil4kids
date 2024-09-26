"use client"
import { ArrowLeft, Trophy, AlertCircle } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Confetti from "react-confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from 'next/navigation'

const storyline = [
  {
    prompt: "You find a mysterious door in the forest. What do you do?",
    actions: [
      { text: "Open the door", correct: true },
      { text: "Walk away", correct: false },
      { text: "Knock on the door", correct: false },
    ],
  },
  {
    prompt: "Inside, you see a glowing artifact. How do you proceed?",
    actions: [
      { text: "Touch the artifact", correct: false },
      { text: "Examine it closely", correct: true },
      { text: "Ignore it and explore further", correct: false },
    ],
  },
  {
    prompt: "A guardian appears and asks for the password. What do you say?",
    actions: [
      { text: "Say 'Open Sesame'", correct: false },
      { text: "Remain silent", correct: true },
      { text: "Try to run past the guardian", correct: false },
    ],
  },
]

type GameState = "start" | "playing" | "end" | "gameover" | "leaderboard" | "profile"

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
  const [gameState, setGameState] = useState<GameState>("start")
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Player",
    highScores: {
      "Forest Adventure": 0,
      "Space Odyssey": 0,
      "Time Traveler": 0,
    },
    badges: ["Novice Explorer", "Quick Thinker"],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null); // Store main audio instance
  const gameOverAudioRef = useRef<HTMLAudioElement | null>(null); // Store game over audio instance
  const congratsAudioRef = useRef<HTMLAudioElement | null>(null); // Store congrats audio instance

  useEffect(() => {
    const storedLeaderboard = localStorage.getItem("leaderboard")
    if (storedLeaderboard) {
      setLeaderboard(JSON.parse(storedLeaderboard))
    }

    const storedProfile = localStorage.getItem("userProfile")
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile))
    }

    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const handleStart = () => {
    setGameState("playing")
    setScore(0)
    setLevel(0)
    setIsGameStarted(true)
    
    // Request fullscreen for the game area
    const gameArea = document.getElementById("game-area");
    if (gameArea?.requestFullscreen) {
      gameArea.requestFullscreen();
    }

    // Start main audio playback or restart if already playing
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/sound.mp3");
      audioRef.current.loop = true;
    }
    audioRef.current.play().catch(error => console.error("Audio playback failed:", error));
  }

  // Function to handle game over
  const handleGameOver = () => {
    setGameState("gameover");
    audioRef.current?.pause(); // Pause main audio
    if (!gameOverAudioRef.current) {
      gameOverAudioRef.current = new Audio("/audio/GameOver.wav");
    }
    gameOverAudioRef.current.play().catch(error => console.error("Game over audio playback failed:", error));
  }

  // Function to show confetti
  const showConfettiEffect = () => {
    setShowConfetti(true);
    if (!congratsAudioRef.current) {
      congratsAudioRef.current = new Audio("/audio/congrats.mp3");
    }
    congratsAudioRef.current.play().catch(error => console.error("Congrats audio playback failed:", error));
  }

  // Add a function to exit fullscreen
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  const handleAction = (correct: boolean) => {
    if (correct) {
      setScore((prevScore) => prevScore + 10)
    } else {
      setScore((prevScore) => prevScore - 5)
    }

    if (score < 0) {
      handleGameOver();
    } else if (level < storyline.length - 1) {
      setLevel((prevLevel) => prevLevel + 1)
    } else {
      if (score > 0) {
        showConfettiEffect();
        setTimeout(() => setShowConfetti(false), 5000)
      }
      setGameState("end")
    }

    // Restart audio when an action is taken
    audioRef.current?.play();
  }

  const handleSubmitScore = () => {
    if (playerName && score > 0) {
      const newLeaderboard = [...leaderboard, { name: playerName, score }]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
      setLeaderboard(newLeaderboard)
      localStorage.setItem("leaderboard", JSON.stringify(newLeaderboard))

      // Update user profile
      const updatedProfile = { ...userProfile }
      updatedProfile.name = playerName
      if (score > (updatedProfile.highScores["Forest Adventure"] || 0)) {
        updatedProfile.highScores["Forest Adventure"] = score
      }
      setUserProfile(updatedProfile)
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile))

      setPlayerName("")
      setGameState("leaderboard")
    }

    // Restart audio when submitting score
    audioRef.current?.play();
  }

  return (
    <div className="w-full max-w-3xl p-4" id="game-area"> {/* Added id for fullscreen */}
      {isGameStarted && (
        <div className="w-full mb-4 flex items-center bg-gray-800 p-2 rounded-lg">
          <Button 
            variant="ghost" 
            onClick={exitFullscreen} 
            aria-label="Exit Fullscreen" 
            className="bg-gray-700 hover:bg-gray-600 text-white mr-auto"
          >
            Exit Fullscreen
          </Button> {/* Close button for fullscreen */}
          
          <motion.div
            className="mt-6 text-xl font-bold text-center flex-grow"
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
            {(gameState === "start" || gameState === "playing" || gameState === "end" || gameState === "gameover") && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center">Forest Adventure</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    {gameState === "start" && (
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
                        <p className="text-lg mb-4">
                          Embark on a mysterious journey through an enchanted forest. Make wise choices to progress and earn points. Be careful, wrong choices will cost you points! Are you ready for the adventure?
                        </p>
                        <div className="space-y-2">
                          <Button className="w-full text-lg py-3" onClick={handleStart}>
                            Start Game
                          </Button>
                          <Button className="w-full text-lg py-3" variant="outline" onClick={() => setGameState("leaderboard")}>
                            View Leaderboard
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {gameState === "playing" && (
                      <motion.div
                        key="playing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="mb-6">
                          <Image
                            src="/images/placeholder.png"
                            alt="Story scene"
                            width={600}
                            height={300}
                            className="rounded-lg w-full h-64 object-cover"
                          />
                        </div>
                        <p className="text-lg mb-4">{storyline[level].prompt}</p>
                        <div className="grid gap-3">
                          {storyline[level].actions.map((action, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <Button
                                variant="outline"
                                className="w-full text-left justify-start"
                                onClick={() => handleAction(action.correct)}
                              >
                                {action.text}
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {gameState === "end" && (
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
                          <Button className="w-full" variant="outline" onClick={() => setGameState("leaderboard")}>
                            View Leaderboard
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {gameState === "gameover" && (
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
                          <Button className="w-full" variant="outline" onClick={() => setGameState("leaderboard")}>
                            View Leaderboard
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {gameState === "leaderboard" && (
              <LeaderboardComponent
                leaderboard={leaderboard}
                onBack={() => setGameState("start")}
              />
            )}
          </>
        )}
      </AnimatePresence>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
    </div>
  )
}