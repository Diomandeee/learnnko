"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  BookOpen, 
  GraduationCap, 
  CheckCircle, 
  ArrowRight, 
  Lock, 
  Star,
  Clock,
  Volume 
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

type Lesson = {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  estimatedTime?: number
  progress: number
  isLocked: boolean
  isCompleted: boolean
  topics: string[]
  track?: string
  module?: string
  moduleOrder?: number
  order?: number
}

export function NkoLessonList() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedTrack, setSelectedTrack] = useState<string>('all')
  const [selectedModule, setSelectedModule] = useState<string>('all')
  const [query, setQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/nko/lessons')
        if (response.ok) {
          const data = await response.json()
          setLessons(data)
        }
      } catch (error) {
        console.error("Failed to fetch lessons:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLessons()
  }, [])

  // Fallback sample lessons (used if API is unavailable)
  const sampleLessons: Lesson[] = [
    {
      id: "intro-to-nko",
      title: "Introduction to N'Ko",
      description: "Learn about the history and basics of the N'Ko writing system",
      level: "beginner",
      duration: "30 minutes",
      estimatedTime: 30,
      progress: 100,
      isLocked: false,
      isCompleted: true,
      topics: ["history", "basics"],
      track: "foundations",
      module: "foundations-intro",
      moduleOrder: 1,
      order: 1,
    },
    {
      id: "nko-vowels",
      title: "N'Ko Vowels",
      description: "Learn the seven vowels of the N'Ko alphabet",
      level: "beginner",
      duration: "40 minutes",
      estimatedTime: 40,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      topics: ["alphabet", "vowels", "pronunciation"],
      track: "foundations",
      module: "foundations-alphabet",
      moduleOrder: 3,
      order: 1,
    },
    {
      id: "nko-consonants",
      title: "N'Ko Consonants",
      description: "Learn core consonants and build syllable-reading fluency",
      level: "beginner",
      duration: "55 minutes",
      estimatedTime: 55,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      topics: ["alphabet", "consonants", "reading"],
      track: "foundations",
      module: "foundations-alphabet",
      moduleOrder: 3,
      order: 2,
    },
    {
      id: "syllables-and-spelling",
      title: "Syllables and Spelling",
      description: "Read in chunks, control spacing, and proofread efficiently",
      level: "beginner",
      duration: "35 minutes",
      estimatedTime: 35,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      topics: ["syllables", "spelling", "reading"],
      track: "foundations",
      module: "foundations-alphabet",
      moduleOrder: 3,
      order: 3,
    },
    {
      id: "tone-marks-diacritics",
      title: "Tone Marks and Diacritics",
      description: "Recognize and place N'Ko diacritics (tone/length marks, nasalization)",
      level: "beginner",
      duration: "60 minutes",
      estimatedTime: 60,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      topics: ["diacritics", "tones", "orthography"],
      track: "foundations",
      module: "foundations-diacritics",
      moduleOrder: 4,
      order: 1,
    },
    {
      id: "digits-and-number-writing",
      title: "Digits and Numbers",
      description: "Learn ߀–߉ and the left-to-right digit rule inside N'Ko text",
      level: "beginner",
      duration: "30 minutes",
      estimatedTime: 30,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      topics: ["digits", "numbers", "layout"],
      track: "foundations",
      module: "foundations-script-basics",
      moduleOrder: 2,
      order: 2,
    },
    {
      id: "punctuation-and-symbols",
      title: "Punctuation and Symbols",
      description: "Learn N'Ko punctuation and recognize script-specific symbols",
      level: "beginner",
      duration: "25 minutes",
      estimatedTime: 25,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      topics: ["punctuation", "symbols"],
      track: "foundations",
      module: "foundations-script-basics",
      moduleOrder: 2,
      order: 3,
    },
    {
      id: "unicode-and-digital-tools",
      title: "Unicode, Fonts, and Keyboards",
      description: "Use N'Ko on phones and computers: Unicode, fonts, and input methods",
      level: "beginner",
      duration: "25 minutes",
      estimatedTime: 25,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      topics: ["unicode", "fonts", "keyboards"],
      track: "tools",
      module: "foundations-digital",
      moduleOrder: 6,
      order: 1,
    },
  ]
  
  const displayLessons = lessons.length ? lessons : sampleLessons

  const availableTracks = Array.from(
    new Set(displayLessons.map((l) => l.track).filter(Boolean))
  ).sort() as string[]

  const availableModules = Array.from(
    new Set(
      displayLessons
        .filter((l) => selectedTrack === "all" || l.track === selectedTrack)
        .map((l) => l.module)
        .filter(Boolean)
    )
  ).sort() as string[]

  const filteredLessons = displayLessons
    .filter((lesson) => selectedLevel === "all" || lesson.level === selectedLevel)
    .filter((lesson) => selectedTrack === "all" || lesson.track === selectedTrack)
    .filter((lesson) => selectedModule === "all" || lesson.module === selectedModule)
    .filter((lesson) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      const haystack = [
        lesson.title,
        lesson.description,
        lesson.level,
        lesson.track,
        lesson.module,
        ...(lesson.topics || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
    .sort((a, b) => {
      const moduleDiff = (a.moduleOrder || 0) - (b.moduleOrder || 0)
      if (moduleDiff !== 0) return moduleDiff
      return (a.order || 0) - (b.order || 0)
    })
  
  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ]
  
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'beginner': return 'bg-amber-500'
      case 'intermediate': return 'bg-orange-500'
      case 'advanced': return 'bg-yellow-600'
      default: return 'bg-space-700'
    }
  }
  // sampleLessons is defined above

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">N'Ko Lessons</h2>
          <div className="flex space-x-2">
          {levels.map(level => (
            <Button
              key={level.id}
              variant={selectedLevel === level.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLevel(level.id)}
            >
              {level.name}
            </Button>
          ))}
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, topics, modules..."
          />
          <Select
            value={selectedTrack}
            onValueChange={(v) => {
              setSelectedTrack(v)
              setSelectedModule("all")
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tracks</SelectItem>
              {availableTracks.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedModule} onValueChange={setSelectedModule} disabled={availableModules.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              {availableModules.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="opacity-70">
              <CardHeader className="pb-2">
                <div className="h-6 w-2/3 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-full bg-muted rounded animate-pulse mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Showing {filteredLessons.length} of {displayLessons.length} lessons
          </div>

          {filteredLessons.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-lg font-semibold mb-2">No lessons found</div>
              <div className="text-sm text-muted-foreground">
                Try a different search term or reset filters.
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLessons.map(lesson => (
                <Card key={lesson.id} className={lesson.isLocked ? "opacity-70" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className={getLevelColor(lesson.level)}>
                    {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
                  </Badge>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {lesson.estimatedTime ? `${lesson.estimatedTime} min` : lesson.duration}
                    </span>
                  </div>
                </div>
                <CardTitle className="mt-2 flex items-center">
                  {lesson.isCompleted && <CheckCircle className="h-5 w-5 text-amber-500 mr-2" />}
                  {lesson.isLocked && <Lock className="h-5 w-5 text-muted-foreground mr-2" />}
                  {lesson.title}
                </CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm">{lesson.progress}%</span>
                </div>
                <Progress value={lesson.progress} className="h-2" />
                {(lesson.track || lesson.module) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {lesson.track && <Badge variant="secondary">{lesson.track}</Badge>}
                    {lesson.module && <Badge variant="outline">{lesson.module}</Badge>}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  {lesson.topics.map(topic => (
                    <Badge key={topic} variant="outline">{topic}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                {lesson.isLocked ? (
                  <Button variant="outline" className="w-full" disabled>
                    <Lock className="h-4 w-4 mr-2" />
                    Locked
                  </Button>
                ) : (
                  <Link href={`/nko/lessons/${lesson.id}`} className="w-full">
                    <Button className="w-full">
                      {lesson.isCompleted ? (
                        <>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Review Lesson
                        </>
                      ) : lesson.progress > 0 ? (
                        <>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Continue
                        </>
                      ) : (
                        <>
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Start Lesson
                        </>
                      )}
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
