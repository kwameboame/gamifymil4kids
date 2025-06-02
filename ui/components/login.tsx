"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"

export type LoginProps = {
  onSubmit: (username_or_email: string, password: string) => void;
};

export default function Login({ onSubmit }: LoginProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { isLoading: authLoading } = useAuth()
  // const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!isMounted) return // Prevent running on server-side

    try {
      await onSubmit(usernameOrEmail, password)
      console.log('Login successful:', usernameOrEmail, password)
    } catch (error) {
      // Specify a more precise type for error
      console.error('Login error:', (error as { response?: { data?: { detail?: string } } })?.response?.data || (error as Error).message)
      setError((error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) return null // Prevent SSR issues

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div>
            <Label>Username or Email</Label>
            <Input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <br />
          <Button type="submit" disabled={isLoading || authLoading}>
            {(isLoading || authLoading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
