"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, Share2 } from "lucide-react"
import type { Transaction } from "@/lib/transactions"
import { exportToCSV, exportToPDF, shareViaWhatsApp } from "@/lib/export"
import { toast } from "react-toastify"

interface ExportMenuProps {
  transactions: Transaction[]
}

export function ExportMenu({ transactions }: ExportMenuProps) {
  const handleExportCSV = () => {
    exportToCSV(transactions)
    toast.success("Your transactions have been exported to CSV.")
  }

  const handleExportPDF = () => {
    exportToPDF(transactions)
    toast.success("Your transactions have been exported to PDF.")
  }

  const handleShareWhatsApp = () => {
    shareViaWhatsApp(transactions)
    toast.info("Your transaction summary is ready to share on WhatsApp.")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export & Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          Export to Excel (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Export to PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Share Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleShareWhatsApp} className="gap-2 cursor-pointer">
          <Share2 className="h-4 w-4" />
          Share via WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
