"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart4,
  CreditCard,
  Home,
  LineChart,
  Package,
  ShoppingBag,
  Trophy,
  Users,
  Clock,
  Settings,
} from "lucide-react"

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Wallet",
    href: "/dashboard/wallet",
    icon: CreditCard,
  },
  {
    title: "Crypto Trading",
    href: "/dashboard/crypto",
    icon: LineChart,
  },
  {
    title: "Forex Trading",
    href: "/dashboard/forex",
    icon: BarChart4,
  },
  {
    title: "Staking",
    href: "/dashboard/staking",
    icon: Clock,
  },
  {
    title: "Missions",
    href: "/dashboard/missions",
    icon: Trophy,
  },
  {
    title: "Marketplace",
    href: "/dashboard/marketplace",
    icon: ShoppingBag,
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
  },
  {
    title: "Leaderboard",
    href: "/dashboard/leaderboard",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2 px-2 py-4">
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent" : "transparent",
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

