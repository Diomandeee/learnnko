"use client"

import { useEffect, useState } from "react"
import { cn, getRandomNkoChar, getRandomPosition, getRandomDelay } from "@/lib/cosmic-design"

interface FloatingOrb {
  id: number
  size: 'sm' | 'md' | 'lg'
  color: 'amber' | 'orange'
  position: { top: string; left: string }
  delay: string
}

interface FloatingChar {
  id: number
  char: string
  position: { top: string; left: string }
  delay: string
  duration: string
}

interface CosmicBackgroundProps {
  /**
   * Show floating N'Ko characters
   * @default true
   */
  showFloatingChars?: boolean

  /**
   * Variant intensity
   * @default "default"
   */
  variant?: "minimal" | "default" | "intense"

  /**
   * Additional className
   */
  className?: string
}

/**
 * Cosmic Background Component
 *
 * Provides animated background with:
 * - Layered gradient backgrounds
 * - Floating radial gradient orbs
 * - Optional floating N'Ko characters
 */
export function CosmicBackground({
  showFloatingChars = true,
  variant = "default",
  className,
}: CosmicBackgroundProps) {
  const [orbs, setOrbs] = useState<FloatingOrb[]>([])
  const [chars, setChars] = useState<FloatingChar[]>([])

  useEffect(() => {
    // Generate floating orbs based on variant
    const orbCount = variant === "minimal" ? 2 : variant === "default" ? 3 : 5
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg']
    const colors: Array<'amber' | 'orange'> = ['amber', 'orange']

    const newOrbs: FloatingOrb[] = Array.from({ length: orbCount }, (_, i) => ({
      id: i,
      size: sizes[i % sizes.length],
      color: colors[i % colors.length],
      position: getRandomPosition(),
      delay: getRandomDelay(10),
    }))

    setOrbs(newOrbs)

    // Generate floating N'Ko characters if enabled
    if (showFloatingChars) {
      const charCount = variant === "minimal" ? 3 : variant === "default" ? 5 : 8

      const newChars: FloatingChar[] = Array.from({ length: charCount }, (_, i) => ({
        id: i,
        char: getRandomNkoChar(),
        position: getRandomPosition(),
        delay: getRandomDelay(15),
        duration: `${15 + Math.random() * 10}s`,
      }))

      setChars(newChars)
    }
  }, [variant, showFloatingChars])

  const orbSizeClasses = {
    sm: 'w-64 h-64',
    md: 'w-96 h-96',
    lg: 'w-[600px] h-[600px]',
  }

  const orbColorClasses = {
    amber: 'bg-gradient-radial from-amber-500/20 via-orange-500/10 to-transparent',
    orange: 'bg-gradient-radial from-orange-500/20 via-yellow-500/10 to-transparent',
  }

  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-950 via-space-900 to-space-950" />

      {/* Floating radial gradient orbs */}
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={cn(
            "absolute rounded-full blur-3xl animate-float",
            orbSizeClasses[orb.size],
            orbColorClasses[orb.color]
          )}
          style={{
            top: orb.position.top,
            left: orb.position.left,
            animationDelay: orb.delay,
          }}
        />
      ))}

      {/* Floating N'Ko characters */}
      {showFloatingChars && chars.map((char) => (
        <div
          key={char.id}
          className="absolute text-6xl md:text-8xl font-bold text-amber-500/5 animate-float select-none"
          style={{
            top: char.position.top,
            left: char.position.left,
            animationDelay: char.delay,
            animationDuration: char.duration,
          }}
          aria-hidden="true"
        >
          {char.char}
        </div>
      ))}

      {/* Subtle noise texture overlay for depth */}
      <div className="absolute inset-0 bg-noise opacity-[0.02]" />
    </div>
  )
}
