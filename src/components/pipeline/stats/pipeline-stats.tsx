"use client"

import { CoffeeShop } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  GitMerge,
  DollarSign,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  BarChart2
} from "lucide-react"

interface PipelineStatsProps {
  shops: CoffeeShop[]
}

export function PipelineStats({ shops }: PipelineStatsProps) {
  // Calculate total pipeline value
  const totalValue = shops.reduce((acc, shop) => {
    return acc + (shop.volume ? parseFloat(shop.volume.toString()) * 52 * 18 : 0)
  }, 0)

  // Calculate stage-specific metrics
  const qualifiedDeals = shops.filter(shop => 
    ["QUALIFICATION", "MEETING", "PROPOSAL", "NEGOTIATION"].includes(shop.stage)
  ).length

  const closingDeals = shops.filter(shop => 
    ["PROPOSAL", "NEGOTIATION"].includes(shop.stage)
  ).length

  const wonDeals = shops.filter(shop => shop.stage === "WON").length

  const conversionRate = shops.length > 0 
    ? ((wonDeals / shops.length) * 100).toFixed(1)
    : "0.0"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pipeline Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalValue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Total potential annual revenue
          </p>
          <div className="mt-4 h-[60px]">
            <BarChart2 className="h-[60px] w-full text-emerald-500/25" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Qualified Deals
          </CardTitle>
          <GitMerge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {qualifiedDeals}
          </div>
          <p className="text-xs text-muted-foreground">
            Deals in qualification or later
          </p>
          <div className="mt-4 h-[60px]">
            <BarChart2 className="h-[60px] w-full text-blue-500/25" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Closing Soon
          </CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{closingDeals}</div>
          <p className="text-xs text-muted-foreground">
            In proposal or negotiation
          </p>
          <div className="mt-4 h-[60px]">
            <BarChart2 className="h-[60px] w-full text-violet-500/25" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Conversion Rate
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Of total deals won
          </p>
          <div className="mt-4 h-[60px]">
            <BarChart2 className="h-[60px] w-full text-orange-500/25" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
