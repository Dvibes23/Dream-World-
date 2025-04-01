"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDown, ArrowUp } from "lucide-react"

interface CryptoData {
  name: string
  symbol: string
  price: number
  change24h: number
  marketCap: number
}

export function CryptoMarket() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([
    {
      name: "Bitcoin",
      symbol: "BTC",
      price: 65000,
      change24h: 2.5,
      marketCap: 1250000000000,
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      price: 3500,
      change24h: 1.8,
      marketCap: 420000000000,
    },
    {
      name: "Solana",
      symbol: "SOL",
      price: 150,
      change24h: 4.2,
      marketCap: 65000000000,
    },
    {
      name: "Dogecoin",
      symbol: "DOGE",
      price: 0.15,
      change24h: -1.2,
      marketCap: 20000000000,
    },
    {
      name: "Cardano",
      symbol: "ADA",
      price: 0.5,
      change24h: -0.5,
      marketCap: 17500000000,
    },
  ])

  // Simulate price changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData((prevData) =>
        prevData.map((crypto) => {
          const randomChange = (Math.random() * 2 - 1) * 0.5 // Between -0.5% and 0.5%
          const newPrice = crypto.price * (1 + randomChange / 100)
          return {
            ...crypto,
            price: newPrice,
            change24h: crypto.change24h + randomChange / 5, // Adjust 24h change slightly
          }
        }),
      )
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto Market</CardTitle>
        <CardDescription>Live cryptocurrency prices and market data</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>24h Change</TableHead>
              <TableHead className="hidden md:table-cell">Market Cap</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cryptoData.map((crypto) => (
              <TableRow key={crypto.symbol}>
                <TableCell>
                  <div className="font-medium">{crypto.name}</div>
                  <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                </TableCell>
                <TableCell>
                  $
                  {crypto.price.toLocaleString(undefined, {
                    minimumFractionDigits: crypto.price < 1 ? 4 : 2,
                    maximumFractionDigits: crypto.price < 1 ? 4 : 2,
                  })}
                </TableCell>
                <TableCell>
                  <div className={`flex items-center ${crypto.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {crypto.change24h >= 0 ? (
                      <ArrowUp className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDown className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(crypto.change24h).toFixed(2)}%
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">${(crypto.marketCap / 1000000000).toFixed(1)}B</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

