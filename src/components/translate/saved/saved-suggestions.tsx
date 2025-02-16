// src/components/translate/saved-suggestions.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AudioPlayer } from "../audio-player"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { SaveIcon, Star, Trash2, BookOpen } from "lucide-react"

interface SavedSuggestion {
  id: string
  text: string
  translation: string
  category: string
  isFavorite: boolean
  createdAt: string
}

export function SavedSuggestions() {
  const [suggestions, setSuggestions] = useState<SavedSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadSavedSuggestions()
  }, [])

  const loadSavedSuggestions = async () => {
    try {
      const response = await fetch("/api/suggestions/saved")
      if (!response.ok) throw new Error("Failed to load saved suggestions")
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load saved suggestions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (id: string) => {
    try {
      const response = await fetch(`/api/suggestions/saved/${id}/favorite`, {
        method: "POST"
      })
      if (!response.ok) throw new Error("Failed to update favorite status")
      
      setSuggestions(prev =>
        prev.map(s =>
          s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
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

  const deleteSuggestion = async (id: string) => {
    try {
      const response = await fetch(`/api/suggestions/saved/${id}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("Failed to delete suggestion")
      
      setSuggestions(prev => prev.filter(s => s.id !== id))
      toast({
        title: "Success",
        description: "Suggestion deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete suggestion",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-20 w-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Saved Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">
                          {suggestion.category}
                        </Badge>
                        {suggestion.isFavorite && (
                          <Badge variant="default">
                            Favorite
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium mb-1">{suggestion.text}</p>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.translation}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AudioPlayer text={suggestion.text} language="fr-FR" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(suggestion.id)}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            suggestion.isFavorite ? "fill-yellow-400" : ""
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSuggestion(suggestion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              No saved suggestions yet
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
