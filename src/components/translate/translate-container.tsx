"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, RotateCw, Wand2 } from "lucide-react"
import { TranslatedText } from "./translation/translated-text"
import { TextSelection } from "./translation/text-selection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export function TranslateContainer() {
  const [text, setText] = useState("")
  const [selectedText, setSelectedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedData, setTranslatedData] = useState<{
    sourceText: string;
    translation: string;
  } | null>(null)
  const { toast } = useToast()

  const handleTextSelect = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelectedText(selection.toString().trim())
    }
  }

  const handleTranslate = async () => {
    if (!text.trim()) return
    
    setIsTranslating(true)
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      
      if (!response.ok) throw new Error("Translation failed")
      
      const data = await response.json()
      const translationData = {
        sourceText: text,
        translation: data.translation
      }
      setTranslatedData(translationData)

      // Save to history
      await fetch("/api/translations/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(translationData),
      })
    } catch (error) {
      console.error("Translation error:", error)
      toast({
        title: "Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const handleGenerated = (sentences: string[]) => {
    if (sentences.length) {
      const newText = text + "\n\n" + sentences.join("\n")
      setText(newText)
      handleTranslate()
    }
  }

  const handleClear = () => {
    setText("")
    setSelectedText("")
    setTranslatedData(null)
  }

  return (
    <Tabs defaultValue="translate" className="space-y-6">
      <TabsContent value="translate" className="space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-4 space-y-4">
              <Textarea
                placeholder="Enter French text here..."
                className="min-h-[300px] text-lg leading-relaxed"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onMouseUp={handleTextSelect}
              />
              <div className="flex flex-wrap gap-2">
                <TextSelection 
                  selectedText={selectedText}
                  onGenerated={handleGenerated}
                />
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={!text.trim() || isTranslating}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={handleTranslate}
                  disabled={!text.trim() || isTranslating}
                  className="ml-auto"
                >
                  {isTranslating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isTranslating ? "Translating..." : "Translate"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              {translatedData ? (
                <TranslatedText
                  sourceText={translatedData.sourceText}
                  translation={translatedData.translation}
                />
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  Translation will appear here
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
