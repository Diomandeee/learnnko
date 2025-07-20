"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Languages, 
  Loader2, 
  Copy, 
  Save,
  RotateCcw,
  History,
  ArrowRightLeft,
  MessageCircle,
  Volume2
} from "lucide-react"

// Import existing translate components
import { SuggestionPanelWithSave } from "@/components/translate/suggestions/suggestion-panel-with-save"
import { ConversationTab } from "@/components/translate/conversation-tab"

interface TranslationItem {
  id: string
  sourceText: string
  translation: string
  direction: 'to-nko' | 'from-nko'
  timestamp: Date
}

interface NkoTranslatorProps {
  onTranslationSave?: (nkoText: string, translation: string) => void
}

export function NkoTranslator({ onTranslationSave }: NkoTranslatorProps) {
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationDirection, setTranslationDirection] = useState<'to-nko' | 'from-nko'>('to-nko')
  const [translationHistory, setTranslationHistory] = useState<TranslationItem[]>([])
  const [activeTab, setActiveTab] = useState("translate")
  const { toast } = useToast()

  useEffect(() => {
    loadTranslationHistory()
  }, [])

  const loadTranslationHistory = async () => {
    try {
      const response = await fetch('/api/translations/history')
      const data = await response.json()
      setTranslationHistory(data || [])
    } catch (error) {
      console.error('Failed to load translation history:', error)
    }
  }



  const handleTranslate = async () => {
    if (!sourceText.trim()) return

    setIsTranslating(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: sourceText,
          direction: translationDirection 
        })
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()
      setTranslatedText(data.translation)

      // Save to history
      const newTranslation: TranslationItem = {
        id: Date.now().toString(),
        sourceText,
        translation: data.translation,
        direction: translationDirection,
        timestamp: new Date()
      }
      
      setTranslationHistory(prev => [newTranslation, ...prev.slice(0, 19)])
      
      // Call the callback if provided
      if (onTranslationSave) {
        const nkoText = translationDirection === 'to-nko' ? data.translation : sourceText
        const otherText = translationDirection === 'to-nko' ? sourceText : data.translation
        onTranslationSave(nkoText, otherText)
      }

      toast({
        title: "Translation completed",
        description: "Text translated successfully"
      })

    } catch (error) {
      console.error('Translation error:', error)
      toast({
        title: "Translation failed",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const clearText = () => {
    setSourceText("")
    setTranslatedText("")
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(translatedText)
      toast({
        title: "Copied to clipboard",
        description: "Translation copied successfully"
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const saveTranslation = async () => {
    if (!sourceText || !translatedText) return

    try {
      const response = await fetch('/api/nko/save-translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText,
          translation: translatedText,
          direction: translationDirection
        })
      })

      if (response.ok) {
        toast({
          title: "Translation saved",
          description: "Added to your saved translations"
        })
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save translation",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">N'Ko Translator</h2>
          <p className="text-muted-foreground">
            Comprehensive translation tools with voice, text, and conversation support
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setTranslationDirection(
            translationDirection === 'to-nko' ? 'from-nko' : 'to-nko'
          )}
          className="flex items-center gap-2"
        >
          <ArrowRightLeft className="w-4 h-4" />
          {translationDirection === 'to-nko' ? 'French → N\'Ko' : 'N\'Ko → French'}
        </Button>
      </div>

      {/* Main Translation Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="translate">
            <Languages className="w-4 h-4 mr-2" />
            Translate
          </TabsTrigger>
          <TabsTrigger value="conversation">
            <MessageCircle className="w-4 h-4 mr-2" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Text Translation Tab */}
        <TabsContent value="translate" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Input Side */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  {translationDirection === 'to-nko' ? 'French/English' : 'N\'Ko'}
                </CardTitle>
                <CardDescription>
                  Enter text to translate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={translationDirection === 'to-nko' 
                    ? "Enter French or English text..." 
                    : "ߒߞߏ ߛߓߍߦߊ ߛߎ߯ߡߊ߲߫..."}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className={translationDirection === 'from-nko' ? 'font-nko text-right' : ''}
                  rows={6}
                  dir={translationDirection === 'from-nko' ? 'rtl' : 'ltr'}
                />
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleTranslate}
                    disabled={!sourceText.trim() || isTranslating}
                    className="flex-1"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages className="w-4 h-4 mr-2" />
                        Translate
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={clearText}
                    disabled={!sourceText}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Side */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  {translationDirection === 'to-nko' ? 'N\'Ko' : 'French/English'}
                </CardTitle>
                <CardDescription>
                  Translation result
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`min-h-[144px] p-3 border rounded-md bg-muted/50 ${
                  translationDirection === 'to-nko' ? 'font-nko text-right' : ''
                }`}
                dir={translationDirection === 'to-nko' ? 'rtl' : 'ltr'}>
                  {translatedText || "Translation will appear here..."}
                </div>
                
                {translatedText && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={saveTranslation}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Suggestions Panel */}
          {translatedText && (
            <SuggestionPanelWithSave 
              translatedText={translatedText}
              sourceText={sourceText}
              onSave={saveTranslation}
            />
          )}
        </TabsContent>



        {/* Conversation Tab */}
        <TabsContent value="conversation" className="space-y-4">
          <ConversationTab />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Translation History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete translation history will be integrated here with all existing translate features.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick History */}
      {translationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Translations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {translationHistory.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1 truncate">
                      <div className="text-sm font-medium truncate">
                        {item.sourceText}
                      </div>
                      <div className={`text-sm text-muted-foreground truncate ${
                        item.direction === 'to-nko' ? 'font-nko' : ''
                      }`}>
                        {item.translation}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSourceText(item.sourceText)
                        setTranslatedText(item.translation)
                        setTranslationDirection(item.direction)
                      }}
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 