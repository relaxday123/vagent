import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { CreditScoringEngine } from "@/lib/scoring-engine"

export async function GET(request: NextRequest, { params }: { params: { walletAddress: string } }) {
  try {
    const { walletAddress } = params

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get wallet data
    const { data: walletData, error: walletError } = await supabase
      .from("wallet_data")
      .select("*")
      .eq("user_id", user.id)
      .single()

    // Get off-chain data
    const { data: offChainData, error: offChainError } = await supabase
      .from("off_chain_data")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (walletError || offChainError || !walletData || !offChainData) {
      return NextResponse.json({ error: "Incomplete user data" }, { status: 400 })
    }

    // Calculate credit score
    const scoreResult = CreditScoringEngine.calculateScore(
      {
        balance: walletData.balance || 0,
        transactionCount: walletData.transaction_count || 0,
        firstTransactionDate: walletData.first_transaction_date || new Date().toISOString(),
        lastTransactionDate: walletData.last_transaction_date || new Date().toISOString(),
        defiProtocols: walletData.defi_protocols || [],
        tokenHoldings: walletData.token_holdings || [],
      },
      {
        kycVerified: offChainData.kyc_verified || false,
        socialScore: offChainData.social_score || 0,
        creditHistoryScore: offChainData.credit_history_score || 0,
        riskFlags: offChainData.risk_flags || [],
      },
    )

    // Save the calculated score
    const { error: saveError } = await supabase.from("credit_scores").upsert({
      user_id: user.id,
      score: scoreResult.score,
      score_breakdown: scoreResult.breakdown,
      calculated_at: new Date().toISOString(),
    })

    if (saveError) {
      console.error("Error saving score:", saveError)
    }

    return NextResponse.json({
      user: {
        walletAddress: user.wallet_address,
        email: user.email,
      },
      creditScore: scoreResult.score,
      breakdown: scoreResult.breakdown,
      calculatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error calculating credit score:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
