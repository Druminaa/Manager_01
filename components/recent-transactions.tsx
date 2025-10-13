"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { getTransactions, type Transaction } from "@/lib/transactions"

export function RecentTransactions() {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const fetchRecent = async () => {
      const allTransactions = await getTransactions()
      // Since new transactions are added to the beginning of the list,
      // we can just take the first few to get the most recent ones.
      setRecentTransactions(allTransactions.slice(0, 5))
    }
    fetchRecent()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      transaction.type === "income" ? "bg-emerald-500/10" : "bg-red-500/10"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`font-semibold text-right ${transaction.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent transactions to display.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
