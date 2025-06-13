import { type NextRequest, NextResponse } from "next/server"

// Etherscan API key - in production, use environment variables
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "YourApiKeyToken"
const ETHERSCAN_API_URL = "https://api.etherscan.io/api"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params

    // Validate the address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address format" }, { status: 400 })
    }

    // Fetch wallet balance
    const balanceResponse = await fetch(
      `${ETHERSCAN_API_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`,
    )
    const balanceData = await balanceResponse.json()

    // Fetch transaction list (last 100 transactions)
    const txListResponse = await fetch(
      `${ETHERSCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`,
    )
    const txListData = await txListResponse.json()

    // Fetch ERC-20 token transfers
    const tokenTxResponse = await fetch(
      `${ETHERSCAN_API_URL}?module=account&action=tokentx&address=${address}&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`,
    )
    const tokenTxData = await tokenTxResponse.json()

    // Calculate wallet age (from first transaction)
    let walletAge = 0
    let firstTxTimestamp = 0
    if (txListData.status === "1" && txListData.result.length > 0) {
      const transactions = txListData.result
      transactions.sort((a: any, b: any) => Number.parseInt(a.timeStamp) - Number.parseInt(b.timeStamp))
      firstTxTimestamp = Number.parseInt(transactions[0].timeStamp)
      const firstTxDate = new Date(firstTxTimestamp * 1000)
      const now = new Date()
      walletAge = Math.floor((now.getTime() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Calculate transaction frequency
    const txCount = txListData.status === "1" ? txListData.result.length : 0
    const txFrequency = walletAge > 0 ? txCount / walletAge : 0

    // Calculate token diversity
    const uniqueTokens = new Set()
    if (tokenTxData.status === "1" && tokenTxData.result) {
      tokenTxData.result.forEach((tx: any) => {
        uniqueTokens.add(tx.contractAddress)
      })
    }
    const tokenDiversity = uniqueTokens.size

    // Calculate ETH balance in ETH units
    const ethBalance = balanceData.status === "1" ? Number.parseFloat(balanceData.result) / 1e18 : 0

    // Calculate credit score based on various factors
    const score = calculateCreditScore({
      walletAge,
      txCount,
      txFrequency,
      tokenDiversity,
      ethBalance,
    })

    return NextResponse.json({
      address,
      ethBalance,
      walletAge,
      txCount,
      txFrequency,
      tokenDiversity,
      score,
      rawData: {
        balance: balanceData,
        transactions: txListData.status === "1" ? txListData.result.slice(0, 10) : [],
        tokens: tokenTxData.status === "1" ? tokenTxData.result.slice(0, 10) : [],
      },
    })
  } catch (error) {
    console.error("Error fetching wallet data:", error)
    return NextResponse.json({ error: "Failed to fetch wallet data" }, { status: 500 })
  }
}

interface ScoringFactors {
  walletAge: number
  txCount: number
  txFrequency: number
  tokenDiversity: number
  ethBalance: number
}

function calculateCreditScore(factors: ScoringFactors): {
  total: number
  breakdown: Record<string, { score: number; weight: number; description: string }>
} {
  // Define weights for each factor
  const weights = {
    walletAge: 0.25,
    txCount: 0.2,
    txFrequency: 0.15,
    tokenDiversity: 0.15,
    ethBalance: 0.25,
  }

  // Calculate individual scores (0-100)
  const scores = {
    walletAge: Math.min(100, (factors.walletAge / 365) * 100), // Max score at 1 year
    txCount: Math.min(100, (factors.txCount / 100) * 100), // Max score at 100 transactions
    txFrequency: Math.min(100, factors.txFrequency * 10 * 100), // Max score at 10 tx/day
    tokenDiversity: Math.min(100, factors.tokenDiversity * 10), // Max score at 10 tokens
    ethBalance: Math.min(100, factors.ethBalance * 5), // Max score at 20 ETH
  }

  // Create descriptions
  const descriptions = {
    walletAge: `Wallet age: ${factors.walletAge} days`,
    txCount: `Transaction count: ${factors.txCount}`,
    txFrequency: `Transaction frequency: ${factors.txFrequency.toFixed(4)} tx/day`,
    tokenDiversity: `Token diversity: ${factors.tokenDiversity} unique tokens`,
    ethBalance: `ETH balance: ${factors.ethBalance.toFixed(4)} ETH`,
  }

  // Calculate weighted scores
  const weightedScores = Object.entries(scores).map(([key, score]) => {
    const weight = weights[key as keyof typeof weights]
    return score * weight
  })

  // Calculate total score (0-100)
  const totalScore = weightedScores.reduce((sum, score) => sum + score, 0)

  // Create breakdown
  const breakdown: Record<string, { score: number; weight: number; description: string }> = {}
  Object.keys(scores).forEach((key) => {
    const typedKey = key as keyof typeof scores
    breakdown[key] = {
      score: scores[typedKey],
      weight: weights[typedKey],
      description: descriptions[typedKey],
    }
  })

  return {
    total: Math.round(totalScore),
    breakdown,
  }
}
