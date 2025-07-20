"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Loader2, 
  Volume2,
  Save,
  Send,
  MessageCircle,
  Keyboard
} from "lucide-react"
import { NkoKeyboard } from "@/components/nko/input/nko-keyboard"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  translation?: string
  nkoText?: string
  corrections?: string
  grammarNotes?: string[]
  timestamp: Date
}

interface NkoConversationProps {
  onStatsUpdate?: (stats: { messagesCount: number; wordsLearned: number }) => void
}

export function NkoConversation({ onStatsUpdate }: NkoConversationProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [stats, setStats] = useState({
    messagesCount: 0,
    wordsLearned: 0
  })

  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    onStatsUpdate?.(stats)
  }, [stats, onStatsUpdate])

  const handleSendMessage = async () => {
    if (!inputText.trim() || isGenerating) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText("")
    setIsGenerating(true)

    try {
      // First translate to N'Ko if input is in French
      let nkoText = inputText
      const translateResponse = await fetch('/api/nko/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          from: 'french',
          to: 'nko'
        })
      })
      
      if (translateResponse.ok) {
        const translateData = await translateResponse.json()
        nkoText = translateData.translation
      }

      // Generate natural AI conversation response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: nkoText, // Just respond with the N'Ko text directly
        nkoText: nkoText,
        translation: `"${inputText}" in N'Ko`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Update stats
      setStats(prev => {
        const newStats = {
          messagesCount: prev.messagesCount + 2,
          wordsLearned: prev.wordsLearned + (inputText.split(' ').length)
        }
        return newStats
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        await handleAudioTranscription(audioBlob)
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)

      toast({
        title: "Recording started",
        description: "Speak in French or N'Ko"
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
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const handleAudioTranscription = async (audioBlob: Blob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.wav')

    try {
      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setInputText(data.transcription || "Could not transcribe audio")
      
    } catch (error) {
      toast({
        title: "Transcription Error",
        description: "Failed to transcribe audio",
        variant: "destructive"
      })
    }
  }

  const saveConversation = async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'N\'Ko Practice',
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            translation: m.translation,
            timestamp: m.timestamp.toISOString(),
            mood: null,
            correctedContent: m.corrections,
            grammarNotes: m.grammarNotes || []
          })),
          stats: {
            timeSpent: Math.floor(Date.now() / 1000), // placeholder
            wordsLearned: stats.wordsLearned,
            messagesCount: stats.messagesCount
          }
        })
      })

      if (response.ok) {
        toast({
          title: "Conversation Saved",
          description: "Your N'Ko practice session has been saved"
        })
      }
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save conversation",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              N'Ko Conversation Practice
            </CardTitle>
            <CardDescription>
              Practice N'Ko with AI assistance and real-time translation
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {stats.messagesCount} messages
            </Badge>
            <Badge variant="secondary">
              {stats.wordsLearned} words
            </Badge>
            <Button variant="outline" size="sm" onClick={saveConversation}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full border rounded-md p-4 mb-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start your N'Ko conversation practice!</p>
              <p className="text-sm mt-1">Type in French or N'Ko to begin</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={message.id} className="mb-4">
              <div className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  
                  {message.nkoText && (
                    <div className="mt-2 p-2 bg-background/10 rounded">
                      <p className="text-lg font-nko">{message.nkoText}</p>
                    </div>
                  )}
                  
                  {message.translation && message.role === 'assistant' && (
                    <p className="text-xs mt-1 opacity-80">Translation: {message.translation}</p>
                  )}
                  
                  {message.corrections && (
                    <div className="mt-2 text-xs text-amber-600 bg-amber-50/20 p-2 rounded">
                      <strong>Correction:</strong> {message.corrections}
                    </div>
                  )}
                  
                  {message.grammarNotes && message.grammarNotes.length > 0 && (
                    <div className="mt-1 text-xs text-blue-600">
                      <strong>Grammar:</strong> {message.grammarNotes.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isGenerating && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message in French or N'Ko..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="min-h-[60px] resize-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputText.trim() || isGenerating}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowKeyboard(!showKeyboard)}
              className={showKeyboard ? "bg-blue-100 border-blue-300" : ""}
            >
              <Keyboard className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? "bg-red-100 border-red-300" : ""}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* N'Ko Virtual Keyboard */}
        {showKeyboard && (
          <div className="mt-4 p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">N'Ko Virtual Keyboard</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowKeyboard(false)}
              >
                ×
              </Button>
            </div>
            <NkoKeyboard 
              onCharacterClick={(char) => setInputText(prev => prev + char)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
} 