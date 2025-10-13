"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header";
import { SidebarContent } from "@/components/sidebar";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransactionDialog } from "@/components/transaction-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { ExportMenu } from "@/components/export-menu"
import { TransactionsSkeleton } from "@/components/transactions-skeleton"
import { ChatbotWidget } from "@/components/chatbot-widget"
import { Plus, Search, ArrowUpRight, ArrowDownRight, Edit, Trash2, Filter } from "lucide-react"
import { toast } from "react-toastify"
import { createClient } from "@/lib/supabase-client"
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  type Transaction,
} from "@/lib/transactions"
import { cn } from "@/lib/utils"

export default function TransactionsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null)

  useEffect(() => {
    // Set sidebar state based on window size only on the client
    setIsSidebarOpen(window.innerWidth > 1024)

    const checkAuthAndLoadData = async () => {
      const { data: { session } } = await createClient().auth.getSession()
      if (!session) {
        router.push("/login")
      } else {
        await loadTransactions()
      }
    }
    checkAuthAndLoadData()
  }, [router])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchQuery, filterType])

  const loadTransactions = async () => {
    setIsLoading(true)
    const data = await getTransactions()
    setTransactions(data)
    setIsLoading(false)
  }

  const filterTransactions = () => {
    let filtered = transactions

    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredTransactions(filtered)
  }

  const handleAddTransaction = async (transaction: Omit<Transaction, "id" | "createdAt">) => {
    try {
      if (selectedTransaction) {
        await updateTransaction(selectedTransaction.id, transaction)
        toast.success("Transaction has been successfully updated.")
      } else {
        await addTransaction(transaction)
        toast.success("Transaction has been successfully added.")
      }
      await loadTransactions()
      setSelectedTransaction(undefined)
    } catch (error) {
      toast.error("Failed to save transaction. Please try again.")
      console.error(error)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDialogOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setTransactionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return
    try {
      await deleteTransaction(transactionToDelete)
      await loadTransactions()
      toast.info("Transaction has been successfully deleted.")
    } catch (error) {
      toast.error("Failed to delete transaction. Please try again.")
      console.error(error)
    } finally {
      setTransactionToDelete(null)
    }
  }

  const totalIncome = transactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0) || 0
  const totalExpenses = transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) || 0

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden lg:block">
        <SidebarContent isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>
      <div className="flex flex-col w-full">
        <MobileHeader isSidebarOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className={cn("transition-all duration-300", isSidebarOpen ? "lg:pl-56" : "lg:pl-[4.5rem]")}>
            {isLoading ? (
              <TransactionsSkeleton />
            ) : (
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground mt-1">Manage all your financial transactions</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <ExportMenu transactions={filteredTransactions} />
                    <Button
                      onClick={() => {
                        setSelectedTransaction(undefined)
                        setDialogOpen(true)
                      }}
                      className="gap-2 flex-1 sm:flex-initial"
                    >
                      <Plus className="h-4 w-4" />
                      Add Transaction
                    </Button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-500">${totalIncome.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">${totalExpenses.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${(totalIncome - totalExpenses).toLocaleString()}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>View and manage your transaction history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search transactions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="income">Income Only</SelectItem>
                          <SelectItem value="expense">Expenses Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transactions List */}
                    <div className="space-y-3">
                      {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <p>No transactions found</p>
                          <p className="text-sm mt-1">Try adjusting your filters or add a new transaction</p>
                        </div>
                      ) : (
                        filteredTransactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors gap-4"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div
                                className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                  transaction.type === "income" ? "bg-emerald-500/10" : "bg-red-500/10"
                                }`}
                              >
                                {transaction.type === "income" ? (
                                  <ArrowUpRight className="h-6 w-6 text-emerald-500" />
                                ) : (
                                  <ArrowDownRight className="h-6 w-6 text-red-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{transaction.description}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="secondary" className="text-xs">
                                    {transaction.category}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(transaction.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between pt-2 sm:pt-0">
                              <div
                                className={`font-semibold text-lg ${
                                  transaction.type === "income" ? "text-emerald-500" : "text-red-500"
                                }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(transaction)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(transaction.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleAddTransaction}
        transaction={selectedTransaction}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
      />

      <ChatbotWidget />
    </div>
  )
}
