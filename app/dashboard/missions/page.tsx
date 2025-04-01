import { DailyMissions } from "@/components/missions/daily-missions"
import { MissionHistory } from "@/components/missions/mission-history"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function MissionsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get wallet data
  const { data: walletData } = await supabase.from("wallets").select("*").eq("user_id", user?.id).single()

  // Get user missions
  const { data: userMissionsData } = await supabase
    .from("user_missions")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Missions</h1>
        <p className="text-muted-foreground">Complete missions to earn additional virtual money</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <DailyMissions userId={user?.id} balance={walletData?.balance || 0} />
        <MissionHistory missions={userMissionsData || []} />
      </div>
    </div>
  )
}

