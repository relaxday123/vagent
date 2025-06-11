import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, blockchains } = await request.json()

    // Mock blockchain crawling service
    const crawlResults = await Promise.all(
      blockchains.map(async (blockchain: string) => {
        // Simulate crawling different blockchains
        return {
          blockchain,
          walletAddress,
          transactions: await mockCrawlTransactions(walletAddress, blockchain),
          balance: Math.random() * 100,
          firstTransaction: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          lastTransaction: new Date().toISOString(),
        }
      }),
    )

    const supabase = createServerClient()

    // Store crawled data
    for (const result of crawlResults) {
      await supabase.from("blockchain_data").upsert({
        wallet_address: result.walletAddress,
        blockchain: result.blockchain,
        transaction_data: result.transactions,
        balance: result.balance,
        first_transaction: result.firstTransaction,
        last_transaction: result.lastTransaction,
        crawled_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, data: crawlResults })
  } catch (error) {
    console.error("Blockchain crawl error:", error)
    return NextResponse.json({ error: "Failed to crawl blockchain data" }, { status: 500 })
  }
}

async function mockCrawlTransactions(walletAddress: string, blockchain: string) {
  // Mock transaction data
  return Array.from({ length: Math.floor(Math.random() * 100) + 10 }, (_, i) => ({
    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    from: i % 2 === 0 ? walletAddress : `0x${Math.random().toString(16).substr(2, 40)}`,
    to: i % 2 === 1 ? walletAddress : `0x${Math.random().toString(16).substr(2, 40)}`,
    value: Math.random() * 10,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    blockchain,
  }))
}
