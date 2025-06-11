"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth, type AuthUser } from "@/lib/hooks/use-auth"
import type { UserRole } from "@/lib/supabase/types"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: () => boolean
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
