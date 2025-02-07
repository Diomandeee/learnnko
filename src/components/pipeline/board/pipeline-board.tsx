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
    <div className="overflow-x-auto">
      <div className="flex min-w-max p-4 gap-4">
        {Object.entries(STAGE_CONFIG).map(([stage, config]) => (
          <div key={stage} className="w-[300px] h-[calc(100vh-380px)]"> {/* Fixed height container */}
            <PipelineStageColumn
              stage={stage as Stage}
              label={config.label}
              shops={shopsByStage[stage as Stage] || []}
              total={stageTotals[stage as Stage] || 0}
              className={config.className}
              onStageChange={handleStageChange}
              disabled={loading}
            />
          </div>
        ))}
      </div>
    </div>
  )
}