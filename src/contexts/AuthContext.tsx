
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { lumi } from '../lib/lumi'

interface User {
  projectId: string
  userId: string
  email: string
  userName: string
  userRole: 'ADMIN' | 'USER'
  createdTime: string
  accessToken: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão existente
    const checkSession = () => {
      const existingUser = lumi.auth.user
      const isLoggedIn = lumi.auth.isAuthenticated

      if (isLoggedIn && existingUser) {
        setUser(existingUser)
      }
      setIsLoading(false)
    }

    checkSession()

    // Escutar mudanças de estado
    const unsubscribe = lumi.auth.onAuthChange((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async () => {
    try {
      setIsLoading(true)
      await lumi.auth.signIn()
      // Force refresh user data after sign in
      const currentUser = lumi.auth.user
      if (currentUser) {
        setUser(currentUser)
        console.log('✅ User logged in:', currentUser.email)
        console.log('✅ Is Admin:', currentUser.userRole === 'ADMIN' || currentUser.email === 'guillenchristian173@gmail.com')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await lumi.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  const isAdmin = user?.userRole === 'ADMIN' || user?.email === 'guillenchristian173@gmail.com'

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
