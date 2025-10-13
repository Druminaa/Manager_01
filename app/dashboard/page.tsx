"use client"

// Import necessary React hooks and components
import { useEffect, useState } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { useRouter } from "next/navigation"
import { SidebarContent } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SummaryCards } from "@/components/summary-cards"
import { FinancialChart } from "@/components/financial-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { ChatbotWidget } from "@/components/chatbot-widget"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { getTransactions, type Transaction } from "@/lib/transactions"
import { createClient } from "@/lib/supabase-client"
import { cn } from "@/lib/utils"

// This is the main component for the dashboard page.
export default function DashboardPage() {
  // Initialize router for navigation
  const router = useRouter()

  // State for managing loading status to show or hide content while data is being fetched
  const [isLoading, setIsLoading] = useState(true)
  // State for storing the list of all financial transactions
  const [transactions, setTransactions] = useState<Transaction[]>([])
  // State for controlling the sidebar's open/closed state, enabling the collapsible animation
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // useEffect hook runs after the component mounts to handle authentication and data fetching
  useEffect(() => {
    // Set sidebar state based on window size only on the client
    setIsSidebarOpen(window.innerWidth > 1024)

    const checkAuthAndLoadData = async () => {
      const { data: { session } } = await createClient().auth.getSession()
      if (!session) {
        router.push("/login")
      } else {
        const data = await getTransactions()
        setTransactions(data)
        setIsLoading(false)
      }
    }
    checkAuthAndLoadData()
  }, [router])

  // Calculate total income by filtering for 'income' transactions and summing their amounts
  const totalIncome = transactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0) || 0
  // Calculate total expenses by filtering for 'expense' transactions and summing their amounts
  const totalExpenses = transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) || 0
  // Calculate the final balance
  const balance = totalIncome - totalExpenses

  // Create a summary data object to pass to the SummaryCards component
  const summaryData = {
    totalIncome,
    totalExpenses,
    balance,
  }

  // Render the main dashboard layout
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* The collapsible sidebar component */}
      <div className="hidden lg:block">
        <SidebarContent isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>
      <div className="flex flex-col w-full">
        <MobileHeader isSidebarOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className={cn("transition-all duration-300", isSidebarOpen ? "lg:pl-56" : "lg:pl-[4.5rem]")}>
            {isLoading ? (
              <DashboardSkeleton />
            ) : (
              <>
                <DashboardHeader />
                <div className="space-y-6">
                  <SummaryCards data={summaryData} />
                  <div className="grid gap-6 lg:grid-cols-2">
                    <FinancialChart transactions={transactions} />
                    <RecentTransactions />
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      {/* The floating chatbot widget for user assistance */}
      <ChatbotWidget />
    </div>
  )
}
