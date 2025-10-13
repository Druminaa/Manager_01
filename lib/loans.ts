import { createClient } from "./supabase-client"

export interface Loan {
  id: number
  lenderName: string
  principal: number
  apr: number
  term: number // in years
  monthlyPayment: number
  nextPaymentDate: string
  remainingBalance: number
  
  createdAt: string
}

export interface LentItem {
  id: number
  borrowerName: string
  amount: number
  dueDate?: string
  notes?: string
  status: "active" | "paid"
  createdAt: string
}

export async function getLoans(): Promise<Loan[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("loans").select("*")
  if (error) {
    console.error("Error fetching loans:", error)
    return []
  }
  // Map snake_case from DB to camelCase for the app
  return data.map(loan => ({
    id: loan.id,
    lenderName: loan.lender_name,
    principal: loan.principal,
    apr: loan.apr,
    term: loan.term,
    monthlyPayment: loan.monthly_payment,
    nextPaymentDate: loan.next_payment_date,
    remainingBalance: loan.remaining_balance,
    createdAt: loan.created_at,
  }))
}

export async function createLoan(loan: Omit<Loan, "id" | "createdAt" | "remainingBalance">) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated.")

  const newLoan = {
    lender_name: loan.lenderName,
    principal: loan.principal,
    apr: loan.apr,
    term: loan.term,
    monthly_payment: loan.monthlyPayment,
    next_payment_date: loan.nextPaymentDate,
    user_id: user.id,
    remaining_balance: loan.principal,
  }
  const { error } = await supabase.from("loans").insert([newLoan])
  if (error) throw new Error(error.message)
}

export async function deleteLoan(id: number) {
  const supabase = createClient()
  const { error } = await supabase.from("loans").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function updateLoan(id: number, updates: Partial<Loan>) {
  const supabase = createClient()
  // Map camelCase properties to snake_case for the database
  const dbUpdates: { [key: string]: any } = {}
  if (updates.lenderName) dbUpdates.lender_name = updates.lenderName
  if (updates.monthlyPayment) dbUpdates.monthly_payment = updates.monthlyPayment
  if (updates.nextPaymentDate) dbUpdates.next_payment_date = updates.nextPaymentDate
  if (updates.remainingBalance) dbUpdates.remaining_balance = updates.remainingBalance
  // Copy over other properties that don't need mapping
  const { lenderName, monthlyPayment, nextPaymentDate, remainingBalance, ...rest } = updates
  Object.assign(dbUpdates, rest)

  const { error } = await supabase.from("loans").update(dbUpdates).eq("id", id)
  if (error) throw new Error(error.message)
}

// --- Lent Items ---

export async function getLentItems(): Promise<LentItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("lent_items").select("*")
  if (error) {
    console.error("Error fetching lent items:", error)
    return []
  }
  // Map snake_case from DB to camelCase for the app
  return data.map(item => ({
    id: item.id,
    borrowerName: item.borrower_name,
    amount: item.amount,
    dueDate: item.due_date,
    notes: item.notes,
    status: item.status,
    createdAt: item.created_at,
  }))
}

export async function createLentItem(item: Omit<LentItem, "id" | "createdAt" | "status">) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated.")

  const newItem = {
    borrower_name: item.borrowerName,
    amount: item.amount,
    due_date: item.dueDate,
    notes: item.notes,
    user_id: user.id,
    status: "active" as const,
  }
  const { error } = await supabase.from("lent_items").insert([newItem])
  if (error) throw new Error(error.message)
}

export async function deleteLentItem(id: number) {
  const supabase = createClient()
  const { error } = await supabase.from("lent_items").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function updateLentItem(id: number, updates: Partial<LentItem>) {
  const supabase = createClient()
  const { error } = await supabase.from("lent_items").update(updates).eq("id", id)
  if (error) throw new Error(error.message)
}