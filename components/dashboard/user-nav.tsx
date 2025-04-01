"use client"

import { useSupabase } from "@/components/supabase-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function UserNav() {
  const { session, signOut } = useSupabase()
  const [username, setUsername] = useState<string>("")
  const [balance, setBalance] = useState<number>(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        // Get user metadata for username
        const { data: userData } = await supabase.auth.getUser()
        setUsername(userData.user?.user_metadata?.username || "User")

        // Get wallet balance
        const { data: walletData, error } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", session.user.id)
          .single()

        if (!error && walletData) {
          setBalance(walletData.balance)
        }
      }
    }

    fetchUserData()
  }, [session, supabase])

  if (!session) {
    return null
  }

  // Format balance with commas
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(balance)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt={username} />
            <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{username}</p>
            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
            <p className="text-sm font-bold text-green-500 mt-2">{formattedBalance}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

