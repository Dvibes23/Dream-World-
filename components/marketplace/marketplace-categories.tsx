"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Car, Home, Smartphone, ShoppingBag } from "lucide-react"

export function MarketplaceCategories() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || "all"

  const categories = [
    { id: "all", name: "All Items", icon: ShoppingBag },
    { id: "cars", name: "Cars", icon: Car },
    { id: "houses", name: "Houses", icon: Home },
    { id: "gadgets", name: "Gadgets", icon: Smartphone },
    { id: "clothing", name: "Clothing", icon: ShoppingBag },
  ]

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams)
    if (categoryId === "all") {
      params.delete("category")
    } else {
      params.set("category", categoryId)
    }
    router.push(`/dashboard/marketplace?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const Icon = category.icon
        return (
          <Button
            key={category.id}
            variant={currentCategory === category.id ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => handleCategoryChange(category.id)}
          >
            <Icon className="h-4 w-4" />
            {category.name}
          </Button>
        )
      })}
    </div>
  )
}

