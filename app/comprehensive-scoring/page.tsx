"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Calculator, Wallet, Twitter, Shield, TrendingUp } from "lucide-react"

export default function ComprehensiveScoringPage() {
  const [loading, setLoading] = useState(false)
  const [identifier, setIdentifier] = useState("")
  const [identifierType, setIdentifierType] = useState<"wallet" | "twitter">("wallet")
  const [scoreResult, setScoreResult] = useState<any>(null)

  const handleScoring = async () => {
    if (!identifier) return

    setLoading(true)

    try {
      const response = await fetch("/api/scoring/comprehensive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          type: identifierType,
        }),
      })

      const data = await response.json()
      setScoreResult(data.data)
    } catch (error) {
      console.error("Scoring error:", error)
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
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Comprehensive Credit Scoring</h1>
        <p className="text-muted-foreground">Advanced credit assessment combining blockchain and social media data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Multi-Source Credit Analysis
          </CardTitle>
          <CardDescription>
            Enter a wallet address or Twitter handle to generate a comprehensive credit score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={identifierType} onValueChange={(value) => setIdentifierType(value as "wallet" | "twitter")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wallet">Wallet Address</TabsTrigger>
              <TabsTrigger value="twitter">Twitter Handle</TabsTrigger>
            </TabsList>

            <TabsContent value="wallet" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-input">Wallet Address</Label>
                <Input
                  id="wallet-input"
                  placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="twitter" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter-input">Twitter Handle</Label>
                <Input
                  id="twitter-input"
                  placeholder="@username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleScoring} disabled={loading || !identifier} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating Comprehensive Score...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Credit Score
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {scoreResult && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Credit Score</CardTitle>
              <CardDescription>Multi-source analysis result with confidence rating</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(scoreResult.score)}`}>{scoreResult.score}</div>
                <Badge variant="secondary" className="mt-2">
                  {getScoreLabel(scoreResult.score)}
                </Badge>
              </div>

              <Progress value={(scoreResult.score - 300) / 5.5} className="w-full" />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>300</span>
                <span>850</span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence Level</span>
                  <Badge variant={scoreResult.confidence > 0.8 ? "default" : "secondary"}>
                    {(scoreResult.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={scoreResult.confidence * 100} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
              <CardDescription>Detailed analysis by data source</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="font-medium">Blockchain Data</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{scoreResult.breakdown.blockchain.toFixed(0)}/100</div>
                    <div className="text-xs text-muted-foreground">40% weight</div>
                  </div>
                </div>
                <Progress value={scoreResult.breakdown.blockchain} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    <span className="font-medium">Social Media</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{scoreResult.breakdown.social.toFixed(0)}/100</div>
                    <div className="text-xs text-muted-foreground">30% weight</div>
                  </div>
                </div>
                <Progress value={scoreResult.breakdown.social} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Identity Verification</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{scoreResult.breakdown.identity.toFixed(0)}/100</div>
                    <div className="text-xs text-muted-foreground">20% weight</div>
                  </div>
                </div>
                <Progress value={scoreResult.breakdown.identity} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">Risk Assessment</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{scoreResult.breakdown.risk.toFixed(0)}/100</div>
                    <div className="text-xs text-muted-foreground">10% weight</div>
                  </div>
                </div>
                <Progress value={scoreResult.breakdown.risk} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {scoreResult && (
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>Information used in this comprehensive analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">Blockchain Analysis</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Multi-chain transaction history</li>
                  <li>• Wallet age and activity patterns</li>
                  <li>• DeFi protocol interactions</li>
                  <li>• Token holdings and portfolio diversity</li>
                  <li>• Cross-chain identity verification</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Social Media Analysis</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Profile credibility and verification</li>
                  <li>• Content sentiment analysis</li>
                  <li>• Crypto and financial engagement</li>
                  <li>• Account age and activity level</li>
                  <li>• Social network influence metrics</li>
                </ul>
              </div>
            </div>

            {scoreResult.walletAddress && scoreResult.twitterHandle && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-semibold mb-2">Linked Accounts</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Wallet: {scoreResult.walletAddress.slice(0, 6)}...{scoreResult.walletAddress.slice(-4)}
                  </Badge>
                  <Badge variant="outline">Twitter: {scoreResult.twitterHandle}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
