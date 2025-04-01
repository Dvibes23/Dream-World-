import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { WalletOverview } from "@/components/wallet/wallet-overview"
import { SendMoneyForm } from "@/components/wallet/send-money-form"
import { TransactionHistory } from "@/components/wallet/transaction-history"

export default async function WalletPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get wallet data
  const { data: walletData } = await supabase.from("wallets").select("*").eq("user_id", user?.id).single()

  // Get transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">Manage your virtual money and transactions</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <WalletOverview wallet={walletData} />
        <SendMoneyForm userId={user?.id} balance={walletData?.balance || 0} />
      </div>
      <TransactionHistory transactions={transactions || []} userId={user?.id} />
    </div>
  )
}

