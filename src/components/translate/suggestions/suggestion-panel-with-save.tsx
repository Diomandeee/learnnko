import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { 
  Lightbulb, 
  Volume2, 
  Loader2, 
  SaveIcon, 
  Star,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Mic,
  MicOff,
  Target
} from "lucide-react"

interface Suggestion {
  id: string
  text: string
  translation: string
  category: 'response' | 'question' | 'clarification'
  isSaved?: boolean
  isFavorite?: boolean
  accuracy?: number
}

interface SuggestionPanelProps {
  lastMessage: string
  onSelectSuggestion: (suggestion: string) => void
  onPlayAudio: (text: string) => void
  onStartRecording?: () => void
  onStopRecording?: () => void
  isRecording?: boolean
}

export function SuggestionPanelWithSave({
  lastMessage,
  onSelectSuggestion,
  onPlayAudio,
  onStartRecording,
  onStopRecording,
  isRecording
}: SuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [practiceMode, setPracticeMode] = useState(false)
  const [currentScore, setCurrentScore] = useState<number | null>(null)
  const [practiceHistory, setPracticeHistory] = useState<Array<{
    suggestion: Suggestion,
    score: number,
    timestamp: Date
  }>>([])
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
      setCurrentIndex(0)
      setPracticeMode(false)
      setCurrentScore(null)
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

  const startPractice = (suggestion: Suggestion) => {
    setPracticeMode(true)
    setCurrentScore(null)
    if (onStartRecording) {
      onStartRecording()
    }
  }

  const stopPractice = async () => {
    if (onStopRecording) {
      onStopRecording()
    }
    setPracticeMode(false)
  }

  const updateAccuracyScore = (score: number) => {
    setCurrentScore(score)
    setSuggestions(prev =>
      prev.map((s, idx) =>
        idx === currentIndex ? { ...s, accuracy: score } : s
      )
    )
    setPracticeHistory(prev => [
      ...prev,
      {
        suggestion: suggestions[currentIndex],
        score,
        timestamp: new Date()
      }
    ])
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
    setPracticeMode(false)
    setCurrentScore(null)
  }

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(suggestions.length - 1, prev + 1))
    setPracticeMode(false)
    setCurrentScore(null)
  }

  const currentSuggestion = suggestions[currentIndex]

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <h3 className="font-medium">Response Suggestions</h3>
          <Badge variant="secondary">
            {currentIndex + 1} / {suggestions.length}
          </Badge>
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
            <RotateCcw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {currentSuggestion && (
        <div className="bg-accent/50 p-4 rounded-lg mb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">
                  {currentSuggestion.category}
                </Badge>
                {currentSuggestion.isSaved && (
                  <Badge variant="outline">Saved</Badge>
                )}
                {currentSuggestion.accuracy !== undefined && (
                  <Badge 
                    variant={currentSuggestion.accuracy >= 80 ? "success" : "warning"}
                  >
                    {currentSuggestion.accuracy}% Accuracy
                  </Badge>
                )}
              </div>
              <button
                onClick={() => onSelectSuggestion(currentSuggestion.text)}
                className="text-left w-full"
              >
                <p className="font-medium mb-1">{currentSuggestion.text}</p>
                <p className="text-sm text-muted-foreground">
                  {currentSuggestion.translation}
                </p>
              </button>
            </div>
            <div className="flex items-start gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPlayAudio(currentSuggestion.text)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveSuggestion(currentSuggestion)}
                disabled={currentSuggestion.isSaved}
              >
                <SaveIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(currentSuggestion)}
              >
                <Star
                  className={`h-4 w-4 ${
                    currentSuggestion.isFavorite ? "fill-yellow-400" : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {practiceMode ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={stopPractice}
                className="w-full"
              >
                <MicOff className="h-4 w-4 mr-2" />
                Stop Practice
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => startPractice(currentSuggestion)}
                className="w-full"
              >
                <Target className="h-4 w-4 mr-2" />
                Practice This Response
              </Button>
            )}
          </div>

          {practiceMode && (
            <div className="mt-2 p-2 bg-accent rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recording...</span>
                {isRecording && (
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Speak the phrase to practice pronunciation
              </p>
            </div>
          )}

          {currentScore !== null && (
            <div className="mt-2 p-2 bg-accent rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Latest Score</span>
                <Badge variant={currentScore >= 80 ? "success" : "warning"}>
                  {currentScore}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentScore >= 80 
                  ? "Excellent pronunciation!" 
                  : "Keep practicing to improve"}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={currentIndex === 0 || practiceMode}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={currentIndex === suggestions.length - 1 || practiceMode}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}