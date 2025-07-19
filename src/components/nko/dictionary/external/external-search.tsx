"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Volume2, 
  BookmarkPlus, 
  Copy, 
  ExternalLink,
  AlertCircle,
  Loader2,
  Check
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

interface ExternalSearchResult {
  term: string
  translation: string
  partOfSpeech?: string
  entryName: string
  url: string
  definition?: string
  example?: string
  exampleTranslation?: string
}

interface ExternalSearchProps {
  className?: string
}

export function ExternalSearch({ className }: ExternalSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLang, setSearchLang] = useState<"english" | "french" | "bambara">("english")
  const [searchResults, setSearchResults] = useState<ExternalSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState<Record<number, boolean>>({})
  const [savedItems, setSavedItems] = useState<Record<number, boolean>>({})
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter a search term",
        description: "Please enter a word to search for",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/nko/dictionary/external-search?q=${encodeURIComponent(searchQuery)}&lang=${searchLang}`
      )
      
      if (!response.ok) throw new Error('External search failed')
      
      const data = await response.json()
      setSearchResults(data.results || [])
      setSavedItems({})
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search the external dictionary",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const saveExternalTerm = async (result: ExternalSearchResult, index: number) => {
    try {
      setIsSaving({...isSaving, [index]: true})
      
      const response = await fetch('/api/nko/dictionary/save-external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: result.term,
          translation: result.translation,
          partOfSpeech: result.partOfSpeech,
          definition: result.definition,
          example: result.example,
          exampleTranslation: result.exampleTranslation,
          source: 'ankataa'
        })
      })
      
      if (!response.ok) throw new Error('Failed to save term')
      
      setSavedItems({...savedItems, [index]: true})
      
      toast({
        title: "Term saved",
        description: `"${result.translation}" has been saved to your dictionary`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the term",
        variant: "destructive"
      })
    } finally {
      setIsSaving({...isSaving, [index]: false})
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
    <Card className={className}>
      <CardHeader>
        <CardTitle>External Dictionary Search</CardTitle>
        <CardDescription>
          Search the An Ka Taa Bambara/Maninka Dictionary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search for a term..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <Tabs value={searchLang} onValueChange={(v) => setSearchLang(v as any)} className="w-[300px]">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="english">English</TabsTrigger>
                <TabsTrigger value="french">French</TabsTrigger>
                <TabsTrigger value="bambara">Bambara</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Data sourced from <a href="https://dictionary.ankataa.com" target="_blank" rel="noopener noreferrer" className="underline ml-1">An Ka Taa Bambara/Maninka Dictionary</a>
        </div>
        
        <Separator />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Searching the external dictionary...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <div key={index} className="border rounded-md p-4 hover:bg-accent/10 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{result.entryName}</h3>
                        {result.partOfSpeech && (
                          <Badge variant="outline" className="text-xs">
                            {result.partOfSpeech}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">English:</span> {result.term}
                      </p>
                      {result.definition && (
                        <p className="text-sm mt-1 text-muted-foreground">
                          {result.definition}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playAudio(result.translation)}
                      title="Listen to pronunciation"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => saveExternalTerm(result, index)}
                      disabled={isSaving[index] || savedItems[index]}
                      title={savedItems[index] ? "Already saved" : "Save to dictionary"}
                    >
                      {isSaving[index] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : savedItems[index] ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.translation)}
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                      title="View in original dictionary"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {result.example && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="font-medium">{result.example}</p>
                    {result.exampleTranslation && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.exampleTranslation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center p-8 border rounded-md bg-muted">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-lg font-medium">No results found</h3>
            <p className="text-muted-foreground">
              Try a different search term or language
            </p>
          </div>
        ) : (
          <div className="text-center p-8 border rounded-md bg-muted">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-lg font-medium">Search the Bambara Dictionary</h3>
            <p className="text-muted-foreground">
              Enter a term above to search the An Ka Taa dictionary
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
