"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy } from "lucide-react"

interface LeaderboardUser {
  user_id: string
  balance: number
  username?: string
}

export function Leaderboard({ users }: { users: LeaderboardUser[] }) {
  const [usersWithNames, setUsersWithNames] = useState<LeaderboardUser[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUsernames = async () => {
      const enhancedUsers = await Promise.all(
        users.map(async (user) => {
          // Get username from user metadata
          const { data: userData } = await supabase.auth.admin.getUserById(user.user_id)
          const username = userData?.user?.user_metadata?.username || "Unknown User"

          return {
            ...user,
            username,
          }
        }),
      )

      setUsersWithNames(enhancedUsers)
    }

    if (users.length > 0) {
      fetchUsernames()
    }
  }, [users, supabase])

  // If no users, show a message
  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>The richest users in Dream World</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">No users found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>The richest users in Dream World</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Net Worth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersWithNames.map((user, index) => {
              const formattedBalance = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(user.balance)

              return (
                <TableRow key={user.user_id}>
                  <TableCell>
                    {index === 0 ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : index === 1 ? (
                      <Trophy className="h-5 w-5 text-gray-400" />
                    ) : index === 2 ? (
                      <Trophy className="h-5 w-5 text-amber-700" />
                    ) : (
                      index + 1
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.username?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                      </Avatar>
                      <span>{user.username}</span>
                    </div>
                  </TableCell>
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

