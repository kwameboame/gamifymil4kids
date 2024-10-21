'use client'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext' // We'll create this context

const navItems = [
  { href: '/game', label: 'Home' },
  { href: '/game', label: 'Play Game' },
  { href: '/profile', label: 'Profile' },
]

export default function Header() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="bg-purple-950">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/game" className="flex items-center">
          <Image src="/images/logo.png" alt="Logo" height={80} width={100} priority />
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <Button variant="ghost" asChild>
                  <Link href={href} className="text-white hover:text-orange-500">
                    {label}
                  </Link>
                </Button>
              </li>
            ))}
            {isAuthenticated !== undefined && (
              isAuthenticated ? (
                <li>
                  <Button variant="ghost" onClick={logout} className="text-white hover:text-orange-500">
                    Logout
                  </Button>
                </li>
              ) : (
                <>
                  <li>
                    <Button variant="ghost" asChild>
                      <Link href="/login" className="text-white hover:text-orange-500">
                        Login
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" asChild>
                      <Link href="/signup" className="text-white hover:text-orange-500">
                        Sign Up
                      </Link>
                    </Button>
                  </li>
                </>
              )
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}