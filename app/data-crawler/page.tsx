"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Database, Twitter, LinkIcon } from "lucide-react"

export default function DataCrawlerPage() {
  const [crawling, setCrawling] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)

  const [walletAddress, setWalletAddress] = useState("")
  const [twitterHandle, setTwitterHandle] = useState("")
  const [selectedBlockchains, setSelectedBlockchains] = useState<string[]>(["ethereum"])

  const blockchains = [
    { id: "ethereum", name: "Ethereum", icon: "⟠" },
    { id: "bitcoin", name: "Bitcoin", icon: "₿" },
    { id: "polygon", name: "Polygon", icon: "⬟" },
    { id: "bsc", name: "BSC", icon: "🟡" },
    { id: "arbitrum", name: "Arbitrum", icon: "🔵" },
    { id: "optimism", name: "Optimism", icon: "🔴" },
  ]

  const handleBlockchainCrawl = async () => {
    if (!walletAddress) return

    setCrawling(true)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch("/api/blockchain/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          blockchains: selectedBlockchains,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Crawl error:", error)
    } finally {
      setCrawling(false)
    }
  }

  const handleTwitterCrawl = async () => {
    if (!twitterHandle) return

    setCrawling(true)
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90))
      }, 300)

      const response = await fetch("/api/social/twitter/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twitterHandle,
          walletAddress,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Twitter crawl error:", error)
    } finally {
      setCrawling(false)
    }
  }

  const handleIdentityMatch = async () => {
    if (!walletAddress || !twitterHandle) return

    setCrawling(true)

    try {
      const response = await fetch("/api/identity/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          twitterHandle,
        }),
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Identity match error:", error)
    } finally {
      setCrawling(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Multi-Chain Data Crawler</h1>
        <p className="text-muted-foreground">
          Crawl and analyze blockchain and social media data for comprehensive credit scoring
        </p>
      </div>

      <Tabs defaultValue="blockchain" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blockchain">Blockchain Data</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="identity">Identity Matching</TabsTrigger>
        </TabsList>

        <TabsContent value="blockchain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Blockchain Data Crawler
              </CardTitle>
              <CardDescription>Crawl transaction history and wallet data across multiple blockchains</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address</Label>
                <Input
                  id="wallet"
                  placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Select Blockchains</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {blockchains.map((blockchain) => (
                    <div key={blockchain.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={blockchain.id}
                        checked={selectedBlockchains.includes(blockchain.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBlockchains([...selectedBlockchains, blockchain.id])
                          } else {
                            setSelectedBlockchains(selectedBlockchains.filter((id) => id !== blockchain.id))
                          }
                        }}
                      />
                      <Label htmlFor={blockchain.id} className="flex items-center gap-2">
                        <span>{blockchain.icon}</span>
                        {blockchain.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleBlockchainCrawl} disabled={crawling || !walletAddress} className="w-full">
                {crawling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Crawling Blockchain Data...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Start Blockchain Crawl
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Twitter className="h-5 w-5" />
                Social Media Crawler
              </CardTitle>
              <CardDescription>
                Analyze Twitter/X profile and posts for sentiment and credibility assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter Handle</Label>
                <Input
                  id="twitter"
                  placeholder="@username"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet-link">Associated Wallet (Optional)</Label>
                <Input
                  id="wallet-link"
                  placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>

              <Button onClick={handleTwitterCrawl} disabled={crawling || !twitterHandle} className="w-full">
                {crawling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Crawling Twitter Data...
                  </>
                ) : (
                  <>
                    <Twitter className="mr-2 h-4 w-4" />
                    Start Twitter Crawl
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Identity Matching
              </CardTitle>
              <CardDescription>
                Link blockchain wallets with social media accounts for comprehensive analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wallet-match">Wallet Address</Label>
                  <Input
                    id="wallet-match"
                    placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter-match">Twitter Handle</Label>
                  <Input
                    id="twitter-match"
                    placeholder="@username"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleIdentityMatch}
                disabled={crawling || !walletAddress || !twitterHandle}
                className="w-full"
              >
                {crawling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Matching Identity...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Match Identity
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {crawling && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Crawl Results</CardTitle>
            <CardDescription>Data successfully crawled and processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.data && (
                <div className="grid gap-4">
                  {Array.isArray(results.data) ? (
                    results.data.map((item: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{item.blockchain || "Social"}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.transactions?.length || item.posts?.length || 0} items
                          </span>
                        </div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 border rounded-lg">
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                        {JSON.stringify(results.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
