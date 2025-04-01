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
  crypto: z.enum(["BTC", "ETH", "SOL", "DOGE", "ADA"]),
  amount: z.coerce.number().positive({
    message: "Amount must be greater than 0.",
  }),
})

const cryptoPrices = {
  BTC: 65000,
  ETH: 3500,
  SOL: 150,
  DOGE: 0.15,
  ADA: 0.5,
}

export function CryptoTrading({ userId, balance }: { userId: string | undefined; balance: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      action: "buy",
      crypto: "BTC",
      amount: 0,
    },
  })

  const watchCrypto = form.watch("crypto")
  const watchAction = form.watch("action")
  const watchAmount = form.watch("amount")

  // Calculate the cost or profit
  const selectedCryptoPrice = cryptoPrices[watchCrypto as keyof typeof cryptoPrices]
  const totalCost = watchAmount * selectedCryptoPrice

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to trade.",
      })
      return
    }

    if (values.action === "buy" && totalCost > balance) {
      toast({
        variant: "destructive",
        title: "Insufficient funds",
        description: "You don't have enough money to complete this purchase.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Update wallet balance
      const newBalance = values.action === "buy" ? balance - totalCost : balance + totalCost

      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId)

      if (walletError) throw walletError

      // Record the transaction
      const { error: transactionError } = await supabase.from("crypto_transactions").insert([
        {
          user_id: userId,
          crypto: values.crypto,
          action: values.action,
          amount: values.amount,
          price: selectedCryptoPrice,
          total: totalCost,
        },
      ])

      if (transactionError) throw transactionError

      toast({
        title: `${values.action === "buy" ? "Bought" : "Sold"} crypto successfully`,
        description: `You ${values.action === "buy" ? "bought" : "sold"} ${values.amount} ${values.crypto} for $${totalCost.toLocaleString()}`,
      })

      form.reset({
        action: "buy",
        crypto: "BTC",
        amount: 0,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error trading crypto",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Crypto</CardTitle>
        <CardDescription>Buy or sell cryptocurrencies with your virtual money</CardDescription>
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
              name="crypto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cryptocurrency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
                      <SelectItem value="DOGE">Dogecoin (DOGE)</SelectItem>
                      <SelectItem value="ADA">Cardano (ADA)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Current price: ${selectedCryptoPrice.toLocaleString()} per {watchCrypto}
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
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the amount of {watchCrypto} you want to {watchAction}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm font-medium">Transaction Summary</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Price per {watchCrypto}:</div>
                <div className="text-sm text-right">${selectedCryptoPrice.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Amount:</div>
                <div className="text-sm text-right">
                  {watchAmount || 0} {watchCrypto}
                </div>
                <div className="text-sm font-medium">Total:</div>
                <div className="text-sm font-medium text-right">${totalCost.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Processing..." : `${watchAction === "buy" ? "Buy" : "Sell"} ${watchCrypto}`}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

