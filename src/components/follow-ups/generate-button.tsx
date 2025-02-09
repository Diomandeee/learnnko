"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw } from "lucide-react"

interface GenerateFollowUpsButtonProps {
  onGenerated: () => void
}

export function GenerateFollowUpsButton({ onGenerated }: GenerateFollowUpsButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/follow-ups/generate', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to generate follow-ups')
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: `Generated ${data.count} follow-ups`
      })

      onGenerated()
    } catch (error) {
      console.error('Error generating follow-ups:', error)
      toast({
        title: "Error",
        description: "Failed to generate follow-ups",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      Generate Follow-ups
    </Button>
  )
}
