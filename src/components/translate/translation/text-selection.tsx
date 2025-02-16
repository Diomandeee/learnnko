"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioPlayer } from "../audio-player"
import { SaveToWordBank } from "../saved/save-to-wordbank"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Loader2, Wand2, Save, Copy, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface GeneratedSentence {
  original: string
  generated: string[]
  translations: string[]
}

export function TextSelection({ 
  selectedText,
  onGenerated
}: { 
  selectedText: string
  onGenerated: (sentences: string[]) => void 
}) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSentences, setGeneratedSentences] = useState<GeneratedSentence[]>([])
  const [currentDepth, setCurrentDepth] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to your clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard",
        variant: "destructive"
      })
    }
  }

  const generateSimilar = useCallback(async (text: string) => {
    if (currentDepth >= 2) {
      toast({
        title: "Maximum depth reached",
        description: "You've reached the maximum generation depth (2 levels).",
      })
      return
    }

    setIsGenerating(true)
    try {
      // Generate similar sentences
      const genResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          depth: currentDepth,
          maxDepth: 2
        }),
      })

      if (!genResponse.ok) {
        const error = await genResponse.json()
        throw new Error(error.message || "Generation failed")
      }

      const { sentences } = await genResponse.json()

      // Translate generated sentences
      const transResponse = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sentences.join('\n') }),
      })

      if (!transResponse.ok) {
        const error = await transResponse.json()
        throw new Error(error.message || "Translation failed")
      }

      const transData = await transResponse.json()
      
      const newGeneration = {
        original: text,
        generated: sentences,
        translations: transData.translation.split('\n')
      }

      setGeneratedSentences(prev => [...prev, newGeneration])
      onGenerated(sentences)
      setCurrentDepth(prev => prev + 1)

      // Save to history
      await fetch("/api/translations/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText: sentences.join('\n'),
          translation: transData.translation
        }),
      })

      toast({
        title: "Generated successfully",
        description: `Generated ${sentences.length} similar sentences`,
      })
    } catch (error) {
      console.error("Generation error:", error)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate similar sentences",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }, [currentDepth, onGenerated, toast])

  const handleDialogClose = () => {
    if (!isGenerating) {
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!selectedText}
          className={cn(
            "relative transition-all duration-200",
            selectedText && "shadow-md hover:shadow-lg"
          )}
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Similar
          {selectedText && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-semibold">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            Similar Sentence Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selected Text Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Selected Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <p className="text-lg font-medium">{selectedText}</p>
                <div className="flex items-center gap-2">
                  <AudioPlayer text={selectedText} language="fr-FR" />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedText)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy to clipboard</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Sentences */}
          {generatedSentences.map((item, index) => (
            <Card key={index} className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Generation {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.generated.map((sentence, sIndex) => (
                  <div key={sIndex} className="space-y-2">
                    {/* French Sentence */}
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-lg">{sentence}</p>
                        <div className="flex items-center gap-2">
                          <AudioPlayer text={sentence} language="fr-FR" />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(sentence)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy to clipboard</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {currentDepth < 2 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => generateSimilar(sentence)}
                                    disabled={isGenerating}
                                  >
                                    <Wand2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Generate more similar sentences</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* English Translation */}
                    <div className="p-4 border rounded-lg bg-background">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-lg">{item.translations[sIndex]}</p>
                        <div className="flex items-center gap-2">
                          <AudioPlayer 
                            text={item.translations[sIndex]} 
                            language="en-US" 
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(item.translations[sIndex])}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy to clipboard</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>

                    {/* Save to Word Bank */}
                    <div className="flex justify-between items-center px-4">
                      <SaveToWordBank
                        word={sentence}
                        translation={item.translations[sIndex]}
                      />
                      <span className="text-sm text-muted-foreground">
                        {currentDepth < 2 ? `${2 - currentDepth} generations remaining` : 'Max depth reached'}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Loading State */}
          {isGenerating && (
            <div className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Generating similar sentences...
                </p>
              </div>
            </div>
          )}

          {/* Initial Generate Button */}
          {!generatedSentences.length && !isGenerating && (
            <Button
              onClick={() => generateSimilar(selectedText)}
              disabled={!selectedText}
              className="w-full"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Similar Sentences
            </Button>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            {currentDepth}/2 generation depths used
          </span>
          <DialogClose asChild>
            <Button 
              variant="outline" 
              onClick={handleDialogClose}
              disabled={isGenerating}
            >
              Done
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
