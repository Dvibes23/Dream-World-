"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import {
  DollarSign,
  Home,
  LineChart,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Trophy,
  User,
  X,
  Wallet,
  BarChart3,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/format"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const { supabase, user, loading } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (user) {
        const { data, error } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()

        if (error) {
          console.error("Error fetching wallet:", error)
          return
        }

        if (data) {
          setWalletBalance(data.balance)
        }
      }
    }

    fetchWalletBalance()
  }, [supabase, user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
    { name: "Trading", href: "/dashboard/trading", icon: LineChart },
    { name: "Staking", href: "/dashboard/staking", icon: Clock },
    { name: "Missions", href: "/dashboard/missions", icon: BarChart3 },
    { name: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
    { name: "Inventory", href: "/dashboard/inventory", icon: Package },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ]

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 border-r">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
              <DollarSign className="h-6 w-6" />
              <span>Dream World</span>
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    pathname === item.href
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-primary",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  )}
                >
                  <item.icon
                    className={cn(
                      pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                      "mr-3 flex-shrink-0 h-5 w-5",
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.user_metadata?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.user_metadata?.username || user?.email?.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground">
                    {walletBalance !== null ? formatCurrency(walletBalance) : "Loading..."}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 flex z-40 md:hidden",
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        style={{ transition: "opacity 0.1s ease-in-out" }}
      >
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-background border-r">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button variant="ghost" size="icon" className="ml-1" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
              <DollarSign className="h-6 w-6" />
              <span>Dream World</span>
            </Link>
          </div>
          <div className="flex-1 h-0 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    pathname === item.href
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-primary",
                    "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                      "mr-4 flex-shrink-0 h-6 w-6",
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {user?.user_metadata?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.user_metadata?.username || user?.email?.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground">
                    {walletBalance !== null ? formatCurrency(walletBalance) : "Loading..."}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between h-16 bg-background border-b px-4 sm:px-6">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <DollarSign className="h-6 w-6" />
          <span>Dream World</span>
        </Link>
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {user?.user_metadata?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pb-8 pt-2 md:pt-0">
          <div className="mx-auto px-4 sm:px-6 md:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

