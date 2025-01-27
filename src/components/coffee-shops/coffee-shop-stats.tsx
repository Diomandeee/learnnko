// src/components/coffee-shops/coffee-shop-stats.tsx
"use client"

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"

export function CoffeeShopStats() {
  const { shops } = useCoffeeShops()

  // Calculate stats
  const stats = {
    total: shops?.length || 0,
    visited: shops?.filter(shop => shop.visited).length || 0,
    source: shops?.filter(shop => shop.is_source).length || 0,
    leads: shops?.filter(shop => shop.isPartner).length || 0,
    totalVolume: shops?.reduce((sum, shop) => {
      const volume = shop.volume ? parseFloat(shop.volume) : 0
      return sum + volume
    }, 0) || 0,
    averageRating: shops?.reduce((sum, shop) => {
      return sum + (shop.rating || 0)
    }, 0) / (shops?.filter(shop => shop.rating).length || 1),
  }

  // Calculate estimated annual revenue
  const estimatedAnnualRevenue = stats.totalVolume * 52 * 18

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visited</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.visited}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.visited / stats.total) * 100).toFixed(1)}% of shops
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Source/Partner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.source}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.source / stats.total) * 100).toFixed(1)}% of shops
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.leads}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.leads / stats.total) * 100).toFixed(1)}% potential leads
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Weekly Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVolume.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            ${estimatedAnnualRevenue.toLocaleString()} ARR
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            Out of 5 stars
          </p>
        </CardContent>
      </Card>
    </div>
  )
}