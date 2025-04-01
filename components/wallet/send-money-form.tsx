"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  recipientEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be greater than 0.",
  }),
  note: z.string().optional(),
})

export function SendMoneyForm({ userId, balance }: { userId: string | undefined; balance: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientEmail: "",
      amount: 0,
      note: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to send money.",
      })
      return
    }

    if (values.amount > balance) {
      toast({
        variant: "destructive",
        title: "Insufficient funds",
        description: "You don't have enough money to complete this transaction.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Find recipient by email
      const { data: recipientData, error: recipientError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", values.recipientEmail)
        .single()

      if (recipientError || !recipientData) {
        throw new Error("Recipient not found. Make sure they have an account.")
      }

      const recipientId = recipientData.id

      // Start a transaction
      // 1. Deduct from sender
      const { error: senderError } = await supabase
        .from("wallets")
        .update({ balance: balance - values.amount })
        .eq("user_id", userId)

      if (senderError) throw senderError

      // 2. Add to recipient
      const { data: recipientWallet, error: recipientWalletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", recipientId)
        .single()

      if (recipientWalletError) throw recipientWalletError

      const { error: updateRecipientError } = await supabase
        .from("wallets")
        .update({ balance: recipientWallet.balance + values.amount })
        .eq("user_id", recipientId)

      if (updateRecipientError) throw updateRecipientError

      // 3. Record the transaction
      const { error: transactionError } = await supabase.from("transactions").insert([
        {
          sender_id: userId,
          recipient_id: recipientId,
          amount: values.amount,
          note: values.note || "",
        },
      ])

      if (transactionError) throw transactionError

      toast({
        title: "Money sent successfully",
        description: `You sent $${values.amount.toLocaleString()} to ${values.recipientEmail}`,
      })

      form.reset()
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending money",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Money</CardTitle>
        <CardDescription>Send virtual money to another user</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="recipientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormDescription>Enter the email address of the user you want to send money to.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <Input type="number" className="pl-7" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>Enter the amount you want to send.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a note to your transaction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Sending..." : "Send Money"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

