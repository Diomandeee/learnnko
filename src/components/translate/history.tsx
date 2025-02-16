"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AudioPlayer } from "./audio-player"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface TranslationHistory {
  id: string
  sourceText: string
  translation: string
  createdAt: string
}

export function History() {
  const [history, setHistory] = useState<TranslationHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/translations/history")
        if (!response.ok) throw new Error("Failed to fetch history")
        const data = await response.json()
        setHistory(data)
      } catch (error) {
        console.error("Error fetching history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No translation history yet
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {history.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">Original Text</div>
              <AudioPlayer text={item.sourceText} language="fr-FR" />
            </div>
            <p className="whitespace-pre-wrap">{item.sourceText}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">Translation</div>
              <AudioPlayer text={item.translation} language="en-US" />
            </div>
            <p className="whitespace-pre-wrap">{item.translation}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
