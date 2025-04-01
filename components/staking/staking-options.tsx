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
  duration: z.enum(["24h", "7d", "30d"]),
  amount: z.coerce.number().positive({
    message: "Amount must be greater than 0.",
  }),
})

const stakingOptions = {
  "24h": {
    interestRate: 0.001, // 0.1% per day
    description: "Lock your money for 24 hours",
  },
  "7d": {
    interestRate: 0.01, // 1% per week
    description: "Lock your money for 7 days",
  },
  "30d": {
    interestRate: 0.05, // 5% per month
    description: "Lock your money for 30 days",
  },
}

export function StakingOptions({ userId, balance }: { userId: string | undefined; balance: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: "24h",
      amount: 0,
    },
  })

  const watchDuration = form.watch("duration")
  const watchAmount = form.watch("amount")

  // Calculate the interest
  const selectedOption = stakingOptions[watchDuration as keyof typeof stakingOptions]
  const interestAmount = watchAmount * selectedOption.interestRate
  const totalReturn = watchAmount + interestAmount

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to stake.",
      })
      return
    }

    if (values.amount > balance) {
      toast({
        variant: "destructive",
        title: "Insufficient funds",
        description: "You don't have enough money to stake this amount.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Calculate end date based on duration
      const now = new Date()
      const endDate = new Date(now)

      if (values.duration === "24h") {
        endDate.setDate(now.getDate() + 1)
      } else if (values.duration === "7d") {
        endDate.setDate(now.getDate() + 7)
      } else if (values.duration === "30d") {
        endDate.setDate(now.getDate() + 30)
      }

      // Update wallet balance (deduct staked amount)
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: balance - values.amount })
        .eq("user_id", userId)

      if (walletError) throw walletError

      // Create stake record
      const { error: stakeError } = await supabase.from("stakes").insert([
        {
          user_id: userId,
          amount: values.amount,
          duration: values.duration,
          interest_rate: selectedOption.interestRate,
          interest_amount: interestAmount,
          total_return: totalReturn,
          start_date: now.toISOString(),
          end_date: endDate.toISOString(),
          status: "active",
        },
      ])

      if (stakeError) throw stakeError

      toast({
        title: "Staking successful",
        description: `You've staked $${values.amount.toLocaleString()} for ${values.duration}. Expected return: $${totalReturn.toLocaleString()}`,
      })

      form.reset({
        duration: "24h",
        amount: 0,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error staking funds",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stake Your Money</CardTitle>
        <CardDescription>Lock your virtual money to earn interest over time</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staking Period</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="24h">24 Hours (0.1%)</SelectItem>
                      <SelectItem value="7d">7 Days (1%)</SelectItem>
                      <SelectItem value="30d">30 Days (5%)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>{selectedOption.description}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Stake</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <Input type="number" className="pl-7" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter the amount you want to stake. Available: ${balance.toLocaleString()}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm font-medium">Staking Summary</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Principal:</div>
                <div className="text-sm text-right">${watchAmount?.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground">Interest Rate:</div>
                <div className="text-sm text-right">{(selectedOption.interestRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Interest Amount:</div>
                <div className="text-sm text-right">${interestAmount.toLocaleString()}</div>
                <div className="text-sm font-medium">Total Return:</div>
                <div className="text-sm font-medium text-right">${totalReturn.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Processing..." : "Stake Now"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

