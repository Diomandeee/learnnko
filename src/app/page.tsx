"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { InscriptionTicker } from "@/components/inscription/live/InscriptionTicker"
import { InscriptionStream } from "@/components/inscription/live/InscriptionStream"
import { ClaimLegend, ClaimLegendInline } from "@/components/inscription/live/ClaimLegend"
import {
  Menu,
  X,
  Activity,
  Mic,
  BookOpen,
  Languages,
} from "lucide-react"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [showDetailedView, setShowDetailedView] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-space-950">
      {/* Cosmic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-space-950 via-space-900 to-space-950" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.08),transparent_40%)]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.06),transparent_40%)]"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/15 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-amber-400/8 to-yellow-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* N'Ko script floating elements */}
        <div className="absolute top-20 left-1/4 text-amber-400/20 text-4xl animate-float font-nko" style={{ animationDelay: '0.5s' }}>ߒ</div>
        <div className="absolute top-1/3 right-1/4 text-violet-400/15 text-3xl animate-float font-nko" style={{ animationDelay: '1s' }}>ߓ</div>
        <div className="absolute bottom-1/3 left-1/3 text-amber-300/15 text-5xl animate-float font-nko" style={{ animationDelay: '1.5s' }}>ߕ</div>
        <div className="absolute bottom-1/4 right-1/5 text-cyan-400/10 text-4xl animate-float font-nko" style={{ animationDelay: '2s' }}>ߞ</div>
      </div>

      {/* Navigation Bar */}
      <nav className={`relative z-50 transition-all duration-300 sticky top-0 ${
        scrollY > 50
          ? 'backdrop-blur-xl bg-space-950/95 border-b border-amber-500/20 shadow-lg shadow-amber-500/10'
          : 'backdrop-blur-sm bg-space-950/80 border-b border-amber-500/10'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 transform hover:scale-110 transition-all duration-300">
                  <img
                    src="/nko_logo.svg"
                    alt="N'Ko Logo"
                    className="w-8 h-8 drop-shadow-lg"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-violet-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                  N'Ko Transcribe
                </span>
                <div className="text-xs text-amber-300/70 -mt-1 font-medium">Audio → N'Ko Translation</div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard/nko/inscriptions"
                className="text-sm font-medium text-gray-300 hover:text-amber-300 transition-colors"
              >
                Inscriptions
              </Link>
              <Link
                href="/claims"
                className="text-sm font-medium text-gray-300 hover:text-amber-300 transition-colors"
              >
                Claims Reference
              </Link>
              <Link
                href="/technical"
                className="text-sm font-medium text-gray-300 hover:text-amber-300 transition-colors"
              >
                Technical Docs
              </Link>
              <Link
                href="/nip"
                className="text-sm font-medium text-gray-300 hover:text-amber-300 transition-colors"
              >
                NIP Docs
              </Link>
              <Link
                href="/nko"
                className="text-sm font-medium text-gray-300 hover:text-amber-300 transition-colors"
              >
                Learning Hub
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-100 hover:text-amber-300 hover:bg-amber-500/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-amber-500/20 backdrop-blur-xl bg-space-950/95 rounded-lg">
              <div className="flex flex-col gap-3 pt-4">
                <Link
                  href="/dashboard/nko/inscriptions"
                  className="text-sm font-medium text-gray-300 hover:text-amber-300 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inscriptions
                </Link>
                <Link
                  href="/claims"
                  className="text-sm font-medium text-gray-300 hover:text-amber-300 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Claims Reference
                </Link>
                <Link
                  href="/technical"
                  className="text-sm font-medium text-gray-300 hover:text-amber-300 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Technical Docs
                </Link>
                <Link
                  href="/nip"
                  className="text-sm font-medium text-gray-300 hover:text-amber-300 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  NIP Docs
                </Link>
                <Link
                  href="/nko"
                  className="text-sm font-medium text-gray-300 hover:text-amber-300 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Learning Hub
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content - Live Inscriptions */}
      <div className="container mx-auto px-4 py-12">
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl">
              Live N'Ko Inscriptions
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Real-time motion-derived N'Ko statements from the fusion system
            </p>
          </div>

          {/* Inscription Display - Ticker with Legend */}
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4 lg:grid lg:grid-cols-4 lg:gap-6 lg:space-y-0">
              {/* Main Content - Ticker or Detailed Stream */}
              <div className="lg:col-span-3">
                {showDetailedView ? (
                  <div className="space-y-4">
                    <InscriptionStream />
                    <button
                      onClick={() => setShowDetailedView(false)}
                      className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Activity className="h-4 w-4" />
                      Back to simple stream
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <InscriptionTicker
                      onShowDetails={() => setShowDetailedView(true)}
                      maxItems={30}
                      className="rounded-lg"
                    />
                    {/* Inline legend below ticker on mobile */}
                    <div className="lg:hidden">
                      <ClaimLegendInline className="rounded-lg" />
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Claim Legend (visible on desktop) */}
              <div className="hidden lg:block">
                <ClaimLegend
                  compact={false}
                  collapsible={true}
                  defaultCollapsed={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-space-950/95 backdrop-blur-sm text-white py-12 mt-16 border-t border-amber-500/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                  <img
                    src="/nko_logo.svg"
                    alt="N'Ko Logo"
                    className="w-6 h-6"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">N'Ko Hub</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Pioneering the digital future of N'Ko education through modern technology.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-amber-300">Tools</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard/nko/inscriptions" className="text-gray-400 hover:text-amber-300 transition-colors text-sm">
                    Motion Inscriptions
                  </Link>
                </li>
                <li>
                  <Link href="/claims" className="text-gray-400 hover:text-amber-300 transition-colors text-sm">
                    Claims Reference
                  </Link>
                </li>
                <li>
                  <Link href="/technical" className="text-gray-400 hover:text-amber-300 transition-colors text-sm">
                    Technical Docs
                  </Link>
                </li>
                <li>
                  <Link href="/nko/translator" className="text-gray-400 hover:text-amber-300 transition-colors text-sm">
                    Translator
                  </Link>
                </li>
                <li>
                  <Link href="/nko/dictionary" className="text-gray-400 hover:text-amber-300 transition-colors text-sm">
                    Dictionary
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-amber-300">Learning</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/nko" className="text-gray-400 hover:text-amber-300 transition-colors text-sm">
                    Learning Hub
                  </Link>
                </li>
                <li>
                  <Link href="/nko/lessons" className="text-gray-400 hover:text-amber-300 transition-colors text-sm">
                    Lessons
                  </Link>
                </li>
                <li>
                  <Link href="/nko/practice" className="text-gray-400 hover:text-amber-300 transition-colors text-sm">
                    Practice
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-amber-500/20 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 N'Ko Hub. Preserving heritage through innovation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
