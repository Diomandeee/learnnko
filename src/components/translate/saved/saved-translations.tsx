"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AudioPlayer } from "../audio-player"
import { Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface SavedWord {
  id: string
  word: string
  translation: string
  definition: string
}

export function SavedTranslations() {
  const [savedWords, setSavedWords] = useState<SavedWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSavedWords()
  }, [])

  const fetchSavedWords = async () => {
    try {
      const response = await fetch("/api/wordbank")
      if (!response.ok) throw new Error("Failed to fetch saved words")
      const data = await response.json()
      setSavedWords(data)
    } catch (error) {
      console.error("Error fetching saved words:", error)
      toast({
        title: "Error",
        description: "Failed to load saved words",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/wordbank/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete word")
      
      setSavedWords(prev => prev.filter(word => word.id !== id))
      toast({
        title: "Success",
        description: "Word deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting word:", error)
      toast({
        title: "Error",
        description: "Failed to delete word",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[200px]" />
        ))}
      </div>
    )
  }

  if (savedWords.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No saved words yet. Select text while translating to save words.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {savedWords.map((word) => (
        <Card key={word.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">
              {word.word}
            </CardTitle>
            <div className="flex items-center gap-2">
              <AudioPlayer text={word.word} language="fr-FR" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(word.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Translation</span>
                  <AudioPlayer text={word.translation} language="en-US" />
                </div>
                <p className="text-sm mt-1">{word.translation}</p>
              </div>
              {word.definition && (
                <div>
                  <span className="text-sm font-medium">Definition</span>
                  <p className="text-sm mt-1">{word.definition}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
