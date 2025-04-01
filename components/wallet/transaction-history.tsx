"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Transaction {
  id: string
  sender_id: string
  recipient_id: string
  amount: number
  note: string
  created_at: string
}

interface TransactionWithUsers extends Transaction {
  sender_username?: string
  recipient_username?: string
}

export function TransactionHistory({
  transactions,
  userId,
}: {
  transactions: Transaction[]
  userId: string | undefined
}) {
  const [transactionsWithUsers, setTransactionsWithUsers] = useState<TransactionWithUsers[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUsernames = async () => {
      const enhancedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          // Get sender username
          let senderUsername = "Unknown"
          if (transaction.sender_id) {
            const { data: senderData } = await supabase.auth.admin.getUserById(transaction.sender_id)
            senderUsername = senderData?.user?.user_metadata?.username || "Unknown"
          }

          // Get recipient username
          let recipientUsername = "Unknown"
          if (transaction.recipient_id) {
            const { data: recipientData } = await supabase.auth.admin.getUserById(transaction.recipient_id)
            recipientUsername = recipientData?.user?.user_metadata?.username || "Unknown"
          }

          return {
            ...transaction,
            sender_username: senderUsername,
            recipient_username: recipientUsername,
          }
        }),
      )

      setTransactionsWithUsers(enhancedTransactions)
    }

    if (transactions.length > 0) {
      fetchUsernames()
    }
  }, [transactions, supabase])

  // If no transactions, show a message
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your complete transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">No transactions yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Your complete transaction history</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionsWithUsers.map((transaction) => {
              const isSender = transaction.sender_id === userId
              const formattedAmount = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(transaction.amount)

              const formattedDate = new Date(transaction.created_at).toLocaleDateString()

              return (
                <TableRow key={transaction.id}>
                  <TableCell>{formattedDate}</TableCell>
                  <TableCell>
                    <span className={isSender ? "text-red-500" : "text-green-500"}>
                      {isSender ? "Sent" : "Received"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {isSender
                            ? transaction.recipient_username?.charAt(0).toUpperCase()
                            : transaction.sender_username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{isSender ? transaction.recipient_username : transaction.sender_username}</span>
                    </div>
                  </TableCell>
                  <TableCell className={isSender ? "text-red-500" : "text-green-500"}>
                    {isSender ? `-${formattedAmount}` : `+${formattedAmount}`}
                  </TableCell>
                  <TableCell>{transaction.note || "-"}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

