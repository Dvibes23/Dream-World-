import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart4, Clock, LineChart, Trophy } from "lucide-react"

export function DashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crypto Trading</CardTitle>
          <LineChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm">Trade Bitcoin, Ethereum, and other cryptocurrencies with your virtual money.</div>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/crypto" className="w-full">
            <Button variant="outline" className="w-full">
              Start Trading
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Forex Trading</CardTitle>
          <BarChart4 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm">Trade major currency pairs like USD/EUR, USD/JPY with simulated volatility.</div>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/forex" className="w-full">
            <Button variant="outline" className="w-full">
              Start Trading
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Staking</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm">Lock your virtual money for 24h, 7d, or 30d to earn simulated interest.</div>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/staking" className="w-full">
            <Button variant="outline" className="w-full">
              Start Staking
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Missions</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm">Complete missions to earn additional virtual money and rewards.</div>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/missions" className="w-full">
            <Button variant="outline" className="w-full">
              View Missions
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

