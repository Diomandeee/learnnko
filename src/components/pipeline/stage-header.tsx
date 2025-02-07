"use client"

import { Stage } from "@prisma/client"

interface StageHeaderProps {
  stage: Stage
  total: number
  count: number
}

export function StageHeader({ stage, total, count }: StageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">{stage}</h3>
        <div className="text-sm text-muted-foreground">
          {count} {count === 1 ? 'deal' : 'deals'}
        </div>
      </div>
      <div className="text-sm font-medium">
        $ {total}
      </div>
    </div>
  )
}
