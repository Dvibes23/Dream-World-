import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"

interface WalletData {
  balance: number
  user_id: string
  created_at: string
}

export function WalletOverview({ wallet }: { wallet: WalletData | null }) {
  // Format balance with commas
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(wallet?.balance || 0)

  // Format date
  const formattedDate = wallet?.created_at ? new Date(wallet.created_at).toLocaleDateString() : "Unknown"

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Your Wallet
        </CardTitle>
        <CardDescription>Your virtual money details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Current Balance</h3>
          <div className="text-4xl font-bold text-green-500">{formattedBalance}</div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Wallet Created</h3>
          <div>{formattedDate}</div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Wallet ID</h3>
          <div className="font-mono text-sm">{wallet?.user_id || "Unknown"}</div>
        </div>
      </CardContent>
    </Card>
  )
}

