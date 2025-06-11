"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CreditScoreHistory } from "@/lib/services/financial-analytics"

interface CreditScoreChartProps {
  data: CreditScoreHistory[]
}

export function CreditScoreChart({ data }: CreditScoreChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Score Trends</CardTitle>
        <CardDescription>Your credit score evolution over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[300, 850]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8884d8"
                strokeWidth={3}
                name="Credit Score"
                dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="factors.walletAge"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Wallet Age"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="factors.transactionHistory"
                stroke="#ffc658"
                strokeWidth={2}
                name="Transaction History"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="factors.defiEngagement"
                stroke="#ff7300"
                strokeWidth={2}
                name="DeFi Engagement"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
