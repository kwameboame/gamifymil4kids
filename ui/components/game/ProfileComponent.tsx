"use client"
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

type UserProfile = {
  id: number;
  username?: string;
  name?: string;
  email?: string;
  highScores?: Record<string, number>;
  badges?: { id: number; name: string; description: string; image: string }[];
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
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg text-gray-800"
    >
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={handleBack} className="mr-2">Back</Button>
        <h2 className="text-2xl font-bold">Player Profile</h2>
      </div>
      <div className="space-y-4 text-gray-800">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">Name</h3>
        <p className="text-gray-800">{profile.username || profile.name || 'Unknown'}</p>
        
        {profile.email && (
          <>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Email</h3>
            <p className="text-gray-800">{profile.email}</p>
          </>
        )}
        
        {profile.highScores && Object.keys(profile.highScores).length > 0 && (
          <>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Highest Scores</h3>
            <ul className="space-y-1">
              {Object.entries(profile.highScores).map(([game, score]) => (
                <li key={game} className="flex justify-between text-gray-800">{game}: {score}</li>
              ))}
            </ul>
          </>
        )}
        
        {profile.badges && profile.badges.length > 0 && (
          <>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge, index) => (
                <span key={index} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm shadow-md">
                  {badge.name}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
