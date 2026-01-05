"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  MessageCircle,
  Languages,
  BookOpen,
  Upload,
  Keyboard,
  Archive,
  Activity,
  Menu,
  X,
  type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  label: string
}

const navigation: NavItem[] = [
  {
    name: "Chat",
    href: "/nko?tab=conversation",
    icon: MessageCircle,
    label: "Chat"
  },
  {
    name: "Translate",
    href: "/nko?tab=translate",
    icon: Languages,
    label: "Translate"
  },
  {
    name: "Lessons",
    href: "/nko?tab=lessons",
    icon: BookOpen,
    label: "Lessons"
  },
  {
    name: "Dictionary",
    href: "/nko?tab=dictionary",
    icon: BookOpen,
    label: "Dictionary"
  },
  {
    name: "Practice",
    href: "/nko?tab=practice",
    icon: Upload,
    label: "Practice"
  },
  {
    name: "Keyboard",
    href: "/nko?tab=keyboard",
    icon: Keyboard,
    label: "Keyboard"
  },
  {
    name: "Library",
    href: "/nko?tab=library",
    icon: Archive,
    label: "Library"
  },
  {
    name: "French",
    href: "/nko?tab=french",
    icon: MessageCircle,
    label: "French"
  },
  {
    name: "Inscriptions",
    href: "/nko?tab=inscriptions",
    icon: Activity,
    label: "Inscriptions"
  },
]

interface IconNavProps {
  className?: string
}

/**
 * Top Icon Navigation Component
 *
 * Simplified navigation focused on two main features:
 * - AI Learning (conversation, lessons, dictionary, practice)
 * - Live Inscriptions (real-time transcription and inscriptions)
 *
 * Features:
 * - Minimalist icon-only navigation
 * - Hover reveals label below icon
 * - Cosmic theme styling (amber/orange glow)
 * - Active route highlighting
 * - Smooth transitions
 */
export function IconNav({ className }: IconNavProps) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check if route is active by matching the tab query parameter
  const isActive = (href: string) => {
    if (typeof window === 'undefined') return false
    const currentUrl = new URL(window.location.href)
    const currentTab = currentUrl.searchParams.get('tab')
    const linkUrl = new URL(href, window.location.origin)
    const linkTab = linkUrl.searchParams.get('tab')
    return pathname === '/nko' && currentTab === linkTab
  }

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50",
        "backdrop-blur-xl bg-space-950/95 border-b border-amber-500/20",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16">
          {/* Desktop Icon Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group"
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  aria-label={item.label}
                >
                  {/* Icon Button */}
                  <div
                    className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      "flex items-center justify-center",
                      active
                        ? "bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/25"
                        : "text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6 transition-transform duration-300",
                        hoveredItem === item.name && "scale-110"
                      )}
                    />
                  </div>

                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 rounded-full" />
                  )}

                  {/* Hover Label */}
                  <div
                    className={cn(
                      "absolute top-full left-1/2 -translate-x-1/2 mt-2",
                      "px-3 py-1.5 rounded-lg",
                      "bg-space-900/95 backdrop-blur-sm border border-amber-500/30",
                      "text-xs font-medium text-amber-300 whitespace-nowrap",
                      "transition-all duration-200 pointer-events-none",
                      hoveredItem === item.name
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-[-8px]"
                    )}
                  >
                    {item.label}
                    {/* Tooltip arrow */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-space-900 border-l border-t border-amber-500/30" />
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Mobile: Header with hamburger menu */}
          <div className="md:hidden flex items-center justify-between w-full">
            {/* Logo/Title */}
            <Link href="/nko" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                <span className="text-amber-400 font-bold text-lg">ߒ</span>
              </div>
              <span className="text-amber-300 font-semibold text-sm sm:text-base">N'Ko Learning</span>
            </Link>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-amber-300" />
              ) : (
                <Menu className="w-6 h-6 text-amber-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-space-950/98 backdrop-blur-xl border-b border-amber-500/20 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                      active
                        ? "bg-amber-500/20 text-amber-300"
                        : "text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
