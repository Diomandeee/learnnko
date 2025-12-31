"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight,
  Sparkles,
  Play,
  Activity,
  BookOpen,
  Brain,
  Zap,
  Globe,
  ArrowLeft
} from "lucide-react"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">
      {/* Cosmic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.08),transparent_40%)]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.06),transparent_40%)]"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/15 to-violet-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* N'Ko script floating elements */}
        <div className="absolute top-20 left-1/4 text-cyan-400/20 text-4xl animate-pulse font-nko" style={{ animationDelay: '0.5s' }}>ߒ</div>
        <div className="absolute top-1/3 right-1/4 text-violet-400/15 text-3xl animate-pulse font-nko" style={{ animationDelay: '1s' }}>ߓ</div>
        <div className="absolute bottom-1/3 left-1/3 text-cyan-300/15 text-5xl animate-pulse font-nko" style={{ animationDelay: '1.5s' }}>ߕ</div>
        <div className="absolute bottom-1/4 right-1/5 text-emerald-400/10 text-4xl animate-pulse font-nko" style={{ animationDelay: '2s' }}>ߞ</div>
      </div>

      {/* Navigation Bar */}
      <nav className={`relative z-50 transition-all duration-300 sticky top-0 ${
        scrollY > 50 
          ? 'backdrop-blur-xl bg-[#0a0a0f]/95 border-b border-white/5' 
          : 'backdrop-blur-sm bg-[#0a0a0f]/80'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-cyan-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <span className="text-white font-bold text-lg nko-text">ߒ</span>
                </div>
              </div>
              <div>
                <span className="text-xl font-bold text-white">
                  Learn<span className="text-cyan-400">N'Ko</span>
                </span>
                <div className="text-[10px] text-white/40 -mt-1">AI-Powered Learning</div>
              </div>
            </div>

            {/* Launch Button */}
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white font-semibold shadow-lg shadow-cyan-500/20 transition-all duration-300 transform hover:scale-105">
                <Activity className="w-4 h-4 mr-2" />
                Launch Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-24 text-center relative">
          <div className="relative z-10">
            <Badge className="mb-8 px-4 py-2 text-sm font-medium bg-white/5 border border-cyan-500/30 text-cyan-300 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
              Real-Time N'Ko Learning Pipeline
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="nko-text text-cyan-400 text-6xl md:text-8xl block mb-4">
                ߒߞߏ
              </span>
              <span className="text-white">
                Learning Intelligence
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              Watch AI learn N'Ko in real-time. See detections flow in, explore vocabulary trajectories, 
              and witness the continuous learning pipeline building knowledge.
            </p>
            
            {/* Main CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
              <Link href="/dashboard">
                <Button size="lg" className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-cyan-500 via-cyan-600 to-violet-500 hover:from-cyan-600 hover:via-cyan-700 hover:to-violet-600 shadow-2xl shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 text-white">
                  <Play className="w-6 h-6 mr-3" />
                  Launch Dashboard
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
            </div>

            {/* Live Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16">
              {[
                { label: "Videos Processing", value: "532", icon: Play, color: "cyan" },
                { label: "N'Ko Detections", value: "Live", icon: BookOpen, color: "emerald" },
                { label: "World Trajectories", value: "5", icon: Brain, color: "violet" },
                { label: "Learning Rate", value: "Active", icon: Zap, color: "amber" },
              ].map((stat, index) => (
                <Card key={index} className="bg-white/[0.02] border-white/5 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-400`} />
                    <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                    <div className="text-xs text-white/40">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white/[0.02] border-white/5 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Activity className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Live Activity Feed</h3>
                  <p className="text-sm text-white/50">
                    Watch N'Ko detections stream in real-time as videos are processed
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/[0.02] border-white/5 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Brain className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Trajectory Explorer</h3>
                  <p className="text-sm text-white/50">
                    See how words evolve across different contexts and cultural worlds
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/[0.02] border-white/5 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Globe className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">N'Ko Script Display</h3>
                  <p className="text-sm text-white/50">
                    Full RTL support with authentic N'Ko character rendering
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* N'Ko Script Demo */}
            <div className="mt-16 p-8 bg-white/[0.02] border border-white/5 rounded-2xl max-w-2xl mx-auto backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-4">
                <ArrowLeft className="w-4 h-4 text-white/40" />
                <span className="text-sm text-white/40">Right to Left Script</span>
              </div>
              <div className="nko-text text-4xl md:text-5xl text-cyan-400 text-center leading-relaxed" dir="rtl">
                ߒߞߏ ߞߊ߬ߙߊ߲ ߞߊ߬ߙߊ߲߬ߕߊ
              </div>
              <div className="text-sm text-white/40 mt-4 text-center">
                "N'Ko Learning Platform"
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a0a0f]/95 text-white py-8 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/40 text-sm">
            LearnN'Ko • AI-Powered N'Ko Language Learning Pipeline
          </p>
        </div>
      </footer>
    </div>
  )
}
