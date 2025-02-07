"use client"

import { CoffeeShop, Stage } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { StageCell } from "../../coffee-shops/table/stage-cell"
import Link from "next/link"
import { MapPin } from "lucide-react"

interface PipelineDealCardProps {
  shop: CoffeeShop
  onStageChange: (shopId: string, stage: Stage) => Promise<void>
  disabled?: boolean
}

export function PipelineDealCard({ 
  shop, 
  onStageChange, 
  disabled 
}: PipelineDealCardProps) {
  const estimatedValue = shop.volume ? (parseFloat(shop.volume.toString()) * 52 * 18) : 0

  return (
    <Card className="hover:bg-muted/50">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <Link 
              href={`/dashboard/coffee-shops/${shop.id}`}
              className="font-medium hover:underline line-clamp-1"
            >
              {shop.title}
            </Link>
            {shop.area && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {shop.area}
              </div>
            )}
          </div>
          <StageCell
            stage={shop.stage}
            onUpdate={(stage) => onStageChange(shop.id, stage)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>$ {estimatedValue.toLocaleString()}</div>
          <div>{formatDistanceToNow(new Date(shop.updatedAt), { addSuffix: true })}</div>
        </div>
      </CardContent>
    </Card>
  )
}
