"use client"

import { useRecording } from "@/hooks/use-recording"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"

interface RecordingControlsProps {
  maxDuration: number
  isProcessing: boolean
  onRecordingComplete: (audio: string) => Promise<void>
}

export function RecordingControls({
  maxDuration,
  isProcessing,
  onRecordingComplete
}: RecordingControlsProps) {
  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    formatDuration
  } = useRecording(maxDuration, onRecordingComplete)

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <Progress
          value={(recordingDuration / maxDuration) * 100}
          className={`h-2 ${isRecording ? 'animate-pulse' : ''}`}
        />
        {isRecording && (
          <span className="text-sm font-mono mt-1">
            {formatDuration(recordingDuration)}s
          </span>
        )}
      </div>

      <Button
        variant={isRecording ? "destructive" : "default"}
        size="lg"
        className="w-40 gap-2"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : isRecording ? (
          <>
            <MicOff className="h-4 w-4" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Start ({maxDuration / 1000}s)
          </>
        )}
      </Button>
    </div>
  )
}
