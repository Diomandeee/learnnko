"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
  duration: number // in minutes
  progress: number
  isLocked: boolean
  isCompleted: boolean
  topics: string[]
}

export function NkoLessonList() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
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
  
  const filteredLessons = selectedLevel === 'all'
    ? lessons
    : lessons.filter(lesson => lesson.level === selectedLevel)
  
  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ]
  
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-blue-500'
      case 'advanced': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }



  // Fallback sample lessons
  const sampleLessons: Lesson[] = [
    {
      id: "intro-to-nko",
      title: "Introduction to N'Ko",
      description: "Learn about the history and basics of the N'Ko writing system",
      level: "beginner",
      duration: 15,
      progress: 100,
      isLocked: false,
      isCompleted: true,
      topics: ["history", "basics"]
    },
    {
      id: "alphabet-vowels",
      title: "N'Ko Vowels",
      description: "Learn the seven vowels of the N'Ko alphabet",
      level: "beginner",
      duration: 20,
      progress: 75,
      isLocked: false,
      isCompleted: false,
      topics: ["alphabet", "vowels", "pronunciation"]
    },
    {
      id: "alphabet-consonants-1",
      title: "N'Ko Consonants (Part 1)",
      description: "Learn the first set of consonants in the N'Ko alphabet",
      level: "beginner",
      duration: 25,
      progress: 40,
      isLocked: false,
      isCompleted: false,
      topics: ["alphabet", "consonants", "pronunciation"]
    },
    {
      id: "alphabet-consonants-2",
      title: "N'Ko Consonants (Part 2)",
      description: "Learn the second set of consonants in the N'Ko alphabet",
      level: "beginner",
      duration: 25,
      progress: 0,
      isLocked: true,
      isCompleted: false,
      topics: ["alphabet", "consonants", "pronunciation"]
    },
    {
      id: "tone-marks",
      title: "Tone Marks and Diacritics",
      description: "Learn about tone marks and diacritical marks in N'Ko",
      level: "intermediate",
      duration: 30,
      progress: 0,
      isLocked: true,
      isCompleted: false,
      topics: ["diacritics", "tones", "pronunciation"]
    },
    {
      id: "basic-vocabulary",
      title: "Basic Vocabulary",
      description: "Learn essential everyday words and phrases in N'Ko",
      level: "beginner",
      duration: 30,
      progress: 0,
      isLocked: true,
      isCompleted: false,
      topics: ["vocabulary", "phrases"]
    },
    {
      id: "numbers-counting",
      title: "Numbers and Counting",
      description: "Learn numbers and counting in N'Ko",
      level: "beginner",
      duration: 20,
      progress: 0,
      isLocked: true,
      isCompleted: false,
      topics: ["numbers", "vocabulary"]
    },
    {
      id: "basic-grammar",
      title: "Basic Grammar Structure",
      description: "Learn fundamental grammar rules and sentence structure in N'Ko",
      level: "intermediate",
      duration: 40,
      progress: 0,
      isLocked: true,
      isCompleted: false,
      topics: ["grammar", "sentences"]
    }
  ]

  return (
    <div className="space-y-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(filteredLessons.length ? filteredLessons : sampleLessons).map(lesson => (
            <Card key={lesson.id} className={lesson.isLocked ? "opacity-70" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className={getLevelColor(lesson.level)}>
                    {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
                  </Badge>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{lesson.duration} min</span>
                  </div>
                </div>
                <CardTitle className="mt-2 flex items-center">
                  {lesson.isCompleted && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
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
  )
}
