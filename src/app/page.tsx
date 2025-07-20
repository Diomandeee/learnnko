"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle,
  Languages,
  Mic,
  Keyboard,
  Archive,
  BookOpen,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  Star,
  Play,
  ChevronRight,
  Menu,
  X,
  User,
  LogIn,
  UserPlus,
  Award,
  Globe,
  Zap,
  Shield,
  Heart,
  CheckCircle,
  ArrowUpRight,
  Feather,
  Calendar,
  Map,
  ArrowLeft
} from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

// Interactive N'Ko Keyboard Component
function InteractiveNKoKeyboard() {
  const [displayText, setDisplayText] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  // N'Ko character layout (simplified keyboard layout)
  const nkoKeyboard = [
    // Row 1 - Numbers
    ["߁", "߂", "߃", "߄", "߅", "߆", "߇", "߈", "߉", "߀"],
    // Row 2 - Main letters
    ["ߒ", "ߓ", "ߔ", "ߕ", "ߖ", "ߗ", "ߘ", "ߙ", "ߚ", "ߛ"],
    // Row 3 - More letters  
    ["ߜ", "ߝ", "ߞ", "ߟ", "ߠ", "ߡ", "ߢ", "ߣ", "ߤ", "ߥ"],
    // Row 4 - Additional letters
    ["ߦ", "ߧ", "ߨ", "ߩ", "ߪ", "߫", "߬", "߭", "߮", "߯"]
  ]

  const handleKeyPress = (char: string) => {
    setIsTyping(true)
    
    // Insert character at current cursor position (right-to-left)
    const newText = displayText.slice(0, cursorPosition) + char + displayText.slice(cursorPosition)
    setDisplayText(newText)
    setCursorPosition(cursorPosition + 1)
    
    // Reset typing animation
    setTimeout(() => setIsTyping(false), 200)
  }

  const handleBackspace = () => {
    if (cursorPosition > 0) {
      const newText = displayText.slice(0, cursorPosition - 1) + displayText.slice(cursorPosition)
      setDisplayText(newText)
      setCursorPosition(cursorPosition - 1)
    }
  }

  const handleClear = () => {
    setDisplayText("")
    setCursorPosition(0)
  }

  const demoTexts = [
    "ߊߟߎ߬ ߞߊ߬ ߝߘߊ߬ߝߌ߲߬ߠߊ߫ ߞߎߘߊ",
    "ߒߞߏ ߞߊ߬ߙߊ߲ ߞߊ߬ߙߊ߲߬ߕߊ",
    "ߊߝߙߌߞߌ߬ ߖߐ߮ ߞߊ߬ߙߊ߲"
  ]

  const handleDemo = (text: string) => {
    let i = 0
    setDisplayText("")
    setCursorPosition(0)
    
    const typeChar = () => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1))
        setCursorPosition(i + 1)
        i++
        setTimeout(typeChar, 150)
      }
    }
    typeChar()
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-800/50 to-emerald-900/30 rounded-2xl p-6 backdrop-blur-sm border border-emerald-500/20 max-w-2xl">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-emerald-300 mb-2">Interactive N'Ko Keyboard</h3>
        <p className="text-slate-300 text-sm font-medium">Click keys to type • Experience right-to-left writing</p>
      </div>
      
      {/* Display Area */}
      <div className="mb-6 p-4 bg-slate-900/70 rounded-lg border border-emerald-500/30 min-h-[80px] relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-emerald-300 text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Right to Left</span>
          </div>
          <div className="text-slate-400 text-xs font-medium">
            {displayText.length} characters
          </div>
        </div>
        
        <div 
          className="text-2xl text-emerald-100 font-bold min-h-[2rem] text-right leading-relaxed"
          style={{ 
            direction: 'rtl',
            fontFamily: 'system-ui, sans-serif',
            wordBreak: 'break-all'
          }}
        >
          {displayText || (
            <span className="text-emerald-400/50 italic text-lg">
              ߒߞߏ ߞߊ߬ߙߊ߲ (N'Ko Script)
            </span>
          )}
          {displayText && (
            <span className={`inline-block w-0.5 h-8 bg-emerald-400 ml-1 ${isTyping ? 'animate-pulse' : 'animate-blink'}`}></span>
          )}
        </div>
      </div>

      {/* Demo Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-emerald-300 text-sm mr-2">Try:</span>
        {demoTexts.map((text, index) => (
          <button
            key={index}
            onClick={() => handleDemo(text)}
            className="px-3 py-1 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/30 transition-colors"
          >
            Demo {index + 1}
          </button>
        ))}
      </div>
      
      {/* Virtual Keyboard */}
      <div className="space-y-2">
        {nkoKeyboard.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((char, charIndex) => (
              <button
                key={`${rowIndex}-${charIndex}`}
                onClick={() => handleKeyPress(char)}
                className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-emerald-600 hover:to-emerald-700 text-white text-lg font-bold rounded-lg border border-slate-600 hover:border-emerald-400 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {char}
              </button>
            ))}
          </div>
        ))}
        
        {/* Control buttons */}
        <div className="flex gap-2 justify-center mt-4">
          <button
            onClick={handleBackspace}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm rounded-lg border border-red-500/30 transition-colors"
          >
            ⌫ Backspace
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-slate-500/20 hover:bg-slate-500/30 text-slate-300 text-sm rounded-lg border border-slate-500/30 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => handleKeyPress(" ")}
            className="px-6 py-2 bg-slate-600/50 hover:bg-slate-600/70 text-slate-300 text-sm rounded-lg border border-slate-500/30 transition-colors"
          >
            Space
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  )
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* N'Ko script floating elements */}
        <div className="absolute top-20 left-1/4 text-emerald-400/20 text-4xl animate-bounce delay-500">ߒ</div>
        <div className="absolute top-1/3 right-1/4 text-teal-400/20 text-3xl animate-bounce delay-1000">ߓ</div>
        <div className="absolute bottom-1/3 left-1/3 text-cyan-400/20 text-5xl animate-bounce delay-1500">ߕ</div>
      </div>

      {/* Enhanced Navigation Bar */}
      <nav className={`relative z-50 transition-all duration-300 sticky top-0 ${
        scrollY > 50 
          ? 'backdrop-blur-xl bg-slate-900/95 border-b border-emerald-500/20 shadow-lg shadow-emerald-500/10' 
          : 'backdrop-blur-sm bg-slate-900/80 border-b border-emerald-500/10'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 transform hover:scale-110 transition-all duration-300">
                  <img 
                    src="/nko_logo.svg" 
                    alt="N'Ko Logo" 
                    className="w-8 h-8 drop-shadow-lg"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  N'Ko Hub
                </span>
                <div className="text-xs text-emerald-300/70 -mt-1 font-medium">Learn • Practice • Master</div>
              </div>
            </div>

         

            {/* Enhanced Auth Buttons */}
            <div className="flex items-center gap-3">
              {session ? (
                <div className="flex items-center gap-3">
                  <Link href="/nko">
                    <Button size="sm" className="shadow-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 border-0 transform hover:scale-105 transition-all duration-300">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-emerald-100 hover:text-emerald-300 hover:bg-emerald-500/10">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Profile</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-emerald-100 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300">
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign In</span>
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg transform hover:scale-105 transition-all duration-300">
                      <UserPlus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Sign Up</span>
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-emerald-100 hover:text-emerald-300 hover:bg-emerald-500/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-emerald-500/20 backdrop-blur-xl bg-slate-900/95 rounded-lg">
              <div className="flex flex-col gap-3 pt-4">
                {[
                  { href: "/nko/lessons", label: "Lessons" },
                  { href: "/nko/conversation", label: "Practice" },
                  { href: "/nko/translate", label: "Translate" },
                  { href: "/nko/dictionary", label: "Dictionary" }
                ].map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className="text-sm font-medium text-slate-300 hover:text-emerald-300 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {!session && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-emerald-500/20">
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-100 hover:text-emerald-300 hover:bg-emerald-500/10">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm" className="w-full justify-start bg-gradient-to-r from-emerald-500 to-teal-500">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4">
        {/* Enhanced Hero Section */}
        <section className="py-24 text-center relative">
          <div className="relative z-10">
            <Badge variant="secondary" className="mb-8 px-6 py-3 text-sm font-medium shadow-lg animate-fade-in bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-400/30 text-emerald-100 backdrop-blur-sm">
              <Calendar className="w-4 h-4 mr-2 text-yellow-400" />
              First Modern Digital N'Ko Learning Platform
              <Star className="w-4 h-4 ml-2 text-yellow-400" />
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-10 leading-tight animate-fade-in-up">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-2xl">
                The Future of
              </span>
              <br />
              <span className="text-slate-800 drop-shadow-lg">N'Ko Learning</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-700 mb-14 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-200 font-medium">
              Experience the ancient N'Ko script through modern technology. Watch letters come alive, 
              master the right-to-left writing system, and connect with centuries of West African heritage.
            </p>
            
            <div className="flex flex-col lg:flex-row gap-12 items-center justify-center mb-20">
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up delay-300">
                {session ? (
                  <Link href="/nko">
                    <Button size="lg" className="px-10 py-5 text-lg font-semibold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 border-0">
                      <Play className="w-6 h-6 mr-3" />
                      Continue Learning
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/register">
                    <Button size="lg" className="px-10 py-5 text-lg font-semibold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 border-0">
                      <UserPlus className="w-6 h-6 mr-3" />
                      Start Learning Now
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </Button>
                  </Link>
                )}
                <Link href="/nko/lessons">
                  <Button size="lg" variant="outline" className="px-10 py-5 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-emerald-400/50 text-emerald-100 hover:bg-emerald-500/10 hover:border-emerald-400 backdrop-blur-sm">
                    <BookOpen className="w-6 h-6 mr-3" />
                    Explore Lessons
                  </Button>
                </Link>
              </div>

              {/* Interactive N'Ko Keyboard */}
              <div className="animate-fade-in-up delay-500">
                <InteractiveNKoKeyboard />
              </div>
            </div>

            {/* Historical Context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-fade-in-up delay-600">
              <div className="text-center p-6 bg-gradient-to-br from-slate-800/50 to-emerald-900/30 rounded-2xl backdrop-blur-sm border border-emerald-500/20">
                <Calendar className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-emerald-300 mb-2">1949</div>
                <div className="text-slate-300 text-sm font-medium">N'Ko Script Created by Solomana Kante</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-slate-800/50 to-teal-900/30 rounded-2xl backdrop-blur-sm border border-teal-500/20">
                <Map className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-teal-300 mb-2">8 Countries</div>
                <div className="text-slate-300 text-sm font-medium">West African Nations Using N'Ko</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-slate-800/50 to-cyan-900/30 rounded-2xl backdrop-blur-sm border border-cyan-500/20">
                <Globe className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-cyan-300 mb-2">40M+</div>
                <div className="text-slate-300 text-sm font-medium">Mande Language Speakers Worldwide</div>
              </div>
            </div>

            {/* N'Ko Facts Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20 animate-fade-in-up delay-400">
              {[
                { number: "59", label: "N'Ko Characters", icon: BookOpen, color: "emerald", description: "Complete alphabet with unique diacritics" },
                { number: "270°", label: "Reading Direction", icon: ArrowLeft, color: "teal", description: "Right-to-left script like Arabic & Hebrew" },
                { number: "1949", label: "Year Created", icon: Calendar, color: "cyan", description: "Invented by scholar Solomana Kante" }
              ].map((fact, index) => (
                <div key={index} className="relative group">
                  <div className="text-center p-8 bg-gradient-to-br from-slate-800/80 via-emerald-900/50 to-teal-900/50 rounded-3xl backdrop-blur-sm shadow-xl border border-emerald-500/20 hover:border-emerald-400/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10">
                    <fact.icon className={`w-8 h-8 mx-auto mb-4 text-${fact.color}-400`} />
                    <div className={`text-4xl font-bold text-${fact.color}-400 mb-2`}>{fact.number}</div>
                    <div className="text-slate-200 font-medium mb-2">{fact.label}</div>
                    <div className="text-xs text-slate-400 font-medium">{fact.description}</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              ))}
            </div>

            {/* Revolutionary Features */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-16 opacity-80">
              {["Digital First", "Stroke Animation", "Right-to-Left Mastery", "Cultural Heritage"].map((badge, index) => (
                <div key={index} className="flex items-center gap-2 text-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Features Grid */}
        <section className="pb-32">
          <div className="text-center mb-20">
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-300">
              <Zap className="w-4 h-4 mr-2" />
              Revolutionary Learning Methods
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white">
              Modern Tools for Ancient Script
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
              Experience N'Ko through innovative technology that respects tradition while embracing modern learning science
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Feather,
                title: "Stroke-by-Stroke Animation",
                description: "Watch every N'Ko character form naturally with authentic stroke order and direction guidance",
                features: ["Live character animation", "Traditional stroke patterns", "Right-to-left flow mastery", "Authentic calligraphy style"],
                color: "emerald",
                delay: "0"
              },
              {
                icon: MessageCircle,
                title: "Interactive Conversations", 
                description: "Practice real N'Ko conversations with intelligent tutoring and cultural context",
                features: ["Natural conversation flow", "Cultural context tips", "Grammar pattern recognition", "Progress-based difficulty"],
                color: "teal",
                delay: "100"
              },
              {
                icon: Languages,
                title: "Smart Translation Engine",
                description: "Bidirectional translation preserving N'Ko's unique grammatical structure and meaning",
                features: ["Mande ↔ French/English", "Cultural meaning preservation", "Context-aware translation", "Historical usage examples"],
                color: "cyan",
                delay: "200"
              },
              {
                icon: Mic,
                title: "Pronunciation Mastery",
                description: "Advanced speech recognition trained specifically for N'Ko phonetics and tonal patterns",
                features: ["Tonal pattern recognition", "Regional accent support", "Pronunciation feedback", "Audio-visual learning"],
                color: "emerald",
                delay: "300"
              },
              {
                icon: Keyboard,
                title: "Authentic N'Ko Keyboard",
                description: "Custom input system respecting N'Ko's right-to-left script and unique character relationships",
                features: ["Full N'Ko character set", "Right-to-left input flow", "Smart character completion", "Traditional layout options"],
                color: "teal",
                delay: "400"
              },
              {
                icon: Archive,
                title: "Cultural Dictionary",
                description: "Comprehensive N'Ko dictionary with historical context, proverbs, and cultural significance",
                features: ["20,000+ N'Ko entries", "Historical etymology", "Cultural proverbs & sayings", "Regional variations"],
                color: "cyan",
                delay: "500"
              }
            ].map((feature, index) => (
              <Card key={index} className={`group hover:shadow-2xl hover:shadow-${feature.color}-500/20 transition-all duration-500 transform hover:-translate-y-3 border-0 shadow-xl bg-gradient-to-br from-slate-800/90 via-slate-800/70 to-slate-900/90 backdrop-blur-sm animate-fade-in-up delay-${feature.delay}`}>
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br from-${feature.color}-400 via-${feature.color}-500 to-${feature.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-${feature.color}-500/25`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className={`text-xl text-white group-hover:text-${feature.color}-300 transition-colors mb-3`}>
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base text-slate-300 leading-relaxed font-medium">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-200">
                        <div className={`w-2 h-2 bg-${feature.color}-400 rounded-full shadow-sm`}></div>
                        <span className="text-sm font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Button variant="ghost" size="sm" className={`text-${feature.color}-400 hover:text-${feature.color}-300 hover:bg-${feature.color}-500/10 p-0 h-auto font-medium`}>
                      Try it now <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="pb-32">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-16 text-white shadow-2xl border border-emerald-400/30 overflow-hidden">
              {/* Background N'Ko Characters */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 text-6xl font-bold">ߒ</div>
                <div className="absolute top-20 right-20 text-4xl font-bold">ߓ</div>
                <div className="absolute bottom-20 left-1/3 text-7xl font-bold">ߕ</div>
                <div className="absolute bottom-10 right-10 text-5xl font-bold">ߘ</div>
              </div>
              
              <div className="relative z-10 text-center">
                <Badge className="mb-8 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                  <Heart className="w-4 h-4 mr-2" />
                  Join the N'Ko Renaissance
                </Badge>
                <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                  Ready to Make History?
                </h2>
                <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
                  Be part of the first generation to learn N'Ko through modern digital methods. 
                  Connect with your heritage through revolutionary technology.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  {session ? (
                    <Link href="/nko">
                      <Button size="lg" className="px-10 py-5 text-lg font-semibold bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl transform hover:scale-105 transition-all duration-300">
                        <Play className="w-6 h-6 mr-3" />
                        Continue Your Journey
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/register">
                      <Button size="lg" className="px-10 py-5 text-lg font-semibold bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl transform hover:scale-105 transition-all duration-300">
                        <UserPlus className="w-6 h-6 mr-3" />
                        Start Your Journey
                      </Button>
                    </Link>
                  )}
                  <Link href="/nko/lessons">
                    <Button size="lg" variant="outline" className="px-10 py-5 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-emerald-600 shadow-lg transition-all duration-300">
                      <BookOpen className="w-6 h-6 mr-3" />
                      Explore Lessons
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-slate-900/95 backdrop-blur-sm text-white py-16 border-t border-emerald-500/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                  <img 
                    src="/nko_logo.svg" 
                    alt="N'Ko Logo" 
                    className="w-6 h-6"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">N'Ko Hub</span>
              </div>
              <p className="text-slate-300 leading-relaxed mb-6 font-medium">
                Pioneering the digital future of N'Ko education. Honoring tradition through innovation, 
                connecting learners with the rich heritage of West African script and culture.
              </p>
              <div className="flex gap-3">
                {[Globe, Shield, Award].map((Icon, index) => (
                  <div key={index} className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center hover:bg-emerald-500/30 transition-colors cursor-pointer">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Learning",
                links: [
                  { href: "/nko/lessons", label: "Interactive Lessons" },
                  { href: "/nko/conversation", label: "Practice Conversations" },
                  { href: "/nko/translate", label: "Smart Translation" },
                  { href: "/nko/dictionary", label: "Cultural Dictionary" }
                ]
              },
              {
                title: "Heritage", 
                links: [
                  { href: "/nko/history", label: "N'Ko History" },
                  { href: "/nko/culture", label: "Cultural Context" },
                  { href: "/nko/community", label: "Learning Community" },
                  { href: "/nko/stories", label: "Traditional Stories" }
                ]
              },
              {
                title: "Account",
                links: session ? [
                  { href: "/profile", label: "Your Profile" },
                  { href: "/progress", label: "Learning Progress" },
                  { href: "/settings", label: "Preferences" },
                  { href: "/auth/logout", label: "Sign Out" }
                ] : [
                  { href: "/auth/login", label: "Sign In" },
                  { href: "/auth/register", label: "Create Account" },
                  { href: "/demo", label: "Try Demo" }
                ]
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-6 text-emerald-300">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href={link.href} className="text-slate-400 hover:text-emerald-300 transition-colors text-sm font-medium">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-emerald-500/20 pt-8 text-center">
            <p className="text-slate-400 text-sm font-medium">
              &copy; 2024 N'Ko Hub. Preserving heritage through innovation. Made with ❤️ for the N'Ko community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}