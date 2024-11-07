import Layout from '@/components/layout'
import Link from 'next/link'
// import Image from 'next/image'
import { Button } from "@/components/ui/button"

// const games = [
//   { title: 'Space Odyssey', image: '/images/space-odyssey.jpg' },
//   { title: 'Time Traveler', image: '/images/time-traveler.jpg' },
//   { title: 'Mystery Manor', image: '/images/mystery-manor.jpg' },
// ]

export default function HomePage() {
  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <div 
          className="relative flex items-center justify-center py-20"
          style={{
            backgroundImage: 'url("/images/placeholder.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
            <h1 className="text-5xl font-bold mb-6 text-white">Play Truth Quest</h1>
            <p className="text-xl mb-8 text-white">Embark on an Media Information Literacy (MIL) adventure with Adjoa</p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-white">
              <Link href="/game">Play Game</Link>
            </Button>
          </div>
        </div>

        {/* Other Games Section */}
        {/* <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Explore Other Adventures</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {games.map((game, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <Image 
                    src={game.image} 
                    alt={game.title} 
                    width={300} 
                    height={200} 
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                  <h3 className="text-xl font-semibold mb-2">{game.title}</h3>
                  <p className="text-gray-600 mb-4">Embark on a thrilling journey in this exciting adventure!</p>
                  <Button asChild variant="outline">
                    <Link href={`/game/${game.title.toLowerCase().replace(' ', '-')}`}>Learn More</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section> */}
      </div>
    </Layout>
  )
}