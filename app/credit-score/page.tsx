"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CreditDashboard } from "@/components/credit-dashboard"
import { CreditDashboardFallback } from "@/components/credit-dashboard-fallback"
import { useAuthContext } from "@/lib/context/auth-context"
import { Loader2 } from "lucide-react"

export default function CreditScorePage() {
  const { user, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Wait for auth to be checked
    if (!authLoading) {
      // If no user is found after auth check completes, redirect to login
      if (!user) {
        router.push("/auth/login")
      } else {
        // User is authenticated, stop loading
        setLoading(false)
      }
    }
  }, [user, authLoading, router])

  // Show loading state while checking authentication
  if (loading || authLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading credit dashboard...</p>
        </div>
      </div>
    )
  }

  // Use try-catch to handle potential errors with the CreditDashboard component
  try {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Credit Score Dashboard</h1>
        <CreditDashboard />
      </div>
    )
  } catch (err) {
    // If there's an error with the CreditDashboard component, use the fallback
    console.error("Error rendering CreditDashboard, using fallback:", err)
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Credit Score Dashboard</h1>
        <CreditDashboardFallback />
      </div>
    )
  }
}
