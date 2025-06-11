"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Wallet, Shield, Activity, DollarSign } from "lucide-react"
import type { FinancialMetrics } from "@/lib/services/financial-analytics"

interface FinancialMetricsCardsProps {
  metrics: FinancialMetrics
}

export function FinancialMetricsCards({ metrics }: FinancialMetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return "text-green-600"
    if (score >= 650) return "text-yellow-600"
    return "text-red-600"
  }

  const getCreditScoreLabel = (score: number) => {
    if (score >= 750) return "Excellent"
    if (score >= 700) return "Good"
    if (score >= 650) return "Fair"
    return "Poor"
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.portfolioValue)}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {metrics.monthlyGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={metrics.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"}>
              {metrics.monthlyGrowth >= 0 ? "+" : ""}
              {metrics.monthlyGrowth.toFixed(1)}% this month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getCreditScoreColor(metrics.creditScore)}`}>{metrics.creditScore}</div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {getCreditScoreLabel(metrics.creditScore)}
            </Badge>
          </div>
          <Progress value={(metrics.creditScore - 300) / 5.5} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalBalance.toFixed(4)} ETH</div>
          <p className="text-xs text-muted-foreground">{metrics.transactionCount} transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.riskScore}/100</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {metrics.defiProtocols.slice(0, 2).map((protocol) => (
              <Badge key={protocol} variant="outline" className="text-xs">
                {protocol}
              </Badge>
            ))}
            {metrics.defiProtocols.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{metrics.defiProtocols.length - 2} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
