#!/bin/bash

# Update the pipeline stage column component
cat > src/components/pipeline/board/pipeline-stage-column.tsx << 'EOF'
"use client"

import { CoffeeShop, Stage } from "@prisma/client"
import { PipelineDealCard } from "./pipeline-deal-card"
import { cn } from "@/lib/utils"

interface PipelineStageColumnProps {
  stage: Stage
  shops: CoffeeShop[]
  total: number
  label: string
  className?: string
  onStageChange: (shopId: string, stage: Stage) => Promise<void>
  disabled?: boolean
}

export function PipelineStageColumn({
  stage,
  shops,
  total,
  label,
  className,
  onStageChange,
  disabled
}: PipelineStageColumnProps) {
  return (
    <div className="flex-shrink-0 w-[300px]">
      <div className="flex flex-col mb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            {label} ({shops.length})
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          ${total.toLocaleString()}
        </p>
      </div>

      <div 
        className={cn(
          "min-h-[500px] border-l-2 pl-4",
          className
        )}
      >
        {shops.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No deals in {label.toLowerCase()}
          </div>
        ) : (
          <div className="space-y-3">
            {shops.map((shop) => (
              <PipelineDealCard
                key={shop.id}
                shop={shop}
                onStageChange={onStageChange}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
EOF

# Update the pipeline deal card component
cat > src/components/pipeline/board/pipeline-deal-card.tsx << 'EOF'
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
EOF

# Update the stage configuration
cat > src/components/pipeline/stage-config.ts << 'EOF'
export const STAGE_CONFIG = {
  PROSPECTING: { 
    label: "Prospecting", 
    className: "border-gray-500",
    description: "Initial contact phase"
  },
  QUALIFICATION: { 
    label: "Qualification", 
    className: "border-yellow-500",
    description: "Evaluating fit"
  },
  MEETING: { 
    label: "Meeting", 
    className: "border-blue-500",
    description: "Scheduled meetings"
  },
  PROPOSAL: { 
    label: "Proposal", 
    className: "border-purple-500",
    description: "Proposal sent"
  },
  NEGOTIATION: { 
    label: "Negotiation", 
    className: "border-orange-500",
    description: "Active negotiation"
  }
} as const

export type Stage = keyof typeof STAGE_CONFIG
EOF

# Update the board layout
cat > src/components/pipeline/board/pipeline-board.tsx << 'EOF'
"use client"

import { useState } from "react"
import { CoffeeShop, Stage } from "@prisma/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { STAGE_CONFIG } from "../stage-config"
import { PipelineStageColumn } from "./pipeline-stage-column"
import { useToast } from "@/components/ui/use-toast"

interface PipelineBoardProps {
  shops: CoffeeShop[]
}

export function PipelineBoard({ shops }: PipelineBoardProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Group shops by stage
  const shopsByStage = shops.reduce((acc, shop) => {
    const stage = shop.stage || 'PROSPECTING'
    if (!acc[stage]) acc[stage] = []
    acc[stage].push(shop)
    return acc
  }, {} as Record<Stage, CoffeeShop[]>)

  // Calculate stage totals
  const stageTotals = Object.entries(shopsByStage).reduce((acc, [stage, stageShops]) => {
    acc[stage as Stage] = stageShops.reduce((sum, shop) => {
      return sum + (shop.volume ? parseFloat(shop.volume.toString()) * 52 * 18 : 0)
    }, 0)
    return acc
  }, {} as Record<Stage, number>)

  const handleStageChange = async (shopId: string, newStage: Stage) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/coffee-shops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      })

      if (!response.ok) throw new Error('Failed to update stage')
      
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stage",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 p-4">
        {Object.entries(STAGE_CONFIG).map(([stage, config]) => (
          <PipelineStageColumn
            key={stage}
            stage={stage as Stage}
            label={config.label}
            shops={shopsByStage[stage as Stage] || []}
            total={stageTotals[stage as Stage] || 0}
            className={config.className}
            onStageChange={handleStageChange}
            disabled={loading}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
EOF