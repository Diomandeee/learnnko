"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AudioPlayer } from "../audio-player"
import { SaveToWordBank } from "../saved/save-to-wordbank"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface TranslatedTextProps {
  sourceText: string
  translation: string
}

export function TranslatedText({ sourceText, translation }: TranslatedTextProps) {
  const [selectedText, setSelectedText] = useState("")
  const [selectedTranslation, setSelectedTranslation] = useState("")
  const { toast } = useToast()

  const handleTextSelection = async () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim()
      setSelectedText(selectedText)

      // Translate the selected text
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: selectedText }),
        })

        if (!response.ok) throw new Error("Translation failed")
        
        const data = await response.json()
        setSelectedTranslation(data.translation)
      } catch (error) {
        toast({
          title: "Translation Error",
          description: "Failed to translate selected text",
          variant: "destructive",
        })
      }
    }
  }

  // Clear selection when source text changes
  useEffect(() => {
    setSelectedText("")
    setSelectedTranslation("")
  }, [sourceText])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Original Text</CardTitle>
          <AudioPlayer text={sourceText} language="fr-FR" />
        </CardHeader>
        <CardContent>
          <div 
            className="text-lg leading-relaxed whitespace-pre-wrap"
            onMouseUp={handleTextSelection}
          >
            {sourceText}
          </div>
          {selectedText && selectedTranslation && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Selected Text:</span>
                <AudioPlayer text={selectedText} language="fr-FR" />
              </div>
              <p className="text-base">{selectedText}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Translation:</span>
                <AudioPlayer text={selectedTranslation} language="en-US" />
              </div>
              <p className="text-base">{selectedTranslation}</p>
              <div className="flex justify-end mt-2">
                <SaveToWordBank
                  word={selectedText}
                  translation={selectedTranslation}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Translation</CardTitle>
          <AudioPlayer text={translation} language="en-US" />
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{translation}</p>
        </CardContent>
      </Card>
    </div>
  )
}
