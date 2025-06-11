import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { twitterHandle, walletAddress } = await request.json()

    // Mock Twitter crawling (in real implementation, use Twitter API)
    const twitterData = await mockCrawlTwitterData(twitterHandle)

    const supabase = createServerClient()

    // Store Twitter data
    await supabase.from("social_data").upsert({
      platform: "twitter",
      username: twitterHandle,
      wallet_address: walletAddress,
      profile_data: twitterData.profile,
      posts_data: twitterData.posts,
      sentiment_analysis: twitterData.sentiment,
      crawled_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, data: twitterData })
  } catch (error) {
    console.error("Twitter crawl error:", error)
    return NextResponse.json({ error: "Failed to crawl Twitter data" }, { status: 500 })
  }
}

async function mockCrawlTwitterData(handle: string) {
  return {
    profile: {
      username: handle,
      followers: Math.floor(Math.random() * 10000),
      following: Math.floor(Math.random() * 1000),
      verified: Math.random() > 0.7,
      accountAge: Math.floor(Math.random() * 2000) + 365,
      profileComplete: Math.random() > 0.3,
    },
    posts: Array.from({ length: 50 }, (_, i) => ({
      id: `tweet_${i}`,
      text: generateMockTweet(),
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 100),
      retweets: Math.floor(Math.random() * 50),
      replies: Math.floor(Math.random() * 20),
    })),
    sentiment: {
      overall: Math.random() > 0.5 ? "positive" : Math.random() > 0.5 ? "neutral" : "negative",
      confidence: Math.random(),
      cryptoMentions: Math.floor(Math.random() * 20),
      financialTerms: Math.floor(Math.random() * 15),
    },
  }
}

function generateMockTweet() {
  const tweets = [
    "Just bought some ETH! 🚀 #crypto #ethereum",
    "DeFi is the future of finance #DeFi #blockchain",
    "HODL strong! 💎🙌 #bitcoin #crypto",
    "Excited about the new NFT drop! #NFT #art",
    "Learning about smart contracts today #ethereum #coding",
  ]
  return tweets[Math.floor(Math.random() * tweets.length)]
}
