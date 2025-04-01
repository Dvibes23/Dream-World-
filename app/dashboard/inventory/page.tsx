import { UserInventory } from "@/components/inventory/user-inventory"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function InventoryPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user inventory
  const { data: inventoryData } = await supabase
    .from("user_inventory")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Your purchased items</p>
      </div>
      <UserInventory items={inventoryData || []} />
    </div>
  )
}

