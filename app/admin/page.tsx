import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminUsers } from "@/components/admin/admin-users"
import { AdminItems } from "@/components/admin/admin-items"

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user is admin (for simplicity, we'll just check if they're the first user)
  const { data: firstUser } = await supabase
    .from("wallets")
    .select("user_id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single()

  const isAdmin = firstUser?.user_id === user?.id

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Get all users
  const { data: usersData } = await supabase
    .from("wallets")
    .select("user_id, balance")
    .order("balance", { ascending: false })

  // Get all marketplace items
  const { data: itemsData } = await supabase.from("marketplace_items").select("*").order("price", { ascending: true })

  // Calculate total money in circulation
  const totalMoney = usersData?.reduce((sum, user) => sum + user.balance, 0) || 0

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-8">
        <AdminDashboard
          totalUsers={usersData?.length || 0}
          totalItems={itemsData?.length || 0}
          totalMoney={totalMoney}
        />

        <AdminUsers users={usersData || []} />

        <AdminItems items={itemsData || []} />
      </div>
    </div>
  )
}

