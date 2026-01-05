"use client"

import { type ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { cn, COSMIC_PRESETS } from "@/lib/cosmic-design"

interface Stat {
  value: string | number
  label: string
}

interface CosmicPageHeaderProps {
  /**
   * Page title
   */
  title: string

  /**
   * Page description
   */
  description?: string

  /**
   * Icon component to display
   */
  icon?: LucideIcon

  /**
   * Optional stats to display below description
   */
  stats?: Stat[]

  /**
   * Optional actions (buttons, etc.)
   */
  actions?: ReactNode

  /**
   * Additional className
   */
  className?: string
}

/**
 * Cosmic Page Header Component
 *
 * Standardized page header with:
 * - Optional icon
 * - Gradient title
 * - Description text
 * - Optional stats display
 * - Optional action buttons
 */
export function CosmicPageHeader({
  title,
  description,
  icon: Icon,
  stats,
  actions,
  className,
}: CosmicPageHeaderProps) {
  return (
    <div className={cn(COSMIC_PRESETS.pageHeader, className)}>
      {/* Icon */}
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <Icon className="w-12 h-12 text-amber-400" />
          </div>
        </div>
      )}

      {/* Title */}
      <h1 className={COSMIC_PRESETS.pageTitle}>
        {title}
      </h1>

      {/* Description */}
      {description && (
        <p className={COSMIC_PRESETS.pageDescription}>
          {description}
        </p>
      )}

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="flex items-center justify-center gap-8 mt-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={COSMIC_PRESETS.statValue}>
                {stat.value}
              </div>
              <div className={COSMIC_PRESETS.statLabel}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex items-center justify-center gap-4 mt-6">
          {actions}
        </div>
      )}
    </div>
  )
}
