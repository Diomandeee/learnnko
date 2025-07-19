"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"

export function ScriptIntro() {
  const [currentChar, setCurrentChar] = useState(0)
  
  const nkoChars = [
    { char: 'ߊ', latin: 'a', name: 'a', type: 'vowel' },
    { char: 'ߋ', latin: 'e', name: 'e', type: 'vowel' },
    { char: 'ߌ', latin: 'i', name: 'i', type: 'vowel' },
    { char: 'ߍ', latin: 'ɛ', name: 'è', type: 'vowel' },
    { char: 'ߎ', latin: 'u', name: 'u', type: 'vowel' },
    { char: 'ߏ', latin: 'o', name: 'o', type: 'vowel' },
    { char: 'ߐ', latin: 'ɔ', name: 'ò', type: 'vowel' },
    { char: 'ߓ', latin: 'b', name: 'ba', type: 'consonant' },
    { char: 'ߕ', latin: 't', name: 'ta', type: 'consonant' },
    { char: 'ߖ', latin: 'j', name: 'ja', type: 'consonant' },
    { char: 'ߛ', latin: 's', name: 'sa', type: 'consonant' },
    { char: 'ߜ', latin: 'gb', name: 'gba', type: 'consonant' },
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentChar((prev) => (prev + 1) % nkoChars.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [nkoChars.length])
  
  const playAudio = (char: string) => {
    // Would connect to TTS API
    console.log(`Playing audio for ${char}`)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>N'Ko Script</CardTitle>
        <CardDescription>
          Explore the N'Ko alphabet and its characters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <div className="text-8xl font-nko mb-4 h-32 flex items-center">
            {nkoChars[currentChar].char}
          </div>
          
          <div className="text-center mb-6">
            <p className="text-lg font-medium">{nkoChars[currentChar].name}</p>
            <p className="text-sm text-muted-foreground">
              Latin equivalent: {nkoChars[currentChar].latin}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {nkoChars[currentChar].type.charAt(0).toUpperCase() + nkoChars[currentChar].type.slice(1)}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => playAudio(nkoChars[currentChar].char)}
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Hear Pronunciation
          </Button>
        </div>
        
        <div className="mt-6 grid grid-cols-6 gap-2">
          {nkoChars.map((char, index) => (
            <Button 
              key={index}
              variant={index === currentChar ? "default" : "outline"}
              className="h-12 text-xl font-nko"
              onClick={() => setCurrentChar(index)}
            >
              {char.char}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
