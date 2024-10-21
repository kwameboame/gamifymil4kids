import Layout from '@/components/layout'
import { ProfileComponent } from '@/components/storyline-game'

export default function ProfilePage() {
  // In a real application, you would fetch the user's profile data here
  const userProfile = {
    name: "Player",
    highScores: {
      "Forest Adventure": 100,
      "Space Odyssey": 80,
      "Time Traveler": 90,
    },
    badges: ["Novice Explorer", "Quick Thinker", "Master Adventurer"],
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b flex items-center justify-center py-12">
        <ProfileComponent profile={userProfile} />
      </div>
    </Layout>
  )
}