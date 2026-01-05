"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Languages, ArrowRight, Copy, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

// Simplified transliterator for quick access
class QuickTransliterator {
  private commonWords: Record<string, string> = {
    'hello': 'ߛߊ߬ߟߌ',
    'thank you': 'ߊߟߎ߬ ߛߌ߰ߢߐ߲߯',
    'good': 'ߒߞߏ',
    'yes': 'ߎߐ߫',
    'no': 'ߊߺߎ߬',
    'peace': 'ߘߊߦߟߍ',
    'learn': 'ߞߊ߬ߙߊ߲',
    'welcome': 'ߡߊ߰ߙߌ',
    'love': 'ߞߊ߬ߒߕߊ߬',
    'family': 'ߘߋ߲ߞߍ',
  }

  private latinToNko: Record<string, string> = {
    'a': 'ߊ', 'e': 'ߋ', 'i': 'ߌ', 'o': 'ߏ', 'u': 'ߎ',
    'b': 'ߓ', 'k': 'ߝ', 'l': 'ߟ', 'm': 'ߠ', 'n': 'ߡ',
    's': 'ߚ', 't': 'ߕ', 'r': 'ߙ', 'w': 'ߣ', 'y': 'ߥ'
  }

  translate(text: string): string {
    const lower = text.toLowerCase().trim()
    
    // Check exact matches first
    if (this.commonWords[lower]) {
      return this.commonWords[lower]
    }
    
    // Simple character substitution
    return text.split('').map(char => 
      this.latinToNko[char.toLowerCase()] || char
    ).join('')
  }
}

interface TranslatorQuickAccessProps {
  className?: string
  compact?: boolean
}

export function TranslatorQuickAccess({ className = "", compact = false }: TranslatorQuickAccessProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const { toast } = useToast()
  
  const transliterator = new QuickTransliterator()

  const handleTranslate = () => {
    if (!input.trim()) return
    const result = transliterator.translate(input)
    setOutput(result)
  }

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      toast({ title: "Copied!", description: "N'Ko text copied to clipboard" })
    } catch (error) {
      toast({ title: "Failed to copy", variant: "destructive" })
    }
  }

  const quickPhrases = [
    { text: "hello", nko: "ߛߊ߬ߟߌ" },
    { text: "thank you", nko: "ߊߟߎ߬ ߛߌ߰ߢߐ߲߯" },
    { text: "peace", nko: "ߘߊߦߟߍ" },
    { text: "welcome", nko: "ߡߊ߰ߙߌ" },
  ]

  if (compact) {
    return (
      <Card className={`border-0 shadow-md ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Languages className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-sm">Quick Translate</span>
            <Link href="/nko/translator">
              <Button variant="ghost" size="sm" className="h-6 px-2 ml-auto">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  if (e.target.value.trim()) {
                    setOutput(transliterator.translate(e.target.value))
                  } else {
                    setOutput("")
                  }
                }}
                placeholder="Type to translate..."
                className="text-sm h-8"
              />
            </div>
            
            {output && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-2 bg-amber-900/30 rounded border"
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="text-amber-700 font-medium"
                    style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
                    dir="rtl"
                  >
                    {output}
                  </span>
                  <Button onClick={handleCopy} variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-0 shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Languages className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold">Quick Translator</h3>
          </div>
          <Link href="/nko/translator">
            <Button variant="outline" size="sm">
              Full Translator
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type French or English..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleTranslate()}
            />
            <Button onClick={handleTranslate} disabled={!input.trim()}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <AnimatePresence>
            {output && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="text-xs mb-2">N'Ko Translation</Badge>
                    <div 
                      className="text-xl font-bold text-amber-800"
                      style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
                      dir="rtl"
                    >
                      {output}
                    </div>
                  </div>
                  <Button onClick={handleCopy} variant="outline" size="sm">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <p className="text-sm text-slate-600 mb-2">Try these phrases:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickPhrases.map((phrase, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setInput(phrase.text)
                    setOutput(phrase.nko)
                  }}
                  className="p-2 text-left bg-slate-50 hover:bg-slate-100 rounded border transition-colors"
                >
                  <div className="text-sm font-medium">{phrase.text}</div>
                  <div 
                    className="text-xs text-amber-600"
                    style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
                    dir="rtl"
                  >
                    {phrase.nko}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 