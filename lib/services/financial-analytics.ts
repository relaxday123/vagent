import { createClient } from "@/lib/supabase/client"

export interface FinancialMetrics {
  totalBalance: number
  creditScore: number
  portfolioValue: number
  transactionCount: number
  defiProtocols: string[]
  riskScore: number
  monthlyGrowth: number
}

export interface WalletBalance {
  token: string
  amount: number
  value: number
  percentage: number
}

export interface TransactionHistory {
  date: string
  amount: number
  type: "incoming" | "outgoing"
  token: string
}

export interface CreditScoreHistory {
  date: string
  score: number
  factors: {
    walletAge: number
    transactionHistory: number
    defiEngagement: number
    portfolioValue: number
  }
}

export interface PortfolioPerformance {
  date: string
  value: number
  change: number
  changePercent: number
}

export class FinancialAnalyticsService {
  private supabase = createClient()

  async getUserFinancialMetrics(userId: string): Promise<FinancialMetrics> {
    try {
      // Get wallet data
      const { data: walletData } = await this.supabase.from("wallet_data").select("*").eq("user_id", userId).single()

      // Get latest credit score
      const { data: creditScore } = await this.supabase
        .from("credit_scores")
        .select("score")
        .eq("user_id", userId)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .single()

      // Get off-chain data for risk assessment
      const { data: offChainData } = await this.supabase
        .from("off_chain_data")
        .select("*")
        .eq("user_id", userId)
        .single()

      const portfolioValue = this.calculatePortfolioValue(walletData?.token_holdings || [])
      const riskScore = this.calculateRiskScore(offChainData?.risk_flags || [])

      return {
        totalBalance: walletData?.balance || 0,
        creditScore: creditScore?.score || 0,
        portfolioValue,
        transactionCount: walletData?.transaction_count || 0,
        defiProtocols: walletData?.defi_protocols || [],
        riskScore,
        monthlyGrowth: this.generateMockGrowth(), // Mock data for demo
      }
    } catch (error) {
      console.error("Error fetching financial metrics:", error)
      return this.getMockFinancialMetrics()
    }
  }

  async getWalletBalances(userId: string): Promise<WalletBalance[]> {
    try {
      const { data: walletData } = await this.supabase
        .from("wallet_data")
        .select("token_holdings")
        .eq("user_id", userId)
        .single()

      const holdings = walletData?.token_holdings || []
      const totalValue = this.calculatePortfolioValue(holdings)

      return holdings.map((holding: any) => ({
        token: holding.token,
        amount: holding.amount,
        value: this.getTokenValue(holding.token, holding.amount),
        percentage: (this.getTokenValue(holding.token, holding.amount) / totalValue) * 100,
      }))
    } catch (error) {
      console.error("Error fetching wallet balances:", error)
      return this.getMockWalletBalances()
    }
  }

  async getCreditScoreHistory(userId: string): Promise<CreditScoreHistory[]> {
    try {
      const { data: scores } = await this.supabase
        .from("credit_scores")
        .select("score, score_breakdown, calculated_at")
        .eq("user_id", userId)
        .order("calculated_at", { ascending: true })
        .limit(12)

      return (
        scores?.map((score) => ({
          date: new Date(score.calculated_at).toLocaleDateString(),
          score: score.score,
          factors: {
            walletAge: score.score_breakdown?.walletAge?.score || 0,
            transactionHistory: score.score_breakdown?.transactionHistory?.score || 0,
            defiEngagement: score.score_breakdown?.defiEngagement?.score || 0,
            portfolioValue: score.score_breakdown?.portfolioValue?.score || 0,
          },
        })) || this.getMockCreditHistory()
      )
    } catch (error) {
      console.error("Error fetching credit score history:", error)
      return this.getMockCreditHistory()
    }
  }

  async getPortfolioPerformance(userId: string): Promise<PortfolioPerformance[]> {
    // Mock data for portfolio performance (in a real app, this would come from historical data)
    return this.getMockPortfolioPerformance()
  }

  async getTransactionHistory(userId: string): Promise<TransactionHistory[]> {
    // Mock data for transaction history (in a real app, this would come from blockchain data)
    return this.getMockTransactionHistory()
  }

  private calculatePortfolioValue(holdings: any[]): number {
    return holdings.reduce((total, holding) => {
      return total + this.getTokenValue(holding.token, holding.amount)
    }, 0)
  }

  private getTokenValue(token: string, amount: number): number {
    // Mock token prices (in a real app, this would come from a price API)
    const prices: { [key: string]: number } = {
      ETH: 2500,
      BTC: 45000,
      USDC: 1,
      DAI: 1,
      USDT: 1,
    }
    return (prices[token] || 0) * amount
  }

  private calculateRiskScore(riskFlags: string[]): number {
    return Math.max(0, 100 - riskFlags.length * 25)
  }

  private generateMockGrowth(): number {
    return Math.random() * 20 - 10 // Random growth between -10% and +10%
  }

  // Mock data methods for demo purposes
  private getMockFinancialMetrics(): FinancialMetrics {
    return {
      totalBalance: 15.5,
      creditScore: 720,
      portfolioValue: 42500,
      transactionCount: 450,
      defiProtocols: ["Uniswap", "Aave", "Compound"],
      riskScore: 85,
      monthlyGrowth: 12.5,
    }
  }

  private getMockWalletBalances(): WalletBalance[] {
    return [
      { token: "ETH", amount: 15.5, value: 38750, percentage: 65 },
      { token: "USDC", amount: 5000, value: 5000, percentage: 20 },
      { token: "DAI", amount: 3000, value: 3000, percentage: 15 },
    ]
  }

  private getMockCreditHistory(): CreditScoreHistory[] {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return months.map((month, index) => ({
      date: month,
      score: 650 + index * 12,
      factors: {
        walletAge: 70 + index * 3,
        transactionHistory: 60 + index * 5,
        defiEngagement: 50 + index * 8,
        portfolioValue: 55 + index * 6,
      },
    }))
  }

  private getMockPortfolioPerformance(): PortfolioPerformance[] {
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toLocaleDateString()
    })

    let value = 40000
    return dates.map((date) => {
      const change = (Math.random() - 0.5) * 2000
      value += change
      return {
        date,
        value: Math.round(value),
        change: Math.round(change),
        changePercent: Number(((change / (value - change)) * 100).toFixed(2)),
      }
    })
  }

  private getMockTransactionHistory(): TransactionHistory[] {
    const transactions = []
    for (let i = 0; i < 20; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      transactions.push({
        date: date.toLocaleDateString(),
        amount: Math.random() * 5,
        type: Math.random() > 0.5 ? "incoming" : ("outgoing" as const),
        token: ["ETH", "USDC", "DAI"][Math.floor(Math.random() * 3)],
      })
    }
    return transactions
  }
}
