"use client"

import { useEffect, useState } from "react"
import { useAuthContext } from "@/lib/context/auth-context"
import { FinancialAnalyticsService } from "@/lib/services/financial-analytics"
import { FinancialMetricsCards } from "@/components/dashboard/financial-metrics-cards"
import { PortfolioOverviewChart } from "@/components/dashboard/portfolio-overview-chart"
import { CreditScoreChart } from "@/components/dashboard/credit-score-chart"
import { PortfolioPerformanceChart } from "@/components/dashboard/portfolio-performance-chart"
import { TransactionHistoryTable } from "@/components/dashboard/transaction-history-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, RefreshCw, Download, TrendingUp } from "lucide-react"
import type {
  FinancialMetrics,
  WalletBalance,
  CreditScoreHistory,
  PortfolioPerformance,
  TransactionHistory,
} from "@/lib/services/financial-analytics"

export default function DashboardPage() {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([])
  const [creditHistory, setCreditHistory] = useState<CreditScoreHistory[]>([])
  const [portfolioPerformance, setPortfolioPerformance] = useState<PortfolioPerformance[]>([])
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([])

  const analyticsService = new FinancialAnalyticsService()

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [metricsData, balancesData, creditData, performanceData, transactionsData] = await Promise.all([
        analyticsService.getUserFinancialMetrics(user.id),
        analyticsService.getWalletBalances(user.id),
        analyticsService.getCreditScoreHistory(user.id),
        analyticsService.getPortfolioPerformance(user.id),
        analyticsService.getTransactionHistory(user.id),
      ])

      setMetrics(metricsData)
      setWalletBalances(balancesData)
      setCreditHistory(creditData)
      setPortfolioPerformance(performanceData)
      setTransactionHistory(transactionsData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const handleExportData = () => {
    // Mock export functionality
    const data = {
      metrics,
      walletBalances,
      creditHistory,
      portfolioPerformance,
      transactionHistory,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "financial-data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!user) {
    return <div>Please log in to view your dashboard.</div>
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your financial dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.profile?.full_name || "User"}! Here's your financial overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      {metrics && <FinancialMetricsCards metrics={metrics} />}

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="credit">Credit Score</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <PortfolioOverviewChart data={walletBalances} />
            <PortfolioPerformanceChart data={portfolioPerformance} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <CreditScoreChart data={creditHistory} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Insights
                </CardTitle>
                <CardDescription>Key financial highlights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Portfolio Growth (30d)</span>
                    <span className="text-sm font-bold text-green-600">+{metrics?.monthlyGrowth.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">DeFi Protocols</span>
                    <span className="text-sm font-bold">{metrics?.defiProtocols.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Risk Level</span>
                    <span className="text-sm font-bold text-green-600">Low</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Total Transactions</span>
                    <span className="text-sm font-bold">{metrics?.transactionCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <PortfolioOverviewChart data={walletBalances} />
            <PortfolioPerformanceChart data={portfolioPerformance} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Token Holdings</CardTitle>
              <CardDescription>Detailed breakdown of your cryptocurrency holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {walletBalances.map((balance, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{balance.token}</span>
                      </div>
                      <div>
                        <p className="font-medium">{balance.token}</p>
                        <p className="text-sm text-muted-foreground">{balance.amount.toFixed(4)} tokens</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(balance.value)}
                      </p>
                      <p className="text-sm text-muted-foreground">{balance.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit" className="space-y-6">
          <CreditScoreChart data={creditHistory} />
          <Card>
            <CardHeader>
              <CardTitle>Credit Score Analysis</CardTitle>
              <CardDescription>Factors affecting your creditworthiness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creditHistory.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Wallet Age</span>
                        <span className="text-sm">
                          {creditHistory[creditHistory.length - 1]?.factors.walletAge || 0}/100
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Transaction History</span>
                        <span className="text-sm">
                          {creditHistory[creditHistory.length - 1]?.factors.transactionHistory || 0}/100
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">DeFi Engagement</span>
                        <span className="text-sm">
                          {creditHistory[creditHistory.length - 1]?.factors.defiEngagement || 0}/100
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Portfolio Value</span>
                        <span className="text-sm">
                          {creditHistory[creditHistory.length - 1]?.factors.portfolioValue || 0}/100
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionHistoryTable data={transactionHistory} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
