"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Clock } from "lucide-react"

interface Stake {
  id: string
  user_id: string
  amount: number
  duration: string
  interest_rate: number
  interest_amount: number
  total_return: number
  start_date: string
  end_date: string
  status: string
}

export function ActiveStakes({ stakes }: { stakes: Stake[] }) {
  const [activeStakes, setActiveStakes] = useState<Stake[]>(stakes)
  const [timeLeft, setTimeLeft] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Calculate time left for each stake
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: Record<string, string> = {}

      activeStakes.forEach((stake) => {
        if (stake.status === "active") {
          const now = new Date()
          const endDate = new Date(stake.end_date)
          const diff = endDate.getTime() - now.getTime()

          if (diff <= 0) {
            newTimeLeft[stake.id] = "Ready to claim"
          } else {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            if (days > 0) {
              newTimeLeft[stake.id] = `${days}d ${hours}h ${minutes}m`
            } else {
              newTimeLeft[stake.id] = `${hours}h ${minutes}m`
            }
          }
        } else {
          newTimeLeft[stake.id] = "Completed"
        }
      })

      setTimeLeft(newTimeLeft)
    }, 60000) // Update every minute

    // Initial calculation
    const initialTimeLeft: Record<string, string> = {}
    activeStakes.forEach((stake) => {
      if (stake.status === "active") {
        const now = new Date()
        const endDate = new Date(stake.end_date)
        const diff = endDate.getTime() - now.getTime()

        if (diff <= 0) {
          initialTimeLeft[stake.id] = "Ready to claim"
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

          if (days > 0) {
            initialTimeLeft[stake.id] = `${days}d ${hours}h ${minutes}m`
          } else {
            initialTimeLeft[stake.id] = `${hours}h ${minutes}m`
          }
        }
      } else {
        initialTimeLeft[stake.id] = "Completed"
      }
    })
    setTimeLeft(initialTimeLeft)

    return () => clearInterval(interval)
  }, [activeStakes])

  const claimStake = async (stake: Stake) => {
    try {
      // Get current wallet balance
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", stake.user_id)
        .single()

      if (walletError) throw walletError

      // Update wallet balance (add staked amount + interest)
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: walletData.balance + stake.total_return })
        .eq("user_id", stake.user_id)

      if (updateError) throw updateError

      // Update stake status
      const { error: stakeError } = await supabase.from("stakes").update({ status: "completed" }).eq("id", stake.id)

      if (stakeError) throw stakeError

      toast({
        title: "Stake claimed successfully",
        description: `$${stake.total_return.toLocaleString()} has been added to your wallet.`,
      })

      // Update local state
      setActiveStakes((prevStakes) => prevStakes.map((s) => (s.id === stake.id ? { ...s, status: "completed" } : s)))

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error claiming stake",
        description: error.message,
      })
    }
  }

  // If no stakes, show a message
  if (stakes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Stakes</CardTitle>
          <CardDescription>Your current active stakes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">No active stakes</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Stakes</CardTitle>
        <CardDescription>Your current active stakes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeStakes.map((stake) => {
            const now = new Date()
            const endDate = new Date(stake.end_date)
            const canClaim = now >= endDate && stake.status === "active"

            return (
              <div key={stake.id} className="rounded-lg border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">${stake.amount.toLocaleString()}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stake.duration} at {(stake.interest_rate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Return: ${stake.total_return.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Interest: ${stake.interest_amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {timeLeft[stake.id] || "Calculating..."}
                  </div>
                  {stake.status === "active" && (
                    <Button size="sm" disabled={!canClaim} onClick={() => canClaim && claimStake(stake)}>
                      {canClaim ? "Claim" : "Locked"}
                    </Button>
                  )}
                  {stake.status === "completed" && <span className="text-sm text-green-500">Claimed</span>}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

