"use client"

import { CoffeeShop, Stage } from "@prisma/client"
import { PipelineCard } from "./pipeline-card"
import { cn } from "@/lib/utils"

interface PipelineColumnProps {
  shops: CoffeeShop[]
  stage: Stage
  onStageChange: (shopId: string, stage: Stage) => Promise<void>
  className?: string
  disabled?: boolean
}

export function PipelineColumn({
  shops,
  stage,
  onStageChange,
  className,
  disabled
}: PipelineColumnProps) {
  return (
    <div className={cn(
      "rounded-lg p-4 h-[calc(100vh-280px)] overflow-y-auto",
      className
    )}>
      <div className="space-y-4">
        {shops.map((shop) => (
          <PipelineCard
            key={shop.id}
            shop={shop}
            onStageChange={onStageChange}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}
