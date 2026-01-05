"use client"

import { Languages } from "lucide-react"
import { TranslatorContainer } from "@/components/nko/translator/translator-container"
import { CosmicBackground } from "@/components/cosmic/CosmicBackground"
import { CosmicPageHeader } from "@/components/cosmic/CosmicPageHeader"

export default function TranslatorPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-space-950">
      {/* Cosmic Background */}
      <CosmicBackground showFloatingChars variant="default" />

      {/* Page Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <CosmicPageHeader
          icon={Languages}
          title="N'Ko Translator"
          description="Translate between N'Ko, English, and French languages"
        />

        <div className="mt-8">
          <TranslatorContainer />
        </div>
      </div>
    </div>
  )
}
