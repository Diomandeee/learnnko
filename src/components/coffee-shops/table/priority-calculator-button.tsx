"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Calculator, Loader2 } from "lucide-react"

interface PriorityCalculatorButtonProps {
  onCalculated?: () => void
  disabled?: boolean
}

export function PriorityCalculatorButton({ 
  onCalculated, 
  disabled = false 
}: PriorityCalculatorButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/coffee-shops/priority', {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to recalculate priorities')

      const data = await response.json()
      toast({
        title: "Success",
        description: "Shop priorities have been recalculated"
      })

      if (onCalculated) {
        onCalculated()
      }
    } catch (error) {
      console.error('Error calculating priorities:', error)
      toast({
        title: "Error",
        description: "Failed to recalculate priorities",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      className="gap-2" 
      onClick={handleCalculate}
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Calculator className="h-4 w-4" />
      )}
      {loading ? "Calculating..." : "Recalculate Priorities"}
    </Button>
  )
}