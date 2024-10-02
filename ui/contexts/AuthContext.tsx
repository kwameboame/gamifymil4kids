'use client';  // Add this line at the top of the file

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

type AuthContextType = {
  isAuthenticated: boolean
  login: (username_or_email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      try {
        await axios.get('http://localhost:8000/api/accounts/user/', {  // Ensure the correct endpoint
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
        localStorage.removeItem('authToken')
      }
    } else {
      setIsAuthenticated(false)
    }
  }

  const login = async (username_or_email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post('http://localhost:8000/api/accounts/login/', 
        { username_or_email, password }, 
        { 
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
          }
        }
      )
      const { access } = response.data as { access: string }  // Type assertion to resolve the error
      localStorage.setItem('authToken', access)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await axios.post('http://localhost:8000/api/accounts/logout/', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      localStorage.removeItem('authToken')
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8000/api/accounts/register/', 
        { username, email, password }, 
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
          }
        }
      )
      const { access } = response.data as { access: string }  // Type assertion to resolve the error
      localStorage.setItem('authToken', access)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}