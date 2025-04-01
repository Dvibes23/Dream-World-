"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Trophy } from "lucide-react"

interface Mission {
  id: string
  title: string
  description: string
  reward: number
  requirement: {
    type: string
    value: number
  }
}

export function DailyMissions({ userId, balance }: { userId: string | undefined; balance: number }) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Sample missions
  const missions: Mission[] = [
    {
      id: "mission-1",
      title: "Stake $10,000,000",
      description: "Stake at least $10M in any staking option",
      reward: 100000000, // $100M
      requirement: {
        type: "stake",
        value: 10000000,
      },
    },
    {
      id: "mission-2",
      title: "Trade $5,000,000 in Crypto",
      description: "Buy or sell at least $5M worth of cryptocurrency",
      reward: 50000000, // $50M
      requirement: {
        type: "crypto",
        value: 5000000,
      },
    },
    {
      id: "mission-3",
      title: "Send Money to a Friend",
      description: "Send any amount of money to another user",
      reward: 25000000, // $25M
      requirement: {
        type: "send",
        value: 1,
      },
    },
    {
      id: "mission-4",
      title: "Trade Forex",
      description: "Make at least one forex trade of any amount",
      reward: 30000000, // $30M
      requirement: {
        type: "forex",
        value: 1,
      },
    },
  ]

  const completeMission = async (mission: Mission) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to complete missions.",
      })
      return
    }

    setIsLoading((prev) => ({ ...prev, [mission.id]: true }))

    try {
      // Check if mission is already completed
      const { data: existingMission, error: checkError } = await supabase
        .from("user_missions")
        .select("*")
        .eq("user_id", userId)
        .eq("mission_id", mission.id)
        .single()

      if (existingMission) {
        toast({
          variant: "destructive",
          title: "Mission already completed",
          description: "You have already completed this mission.",
        })
        return
      }

      // For simplicity, we'll auto-complete the mission
      // In a real app, you would check if the user has met the requirements

      // Update wallet balance
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: balance + mission.reward })
        .eq("user_id", userId)

      if (walletError) throw walletError

      // Record the mission completion
      const { error: missionError } = await supabase.from("user_missions").insert([
        {
          user_id: userId,
          mission_id: mission.id,
          mission_title: mission.title,
          reward: mission.reward,
          status: "completed",
        },
      ])

      if (missionError) throw missionError

      toast({
        title: "Mission completed!",
        description: `You earned $${mission.reward.toLocaleString()} for completing "${mission.title}"`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error completing mission",
        description: error.message,
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [mission.id]: false }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Daily Missions
        </CardTitle>
        <CardDescription>Complete missions to earn rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {missions.map((mission) => (
            <div key={mission.id} className="rounded-lg border p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{mission.title}</h3>
                  <p className="text-sm text-muted-foreground">{mission.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-500">+${mission.reward.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button size="sm" onClick={() => completeMission(mission)} disabled={isLoading[mission.id]}>
                  {isLoading[mission.id] ? "Processing..." : "Complete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

