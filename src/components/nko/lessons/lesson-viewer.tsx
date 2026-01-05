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
  duration: string
  estimatedTime?: number
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
      <div className="min-h-screen bg-space-950">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-space-800 rounded w-64"></div>
            <div className="h-4 bg-space-800 rounded w-full max-w-md"></div>
            <div className="h-64 bg-space-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-space-950">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <Card className="border-space-700/50 bg-space-900/50">
            <CardContent className="p-6 md:p-8 text-center">
              <h2 className="text-xl font-semibold mb-2 text-gray-100">Lesson Not Found</h2>
              <p className="text-gray-300 mb-4">
                The requested lesson could not be found.
              </p>
              <Button
                onClick={() => router.push('/nko/lessons')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lessons
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentSectionData = lesson.content?.sections?.[currentSection]

  return (
    <div className="min-h-screen bg-space-950">
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/nko/lessons')}
            className="w-fit border-amber-500/30 text-amber-400 hover:bg-amber-900/30 hover:text-amber-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-1">{lesson.title}</h1>
            <p className="text-gray-300 text-sm md:text-base">{lesson.description}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-amber-500 text-white">{lesson.level}</Badge>
            <div className="flex items-center gap-1 text-sm text-gray-300">
              <Clock className="w-4 h-4 text-amber-400" />
              {lesson.estimatedTime ? `${lesson.estimatedTime} min` : lesson.duration}
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card className="border-space-700/50 bg-space-900/50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-100">Lesson Progress</span>
              <span className="text-sm text-amber-400 font-semibold">
                {calculateOverallProgress()}%
              </span>
            </div>
            <Progress value={calculateOverallProgress()} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Navigation - Mobile: Collapsible, Desktop: Fixed Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-space-700/50 bg-space-900/50">
              <CardHeader className="border-b border-amber-500/20">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-100">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                {lesson.content?.sections?.map((section, index) => (
                  <Button
                    key={index}
                    variant={currentSection === index ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start text-left h-auto py-3 px-3 ${
                      currentSection === index
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'text-gray-200 hover:bg-amber-900/30 hover:text-amber-300'
                    }`}
                    onClick={() => goToSection(index)}
                  >
                    {sectionProgress[index] ? (
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-amber-300" />
                    ) : (
                      <Circle className="w-4 h-4 mr-2 flex-shrink-0" />
                    )}
                    <span className="line-clamp-2">{section.title}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Objectives */}
            {lesson.objectives && lesson.objectives.length > 0 && (
              <Card className="border-space-700/50 bg-space-900/50">
                <CardHeader className="border-b border-amber-500/20">
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-100">
                    <Target className="w-5 h-5 text-orange-400" />
                    Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-3 text-sm">
                    {lesson.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-200">
                        <Circle className="w-3 h-3 mt-1 flex-shrink-0 text-amber-400" />
                        <span className="leading-relaxed">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-space-700/50 bg-space-900/50">
              <CardHeader className="bg-gradient-to-r from-space-900/50 to-space-800/50 border-b border-amber-500/20">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-xl md:text-2xl text-gray-100">{currentSectionData?.title}</span>
                  <Badge variant="outline" className="bg-amber-900/30 border-amber-500/30 text-amber-400 w-fit">
                    Section {currentSection + 1} of {lesson.content?.sections?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                {/* Section Content */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap text-gray-200">
                    {currentSectionData?.content}
                  </p>
                </div>

                {/* N'Ko Text Display */}
                {currentSectionData?.nkoText && (
                  <Card className="bg-gradient-to-r from-amber-900/30 via-orange-900/30 to-yellow-900/30 border-amber-500/30">
                    <CardContent className="p-6">
                      <div className="text-center space-y-3">
                        <div className="text-3xl md:text-4xl font-bold text-amber-300" style={{ fontFamily: 'N\'Ko' }}>
                          {currentSectionData.nkoText}
                        </div>
                        {currentSectionData.pronunciation && (
                          <div className="text-sm text-orange-300">
                            <span className="font-semibold">Pronunciation:</span> {currentSectionData.pronunciation}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Section Exercises */}
                {currentSectionData?.exercises && currentSectionData.exercises.length > 0 && (
                  <div className="space-y-4">
                    <Separator className="bg-amber-500/20" />
                    <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                      <PlayCircle className="w-6 h-6 text-amber-400" />
                      Practice Exercises
                    </h3>
                    {currentSectionData.exercises.map((exercise, index) => (
                      <Card key={index} className="border-l-4 border-l-amber-500 bg-space-800/50">
                        <CardContent className="p-4 md:p-6">
                          <div className="space-y-4">
                            <p className="font-medium text-lg text-gray-100">{exercise.question}</p>
                            {exercise.type === 'multiple-choice' && exercise.options && (
                              <div className="grid gap-3">
                                {exercise.options.map((option, optionIndex) => (
                                  <Button
                                    key={optionIndex}
                                    variant="outline"
                                    size="lg"
                                    className="justify-start h-auto p-4 text-left border-amber-500/30 text-gray-200 hover:bg-amber-900/30 hover:border-amber-500/50 hover:text-amber-300 whitespace-normal"
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

                <Separator className="bg-amber-500/20" />

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={previousSection}
                    disabled={currentSection === 0}
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-900/30 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button
                      onClick={() => markSectionComplete(currentSection)}
                      variant="outline"
                      className="border-amber-500/30 text-amber-400 hover:bg-amber-900/30 hover:text-amber-300"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>

                    <Button
                      onClick={nextSection}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
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
    </div>
  )
} 
