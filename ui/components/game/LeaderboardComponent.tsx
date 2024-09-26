"use client"
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  name: string;
  score: number;
}

export function LeaderboardComponent({ leaderboard, onBack }: { leaderboard: LeaderboardEntry[], onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"
    >
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={onBack} className="mr-2">Back</Button>
        <h2 className="text-2xl font-bold">Leaderboard</h2>
      </div>
      {leaderboard.length > 0 ? (
        <ul className="space-y-2">
          {leaderboard.map((entry, index) => (
            <motion.li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <span className="font-semibold">{index + 1}. {entry.name}</span>
              <span className="text-primary">{entry.score}</span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-muted-foreground">No entries yet. Be the first to make the leaderboard!</p>
      )}
    </motion.div>
  );
}
