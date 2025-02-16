"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Volume2, VolumeX } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AudioPlayerProps {
  text: string
  language?: string
}

export function AudioPlayer({ text, language = 'fr-FR' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }
  
  const playAudio = async () => {
    try {
      setIsLoading(true)
      setError(false)

      // Stop any playing audio
      stopAudio()
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageCode: language })
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create new audio element
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      // Set up event listeners
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      })

      audio.addEventListener('error', () => {
        setError(true)
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
        toast({
          title: "Error",
          description: "Failed to play audio",
          variant: "destructive"
        })
      })

      setIsPlaying(true)
      await audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
      setError(true)
      toast({
        title: "Error",
        description: "Failed to generate speech",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={isPlaying ? stopAudio : playAudio}
            disabled={isLoading}
            className={`h-8 w-8 p-0 ${error ? 'text-destructive' : ''}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : error ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {error ? "Failed to load audio" : isPlaying ? "Stop" : "Play"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
