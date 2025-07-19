"use client"

import { useState, useRef, useEffect , useCallback} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import dynamic from 'next/dynamic'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { 
  Mic, 
  MicOff, 
  Bot, 
  Info, 
  User, 
  Loader2, 
  Volume,
  Save,
  RefreshCcw,
  Book,
  MessageCircle,
  BookOpen,
  Check,
  BrainCircuit,
  BarChart,
  PlayCircle,
  Copy,
  Trash2,
  Plus,
  Download,
  AlertCircle,
  Send,
  Type
} from "lucide-react"
import { convertAudioToBase64, createAudioRecorder } from "@/lib/audio-utils"

// Dynamically import the SuggestionPanel to avoid hydration issues
const SuggestionPanelWithSave = dynamic(
  () => import('./suggestions/suggestion-panel-with-save').then(mod => mod.SuggestionPanelWithSave),
  { ssr: false }
)

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  translation?: string
  audioUrl?: string
  timestamp: Date
  mood?: 'positive' | 'neutral' | 'negative'
  correctedContent?: string
  grammarNotes?: string[]
}

interface ConversationStats {
  totalMessages: number
  correctSentences: number
  grammarMistakes: number
  vocabularyUsed: Set<string>
  timeSpent: number
  accuracy?: number
}

interface SavedConversation {
  id: string
  topic: string
  startedAt: string
  duration: number
  messages: Message[]
  stats: ConversationStats
}

export function ConversationTab() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<Date | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [currentTab, setCurrentTab] = useState('chat')
  const [autosaveError, setAutosaveError] = useState<string | null>(null)
  const [lastAutosaveAttempt, setLastAutosaveAttempt] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice')
  const [stats, setStats] = useState<ConversationStats>({
    totalMessages: 0,
    correctSentences: 0,
    grammarMistakes: 0,
    vocabularyUsed: new Set(),
    timeSpent: 0,
    accuracy: 0
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionStartRef = useRef<Date>(new Date())
  const { toast } = useToast()

  // Add autosave function
  const autoSaveMessages = useCallback(async () => {
    if (!selectedTopic || messages.length < 2 || isSaving) return

    setIsSaving(true)
    setLastAutosaveAttempt(new Date())
    setAutosaveError(null)

    try {
      const response = await fetch('/api/conversations/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          messages,
          stats: {
            ...stats,
            vocabularyUsed: Array.from(stats.vocabularyUsed)
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Autosave failed')
      }

      const data = await response.json()
      setLastSavedTimestamp(new Date(data.timestamp))
    } catch (error) {
      setAutosaveError(error instanceof Error ? error.message : 'Failed to autosave')
      console.error('Autosave error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [messages, selectedTopic, stats, isSaving])

// Add autosave effect
useEffect(() => {
  if (messages.length > 1) {
    const saveTimer = setTimeout(autoSaveMessages, 30000) // Autosave every 30 seconds
    return () => clearTimeout(saveTimer)
  }
}, [messages, autoSaveMessages])

// Add state recovery effect
useEffect(() => {
  const recoverState = async () => {
    try {
      const response = await fetch('/api/conversations/latest')
      if (!response.ok) return
      
      const data = await response.json()
      if (data && data.messages && data.messages.length > 1) {
        // Convert vocabularyUsed array back to Set
        const processedStats = {
          ...data.stats,
          vocabularyUsed: Array.isArray(data.stats?.vocabularyUsed) 
            ? new Set(data.stats.vocabularyUsed)
            : new Set()
        }
        
        setMessages(data.messages)
        setStats(processedStats)
        setSelectedTopic(data.topic)
        setLastSavedTimestamp(new Date(data.updatedAt))
        
        toast({
          title: "Session recovered",
          description: "Your previous conversation has been restored",
        })
      }
    } catch (error) {
      console.error('State recovery error:', error)
    }
  }

  recoverState()
}, [])

  const conversationTopics = [
    { id: 'daily', name: 'Daily Life', icon: MessageCircle },
    { id: 'travel', name: 'Travel', icon: Book },
    { id: 'culture', name: 'Culture', icon: BookOpen },
    { id: 'business', name: 'Business', icon: BrainCircuit },
  ]

  const moodEmojis = {
    positive: '😊',
    neutral: '😐',
    negative: '😕'
  }

  // Initialize conversation and load history
  useEffect(() => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: "Bonjour! Je suis votre partenaire de conversation en français. Choisissez un sujet et commençons!",
        translation: "Hello! I'm your French conversation partner. Choose a topic and let's begin!",
        timestamp: new Date(),
        mood: 'positive'
      }
    ])

    loadConversationHistory()

    const timer = setInterval(() => {
      setStats(prev => ({
        ...prev,
        timeSpent: Math.floor((new Date().getTime() - sessionStartRef.current.getTime()) / 1000)
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversation history
  const loadConversationHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch('/api/conversations')
      if (!response.ok) throw new Error('Failed to fetch conversations')
      const data = await response.json()
      
      // Convert vocabularyUsed arrays back to Sets
      const processedData = data.map((conv: any) => ({
        ...conv,
        stats: {
          ...conv.stats,
          vocabularyUsed: Array.isArray(conv.stats?.vocabularyUsed) 
            ? new Set(conv.stats.vocabularyUsed)
            : new Set()
        }
      }))
      
      setSavedConversations(processedData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive"
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Load a specific conversation
  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`)
      if (!response.ok) throw new Error('Failed to fetch conversation')
      const data = await response.json()
      
      // Convert vocabularyUsed array back to Set
      const processedStats = {
        ...data.stats,
        vocabularyUsed: Array.isArray(data.stats?.vocabularyUsed) 
          ? new Set(data.stats.vocabularyUsed)
          : new Set()
      }
      
      setMessages(data.messages)
      setStats(processedStats)
      setSelectedTopic(data.topic)
      setCurrentTab('chat')
      
      toast({
        title: "Conversation loaded",
        description: "Previous conversation restored successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      })
    }
  }

  // Clone a conversation
  const cloneConversation = (conv: SavedConversation) => {
    try {
      setMessages([messages[0]]) // Keep welcome message
      setSelectedTopic(conv.topic)
      setStats({
        totalMessages: 0,
        correctSentences: 0,
        grammarMistakes: 0,
        vocabularyUsed: new Set(),
        timeSpent: 0,
        accuracy: 0
      })
      sessionStartRef.current = new Date()
      setCurrentTab('chat')
      
      toast({
        title: "Conversation cloned",
        description: "Started new conversation with same topic",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clone conversation",
        variant: "destructive"
      })
    }
  }

  // Save current conversation
  const saveConversation = async () => {
    try {
      if (!selectedTopic || messages.length < 2) {
        toast({
          title: "Cannot save",
          description: "Please select a topic and have at least one exchange",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          messages,
          stats: {
            ...stats,
            vocabularyUsed: Array.from(stats.vocabularyUsed)
          }
        })
      })

      if (!response.ok) throw new Error('Failed to save conversation')

      await loadConversationHistory()
      
      toast({
        title: "Success",
        description: "Conversation saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save conversation",
        variant: "destructive"
      })
    }
  }

  // Delete a conversation
  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete conversation')

      await loadConversationHistory()
      
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      })
    }
  }

  // Export conversation
  const exportConversation = (conv?: SavedConversation) => {
    try {
      const conversationData = conv || {
        topic: selectedTopic,
        messages,
        stats: {
          ...stats,
          vocabularyUsed: Array.from(stats.vocabularyUsed)
        }
      }

      const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conversation-${new Date().toISOString()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Conversation exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export conversation",
        variant: "destructive"
      })
    }
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format date display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
        await processAudioInput(base64Audio)
      }

      mediaRecorder.start(100)
      setIsRecording(true)


    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive"
      })
    }
  }

  const handleLoadConversation = async (id: string) => {
    try {
      setIsLoading(true)
      await loadConversation(id)
      
      toast({
        title: "Success",
        description: "Conversation loaded successfully",
      })
    } catch (error) {
      // Error is already handled by the helper
    } finally {
      setIsLoading(false)
    }
  }
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())

    }
  }
  // Process recorded audio
  const processAudioInput = async (base64Audio: string) => {
    if (!selectedTopic) {
      toast({
        title: "No topic selected",
        description: "Please select a conversation topic first.",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      // Speech to text
      const sttResponse = await fetch('/api/stt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio })
      })

      if (!sttResponse.ok) throw new Error('Speech to text failed')
      const { text } = await sttResponse.json()

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])

      // Update stats
      const words = text.toLowerCase().split(/\s+/)
      setStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        vocabularyUsed: new Set([...Array.from(prev.vocabularyUsed), ...words])
      }))

      // Get AI response
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          topic: selectedTopic,
          language: 'fr'
        })
      })

      if (!chatResponse.ok) throw new Error('Chat response failed')
      const { 
        response, 
        translation, 
        corrections, 
        grammarNotes,
        mood 
      } = await chatResponse.json()

      // Text to speech
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: response,
          languageCode: 'fr-FR'
        })
      })

      if (!ttsResponse.ok) throw new Error('Text to speech failed')
      const audioBlob = await ttsResponse.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        translation,
        audioUrl,
        timestamp: new Date(),
        mood,
        correctedContent: corrections,
        grammarNotes
      }
      setMessages(prev => [...prev, assistantMessage])

      // Update stats
      setStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        correctSentences: prev.correctSentences + (corrections ? 0 : 1),
        grammarMistakes: prev.grammarMistakes + (grammarNotes?.length || 0),
        accuracy: (prev.correctSentences / prev.totalMessages) * 100
      }))

      // Auto-play response
      const audio = new Audio(audioUrl)
      await audio.play()

    } catch (error) {
      console.error('Error processing audio:', error)
      toast({
        title: "Error",
        description: "Failed to process audio. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Send text message
  const sendTextMessage = async () => {
    if (!textInput.trim() || !selectedTopic) {
      if (!selectedTopic) {
        toast({
          title: "No topic selected",
          description: "Please select a conversation topic first.",
          variant: "destructive"
        })
      }
      return
    }

    setIsProcessing(true)
    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: textInput.trim(),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])

      // Update stats
      const words = textInput.toLowerCase().split(/\s+/)
      setStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        vocabularyUsed: new Set([...Array.from(prev.vocabularyUsed), ...words])
      }))

      // Clear input
      setTextInput("")

      // Get AI response
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textInput.trim(),
          topic: selectedTopic,
          language: 'fr'
        })
      })

      if (!chatResponse.ok) throw new Error('Chat response failed')
      const { 
        response, 
        translation, 
        corrections, 
        grammarNotes,
        mood 
      } = await chatResponse.json()

      // Text to speech for AI response
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: response,
          languageCode: 'fr-FR'
        })
      })

      if (!ttsResponse.ok) throw new Error('Text to speech failed')
      const audioBlob = await ttsResponse.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        translation,
        audioUrl,
        timestamp: new Date(),
        mood,
        correctedContent: corrections,
        grammarNotes
      }
      setMessages(prev => [...prev, assistantMessage])

      // Update stats
      setStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        correctSentences: prev.correctSentences + (corrections ? 0 : 1),
        grammarMistakes: prev.grammarMistakes + (grammarNotes?.length || 0),
        accuracy: (prev.correctSentences / prev.totalMessages) * 100
      }))

      // Auto-play response
      const audio = new Audio(audioUrl)
      await audio.play()

    } catch (error) {
      console.error('Error processing text message:', error)
      toast({
        title: "Error",
        description: "Failed to process message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendTextMessage()
    }
  }

  // Play audio from text
  const playAudioFromText = async (text: string) => { 
    try {
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          languageCode: 'fr-FR'
        })
      })

      if (!ttsResponse.ok) throw new Error('Text to speech failed')
      const audioBlob = await ttsResponse.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      const audio = new Audio(audioUrl)
      await audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
      toast({
        title: "Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive"
      })
    }
  }

  const formatTimeAgo = (date: Date) => {
    const diff = new Date().getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  } 
  
  return (
    <div className="flex flex-col h-[800px]">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Library
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Progress
          </TabsTrigger>

          
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat">
          {/* Topic Selection */}
          <div className="flex gap-2 mb-4">

            {conversationTopics.map(topic => (
              <TooltipProvider key={topic.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedTopic === topic.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTopic(topic.id)}
                    >
                      <topic.icon className="h-4 w-4 mr-2" />
                      {topic.name}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Start a conversation about {topic.name.toLowerCase()}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          <div className="col-span-1">
      <SuggestionPanelWithSave
        lastMessage={messages[messages.length - 1]?.content || ""}
        onSelectSuggestion={(text) => {
          // Start recording with this text
          // Or you could add it directly to the conversation
          navigator.clipboard.writeText(text)
          toast({
            title: "Suggestion copied",
            description: "The text has been copied to your clipboard"
          })
        }}
        onPlayAudio={(text) => {
          // Play audio of the suggestion
          playAudioFromText(text)
        }}
      />

  </div>
          {/* Messages Container */}
          <Card className="flex-1 mb-4 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>French Conversation</CardTitle>
                <CardDescription>
                  {selectedTopic 
                    ? `Topic: ${conversationTopics.find(t => t.id === selectedTopic)?.name}`
                    : "Select a topic to begin"}
                </CardDescription>
                
              </div>
              
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveConversation}
                        disabled={!selectedTopic || messages.length < 2}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save conversation</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportConversation()}
                        disabled={!selectedTopic || messages.length < 2}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export as JSON</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">

<div className="space-y-4">
  {messages.map((message) => (
    <div
      key={message.id}
      className={`flex items-start gap-3 ${
        message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
      }`}
    >
      <div className="flex-shrink-0">
        {message.role === 'assistant' ? (
          <Bot className="h-8 w-8 text-primary" />
        ) : (
          <User className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <div
        className={`flex flex-col space-y-2 max-w-[80%] ${
          message.role === 'assistant' ? 'items-start' : 'items-end'
        }`}
      >
        <div
          className={`p-3 rounded-lg ${
            message.role === 'assistant'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium whitespace-pre-wrap">
              {message.content}
            </p>
            {message.mood && (
              <span className="text-sm">{moodEmojis[message.mood]}</span>
            )}
          </div>
          {message.translation && (
            <p className="text-xs mt-1 opacity-80 whitespace-pre-wrap">
              {message.translation}
            </p>
          )}
          {message.correctedContent && (
            <div className="mt-2 p-2 bg-background/10 rounded text-xs">
              <p className="font-medium">Correction:</p>
              <p className="whitespace-pre-wrap">{message.correctedContent}</p>
              {message.grammarNotes && message.grammarNotes.length > 0 && (
                <div className="mt-1">
                  <p className="font-medium">Grammar Notes:</p>
                  <ul className="list-disc list-inside">
                    {message.grammarNotes.map((note, index) => (
                      <li key={index} className="whitespace-pre-wrap">{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {message.audioUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => new Audio(message.audioUrl).play()}
            >
              <Volume className="h-4 w-4" />
              Replay
            </Button>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  ))}
  <div ref={messagesEndRef} />
</div>
              </ScrollArea>
            </CardContent>
            <div className="grid grid-cols-3 gap-4">

    </div>

          </Card>

          {/* Input Controls */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Input Mode Toggle */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant={inputMode === 'voice' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputMode('voice')}
                  className="gap-2"
                >
                  <Mic className="h-4 w-4" />
                  Voice
                </Button>
                <Button
                  variant={inputMode === 'text' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputMode('text')}
                  className="gap-2"
                >
                  <Type className="h-4 w-4" />
                  Text
                </Button>
              </div>

              {/* Voice Input */}
              {inputMode === 'voice' && (
                <div className="space-y-3">
                  <div className="flex-1">
                    <Progress 
                      value={isRecording ? 100 : 0} 
                      className={`h-2 ${isRecording ? 'animate-pulse' : ''}`}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                      className="w-40 gap-2"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isProcessing || !selectedTopic}
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
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Text Input */}
              {inputMode === 'text' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message in French..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-1 min-h-[60px] resize-none"
                      disabled={isProcessing || !selectedTopic}
                    />
                    <Button
                      size="lg"
                      onClick={sendTextMessage}
                      disabled={isProcessing || !selectedTopic || !textInput.trim()}
                      className="gap-2 px-4"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Press Enter to send • Shift+Enter for new line
                  </div>
                </div>
              )}

              {/* Common Controls */}
              <div className="flex items-center justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setMessages([messages[0]])
                    setStats({
                      totalMessages: 0,
                      correctSentences: 0,
                      grammarMistakes: 0,
                      vocabularyUsed: new Set(),
                      timeSpent: 0,
                      accuracy: 0
                    })
                    sessionStartRef.current = new Date()
                    setTextInput("")
                  }}
                  disabled={isRecording || isProcessing || messages.length < 2}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset Conversation
                </Button>
              </div>
                <div className="flex items-center justify-between px-4 py-2 text-sm">
    <div className="flex items-center gap-2">
      {isSaving ? (
        <div className="flex items-center text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin mr-2" />
          Saving...
        </div>
      ) : autosaveError ? (
        <div className="flex items-center text-destructive">
          <AlertCircle className="h-3 w-3 mr-2" />
          {autosaveError}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={autoSaveMessages}
          >
            Retry
          </Button>
        </div>
      ) : lastSavedTimestamp ? (
        <div className="flex items-center text-muted-foreground">
          <Check className="h-3 w-3 mr-2 text-green-500" />
          {`Saved ${formatTimeAgo(lastSavedTimestamp)}`}
        </div>
      ) : null}
    </div>
    {lastAutosaveAttempt && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-3 w-3 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Last autosave attempt: {formatTimeAgo(lastAutosaveAttempt)}</p>
          </TooltipContent>
        </Tooltip>
              </TooltipProvider>
      )}
    </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Conversations</h2>
              <Button onClick={loadConversationHistory}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {isLoadingHistory ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="opacity-50">
                    <CardHeader>
                      <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {savedConversations.map((conv) => (
                  <Card key={conv.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {conversationTopics.find(t => t.id === conv.topic)?.name}
                          </CardTitle>
                          <CardDescription>
                            {formatDate(conv.startedAt)}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {conv.messages.length} messages
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Last message:
                        </div>
                        <div className="text-sm italic">
                          "{conv.messages[conv.messages.length - 1].content}"
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                        <div>
                          <div className="font-bold">
                            {conv.stats.vocabularyUsed.size}
                          </div>
                          <div className="text-muted-foreground">Words</div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {conv.stats.accuracy}%
                          </div>
                          <div className="text-muted-foreground">Accuracy</div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {Math.floor(conv.duration / 60)}m
                          </div>
                          <div className="text-muted-foreground">Duration</div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleLoadConversation(conv.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Continue
                                </>
                              )}
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>Continue this conversation</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => cloneConversation(conv)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Clone
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Start new with same topic</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => exportConversation(conv)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export conversation</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteConversation(conv.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete conversation</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoadingHistory && savedConversations.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                  <Book className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No saved conversations
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your saved conversations will appear here
                </p>
                <Button onClick={() => setCurrentTab('chat')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start a conversation
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>
                  Your French learning journey statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{stats.totalMessages}</div>
                    <div className="text-sm text-muted-foreground">Messages</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.vocabularyUsed.size}</div>
                    <div className="text-sm text-muted-foreground">Unique Words</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.accuracy ? Math.round(stats.accuracy) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.grammarMistakes}</div>
                    <div className="text-sm text-muted-foreground">Mistakes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatTime(stats.timeSpent)}</div>
                    <div className="text-sm text-muted-foreground">Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
