import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { DashboardRecentTransactions } from "@/components/dashboard/dashboard-recent-transactions"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get wallet data
  const { data: walletData } = await supabase.from("wallets").select("*").eq("user_id", user?.id).single()

  // Get recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Dream World dashboard</p>
      </div>
      <DashboardOverview wallet={walletData} />
      <DashboardCards />
      <DashboardRecentTransactions transactions={transactions || []} userId={user?.id} />
    </div>
  )
}

