import { ForexTrading } from "@/components/forex/forex-trading"
import { ForexMarket } from "@/components/forex/forex-market"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function ForexPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get wallet data
  const { data: walletData } = await supabase.from("wallets").select("*").eq("user_id", user?.id).single()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Forex Trading</h1>
        <p className="text-muted-foreground">Trade major currency pairs with your virtual money</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <ForexTrading userId={user?.id} balance={walletData?.balance || 0} />
        <ForexMarket />
      </div>
    </div>
  )
}

