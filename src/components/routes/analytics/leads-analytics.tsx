"use client"

import { useEffect, useState } from "react"
import { useShops } from "@/hooks/use-shops"
import { CoffeeShop } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function LeadsAnalytics() {
  const { shops, loading } = useShops()
  const [leads, setLeads] = useState<CoffeeShop[]>([])

  useEffect(() => {
    if (shops) {
      const leadShops = shops
        .filter(shop => shop.parlor_coffee_leads)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      setLeads(leadShops)
    }
  }, [shops])

  if (loading) {
    return <div>Loading leads...</div>
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {leads.map((shop) => (
          <div key={shop.id} className="flex items-start space-x-4">
            <Badge variant={shop.visited ? "success" : "default"}>
              {shop.visited ? "Visited" : "New Lead"}
            </Badge>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{shop.title}</p>
              <p className="text-sm text-muted-foreground">{shop.area}</p>
              {shop.rating && (
                <p className="text-xs">⭐ {shop.rating} ({shop.reviews} reviews)</p>
              )}
            </div>
          </div>
        ))}
        {leads.length === 0 && (
          <p className="text-sm text-muted-foreground">No leads generated yet</p>
        )}
      </div>
    </ScrollArea>
  )
}
