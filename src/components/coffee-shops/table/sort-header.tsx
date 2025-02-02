"use client"

import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown } from "lucide-react"
import { CoffeeShop } from "@prisma/client"

interface SortHeaderProps {
  label: string
  sortKey: keyof CoffeeShop
  currentSort: {
    key: keyof CoffeeShop | null
    direction: 'asc' | 'desc'
  }
  onSort: (key: keyof CoffeeShop) => void
}

export function SortHeader({ 
  label,
  sortKey, 
  currentSort,
  onSort 
}: SortHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      {label}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSort(sortKey)}
      >
        {currentSort.key === sortKey ? (
          currentSort.direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
        )}
      </Button>
    </div>
  )
}
