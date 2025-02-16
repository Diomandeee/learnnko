"use client"

import { Button } from "@/components/ui/button"
import { Save, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

interface SaveToWordBankProps {
  word: string
  translation: string
  definition?: string
}

export function SaveToWordBank({ word, translation, definition = "" }: SaveToWordBankProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [customDefinition, setCustomDefinition] = useState(definition)

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/wordbank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word,
          translation,
          definition: customDefinition,
        }),
      })

      if (!response.ok) throw new Error("Failed to save word")

      toast({
        title: "Word saved",
        description: `"${word}" has been added to your word bank.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save word to word bank.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Save to Word Bank
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to Word Bank</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Word</Label>
            <div className="p-2 border rounded-md bg-muted">{word}</div>
          </div>
          <div className="space-y-2">
            <Label>Translation</Label>
            <div className="p-2 border rounded-md bg-muted">{translation}</div>
          </div>
          <div className="space-y-2">
            <Label>Definition (optional)</Label>
            <Textarea
              value={customDefinition}
              onChange={(e) => setCustomDefinition(e.target.value)}
              placeholder="Add a custom definition..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
