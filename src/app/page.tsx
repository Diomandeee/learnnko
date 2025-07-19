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
  Sparkles
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            N'Ko Language Learning Platform
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            N'Ko Learning Hub
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Master the N'Ko language through conversation, translation, transcription, and interactive practice. 
            A comprehensive learning platform that adapts to your pace.
          </p>
          <Link href="/nko">
            <Button size="lg" className="mb-8">
              Start Learning N'Ko
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Conversation Practice
              </CardTitle>
              <CardDescription>
                Practice N'Ko through AI-powered conversations with real-time feedback and corrections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Interactive AI chat in N'Ko</li>
                <li>• Grammar corrections & tips</li>
                <li>• Progress tracking</li>
                <li>• Voice input support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-green-600" />
                Smart Translation
              </CardTitle>
              <CardDescription>
                Bidirectional translation between French/English and N'Ko with history tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• French ↔ N'Ko translation</li>
                <li>• Translation history</li>
                <li>• One-click saving</li>
                <li>• Context-aware results</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-red-600" />
                Audio Transcription
              </CardTitle>
              <CardDescription>
                Convert speech and audio files to N'Ko text with automatic translation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Audio file upload</li>
                <li>• YouTube video support</li>
                <li>• Live voice recording</li>
                <li>• Auto N'Ko translation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-purple-600" />
                N'Ko Keyboard
              </CardTitle>
              <CardDescription>
                Virtual N'Ko keyboard for learning proper script input and character recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Virtual N'Ko keyboard</li>
                <li>• Character recognition</li>
                <li>• Typing practice</li>
                <li>• Real-time preview</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-orange-600" />
                Personal Library
              </CardTitle>
              <CardDescription>
                Build your personal collection of N'Ko texts, vocabulary, and learning materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Saved N'Ko texts</li>
                <li>• Vocabulary bank</li>
                <li>• Favorites system</li>
                <li>• Progress tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Learning Analytics
              </CardTitle>
              <CardDescription>
                Track your learning journey with detailed statistics and progress insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Learning statistics</li>
                <li>• Message tracking</li>
                <li>• Vocabulary growth</li>
                <li>• Time spent learning</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Master N'Ko?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands learning the N'Ko language through our comprehensive platform
          </p>
          <Link href="/nko">
            <Button size="lg" variant="outline">
              Enter Learning Hub
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
