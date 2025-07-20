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
  RotateCcw,
  Volume2,
  Star,
  Map,
  Users,
  Sparkles,
  Award,
  ChevronRight,
  Globe
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { IntroNkoShowcase } from "./interactive-nko-display"
import { LessonProgressTimeline, createTimelineFromSections } from "./lesson-progress-timeline"
import { CulturalContextPanel } from "./cultural-context-panel"

interface EnhancedIntroLessonProps {
  lessonId: string
}

interface LessonSection {
  title: string
  content: string
  order: number
  duration: number
  nkoText?: string
  latinTransliteration?: string
  englishTranslation?: string
  pronunciation?: string
  exercises?: Exercise[]
}

interface Exercise {
  question: string
  type: string
  options?: string[]
  correctAnswer?: number
  explanation?: string
}

interface Lesson {
  id: string
  title: string
  description: string
  level: string
  duration: number
  objectives: string[]
  content: {
    sections: LessonSection[]
  }
}

export function EnhancedIntroLesson({ lessonId }: EnhancedIntroLessonProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [sectionProgress, setSectionProgress] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Use our own enhanced content instead of fetching from API
    initializeEnhancedLesson()
  }, [lessonId])

  const initializeEnhancedLesson = () => {
    setIsLoading(true)
    
    // Enhanced lesson content
    const enhancedLessonData: Lesson = {
      id: lessonId,
      title: "Introduction to N'Ko: A Journey into West African Literacy",
      description: "Discover the rich history, cultural significance, and fundamental principles of the N'Ko writing system",
      level: "beginner",
      duration: 45,
      topics: ["history", "culture", "writing-system", "linguistics"],
      progress: 0,
      isCompleted: false,
      isLocked: false,
      objectives: [
        "Understand the historical and cultural significance of the N'Ko script",
        "Learn about Solomana Kanté's revolutionary contribution to African literacy",
        "Recognize the linguistic features that make N'Ko unique",
        "Appreciate N'Ko's role in preserving and promoting Manding languages",
        "Explore the modern revival and digital adaptation of N'Ko"
      ],
      content: {
        objectives: [
          "Understand the historical and cultural significance of the N'Ko script",
          "Learn about Solomana Kanté's revolutionary contribution to African literacy",
          "Recognize the linguistic features that make N'Ko unique",
          "Appreciate N'Ko's role in preserving and promoting Manding languages",
          "Explore the modern revival and digital adaptation of N'Ko"
        ],
        sections: [
          {
            title: "The Revolutionary Vision",
            content: `Welcome to your journey into N'Ko (ߒߞߏ), one of Africa's most remarkable writing systems! 

In 1949, in the town of Bingerville, Côte d'Ivoire, a young Guinean intellectual named Solomana Kanté made a decision that would change the course of African literacy forever. Frustrated by colonial arguments that African languages couldn't be written, he set out to prove them wrong.

The name "N'Ko" means "I say" in all Manding languages, representing the voice and identity of millions of West Africans. This wasn't just about creating letters - it was about reclaiming cultural dignity and intellectual sovereignty.`,
            order: 0,
            duration: 8,
            nkoText: "ߒߞߏ",
            latinTransliteration: "N'Ko",
            englishTranslation: "I say",
            pronunciation: "en-kaw"
          },
          {
            title: "Linguistic Innovation",
            content: `N'Ko represents a masterpiece of linguistic engineering. Unlike Arabic script, which was previously used for Manding languages, N'Ko was designed specifically for the sounds and grammatical structures of these languages.

Key innovations include:
• Right-to-left writing direction (like Arabic and Hebrew)
• Unique vowel system perfectly adapted for Manding languages
• Tone marking system for accurate pronunciation
• Numerical system using distinctive N'Ko digits
• Punctuation marks designed for African oral traditions`,
            order: 1,
            duration: 10,
            nkoText: "ߡߊ߲߬ߘߋ߲߬ߞߊ߲",
            latinTransliteration: "Manden-kan",
            englishTranslation: "Manding language",
            pronunciation: "man-den-kan"
          },
          {
            title: "Cultural Renaissance",
            content: `The creation of N'Ko sparked a cultural renaissance across West Africa. For the first time, speakers of Manding languages could read and write in their mother tongue using a script designed for them.

This led to:
• Thousands of books published in N'Ko
• Educational programs across West Africa
• Preservation of oral traditions in written form
• A new generation of African scholars and writers
• Digital initiatives bringing N'Ko into the modern age

Today, N'Ko is taught in schools across Guinea, Mali, Burkina Faso, and Côte d'Ivoire, continuing Kanté's vision of African intellectual independence.`,
            order: 2,
            duration: 12,
            nkoText: "ߞߊ߲ߕߌ߮ ߛߏߟߐߡߣߊ",
            latinTransliteration: "Kante Solomana",
            englishTranslation: "Solomana Kanté",
            pronunciation: "kan-te so-lo-ma-na"
          },
          {
            title: "Modern Digital Age",
            content: `In the 21st century, N'Ko has successfully transitioned into the digital realm. Unicode support, mobile keyboards, and online communities have brought this ancient wisdom into the modern world.

Digital achievements include:
• Unicode standardization (U+07C0–U+07FF)
• Mobile keyboards for smartphones
• Social media presence and online communities
• Digital libraries and educational resources
• Machine translation and AI applications

This digital revolution ensures that N'Ko will continue to thrive for future generations, connecting traditional African wisdom with cutting-edge technology.`,
            order: 3,
            duration: 10,
            nkoText: "ߘߎ߲߬ߣߍ߲߬ ߞߘߐߞߘߐ",
            latinTransliteration: "dunyadan korokorodɔ",
            englishTranslation: "modern world",
            pronunciation: "dun-ya-dan ko-ro-ko-ro-do"
          },
          {
            title: "Your Learning Journey",
            content: `As you begin learning N'Ko, you're joining a community of learners worldwide who are rediscovering the beauty and power of African literacy traditions.

What you'll master:
• The 28-letter N'Ko alphabet and their sounds
• Proper right-to-left writing technique
• Tone marks and pronunciation guides
• Basic vocabulary and common phrases
• Cultural contexts and traditional expressions
• Modern applications and digital tools

Remember: every letter you learn connects you to a rich heritage of African scholarship, creativity, and resistance. Welcome to the N'Ko family!`,
            order: 4,
            duration: 8,
            nkoText: "ߌ ߣߌ߫ ߓߙߊߡߊ߲",
            latinTransliteration: "I ni barama",
            englishTranslation: "Welcome",
            pronunciation: "ee nee ba-ra-ma"
          }
        ]
      }
    }

    setLesson(enhancedLessonData)
    
    // Initialize section progress
    const initialProgress: Record<number, boolean> = {}
    enhancedLessonData.content.sections.forEach((_, index) => {
      initialProgress[index] = false
    })
    setSectionProgress(initialProgress)
    
    setIsLoading(false)
  }

  const markSectionComplete = (sectionIndex: number) => {
    setSectionProgress(prev => ({
      ...prev,
      [sectionIndex]: true
    }))
    
    // Show celebration for completed sections
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 2000)
  }

  const calculateOverallProgress = () => {
    if (!lesson?.content?.sections) return 0
    const completedSections = Object.values(sectionProgress).filter(Boolean).length
    return Math.round((completedSections / lesson.content.sections.length) * 100)
  }

  const nextSection = () => {
    if (!lesson?.content?.sections) return
    
    markSectionComplete(currentSection)
    
    if (currentSection < lesson.content.sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const previousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const goToSection = (index: number) => {
    setCurrentSection(index)
  }

  const playAudio = (text: string) => {
    // Placeholder for audio functionality
    toast({
      title: "Audio",
      description: "Audio pronunciation would play here",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-16 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-xl"></div>
            <div className="h-8 bg-emerald-100 rounded w-96"></div>
            <div className="h-96 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Lesson Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The requested lesson could not be found.
            </p>
            <Button onClick={() => router.push('/nko/lessons')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lessons
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentSectionData = lesson.content?.sections?.[currentSection]
  const progress = calculateOverallProgress()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-full shadow-lg flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <span className="font-semibold">Section Complete!</span>
              <CheckCircle className="w-6 h-6 text-green-300" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl text-emerald-600">ߒ</div>
          <div className="absolute top-20 right-20 text-4xl text-teal-600">ߞ</div>
          <div className="absolute bottom-20 left-20 text-5xl text-cyan-600">ߏ</div>
          <div className="absolute bottom-10 right-10 text-3xl text-emerald-600">ߊ</div>
        </div>

        <div className="container mx-auto py-8 relative z-10">
          {/* Navigation Bar */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/nko/lessons')}
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lessons
            </Button>
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <Globe className="w-4 h-4" />
              <span>N'Ko Learning Hub</span>
              <ChevronRight className="w-3 h-3" />
              <span>Beginner Lessons</span>
            </div>
          </div>

          {/* Lesson Header Card */}
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-white via-emerald-50 to-teal-50">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">ߒ</span>
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-2 bg-emerald-100 text-emerald-800">
                        {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)} Level
                      </Badge>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                        {lesson.title}
                      </CardTitle>
                    </div>
                  </div>
                  <p className="text-lg text-slate-600 leading-relaxed mb-6">
                    {lesson.description}
                  </p>
                  
                  {/* Lesson Stats */}
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">{lesson.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <BookOpen className="w-5 h-5 text-teal-600" />
                      <span className="font-medium">{lesson.content?.sections?.length || 0} sections</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-5 h-5 text-cyan-600" />
                      <span className="font-medium">Interactive exercises</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Award className="w-5 h-5 text-amber-600" />
                      <span className="font-medium">Cultural context</span>
                    </div>
                  </div>
                </div>

                {/* Progress Circle */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-2">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-emerald-200"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                        className="text-emerald-500 transition-all duration-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-emerald-700">{progress}%</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600">Progress</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Section Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Timeline Navigation */}
              <LessonProgressTimeline
                sections={lesson.content?.sections ? createTimelineFromSections(
                  lesson.content.sections,
                  currentSection,
                  sectionProgress
                ) : []}
                currentSection={currentSection}
                onSectionClick={goToSection}
                totalProgress={progress}
              />

              {/* Learning Objectives */}
              {lesson.objectives && lesson.objectives.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-teal-600" />
                      Learning Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      {lesson.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600 leading-relaxed">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Cultural Context Panel */}
              <CulturalContextPanel 
                lessonSection={currentSection}
                culturalTheme="traditional"
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-800">
                        {currentSectionData?.title}
                      </CardTitle>
                      <p className="text-slate-600 mt-1">
                        Section {currentSection + 1} of {lesson.content?.sections?.length || 0}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-white border-emerald-200 text-emerald-700">
                      {currentSectionData?.duration || 5} min read
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-8 space-y-8">
                  {/* Section Content */}
                  <div className="prose max-w-none">
                    <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {currentSectionData?.content}
                    </div>
                  </div>

                  {/* N'Ko Text Display */}
                  {currentSectionData?.nkoText && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-emerald-200">
                        <CardContent className="p-6">
                          <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-4">
                              <div 
                                className="text-4xl font-bold text-emerald-800" 
                                style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
                                dir="rtl"
                              >
                                {currentSectionData.nkoText}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                                onClick={() => playAudio(currentSectionData.nkoText || '')}
                              >
                                <Volume2 className="w-5 h-5" />
                              </Button>
                            </div>
                            
                            {currentSectionData.latinTransliteration && (
                              <div>
                                <Badge variant="secondary" className="mb-2 bg-teal-100 text-teal-800">
                                  Transliteration
                                </Badge>
                                <div className="text-slate-600 font-medium">
                                  {currentSectionData.latinTransliteration}
                                </div>
                              </div>
                            )}
                            
                            {currentSectionData.englishTranslation && (
                              <div>
                                <Badge variant="secondary" className="mb-2 bg-cyan-100 text-cyan-800">
                                  English
                                </Badge>
                                <div className="text-slate-600">
                                  {currentSectionData.englishTranslation}
                                </div>
                              </div>
                            )}
                            
                            {currentSectionData.pronunciation && (
                              <div>
                                <Badge variant="secondary" className="mb-2 bg-amber-100 text-amber-800">
                                  Pronunciation
                                </Badge>
                                <div className="text-slate-600 font-mono">
                                  {currentSectionData.pronunciation}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Interactive N'Ko Showcase - Show after section 2 */}
                  {currentSection === 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-6"
                    >
                      <Separator />
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                          <Sparkles className="w-6 h-6 text-amber-600" />
                          Experience N'Ko Characters
                        </h3>
                        <IntroNkoShowcase />
                      </div>
                    </motion.div>
                  )}

                  {/* Section Exercises */}
                  {currentSectionData?.exercises && currentSectionData.exercises.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-6"
                    >
                      <Separator />
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <PlayCircle className="w-6 h-6 text-emerald-600" />
                          Practice Exercises
                        </h3>
                        <div className="space-y-4">
                          {currentSectionData.exercises.map((exercise, index) => (
                            <Card key={index} className="border-l-4 border-l-emerald-500 shadow-md">
                              <CardContent className="p-6">
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-lg text-slate-800">
                                    {exercise.question}
                                  </h4>
                                  {exercise.type === 'multiple-choice' && exercise.options && (
                                    <div className="grid gap-3">
                                      {exercise.options.map((option, optionIndex) => (
                                        <motion.div
                                          key={optionIndex}
                                          whileHover={{ scale: 1.01 }}
                                          whileTap={{ scale: 0.99 }}
                                        >
                                          <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-full justify-start h-auto p-4 text-left hover:bg-emerald-50 hover:border-emerald-300"
                                            onClick={() => {
                                              const isCorrect = optionIndex === exercise.correctAnswer
                                              toast({
                                                title: isCorrect ? "Excellent! 🎉" : "Not quite right",
                                                description: isCorrect 
                                                  ? exercise.explanation || "Great job! Keep going!"
                                                  : "Try again! Take your time to think about it.",
                                                variant: isCorrect ? "default" : "destructive"
                                              })
                                            }}
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium">
                                                {String.fromCharCode(65 + optionIndex)}
                                              </div>
                                              {option}
                                            </div>
                                          </Button>
                                        </motion.div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-8 border-t">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={previousSection}
                      disabled={currentSection === 0}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous Section
                    </Button>

                    {currentSection < (lesson.content?.sections?.length || 0) - 1 ? (
                      <Button
                        size="lg"
                        onClick={nextSection}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg flex items-center gap-2"
                      >
                        Complete & Continue
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        onClick={() => {
                          markSectionComplete(currentSection)
                          toast({
                            title: "Lesson Complete! 🎉",
                            description: "Congratulations! You've completed the introduction to N'Ko.",
                          })
                          setTimeout(() => router.push('/nko/lessons'), 2000)
                        }}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl flex items-center gap-2"
                      >
                        Complete Lesson
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 