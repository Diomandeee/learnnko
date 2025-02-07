"use client"

import { useState, useCallback } from "react"
import { CoffeeShop, Stage } from "@prisma/client"
import { PipelineColumn } from "./pipeline-column"
import { StageHeader } from "./stage-header"

const STAGE_CONFIG = {
  PROSPECTING: { 
    label: "Prospecting", 
    className: "bg-gray-100 dark:bg-gray-800" 
  },
  QUALIFICATION: { 
    label: "Qualification", 
    className: "bg-yellow-50 dark:bg-yellow-900/20"
  },
  MEETING: { 
    label: "Meeting", 
    className: "bg-blue-50 dark:bg-blue-900/20"
  },
  PROPOSAL: { 
    label: "Proposal", 
    className: "bg-purple-50 dark:bg-purple-900/20"
  },
  NEGOTIATION: { 
    label: "Negotiation", 
    className: "bg-orange-50 dark:bg-orange-900/20"
  },
  PAUSED: { 
    label: "Paused", 
    className: "bg-slate-100 dark:bg-slate-800"
  },
  WON: { 
    label: "Won", 
    className: "bg-green-50 dark:bg-green-900/20"
  },
  LOST: { 
    label: "Lost", 
    className: "bg-red-50 dark:bg-red-900/20"
  }
}

interface PipelineBoardProps {
  shops: CoffeeShop[]
}

export function PipelineBoard({ shops }: PipelineBoardProps) {
  const [loading, setLoading] = useState(false)

  const handleStageChange = useCallback(async (shopId: string, newStage: Stage) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/coffee-shops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      })

      if (!response.ok) throw new Error('Failed to update stage')
      
      // Refresh the page to get updated data
      window.location.reload()
    } catch (error) {
      console.error('Failed to update stage:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Group shops by stage
  const shopsByStage = shops.reduce((acc, shop) => {
    const stage = shop.stage || 'PROSPECTING'
    if (!acc[stage]) acc[stage] = []
    acc[stage].push(shop)
    return acc
  }, {} as Record<Stage, CoffeeShop[]>)

  // Calculate totals
  const stageTotals = Object.entries(shopsByStage).reduce((acc, [stage, stageShops]) => {
    acc[stage as Stage] = stageShops.reduce((sum, shop) => {
      return sum + (shop.volume ? parseFloat(shop.volume.toString()) * 52 * 18 : 0)
    }, 0)
    return acc
  }, {} as Record<Stage, number>)

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {Object.entries(STAGE_CONFIG).map(([stage, config]) => (
        <div key={stage} className="flex-1 min-w-[320px]">
          <StageHeader 
            stage={stage as Stage} 
            total={stageTotals[stage as Stage]} 
            count={shopsByStage[stage as Stage]?.length || 0}
          />
          <PipelineColumn
            shops={shopsByStage[stage as Stage] || []}
            stage={stage as Stage}
            onStageChange={handleStageChange}
            className={config.className}
            disabled={loading}
          />
        </div>
      ))}
    </div>
  )
}
