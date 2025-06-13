export interface WalletMetrics {
  walletAge: number // in days
  txCount: number // total transactions
  txFrequency: number // transactions per day
  tokenDiversity: number // number of unique tokens
  ethBalance: number // ETH balance
}

export interface ScoreBreakdown {
  score: number // 0-100
  weight: number // 0-1
  description: string
}

export interface CreditScore {
  total: number // 0-100
  breakdown: Record<string, ScoreBreakdown>
}

export class WalletScoringService {
  /**
   * Calculate a credit score based on wallet metrics
   */
  static calculateCreditScore(metrics: WalletMetrics): CreditScore {
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
      walletAge: Math.min(100, (metrics.walletAge / 365) * 100), // Max score at 1 year
      txCount: Math.min(100, (metrics.txCount / 100) * 100), // Max score at 100 transactions
      txFrequency: Math.min(100, metrics.txFrequency * 10 * 100), // Max score at 10 tx/day
      tokenDiversity: Math.min(100, metrics.tokenDiversity * 10), // Max score at 10 tokens
      ethBalance: Math.min(100, metrics.ethBalance * 5), // Max score at 20 ETH
    }

    // Create descriptions
    const descriptions = {
      walletAge: `Wallet age: ${metrics.walletAge} days`,
      txCount: `Transaction count: ${metrics.txCount}`,
      txFrequency: `Transaction frequency: ${metrics.txFrequency.toFixed(4)} tx/day`,
      tokenDiversity: `Token diversity: ${metrics.tokenDiversity} unique tokens`,
      ethBalance: `ETH balance: ${metrics.ethBalance.toFixed(4)} ETH`,
    }

    // Calculate weighted scores
    const weightedScores = Object.entries(scores).map(([key, score]) => {
      const weight = weights[key as keyof typeof weights]
      return score * weight
    })

    // Calculate total score (0-100)
    const totalScore = weightedScores.reduce((sum, score) => sum + score, 0)

    // Create breakdown
    const breakdown: Record<string, ScoreBreakdown> = {}
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

  /**
   * Get a qualitative rating based on score
   */
  static getRating(score: number): {
    label: string
    color: string
    description: string
  } {
    if (score >= 80) {
      return {
        label: "Excellent",
        color: "text-green-600",
        description: "This wallet demonstrates excellent blockchain activity and financial health.",
      }
    } else if (score >= 60) {
      return {
        label: "Good",
        color: "text-blue-600",
        description: "This wallet shows good blockchain activity and reasonable financial health.",
      }
    } else if (score >= 40) {
      return {
        label: "Fair",
        color: "text-yellow-600",
        description: "This wallet has fair blockchain activity but could improve in some areas.",
      }
    } else {
      return {
        label: "Poor",
        color: "text-red-600",
        description: "This wallet shows limited blockchain activity or financial health concerns.",
      }
    }
  }

  /**
   * Get recommendations based on metrics
   */
  static getRecommendations(metrics: WalletMetrics): string[] {
    const recommendations: string[] = []

    if (metrics.walletAge < 30) {
      recommendations.push("Increase wallet age by maintaining activity over time")
    }

    if (metrics.txCount < 50) {
      recommendations.push("Increase transaction count with regular blockchain activity")
    }

    if (metrics.txFrequency < 0.1) {
      recommendations.push("Improve transaction frequency with more regular activity")
    }

    if (metrics.tokenDiversity < 3) {
      recommendations.push("Diversify token holdings across multiple assets")
    }

    if (metrics.ethBalance < 0.5) {
      recommendations.push("Increase ETH balance to improve financial stability score")
    }

    return recommendations
  }
}
