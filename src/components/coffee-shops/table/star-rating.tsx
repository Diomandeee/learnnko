"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  onUpdate: (value: number) => void
  className?: string
  disabled?: boolean
}

export function StarRating({ 
  value, 
  onUpdate, 
  className,
  disabled 
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  return (
    <div 
      className={cn(
        "flex items-center gap-1", 
        className
      )}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4 cursor-pointer transition-colors",
            (hoverValue || value) >= star 
              ? "fill-yellow-500 text-yellow-500" 
              : "text-muted-foreground hover:text-yellow-500",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={() => {
            if (!disabled) {
              onUpdate(star)
            }
          }}
          onMouseEnter={() => {
            if (!disabled) {
              setHoverValue(star)
            }
          }}
          onMouseLeave={() => {
            if (!disabled) {
              setHoverValue(null)
            }
          }}
        />
      ))}
    </div>
  )
}
