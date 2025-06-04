'use client'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext' // We'll create this context
import { useState, useEffect, useRef } from 'react'

const navItems = [
  { href: '/game', label: 'Home' },
  { href: '/game', label: 'Play Game' },
]

export default function Header() {
  const { isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-purple-950">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/game" className="flex items-center">
          <Image src="/images/logo.png" alt="Logo" height={80} width={100} priority />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
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
            {isAuthenticated && (
              <li>
                <Button variant="ghost" asChild>
                  <Link href="/profile" className="text-white hover:text-orange-500">
                    Profile
                  </Link>
                </Button>
              </li>
            )}
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
        
        {/* Mobile Navigation */}
        <div className="md:hidden relative" ref={menuRef}>
          <Button 
            variant="ghost" 
            className="text-white p-2" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="flex flex-col space-y-1">
              <span className="block w-5 h-0.5 bg-white"></span>
              <span className="block w-5 h-0.5 bg-white"></span>
              <span className="block w-5 h-0.5 bg-white"></span>
            </div>
          </Button>
          
          {mobileMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-purple-950 border border-purple-800 rounded-md shadow-lg z-50">
              <nav className="py-2">
                <ul className="flex flex-col">
                  {navItems.map(({ href, label }) => (
                    <li key={href}>
                      <Link 
                        href={href} 
                        className="block px-4 py-2 text-white hover:bg-purple-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                  {isAuthenticated && (
                    <li>
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-white hover:bg-purple-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </li>
                  )}
                  {isAuthenticated !== undefined && (
                    isAuthenticated ? (
                      <li>
                        <button 
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }} 
                          className="w-full text-left block px-4 py-2 text-white hover:bg-purple-800"
                        >
                          Logout
                        </button>
                      </li>
                    ) : (
                      <>
                        <li>
                          <Link 
                            href="/login" 
                            className="block px-4 py-2 text-white hover:bg-purple-800"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Login
                          </Link>
                        </li>
                        <li>
                          <Link 
                            href="/signup" 
                            className="block px-4 py-2 text-white hover:bg-purple-800"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </li>
                      </>
                    )
                  )}
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}