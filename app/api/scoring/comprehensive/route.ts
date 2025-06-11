import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { identifier, type } = await request.json() // identifier can be wallet or twitter handle

    const supabase = createServerClient()

    // Get comprehensive data based on identifier type
    let walletAddress = identifier
    let twitterHandle = identifier

    if (type === "wallet") {
      // Find associated social accounts
      const { data: identity } = await supabase
        .from("identity_matches")
        .select("twitter_handle")
        .eq("wallet_address", identifier)
        .single()
      twitterHandle = identity?.twitter_handle
    } else if (type === "twitter") {
      // Find associated wallet
      const { data: identity } = await supabase
        .from("identity_matches")
        .select("wallet_address")
        .eq("twitter_handle", identifier)
        .single()
      walletAddress = identity?.wallet_address
    }

    // Fetch all relevant data
    const [blockchainData, socialData, existingScore] = await Promise.all([
      fetchBlockchainData(supabase, walletAddress),
      fetchSocialData(supabase, twitterHandle),
      fetchExistingScore(supabase, walletAddress),
    ])

    // Calculate comprehensive credit score
    const comprehensiveScore = calculateComprehensiveScore({
      blockchain: blockchainData,
      social: socialData,
      existing: existingScore,
    })

    // Store the new score
    await supabase.from("comprehensive_scores").upsert({
      wallet_address: walletAddress,
      twitter_handle: twitterHandle,
      score: comprehensiveScore.score,
      breakdown: comprehensiveScore.breakdown,
      confidence: comprehensiveScore.confidence,
      calculated_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: {
        score: comprehensiveScore.score,
        breakdown: comprehensiveScore.breakdown,
        confidence: comprehensiveScore.confidence,
        walletAddress,
        twitterHandle,
      },
    })
  } catch (error) {
    console.error("Comprehensive scoring error:", error)
    return NextResponse.json({ error: "Failed to calculate comprehensive score" }, { status: 500 })
  }
}

async function fetchBlockchainData(supabase: any, walletAddress: string) {
  if (!walletAddress) return null

  const { data } = await supabase.from("blockchain_data").select("*").eq("wallet_address", walletAddress)

  return data
}

async function fetchSocialData(supabase: any, twitterHandle: string) {
  if (!twitterHandle) return null

  const { data } = await supabase.from("social_data").select("*").eq("username", twitterHandle).single()

  return data
}

async function fetchExistingScore(supabase: any, walletAddress: string) {
  if (!walletAddress) return null

  const { data } = await supabase
    .from("credit_scores")
    .select("*")
    .eq("user_id", walletAddress)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .single()

  return data
}

function calculateComprehensiveScore(data: any) {
  let score = 300 // Base score
  let confidence = 0.5

  const breakdown = {
    blockchain: 0,
    social: 0,
    identity: 0,
    risk: 0,
  }

  // Blockchain scoring (40% weight)
  if (data.blockchain?.length > 0) {
    const blockchainScore = calculateBlockchainScore(data.blockchain)
    breakdown.blockchain = blockchainScore
    score += blockchainScore * 0.4 * 5.5 // Scale to 300-850 range
    confidence += 0.3
  }

  // Social scoring (30% weight)
  if (data.social) {
    const socialScore = calculateSocialScore(data.social)
    breakdown.social = socialScore
    score += socialScore * 0.3 * 5.5
    confidence += 0.2
  }

  // Identity verification (20% weight)
  const identityScore = data.blockchain && data.social ? 100 : 50
  breakdown.identity = identityScore
  score += identityScore * 0.2 * 5.5
  if (identityScore === 100) confidence += 0.2

  // Risk assessment (10% weight)
  const riskScore = 85 // Mock risk score
  breakdown.risk = riskScore
  score += riskScore * 0.1 * 5.5

  return {
    score: Math.min(850, Math.max(300, Math.round(score))),
    breakdown,
    confidence: Math.min(1.0, confidence),
  }
}

function calculateBlockchainScore(blockchainData: any[]) {
  // Aggregate scores across all blockchains
  let totalScore = 0
  let totalWeight = 0

  blockchainData.forEach((chain) => {
    const chainScore =
      (chain.transaction_data?.length || 0) * 0.5 +
      (chain.balance || 0) * 2 +
      ((new Date().getTime() - new Date(chain.first_transaction).getTime()) / (365 * 24 * 60 * 60 * 1000)) * 10

    totalScore += Math.min(100, chainScore)
    totalWeight += 1
  })

  return totalWeight > 0 ? totalScore / totalWeight : 0
}

function calculateSocialScore(socialData: any) {
  if (!socialData) return 0

  const profile = socialData.profile_data || {}
  const sentiment = socialData.sentiment_analysis || {}

  let score = 0

  // Profile completeness and credibility
  score += (profile.followers || 0) / 100 // Up to 100 points for 10k followers
  score += profile.verified ? 20 : 0
  score += ((profile.accountAge || 0) / 365) * 10 // Up to 10 points per year

  // Sentiment and content quality
  if (sentiment.overall === "positive") score += 15
  else if (sentiment.overall === "neutral") score += 10
  else score += 5

  score += (sentiment.cryptoMentions || 0) * 0.5 // Crypto engagement

  return Math.min(100, score)
}
