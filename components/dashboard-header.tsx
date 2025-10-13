"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import Link from "next/link"

export function DashboardHeader() {
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser({
        name: userData.name || "User",
        email: userData.email || "",
        avatar: userData.avatar,
      });
    } else {
      // Fallback for when no user is in local storage
      setUser({ name: "Welcome", email: "", avatar: "" });
    }
  }, [])

  // You might want a loading state here, but for simplicity, we'll just return null if user isn't loaded yet.
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-balance">
          <Link href="/dashboard">Welcome back, {user.name}!</Link>
        </h1>
        <p className="text-muted-foreground mt-1">Here's your financial overview</p>
      </div>
      
    </div>
  )
}
