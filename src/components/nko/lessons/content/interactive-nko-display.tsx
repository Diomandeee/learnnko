"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Volume2, Sparkles, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

interface NkoCharacter {
  character: string
  name: string
  transliteration: string
  pronunciation: string
  meaning?: string
  type: 'vowel' | 'consonant' | 'diacritic' | 'number'
}

interface InteractiveNkoDisplayProps {
  characters?: NkoCharacter[]
  title?: string
  showAnimation?: boolean
  autoPlay?: boolean
  culturalTheme?: 'traditional' | 'modern' | 'academic'
}

// Sample N'Ko characters for demonstration
const defaultCharacters: NkoCharacter[] = [
  {
    character: 'ߒ',
    name: 'N\'Ko Letter A',
    transliteration: 'a',
    pronunciation: '[a]',
    meaning: 'First person pronoun "I"',
    type: 'vowel'
  },
  {
    character: 'ߞ',
    name: 'N\'Ko Letter Ka',
    transliteration: 'ka',
    pronunciation: '[ka]',
    type: 'consonant'
  },
  {
    character: 'ߏ',
    name: 'N\'Ko Letter O',
    transliteration: 'o',
    pronunciation: '[o]',
    type: 'vowel'
  },
  {
    character: 'ߛ',
    name: 'N\'Ko Letter Sa',
    transliteration: 'sa',
    pronunciation: '[sa]',
    type: 'consonant'
  },
  {
    character: 'ߊ',
    name: 'N\'Ko Letter A',
    transliteration: 'a',
    pronunciation: '[a]',
    type: 'vowel'
  },
  {
    character: 'ߡ',
    name: 'N\'Ko Letter Ma',
    transliteration: 'ma',
    pronunciation: '[ma]',
    type: 'consonant'
  }
]

export function InteractiveNkoDisplay({
  characters = defaultCharacters,
  title = "N'Ko Characters",
  showAnimation = true,
  autoPlay = false,
  culturalTheme = 'traditional'
}: InteractiveNkoDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [selectedCharacter, setSelectedCharacter] = useState<NkoCharacter | null>(null)
  const { toast } = useToast()

  // Auto-advance through characters
  useEffect(() => {
    if (isPlaying && showAnimation) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % characters.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, showAnimation, characters.length])

  const playPronunciation = (character: NkoCharacter) => {
    toast({
      title: "Pronunciation",
      description: `${character.character} is pronounced ${character.pronunciation}`,
    })
  }

  const getCharacterColor = (type: string) => {
    switch (type) {
      case 'vowel':
        return 'from-amber-500 to-orange-500'
      case 'consonant':
        return 'from-orange-500 to-yellow-500'
      case 'diacritic':
        return 'from-purple-500 to-yellow-500'
      case 'number':
        return 'from-amber-500 to-orange-500'
      default:
        return 'from-slate-500 to-gray-500'
    }
  }

  const getThemeStyles = () => {
    switch (culturalTheme) {
      case 'traditional':
        return {
          background: 'bg-gradient-to-br from-space-900/80 via-space-800/80 to-amber-900/30',
          border: 'border-amber-500/30',
          accent: 'text-amber-300'
        }
      case 'modern':
        return {
          background: 'bg-gradient-to-br from-space-900/30 to-amber-900/30',
          border: 'border-orange-500/30',
          accent: 'text-blue-300'
        }
      case 'academic':
        return {
          background: 'bg-space-950',
          border: 'border-amber-500/30',
          accent: 'text-amber-300'
        }
      default:
        return {
          background: 'bg-space-950',
          border: 'border-amber-500/30',
          accent: 'text-amber-300'
        }
    }
  }

  const themeStyles = getThemeStyles()
  const currentCharacter = characters[currentIndex]

  return (
    <div className={`p-6 rounded-xl ${themeStyles.background} ${themeStyles.border} border`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className={`w-6 h-6 ${themeStyles.accent}`} />
          <h3 className={`text-xl font-bold ${themeStyles.accent}`}>
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={`${themeStyles.background} ${themeStyles.border} border`}
          >
            {currentIndex + 1} of {characters.length}
          </Badge>
          {showAnimation && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-current"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Character Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
        {/* Character Showcase */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <div 
                    className={`text-8xl font-bold bg-gradient-to-br ${getCharacterColor(currentCharacter.type)} bg-clip-text text-transparent mb-4`}
                    style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
                    dir="rtl"
                  >
                    {currentCharacter.character}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-xl font-semibold text-gray-100">
                      {currentCharacter.name}
                    </h4>
                    
                    <div className="flex items-center justify-center gap-4">
                      <Badge 
                        variant="outline" 
                        className={`capitalize bg-gradient-to-r ${getCharacterColor(currentCharacter.type)} text-white border-0`}
                      >
                        {currentCharacter.type}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playPronunciation(currentCharacter)}
                        className="text-gray-300 hover:text-gray-100"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        {currentCharacter.pronunciation}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Character Details */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <h5 className="font-semibold text-gray-200 mb-2">Transliteration</h5>
                <p className="text-2xl font-mono text-gray-100 bg-space-800/50 px-4 py-2 rounded-lg">
                  {currentCharacter.transliteration}
                </p>
              </div>
              
              <div>
                <h5 className="font-semibold text-gray-200 mb-2">Pronunciation Guide</h5>
                <p className="text-lg text-gray-300 bg-space-900/80 px-4 py-2 rounded-lg">
                  {currentCharacter.pronunciation}
                </p>
              </div>
              
              {currentCharacter.meaning && (
                <div>
                  <h5 className="font-semibold text-gray-200 mb-2">Cultural Meaning</h5>
                  <p className="text-gray-300 bg-amber-900/30 px-4 py-3 rounded-lg border-l-4 border-amber-400">
                    {currentCharacter.meaning}
                  </p>
                </div>
              )}
              
              <div>
                <h5 className="font-semibold text-gray-200 mb-2">Character Type</h5>
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${themeStyles.accent}`} />
                  <span className={`capitalize font-medium ${themeStyles.accent}`}>
                    {currentCharacter.type}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Character Navigation */}
      <div className="flex flex-wrap gap-3 justify-center">
        {characters.map((char, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentIndex(index)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200 ${
              index === currentIndex
                ? `bg-gradient-to-br ${getCharacterColor(char.type)} text-white shadow-lg`
                : 'bg-space-900/80 text-gray-300 hover:bg-space-800/50 border-2 border-space-700/50 hover:border-amber-500/30'
            }`}
            style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
            dir="rtl"
          >
            {char.character}
          </motion.button>
        ))}
      </div>

      {/* Cultural Note */}
      <div className="mt-6 p-4 bg-space-900/50 rounded-lg border border-amber-500/20">
        <p className="text-sm text-gray-300 text-center italic">
          💫 Each N'Ko character carries centuries of West African wisdom and tradition
        </p>
      </div>
    </div>
  )
}

// Specialized component for intro lesson
export function IntroNkoShowcase() {
  const introCharacters: NkoCharacter[] = [
    {
      character: 'ߒ',
      name: 'N\'Ko Letter A (First Person)',
      transliteration: 'a',
      pronunciation: '[a]',
      meaning: 'The letter representing "I" - the foundation of personal identity in N\'Ko',
      type: 'vowel'
    },
    {
      character: 'ߞ',
      name: 'N\'Ko Letter Ka',
      transliteration: 'ka',
      pronunciation: '[ka]',
      meaning: 'Represents the "k" sound, fundamental in Manding languages',
      type: 'consonant'
    },
    {
      character: 'ߏ',
      name: 'N\'Ko Letter O',
      transliteration: 'o',
      pronunciation: '[o]',
      meaning: 'The open "o" vowel, expressing openness and welcome',
      type: 'vowel'
    }
  ]

  return (
    <InteractiveNkoDisplay
      characters={introCharacters}
      title="Discover N'Ko Script"
      showAnimation={true}
      autoPlay={true}
      culturalTheme="traditional"
    />
  )
} 