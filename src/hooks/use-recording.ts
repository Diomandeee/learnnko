import { useState, useRef, useEffect } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { convertAudioToBase64, createAudioRecorder } from "@/lib/audio-utils"

export function useRecording(maxDuration: number, onRecordingComplete: (audio: string) => Promise<void>) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimer = useRef<NodeJS.Timeout | null>(null)
  const autoStopTimeout = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current)
      }
      if (autoStopTimeout.current) {
        clearTimeout(autoStopTimeout.current)
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const mediaRecorder = await createAudioRecorder()
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        })
        const base64Audio = await convertAudioToBase64(audioBlob)
        await onRecordingComplete(base64Audio)
      }

      // Start recording
      mediaRecorder.start(100)
      setIsRecording(true)
      setRecordingDuration(0)

      // Start duration timer
      const startTime = Date.now()
      let timerId = setInterval(() => {
        const currentDuration = Date.now() - startTime
        setRecordingDuration(currentDuration)

        // Check if maximum duration reached
        if (currentDuration >= maxDuration) {
          clearInterval(timerId)
          stopRecording()
        }
      }, 100)

      // Store timer ID for cleanup
      recordingTimer.current = timerId

      // Guaranteed stop after max duration
      autoStopTimeout.current = setTimeout(() => {
        if (isRecording) {
          stopRecording()
        }
      }, maxDuration)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: "Microphone Error", 
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive"
      })
    }
  }

  const stopRecording = () => {
    // First clear all timers
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current)
      recordingTimer.current = null
    }
    if (autoStopTimeout.current) {
      clearTimeout(autoStopTimeout.current) 
      autoStopTimeout.current = null
    }

    // Then stop media recorder if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const formatDuration = (duration: number) => {
    const remaining = Math.max(0, maxDuration - duration)
    const seconds = Math.floor(remaining / 1000)
    const decimals = Math.floor((remaining % 1000) / 10).toString().padStart(2, '0')
    return `${seconds}.${decimals}`
  }

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    formatDuration
  }
}
