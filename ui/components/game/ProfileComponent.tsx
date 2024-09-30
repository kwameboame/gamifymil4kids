"use client"
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

type UserProfile = {
  id: number;
  name: string;
  highScores: Record<string, number>;
  badges: { id: number; name: string; description: string; image: string }[];
};

// type ProfileComponentProps = {
//   profile: UserProfile;
// };

export function ProfileComponent({ profile }: { profile: UserProfile }) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"
    >
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={handleBack} className="mr-2">Back</Button>
        <h2 className="text-2xl font-bold">Player Profile</h2>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-2">Name</h3>
        <p>{profile.name}</p>
        <h3 className="text-xl font-semibold mb-2">Highest Scores</h3>
        <ul className="space-y-1">
          {Object.entries(profile.highScores).map(([game, score]) => (
            <li key={game} className="flex justify-between">{game}: {score}</li>
          ))}
        </ul>
        <h3 className="text-xl font-semibold mb-2">Badges</h3>
        <div className="flex flex-wrap gap-2">
          {profile.badges.map((badge, index) => (
            <span key={index} className="bg-white text-primary-foreground px-2 py-1 rounded-full text-sm">{badge.name}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
