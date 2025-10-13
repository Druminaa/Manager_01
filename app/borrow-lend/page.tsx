"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarContent } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, TrendingDown, TrendingUp, Edit, CheckCircle } from "lucide-react"
import { toast } from "react-toastify"
import { BorrowLendSkeleton } from "@/components/borrow-lend-skeleton"
import { createClient } from "@/lib/supabase-client"
import { getLoans, createLoan, deleteLoan, updateLoan, type Loan, getLentItems, createLentItem, deleteLentItem, updateLentItem, type LentItem } from "@/lib/loans"
import { cn } from "@/lib/utils"

export default function BorrowLendPage() {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const [loans, setLoans] = useState<Loan[]>([])
  const [lentItems, setLentItems] = useState<LentItem[]>([])

  const [loanDialogOpen, setLoanDialogOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | undefined>()
  const [lentDialogOpen, setLentDialogOpen] = useState(false)
  const [selectedLentItem, setSelectedLentItem] = useState<LentItem | undefined>()

  useEffect(() => {
    setIsSidebarOpen(window.innerWidth > 1024)
    const checkAuthAndLoadData = async () => {
      const { data: { session } } = await createClient().auth.getSession()
      if (!session) {
        router.push("/login")
      } else {
        setAuthLoading(false)
        await loadData()
      }
    }
    checkAuthAndLoadData()
  }, [router])

  const loadData = async () => {
    setIsLoading(true)
    const [loansData, lentItemsData] = await Promise.all([getLoans(), getLentItems()])
    setLoans(loansData)
    setLentItems(lentItemsData)
    setIsLoading(false)
  }

  const handleSaveLoan = async (loanData: Loan) => {
    try {
      if (loanData.id) {
        await updateLoan(loanData.id, loanData)
        toast.success("Debt has been updated.")
      } else {
        await createLoan(loanData)
        toast.success("New debt has been added.")
      }
      await loadData()
      setLoanDialogOpen(false)
      setSelectedLoan(undefined)
    } catch (error) {
      toast.error("Failed to save debt information.")
      console.error(error)
    }
  }

  const handleSaveLentItem = async (lentData: LentItem) => {
    try {
      if (lentData.id) {
        await updateLentItem(lentData.id, lentData)
        toast.success("Lent item has been updated.")
      } else {
        await createLentItem(lentData)
        toast.success("New lent item has been added.")
      }
      await loadData()
      setLentDialogOpen(false)
      setSelectedLentItem(undefined)
    } catch (error) {
      toast.error("Failed to save lent item information.")
      console.error(error)
    }
  }

  const handleMarkAsPaid = async (id: number) => {
    try {
      await updateLentItem(id, { status: "paid" })
      await loadData()
      toast.info("Item marked as paid.")
    } catch (error) {
      toast.error("Failed to update item status.")
      console.error(error)
    }
  }

  const handleDeleteLoan = async (id: number) => {
    try {
      await deleteLoan(id)
      await loadData()
      toast.info("Debt has been removed.")
    } catch (error) {
      toast.error("Failed to remove debt.")
      console.error(error)
    }
  }

  const handleDeleteLentItem = async (id: number) => {
    try {
      await deleteLentItem(id)
      await loadData()
      toast.info("Lent item has been removed.")
    } catch (error) {
      toast.error("Failed to remove lent item.")
      console.error(error)
    }
  }

  const totalDebt = loans?.reduce((sum, loan) => sum + loan.remainingBalance, 0) || 0
  const totalOwed = lentItems?.filter(item => item.status === 'active').reduce((sum, item) => sum + item.amount, 0) || 0

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
              <BorrowLendSkeleton />
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold">Borrow & Lend</h1>
                  <p className="text-muted-foreground mt-1">Track your debts and the money you've lent.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="border-l-4 border-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">You Borrowed</CardTitle>
                      <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">${totalDebt.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Total outstanding debt</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">You Lent</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-500">${totalOwed.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Total money owed to you</p>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="borrowed" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="borrowed">You Borrowed</TabsTrigger>
                    <TabsTrigger value="lent">You Lent</TabsTrigger>
                  </TabsList>

                  {/* Borrowed Tab */}
                  <TabsContent value="borrowed" className="space-y-4">
                    <div className="flex justify-end">
                      <Button onClick={() => {
                        setSelectedLoan(undefined)
                        setLoanDialogOpen(true)
                      }}>
                        <Plus className="mr-2 h-4 w-4" /> 
                        Add New Debt
                      </Button>
                    </div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Debts</CardTitle>
                        <CardDescription>List of all your current debts and loans.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {loans.length > 0 ? loans.map(loan => (
                          <div key={loan.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{loan.lenderName}</p>
                                <p className="text-sm text-muted-foreground">{loan.apr}% APR · {loan.term} Years</p>
                              </div>
                              <div className="flex">
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedLoan(loan); setLoanDialogOpen(true); }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteLoan(loan.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-red-500 font-medium">
                                  ${loan.remainingBalance.toLocaleString()} <span className="text-muted-foreground font-normal">left</span>
                                </span>
                                <span className="text-muted-foreground">${loan.principal.toLocaleString()}</span>
                              </div>
                              <Progress value={((loan.principal - loan.remainingBalance) / loan.principal) * 100} className="h-2 bg-red-500/20 [&>div]:bg-red-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Monthly Payment</p>
                                <p className="font-medium">${loan.monthlyPayment.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Next Payment</p>
                                <p className="font-medium">{new Date(loan.nextPaymentDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        )) : <p className="text-center text-muted-foreground py-8">No debts tracked yet.</p>}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Lent Tab */}
                  <TabsContent value="lent" className="space-y-4">
                    <div className="flex justify-end">
                      <Button onClick={() => {
                        setSelectedLentItem(undefined)
                        setLentDialogOpen(true)
                      }}>
                        <Plus className="mr-2 h-4 w-4" /> 
                        Add Lent Item
                      </Button>
                    </div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Money You Lent</CardTitle>
                        <CardDescription>List of all money you have lent to others.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {lentItems.length > 0 ? lentItems.map(item => {
                          const isOverdue = item.status === 'active' && item.dueDate && new Date(item.dueDate) < new Date();
                          return (
                            <div key={item.id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <p className="font-semibold">{item.borrowerName}</p>
                                <div className="flex items-center gap-2">
                                  {item.status === 'paid' ? <Badge variant="secondary">Paid</Badge> :
                                  isOverdue ? <Badge variant="destructive">Overdue</Badge> :
                                  <Badge className="bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30">Active</Badge>
                                  }
                                  {item.status === 'active' && (
                                    <Button variant="ghost" size="icon" onClick={() => handleMarkAsPaid(item.id)}>
                                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    </Button>
                                  )}
                                  <div className="flex">
                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedLentItem(item); setLentDialogOpen(true); }}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLentItem(item.id)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <p className="text-2xl font-bold my-2">${item.amount.toLocaleString()}</p>
                              {item.dueDate && <p className="text-sm text-muted-foreground">Due on: {new Date(item.dueDate).toLocaleDateString()}</p>}
                              {item.notes && <p className="text-sm mt-2 bg-muted p-2 rounded-md">{item.notes}</p>}
                            </div>
                          )
                        }) : <p className="text-center text-muted-foreground py-8">No lent amounts tracked yet.</p>}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}

            {/* Dialogs */}
            <AddLoanDialog open={loanDialogOpen} onOpenChange={setLoanDialogOpen} onSave={handleSaveLoan} loan={selectedLoan} />
            <AddLentItemDialog open={lentDialogOpen} onOpenChange={setLentDialogOpen} onSave={handleSaveLentItem} item={selectedLentItem} />
          </div>
        </main>
      </div>
    </div>
  )
}

// AddLoanDialog Component
function AddLoanDialog({ open, onOpenChange, onSave, loan }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: (data: any) => void, loan?: Loan }) {
  const [formData, setFormData] = useState({ lenderName: "", principal: "", apr: "", term: "", monthlyPayment: "", nextPaymentDate: "" });

  useEffect(() => {
    if (loan) {
      setFormData({ lenderName: loan.lenderName, principal: String(loan.principal), apr: String(loan.apr), term: String(loan.term), monthlyPayment: String(loan.monthlyPayment), nextPaymentDate: loan.nextPaymentDate.split('T')[0] });
    } else {
      setFormData({ lenderName: "", principal: "", apr: "", term: "", monthlyPayment: "", nextPaymentDate: "" });
    }
  }, [loan, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: loan?.id, ...formData, principal: parseFloat(formData.principal), apr: parseFloat(formData.apr), term: parseInt(formData.term), monthlyPayment: parseFloat(formData.monthlyPayment) });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{loan ? 'Edit Debt' : 'Add New Debt'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Lender Name" value={formData.lenderName} onChange={e => setFormData({...formData, lenderName: e.target.value})} required />
          <Input type="number" placeholder="Principal Amount" value={formData.principal} onChange={e => setFormData({...formData, principal: e.target.value})} required />
          <Input type="number" placeholder="Interest Rate (APR %)" value={formData.apr} onChange={e => setFormData({...formData, apr: e.target.value})} required />
          <Input type="number" placeholder="Repayment Term (Years)" value={formData.term} onChange={e => setFormData({...formData, term: e.target.value})} required />
          <Input type="number" placeholder="Monthly Payment" value={formData.monthlyPayment} onChange={e => setFormData({...formData, monthlyPayment: e.target.value})} required />
          <div><Label>Next Payment Date</Label><Input type="date" value={formData.nextPaymentDate} onChange={e => setFormData({...formData, nextPaymentDate: e.target.value})} required /></div>
          <DialogFooter><Button type="submit">{loan ? 'Save Changes' : 'Add Debt'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// AddLentItemDialog Component
function AddLentItemDialog({ open, onOpenChange, onSave, item }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: (data: any) => void, item?: LentItem }) {
  const [formData, setFormData] = useState({ borrowerName: "", amount: "", dueDate: "", notes: "" });

  useEffect(() => {
    if (item) {
      setFormData({ borrowerName: item.borrowerName, amount: String(item.amount), dueDate: item.dueDate?.split('T')[0] || "", notes: item.notes || "" });
    } else {
      setFormData({ borrowerName: "", amount: "", dueDate: "", notes: "" });
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: item?.id, ...formData, amount: parseFloat(formData.amount) });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{item ? 'Edit Lent Item' : 'Add Lent Item'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Borrower Name" value={formData.borrowerName} onChange={e => setFormData({...formData, borrowerName: e.target.value})} required />
          <Input type="number" placeholder="Amount" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
          <div><Label>Due Date (Optional)</Label><Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} /></div>
          <Input placeholder="Notes (Optional)" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          <DialogFooter><Button type="submit">{item ? 'Save Changes' : 'Add Item'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}