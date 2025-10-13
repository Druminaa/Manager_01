"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface SummaryData {
  totalIncome: number
  totalExpenses: number
  balance: number
}

export function SummaryCards({ data }: { data: SummaryData }) {
  const incomeChange = 12.5
  const expenseChange = -8.3
  const balanceChange = 15.2

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.totalIncome.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
            <ArrowUpRight className="h-3 w-3" />
            <span>+{incomeChange}% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.totalExpenses.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
            <ArrowDownRight className="h-3 w-3" />
            <span>{expenseChange}% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.balance.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
            <ArrowUpRight className="h-3 w-3" />
            <span>+{balanceChange}% from last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
