"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowLeft, ExternalLink, Wallet, Clock, Activity, Coins } from "lucide-react"
import { ScoreVisualization } from "@/components/wallet-scoring/score-visualization"
import { Recommendations } from "@/components/wallet-scoring/recommendations"
import { WalletScoringService } from "@/lib/services/wallet-scoring"

interface WalletData {
  address: string
  ethBalance: number
  walletAge: number
  txCount: number
  txFrequency: number
  tokenDiversity: number
  score: {
    total: number
    breakdown: Record<string, { score: number; weight: number; description: string }>
  }
  rawData: {
    balance: any
    transactions: any[]
    tokens: any[]
  }
}

export default function WalletScoringResultPage() {
  const { address } = useParams() as { address: string }
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<string[]>([])

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await fetch(`/api/wallet-scoring/${address}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch wallet data")
        }
        const data = await response.json()
        setWalletData(data)

        // Generate recommendations
        if (data) {
          const recs = WalletScoringService.getRecommendations({
            walletAge: data.walletAge,
            txCount: data.txCount,
            txFrequency: data.txFrequency,
            tokenDiversity: data.tokenDiversity,
            ethBalance: data.ethBalance,
          })
          setRecommendations(recs)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletData()
  }, [address])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Poor"
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  const formatEther = (wei: string) => {
    return (Number.parseInt(wei) / 1e18).toFixed(6)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-medium">Analyzing Wallet</h2>
          <p className="text-muted-foreground">Fetching blockchain data for {truncateAddress(address)}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button asChild variant="outline">
            <Link href="/wallet-scoring">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Try Another Wallet
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!walletData) {
    return null
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/wallet-scoring"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Wallet Search
          </Link>
        </div>

        <div className="grid gap-6">
          {/* Wallet Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Wallet Overview</span>
                <a
                  href={`https://etherscan.io/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  View on Etherscan
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </CardTitle>
              <CardDescription>
                Analysis for wallet address: <span className="font-mono">{address}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Credit Score */}
              <div className="flex flex-col md:flex-row gap-6">
                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Credit Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getScoreColor(walletData.score.total)}`}>
                        {walletData.score.total}
                      </div>
                      <Badge className="mt-2" variant="outline">
                        {getScoreLabel(walletData.score.total)}
                      </Badge>
                      <Progress value={walletData.score.total} className="mt-4" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Wallet className="h-4 w-4" />
                          <span>ETH Balance</span>
                        </div>
                        <div className="font-medium">{walletData.ethBalance.toFixed(4)} ETH</div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Wallet Age</span>
                        </div>
                        <div className="font-medium">{walletData.walletAge} days</div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Activity className="h-4 w-4" />
                          <span>Transactions</span>
                        </div>
                        <div className="font-medium">{walletData.txCount}</div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Coins className="h-4 w-4" />
                          <span>Token Types</span>
                        </div>
                        <div className="font-medium">{walletData.tokenDiversity}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Score Visualization and Recommendations */}
              <div className="grid md:grid-cols-2 gap-6">
                <ScoreVisualization breakdown={walletData.score.breakdown} />
                <Recommendations score={walletData.score.total} recommendations={recommendations} />
              </div>
            </CardContent>
          </Card>

          {/* Detailed Data */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Blockchain Data</CardTitle>
              <CardDescription>Transaction history and token transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="transactions">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="tokens">Token Transfers</TabsTrigger>
                </TabsList>
                <TabsContent value="transactions" className="mt-4">
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-2 text-left">Hash</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">From</th>
                            <th className="px-4 py-2 text-left">To</th>
                            <th className="px-4 py-2 text-right">Value (ETH)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {walletData.rawData.transactions.length > 0 ? (
                            walletData.rawData.transactions.map((tx, index) => (
                              <tr key={index} className="border-b">
                                <td className="px-4 py-2 font-mono">
                                  <a
                                    href={`https://etherscan.io/tx/${tx.hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {truncateAddress(tx.hash)}
                                  </a>
                                </td>
                                <td className="px-4 py-2">{formatDate(tx.timeStamp)}</td>
                                <td className="px-4 py-2 font-mono">
                                  {tx.from.toLowerCase() === address.toLowerCase() ? (
                                    <span className="text-orange-600">SELF</span>
                                  ) : (
                                    truncateAddress(tx.from)
                                  )}
                                </td>
                                <td className="px-4 py-2 font-mono">
                                  {tx.to.toLowerCase() === address.toLowerCase() ? (
                                    <span className="text-orange-600">SELF</span>
                                  ) : (
                                    truncateAddress(tx.to)
                                  )}
                                </td>
                                <td className="px-4 py-2 text-right font-mono">{formatEther(tx.value)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                                No transactions found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="tokens" className="mt-4">
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-2 text-left">Token</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">From</th>
                            <th className="px-4 py-2 text-left">To</th>
                            <th className="px-4 py-2 text-right">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {walletData.rawData.tokens.length > 0 ? (
                            walletData.rawData.tokens.map((tx, index) => (
                              <tr key={index} className="border-b">
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{tx.tokenSymbol}</Badge>
                                    <a
                                      href={`https://etherscan.io/token/${tx.contractAddress}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                </td>
                                <td className="px-4 py-2">{formatDate(tx.timeStamp)}</td>
                                <td className="px-4 py-2 font-mono">
                                  {tx.from.toLowerCase() === address.toLowerCase() ? (
                                    <span className="text-orange-600">SELF</span>
                                  ) : (
                                    truncateAddress(tx.from)
                                  )}
                                </td>
                                <td className="px-4 py-2 font-mono">
                                  {tx.to.toLowerCase() === address.toLowerCase() ? (
                                    <span className="text-orange-600">SELF</span>
                                  ) : (
                                    truncateAddress(tx.to)
                                  )}
                                </td>
                                <td className="px-4 py-2 text-right font-mono">
                                  {(Number.parseInt(tx.value) / Math.pow(10, Number.parseInt(tx.tokenDecimal))).toFixed(
                                    4,
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                                No token transfers found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Button asChild variant="outline">
                <Link href="/wallet-scoring">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Analyze Another Wallet
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
