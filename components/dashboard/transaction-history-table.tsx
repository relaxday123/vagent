"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpRight, ArrowDownLeft, Search } from "lucide-react"
import type { TransactionHistory } from "@/lib/services/financial-analytics"

interface TransactionHistoryTableProps {
  data: TransactionHistory[]
}

export function TransactionHistoryTable({ data }: TransactionHistoryTableProps) {
  const [filteredData, setFilteredData] = useState(data)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterData(term, filterType)
  }

  const handleFilterType = (type: string) => {
    setFilterType(type)
    filterData(searchTerm, type)
  }

  const filterData = (search: string, type: string) => {
    let filtered = data

    if (type !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === type)
    }

    if (search) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.token.toLowerCase().includes(search.toLowerCase()) || transaction.date.includes(search),
      )
    }

    setFilteredData(filtered)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest wallet activity</CardDescription>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterType} onValueChange={handleFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="incoming">Incoming</SelectItem>
              <SelectItem value="outgoing">Outgoing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Token</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.slice(0, 10).map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.type === "incoming" ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant={transaction.type === "incoming" ? "default" : "secondary"}>
                      {transaction.type}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.token}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  <span className={transaction.type === "incoming" ? "text-green-600" : "text-red-600"}>
                    {transaction.type === "incoming" ? "+" : "-"}
                    {transaction.amount.toFixed(4)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredData.length > 10 && (
          <div className="mt-4 text-center">
            <Button variant="outline">Load More Transactions</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
