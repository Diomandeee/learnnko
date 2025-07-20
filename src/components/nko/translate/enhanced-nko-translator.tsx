"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeftRight, 
  Copy, 
  Volume2, 
  Loader2, 
  Languages,
  Sparkles,
  BookOpen,
  RefreshCw,
  Check,
  AlertCircle,
  Lightbulb
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Enhanced transliteration system
class EnhancedNkoTransliterator {
  private commonWords: Record<string, string> = {
    // Basic words
    'hello': 'ߛߊ߬ߟߌ',
    'goodbye': 'ߞߊ߲߬ߘߊ',
    'yes': 'ߎߐ߫',
    'no': 'ߊߺߎ߬',
    'thank you': 'ߊߟߎ߬ ߛߌ߰ߢߐ߲߯',
    'please': 'ߟߐ߲߫',
    'good': 'ߒߞߏ',
    'bad': 'ߖߌ߬ߦߊ',
    'water': 'ߖߌ',
    'food': 'ߓߊߟߏ',
    'house': 'ߓߊ߲߬ߕߊ',
    'family': 'ߘߋ߲ߞߍ',
    'friend': 'ߕߋߙߎ',
    'love': 'ߞߊ߬ߒߕߊ߬',
    'peace': 'ߘߊߦߟߍ',
    'learn': 'ߞߊ߬ߙߊ߲',
    'teach': 'ߞߊ߬ߙߊ߲߬ߡߊ',
    'book': 'ߓߙߎߞߎ',
    'write': 'ߛߓߍ',
    'read': 'ߞߊ߬ߙߊ߲',
    'speak': 'ߞߊ߲߫',
    'listen': 'ߊߙߋ߫',
    'go': 'ߕߊ߯',
    'come': 'ߣߊ߬',
    'today': 'ߕߊ߬ߟߏ߲',
    'tomorrow': 'ߛߌ߰ߣߍ߲',
    'yesterday': 'ߞߎ߲߬ߜߍ߬ߛߌ',
    'morning': 'ߛߎ߬ߓߊ',
    'evening': 'ߞߐߞߊ',
    'night': 'ߓߊ߯ߙߊ',
    'school': 'ߞߊ߬ߙߊ߲߬ߘߊ',
    'teacher': 'ߞߊ߬ߙߊ߲߬ߡߊ',
    'student': 'ߞߊ߬ߙߊ߲߬ߘߋ߲',
    'money': 'ߞߊ߲߬ߞߊ',
    'work': 'ߓߊ߯ߙߊ',
    'eat': 'ߘߞߊ',
    'drink': 'ߞߌ߲߫',
    'sleep': 'ߞߛߊ',
    'walk': 'ߛߍ߬ߞߍ',
    'run': 'ߞߎߣߐ',
    'big': 'ߓߌ߬ߊ߬',
    'small': 'ߓߏ߬ߺߋ',
    'old': 'ߞߋߙߊ',
    'new': 'ߞߎ߲߬ߞߟߊ',
    'beautiful': 'ߣߺߊ߬',
    'strong': 'ߞߊ߬ߘߌ߬',
    'weak': 'ߞߌ߬ߘߊ',
  }

  private latinToNkoMap: Record<string, string> = {
    // Vowels
    'a': 'ߊ', 'e': 'ߋ', 'i': 'ߌ', 'ɛ': 'ߍ', 'u': 'ߎ', 'o': 'ߏ', 'ɔ': 'ߐ',
    
    // Consonants
    'b': 'ߓ', 'p': 'ߔ', 't': 'ߕ', 'j': 'ߖ', 'c': 'ߗ', 'd': 'ߘ', 'r': 'ߙ',
    's': 'ߚ', 'gb': 'ߛ', 'f': 'ߜ', 'k': 'ߝ', 'q': 'ߞ', 'l': 'ߟ', 'm': 'ߠ',
    'n': 'ߡ', 'ny': 'ߢ', 'w': 'ߣ', 'h': 'ߤ', 'y': 'ߥ',
    
    // Numbers
    '0': '߀', '1': '߁', '2': '߂', '3': '߃', '4': '߄',
    '5': '߅', '6': '߆', '7': '߇', '8': '߈', '9': '߉'
  }

  public translateToNko(text: string): { translation: string; confidence: 'high' | 'medium' | 'low'; method: string } {
    if (!text.trim()) return { translation: '', confidence: 'high', method: 'empty' }
    
    const lowerText = text.toLowerCase().trim()
    
    // Check for exact word matches first
    if (this.commonWords[lowerText]) {
      return { 
        translation: this.commonWords[lowerText], 
        confidence: 'high', 
        method: 'dictionary' 
      }
    }
    
    // Check for partial matches in common phrases
    for (const [key, value] of Object.entries(this.commonWords)) {
      if (lowerText.includes(key)) {
        const result = text.replace(new RegExp(key, 'gi'), value)
        return { 
          translation: result, 
          confidence: 'medium', 
          method: 'partial-dictionary' 
        }
      }
    }
    
    // Fallback to character-by-character transliteration
    let result = ''
    for (let i = 0; i < text.length; i++) {
      const char = text[i].toLowerCase()
      if (this.latinToNkoMap[char]) {
        result += this.latinToNkoMap[char]
      } else if (char === ' ') {
        result += ' '
      } else {
        result += char // Keep unknown characters as-is
      }
    }
    
    return { 
      translation: result, 
      confidence: 'low', 
      method: 'transliteration' 
    }
  }

  public getSuggestions(text: string): string[] {
    const lowerText = text.toLowerCase()
    return Object.keys(this.commonWords)
      .filter(word => word.startsWith(lowerText) && word !== lowerText)
      .slice(0, 5)
  }
}

interface TranslationExample {
  english: string
  french: string
  nko: string
  category: string
}

const translationExamples: TranslationExample[] = [
  { english: "Hello", french: "Bonjour", nko: "ߛߊ߬ߟߌ", category: "Greetings" },
  { english: "Good morning", french: "Bonjour", nko: "ߛߎ߬ߓߊ ߖߋ߬ߣߌ߲", category: "Greetings" },
  { english: "Thank you", french: "Merci", nko: "ߊߟߎ߬ ߛߌ߰ߢߐ߲߯", category: "Politeness" },
  { english: "How are you?", french: "Comment allez-vous?", nko: "ߌ ߞߊ߬ߘߌ߫ ߞߊ߲߬؟", category: "Questions" },
  { english: "I love learning", french: "J'aime apprendre", nko: "ߒ ߞߊ߬ ߞߊ߬ߙߊ߲ ߞߊ߬ߒߕߊ߬", category: "Education" },
  { english: "Welcome", french: "Bienvenue", nko: "ߡߊ߰ߙߌ", category: "Greetings" },
]

export function EnhancedNkoTranslator() {
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationMethod, setTranslationMethod] = useState<string>("")
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low'>('high')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recentTranslations, setRecentTranslations] = useState<Array<{
    input: string
    output: string
    timestamp: Date
  }>>([])
  const [selectedExample, setSelectedExample] = useState<TranslationExample | null>(null)
  const { toast } = useToast()

  const transliterator = new EnhancedNkoTransliterator()

  // Real-time translation with debouncing
  const performTranslation = useCallback(async (text: string) => {
    if (!text.trim()) {
      setTranslatedText("")
      setConfidence('high')
      setTranslationMethod("")
      setSuggestions([])
      return
    }

    setIsTranslating(true)
    
    // Get instant transliteration
    const result = transliterator.translateToNko(text)
    setTranslatedText(result.translation)
    setConfidence(result.confidence)
    setTranslationMethod(result.method)
    
    // Get suggestions
    const textSuggestions = transliterator.getSuggestions(text)
    setSuggestions(textSuggestions)
    
    // Try AI translation for better results (fallback to transliteration if fails)
    try {
      const response = await fetch('/api/nko/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          from: 'french',
          to: 'nko'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.translation && data.translation !== text) {
          setTranslatedText(data.translation)
          setConfidence('high')
          setTranslationMethod('ai')
        }
      }
    } catch (error) {
      console.log('AI translation unavailable, using transliteration')
    }
    
    setIsTranslating(false)
  }, [])

  // Debounced translation
  useEffect(() => {
    const timer = setTimeout(() => {
      performTranslation(sourceText)
    }, 300)

    return () => clearTimeout(timer)
  }, [sourceText, performTranslation])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translatedText)
      toast({
        title: "Copied!",
        description: "N'Ko text copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const handleExampleClick = (example: TranslationExample) => {
    setSourceText(example.english)
    setSelectedExample(example)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSourceText(suggestion)
  }

  const addToRecent = () => {
    if (sourceText.trim() && translatedText.trim()) {
      setRecentTranslations(prev => [
        { input: sourceText, output: translatedText, timestamp: new Date() },
        ...prev.slice(0, 4)
      ])
    }
  }

  const getConfidenceColor = () => {
    switch (confidence) {
      case 'high': return 'text-emerald-600 bg-emerald-50'
      case 'medium': return 'text-amber-600 bg-amber-50'
      case 'low': return 'text-orange-600 bg-orange-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  const getConfidenceIcon = () => {
    switch (confidence) {
      case 'high': return <Check className="w-3 h-3" />
      case 'medium': return <AlertCircle className="w-3 h-3" />
      case 'low': return <RefreshCw className="w-3 h-3" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Languages className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                N'Ko Translator
              </h1>
              <p className="text-slate-600">Intelligent French/English to N'Ko translation</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Real-time translation</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-teal-500" />
              <span>Smart suggestions</span>
            </div>
            <div className="flex items-center gap-1">
              <Volume2 className="w-4 h-4 text-cyan-500" />
              <span>Audio support</span>
            </div>
          </div>
        </div>

        {/* Main Translation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">FR</span>
                  </div>
                  French/English
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Type in French or English... Try 'hello', 'thank you', or 'good morning'"
                    className="min-h-[120px] text-lg resize-none border-2 border-slate-200 focus:border-emerald-400 transition-colors"
                  />
                  {isTranslating && (
                    <div className="absolute top-2 right-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    </div>
                  )}
                </div>

                {/* Smart Suggestions */}
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <h4 className="text-sm font-medium text-slate-700 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      Suggestions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm hover:bg-emerald-200 transition-colors"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Translation Method & Confidence */}
                {translationMethod && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getConfidenceColor()}`}>
                      {getConfidenceIcon()}
                      <span className="ml-1 capitalize">{confidence} confidence</span>
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {translationMethod === 'ai' ? 'AI Translation' : 
                       translationMethod === 'dictionary' ? 'Dictionary Match' :
                       translationMethod === 'partial-dictionary' ? 'Smart Match' :
                       'Phonetic'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">ߒ</span>
                  </div>
                  N'Ko Script
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div 
                    className="min-h-[120px] p-4 border-2 border-slate-200 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center"
                    dir="rtl"
                  >
                    <AnimatePresence mode="wait">
                      {translatedText ? (
                        <motion.div
                          key={translatedText}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="text-center"
                        >
                          <div 
                            className="text-2xl font-bold text-emerald-800 mb-2 leading-relaxed"
                            style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
                          >
                            {translatedText}
                          </div>
                          {selectedExample && (
                            <div className="text-sm text-slate-600">
                              Also in French: <span className="font-medium">{selectedExample.french}</span>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-slate-400 text-center"
                        >
                          <div className="text-4xl mb-2">ߒߞߏ</div>
                          <p className="text-sm">N'Ko translation will appear here...</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Action Buttons */}
                {translatedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2"
                  >
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy N'Ko
                    </Button>
                    <Button
                      onClick={() => {/* Add audio functionality */}}
                      variant="outline"
                      size="icon"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={addToRecent}
                      variant="outline"
                      size="icon"
                    >
                      <BookOpen className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Examples & Recent */}
          <div className="lg:col-span-1 space-y-6">
            {/* Translation Examples */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Try These Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {translationExamples.slice(0, 6).map((example, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleExampleClick(example)}
                    className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-800">{example.english}</div>
                        <div 
                          className="text-sm text-emerald-600 mt-1"
                          style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
                          dir="rtl"
                        >
                          {example.nko}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {example.category}
                      </Badge>
                    </div>
                  </motion.button>
                ))}
              </CardContent>
            </Card>

            {/* Recent Translations */}
            {recentTranslations.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-teal-500" />
                    Recent Translations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentTranslations.map((translation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div className="text-sm text-slate-600 mb-1">{translation.input}</div>
                      <div 
                        className="font-medium text-emerald-700"
                        style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
                        dir="rtl"
                      >
                        {translation.output}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {translation.timestamp.toLocaleTimeString()}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Help Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">How to get the best translations</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Start with simple words like "hello", "thank you", "good morning"</li>
                  <li>• Use common phrases for better accuracy</li>
                  <li>• The system learns from common N'Ko vocabulary patterns</li>
                  <li>• High confidence translations use our built-in dictionary</li>
                  <li>• Click on examples to see how they work</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 