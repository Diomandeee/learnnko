"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  GraduationCap,
  HomeIcon,
  Languages,
  BookMarked,
  MessageCircle,
  Mic,
  Keyboard,
  Activity
} from "lucide-react"

const navigation = [
  {
    name: "N'Ko Learning Hub",
    href: "/nko",
    icon: Languages,
    children: [
      { name: "Learning Hub", href: "/nko", icon: HomeIcon },
      { name: "Conversation", href: "/nko/conversation", icon: MessageCircle },
      { name: "Lessons", href: "/nko/lessons", icon: BookOpen },
      { name: "Dictionary", href: "/nko/dictionary", icon: BookMarked },
      { name: "Practice", href: "/nko/practice", icon: GraduationCap },
      { name: "Translator", href: "/nko/translator", icon: Languages },
      { name: "Transcribe", href: "/nko/transcribe", icon: Mic },
      { name: "Keyboard", href: "/nko/keyboard", icon: Keyboard },
      { name: "Inscriptions", href: "/dashboard/nko/inscriptions", icon: Activity },
      { name: "History", href: "/nko/history", icon: BookMarked },
    ],
  },
]

interface SideNavProps {
  className?: string
}

export function SideNav({ className }: SideNavProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full flex-col border-r border-amber-500/20 backdrop-blur-xl bg-space-950/95", className)}>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = item.href === pathname || 
              (item.children && item.children.some(child => child.href === pathname)) ||
              (pathname.startsWith(item.href) && item.href !== "/nko")

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-space-950 shadow-amber"
                      : "text-gray-300 hover:bg-amber-500/10 hover:text-amber-300"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  {item.name}
                </Link>
                {item.children && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = child.href === pathname
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            "group flex items-center rounded-md px-3 py-1 text-sm transition-colors",
                            isChildActive
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "text-gray-400 hover:bg-amber-500/10 hover:text-amber-300"
                          )}
                        >
                          <child.icon className="mr-3 h-3 w-3 flex-shrink-0" />
                          {child.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
