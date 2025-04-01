"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AdminUser {
  user_id: string
  balance: number
  username?: string
  email?: string
}

export function AdminUsers({ users }: { users: AdminUser[] }) {
  const [usersWithDetails, setUsersWithDetails] = useState<AdminUser[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUserDetails = async () => {
      const enhancedUsers = await Promise.all(
        users.map(async (user) => {
          // Get user details
          const { data: userData } = await supabase.auth.admin.getUserById(user.user_id)

          return {
            ...user,
            username: userData?.user?.user_metadata?.username || "Unknown",
            email: userData?.user?.email || "Unknown",
          }
        }),
      )

      setUsersWithDetails(enhancedUsers)
    }

    if (users.length > 0) {
      fetchUserDetails()
    }
  }, [users, supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage users and their balances</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersWithDetails.map((user) => {
              const formattedBalance = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(user.balance)

              return (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.username?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                      </Avatar>
                      <span>{user.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="font-mono text-xs">{user.user_id}</TableCell>
                  <TableCell className="text-right font-medium">{formattedBalance}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

