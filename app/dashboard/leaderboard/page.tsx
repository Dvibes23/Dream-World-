import { Leaderboard } from "@/components/leaderboard/leaderboard"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function LeaderboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get top users by wallet balance
  const { data: leaderboardData } = await supabase
    .from("wallets")
    .select("user_id, balance")
    .order("balance", { ascending: false })
    .limit(20)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">The richest users in Dream World</p>
      </div>
      <Leaderboard users={leaderboardData || []} />
    </div>
  )
}

