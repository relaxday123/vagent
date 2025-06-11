import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, twitterHandle, email } = await request.json()

    const supabase = createServerClient()

    // Check for existing identity matches
    const { data: existingMatches } = await supabase
      .from("identity_matches")
      .select("*")
      .or(`wallet_address.eq.${walletAddress},twitter_handle.eq.${twitterHandle}`)

    // Calculate confidence score based on various factors
    const confidenceScore = calculateIdentityConfidence({
      walletAddress,
      twitterHandle,
      email,
      existingMatches,
    })

    // Store identity match
    const { data: match, error } = await supabase.from("identity_matches").upsert({
      wallet_address: walletAddress,
      twitter_handle: twitterHandle,
      email,
      confidence_score: confidenceScore,
      verification_status: confidenceScore > 0.8 ? "verified" : "pending",
      matched_at: new Date().toISOString(),
    })

    if (error) throw error

    return NextResponse.json({ success: true, data: match, confidence: confidenceScore })
  } catch (error) {
    console.error("Identity matching error:", error)
    return NextResponse.json({ error: "Failed to match identity" }, { status: 500 })
  }
}

function calculateIdentityConfidence(data: any) {
  let confidence = 0.5 // Base confidence

  // Add confidence based on various factors
  if (data.email) confidence += 0.2
  if (data.twitterHandle && data.walletAddress) confidence += 0.2
  if (data.existingMatches?.length === 0) confidence += 0.1 // No conflicts

  return Math.min(confidence, 1.0)
}
