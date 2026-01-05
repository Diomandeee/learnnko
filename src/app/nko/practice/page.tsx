"use client"

import { BookOpen } from "lucide-react"
import { NkoPracticeHub } from "@/components/nko/practice/nko-practice-hub"
import { CosmicBackground } from "@/components/cosmic/CosmicBackground"
import { CosmicPageHeader } from "@/components/cosmic/CosmicPageHeader"

export default function NkoPracticePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-space-950">
      {/* Cosmic Background */}
      <CosmicBackground showFloatingChars variant="default" />

      {/* Page Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <CosmicPageHeader
          icon={BookOpen}
          title="N'Ko Practice"
          description="Improve your N'Ko skills with interactive practice exercises"
        />

        <div className="mt-8">
          <NkoPracticeHub />
        </div>
      </div>
    </div>
  )
} 