"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ChevronLeft, Volume2, Star, StarOff, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface DictionaryEntry {
  id: string
  nko: string
  latin: string
  english: string
  french: string
  partOfSpeech: string
  isFavorite: boolean
  example?: {
    nko: string
    english: string
    french: string
  }
}

interface Category {
  id: string
  name: string
  description?: string
}

export default function CategoryView() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [entries, setEntries] = useState<DictionaryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/nko/dictionary/categories/${params.slug}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            toast({
              title: "Category not found",
              description: "The requested category does not exist",
              variant: "destructive"
            })
            router.push("/dashboard/nko/dictionary")
            return
          }
          throw new Error('Failed to fetch category data')
        }
        
        const data = await response.json()
        setCategory(data.category)
        setEntries(data.entries)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load category data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (params.slug) {
      fetchCategoryData()
    }
  }, [params.slug, router, toast])
  
  const toggleFavorite = async (entry: DictionaryEntry) => {
    try {
      if (!entry.isFavorite) {
        // Add to favorites
        const response = await fetch('/api/nko/dictionary/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entryId: entry.id })
        })
        
        if (!response.ok) throw new Error('Failed to add favorite')
        
        // Update UI
        setEntries(prev => 
          prev.map(item => item.id === entry.id ? { ...item, isFavorite: true } : item)
        )
        
        toast({
          title: "Added to favorites",
          description: `"${entry.nko}" has been added to your saved words`
        })
      } else {
        // Remove from favorites
        const response = await fetch(`/api/nko/dictionary/favorites/${entry.id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) throw new Error('Failed to remove favorite')
        
        // Update UI
        setEntries(prev => 
          prev.map(item => item.id === entry.id ? { ...item, isFavorite: false } : item)
        )
        
        toast({
          title: "Removed from favorites",
          description: `"${entry.nko}" has been removed from your saved words`
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      })
    }
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard"
    })
  }
  
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

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mb-2"
            onClick={() => router.push("/dashboard/nko/dictionary")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dictionary
          </Button>
          
          <h2 className="text-3xl font-bold tracking-tight">
            {isLoading ? "Loading category..." : category?.name}
          </h2>
          {category?.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : entries.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Words in this category</CardTitle>
            <CardDescription>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div 
                    key={entry.id}
                    className="border rounded-lg p-4 hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-nko">{entry.nko}</span>
                          <span className="text-sm text-muted-foreground">/{entry.latin}/</span>
                          <Badge variant="outline" className="text-xs">
                            {entry.partOfSpeech}
                          </Badge>
                        </div>
                        <p className="mb-1">
                          <span className="font-medium">English:</span> {entry.english}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">French:</span> {entry.french}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playAudio(entry.nko)}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(entry)}
                        >
                          {entry.isFavorite ? (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(entry.nko)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {entry.example && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="font-nko text-lg" dir="rtl">{entry.example.nko}</p>
                        <p className="text-sm mt-1">{entry.example.english}</p>
                        <p className="text-sm text-muted-foreground">{entry.example.french}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center p-12">
            <h3 className="text-xl font-medium mb-2">No words in this category</h3>
            <p className="text-muted-foreground">
              This category does not have any words yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
