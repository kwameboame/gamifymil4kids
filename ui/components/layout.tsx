import Header from './header'
import Link from 'next/link'
import Image from 'next/image'
import { AuthProvider } from '@/contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-between items-center">
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <h3 className="text-lg font-semibold mb-2">StorylineGame</h3>
                <p className="text-sm">Immersive adventures await!</p>
              </div>
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <h4 className="text-md font-semibold mb-2">Legal</h4>
                <ul className="text-sm">
                  <li><Link href="#" className="hover:text-gray-300">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-gray-300">Terms of Service</Link></li>
                </ul>
              </div>
              <div className="w-full md:w-1/3 p-6 bg-white">
                <h4 className="text-md font-semibold mb-2 text-black">Project Partners</h4>
                <div className="flex space-x-4">
                  {/* Replace with actual sponsor logos */}
                  <Image src="/images/ppblogo.png" alt="PenPlusBytes" width={100} />
                  <Image src="/images/aosf.jpg" alt="AOSF" width={100} />
                  {/* <Image src="/images/sponsor3.png" alt="Sponsor 3" width={50} height={50} /> */}
                </div>
              </div>
            </div>
            <div className="mt-8 text-center text-sm">
              <p>&copy; {new Date().getFullYear()} GamifyMil. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}