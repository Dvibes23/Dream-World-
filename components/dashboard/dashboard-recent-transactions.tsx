"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"

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

export function DashboardRecentTransactions({
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
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your most recent money transfers</CardDescription>
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
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your most recent money transfers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {transactionsWithUsers.map((transaction) => {
            const isSender = transaction.sender_id === userId
            const formattedAmount = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(transaction.amount)

            const formattedDate = new Date(transaction.created_at).toLocaleDateString()

            return (
              <div key={transaction.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {isSender
                      ? transaction.recipient_username?.charAt(0).toUpperCase()
                      : transaction.sender_username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {isSender ? `To: ${transaction.recipient_username}` : `From: ${transaction.sender_username}`}
                  </p>
                  <p className="text-sm text-muted-foreground">{formattedDate}</p>
                  {transaction.note && <p className="text-sm text-muted-foreground">Note: {transaction.note}</p>}
                </div>
                <div className={`ml-auto font-medium ${isSender ? "text-red-500" : "text-green-500"}`}>
                  {isSender ? `-${formattedAmount}` : `+${formattedAmount}`}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

