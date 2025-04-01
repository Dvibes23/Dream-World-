"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDown, ArrowUp } from "lucide-react"

interface ForexData {
  pair: string
  rate: number
  change24h: number
  spread: number
}

export function ForexMarket() {
  const [forexData, setForexData] = useState<ForexData[]>([
    {
      pair: "EUR/USD",
      rate: 1.08,
      change24h: 0.15,
      spread: 0.0002,
    },
    {
      pair: "USD/JPY",
      rate: 150.5,
      change24h: -0.25,
      spread: 0.03,
    },
    {
      pair: "GBP/USD",
      rate: 1.25,
      change24h: 0.08,
      spread: 0.0003,
    },
    {
      pair: "USD/CHF",
      rate: 0.9,
      change24h: -0.12,
      spread: 0.0004,
    },
    {
      pair: "AUD/USD",
      rate: 0.65,
      change24h: 0.05,
      spread: 0.0003,
    },
  ])

  // Simulate rate changes
  useEffect(() => {
    const interval = setInterval(() => {
      setForexData((prevData) =>
        prevData.map((forex) => {
          const randomChange = (Math.random() * 2 - 1) * 0.001 // Small random change
          const newRate = forex.rate * (1 + randomChange)
          return {
            ...forex,
            rate: newRate,
            change24h: forex.change24h + randomChange * 100, // Adjust 24h change
          }
        }),
      )
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forex Market</CardTitle>
        <CardDescription>Live currency pair rates and market data</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pair</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>24h Change</TableHead>
              <TableHead className="hidden md:table-cell">Spread</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forexData.map((forex) => (
              <TableRow key={forex.pair}>
                <TableCell>
                  <div className="font-medium">{forex.pair}</div>
                </TableCell>
                <TableCell>{forex.rate.toFixed(4)}</TableCell>
                <TableCell>
                  <div className={`flex items-center ${forex.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {forex.change24h >= 0 ? (
                      <ArrowUp className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDown className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(forex.change24h).toFixed(2)}%
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{forex.spread.toFixed(4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

