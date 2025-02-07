"use client"

import { Stage } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const STAGE_CONFIG = {
  PROSPECTING: { 
    label: "Prospecting", 
    className: "bg-gray-500 text-white hover:bg-gray-600" 
  },
  QUALIFICATION: { 
    label: "Qualification", 
    className: "bg-yellow-500 text-white hover:bg-yellow-600"
  },
  MEETING: { 
    label: "Meeting", 
    className: "bg-blue-500 text-white hover:bg-blue-600"
  },
  PROPOSAL: { 
    label: "Proposal", 
    className: "bg-purple-500 text-white hover:bg-purple-600"
  },
  NEGOTIATION: { 
    label: "Negotiation", 
    className: "bg-orange-500 text-white hover:bg-orange-600"
  },
  PAUSED: { 
    label: "Paused", 
    className: "bg-slate-500 text-white hover:bg-slate-600"
  },
  WON: { 
    label: "Won", 
    className: "bg-green-500 text-white hover:bg-green-600"
  },
  LOST: { 
    label: "Lost", 
    className: "bg-red-500 text-white hover:bg-red-600"
  }
} as const

interface StageCellProps {
  stage: Stage
  onUpdate: (stage: Stage) => Promise<void>
  disabled?: boolean
}

export function StageCell({ stage, onUpdate, disabled }: StageCellProps) {
  const config = STAGE_CONFIG[stage]

  if (!config) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "rounded-full text-xs font-semibold",
            config.className
          )}
          disabled={disabled}
        >
          {config.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(STAGE_CONFIG).map(([stageKey, { label, className }]) => (
          <DropdownMenuItem
            key={stageKey}
            onClick={() => onUpdate(stageKey as Stage)}
            disabled={disabled || stageKey === stage}
          >
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold",
              className
            )}>
              {label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
