"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Book } from "lucide-react"

interface WordBankEntry {
  id: string
  word: string
  translation: string
  definition: string
  createdAt: string
}

export function WordBankDialog() {
  const [words, setWords] = useState<WordBankEntry[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchWords()
    }
  }, [isOpen])

  const fetchWords = async () => {
    try {
      const response = await fetch("/api/wordbank")
      if (!response.ok) throw new Error("Failed to fetch words")
      const data = await response.json()
      setWords(data)
    } catch (error) {
      console.error("Error fetching words:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Book className="mr-2 h-4 w-4" />
          Word Bank
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Word Bank</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {words.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div>
                <h4 className="font-medium">{entry.word}</h4>
                <p className="text-sm text-muted-foreground">
                  {entry.translation}
                </p>
                <p className="text-sm mt-1">{entry.definition}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(entry.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {words.length === 0 && (
            <div className="text-center text-muted-foreground p-8">
              No saved words yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
