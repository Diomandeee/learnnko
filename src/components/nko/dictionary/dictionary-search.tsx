"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Volume2, 
  Star, 
  StarOff, 
  Languages, 
  BookOpen
} from "lucide-react"

export function DictionarySearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([
    {
      nko: "ߊߟߎ",
      latin: "alu",
      english: "they, them",
      french: "ils, eux",
      type: "pronoun",
      saved: true,
    },
    {
      nko: "ߓߊ߬ߙߊ",
      latin: "bara",
      english: "work",
      french: "travail",
      type: "noun",
      saved: false,
    },
    {
      nko: "ߖߌ",
      latin: "ji",
      english: "water",
      french: "eau",
      type: "noun",
      saved: false,
    },
  ])
  
  const [activeTab, setActiveTab] = useState("nko-to-english")
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(`Searching for: ${searchQuery} in ${activeTab}`)
    // Would call the dictionary API here
  }
  
  const toggleSaved = (index: number) => {
    const updatedResults = [...searchResults]
    updatedResults[index].saved = !updatedResults[index].saved
    setSearchResults(updatedResults)
  }
  
  const playAudio = (word: string) => {
    console.log(`Playing pronunciation for: ${word}`)
    // Would call TTS API here
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs 
          defaultValue="nko-to-english" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nko-to-english" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              N'Ko → English
            </TabsTrigger>
            <TabsTrigger value="nko-to-french" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              N'Ko → French
            </TabsTrigger>
            <TabsTrigger value="latin-to-nko" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Latin → N'Ko
            </TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder={
                activeTab === "nko-to-english" ? "Search N'Ko word..." :
                activeTab === "nko-to-french" ? "Search N'Ko word..." :
                "Search Latin transliteration..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
          
          <TabsContent value="nko-to-english" className="space-y-4">
            {searchResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-nko">{result.nko}</span>
                      <span className="text-sm text-muted-foreground">/{result.latin}/</span>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                    <p className="mb-1">
                      <span className="font-medium">English:</span> {result.english}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">French:</span> {result.french}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playAudio(result.nko)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSaved(index)}
                    >
                      {result.saved ? (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="nko-to-french" className="space-y-4">
            {/* Similar to nko-to-english but with French focus */}
            <div className="text-center text-muted-foreground py-8">
              Search for an N'Ko word to see French translations
            </div>
          </TabsContent>
          
          <TabsContent value="latin-to-nko" className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              Search for a Latin transliteration to find N'Ko characters
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
