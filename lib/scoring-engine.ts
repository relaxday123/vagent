export interface WalletData {
  balance: number
  transactionCount: number
  firstTransactionDate: string
  lastTransactionDate: string
  defiProtocols: string[]
  tokenHoldings: Array<{ token: string; amount: number }>
}

export interface OffChainData {
  kycVerified: boolean
  socialScore: number
  creditHistoryScore: number
  riskFlags: string[]
}

export interface ScoreBreakdown {
  walletAge: { score: number; weight: number; description: string }
  transactionHistory: { score: number; weight: number; description: string }
  defiEngagement: { score: number; weight: number; description: string }
  portfolioValue: { score: number; weight: number; description: string }
  kycStatus: { score: number; weight: number; description: string }
  socialPresence: { score: number; weight: number; description: string }
  riskFactors: { score: number; weight: number; description: string }
}

export class CreditScoringEngine {
  private static readonly WEIGHTS = {
    walletAge: 0.2,
    transactionHistory: 0.25,
    defiEngagement: 0.15,
    portfolioValue: 0.15,
    kycStatus: 0.1,
    socialPresence: 0.1,
    riskFactors: 0.05,
  }

  static calculateScore(
    walletData: WalletData,
    offChainData: OffChainData,
  ): {
    score: number
    breakdown: ScoreBreakdown
  } {
    const breakdown: ScoreBreakdown = {
      walletAge: this.calculateWalletAgeScore(walletData.firstTransactionDate),
      transactionHistory: this.calculateTransactionScore(walletData.transactionCount),
      defiEngagement: this.calculateDefiScore(walletData.defiProtocols),
      portfolioValue: this.calculatePortfolioScore(walletData.balance),
      kycStatus: this.calculateKycScore(offChainData.kycVerified),
      socialPresence: this.calculateSocialScore(offChainData.socialScore),
      riskFactors: this.calculateRiskScore(offChainData.riskFlags),
    }

    const weightedScore = Object.entries(breakdown).reduce((total, [key, data]) => {
      const weight = this.WEIGHTS[key as keyof typeof this.WEIGHTS]
      return total + data.score * weight
    }, 0)

    // Convert to credit score range (300-850)
    const finalScore = Math.round(300 + weightedScore * 5.5)

    return {
      score: Math.min(850, Math.max(300, finalScore)),
      breakdown,
    }
  }

  private static calculateWalletAgeScore(firstTransactionDate: string): {
    score: number
    weight: number
    description: string
  } {
    const ageInDays = (Date.now() - new Date(firstTransactionDate).getTime()) / (1000 * 60 * 60 * 24)
    const score = Math.min(100, (ageInDays / 365) * 50) // Max score at 2+ years

    return {
      score: Math.round(score),
      weight: this.WEIGHTS.walletAge,
      description: `Wallet age: ${Math.round(ageInDays)} days`,
    }
  }

  private static calculateTransactionScore(transactionCount: number): {
    score: number
    weight: number
    description: string
  } {
    const score = Math.min(100, (transactionCount / 500) * 100) // Max score at 500+ transactions

    return {
      score: Math.round(score),
      weight: this.WEIGHTS.transactionHistory,
      description: `${transactionCount} transactions`,
    }
  }

  private static calculateDefiScore(defiProtocols: string[]): {
    score: number
    weight: number
    description: string
  } {
    const score = Math.min(100, defiProtocols.length * 25) // Max score at 4+ protocols

    return {
      score: Math.round(score),
      weight: this.WEIGHTS.defiEngagement,
      description: `Active on ${defiProtocols.length} DeFi protocols`,
    }
  }

  private static calculatePortfolioScore(balance: number): {
    score: number
    weight: number
    description: string
  } {
    const score = Math.min(100, (balance / 50) * 100) // Max score at 50+ ETH

    return {
      score: Math.round(score),
      weight: this.WEIGHTS.portfolioValue,
      description: `Portfolio value: ${balance.toFixed(2)} ETH`,
    }
  }

  private static calculateKycScore(kycVerified: boolean): {
    score: number
    weight: number
    description: string
  } {
    return {
      score: kycVerified ? 100 : 0,
      weight: this.WEIGHTS.kycStatus,
      description: kycVerified ? "KYC verified" : "KYC not verified",
    }
  }

  private static calculateSocialScore(socialScore: number): {
    score: number
    weight: number
    description: string
  } {
    return {
      score: socialScore,
      weight: this.WEIGHTS.socialPresence,
      description: `Social presence score: ${socialScore}/100`,
    }
  }

  private static calculateRiskScore(riskFlags: string[]): {
    score: number
    weight: number
    description: string
  } {
    const score = Math.max(0, 100 - riskFlags.length * 25)

    return {
      score: Math.round(score),
      weight: this.WEIGHTS.riskFactors,
      description: riskFlags.length > 0 ? `${riskFlags.length} risk flags` : "No risk flags",
    }
  }
}
