"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Lightbulb, Volume2, Loader2, SaveIcon, Star } from "lucide-react"

interface Suggestion {
  id: string
  text: string
  translation: string
  category: 'response' | 'question' | 'clarification'
  isSaved?: boolean
  isFavorite?: boolean
}

interface SuggestionPanelProps {
  lastMessage: string
  onSelectSuggestion: (suggestion: string) => void
  onPlayAudio: (text: string) => void
}

export function SuggestionPanelWithSave({
  lastMessage,
  onSelectSuggestion,
  onPlayAudio
}: SuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedSuggestionId, setHighlightedSuggestionId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (lastMessage) {
      loadSuggestions()
    }
  }, [lastMessage])

  const loadSuggestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastMessage })
      })

      if (!response.ok) throw new Error('Failed to load suggestions')
      const data = await response.json()
      setSuggestions(data.suggestions)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load suggestions",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSuggestion = async (suggestion: Suggestion) => {
    try {
      const response = await fetch('/api/suggestions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion)
      })

      if (!response.ok) throw new Error('Failed to save suggestion')

      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestion.id ? { ...s, isSaved: true } : s
        )
      )

      toast({
        title: "Success",
        description: "Suggestion saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save suggestion",
        variant: "destructive"
      })
    }
  }

  const toggleFavorite = async (suggestion: Suggestion) => {
    try {
      const response = await fetch(`/api/suggestions/${suggestion.id}/favorite`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to update favorite status')

      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestion.id ? { ...s, isFavorite: !s.isFavorite } : s
        )
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <h3 className="font-medium">Response Suggestions</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSuggestions}
          disabled={isLoading || !lastMessage}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`p-4 rounded-lg mb-2 transition-colors ${
              highlightedSuggestionId === suggestion.id
                ? "bg-accent"
                : "hover:bg-accent/50"
            }`}
            onMouseEnter={() => setHighlightedSuggestionId(suggestion.id)}
            onMouseLeave={() => setHighlightedSuggestionId(null)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">
                    {suggestion.category}
                  </Badge>
                  {suggestion.isSaved && (
                    <Badge variant="outline">Saved</Badge>
                  )}
                </div>
                <button
                  onClick={() => onSelectSuggestion(suggestion.text)}
                  className="text-left w-full"
                >
                  <p className="font-medium mb-1">{suggestion.text}</p>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.translation}
                  </p>
                </button>
              </div>
              <div className="flex items-start gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPlayAudio(suggestion.text)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => saveSuggestion(suggestion)}
                  disabled={suggestion.isSaved}
                >
                  <SaveIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(suggestion)}
                >
                  <Star
                    className={`h-4 w-4 ${
                      suggestion.isFavorite ? "fill-yellow-400" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </Card>
  )
}