"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { formatCurrency } from "@/lib/format"
import { ArrowDown, ArrowUp, Bitcoin, DollarSign, RefreshCcw } from "lucide-react"

// Mock crypto data
const cryptoAssets = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", price: 45000, change: 2.5, icon: Bitcoin },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", price: 3200, change: -1.2, icon: Bitcoin },
  { id: "solana", name: "Solana", symbol: "SOL", price: 120, change: 5.7, icon: Bitcoin },
  { id: "cardano", name: "Cardano", symbol: "ADA", price: 1.2, change: 0.8, icon: Bitcoin },
]

// Mock forex data
const forexPairs = [
  { id: "usd-eur", name: "USD/EUR", price: 0.92, change: -0.3 },
  { id: "usd-jpy", name: "USD/JPY", price: 148.5, change: 0.5 },
  { id: "usd-gbp", name: "USD/GBP", price: 0.78, change: -0.2 },
  { id: "usd-cad", name: "USD/CAD", price: 1.35, change: 0.1 },
]

export default function TradingPage() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [tradeAmount, setTradeAmount] = useState("")
  const [selectedAsset, setSelectedAsset] = useState(cryptoAssets[0])
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [cryptoPrices, setCryptoPrices] = useState(cryptoAssets)
  const [forexPrices, setForexPrices] = useState(forexPairs)

  useEffect(() => {
    fetchWalletBalance()

    // Simulate price changes every 10 seconds
    const interval = setInterval(() => {
      updatePrices()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const fetchWalletBalance = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()

      if (error) throw error
      if (data) setWalletBalance(data.balance)
    } catch (error: any) {
      console.error("Error fetching wallet balance:", error)
    }
  }

  const updatePrices = () => {
    // Update crypto prices with random fluctuations
    setCryptoPrices((prev) =>
      prev.map((asset) => ({
        ...asset,
        price: asset.price * (1 + (Math.random() * 0.1 - 0.05)),
        change: Math.random() * 10 - 5,
      })),
    )

    // Update forex prices with random fluctuations
    setForexPrices((prev) =>
      prev.map((pair) => ({
        ...pair,
        price: pair.price * (1 + (Math.random() * 0.02 - 0.01)),
        change: Math.random() * 2 - 1,
      })),
    )
  }

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const amount = Number.parseFloat(tradeAmount)

      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount")
      }

      if (tradeType === "buy" && (walletBalance === null || amount > walletBalance)) {
        throw new Error("Insufficient funds")
      }

      // Calculate new balance
      const newBalance = tradeType === "buy" ? (walletBalance || 0) - amount : (walletBalance || 0) + amount

      // Update wallet balance
      const { error } = await supabase.from("wallets").update({ balance: newBalance }).eq("user_id", user?.id)

      if (error) throw error

      // Record the transaction
      const { error: transactionError } = await supabase.from("transactions").insert([
        {
          sender_id: tradeType === "buy" ? user?.id : "system",
          recipient_id: tradeType === "buy" ? "system" : user?.id,
          amount,
          note: `${tradeType === "buy" ? "Bought" : "Sold"} ${selectedAsset.name} for ${formatCurrency(amount)}`,
        },
      ])

      if (transactionError) throw transactionError

      toast({
        title: "Trade successful!",
        description: `You have ${tradeType === "buy" ? "bought" : "sold"} ${selectedAsset.name} for ${formatCurrency(amount)}`,
      })

      // Reset form
      setTradeAmount("")
      fetchWalletBalance()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete trade",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading</h1>
          <p className="text-muted-foreground">Grow your virtual fortune with simulated trading</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Available Balance</CardTitle>
              <Button variant="outline" size="icon" onClick={fetchWalletBalance}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-primary" />
                <div className="text-4xl font-bold">
                  {walletBalance !== null ? formatCurrency(walletBalance) : "Loading..."}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trade Assets</CardTitle>
              <CardDescription>Buy or sell virtual assets to grow your fortune</CardDescription>
            </CardHeader>
            <form onSubmit={handleTrade}>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={tradeType === "buy" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setTradeType("buy")}
                  >
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Buy
                  </Button>
                  <Button
                    type="button"
                    variant={tradeType === "sell" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setTradeType("sell")}
                  >
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Sell
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-9"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : `${tradeType === "buy" ? "Buy" : "Sell"} Now`}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <Tabs defaultValue="crypto">
          <TabsList>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="forex">Forex</TabsTrigger>
          </TabsList>
          <TabsContent value="crypto">
            <Card>
              <CardHeader>
                <CardTitle>Cryptocurrency Market</CardTitle>
                <CardDescription>Simulated cryptocurrency prices with random fluctuations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                    <div>Asset</div>
                    <div>Price</div>
                    <div>24h Change</div>
                    <div className="text-right">Action</div>
                  </div>
                  <div className="divide-y">
                    {cryptoPrices.map((asset) => (
                      <div key={asset.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                        <div className="flex items-center gap-2">
                          <asset.icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                          </div>
                        </div>
                        <div>{formatCurrency(asset.price)}</div>
                        <div className={asset.change >= 0 ? "text-green-500" : "text-red-500"}>
                          {asset.change >= 0 ? "+" : ""}
                          {asset.change.toFixed(2)}%
                        </div>
                        <div className="text-right">
                          <Button variant="outline" size="sm" onClick={() => setSelectedAsset(asset)}>
                            Select
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="forex">
            <Card>
              <CardHeader>
                <CardTitle>Forex Market</CardTitle>
                <CardDescription>Simulated foreign exchange rates with random fluctuations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                    <div>Pair</div>
                    <div>Rate</div>
                    <div>24h Change</div>
                    <div className="text-right">Action</div>
                  </div>
                  <div className="divide-y">
                    {forexPrices.map((pair) => (
                      <div key={pair.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                        <div className="font-medium">{pair.name}</div>
                        <div>{pair.price.toFixed(4)}</div>
                        <div className={pair.change >= 0 ? "text-green-500" : "text-red-500"}>
                          {pair.change >= 0 ? "+" : ""}
                          {pair.change.toFixed(2)}%
                        </div>
                        <div className="text-right">
                          <Button variant="outline" size="sm" onClick={() => setSelectedAsset(pair)}>
                            Select
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

