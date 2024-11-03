import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        success: "bg-success text-success-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        warning: "bg-warning text-warning-foreground",
        info: "bg-info text-info-foreground",
        outline: "text-foreground border border-input",
      },
      dotColor: {
        none: "",
        default: "before:bg-primary",
        success: "before:bg-success",
        destructive: "before:bg-destructive",
        warning: "before:bg-warning",
        info: "before:bg-info",
      },
    },
    defaultVariants: {
      variant: "default",
      dotColor: "none",
    },
    compoundVariants: [
      {
        dotColor: ["default", "success", "destructive", "warning", "info"],
        className: "pl-3 before:absolute before:left-1 before:h-1.5 before:w-1.5 before:rounded-full relative",
      },
    ],
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  pulse?: boolean
}

function StatusBadge({
  className,
  variant,
  dotColor,
  pulse = false,
  ...props
}: StatusBadgeProps) {
  return (
    <div
      className={cn(
        statusBadgeVariants({ variant, dotColor }),
        pulse && dotColor !== "none" && "before:animate-pulse",
        className
      )}
      {...props}
    />
  )
}

export { StatusBadge, statusBadgeVariants }
