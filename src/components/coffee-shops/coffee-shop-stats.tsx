"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"
import { Users, UserCheck, Briefcase, DollarSign, TrendingUp, ShoppingBag, BarChart, LineChart } from "lucide-react"

// Helper function to calculate deliveries per year based on frequency
function getDeliveriesPerYear(frequency: string | null): number {
  switch (frequency) {
    case 'WEEKLY':
      return 52;
    case 'BIWEEKLY':
      return 26;
    case 'THREE_WEEKS':
      return 17;
    case 'FOUR_WEEKS':
      return 13;
    case 'FIVE_WEEKS':
      return 10;
    case 'SIX_WEEKS':
      return 9;
    default:
      return 52; // Default to weekly if no frequency specified
  }
}

// Helper function to calculate ARR for a shop
function calculateShopARR(volume: string | null, frequency: string | null): number {
  if (!volume) return 0;
  const weeklyVolume = parseFloat(volume);
  const deliveriesPerYear = getDeliveriesPerYear(frequency);
  return weeklyVolume * deliveriesPerYear * 18;
}

export function CoffeeShopStats() {
  const { shops } = useCoffeeShops()

  const stats = {
    total: shops?.length || 0,
    visited: shops?.filter(shop => shop.visited).length || 0,
    partner: shops?.filter(shop => shop.isPartner).length || 0,
    leads: shops?.filter(shop => shop.parlor_coffee_leads).length || 0,
    totalVolume: shops?.reduce((sum, shop) => {
      const volume = shop.volume ? parseFloat(shop.volume) : 0
      return sum + volume
    }, 0) || 0,
    // Calculate partner-specific stats
    partnerVolume: shops?.reduce((sum, shop) => {
      if (!shop.isPartner) return sum
      const volume = shop.volume ? parseFloat(shop.volume) : 0
      return sum + volume
    }, 0) || 0,
    // Calculate total ARR considering delivery frequency
    totalARR: shops?.reduce((sum, shop) => {
      return sum + calculateShopARR(shop.volume, shop.delivery_frequency)
    }, 0) || 0,
    // Calculate partner ARR considering delivery frequency
    partnerARR: shops?.reduce((sum, shop) => {
      if (!shop.isPartner) return sum
      return sum + calculateShopARR(shop.volume, shop.delivery_frequency)
    }, 0) || 0,
  }

  const statCards = [
    {
      title: "Total Shops",
      value: stats.total,
      icon: Users,
      description: "Total locations tracked",
    },
    {
      title: "Visited",
      value: stats.visited,
      icon: UserCheck,
      description: `${((stats.visited / stats.total) * 100).toFixed(1)}% of total`,
    },
    {
      title: "Partners",
      value: stats.partner,
      icon: Briefcase,
      description: `${((stats.partner / stats.total) * 100).toFixed(1)}% of total`,
    },
    {
      title: "Total Weekly Volume",
      value: stats.totalVolume.toFixed(1),
      icon: DollarSign,
      description: `$${stats.totalARR.toLocaleString()} ARR`,
    },
    {
      title: "Partner Weekly Volume",
      value: stats.partnerVolume.toFixed(1),
      icon: ShoppingBag,
      description: `${((stats.partnerVolume / stats.totalVolume) * 100).toFixed(1)}% of total volume`,
    },
    {
      title: "Partner Revenue",
      value: `$${stats.partnerARR.toLocaleString()}`,
      icon: TrendingUp,
      description: "Estimated annual partner revenue",
    },
    {
      title: "Avg Partner Volume",
      value: stats.partner ? (stats.partnerVolume / stats.partner).toFixed(1) : "0",
      icon: LineChart,
      description: "Average weekly volume per partner",
    },
    {
      title: "",
      value: "",
      icon: BarChart,
      description: "",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}