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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  action: z.enum(["buy", "sell"]),
  pair: z.enum(["EUR/USD", "USD/JPY", "GBP/USD", "USD/CHF", "AUD/USD"]),
  amount: z.coerce.number().positive({
    message: "Amount must be greater than 0.",
  }),
})

const forexRates = {
  "EUR/USD": 1.08,
  "USD/JPY": 150.5,
  "GBP/USD": 1.25,
  "USD/CHF": 0.9,
  "AUD/USD": 0.65,
}

export function ForexTrading({ userId, balance }: { userId: string | undefined; balance: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      action: "buy",
      pair: "EUR/USD",
      amount: 0,
    },
  })

  const watchPair = form.watch("pair")
  const watchAction = form.watch("action")
  const watchAmount = form.watch("amount")

  // Calculate the cost or profit
  const selectedRate = forexRates[watchPair as keyof typeof forexRates]
  const totalCost = watchAmount * 10000 // Standard lot size

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to trade.",
      })
      return
    }

    if (totalCost > balance) {
      toast({
        variant: "destructive",
        title: "Insufficient funds",
        description: "You don't have enough money to complete this trade.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate profit/loss
      const profitFactor = Math.random() * 0.2 - 0.1 // Between -10% and 10%
      const profit = totalCost * profitFactor

      // Update wallet balance
      const newBalance = values.action === "buy" ? balance - totalCost + profit : balance - totalCost - profit

      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId)

      if (walletError) throw walletError

      // Record the transaction
      const { error: transactionError } = await supabase.from("forex_transactions").insert([
        {
          user_id: userId,
          pair: values.pair,
          action: values.action,
          amount: values.amount,
          rate: selectedRate,
          total: totalCost,
          profit: profit,
        },
      ])

      if (transactionError) throw transactionError

      toast({
        title: `Forex trade executed`,
        description: `You ${values.action === "buy" ? "bought" : "sold"} ${values.amount} lots of ${values.pair} with ${profit > 0 ? "profit" : "loss"} of $${Math.abs(profit).toLocaleString()}`,
      })

      form.reset({
        action: "buy",
        pair: "EUR/USD",
        amount: 0,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error trading forex",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Forex</CardTitle>
        <CardDescription>Buy or sell major currency pairs with your virtual money</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pair"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency Pair</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency pair" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                      <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                      <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                      <SelectItem value="USD/CHF">USD/CHF</SelectItem>
                      <SelectItem value="AUD/USD">AUD/USD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Current rate: {selectedRate} for {watchPair}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lots</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>Enter the number of lots you want to {watchAction}. 1 lot = $10,000</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm font-medium">Transaction Summary</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Rate:</div>
                <div className="text-sm text-right">{selectedRate}</div>
                <div className="text-sm text-muted-foreground">Lots:</div>
                <div className="text-sm text-right">{watchAmount || 0}</div>
                <div className="text-sm font-medium">Total Cost:</div>
                <div className="text-sm font-medium text-right">${totalCost.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Processing..." : `${watchAction === "buy" ? "Buy" : "Sell"} ${watchPair}`}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

