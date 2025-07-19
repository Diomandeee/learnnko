"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Circle,
  BookOpen,
  Clock,
  Target,
  PlayCircle,
  RotateCcw
} from "lucide-react"

interface LessonSection {
  title: string
  content: string
  nkoText?: string
  pronunciation?: string
  exercises?: Exercise[]
}

interface Exercise {
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'recognition'
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation?: string
}

interface LessonContent {
  objectives: string[]
  sections: LessonSection[]
  quizQuestions?: Exercise[]
  summary?: string
  vocabulary?: Array<{
    nko: string
    latin: string
    english: string
    french: string
  }>
}

interface Lesson {
  id: string
  title: string
  description: string
  level: string
  duration: number
  topics: string[]
  progress: number
  isCompleted: boolean
  isLocked: boolean
  content: LessonContent
  objectives: string[]
}

interface LessonViewerProps {
  lessonId: string
}

export function LessonViewer({ lessonId }: LessonViewerProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [sectionProgress, setSectionProgress] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [startTime, setStartTime] = useState<Date>(new Date())
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchLesson()
    setStartTime(new Date())
  }, [lessonId])

  const fetchLesson = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/nko/lessons/${lessonId}`)
      if (!response.ok) throw new Error('Failed to fetch lesson')
      
      const lessonData = await response.json()
      setLesson(lessonData)
      
      // Initialize section progress
      const initialProgress: Record<number, boolean> = {}
      if (lessonData.content?.sections) {
        lessonData.content.sections.forEach((_: any, index: number) => {
          initialProgress[index] = false
        })
      }
      setSectionProgress(initialProgress)
    } catch (error) {
      console.error('Error fetching lesson:', error)
      toast({
        title: "Error",
        description: "Failed to load lesson. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const markSectionComplete = (sectionIndex: number) => {
    setSectionProgress(prev => ({
      ...prev,
      [sectionIndex]: true
    }))
  }

  const calculateOverallProgress = () => {
    if (!lesson?.content?.sections) return 0
    const completedSections = Object.values(sectionProgress).filter(Boolean).length
    return Math.round((completedSections / lesson.content.sections.length) * 100)
  }

  const saveProgress = async (progress: number, isCompleted: boolean = false) => {
    try {
      const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / 60000) // Minutes
      
      await fetch('/api/nko/lessons/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          progress,
          isCompleted,
          timeSpent
        })
      })
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  const completeLesson = async () => {
    const finalProgress = 100
    await saveProgress(finalProgress, true)
    
    toast({
      title: "Lesson Complete! 🎉",
      description: "Great job! You've completed this lesson.",
    })
    
    // Navigate back to lessons list
    router.push('/nko/lessons')
  }

  const nextSection = () => {
    if (!lesson?.content?.sections) return
    
    markSectionComplete(currentSection)
    
    if (currentSection < lesson.content.sections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      // All sections completed
      completeLesson()
    }
    
    // Save progress
    const newProgress = calculateOverallProgress()
    saveProgress(newProgress)
  }

  const previousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const goToSection = (index: number) => {
    setCurrentSection(index)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Lesson Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The requested lesson could not be found.
            </p>
            <Button onClick={() => router.push('/nko/lessons')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lessons
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentSectionData = lesson.content?.sections?.[currentSection]

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/nko/lessons')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lessons
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <p className="text-muted-foreground">{lesson.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{lesson.level}</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {lesson.duration} min
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Lesson Progress</span>
            <span className="text-sm text-muted-foreground">
              {calculateOverallProgress()}%
            </span>
          </div>
          <Progress value={calculateOverallProgress()} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Sections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lesson.content?.sections?.map((section, index) => (
                <Button
                  key={index}
                  variant={currentSection === index ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => goToSection(index)}
                >
                  {sectionProgress[index] ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 mr-2" />
                  )}
                  <span className="truncate">{section.title}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Objectives */}
          {lesson.objectives && lesson.objectives.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {lesson.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Circle className="w-3 h-3 mt-1 flex-shrink-0" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentSectionData?.title}</span>
                <Badge variant="outline">
                  Section {currentSection + 1} of {lesson.content?.sections?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section Content */}
              <div className="prose max-w-none">
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {currentSectionData?.content}
                </p>
              </div>

              {/* N'Ko Text Display */}
              {currentSectionData?.nkoText && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'N\'Ko' }}>
                        {currentSectionData.nkoText}
                      </div>
                      {currentSectionData.pronunciation && (
                        <div className="text-sm text-muted-foreground">
                          Pronunciation: {currentSectionData.pronunciation}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section Exercises */}
              {currentSectionData?.exercises && currentSectionData.exercises.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-semibold">Practice Exercises</h3>
                  {currentSectionData.exercises.map((exercise, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <p className="font-medium">{exercise.question}</p>
                          {exercise.type === 'multiple-choice' && exercise.options && (
                            <div className="grid gap-2">
                              {exercise.options.map((option, optionIndex) => (
                                <Button
                                  key={optionIndex}
                                  variant="outline"
                                  size="sm"
                                  className="justify-start h-auto p-3"
                                  onClick={() => {
                                    const isCorrect = optionIndex === exercise.correctAnswer
                                    toast({
                                      title: isCorrect ? "Correct! 🎉" : "Try Again",
                                      description: isCorrect 
                                        ? exercise.explanation || "Well done!"
                                        : "That's not quite right. Try again!",
                                      variant: isCorrect ? "default" : "destructive"
                                    })
                                  }}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Separator />

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={previousSection}
                  disabled={currentSection === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <Button onClick={() => markSectionComplete(currentSection)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                  
                  <Button onClick={nextSection}>
                    {currentSection === (lesson.content?.sections?.length || 0) - 1 ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Lesson
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 