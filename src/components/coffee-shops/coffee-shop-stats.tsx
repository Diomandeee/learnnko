"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"
import { Users, UserCheck, Briefcase, DollarSign, TrendingUp, ShoppingBag } from "lucide-react"

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
  }

  const estimatedAnnualRevenue = stats.totalVolume * 52 * 18
  const estimatedPartnerRevenue = stats.partnerVolume * 52 * 18

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
      description: `$${estimatedAnnualRevenue.toLocaleString()} ARR`,
    },
    {
      title: "Partner Weekly Volume",
      value: stats.partnerVolume.toFixed(1),
      icon: ShoppingBag,
      description: `${((stats.partnerVolume / stats.totalVolume) * 100).toFixed(1)}% of total volume`,
    },
    {
      title: "Partner Revenue",
      value: `$${estimatedPartnerRevenue.toLocaleString()}`,
      icon: TrendingUp,
      description: "Estimated annual partner revenue",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
