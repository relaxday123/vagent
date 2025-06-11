"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, TrendingUp } from "lucide-react"

export function CreditDashboardFallback() {
  const [walletAddress, setWalletAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [scoreData, setScoreData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchCreditScore = async () => {
    if (!walletAddress.trim()) {
      setError("Please enter a wallet address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock data
      setScoreData({
        creditScore: 720,
        breakdown: {
          walletAge: { score: 85, weight: 0.2, description: "Wallet age: 547 days" },
          transactionHistory: { score: 78, weight: 0.25, description: "390 transactions" },
          defiEngagement: { score: 60, weight: 0.15, description: "Active on 2 DeFi protocols" },
          portfolioValue: { score: 65, weight: 0.15, description: "Portfolio value: 12.50 ETH" },
          kycStatus: { score: 100, weight: 0.1, description: "KYC verified" },
          socialPresence: { score: 70, weight: 0.1, description: "Social presence score: 70/100" },
          riskFactors: { score: 95, weight: 0.05, description: "No risk flags" },
        },
      })
    } catch (err) {
      setError("An error occurred while fetching credit score")
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
                Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
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
              {Object.entries(scoreData.breakdown).map(([factor, data]: [string, any]) => (
                <div key={factor} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">{factor}</span>
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
    </div>
  )
}
