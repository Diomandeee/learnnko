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
    <div className="flex flex-col h-full">
      {/* Fixed header for each column */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">
          {label} ({shops.length})
        </h3>
        <span className="text-sm text-muted-foreground">
          ${total.toLocaleString()}
        </span>
      </div>

      {/* Independently scrollable content area */}
      <div 
        className={cn(
          "flex-1 border-l-2 pl-4 overflow-y-auto",
          className
        )}
      >
        {shops.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">
            No deals in {label.toLowerCase()}
          </div>
        ) : (
          <div className="space-y-3 pr-2"> {/* Added right padding for scrollbar */}
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
