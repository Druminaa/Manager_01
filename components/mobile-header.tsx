"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, Wallet } from "lucide-react"
import { SidebarContent } from "./sidebar"

interface MobileHeaderProps {
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
}

export function MobileHeader({ isSidebarOpen, setIsSidebarOpen }: MobileHeaderProps) {
  return (
    <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-background sticky top-0 z-40">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SidebarContent isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={true} />
        </SheetContent>
      </Sheet>
      <Link href="/dashboard" className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-primary" />
        <span className="font-bold">Manager</span>
      </Link>
      {/* This empty div is a spacer to help center the title correctly */}
      <div className="w-9 h-9" />
    </header>
  )
}