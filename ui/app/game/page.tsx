import Layout from '@/components/layout' // Import Layout
import { StorylineGame } from "@/components/game";

export default function GamePage() {
  return (
    <Layout> {/* Wrap StorylineGame in Layout */}
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <StorylineGame />
      </div>
    </Layout>
  )
}