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
  ChevronRight
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation Bar */}
      <nav className="relative z-50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ቤ</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                N'Ko Hub
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/nko" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Features
              </Link>
              <Link href="/nko/lessons" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Lessons
              </Link>
              <Link href="/nko">
                <Button size="sm" className="shadow-lg">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-24 text-center relative">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="relative z-10">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium shadow-lg animate-fade-in">
              <Sparkles className="w-4 h-4 mr-2" />
              Advanced N'Ko Language Learning Platform
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight animate-fade-in-up">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Master N'Ko
              </span>
              <br />
              <span className="text-slate-800 dark:text-slate-200">Like Never Before</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              Immerse yourself in the rich N'Ko language through AI-powered conversations, 
              smart translations, and interactive lessons designed for modern learners.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up delay-300">
              <Link href="/nko">
                <Button size="lg" className="px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <Play className="w-5 h-5 mr-2" />
                  Start Learning Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/nko/lessons">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore Lessons
                </Button>
              </Link>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16 animate-fade-in-up delay-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-slate-600 dark:text-slate-300">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                <div className="text-slate-600 dark:text-slate-300">Interactive Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">95%</div>
                <div className="text-slate-600 dark:text-slate-300">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="pb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800 dark:text-slate-200">
              Powerful Learning Tools
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Experience N'Ko learning through cutting-edge technology and proven teaching methods
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  AI Conversation Practice
                </CardTitle>
                <CardDescription className="text-base">
                  Practice N'Ko through intelligent AI conversations with real-time feedback and personalized corrections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Interactive AI chat in N'Ko
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Grammar corrections & cultural tips
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Real-time progress tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Advanced voice input support
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Languages className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-green-600 transition-colors">
                  Smart Translation Engine
                </CardTitle>
                <CardDescription className="text-base">
                  Advanced bidirectional translation between French/English and N'Ko with context awareness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    French ↔ N'Ko intelligent translation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Complete translation history
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    One-click save & organize
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Context-aware suggestions
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-red-600 transition-colors">
                  Audio Transcription
                </CardTitle>
                <CardDescription className="text-base">
                  Convert speech and audio files to N'Ko text with automatic translation and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Multi-format audio upload
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    YouTube video integration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Live voice recording
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Automatic N'Ko translation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Keyboard className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                  N'Ko Virtual Keyboard
                </CardTitle>
                <CardDescription className="text-base">
                  Master N'Ko script input with our intelligent virtual keyboard and typing practice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Interactive virtual keyboard
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Character recognition training
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Guided typing practice
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Real-time script preview
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Archive className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-orange-600 transition-colors">
                  Personal Learning Library
                </CardTitle>
                <CardDescription className="text-base">
                  Build and organize your personal collection of N'Ko texts, vocabulary, and materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Curated N'Ko text collection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Smart vocabulary management
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Advanced favorites system
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Detailed progress analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                  Advanced Analytics
                </CardTitle>
                <CardDescription className="text-base">
                  Track your learning journey with detailed statistics, insights, and personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Comprehensive learning metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Progress milestone tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Vocabulary growth insights
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Time optimization suggestions
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 text-center">
          <h2 className="text-4xl font-bold mb-16 text-slate-800 dark:text-slate-200">
            Trusted by Language Learners Worldwide
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="pt-8">
                <div className="flex justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 italic">
                  "The AI conversation feature is incredible! I'm actually having real conversations in N'Ko after just a few weeks."
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold">Sarah Chen</div>
                    <div className="text-sm text-slate-500">Language Student</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="pt-8">
                <div className="flex justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 italic">
                  "The structured lessons and progress tracking keep me motivated. Best N'Ko learning platform I've used!"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold">Ahmed Diallo</div>
                    <div className="text-sm text-slate-500">Cultural Researcher</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="pt-8">
                <div className="flex justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 italic">
                  "The translation tools are so accurate and the audio features help with pronunciation. Highly recommended!"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold">Maria Rodriguez</div>
                    <div className="text-sm text-slate-500">Teacher</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800 dark:text-slate-200">
              Ready to Master N'Ko?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
              Join thousands of learners discovering the beauty of N'Ko language through our comprehensive, AI-powered platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/nko">
                <Button size="lg" className="px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <Play className="w-5 h-5 mr-2" />
                  Start Your Journey
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/nko/lessons">
                <Button size="lg" variant="outline" className="px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse Lessons
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                10,000+ Active Users
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Free to Start
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                4.9/5 Rating
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        .delay-400 {
          animation-delay: 400ms;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
        
        .delay-2000 {
          animation-delay: 2000ms;
        }
      `}</style>
    </div>
  )
}
