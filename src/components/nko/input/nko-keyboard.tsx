"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Keyboard, Delete, Mic, Settings } from "lucide-react"

interface NkoKeyboardProps {
  onCharacterClick: (char: string) => void
}

export function NkoKeyboard({ onCharacterClick }: NkoKeyboardProps) {
  const [showKeyboard, setShowKeyboard] = useState(true)
  
  const vowels = ['ߊ', 'ߋ', 'ߌ', 'ߍ', 'ߎ', 'ߏ', 'ߐ']
  
  const consonants = [
    'ߓ', 'ߔ', 'ߕ', 'ߖ', 'ߗ', 'ߘ', 'ߙ', 'ߚ', 'ߛ', 'ߜ',
    'ߝ', 'ߞ', 'ߟ', 'ߡ', 'ߢ', 'ߣ', 'ߤ', 'ߥ', 'ߦ'
  ]
  
  const specialChars = [
    'ߒ', 'ߧ', '߲', '߫', '߬', '߭', '߮', '߯', '߰', '߱',
    '߸', '߹', '߷', '߶', '߳'
  ]
  
  const numbers = ['߀', '߁', '߂', '߃', '߄', '߅', '߆', '߇', '߈', '߉']
  
  return (
    <Card>
      <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">N'Ko Keyboard</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowKeyboard(!showKeyboard)}
        >
          <Keyboard className="h-4 w-4 mr-2" />
          {showKeyboard ? "Hide Keyboard" : "Show Keyboard"}
        </Button>
      </CardHeader>
      
      {showKeyboard && (
        <CardContent className="p-2">
          <Tabs defaultValue="consonants">
            <TabsList className="grid w-full grid-cols-5 mb-2">
              <TabsTrigger value="consonants">Consonants</TabsTrigger>
              <TabsTrigger value="vowels">Vowels</TabsTrigger>
              <TabsTrigger value="special">Special</TabsTrigger>
              <TabsTrigger value="numbers">Numbers</TabsTrigger>
              <TabsTrigger value="phrases">Phrases</TabsTrigger>
            </TabsList>
            
            <TabsContent value="consonants" className="mt-0">
              <div className="grid grid-cols-5 gap-1 sm:grid-cols-7 lg:grid-cols-10">
                {consonants.map((char, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-12 text-lg font-nko"
                    onClick={() => onCharacterClick(char)}
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="vowels" className="mt-0">
              <div className="grid grid-cols-4 gap-1 sm:grid-cols-7">
                {vowels.map((char, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-12 text-lg font-nko"
                    onClick={() => onCharacterClick(char)}
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="special" className="mt-0">
              <div className="grid grid-cols-5 gap-1 sm:grid-cols-7 lg:grid-cols-8">
                {specialChars.map((char, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-12 text-lg font-nko"
                    onClick={() => onCharacterClick(char)}
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="numbers" className="mt-0">
              <div className="grid grid-cols-5 gap-1 sm:grid-cols-10">
                {numbers.map((char, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-12 text-lg font-nko"
                    onClick={() => onCharacterClick(char)}
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="phrases" className="mt-0">
              <div className="grid grid-cols-2 gap-2">
                {[
                  "ߌ ߣߌ߫ ߕߌ߭",
                  "ߊߟߎ ߦߋ߫ ߡߍ߲ ߞߊ߲߬",
                  "ߛߎߥߊ߲ߘߌ",
                  "ߒ ߓߘߴߊ߬ ߢߊ߬"
                ].map((phrase, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-12 text-sm font-nko"
                    onClick={() => onCharacterClick(` ${phrase} `)}
                  >
                    {phrase}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between mt-2">
            <Button
              variant="outline"
              onClick={() => onCharacterClick(" ")}
              className="flex-1 max-w-[100px]"
            >
              Space
            </Button>
            
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {/* Would implement backspace functionality */}}
              >
                <Delete className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon">
                <Mic className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
