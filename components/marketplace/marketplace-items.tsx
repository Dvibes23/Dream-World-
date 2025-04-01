"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface MarketplaceItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
}

export function MarketplaceItems({
  items,
  userId,
  balance,
}: {
  items: MarketplaceItem[]
  userId: string | undefined
  balance: number
}) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || "all"
  const supabase = createClientComponentClient()

  // Filter items by category
  const filteredItems = currentCategory === "all" ? items : items.filter((item) => item.category === currentCategory)

  const buyItem = async (item: MarketplaceItem) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to buy items.",
      })
      return
    }

    if (item.price > balance) {
      toast({
        variant: "destructive",
        title: "Insufficient funds",
        description: "You don't have enough money to buy this item.",
      })
      return
    }

    setIsLoading((prev) => ({ ...prev, [item.id]: true }))

    try {
      // Update wallet balance
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: balance - item.price })
        .eq("user_id", userId)

      if (walletError) throw walletError

      // Add item to user's inventory
      const { error: inventoryError } = await supabase.from("user_inventory").insert([
        {
          user_id: userId,
          item_id: item.id,
          item_name: item.name,
          item_description: item.description,
          item_image: item.image_url,
          purchase_price: item.price,
        },
      ])

      if (inventoryError) throw inventoryError

      toast({
        title: "Purchase successful",
        description: `You bought ${item.name} for $${item.price.toLocaleString()}`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error buying item",
        description: error.message,
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [item.id]: false }))
    }
  }

  // If no items, show a message
  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No items found in this category</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={item.image_url || `/placeholder.svg?height=200&width=400`}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <CardHeader>
            <CardTitle>{item.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
            <p className="text-2xl font-bold">${item.price.toLocaleString()}</p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => buyItem(item)}
              disabled={isLoading[item.id] || item.price > balance}
            >
              {isLoading[item.id] ? "Processing..." : "Buy Now"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

