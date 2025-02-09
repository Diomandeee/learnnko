"use client"

import { CoffeeShop } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DELIVERY_FREQUENCIES } from "@/types/delivery"

interface DeliveryCellProps {
  shop: CoffeeShop
  onUpdate: (field: keyof CoffeeShop, value: any) => Promise<void>
  disabled?: boolean
}

export function DeliveryCell({ shop, onUpdate, disabled }: DeliveryCellProps) {
  return (
    <Select
      value={shop.delivery_frequency || undefined}
      onValueChange={(value) => onUpdate("delivery_frequency", value)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[150px]">
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
  )
}
