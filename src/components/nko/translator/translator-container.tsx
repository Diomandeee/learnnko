"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Volume2, ArrowLeftRight, Loader2, Save, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TranslatorContainer() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationHistory, setTranslationHistory] = useState<{
    input: string;
    output: string;
    fromLang: string;
    toLang: string;
    timestamp: Date;
  }[]>([])
  const [fromLang, setFromLang] = useState("nko")
  const [toLang, setToLang] = useState("english")
  const { toast } = useToast()

  // Fetch translation history on load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/nko/translation-history')
        if (response.ok) {
          const data = await response.json()
          setTranslationHistory(data.history || [])
        }
      } catch (error) {
        console.error("Failed to fetch translation history:", error)
      }
    }

    fetchHistory()
  }, [])

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input required",
        description: "Please enter text to translate",
        variant: "destructive"
      })
      return
    }

    setIsTranslating(true)
    try {
      const response = await fetch('/api/nko/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          from: fromLang,
          to: toLang
        })
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()
      setOutputText(data.translation)

      // Add to history
      setTranslationHistory(prev => [
        {
          input: inputText,
          output: data.translation,
          fromLang,
          toLang,
          timestamp: new Date()
        },
        ...prev
      ])
    } catch (error) {
      toast({
        title: "Translation failed",
        description: "Could not translate text. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const swapLanguages = () => {
    setFromLang(toLang)
    setToLang(fromLang)
    setInputText(outputText)
    setOutputText(inputText)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard"
    })
  }

  const saveTranslation = async () => {
    try {
      if (!outputText) return

      const response = await fetch('/api/nko/save-translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText: inputText,
          translation: outputText,
          sourceLang: fromLang,
          targetLang: toLang
        })
      })

      if (!response.ok) throw new Error('Failed to save translation')

      toast({
        title: "Success",
        description: "Translation has been saved"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save translation",
        variant: "destructive"
      })
    }
  }

  const playAudio = async (text: string, language: string) => {
    try {
      const response = await fetch('/api/nko/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          language: language === 'nko' ? 'nko' : language === 'english' ? 'en-US' : 'fr-FR'
        })
      })

      if (!response.ok) throw new Error('Text-to-speech failed')

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      await audio.play()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to play audio",
        variant: "destructive"
      })
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="translator">
        <TabsList>
          <TabsTrigger value="translator">Translator</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="translator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>N'Ko Translator</CardTitle>
              <CardDescription>
                Translate between N'Ko, English, and French
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="w-40">
                  <Select value={fromLang} onValueChange={setFromLang}>
                    <SelectTrigger>
                      <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nko">N'Ko</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  onClick={swapLanguages}
                  className="px-2"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>

                <div className="w-40">
                  <Select value={toLang} onValueChange={setToLang}>
                    <SelectTrigger>
                      <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nko">N'Ko</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={fromLang === 'nko' ? 'ߒߞߏ ߛߓߍ ߕߏ߫ ߣߌ߲߬...' : 'Enter text here...'}
                    className="min-h-[200px] text-lg" 
                    dir={fromLang === 'nko' ? 'rtl' : 'ltr'}
                    style={{ 
                      fontFamily: fromLang === 'nko' ? "'Noto Sans NKo', sans-serif" : "inherit" 
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => playAudio(inputText, fromLang)}
                      disabled={!inputText}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Listen
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(inputText)}
                      disabled={!inputText}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div 
                    className="min-h-[200px] p-4 border rounded-md overflow-auto"
                    dir={toLang === 'nko' ? 'rtl' : 'ltr'}
                    style={{ 
                      fontFamily: toLang === 'nko' ? "'Noto Sans NKo', sans-serif" : "inherit" 
                    }}
                  >
                    {outputText || (
                      <span className="text-muted-foreground">
                        Translation will appear here
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => playAudio(outputText, toLang)}
                      disabled={!outputText}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Listen
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(outputText)}
                      disabled={!outputText}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={saveTranslation}
                      disabled={!outputText}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-2">
                <Button 
                  onClick={handleTranslate}
                  disabled={isTranslating || !inputText.trim()}
                  className="w-40"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    'Translate'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Translation History</CardTitle>
              <CardDescription>
                Your recent translations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {translationHistory.length > 0 ? (
                <div className="space-y-4">
                  {translationHistory.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <div>
                          {item.fromLang.charAt(0).toUpperCase() + item.fromLang.slice(1)} → 
                          {item.toLang.charAt(0).toUpperCase() + item.toLang.slice(1)}
                        </div>
                        <div>{formatTime(item.timestamp)}</div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Original</p>
                          <div 
                            className="p-2 border rounded-md"
                            dir={item.fromLang === 'nko' ? 'rtl' : 'ltr'}
                            style={{ 
                              fontFamily: item.fromLang === 'nko' ? "'Noto Sans NKo', sans-serif" : "inherit" 
                            }}
                          >
                            {item.input}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Translation</p>
                          <div 
                            className="p-2 border rounded-md"
                            dir={item.toLang === 'nko' ? 'rtl' : 'ltr'}
                            style={{ 
                              fontFamily: item.toLang === 'nko' ? "'Noto Sans NKo', sans-serif" : "inherit" 
                            }}
                          >
                            {item.output}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setInputText(item.input);
                            setOutputText(item.output);
                            setFromLang(item.fromLang);
                            setToLang(item.toLang);
                            
                            // Switch to translator tab
                            const translatorTab = document.querySelector('[value="translator"]');
                            if (translatorTab) {
                              (translatorTab as HTMLElement).click();
                            }
                          }}
                        >
                          Reuse
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  No translation history yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
