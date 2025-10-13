"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ArrowLeftRight,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wallet,
  HandCoins,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"

const links = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: <ArrowLeftRight className="h-5 w-5" />,
  },
  {
    label: "Borrow & Lend",
    href: "/borrow-lend",
    icon: <HandCoins className="h-5 w-5" />,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <User className="h-5 w-5" />,
  },
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void;
  isMobile?: boolean;
}

export function SidebarContent({ isOpen, setIsOpen, isMobile = false }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; avatar?: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Fetch the full profile from the 'profiles' table
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", authUser.id)
        .single()

      if (profile) {
        setUser({ name: profile.name || authUser.email?.split('@')[0] || 'User', avatar: profile.avatar_url })
      } else {
        // Fallback if profile doesn't exist yet
        setUser({ name: authUser.email?.split('@')[0] || 'User', avatar: undefined })
      }
    }
    getUser()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const headerContent = (
    <div className="flex h-16 items-center border-b px-4" style={{ justifyContent: (isOpen || isMobile) ? "space-between" : "center" }}>
        <Link href="/dashboard">
          <AnimatePresence>
            {isOpen ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Wallet className="h-6 w-6 text-primary" />
                <span className="font-bold">Manager</span>
              </motion.div>
            ) : (
              <Wallet key="logo-icon" className="h-6 w-6 text-primary" />
            )}
          </AnimatePresence>
        </Link>
        {!isMobile && (
          <button onClick={() => setIsOpen(!isOpen)} className="rounded-full p-2 hover:bg-accent">
            {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        )}
      </div>
  );

  const navContent = (
      <nav className="flex-1 space-y-2 p-4">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === link.href ? "bg-primary text-primary-foreground hover:bg-primary/90" : "",
              !isOpen && !isMobile && "justify-center",
            )}
          >
            {link.icon}
            <AnimatePresence>
              {(isOpen || isMobile) && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {link.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </nav>
  );

  const footerContent = (
      <div className="mt-auto border-t p-4">
        {user && (
          <Link href="/profile">
            <div
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent",
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {(isOpen || isMobile) && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium truncate flex-1">
                    {user.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "mt-2 flex w-full items-center gap-2 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10",
            !isOpen && !isMobile && "justify-center",
          )}
        >
          <LogOut className="h-5 w-5" />
          <AnimatePresence>
            {(isOpen || isMobile) && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
  );

  if (isMobile) {
    return (
      <div className="flex h-full flex-col">
        {headerContent}
        {navContent}
        {footerContent}
      </div>
    );
  }

  return (
    <motion.div
      animate={{ width: isOpen ? "14rem" : "4.5rem" }}
      transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-50 flex h-full flex-col border-r bg-card text-card-foreground"
    >
      {headerContent}
      {navContent}
      {footerContent}
    </motion.div>
  )
}