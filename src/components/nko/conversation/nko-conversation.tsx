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

  const generateContextualResponse = async (history: Array<{role: string, content: string}>, userInput: string, nkoTranslation: string) => {
    // Analyze user input for context
    const input = userInput.toLowerCase()
    
    // Check if this is a follow-up to previous conversation
    const hasIntroduced = history.some(msg => 
      msg.content.toLowerCase().includes('je m\'appelle') || 
      msg.content.toLowerCase().includes('my name is') ||
      msg.content.toLowerCase().includes('amina')
    )
    
    // Handle introductions
    if (input.includes('je m\'appelle') || input.includes('my name is') || input.includes('i am') || input.includes('je suis')) {
      const name = extractName(userInput)
      return {
        nkoResponse: `ߒ ߓߘߊ߫ ߌ ߟߏ߲ ߞߊ߫! ߌ ߕߐ߮ ߞߏ߫ ${name ? name : 'ߌ'}. ߒ ߕߐ߮ ߞߏ߫ ߊߡߌߣߊ߫ ߒߞߏ ߞߊߟߊ߲ߞߊ ߟߋ߬ ߦߋ߫.`,
        englishTranslation: `Nice to meet you${name ? `, ${name}` : ''}! I'm Amina, your N'Ko learning assistant.`
      }
    }
    
    // Handle questions about the assistant
    if (input.includes('tell me about yourself') || input.includes('who are you') || input.includes('what are you')) {
      const userName = extractUserName(history)
      const greeting = userName && hasIntroduced ? `${userName}, ` : ''
      
      return {
        nkoResponse: `${greeting}ߒ ߞߏ߫ ߊߡߌߣߊ߫ ߟߋ߬ ߦߋ߫. ߒߞߏ ߞߊߟߊ߲ߞߊ ߟߋ߬ ߦߋ߫ ߒ ߞߊ߬ߙߊ߲ ߘߌ߫. ߒ ߓߘߊ߫ ߒߞߏ ߞߊߟߊ߲ ߞߊߙߊ߲߫ ߊ߬ ߣߌ߫ ߝߐߟߌ ߞߊߙߊ߲߫! ߌ ߦߋ߫ ߡߍ߲ ߞߊߙߊ߲߫ ߠߊ߫?`,
        englishTranslation: `${greeting}I'm Amina, your N'Ko learning assistant. I'm here to help you learn N'Ko writing and conversation! What would you like to learn about?`
      }
    }
    
    // Handle greetings
    if (input.includes('bonjour') || input.includes('hello') || input.includes('hi') || input.includes('salut')) {
      return {
        nkoResponse: "ߌ ߣߌ߫ ߞߋ! ߡߊ߬ߙߐ߬ߓߊ ߌ ߣߊ߬ߒߠ ߞߊ߲߬! ߊ߬ ߞߊ߬ ߒߞߏ ߞߊߟߊ߲ ߞߊ߬ߟߊ߲ ߞߍ߫ ߺߺ",
        englishTranslation: "Hello there! Welcome to our N'Ko conversation practice! Let's practice N'Ko together."
      }
    }
    
    // Handle questions
    if (input.includes('what') || input.includes('how') || input.includes('why') || input.includes('when') || input.includes('comment') || input.includes('pourquoi')) {
      return {
        nkoResponse: "ߌ ߞߊ߲߫ ߞߏ߫ ߒ ߓߊ߲߬ ߌ ߘߊߞߘߐ߫! ߌ ߘߌ߫ ߛߋ߫ ߣߌ߫ ߞߵߊ߬ ߝߐ߫ ߒߞߏ ߟߊ߫ ߸ ߒ ߓߊ߯ ߌ ߟߊߞߊ߬ߝߏ߬ ߒߞߏ ߘߐ߫!",
        englishTranslation: "That's a great question! Feel free to ask in N'Ko, and I'll help you practice the language!"
      }
    }
    
    // Handle language practice requests
    if (input.includes('practice') || input.includes('learn') || input.includes('teach') || input.includes('apprendre')) {
      return {
        nkoResponse: "ߊ߬ߟߋ ߟߋ߬ ߝߣߊ߫! ߊ߲ ߞߊ߬ ߒߞߏ ߞߊߟߊ߲ ߞߊ߬ߟߊ߲ ߞߍ߫. ߌ ߛߙߊ߬ ߞߊ߲ ߠߊ߫ ߸ ߒ ߓߊ߯ ߌ ߞߊ߬ߟߊ߲!",
        englishTranslation: "Perfect! Let's practice N'Ko together. Try writing something, and I'll help you learn!"
      }
    }
    
    // Handle thanks
    if (input.includes('thank') || input.includes('merci') || input.includes('thanks')) {
      return {
        nkoResponse: "ߌ ߣߌ߫ ߕߏ߫! ߒߞߏ ߞߊߟߊ߲ ߞߊ߬ߟߊ߲ ߘߌ߫ ߞߍ߫ ߣߌ߲߬ ߢߐ߲߰ ߠߊ߫!",
        englishTranslation: "You're welcome! Keep practicing N'Ko - you're doing great!"
      }
    }
    
    // Handle N'Ko input detection
    if (/[\u07C0-\u07FF]/.test(userInput)) {
      const userName = extractUserName(history)
      const personalGreeting = userName ? `${userName}, ` : ''
      
      return {
        nkoResponse: `${personalGreeting}ߌ ߓߘߊ߫ ߒߞߏ ߛߓߍ߫ ߞߎߘߊ! ߌ ߞߊ߬ߟߊ߲ ߦߋ߫ ߞߍ߫ ߟߊ߫ ߞߎߘߊ ߞߐߞߊ߲߬. ߌ ߦߋ߫ ߡߍ߲ ߝߐ߫ ߟߊ߫?`,
        englishTranslation: `${personalGreeting}Excellent N'Ko writing! You're learning very well. What would you like to say?`
      }
    }
    
    // Default contextual response based on conversation flow
    const userName = extractUserName(history)
    const recentUserMessage = history.filter(msg => msg.role === 'user').slice(-1)[0]
    
    if (!hasIntroduced) {
      return {
        nkoResponse: "ߌ ߣߌ߫ ߞߋ! ߌ ߞߊ߬ ߌ ߕߐ߮ ߝߐ߫ ߒ ߞߊ߲߬? ߒ ߕߐ߮ ߞߏ߫ ߊߡߌߣߊ߫.",
        englishTranslation: "Hello! Could you tell me your name? My name is Amina."
      }
    }
    
    return {
      nkoResponse: userName ? 
        `${userName}, ߌ ߓߘߊ߫ ߞߍ߫ ߞߎߘߊ! ߌ ߘߌ߫ ߛߋ߫ ߒߞߏ ߟߊ߫ ߝߐߟߌ ߞߊ߲߬?` :
        "ߌ ߓߘߊ߫ ߞߍ߫ ߞߎߘߊ! ߌ ߘߌ߫ ߛߋ߫ ߒߞߏ ߟߊ߫ ߝߐߟߌ ߞߊ߲߬?",
      englishTranslation: userName ?
        `${userName}, good job! Would you like to continue our conversation in N'Ko?` :
        "Good job! Would you like to continue our conversation in N'Ko?"
    }
  }
  
  const extractName = (text: string): string | null => {
    // Extract name from "Je m'appelle [Name]" or "My name is [Name]"
    const frenchMatch = text.match(/je m'appelle\s+(\w+)/i)
    const englishMatch = text.match(/my name is\s+(\w+)/i) || text.match(/i am\s+(\w+)/i) || text.match(/je suis\s+(\w+)/i)
    
    return frenchMatch?.[1] || englishMatch?.[1] || null
  }

  const extractUserName = (history: Array<{role: string, content: string}>): string | null => {
    // Look through conversation history for user's name
    for (const msg of history) {
      if (msg.role === 'user') {
        const name = extractName(msg.content)
        if (name) return name
      }
    }
    return null
  }

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

      // Generate contextual AI response based on conversation history
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      
      // Add current user message to context
      conversationHistory.push({
        role: 'user',
        content: inputText
      })

      const aiResponse = await generateContextualResponse(conversationHistory, inputText, nkoText)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.nkoResponse,
        nkoText: aiResponse.nkoResponse,
        translation: aiResponse.englishTranslation,
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
      
      // Try to get the best audio format available
      let options: MediaRecorderOptions = {}
      
      // Check what formats are supported and prefer the best ones
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm'
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4'
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        options.mimeType = 'audio/ogg;codecs=opus'
      }
      
      const mediaRecorder = new MediaRecorder(stream, options)
      const audioChunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        // Use the actual MIME type from the MediaRecorder
        const mimeType = mediaRecorder.mimeType || options.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunks, { type: mimeType })
        console.log('Recording blob created with type:', mimeType)
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
      console.error('Recording error:', error)
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
    // Get the correct file extension based on MIME type
    let fileExtension = 'wav'
    const mimeType = audioBlob.type
    
    if (mimeType.includes('webm')) {
      fileExtension = 'webm'
    } else if (mimeType.includes('ogg')) {
      fileExtension = 'ogg'
    } else if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
      fileExtension = 'm4a'
    } else if (mimeType.includes('wav')) {
      fileExtension = 'wav'
    } else if (mimeType.includes('mp3')) {
      fileExtension = 'mp3'
    }
    
    console.log(`Sending audio for transcription: ${mimeType} -> .${fileExtension}`)
    
    const formData = new FormData()
    formData.append('audio', audioBlob, `recording.${fileExtension}`)

    try {
      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setInputText(data.text || "Could not transcribe audio")
      
      toast({
        title: "Transcription complete",
        description: "Audio converted to text successfully"
      })
      
    } catch (error) {
      console.error('Transcription error:', error)
      toast({
        title: "Transcription Error",
        description: error instanceof Error ? error.message : "Failed to transcribe audio",
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
              className="min-h-[60px] resize-none font-nko"
              style={{
                direction: inputText.match(/[\u07C0-\u07FF]/) ? 'rtl' : 'ltr',
                textAlign: inputText.match(/[\u07C0-\u07FF]/) ? 'right' : 'left'
              }}
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