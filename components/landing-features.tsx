import { Banknote, BarChart4, Clock, CreditCard, LineChart, ShoppingBag, Trophy, Users } from "lucide-react"

export function LandingFeatures() {
  const features = [
    {
      icon: <Banknote className="h-10 w-10 text-purple-500" />,
      title: "Virtual Wallet",
      description: "Start with $1 billion and send money to other users instantly.",
    },
    {
      icon: <LineChart className="h-10 w-10 text-blue-500" />,
      title: "Crypto Trading",
      description: "Simulate buying and selling cryptocurrencies with real-time prices.",
    },
    {
      icon: <BarChart4 className="h-10 w-10 text-indigo-500" />,
      title: "Forex Trading",
      description: "Trade major currency pairs in our risk-free environment.",
    },
    {
      icon: <Clock className="h-10 w-10 text-pink-500" />,
      title: "Staking",
      description: "Lock your virtual money to earn interest over time.",
    },
    {
      icon: <ShoppingBag className="h-10 w-10 text-orange-500" />,
      title: "Virtual Store",
      description: "Buy luxury items and build your dream collection.",
    },
    {
      icon: <Trophy className="h-10 w-10 text-yellow-500" />,
      title: "Leaderboard",
      description: "Compete with others to become the richest user.",
    },
    {
      icon: <Users className="h-10 w-10 text-green-500" />,
      title: "Social Profiles",
      description: "View other users' profiles and their wealth status.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-red-500" />,
      title: "Daily Missions",
      description: "Complete missions to earn additional virtual money.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Experience the Billionaire Lifestyle</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Dream World offers a complete virtual economy where you can experience wealth without real-world risks.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 pt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 rounded-lg border p-4 transition-all hover:bg-accent"
            >
              {feature.icon}
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

