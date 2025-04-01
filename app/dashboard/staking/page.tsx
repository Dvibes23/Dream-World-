import { StakingOptions } from "@/components/staking/staking-options"
import { ActiveStakes } from "@/components/staking/active-stakes"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function StakingPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get wallet data
  const { data: walletData } = await supabase.from("wallets").select("*").eq("user_id", user?.id).single()

  // Get active stakes
  const { data: stakesData } = await supabase
    .from("stakes")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staking</h1>
        <p className="text-muted-foreground">Lock your virtual money to earn interest over time</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <StakingOptions userId={user?.id} balance={walletData?.balance || 0} />
        <ActiveStakes stakes={stakesData || []} />
      </div>
    </div>
  )
}

