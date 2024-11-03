import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const pageHeaderVariants = cva(
  "flex flex-col gap-1",
  {
    variants: {
      spacing: {
        default: "mb-6",
        sm: "mb-4",
        lg: "mb-8",
      },
    },
    defaultVariants: {
      spacing: "default",
    },
  }
)

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageHeaderVariants> {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({
  className,
  title,
  description,
  spacing,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        pageHeaderVariants({ spacing }),
        "flex items-center justify-between",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-4">{children}</div>}
    </div>
  )
}
