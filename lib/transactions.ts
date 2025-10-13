import { createClient } from "./supabase-client"

export interface Transaction {
  id: number
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  date: string
  createdAt: string
}

export const CATEGORIES = {
  income: ["Salary", "Freelance", "Investment", "Business", "Other Income"],
  expense: ["Food", "Transport", "Utilities", "Entertainment", "Healthcare", "Education", "Shopping", "Other Expense"],
}

export async function getTransactions(): Promise<Transaction[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("transactions").select("*").order("date", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
  return data
}

export async function addTransaction(transaction: Omit<Transaction, "id" | "createdAt">) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated for adding transaction.")

  const { data, error } = await supabase
    .from("transactions")
    .insert([{ ...transaction, user_id: user.id }])
    .select()

  if (error) {
    console.error("Error adding transaction:", error)
    throw new Error(error.message)
  }
  return data[0]
}

export async function updateTransaction(id: number, updates: Partial<Transaction>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating transaction:", error)
    throw new Error(error.message)
  }
  return data[0]
}

export async function deleteTransaction(id: number) {
  const supabase = createClient()
  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting transaction:", error)
    throw new Error(error.message)
  }
  return true
}
