import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface InventoryItem {
  id: string
  user_id: string
  item_id: string
  item_name: string
  item_description: string
  item_image: string
  purchase_price: number
  created_at: string
}

export function UserInventory({ items }: { items: InventoryItem[] }) {
  // Group items by category (we'll infer from name for simplicity)
  const categories = {
    cars: items.filter(
      (item) => item.item_name.toLowerCase().includes("car") || item.item_name.toLowerCase().includes("vehicle"),
    ),
    houses: items.filter(
      (item) => item.item_name.toLowerCase().includes("house") || item.item_name.toLowerCase().includes("mansion"),
    ),
    gadgets: items.filter(
      (item) => item.item_name.toLowerCase().includes("phone") || item.item_name.toLowerCase().includes("watch"),
    ),
    clothing: items.filter(
      (item) => item.item_name.toLowerCase().includes("shirt") || item.item_name.toLowerCase().includes("shoes"),
    ),
    other: items.filter(
      (item) =>
        !item.item_name.toLowerCase().includes("car") &&
        !item.item_name.toLowerCase().includes("vehicle") &&
        !item.item_name.toLowerCase().includes("house") &&
        !item.item_name.toLowerCase().includes("mansion") &&
        !item.item_name.toLowerCase().includes("phone") &&
        !item.item_name.toLowerCase().includes("watch") &&
        !item.item_name.toLowerCase().includes("shirt") &&
        !item.item_name.toLowerCase().includes("shoes"),
    ),
  }

  // If no items, show a message
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Inventory</CardTitle>
          <CardDescription>Items you've purchased from the marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">No items in your inventory yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Items ({items.length})</TabsTrigger>
        <TabsTrigger value="cars">Cars ({categories.cars.length})</TabsTrigger>
        <TabsTrigger value="houses">Houses ({categories.houses.length})</TabsTrigger>
        <TabsTrigger value="gadgets">Gadgets ({categories.gadgets.length})</TabsTrigger>
        <TabsTrigger value="clothing">Clothing ({categories.clothing.length})</TabsTrigger>
        <TabsTrigger value="other">Other ({categories.other.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{renderItems(items)}</div>
      </TabsContent>

      <TabsContent value="cars" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{renderItems(categories.cars)}</div>
      </TabsContent>

      <TabsContent value="houses" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{renderItems(categories.houses)}</div>
      </TabsContent>

      <TabsContent value="gadgets" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{renderItems(categories.gadgets)}</div>
      </TabsContent>

      <TabsContent value="clothing" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{renderItems(categories.clothing)}</div>
      </TabsContent>

      <TabsContent value="other" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{renderItems(categories.other)}</div>
      </TabsContent>
    </Tabs>
  )
}

function renderItems(items: InventoryItem[]) {
  if (items.length === 0) {
    return <div className="col-span-full text-center py-4 text-muted-foreground">No items in this category</div>
  }

  return items.map((item) => {
    const purchaseDate = new Date(item.created_at).toLocaleDateString()
    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(item.purchase_price)

    return (
      <Card key={item.id} className="overflow-hidden">
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={item.item_image || `/placeholder.svg?height=200&width=400`}
            alt={item.item_name}
            className="w-full h-full object-cover"
          />
        </div>
        <CardHeader>
          <CardTitle>{item.item_name}</CardTitle>
          <CardDescription>Purchased on {purchaseDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">{item.item_description}</p>
          <p className="font-medium">Purchase price: {formattedPrice}</p>
        </CardContent>
      </Card>
    )
  })
}

