"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { 
  Upload, 
  FileText, 
  Download,
  Save,
  Copy,
  Loader2,
  Mic,
  MicOff,
  Youtube
} from "lucide-react"

interface TranscriptionJob {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  result?: string
  nkoTranslation?: string
  progress?: number
  type: 'file' | 'youtube' | 'microphone'
}

interface NkoTranscriberProps {
  onTextSave?: (nkoText: string, translation: string) => void
}

export function NkoTranscriber({ onTextSave }: NkoTranscriberProps) {
  const [jobs, setJobs] = useState<TranscriptionJob[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  
  const { toast } = useToast()

  const addJob = (job: TranscriptionJob) => {
    setJobs(prev => [...prev, job])
  }

  const updateJobStatus = (id: string, updates: Partial<TranscriptionJob>) => {
    setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updates } : job))
  }

  const handleFileUpload = async (file: File) => {
    const jobId = Date.now().toString()
    const newJob: TranscriptionJob = {
      id: jobId,
      name: file.name,
      status: 'processing',
      progress: 0,
      type: 'file'
    }

    addJob(newJob)
    setSelectedFile(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      updateJobStatus(jobId, { progress: 25 })

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      updateJobStatus(jobId, { progress: 75 })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = await response.json()
      updateJobStatus(jobId, { progress: 90 })

      // Auto-translate to N'Ko
      const translateResponse = await fetch('/api/nko/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: data.transcription,
          from: 'french',
          to: 'nko'
        })
      })

      let nkoTranslation = ''
      if (translateResponse.ok) {
        const translateData = await translateResponse.json()
        nkoTranslation = translateData.translation
      }

      updateJobStatus(jobId, {
        status: 'completed',
        result: data.transcription,
        nkoTranslation,
        progress: 100
      })

      toast({
        title: "Transcription Complete",
        description: `Transcribed and translated: ${file.name}`
      })

    } catch (error) {
      updateJobStatus(jobId, { status: 'error' })
      toast({
        title: "Transcription Failed",
        description: "Failed to transcribe the file",
        variant: "destructive"
      })
    }
  }

  const handleYouTubeDownload = async () => {
    if (!youtubeUrl.trim()) return

    const jobId = Date.now().toString()
    const newJob: TranscriptionJob = {
      id: jobId,
      name: `YouTube: ${youtubeUrl}`,
      status: 'processing',
      progress: 0,
      type: 'youtube'
    }

    addJob(newJob)
    setYoutubeUrl("")

    try {
      updateJobStatus(jobId, { progress: 30 })

      const response = await fetch('/api/youtube/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl })
      })

      updateJobStatus(jobId, { progress: 60 })

      if (!response.ok) {
        throw new Error('YouTube download failed')
      }

      const data = await response.json()
      updateJobStatus(jobId, { progress: 90 })

      // Auto-translate to N'Ko
      const translateResponse = await fetch('/api/nko/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: data.transcription,
          from: 'french',
          to: 'nko'
        })
      })

      let nkoTranslation = ''
      if (translateResponse.ok) {
        const translateData = await translateResponse.json()
        nkoTranslation = translateData.translation
      }

      updateJobStatus(jobId, {
        status: 'completed',
        result: data.transcription,
        nkoTranslation,
        progress: 100
      })

    } catch (error) {
      updateJobStatus(jobId, { status: 'error' })
      toast({
        title: "YouTube Download Failed",
        description: "Failed to download and transcribe video",
        variant: "destructive"
      })
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        
        const jobId = Date.now().toString()
        const newJob: TranscriptionJob = {
          id: jobId,
          name: 'Voice Recording',
          status: 'processing',
          progress: 0,
          type: 'microphone'
        }

        addJob(newJob)

        // Process the recording
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.wav')

        try {
          const response = await fetch('/api/stt', {
            method: 'POST',
            body: formData
          })

          const data = await response.json()

          // Auto-translate to N'Ko
          const translateResponse = await fetch('/api/nko/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: data.transcription,
              from: 'french',
              to: 'nko'
            })
          })

          let nkoTranslation = ''
          if (translateResponse.ok) {
            const translateData = await translateResponse.json()
            nkoTranslation = translateData.translation
          }

          updateJobStatus(jobId, {
            status: 'completed',
            result: data.transcription,
            nkoTranslation,
            progress: 100
          })

        } catch (error) {
          updateJobStatus(jobId, { status: 'error' })
        }
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)

      toast({
        title: "Recording Started",
        description: "Speak in French for transcription to N'Ko"
      })

    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone",
        variant: "destructive"
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const saveTranscription = async (job: TranscriptionJob) => {
    if (!job.result) return

    try {
      const response = await fetch('/api/nko/save-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: job.nkoTranslation || job.result,
          translation: job.result,
          notes: `Transcribed from ${job.type}: ${job.name}`
        })
      })

      if (response.ok) {
        toast({
          title: "Transcription Saved",
          description: "Added to your N'Ko collection"
        })
        onTextSave?.(job.nkoTranslation || job.result, job.result)
      }
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save transcription",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Input Methods */}
      <div className="space-y-4">
        {/* File Upload */}
        <Card className="bg-gradient-to-br from-space-800/80 to-space-900/80 backdrop-blur-xl border border-amber-500/20 shadow-amber">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-300">
              <Upload className="w-5 h-5" />
              Audio File Upload
            </CardTitle>
            <CardDescription className="text-gray-300">
              Upload audio files for transcription to N'Ko
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drop audio files here or click to browse
              </p>
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setSelectedFile(file)
                    handleFileUpload(file)
                  }
                }}
                className="hidden"
                id="audio-upload"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('audio-upload')?.click()}
              >
                Choose Audio File
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* YouTube URL */}
        <Card className="bg-gradient-to-br from-space-800/80 to-space-900/80 backdrop-blur-xl border border-violet-500/20 shadow-violet">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-300">
              <Youtube className="w-5 h-5" />
              YouTube Video
            </CardTitle>
            <CardDescription className="text-gray-300">
              Transcribe and translate YouTube videos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1"
              />
              <Button 
                onClick={handleYouTubeDownload}
                disabled={!youtubeUrl.trim()}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voice Recording */}
        <Card className="bg-gradient-to-br from-space-800/80 to-space-900/80 backdrop-blur-xl border border-amber-500/20 shadow-cyber">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-300">
              <Mic className="w-5 h-5" />
              Voice Recording
            </CardTitle>
            <CardDescription className="text-gray-300">
              Record your voice for live transcription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? stopRecording : startRecording}
              className="w-full"
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            {isRecording && (
              <div className="mt-2 text-center text-sm text-muted-foreground">
                Recording... Speak in French
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card className="bg-gradient-to-br from-space-800/80 to-space-900/80 backdrop-blur-xl border border-amber-500/20 shadow-amber">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-300">
            <FileText className="w-5 h-5" />
            Transcription Results
          </CardTitle>
          <CardDescription className="text-gray-300">
            Your transcriptions with N'Ko translations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transcriptions yet</p>
                <p className="text-sm mt-1">Upload audio or record to see results</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div key={job.id} className="p-3 border rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{job.name}</span>
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'error' ? 'destructive' :
                        'secondary'
                      }>
                        {job.status}
                      </Badge>
                    </div>
                    
                    {job.status === 'processing' && (
                      <Progress value={job.progress || 0} className="w-full" />
                    )}
                    
                    {job.result && (
                      <div className="space-y-2">
                        <div className="text-sm">
                          <strong>French:</strong>
                          <p className="mt-1 p-2 bg-muted rounded text-sm">{job.result}</p>
                        </div>
                        {job.nkoTranslation && (
                          <div className="text-sm">
                            <strong>N'Ko:</strong>
                            <p className="mt-1 p-2 bg-muted rounded text-lg font-nko">{job.nkoTranslation}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => saveTranscription(job)}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => {
                            navigator.clipboard.writeText(job.nkoTranslation || job.result || '')
                          }}>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 