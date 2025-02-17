"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Lightbulb,
  Volume2,
  Loader2,
  RefreshCcw,
  MessageSquare,
  HelpCircle,
  Info
} from "lucide-react"

interface Suggestion {
  id: string
  text: string
  translation: string
  category: 'response' | 'question' | 'clarification'
}

interface SuggestionPanelProps {
  lastMessage: string
  onSelectSuggestion: (suggestion: string) => void
  onPlayAudio: (text: string) => void
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'response':
      return <MessageSquare className="h-3 w-3 mr-1" />
    case 'question':
      return <HelpCircle className="h-3 w-3 mr-1" />
    case 'clarification':
      return <Info className="h-3 w-3 mr-1" />
    default:
      return null
  }
}

export function SuggestionPanel({ 
  lastMessage, 
  onSelectSuggestion,
  onPlayAudio 
}: SuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loadSuggestions = async () => {
    if (!lastMessage) {
      toast({
        title: "No message",
        description: "Wait for a message to get suggestions",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lastMessage,
          count: 5 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to load suggestions')
      }

      const data = await response.json()

      if (!data.suggestions || !Array.isArray(data.suggestions)) {
        throw new Error('Invalid suggestions format')
      }

      setSuggestions(data.suggestions)
    } catch (error) {
      console.error('Error loading suggestions:', error)
      toast({
        title: "Error",
        description: "Failed to load suggestions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (lastMessage) {
      loadSuggestions()
    }
  }, [lastMessage])

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <h3 className="font-medium">Response Suggestions</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={loadSuggestions}
                disabled={isLoading || !lastMessage}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Get new suggestions
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 border rounded-lg animate-pulse"
              >
                <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="secondary"
                        className="text-xs capitalize"
                      >
                        <CategoryIcon category={suggestion.category} />
                        {suggestion.category}
                      </Badge>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPlayAudio(suggestion.text)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Lightbulb className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {lastMessage 
                ? "Click refresh to get suggestions"
                : "Suggestions will appear here"}
            </p>
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}