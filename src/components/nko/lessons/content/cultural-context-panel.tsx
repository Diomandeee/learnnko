"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Users, 
  BookOpen, 
  Star,
  Heart,
  Lightbulb,
  ChevronRight,
  Quote
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CulturalFact {
  id: string
  title: string
  content: string
  category: 'history' | 'geography' | 'language' | 'tradition' | 'modern'
  icon: React.ReactNode
  nkoText?: string
  significance: string
}

interface CulturalContextPanelProps {
  lessonSection?: number
  culturalTheme?: 'traditional' | 'modern' | 'academic'
}

const culturalFacts: CulturalFact[] = [
  {
    id: 'creation',
    title: 'Birth of N\'Ko',
    content: 'Created in 1949 by Solomana Kanté in Bingerville, Côte d\'Ivoire, N\'Ko emerged from a desire to prove that African languages deserved their own writing systems.',
    category: 'history',
    icon: <Calendar className="w-5 h-5" />,
    nkoText: 'ߒߞߏ ߘߊߞߎ߲',
    significance: 'Represents African intellectual independence and linguistic sovereignty'
  },
  {
    id: 'meaning',
    title: 'The Name "N\'Ko"',
    content: 'N\'Ko means "I say" in all Manding languages, symbolizing the voice of West African peoples finding expression through their own script.',
    category: 'language',
    icon: <Quote className="w-5 h-5" />,
    nkoText: 'ߒߞߏ',
    significance: 'Embodies the principle of African self-expression and cultural voice'
  },
  {
    id: 'geography',
    title: 'Manding Lands',
    content: 'N\'Ko serves speakers across West Africa - from Senegal through Mali, Guinea, Burkina Faso, and Côte d\'Ivoire, uniting diverse communities.',
    category: 'geography',
    icon: <MapPin className="w-5 h-5" />,
    nkoText: 'ߡߊ߲߬ߘߋ߲߫ ߖߡߊ',
    significance: 'Connects millions of people across modern political boundaries'
  },
  {
    id: 'education',
    title: 'Educational Revolution',
    content: 'N\'Ko schools and universities now exist across West Africa, teaching science, mathematics, literature, and Islamic studies in local languages.',
    category: 'modern',
    icon: <BookOpen className="w-5 h-5" />,
    nkoText: 'ߞߊ߬ߙߊ߲߬ߘߊ',
    significance: 'Enables higher education in African languages, preserving and advancing local knowledge'
  },
  {
    id: 'tradition',
    title: 'Oral Tradition Bridge',
    content: 'N\'Ko preserves centuries of oral tradition - epic poems, historical chronicles, and wisdom teachings - in written form for future generations.',
    category: 'tradition',
    icon: <Users className="w-5 h-5" />,
    nkoText: 'ߞߊ߲ߞߊ߲߫ ߘߊߞߎ߲',
    significance: 'Safeguards ancestral knowledge while enabling its scholarly study and preservation'
  },
  {
    id: 'digital',
    title: 'Digital Renaissance',
    content: 'Modern technology has embraced N\'Ko with Unicode support, digital fonts, keyboards, and online learning platforms spreading the script globally.',
    category: 'modern',
    icon: <Lightbulb className="w-5 h-5" />,
    nkoText: 'ߞߐߟߐߦߌ ߘߊߞߎ߲',
    significance: 'Demonstrates how ancient wisdom adapts to modern technology'
  }
]

export function CulturalContextPanel({ 
  lessonSection = 0, 
  culturalTheme = 'traditional' 
}: CulturalContextPanelProps) {
  const [currentFact, setCurrentFact] = useState(0)
  const [expandedFact, setExpandedFact] = useState<string | null>(null)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'history':
        return 'from-amber-500 to-orange-500'
      case 'geography':
        return 'from-amber-500 to-orange-500'
      case 'language':
        return 'from-orange-500 to-yellow-500'
      case 'tradition':
        return 'from-purple-500 to-pink-500'
      case 'modern':
        return 'from-yellow-500 to-orange-500'
      default:
        return 'from-slate-500 to-gray-500'
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      history: 'bg-amber-900/30 text-amber-300',
      geography: 'bg-amber-900/30 text-amber-300',
      language: 'bg-blue-900/30 text-blue-300',
      tradition: 'bg-purple-900/30 text-purple-300',
      modern: 'bg-yellow-900/30 text-yellow-300'
    }
    return colors[category as keyof typeof colors] || 'bg-space-800/50 text-gray-100'
  }

  const getThemeStyles = () => {
    switch (culturalTheme) {
      case 'traditional':
        return 'bg-gradient-to-br from-space-900/80 via-space-800/80 to-amber-900/30 border-amber-500/30'
      case 'modern':
        return 'bg-gradient-to-br from-space-900/30 to-amber-900/30 border-orange-500/30'
      case 'academic':
        return 'bg-space-950 border-amber-500/30'
      default:
        return 'bg-space-950 border-amber-500/30'
    }
  }

  // Get relevant facts based on lesson section
  const getRelevantFacts = () => {
    if (lessonSection <= 2) return culturalFacts.filter(f => f.category === 'history' || f.category === 'language')
    if (lessonSection <= 5) return culturalFacts.filter(f => f.category === 'geography' || f.category === 'tradition')
    return culturalFacts.filter(f => f.category === 'modern')
  }

  const relevantFacts = getRelevantFacts()
  const fact = relevantFacts[currentFact] || culturalFacts[0]

  return (
    <Card className={`border-0 shadow-lg ${getThemeStyles()}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            Cultural Context
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            West African Heritage
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Featured Cultural Fact */}
        <AnimatePresence mode="wait">
          <motion.div
            key={fact.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor(fact.category)} rounded-lg flex items-center justify-center text-white shadow-md`}>
                {fact.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-100">{fact.title}</h3>
                  <Badge variant="secondary" className={`text-xs ${getCategoryBadge(fact.category)}`}>
                    {fact.category}
                  </Badge>
                </div>
                {fact.nkoText && (
                  <div
                    className="text-xl font-bold text-amber-300 mb-2"
                    style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
                    dir="rtl"
                  >
                    {fact.nkoText}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="bg-space-900/70 p-4 rounded-lg">
              <p className="text-gray-200 leading-relaxed mb-3">
                {fact.content}
              </p>

              <div className="border-l-4 border-amber-400 pl-4 bg-amber-900/30 p-3 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-300 mb-1">Cultural Significance</p>
                    <p className="text-sm text-amber-200">{fact.significance}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {relevantFacts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFact(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentFact
                    ? 'bg-amber-500 w-6'
                    : 'bg-gray-400 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentFact((prev) => (prev + 1) % relevantFacts.length)}
            className="text-amber-400 hover:text-amber-300"
          >
            Next Insight
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* Quick Facts */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-amber-500/20">
          <div className="text-center p-3 bg-space-900/50 rounded-lg">
            <div className="text-lg font-bold text-gray-100">27</div>
            <div className="text-xs text-gray-300">Letters in N'Ko</div>
          </div>
          <div className="text-center p-3 bg-space-900/50 rounded-lg">
            <div className="text-lg font-bold text-gray-100">1949</div>
            <div className="text-xs text-gray-300">Year Created</div>
          </div>
          <div className="text-center p-3 bg-space-900/50 rounded-lg">
            <div className="text-lg font-bold text-gray-100">15M+</div>
            <div className="text-xs text-gray-300">Speakers Served</div>
          </div>
          <div className="text-center p-3 bg-space-900/50 rounded-lg">
            <div className="text-lg font-bold text-gray-100">RTL</div>
            <div className="text-xs text-gray-300">Writing Direction</div>
          </div>
        </div>

        {/* Traditional Pattern */}
        <div className="flex justify-center pt-4">
          <div className="flex gap-1 opacity-30">
            {['ߒ', 'ߞ', 'ߏ', '߫', 'ߒ', 'ߞ', 'ߏ'].map((char, i) => (
              <span
                key={i}
                className="text-amber-400 text-sm"
                style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 