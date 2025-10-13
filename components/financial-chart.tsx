"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Transaction } from "@/lib/transactions"

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(142.1 76.2% 36.3%)",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(0 84.2% 60.2%)",
  },
}

interface FinancialChartProps {
  transactions: Transaction[]
}

export function FinancialChart({ transactions }: FinancialChartProps) {
  const processChartData = () => {
    const monthlyData: { [key: string]: { month: string; income: number; expenses: number } } = {}
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)

    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      monthlyData[monthKey] = {
        month: monthNames[date.getMonth()],
        income: 0,
        expenses: 0,
      }
    }

    transactions.forEach((t) => {
      const transactionDate = new Date(t.date)
      if (transactionDate >= sixMonthsAgo) {
        const monthKey = `${transactionDate.getFullYear()}-${transactionDate.getMonth()}`
        if (monthlyData[monthKey]) {
          if (t.type === "income") {
            monthlyData[monthKey].income += t.amount
          } else {
            monthlyData[monthKey].expenses += t.amount
          }
        }
      }
    })

    return Object.values(monthlyData)
  }

  const chartData = processChartData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
        <CardDescription>Income and expenses over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#888888" fontSize={12} />
              <YAxis tickLine={false} axisLine={false} stroke="#888888" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="income" stackId="1" stroke={chartConfig.income.color} fill={chartConfig.income.color} fillOpacity={0.4} />
              <Area type="monotone" dataKey="expenses" stackId="1" stroke={chartConfig.expenses.color} fill={chartConfig.expenses.color} fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
