"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Volume2, RotateCcw, Save, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function NkoKeyboard() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [nkoMode, setNkoMode] = useState<"latin-to-nko" | "nko-to-latin">("latin-to-nko")
  const [savedTexts, setSavedTexts] = useState<string[]>([])
  const { toast } = useToast()
  
  // Define the NkoTransliterator class inline to avoid import issues
  class NkoTransliterator {
    private latinToNkoMap: Record<string, string> = {
      // Vowels
      'a': 'ߊ', 'e': 'ߋ', 'i': 'ߌ', 'ɛ': 'ߍ', 'u': 'ߎ', 'o': 'ߏ', 'ɔ': 'ߐ',
      
      // Consonants
      'b': 'ߓ', 'p': 'ߔ', 't': 'ߕ', 'j': 'ߖ', 'c': 'ߗ', 'd': 'ߘ', 'r': 'ߙ',
      's': 'ߚ', 'gb': 'ߛ', 'f': 'ߜ', 'k': 'ߝ', 'q': 'ߞ', 'l': 'ߟ', 'm': 'ߠ',
      'n': 'ߡ', 'ny': 'ߢ', 'w': 'ߣ', 'h': 'ߤ', 'y': 'ߥ',
      
      // Diacritical marks
      "'": '߫', '`': '߬', '^': '߭', '¨': '߮', '*': '߯', '+': '߰',
      
      // Numbers
      '0': '߀', '1': '߁', '2': '߂', '3': '߃', '4': '߄',
      '5': '߅', '6': '߆', '7': '߇', '8': '߈', '9': '߉'
    }
    
    private nkoToLatinMap: Record<string, string> = {
      // Vowels
      'ߊ': 'a', 'ߋ': 'e', 'ߌ': 'i', 'ߍ': 'ɛ', 'ߎ': 'u', 'ߏ': 'o', 'ߐ': 'ɔ',
      
      // Consonants
      'ߓ': 'b', 'ߔ': 'p', 'ߕ': 't', 'ߖ': 'j', 'ߗ': 'c', 'ߘ': 'd', 'ߙ': 'r',
      'ߚ': 's', 'ߛ': 'gb', 'ߜ': 'f', 'ߝ': 'k', 'ߞ': 'q', 'ߟ': 'l', 'ߠ': 'm',
      'ߡ': 'n', 'ߢ': 'ny', 'ߣ': 'w', 'ߤ': 'h', 'ߥ': 'y',
      
      // Diacritical marks
      '߫': "'", '߬': '`', '߭': '^', '߮': '¨', '߯': '*', '߰': '+', '߲': 'n',
      
      // Numbers
      '߀': '0', '߁': '1', '߂': '2', '߃': '3', '߄': '4',
      '߅': '5', '߆': '6', '߇': '7', '߈': '8', '߉': '9'
    }
    
    // Special character combinations
    private specialCombinations: Record<string, string> = {
      'an': 'ߊ߲',
      'en': 'ߋ߲',
      'in': 'ߌ߲',
      'ɛn': 'ߍ߲',
      'un': 'ߎ߲',
      'on': 'ߏ߲',
      'ɔn': 'ߐ߲',
      'ch': 'ߗ',
      'kh': 'ߝ߭',
      'gh': 'ߝ߫',
      'ng': 'ߡ߲߬'
    }
  
    public latinToNko(text: string): string {
      if (!text) return '';
      
      let result = '';
      let i = 0;
      
      while (i < text.length) {
        let matched = false;
        
        // Check for special combinations first
        for (const combo in this.specialCombinations) {
          if (text.substring(i, i + combo.length).toLowerCase() === combo) {
            result += this.specialCombinations[combo];
            i += combo.length;
            matched = true;
            break;
          }
        }
        
        if (!matched) {
          // Check for regular mappings
          const char = text[i].toLowerCase();
          if (this.latinToNkoMap[char]) {
            result += this.latinToNkoMap[char];
          } else {
            result += text[i];
          }
          i++;
        }
      }
      
      return result;
    }
    
    public nkoToLatin(text: string): string {
      if (!text) return '';
      
      let result = '';
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (this.nkoToLatinMap[char]) {
          result += this.nkoToLatinMap[char];
        } else {
          result += char;
        }
      }
      
      return result;
    }
  }
  
  const transliterator = new NkoTransliterator();
  
  const nkoKeys = [
    // Vowels
    { key: "ߊ", latin: "a", description: "a as in father" },
    { key: "ߋ", latin: "e", description: "e as in let" },
    { key: "ߌ", latin: "i", description: "i as in see" },
    { key: "ߍ", latin: "ɛ", description: "ε as in bed" },
    { key: "ߎ", latin: "u", description: "u as in boot" },
    { key: "ߏ", latin: "o", description: "o as in go" },
    { key: "ߐ", latin: "ɔ", description: "ɔ as in saw" },
    
    // Consonants
    { key: "ߓ", latin: "b", description: "b as in boy" },
    { key: "ߔ", latin: "p", description: "p as in pen" },
    { key: "ߕ", latin: "t", description: "t as in top" },
    { key: "ߖ", latin: "j", description: "j as in joy" },
    { key: "ߗ", latin: "c", description: "ch as in church" },
    { key: "ߘ", latin: "d", description: "d as in dog" },
    { key: "ߙ", latin: "r", description: "r as in run" },
    { key: "ߚ", latin: "s", description: "s as in sun" },
    { key: "ߛ", latin: "gb", description: "gb sound" },
    { key: "ߜ", latin: "f", description: "f as in fun" },
    { key: "ߝ", latin: "k", description: "k as in kite" },
    { key: "ߞ", latin: "q", description: "q sound" },
    { key: "ߟ", latin: "l", description: "l as in love" },
    { key: "ߠ", latin: "m", description: "m as in mom" },
    { key: "ߡ", latin: "n", description: "n as in no" },
    { key: "ߢ", latin: "ny", description: "ny as in canyon" },
    { key: "ߣ", latin: "w", description: "w as in way" },
    { key: "ߤ", latin: "h", description: "h as in hello" },
    { key: "ߥ", latin: "y", description: "y as in yes" },
    
    // Diacritical marks and punctuation
    { key: "߫", latin: "'", description: "High tone" },
    { key: "߬", latin: "`", description: "Low tone" },
    { key: "߭", latin: "^", description: "Rising/falling tone" },
    { key: "߮", latin: "¨", description: "Nasal mark" },
    { key: "߯", latin: "*", description: "Lengthening mark" },
    { key: "߰", latin: "+", description: "Final nasal" },
    { key: "߲", latin: "n", description: "Nasalization (with vowel)" },
    
    // Numbers
    { key: "߀", latin: "0", description: "Zero" },
    { key: "߁", latin: "1", description: "One" },
    { key: "߂", latin: "2", description: "Two" },
    { key: "߃", latin: "3", description: "Three" },
    { key: "߄", latin: "4", description: "Four" },
    { key: "߅", latin: "5", description: "Five" },
    { key: "߆", latin: "6", description: "Six" },
    { key: "߇", latin: "7", description: "Seven" },
    { key: "߈", latin: "8", description: "Eight" },
    { key: "߉", latin: "9", description: "Nine" },
  ]

  useEffect(() => {
    // Load saved texts
    const loadSavedTexts = async () => {
      try {
        const response = await fetch('/api/nko/saved-texts')
        if (response.ok) {
          const data = await response.json()
          setSavedTexts(data.texts || [])
        }
      } catch (error) {
        console.error("Failed to load saved texts:", error)
      }
    }
    
    loadSavedTexts()
  }, [])

  const handleInputChange = (text: string) => {
    setInputText(text)
    
    if (nkoMode === "latin-to-nko") {
      setOutputText(transliterator.latinToNko(text))
    } else {
      setOutputText(transliterator.nkoToLatin(text))
    }
  }
  
  const insertChar = (char: string) => {
    const newText = inputText + char
    handleInputChange(newText)
  }
  
  const toggleMode = () => {
    setNkoMode(prevMode => 
      prevMode === "latin-to-nko" ? "nko-to-latin" : "latin-to-nko"
    )
    // Reset text when changing modes
    setInputText("")
    setOutputText("")
  }
  
  const clearText = () => {
    setInputText("")
    setOutputText("")
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
        title: "Error",
        description: "Failed to play audio",
        variant: "destructive"
      })
    }
  }
  
  const saveText = async () => {
    try {
      if (!outputText) return
      
      const response = await fetch('/api/nko/save-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: outputText })
      })
      
      if (!response.ok) throw new Error('Failed to save text')
      
      const data = await response.json()
      setSavedTexts(prev => [...prev, outputText])
      
      toast({
        title: "Success",
        description: "Text has been saved"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save text",
        variant: "destructive"
      })
    }
  }
  
  const exportText = () => {
    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nko-text-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {nkoMode === "latin-to-nko" ? "Latin Input" : "N'Ko Input"}
            </CardTitle>
            <CardDescription>
              {nkoMode === "latin-to-nko" 
                ? "Type using Latin characters" 
                : "Type or paste N'Ko text"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full h-32 p-4 border rounded-md focus:ring-2 focus:ring-primary"
              dir={nkoMode === "latin-to-nko" ? "ltr" : "rtl"}
              placeholder={nkoMode === "latin-to-nko" 
                ? "Type here using the Latin alphabet..." 
                : "ߒߞߏ ߛߓߍߟߌ ߞߊ߬ߙߊ߲߬..."}
            />
            <div className="flex justify-between mt-2">
              <Button variant="outline" onClick={clearText}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button variant="outline" onClick={toggleMode}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Switch to {nkoMode === "latin-to-nko" ? "N'Ko to Latin" : "Latin to N'Ko"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {nkoMode === "latin-to-nko" ? "N'Ko Output" : "Latin Output"}
            </CardTitle>
            <CardDescription>
              {nkoMode === "latin-to-nko" 
                ? "Converted N'Ko text" 
                : "Transliterated Latin text"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="w-full h-32 p-4 border rounded-md overflow-auto"
              dir={nkoMode === "latin-to-nko" ? "rtl" : "ltr"}
              style={{ 
                fontFamily: nkoMode === "latin-to-nko" ? "'Noto Sans NKo', sans-serif" : "inherit",
                fontSize: nkoMode === "latin-to-nko" ? "1.25rem" : "inherit"
              }}
            >
              {outputText}
            </div>
            <div className="flex justify-end mt-2 gap-2">
              <Button variant="outline" 
                onClick={() => playAudio(outputText)}
                disabled={!outputText}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Listen
              </Button>
              <Button variant="outline" 
                onClick={() => copyToClipboard(outputText)}
                disabled={!outputText}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" 
                onClick={saveText}
                disabled={!outputText}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" 
                onClick={exportText}
                disabled={!outputText}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="characters" className="mt-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="saved">Saved Texts</TabsTrigger>
          <TabsTrigger value="help">Help & Tips</TabsTrigger>
        </TabsList>
        
        <TabsContent value="characters">
          <Card>
            <CardHeader>
              <CardTitle>N'Ko Keyboard</CardTitle>
              <CardDescription>
                Click on characters to insert them into your text
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {nkoKeys.filter(k => !k.key.match(/[\u07c0-\u07ff]/)).map((key, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="text-lg font-nko"
                    onClick={() => insertChar(key.key)}
                  >
                    {key.key}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2 mt-4">
                <h3 className="font-medium">Diacritical Marks</h3>
                <div className="grid grid-cols-7 gap-2">
                  {nkoKeys.filter(k => k.key.match(/[\u07c0-\u07ff]/)).map((key, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      className="text-lg font-nko"
                      onClick={() => insertChar(key.key)}
                    >
                      {key.key}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Texts</CardTitle>
              <CardDescription>
                Your previously saved N'Ko texts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedTexts.length > 0 ? (
                <div className="space-y-4">
                  {savedTexts.map((text, index) => (
                    <div key={index} className="p-4 border rounded-md">
                      <p 
                        className="font-nko text-lg"
                        dir="rtl"
                      >
                        {text}
                      </p>
                      <div className="flex justify-end mt-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(text)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => playAudio(text)}
                        >
                          <Volume2 className="h-4 w-4 mr-2" />
                          Listen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  No saved texts yet. Use the save button to store your translations.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Help & Tips</CardTitle>
              <CardDescription>
                Guide to using the N'Ko keyboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">About N'Ko Script</h3>
                <p>
                  N'Ko is written from right to left. It has 27 letters (7 vowels and 20 consonants) 
                  and uses diacritical marks for tones and nasalization.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Transliteration Tips</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>For nasalized vowels, add "n" after the vowel (e.g., "an" → "ߊ߲")</li>
                  <li>Tone marks are added automatically when needed</li>
                  <li>Use Latin equivalents for N'Ko characters (see the character chart)</li>
                  <li>Some sounds require multiple Latin characters (e.g., "ny" → "ߢ")</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Character Chart</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {nkoKeys.map((key, index) => (
                    <div key={index} className="flex items-center">
                      <span className="font-nko text-lg mr-2">{key.key}</span>
                      <span className="font-mono mr-2">{key.latin}</span>
                      <span className="text-sm text-muted-foreground">{key.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Common Issues</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Make sure your browser supports N'Ko font display</li>
                  <li>If characters appear as boxes, install a N'Ko font like Noto Sans N'Ko</li>
                  <li>Right-to-left text can sometimes behave unexpectedly with mixed content</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
