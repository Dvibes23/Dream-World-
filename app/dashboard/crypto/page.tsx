import { CryptoTrading } from "@/components/crypto/crypto-trading"
import { CryptoMarket } from "@/components/crypto/crypto-market"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function CryptoPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Crypto Trading</h1>
        <p className="text-muted-foreground">Trade cryptocurrencies with your virtual money</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <CryptoTrading userId={user?.id} balance={walletData?.balance || 0} />
        <CryptoMarket />
      </div>
    </div>
  )
}

