"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Star, Trash2, SaveIcon } from "lucide-react"

interface SavedSuggestion {
  id: string
  text: string
  translation: string
  category: string
  isFavorite: boolean
}

export function SavedSuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<SavedSuggestion[]>([])
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
    }
  }

  return (
    <Card className="p-4">
      <ScrollArea className="h-[300px]">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="p-4 border rounded-lg mb-2">
            <div className="flex items-center justify-between">
              <div>
                <Badge>{suggestion.category}</Badge>
                <p className="font-medium mt-2">{suggestion.text}</p>
                <p className="text-sm text-muted-foreground">{suggestion.translation}</p>
              </div>
              <Button variant="ghost" size="sm">
                {suggestion.isFavorite ? (
                  <Star className="h-4 w-4 fill-yellow-400" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
    </Card>
  )
}
