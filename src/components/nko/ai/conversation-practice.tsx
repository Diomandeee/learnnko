"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Bot, 
  User, 
  Send, 
  Mic, 
  MicOff, 
  Loader2, 
  Volume, 
  RefreshCw,
  XCircle 
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  audioUrl?: string;
}

interface ConversationPracticeProps {
  lessonId?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  topic?: string;
  initialPrompt?: string;
  focusArea?: string;
}

export function ConversationPractice({
  lessonId,
  level = 'beginner',
  topic = 'general',
  initialPrompt = "Hello! I'm here to help you practice N'Ko. What would you like to talk about?",
  focusArea = 'pronunciation'
}: ConversationPracticeProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Initialize conversation
  useEffect(() => {
    if (initialPrompt) {
      setMessages([{
        role: 'assistant',
        content: initialPrompt
      }]);
    }
  }, [initialPrompt]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/nko/ai/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          level,
          topic,
          focusArea,
          lessonId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get response');
      }
      
      const data = await response.json();
      
      // Get text-to-speech for Claude's response
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: data.response,
          languageCode: 'nko' // This is an example - adjust based on your TTS API capabilities
        })
      });
      
      let audioUrl = null;
      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();
        audioUrl = URL.createObjectURL(audioBlob);
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        translation: data.translation,
        audioUrl
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-play response
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        await audio.play();
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError((error as Error).message || 'Something went wrong');
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const startRecording = () => {
    // In a real implementation, this would start recording audio
    setIsRecording(true);
    
    // For demo purposes, simulating recording process
    toast({
      title: "Recording started",
      description: "Speak clearly in N'Ko or the language you're practicing."
    });
  };
  
  const stopRecording = async () => {
    // In a real implementation, this would stop recording and process audio
    setIsRecording(false);
    setIsProcessing(true);
    
    // For demo purposes, simulating speech recognition
    setTimeout(() => {
      setInput("ߌ ߞߊ߬ߙߊ߲߬ ߞߊ߲߬ ߸ ߌ ߞߐߕߐ߮ ߦߋ߫ ߘߌ߫ ߡߎ߲߬ ߠߋ߬ ߟߊ߫ ߸ ߒ ߞߏ ߞߊ߲ ߘߐ߫ ؟");
      setIsProcessing(false);
    }, 2000);
  };
  
  const resetConversation = () => {
    setMessages([{
      role: 'assistant',
      content: initialPrompt
    }]);
    setInput('');
    setError(null);
  };
  
  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Practice Conversation</CardTitle>
            <CardDescription>Practice speaking and writing N'Ko with AI assistance</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{level}</Badge>
            {topic && <Badge variant="outline">{topic}</Badge>}
            {focusArea && <Badge variant="secondary">{focusArea}</Badge>}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
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
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.translation && (
                      <p className="text-xs mt-1 opacity-80">{message.translation}</p>
                    )}
                  </div>
                  
                  {message.audioUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => new Audio(message.audioUrl!).play()}
                    >
                      <Volume className="h-4 w-4" />
                      Play Audio
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {error && (
              <div className="p-3 rounded bg-red-100 text-red-800 text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            {isProcessing && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="icon"
            onClick={resetConversation}
            title="Reset conversation"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type in N'Ko or any language you're practicing..."
            className="flex-1 min-h-[60px]"
            dir="auto"
          />
          
          <div className="flex flex-col gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              onClick={handleSubmit}
              size="icon"
              disabled={!input.trim() || isProcessing}
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
