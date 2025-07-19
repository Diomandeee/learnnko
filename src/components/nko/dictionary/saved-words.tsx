"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Volume2, Trash2, Search, Filter, Loader2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface SavedWord {
  id: string
  nko: string
  latin: string
  english: string
  french: string
  partOfSpeech: string
  isFavorite: boolean
  createdAt?: string
}

interface SavedWordsProps {
  className?: string
}

export function SavedWords({ className }: SavedWordsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [savedWords, setSavedWords] = useState<SavedWord[]>([])
  const [filteredWords, setFilteredWords] = useState<SavedWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [sortOrder, setSortOrder] = useState<"added" | "alphabetical">("added")
  const { toast } = useToast()
  
  // Load saved words on component mount
  useEffect(() => {
    const loadSavedWords = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/nko/dictionary/favorites')
        if (response.ok) {
          const data = await response.json()
          setSavedWords(data.favorites || [])
          setFilteredWords(data.favorites || [])
        } else {
          throw new Error('Failed to load saved words')
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load saved words",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSavedWords()
  }, [toast])
  
  // Filter and sort words
  useEffect(() => {
    let result = [...savedWords]
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(word => 
        word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.french.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.latin.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply part of speech filter
    if (activeTab !== "all") {
      result = result.filter(word => word.partOfSpeech.toLowerCase() === activeTab)
    }
    
    // Apply sorting
    if (sortOrder === "alphabetical") {
      result.sort((a, b) => a.english.localeCompare(b.english))
    } else {
      // Sort by date added (assuming newest first)
      result.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return 0
      })
    }
    
    setFilteredWords(result)
  }, [searchQuery, activeTab, sortOrder, savedWords])
  
  const playAudio = async (text: string) => {
    try {
      const response = await fetch('/api/nko/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      if (!response.ok) throw new Error('Text-to-speech failed')
      
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      await audio.play()
    } catch (error) {
      toast({
        title: "Audio error",
        description: "Failed to play audio",
        variant: "destructive"
      })
    }
  }
  
  const removeWord = async (word: SavedWord) => {
    try {
      const response = await fetch(`/api/nko/dictionary/favorites/${word.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to remove word')
      
      setSavedWords(prev => prev.filter(w => w.id !== word.id))
      
      toast({
        title: "Word removed",
        description: `"${word.nko}" has been removed from your saved words`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove word",
        variant: "destructive"
      })
    }
  }

  // Get unique parts of speech for tabs
  const partsOfSpeech = Array.from(new Set(savedWords.map(word => word.partOfSpeech.toLowerCase())))
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Saved Words</CardTitle>
        <CardDescription>Your personal N'Ko dictionary</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search saved words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
            <Search className="h-4 w-4 absolute left-2 top-3 text-muted-foreground" />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setSortOrder(prev => prev === "added" ? "alphabetical" : "added")}
            title={sortOrder === "added" ? "Sort alphabetically" : "Sort by date added"}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {partsOfSpeech.map(pos => (
              <TabsTrigger key={pos} value={pos}>
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="border rounded-md">
            {isLoading ? (
              <div className="flex items-center justify-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredWords.length > 0 ? (
              <ScrollArea className="h-[400px]">
                {filteredWords.map((word, index) => (
                  <div 
                    key={word.id}
                    className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/50"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-nko">{word.nko}</span>
                        <span className="text-sm text-muted-foreground">/{word.latin}/</span>
                        <Badge variant="outline" className="text-xs">
                          {word.partOfSpeech}
                        </Badge>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">English:</span> {word.english}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">French:</span> {word.french}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => playAudio(word.nko)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeWord(word)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                {searchQuery ? (
                  <>
                    <h3 className="text-lg font-medium">No matching words</h3>
                    <p className="text-muted-foreground">
                      No words match your search criteria
                    </p>
                  </>
                ) : activeTab !== "all" ? (
                  <>
                    <h3 className="text-lg font-medium">No {activeTab} words</h3>
                    <p className="text-muted-foreground">
                      You haven't saved any {activeTab} words yet
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium">No saved words</h3>
                    <p className="text-muted-foreground">
                      Your saved words will appear here
                    </p>
                  </>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
