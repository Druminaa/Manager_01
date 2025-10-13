"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Sparkles } from "lucide-react"
import { getTransactions } from "@/lib/transactions"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

const QUICK_ACTIONS = ["Show my balance", "Recent transactions", "Monthly summary", "Spending by category"]

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your MoneyManager assistant. I can help you with your finances. Try asking me about your balance, recent transactions, or spending patterns!",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const generateResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase()
    const transactions = await getTransactions()

    // Balance queries
    if (lowerMessage.includes("balance") || lowerMessage.includes("total")) {
      const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
      const balance = totalIncome - totalExpenses
      return `Your current balance is $${balance.toLocaleString()}. You have $${totalIncome.toLocaleString()} in income and $${totalExpenses.toLocaleString()} in expenses.`
    }

    // Recent transactions
    if (lowerMessage.includes("recent") || lowerMessage.includes("last")) {
      const recent = transactions.slice(0, 5)
      if (recent.length === 0) {
        return "You don't have any transactions yet. Start by adding your first transaction!"
      }
      const list = recent
        .map((t) => `${t.type === "income" ? "+" : "-"}$${t.amount} - ${t.description} (${t.category})`)
        .join("\n")
      return `Here are your recent transactions:\n\n${list}`
    }

    // Monthly summary
    if (lowerMessage.includes("month") || lowerMessage.includes("summary")) {
      const currentMonth = new Date().getMonth()
      const monthlyTransactions = transactions.filter((t) => new Date(t.date).getMonth() === currentMonth)
      const income = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const expenses = monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
      return `This month:\n💰 Income: $${income.toLocaleString()}\n💸 Expenses: $${expenses.toLocaleString()}\n📊 Net: $${(income - expenses).toLocaleString()}\n\nYou have ${monthlyTransactions.length} transactions this month.`
    }

    // Category spending
    if (lowerMessage.includes("category") || lowerMessage.includes("spending")) {
      const expenses = transactions.filter((t) => t.type === "expense")
      const categoryTotals: Record<string, number> = {}
      expenses.forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
      })
      const sorted = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
      if (sorted.length === 0) {
        return "You don't have any expense transactions yet."
      }
      const list = sorted.map(([cat, amount]) => `${cat}: $${amount.toLocaleString()}`).join("\n")
      return `Your top spending categories:\n\n${list}`
    }

    // Income queries
    if (lowerMessage.includes("income") || lowerMessage.includes("earn")) {
      const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      return `Your total income is $${income.toLocaleString()}. Keep up the great work!`
    }

    // Expense queries
    if (lowerMessage.includes("expense") || lowerMessage.includes("spent")) {
      const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
      return `Your total expenses are $${expenses.toLocaleString()}. Consider reviewing your spending to find savings opportunities.`
    }

    // Help
    if (lowerMessage.includes("help") || lowerMessage.includes("what can you")) {
      return "I can help you with:\n\n• Check your balance\n• View recent transactions\n• Get monthly summaries\n• Analyze spending by category\n• Track income and expenses\n\nJust ask me anything about your finances!"
    }

    // Default response
    return "I'm here to help with your finances! Try asking me about your balance, recent transactions, monthly summary, or spending by category. You can also click the quick action buttons below!"
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate bot thinking time
    const responseText = await generateResponse(text)
    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botResponse])
    setIsTyping(false)
  }

  const handleQuickAction = (action: string) => {
    handleSendMessage(action)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] shadow-2xl flex flex-col z-50 border-2">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">MoneyManager AI</h3>
                <p className="text-xs opacity-90">Your financial assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div
                        className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t bg-muted/30">
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-xs h-7"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage(inputValue)
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  )
}
