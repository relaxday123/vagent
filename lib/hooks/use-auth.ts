"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/supabase/types"

export interface AuthUser extends User {
  roles: UserRole[]
  profile?: {
    full_name: string | null
    avatar_url: string | null
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        // Get user roles
        const { data: rolesData } = await supabase.rpc("get_user_roles", {
          user_uuid: authUser.id,
        })

        // Get user profile
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("full_name, avatar_url")
          .eq("user_id", authUser.id)
          .single()

        setUser({
          ...authUser,
          roles: rolesData?.map((r) => r.role as UserRole) || ["user"],
          profile: profileData || undefined,
        })
      } else {
        setUser(null)
      }

      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Refresh user data when signed in
        getUser()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const hasRole = (role: UserRole): boolean => {
    return user?.roles.includes(role) || false
  }

  const isAdmin = (): boolean => {
    return hasRole("admin")
  }

  return {
    user,
    loading,
    hasRole,
    isAdmin,
    signOut: () => supabase.auth.signOut(),
  }
}
