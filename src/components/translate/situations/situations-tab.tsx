"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Coffee, 
  Plane, 
  ShoppingBag, 
  UtensilsCrossed,
  Phone,
  Hotel,
  Train,
  Map,
  Users,
  Wand2,
  Loader2,
  PlayCircle,
  Volume2,
  Lightbulb,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {SituationGenerator} from "./situation-generator"

interface Situation {
  id: string
  title: string
  description: string
  icon: any
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  categories: string[]
}

interface Phrase {
  french: string
  english: string
  context: string
  formalLevel: 'formal' | 'informal' | 'both'
}

interface ScenarioStep {
  role: 'system' | 'user' | 'assistant'
  content: string
  translation?: string
  suggestions?: string[]
}

const SITUATIONS: Situation[] = [
  {
    id: 'cafe',
    title: 'At the Café',
    description: 'Order drinks and food at a French café',
    icon: Coffee,
    difficulty: 'beginner',
    categories: ['dining', 'daily life']
  },
  {
    id: 'shopping',
    title: 'Shopping',
    description: 'Navigate stores and make purchases',
    icon: ShoppingBag,
    difficulty: 'beginner',
    categories: ['retail', 'daily life']
  },
  {
    id: 'restaurant',
    title: 'Restaurant Dining',
    description: 'Fine dining and restaurant etiquette',
    icon: UtensilsCrossed,
    difficulty: 'intermediate',
    categories: ['dining', 'formal']
  },
  {
    id: 'hotel',
    title: 'Hotel Check-in',
    description: 'Book a room and handle hotel services',
    icon: Hotel,
    difficulty: 'intermediate',
    categories: ['travel', 'accommodation']
  },
  {
    id: 'transport',
    title: 'Public Transport',
    description: 'Navigate trains, buses, and tickets',
    icon: Train,
    difficulty: 'beginner',
    categories: ['travel', 'daily life']
  },
  {
    id: 'business',
    title: 'Business Meeting',
    description: 'Professional interactions and etiquette',
    icon: Building2,
    difficulty: 'advanced',
    categories: ['business', 'formal']
  },
]

export function SituationsTab() {
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null)
  const [scenario, setScenario] = useState<ScenarioStep[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [commonPhrases, setCommonPhrases] = useState<Phrase[]>([])
  const [customSituations, setCustomSituations] = useState<Situation[]>([])

  const handleSituationGenerated = (situation: any) => {
    const newSituation = {
      id: Date.now().toString(),
      title: situation.situation.title,
      description: situation.situation.description,
      icon: Wand2,
      difficulty: situation.situation.difficulty,
      categories: situation.situation.categories,
      isCustom: true,
      content: situation.situation
    }
    
    setCustomSituations(prev => [...prev, newSituation])
  }

  const loadScenario = async (situation: Situation) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/situations/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situationId: situation.id })
      })

      if (!response.ok) throw new Error('Failed to load scenario')
      const data = await response.json()
      
      setScenario(data.scenario)
      setCommonPhrases(data.phrases)
      setSelectedSituation(situation)
    } catch (error) {
      console.error('Error loading scenario:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
  
        <Button variant="outline">
          <Lightbulb className="h-4 w-4 mr-2" />
          Tips & Tricks
        </Button>
      </div>

      {/* Situations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SITUATIONS.map((situation) => (
          <Card 
            key={situation.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => loadScenario(situation)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <situation.icon className="h-5 w-5 text-primary" />
                  <CardTitle>{situation.title}</CardTitle>
                </div>
                <Badge className={getDifficultyColor(situation.difficulty)}>
                  {situation.difficulty}
                </Badge>
              </div>
              <CardDescription>{situation.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {situation.categories.map((category) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scenario Dialog */}
      {selectedSituation && (
        <Dialog open={!!selectedSituation} onOpenChange={() => setSelectedSituation(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <selectedSituation.icon className="h-5 w-5 text-primary" />
                <DialogTitle>{selectedSituation.title}</DialogTitle>
              </div>
              <DialogDescription>
                Practice this scenario with common phrases and cultural tips
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-4">
              {/* Scenario */}
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Scenario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {scenario.map((step, index) => (
                            <div
                              key={index}
                              className={`flex items-start gap-3 ${
                                step.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                              }`}
                            >
                              <div
                                className={`p-3 rounded-lg ${
                                  step.role === 'assistant'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="font-medium">{step.content}</p>
                                {step.translation && (
                                  <p className="text-sm mt-1 opacity-80">
                                    {step.translation}
                                  </p>
                                )}
                                {step.suggestions && (
                                  <div className="mt-2 space-x-2">
                                    {step.suggestions.map((suggestion, i) => (
                                      <Button
                                        key={i}
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                          // Handle suggestion selection
                                        }}
                                      >
                                        {suggestion}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Common Phrases */}
              <div className="col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Phrases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {commonPhrases.map((phrase, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg border hover:bg-muted transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{phrase.french}</p>
                                <p className="text-sm text-muted-foreground">
                                  {phrase.english}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {phrase.context}
                                </p>
                              </div>
                              <Badge variant="outline">{phrase.formalLevel}</Badge>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button variant="ghost" size="sm">
                                <Volume2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
