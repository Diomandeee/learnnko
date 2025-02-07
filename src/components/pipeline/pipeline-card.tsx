"use client"

import { CoffeeShop, Stage } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { StageCell } from "../coffee-shops/table/stage-cell"
import Link from "next/link"

interface PipelineCardProps {
  shop: CoffeeShop
  onStageChange: (shopId: string, stage: Stage) => Promise<void>
  disabled?: boolean
}

export function PipelineCard({ shop, onStageChange, disabled }: PipelineCardProps) {
  const estimatedValue = shop.volume ? (parseFloat(shop.volume.toString()) * 52 * 18) : 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Link 
            href={`/dashboard/coffee-shops/${shop.id}`}
            className="font-medium hover:underline"
          >
            {shop.title}
          </Link>
          <StageCell
            stage={shop.stage}
            onUpdate={(stage) => onStageChange(shop.id, stage)}
            disabled={disabled}
          />
        </div>

        <div className="text-sm text-muted-foreground">
          {shop.area}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="font-medium">
            ${estimatedValue.toLocaleString()}
          </div>
          <div className="text-muted-foreground">
            {formatDistanceToNow(new Date(shop.updatedAt), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
