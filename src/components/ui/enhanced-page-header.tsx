"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface EnhancedPageHeaderProps {
  icon: LucideIcon
  title: string
  description: string
  gradientFrom?: string
  gradientTo?: string
  iconGradientFrom?: string
  iconGradientTo?: string
  nkoCharacter?: string
  stats?: Array<{
    value: string | number
    label: string
    color: string
  }>
}

export function EnhancedPageHeader({
  icon: Icon,
  title,
  description,
  gradientFrom = "emerald-700",
  gradientTo = "teal-700",
  iconGradientFrom = "emerald-500",
  iconGradientTo = "teal-500",
  nkoCharacter = "ߒ",
  stats = []
}: EnhancedPageHeaderProps) {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-gradient-to-br from-${iconGradientFrom} to-${iconGradientTo} rounded-2xl flex items-center justify-center shadow-lg`}>
              {nkoCharacter ? (
                <span className="text-white font-bold text-2xl">{nkoCharacter}</span>
              ) : (
                <Icon className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <CardTitle className={`text-3xl font-bold bg-gradient-to-r from-${gradientFrom} to-${gradientTo} bg-clip-text text-transparent`}>
                {title}
              </CardTitle>
              <p className="text-lg text-slate-600 mt-1">
                {description}
              </p>
            </div>
          </div>
          
          {stats.length > 0 && (
            <div className="flex items-center gap-6">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-center">
                    <div className={`text-2xl font-bold text-${stat.color}-600`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                  {index < stats.length - 1 && (
                    <div className="w-px h-12 bg-slate-300 ml-6"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}

// Centered version for landing pages
export function EnhancedCenteredHeader({
  icon: Icon,
  title,
  description,
  gradientFrom = "emerald-700",
  gradientTo = "teal-700", 
  iconGradientFrom = "emerald-500",
  iconGradientTo = "teal-500",
  nkoCharacter = "ߒ",
}: {
  icon: LucideIcon
  title: string
  description: string
  gradientFrom?: string
  gradientTo?: string
  iconGradientFrom?: string
  iconGradientTo?: string
  nkoCharacter?: string
}) {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className={`w-12 h-12 bg-gradient-to-br from-${iconGradientFrom} to-${iconGradientTo} rounded-xl flex items-center justify-center shadow-lg`}>
          {nkoCharacter ? (
            <span className="text-white font-bold text-xl">{nkoCharacter}</span>
          ) : (
            <Icon className="w-6 h-6 text-white" />
          )}
        </div>
        <h1 className={`text-4xl font-bold bg-gradient-to-r from-${gradientFrom} to-${gradientTo} bg-clip-text text-transparent`}>
          {title}
        </h1>
      </div>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  )
} 