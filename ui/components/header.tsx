import Link from 'next/link'
import { Button } from "@/components/ui/button"
import Image from 'next/image'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/game', label: 'Play Game' },
  { href: '/profile', label: 'Profile' },
  { href: '/login', label: 'Login' },
  { href: '/signup', label: 'Sign Up' }
]

export default function Header() {
  return (
    <header className="bg-purple-950">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
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
          </ul>
        </nav>
      </div>
    </header>
  )
}