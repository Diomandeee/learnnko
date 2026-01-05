"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Volume2, 
  Star, 
  StarOff, 
  BookmarkPlus, 
  Copy, 
  History,
  Book,
  ArrowRight,
  AlignLeft,
  Languages,
  Loader2,
  Bot,
  Globe,
  Volume as VolumeUp,
  SendHorizonal,
  Bookmark,
  X,
  Sparkles
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface DictionaryEntry {
  id: string
  nko: string
  latin: string
  english: string
  french: string
  partOfSpeech: string
  pronunciation?: string
  isFavorite: boolean
  isFromGemini?: boolean
  isFromDatabase?: boolean
  example?: {
    nko: string
    english: string
    french: string
  }
}

export function NkoDictionarySearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLang, setSearchLang] = useState<"english" | "french" | "nko">("english")
  const [searchResults, setSearchResults] = useState<DictionaryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [favoriteWords, setFavoriteWords] = useState<DictionaryEntry[]>([])
  const [activeTab, setActiveTab] = useState<string>("results")
  const { toast } = useToast()
  
  // Load saved favorites on component mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await fetch('/api/nko/dictionary/favorites')
        if (response.ok) {
          const data = await response.json()
          setFavoriteWords(data.favorites || [])
        }
      } catch (error) {
        console.error("Failed to load favorites:", error)
      }
    }
    
    loadFavorites()
    
    // Load recent searches from localStorage
    const storedSearches = localStorage.getItem('nko-recent-searches')
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches))
    }
  }, [])
  
  // Save recent searches to localStorage when updated
  useEffect(() => {
    localStorage.setItem('nko-recent-searches', JSON.stringify(recentSearches))
  }, [recentSearches])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "No search query",
        description: "Please enter a word to search for",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/nko/dictionary/search?q=${encodeURIComponent(searchQuery)}&lang=${searchLang}`)
      
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      setSearchResults(data.results || [])
      setActiveTab("results")
      
      // Add to recent searches if not already there
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches(prev => [searchQuery, ...prev].slice(0, 10))
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search the dictionary. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard"
    })
  }
  
  const playAudio = async (text: string, language: string = 'nko') => {
    try {
      const response = await fetch('/api/nko/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          language
        })
      })
      
      if (!response.ok) throw new Error('Text-to-speech failed')
      
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      await audio.play()
    } catch (error) {
      toast({
        title: "Audio error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive"
      })
    }
  }
  
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
        setSearchResults(prev => 
          prev.map(item => item.id === entry.id ? { ...item, isFavorite: true } : item)
        )
        setFavoriteWords(prev => [...prev, { ...entry, isFavorite: true }])
        
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
        setSearchResults(prev => 
          prev.map(item => item.id === entry.id ? { ...item, isFavorite: false } : item)
        )
        setFavoriteWords(prev => prev.filter(item => item.id !== entry.id))
        
        toast({
          title: "Removed from favorites",
          description: `"${entry.nko}" has been removed from your saved words`
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      })
    }
  }

  const saveToDictionary = async (entry: DictionaryEntry) => {
    try {
      // Save Gemini entry to database
      const response = await fetch('/api/nko/dictionary/save-external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: entry.english,
          translation: entry.nko,
          partOfSpeech: entry.partOfSpeech,
          latin: entry.latin,
          french: entry.french,
          example: entry.example?.nko,
          exampleEnglish: entry.example?.english,
          exampleFrench: entry.example?.french,
          source: 'gemini'
        })
      })
      
      if (!response.ok) throw new Error('Failed to save entry')
      
      const result = await response.json()
      
      // Update the entry in search results to show it's now in database
      setSearchResults(prev => 
        prev.map(item => item.id === entry.id ? { 
          ...item, 
          isFromGemini: false,
          isFromDatabase: true,
          id: result.entry.id, // Update with real database ID
          isFavorite: true 
        } : item)
      )
      
      toast({
        title: "Saved to dictionary",
        description: `"${entry.nko}" has been added to your personal dictionary`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save word to dictionary. Please try again.",
        variant: "destructive"
      })
    }
  }

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-amber-500/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-space-900/50 to-space-800/50 border-b pb-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Globe className="h-5 w-5 mr-2 text-primary" />
                N'Ko Dictionary
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Search for words in English, French, or N'Ko
              </CardDescription>
            </div>
            <Badge variant="outline" className="px-3 py-1 text-xs">
  
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder={searchLang === "nko" ? "ߞߊ߬ ߞߎ߬ߡߊ߬ߘߊ߬ ߛߓߍ ߣߌ߲߬..." : "Search for a word..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${searchLang === "nko" ? "text-right font-nko text-lg" : ""} pl-10 pr-10 h-12 text-lg shadow-sm`}
                dir={searchLang === "nko" ? "rtl" : "ltr"}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="h-5 w-5 absolute left-3 top-3.5 text-muted-foreground" />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-3 top-3 h-6 w-6 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Tabs value={searchLang} onValueChange={(v) => setSearchLang(v as any)} className="w-[300px]">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="english" className="flex items-center gap-1">
                    <Languages className="h-3 w-3" />
                    English
                  </TabsTrigger>
                  <TabsTrigger value="french" className="flex items-center gap-1">
                    <Languages className="h-3 w-3" />
                    French
                  </TabsTrigger>
                  <TabsTrigger value="nko" className="flex items-center gap-1">
                    <Book className="h-3 w-3" />
                    N'Ko
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button onClick={handleSearch} disabled={isLoading} size="lg" className="px-6">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizonal className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {recentSearches.length > 0 && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Recent:</span>
              {recentSearches.slice(0, 5).map((search, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary transition-colors"
                  onClick={() => {
                    setSearchQuery(search);
                    handleSearch();
                  }}
                >
                  <History className="h-3 w-3 mr-1 opacity-70" />
                  {search}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Search Results {searchResults.length > 0 && `(${searchResults.length})`}
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Favorites {favoriteWords.length > 0 && `(${favoriteWords.length})`}
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="results" className="pt-4">
          {searchQuery ? (
            searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((entry, index) => (
                  <Card 
                    key={entry.id || index} 
                    className={`overflow-hidden transition-all duration-200 ${
                      entry.isFromGemini ? "border-amber-500/30 hover:border-green-300" : "hover:border-primary/50"
                    }`}
                  >
                    <CardHeader className="pb-2 bg-gradient-to-r from-space-900/50 to-space-800/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-xl">
                            {entry.english}
                            <span className="text-sm font-normal px-2 py-0.5 rounded-full bg-space-700/50 text-gray-200">
                              {entry.partOfSpeech}
                            </span>
                            {entry.isFromGemini && (
                              <Badge variant="outline" className="bg-amber-900/30 border-amber-500/30 text-amber-400 ml-2">
                                <Bot className="h-3 w-3 mr-1" />
                                Gemini
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1 text-base">
                            {entry.french}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => playAudio(entry.nko)}
                                  className="h-9 w-9 rounded-full p-0"
                                >
                                  <VolumeUp className="h-4 w-4 text-primary" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Listen to pronunciation
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {entry.isFromGemini ? (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => saveToDictionary(entry)}
                                    className="h-9 w-9 rounded-full p-0"
                                  >
                                    <Bookmark className="h-4 w-4 text-green-600" />
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => toggleFavorite(entry)}
                                    className="h-9 w-9 rounded-full p-0"
                                  >
                                    {entry.isFavorite ? (
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    ) : (
                                      <StarOff className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                {entry.isFromGemini 
                                  ? "Save to dictionary" 
                                  : entry.isFavorite 
                                    ? "Remove from favorites" 
                                    : "Add to favorites"
                                }
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(entry.nko)}
                                  className="h-9 w-9 rounded-full p-0"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Copy to clipboard
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="font-nko text-3xl" dir="rtl">{entry.nko}</span>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <span>Transliteration: <span className="font-medium">{entry.latin}</span></span>
                            {entry.pronunciation && (
                              <>
                                <span className="text-slate-300">|</span>
                                <span>Pronunciation: <span className="font-medium">{entry.pronunciation}</span></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {entry.example && (
                        <div className="mt-4 p-4 rounded-md border border-amber-500/20 bg-space-900/80">
                          <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center">
                            <Book className="h-3.5 w-3.5 mr-1.5 text-primary" />
                            Example
                          </h4>
                          <p className="font-nko text-xl mb-3" dir="rtl">{entry.example.nko}</p>
                          <Separator className="my-2 bg-space-700/50" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-start gap-1.5">
                              <Badge variant="outline" className="mt-0.5">EN</Badge>
                              <p>{entry.example.english}</p>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <Badge variant="outline" className="mt-0.5">FR</Badge>
                              <p>{entry.example.french}</p>
                            </div>
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => playAudio(entry.example.nko)}
                              className="text-xs"
                            >
                              <Volume2 className="h-3 w-3 mr-1.5" />
                              Listen to example
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border rounded-md bg-gradient-to-b from-space-900/50 to-space-800/50">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium">No results found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-1">
                  Try a different search term or language. If your search is too specific, try a more general term.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              </div>
            )
          ) : (
            <div className="text-center p-8 border rounded-md bg-gradient-to-b from-space-900/50 to-space-800/50">
              <AlignLeft className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium">Search the N'Ko dictionary</h3>
              <p className="text-muted-foreground max-w-md mx-auto mt-1">
                Enter a word above to get started. The dictionary is powered by Gemini AI and provides accurate translations for N'Ko words.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="favorites" className="pt-4">
          {favoriteWords.length > 0 ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {favoriteWords.map((entry, index) => (
                  <Card key={index} className="overflow-hidden hover:border-primary/50 transition-all duration-200">
                    <CardHeader className="pb-2 bg-gradient-to-r from-space-900/50 to-space-800/50">
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          {entry.english}
                          <span className="text-sm font-normal px-2 py-0.5 rounded-full bg-space-700/50 text-gray-200">
                            {entry.partOfSpeech}
                          </span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => playAudio(entry.nko)}
                                  className="h-9 w-9 rounded-full p-0"
                                >
                                  <VolumeUp className="h-4 w-4 text-primary" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Listen to pronunciation
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleFavorite(entry)}
                                  className="h-9 w-9 rounded-full p-0"
                                >
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Remove from favorites
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
<Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(entry.nko)}
                                  className="h-9 w-9 rounded-full p-0"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Copy to clipboard
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="font-nko text-3xl" dir="rtl">{entry.nko}</span>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <span>Transliteration: <span className="font-medium">{entry.latin}</span></span>
                            {entry.pronunciation && (
                              <>
                                <span className="text-slate-300">|</span>
                                <span>Pronunciation: <span className="font-medium">{entry.pronunciation}</span></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {entry.example && (
                        <div className="mt-4 p-4 rounded-md border border-amber-500/20 bg-space-900/80">
                          <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center">
                            <Book className="h-3.5 w-3.5 mr-1.5 text-primary" />
                            Example
                          </h4>
                          <p className="font-nko text-xl mb-3" dir="rtl">{entry.example.nko}</p>
                          <Separator className="my-2 bg-space-700/50" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-start gap-1.5">
                              <Badge variant="outline" className="mt-0.5">EN</Badge>
                              <p>{entry.example.english}</p>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <Badge variant="outline" className="mt-0.5">FR</Badge>
                              <p>{entry.example.french}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center p-8 border rounded-md bg-gradient-to-b from-space-900/50 to-space-800/50">
              <Star className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No favorite words yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mt-1">
                Add words to your favorites by clicking the star icon when viewing dictionary entries
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setActiveTab("results")}
              >
                Search dictionary
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="pt-4">
          {recentSearches.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recentSearches.map((search, index) => (
                      <Card
                        key={index}
                        className="p-4 hover:bg-space-900/80 transition-colors cursor-pointer"
                        onClick={() => {
                          setSearchQuery(search);
                          handleSearch();
                          setActiveTab("results");
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{search}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRecentSearches([]);
                      toast({
                        title: "History cleared",
                        description: "Your search history has been cleared"
                      });
                    }}
                  >
                    Clear history
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center p-8 border rounded-md bg-gradient-to-b from-space-900/50 to-space-800/50">
              <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No recent searches</h3>
              <p className="text-muted-foreground max-w-md mx-auto mt-1">
                Your search history will appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
