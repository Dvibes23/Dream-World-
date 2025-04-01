import { MarketplaceCategories } from "@/components/marketplace/marketplace-categories"
import { MarketplaceItems } from "@/components/marketplace/marketplace-items"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function MarketplacePage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get wallet data
  const { data: walletData } = await supabase.from("wallets").select("*").eq("user_id", user?.id).single()

  // Get marketplace items
  const { data: itemsData } = await supabase.from("marketplace_items").select("*").order("price", { ascending: true })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">Buy luxury items with your virtual money</p>
      </div>
      <MarketplaceCategories />
      <MarketplaceItems items={itemsData || []} userId={user?.id} balance={walletData?.balance || 0} />
    </div>
  )
}

