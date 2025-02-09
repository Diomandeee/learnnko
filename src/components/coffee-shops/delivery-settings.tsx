"use client"

import { useState } from "react"
import { CoffeeShop } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DELIVERY_FREQUENCIES } from "@/types/delivery"
import { useToast } from "@/components/ui/use-toast"

interface DeliverySettingsProps {
  shop?: Partial<CoffeeShop> | null // Make shop optional and potentially null
  onUpdate: (data: Partial<CoffeeShop>) => Promise<void>
}

export function DeliverySettings({ shop = null, onUpdate }: DeliverySettingsProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFrequencyChange = async (value: string) => {
    try {
      setLoading(true)
      await onUpdate({
        delivery_frequency: value,
      })
      toast({
        title: "Success",
        description: "Delivery frequency updated"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update delivery frequency",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFirstWeekChange = async (value: string) => {
    const weekNum = parseInt(value)
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
      toast({
        title: "Error",
        description: "Please enter a valid week number (1-53)",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      await onUpdate({
        first_delivery_week: weekNum
      })
      toast({
        title: "Success",
        description: "First delivery week updated"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update first delivery week",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // If no shop is provided, show a loading or error state
  if (!shop) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No shop selected
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Delivery Frequency</label>
        <Select
          value={shop.delivery_frequency || undefined}
          onValueChange={handleFrequencyChange}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DELIVERY_FREQUENCIES).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {key.replace(/_/g, ' ').toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">First Delivery Week</label>
        <Input
          type="number"
          min={1}
          max={53}
          value={shop.first_delivery_week || ''}
          onChange={(e) => handleFirstWeekChange(e.target.value)}
          disabled={loading}
          placeholder="Enter week number (1-53)"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        Current settings:
        <ul className="mt-2 space-y-1">
          <li>Frequency: {shop.delivery_frequency || 'Not set'}</li>
          <li>First Week: {shop.first_delivery_week || 'Not set'}</li>
        </ul>
      </div>
    </div>
  )
}
