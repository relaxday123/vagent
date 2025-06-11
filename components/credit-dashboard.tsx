"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Wallet, Shield, TrendingUp, Users, AlertTriangle } from "lucide-react"

interface CreditScoreData {
  user: {
    walletAddress: string
    email: string | null
  }
  creditScore: number
  breakdown: {
    [key: string]: {
      score: number
      weight: number
      description: string
    }
  }
  calculatedAt: string
}

export function CreditDashboard() {
  const [walletAddress, setWalletAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [scoreData, setScoreData] = useState<CreditScoreData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchCreditScore = async () => {
    if (!walletAddress.trim()) {
      setError("Please enter a wallet address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/credit-score/${walletAddress}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch credit score")
      }

      setScoreData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-600"
    if (score >= 650) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 750) return "Excellent"
    if (score >= 700) return "Good"
    if (score >= 650) return "Fair"
    return "Poor"
  }

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case "walletAge":
      case "transactionHistory":
        return <Wallet className="h-4 w-4" />
      case "kycStatus":
        return <Shield className="h-4 w-4" />
      case "defiEngagement":
      case "portfolioValue":
        return <TrendingUp className="h-4 w-4" />
      case "socialPresence":
        return <Users className="h-4 w-4" />
      case "riskFactors":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const formatFactorName = (factor: string) => {
    const names: { [key: string]: string } = {
      walletAge: "Wallet Age",
      transactionHistory: "Transaction History",
      defiEngagement: "DeFi Engagement",
      portfolioValue: "Portfolio Value",
      kycStatus: "KYC Status",
      socialPresence: "Social Presence",
      riskFactors: "Risk Assessment",
    }
    return names[factor] || factor
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Crypto Credit Scoring System</h1>
        <p className="text-muted-foreground">Assess creditworthiness using on-chain and off-chain data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Credit Score</CardTitle>
          <CardDescription>Enter a wallet address to calculate the credit score</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="flex-1"
            />
            <Button onClick={fetchCreditScore} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate Score"
              )}
            </Button>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </CardContent>
      </Card>

      {scoreData && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Credit Score</CardTitle>
              <CardDescription>
                Wallet: {scoreData.user.walletAddress.slice(0, 6)}...{scoreData.user.walletAddress.slice(-4)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(scoreData.creditScore)}`}>
                  {scoreData.creditScore}
                </div>
                <Badge variant="secondary" className="mt-2">
                  {getScoreLabel(scoreData.creditScore)}
                </Badge>
              </div>
              <Progress value={(scoreData.creditScore - 300) / 5.5} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>300</span>
                <span>850</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
              <CardDescription>Factors contributing to the credit score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(scoreData.breakdown).map(([factor, data]) => (
                <div key={factor} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFactorIcon(factor)}
                      <span className="font-medium">{formatFactorName(factor)}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{data.score}/100</div>
                      <div className="text-xs text-muted-foreground">Weight: {(data.weight * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                  <Progress value={data.score} className="h-2" />
                  <div className="text-xs text-muted-foreground">{data.description}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>How the credit scoring system works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">On-Chain Data Sources</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Transaction history and frequency</li>
                <li>• Wallet age and activity patterns</li>
                <li>• DeFi protocol engagement</li>
                <li>• Token holdings and portfolio value</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Off-Chain Data Sources</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• KYC/AML verification status</li>
                <li>• Social media presence score</li>
                <li>• Traditional credit history</li>
                <li>• Risk flags and compliance checks</li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Security & Privacy</h4>
            <p className="text-sm text-muted-foreground">
              All data is encrypted and stored securely. The system complies with privacy regulations and implements
              robust security measures to protect user information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
