import { Metadata } from "next"
import { NkoTranscriber } from "@/components/nko/transcriber/nko-transcriber"

export const metadata: Metadata = {
  title: "N'Ko Transcriber | French Connect",
  description: "Convert speech and audio files to N'Ko text with automatic translation",
}

export default function NkoTranscribePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">N'Ko Audio Transcription</h1>
          <p className="text-muted-foreground">
            Convert speech and audio files to N'Ko text with automatic translation
          </p>
        </div>
      </div>

      <NkoTranscriber onTextSave={(text, translation) => console.log('Text saved:', text, translation)} />
    </div>
  )
} 