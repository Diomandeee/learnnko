"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Book, Keyboard, GraduationCap, Languages, BookOpen, BrainCircuit } from "lucide-react"
import { useEffect, useState } from "react"

export function NkoOverview() {
  const [progress, setProgress] = useState({
    alphabet: 0,
    vocabulary: 0,
    grammar: 0,
    conversation: 0
  })
  
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/nko/progress')
        if (response.ok) {
          const data = await response.json()
          setProgress(data)
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error)
      }
    }
    
    fetchProgress()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alphabet Mastery
            </CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.alphabet}%</div>
            <Progress value={progress.alphabet} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Master the N'Ko alphabet and basic sounds
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vocabulary
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.vocabulary}%</div>
            <Progress value={progress.vocabulary} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Build your N'Ko vocabulary
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Grammar
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.grammar}%</div>
            <Progress value={progress.grammar} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Learn N'Ko grammar rules and structures
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversation
            </CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.conversation}%</div>
            <Progress value={progress.conversation} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Practice conversational N'Ko
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About N'Ko</CardTitle>
            <CardDescription>
              A writing system for Mande languages in West Africa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              N'Ko (ߒߞߏ) was invented in 1949 by Solomana Kante as a writing system for Mande languages of West Africa. The term "N'Ko" means "I say" in all Mande languages.
            </p>
            <p>
              This script is written from right to left and includes 27 letters, including 7 vowels and 20 consonants. It also uses diacritical marks to represent tones and nasalization.
            </p>
            <div className="flex justify-end">
              <Button variant="outline">
                <Link href="/dashboard/nko/lessons">Learn More</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Begin your N'Ko learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-primary" />
                <p className="font-medium">Step 1: Learn the Alphabet</p>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Start with mastering the N'Ko alphabet and phonetics
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-primary" />
                <p className="font-medium">Step 2: Practice Typing</p>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Use our virtual keyboard to practice typing N'Ko
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <p className="font-medium">Step 3: Build Vocabulary</p>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Learn common words and phrases through our lessons
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-primary" />
                <p className="font-medium">Step 4: Practice Daily</p>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Regular practice is key to mastering N'Ko
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button>
                <Link href="/dashboard/nko/lessons/introduction">Start First Lesson</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
