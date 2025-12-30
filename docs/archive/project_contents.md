### /Users/mohameddiomande/Desktop/french-connect/src/components/nko/lessons/learning-progress.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Award, BookOpen, Flame, Calendar } from "lucide-react"

export function LearningProgress() {
  const stats = {
    lessonProgress: 28,
    lessonsCompleted: 3,
    totalLessons: 12,
    streak: 5,
    wordsLearned: 48,
    minutesStudied: 145,
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Course Progress</span>
                <span className="font-medium">{stats.lessonProgress}%</span>
              </div>
              <Progress value={stats.lessonProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-2 border rounded-lg">
                <BookOpen className="h-5 w-5 text-primary mb-1" />
                <span className="text-xl font-bold">{stats.lessonsCompleted}</span>
                <span className="text-xs text-center">Completed Lessons</span>
              </div>
              
              <div className="flex flex-col items-center p-2 border rounded-lg">
                <Flame className="h-5 w-5 text-orange-500 mb-1" />
                <span className="text-xl font-bold">{stats.streak}</span>
                <span className="text-xs text-center">Day Streak</span>
              </div>
              
              <div className="flex flex-col items-center p-2 border rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-xl font-bold">{Math.ceil(stats.minutesStudied / 60)}</span>
                <span className="text-xs text-center">Hours Studied</span>
              </div>
            </div>
            
            <Button className="w-full">Continue Learning</Button>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Words Learned</p>
                  <p className="text-2xl font-bold">{stats.wordsLearned}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Time Studied</p>
                  <p className="text-2xl font-bold">{stats.minutesStudied} min</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Lessons Completed</p>
                  <p className="text-2xl font-bold">{stats.lessonsCompleted}/{stats.totalLessons}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Current Streak</p>
                  <p className="text-2xl font-bold">{stats.streak} days</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="achievements">
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "First Lesson", icon: BookOpen, unlocked: true },
                { name: "5-Day Streak", icon: Flame, unlocked: true },
                { name: "N'Ko Beginner", icon: Award, unlocked: true },
                { name: "Vocabulary Builder", icon: BookOpen, unlocked: false },
                { name: "Reading Expert", icon: BookOpen, unlocked: false },
                { name: "N'Ko Master", icon: Award, unlocked: false },
              ].map((achievement, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center p-3 border rounded-lg ${
                    achievement.unlocked ? "border-primary" : "border-gray-200 opacity-50"
                  }`}
                >
                  <achievement.icon className={`h-8 w-8 mb-2 ${
                    achievement.unlocked ? "text-primary" : "text-gray-400"
                  }`} />
                  <span className="text-xs text-center font-medium">{achievement.name}</span>
                  <span className="text-xs text-center text-muted-foreground">
                    {achievement.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/nko/lessons/lesson-card.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  CircleCheck, 
  LockIcon,
  Pencil,
  ArrowRight,
  Clock,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface LessonCardProps {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  progress: number
  isLocked: boolean
  isCompleted: boolean
  lastAccessed?: Date
  topics: string[]
}

export function LessonCard({
  id,
  title,
  description,
  level,
  duration,
  progress,
  isLocked,
  isCompleted,
  lastAccessed,
  topics
}: LessonCardProps) {
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-blue-500'
      case 'advanced': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }
  
  return (
    <Card 
      className={`
        ${isCompleted ? 'border-primary/50' : ''}
        ${progress > 0 && !isCompleted ? 'border-blue-500/50' : ''}
        ${isLocked ? 'opacity-60' : ''}
        transition-all hover:shadow-md
      `}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CircleCheck className="h-5 w-5 text-green-500" />
            ) : isLocked ? (
              <LockIcon className="h-5 w-5 text-muted-foreground" />
            ) : progress > 0 ? (
              <Pencil className="h-5 w-5 text-blue-500" />
            ) : (
              <BookOpen className="h-5 w-5 text-primary" />
            )}
            <CardTitle>{title}</CardTitle>
          </div>
          
          <Badge className={getLevelColor(level)}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between mb-2 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration} min</span>
          </div>
          <span>{progress}% complete</span>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        <div className="flex flex-wrap gap-2 mt-4">
          {topics.map(topic => (
            <Badge key={topic} variant="outline">{topic}</Badge>
          ))}
        </div>
        
        {lastAccessed && (
          <div className="flex items-center mt-4 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            Last accessed {formatDistanceToNow(lastAccessed)} ago
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <div className="w-full flex justify-end">
          <Button 
            variant={isLocked ? 'outline' : 'default'}
            disabled={isLocked}
            asChild
          >
            <Link href={`/dashboard/nko/lessons/${id}`}>
              {isCompleted ? 'Review' : 
               progress > 0 ? 'Continue' : 
               !isLocked ? 'Start' : 'Locked'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/nko/lessons/lessons-list.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Lightbulb, 
  BookOpen, 
  CircleCheck, 
  LockIcon,
  Pencil,
  ArrowRight 
} from "lucide-react"

export function LessonsList() {
  const lessons = [
    {
      id: "alphabet-basics",
      title: "Alphabet Basics",
      description: "Learn the N'Ko alphabet and characters",
      progress: 100,
      level: "Beginner",
      duration: "30 min",
      status: "completed",
      icon: BookOpen,
    },
    {
      id: "pronunciation",
      title: "Pronunciation Guide",
      description: "Practice pronouncing N'Ko vowels and consonants",
      progress: 75,
      level: "Beginner",
      duration: "45 min",
      status: "in-progress",
      icon: Lightbulb,
    },
    {
      id: "word-formation",
      title: "Basic Word Formation",
      description: "Learn to form simple words and understand diacritics",
      progress: 0,
      level: "Beginner",
      duration: "1 hour",
      status: "available",
      icon: Pencil,
    },
    {
      id: "common-phrases",
      title: "Common Phrases",
      description: "Essential phrases for everyday conversation",
      progress: 0,
      level: "Beginner",
      duration: "1 hour",
      status: "locked",
      icon: Lightbulb,
    },
    {
      id: "simple-sentences",
      title: "Simple Sentences",
      description: "Construct basic sentences in N'Ko",
      progress: 0,
      level: "Intermediate",
      duration: "1.5 hours",
      status: "locked",
      icon: Pencil,
    },
  ]

  return (
    <div className="space-y-4">
      {lessons.map((lesson) => (
        <Card 
          key={lesson.id}
          className={`
            ${lesson.status === 'completed' ? 'border-primary/50' : ''}
            ${lesson.status === 'in-progress' ? 'border-blue-500/50' : ''}
            ${lesson.status === 'locked' ? 'opacity-60' : ''}
          `}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lesson.status === 'completed' ? (
                  <CircleCheck className="h-5 w-5 text-green-500" />
                ) : lesson.status === 'locked' ? (
                  <LockIcon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <lesson.icon className="h-5 w-5 text-primary" />
                )}
                <CardTitle>{lesson.title}</CardTitle>
              </div>
              
              <Badge variant={
                lesson.level === 'Beginner' ? 'default' :
                lesson.level === 'Intermediate' ? 'secondary' : 'outline'
              }>
                {lesson.level}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {lesson.description}
            </p>
            
            <div className="flex justify-between items-center mb-2 text-sm">
              <span>{lesson.duration}</span>
              <span>{lesson.progress}% complete</span>
            </div>
            
            <Progress value={lesson.progress} className="h-2 mb-4" />
            
            <div className="flex justify-end">
              <Button 
                variant={lesson.status === 'locked' ? 'outline' : 'default'}
                disabled={lesson.status === 'locked'}
                asChild
              >
                <Link href={`/dashboard/nko/lessons/${lesson.id}`}>
                  {lesson.status === 'completed' ? 'Review' : 
                   lesson.status === 'in-progress' ? 'Continue' : 
                   lesson.status === 'available' ? 'Start' : 'Locked'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/nko/lessons/nko-lesson-list.tsx
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

  // Placeholder sample lessons
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
                  <Link href={`/dashboard/nko/lessons/${lesson.id}`} className="w-full">
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

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/nko/lessons/progress-dashboard.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Award, BookOpen, Flame, Calendar, Sparkles, Trophy, BarChart, BookMarked } from "lucide-react"
import { getModulesByTrack, getTrackCompletionPercentage, getCompletionPercentage } from "@/lib/nko/modules/module-definitions"

interface ProgressDashboardProps {
  completedLessons: string[]
  vocabularyCount: number
  daysStreak: number
  timeStudied: number // minutes
  lastLessonId?: string
}

export function ProgressDashboard({
  completedLessons,
  vocabularyCount,
  daysStreak,
  timeStudied,
  lastLessonId
}: ProgressDashboardProps) {
  // Calculate track completion percentages
  const foundationsProgress = getTrackCompletionPercentage("foundations", completedLessons);
  const vocabularyProgress = getTrackCompletionPercentage("vocabulary", completedLessons);
  const grammarProgress = getTrackCompletionPercentage("grammar", completedLessons);
  const practicalProgress = getTrackCompletionPercentage("practical", completedLessons);
  const culturalProgress = getTrackCompletionPercentage("cultural", completedLessons);
  
  // Calculate overall progress
  const overallProgress = getCompletionPercentage(completedLessons);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Your Progress</CardTitle>
        <CardDescription>Track your N'Ko learning journey</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-2 border rounded-lg">
                <BookOpen className="h-5 w-5 text-primary mb-1" />
                <span className="text-xl font-bold">{completedLessons.length}</span>
                <span className="text-xs text-center">Completed Lessons</span>
              </div>
              
              <div className="flex flex-col items-center p-2 border rounded-lg">
                <Flame className="h-5 w-5 text-orange-500 mb-1" />
                <span className="text-xl font-bold">{daysStreak}</span>
                <span className="text-xs text-center">Day Streak</span>
              </div>
              
              <div className="flex flex-col items-center p-2 border rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-xl font-bold">{Math.ceil(timeStudied / 60)}</span>
                <span className="text-xs text-center">Hours Studied</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Foundations</span>
                  <span className="font-medium">{foundationsProgress}%</span>
                </div>
                <Progress value={foundationsProgress} className="h-1" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Vocabulary</span>
                  <span className="font-medium">{vocabularyProgress}%</span>
                </div>
                <Progress value={vocabularyProgress} className="h-1" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Grammar</span>
                  <span className="font-medium">{grammarProgress}%</span>
                </div>
                <Progress value={grammarProgress} className="h-1" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Practical Usage</span>
                  <span className="font-medium">{practicalProgress}%</span>
                </div>
                <Progress value={practicalProgress} className="h-1" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Cultural Context</span>
                  <span className="font-medium">{culturalProgress}%</span>
                </div>
                <Progress value={culturalProgress} className="h-1" />
              </div>
            </div>
            
            {lastLessonId && (
              <Button className="w-full" asChild>
                <Link href={`/dashboard/nko/lessons/${lastLessonId}`}>
                  Continue Learning
                </Link>
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Words Learned</p>
                  <p className="text-2xl font-bold">{vocabularyCount}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Time Studied</p>
                  <p className="text-2xl font-bold">{timeStudied} min</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Lessons Completed</p>
                  <p className="text-2xl font-bold">{completedLessons.length}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Current Streak</p>
                  <p className="text-2xl font-bold">{daysStreak} days</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="achievements">
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "First Lesson", icon: BookOpen, unlocked: completedLessons.length > 0 },
                { name: "5-Day Streak", icon: Flame, unlocked: daysStreak >= 5 },
                { name: "N'Ko Beginner", icon: Award, unlocked: completedLessons.length >= 5 },
                { name: "Vocabulary Builder", icon: BookMarked, unlocked: vocabularyCount >= 50 },
                { name: "Reading Expert", icon: Sparkles, unlocked: completedLessons.length >= 10 },
                { name: "N'Ko Master", icon: Trophy, unlocked: completedLessons.length >= 20 },
              ].map((achievement, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center p-3 border rounded-lg ${
                    achievement.unlocked ? "border-primary" : "border-gray-200 opacity-50"
                  }`}
                >
                  <achievement.icon className={`h-8 w-8 mb-2 ${
                    achievement.unlocked ? "text-primary" : "text-gray-400"
                  }`} />
                  <span className="text-xs text-center font-medium">{achievement.name}</span>
                  <span className="text-xs text-center text-muted-foreground">
                    {achievement.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/nko/lessons/markdown/markdown-lesson-view.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  CheckCircle, 
  Home, 
  Save,
  List
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ParsedLesson {
  id: string;
  frontmatter: {
    id: string;
    title: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    module: string;
    moduleOrder: number;
    order: number;
    duration: number;
    prerequisites: string[];
    topics: string[];
  };
  htmlContent: string;
  sections: {
    title: string;
    html: string;
    exercises?: {
      question: string;
      options?: string[];
      correctAnswer?: number | string;
      explanation?: string;
    }[];
  }[];
  quiz: {
    questions: {
      question: string;
options: string[];
      correctAnswer: number;
      explanation?: string;
    }[];
  };
  summary: string;
  vocabulary: {
    nko: string;
    latin: string;
    english: string;
    french: string;
  }[];
}

interface LessonProgress {
  currentSection: number;
  sectionsCompleted: boolean[];
  quizAnswers: number[];
  quizCompleted: boolean;
  lessonCompleted: boolean;
  overallProgress: number;
}

interface MarkdownLessonViewProps {
  lesson: ParsedLesson;
  onSaveProgress: (progress: LessonProgress) => Promise<void>;
  initialProgress?: Partial<LessonProgress>;
}

export function MarkdownLessonView({
  lesson,
  onSaveProgress,
  initialProgress = {}
}: MarkdownLessonViewProps) {
  // Progress state
  const [progress, setProgress] = useState<LessonProgress>({
    currentSection: initialProgress.currentSection || 0,
    sectionsCompleted: initialProgress.sectionsCompleted || Array(lesson.sections.length).fill(false),
    quizAnswers: initialProgress.quizAnswers || Array(lesson.quiz.questions.length).fill(-1),
    quizCompleted: initialProgress.quizCompleted || false,
    lessonCompleted: initialProgress.lessonCompleted || false,
    overallProgress: initialProgress.overallProgress || 0
  });
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz' | 'summary'>(
    initialProgress.quizCompleted ? 'summary' : 
    initialProgress.currentSection >= lesson.sections.length ? 'quiz' : 'learn'
  );
  
  const { toast } = useToast();
  const router = useRouter();
  
  // Calculate overall progress whenever component state changes
  useEffect(() => {
    const totalSections = lesson.sections.length;
    const completedSections = progress.sectionsCompleted.filter(Boolean).length;
    const totalSteps = totalSections + 1; // +1 for quiz
    
    let currentProgress = 0;
    
    if (progress.lessonCompleted) {
      currentProgress = 100;
    } else if (progress.quizCompleted) {
      currentProgress = Math.floor((totalSteps - 0.1) / totalSteps * 100);
    } else {
      currentProgress = Math.floor((completedSections / totalSteps) * 100);
    }
    
    setProgress(prev => ({
      ...prev,
      overallProgress: currentProgress
    }));
  }, [
    progress.sectionsCompleted, 
    progress.quizCompleted, 
    progress.lessonCompleted, 
    lesson.sections.length
  ]);
  
  // Automatically save progress when significant state changes
  useEffect(() => {
    const saveCurrentProgress = async () => {
      try {
        await onSaveProgress(progress);
      } catch (error) {
        // Silent fail - we don't want to interrupt the user experience
        console.error('Error auto-saving progress:', error);
      }
    };
    
    saveCurrentProgress();
  }, [
    progress.sectionsCompleted, 
    progress.quizCompleted, 
    progress.lessonCompleted, 
    activeTab, 
    onSaveProgress, 
    progress
  ]);
  
  const goToNextSection = () => {
    if (progress.currentSection < lesson.sections.length - 1) {
      setProgress(prev => ({
        ...prev,
        currentSection: prev.currentSection + 1
      }));
    } else {
      // If at last section, go to quiz
      setActiveTab('quiz');
    }
  };
  
  const goToPreviousSection = () => {
    if (progress.currentSection > 0) {
      setProgress(prev => ({
        ...prev,
        currentSection: prev.currentSection - 1
      }));
    }
  };
  
  const goToSection = (sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < lesson.sections.length) {
      setProgress(prev => ({
        ...prev,
        currentSection: sectionIndex
      }));
    }
  };
  
  const updateSectionProgress = (sectionIndex: number, completed: boolean) => {
    if (sectionIndex >= 0 && sectionIndex < lesson.sections.length) {
      setProgress(prev => {
        const newSectionsCompleted = [...prev.sectionsCompleted];
        newSectionsCompleted[sectionIndex] = completed;
        return {
          ...prev,
          sectionsCompleted: newSectionsCompleted
        };
      });
    }
  };
  
  const handleExerciseAnswer = (questionIndex: number, answerIndex: number) => {
    // Check if the answer is correct
    const currentSection = lesson.sections[progress.currentSection];
    const exercise = currentSection.exercises?.[questionIndex];
    
    if (exercise && exercise.correctAnswer === answerIndex) {
      // Mark exercise as completed
      toast({
        title: "Correct!",
        description: exercise.explanation || "Good job!",
      });
      
      // If all exercises in the section are answered correctly, mark section as completed
      if (currentSection.exercises && 
          currentSection.exercises.every((ex, idx) => 
            idx === questionIndex || progress.sectionsCompleted[progress.currentSection]
          )) {
        updateSectionProgress(progress.currentSection, true);
      }
    } else {
      toast({
        title: "Incorrect",
        description: exercise?.explanation || "Try again!",
        variant: "destructive"
      });
    }
  };
  
  const updateQuizAnswer = (questionIndex: number, answerIndex: number) => {
    if (questionIndex >= 0 && questionIndex < lesson.quiz.questions.length) {
      setProgress(prev => {
        const newQuizAnswers = [...prev.quizAnswers];
        newQuizAnswers[questionIndex] = answerIndex;
        return {
          ...prev,
          quizAnswers: newQuizAnswers
        };
      });
    }
  };
  
  const completeQuiz = () => {
    setProgress(prev => ({
      ...prev,
      quizCompleted: true
    }));
    setActiveTab('summary');
  };
  
  const completeLesson = () => {
    setProgress(prev => ({
      ...prev,
      lessonCompleted: true
    }));
    
    // Save final progress
    onSaveProgress({
      ...progress,
      lessonCompleted: true,
      overallProgress: 100
    }).then(() => {
      toast({
        title: "Lesson Completed!",
        description: "You've successfully completed this lesson."
      });
    });
  };
  
  // Render a section with its exercises
  const renderSection = (section: typeof lesson.sections[0], index: number) => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: section.html }} />
        
        {section.exercises && section.exercises.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold">Exercises</h3>
            {section.exercises.map((exercise, exIndex) => (
              <Card key={exIndex} className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">{exercise.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  {exercise.options && (
                    <RadioGroup
                      onValueChange={(value) => 
                        handleExerciseAnswer(exIndex, parseInt(value))
                      }
                    >
                      {exercise.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-start space-x-2 py-2">
                          <RadioGroupItem 
                            value={optIndex.toString()} 
                            id={`ex-${index}-${exIndex}-${optIndex}`}
                          />
                          <Label 
                            htmlFor={`ex-${index}-${exIndex}-${optIndex}`}
                            className="text-base"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render quiz questions
  const renderQuiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    
    // Calculate score when showing results
    useEffect(() => {
      if (showResults) {
        const correct = progress.quizAnswers.reduce((acc, answer, index) => {
          return acc + (answer === lesson.quiz.questions[index].correctAnswer ? 1 : 0);
        }, 0);
        setScore(correct);
      }
    }, [showResults, progress.quizAnswers]);
    
    // If quiz is already completed, show results
    useEffect(() => {
      if (progress.quizCompleted) {
        setShowResults(true);
      }
    }, [progress.quizCompleted]);
    
    if (showResults) {
      const quizPassed = score >= Math.ceil(lesson.quiz.questions.length * 0.7); // 70% to pass
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              Quiz Results: {score} / {lesson.quiz.questions.length}
            </h2>
            <p className={quizPassed ? "text-green-600" : "text-red-600"}>
              {quizPassed ? "Congratulations! You passed the quiz!" : "Keep practicing and try again."}
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            {lesson.quiz.questions.map((question, index) => (
              <Card key={index} className={
                progress.quizAnswers[index] === question.correctAnswer
                  ? "border-green-500"
                  : "border-red-500"
              }>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {progress.quizAnswers[index] === question.correctAnswer ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                    <span>{question.question}</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`px-3 py-2 rounded-md ${
                          optIndex === question.correctAnswer 
                            ? "bg-green-100 border border-green-500" 
                            : optIndex === progress.quizAnswers[index] 
                              ? "bg-red-100 border border-red-500" 
                              : "bg-muted"
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  
                  {question.explanation && (
                    <div className="mt-4 text-sm text-muted-foreground p-3 bg-muted rounded-md">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {!progress.quizCompleted && (
            <div className="flex justify-center mt-6">
              <Button onClick={completeQuiz}>
                Continue to Summary
              </Button>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Question {currentQuestion + 1} of {lesson.quiz.questions.length}</span>
            <span className="text-sm">{Math.round((currentQuestion / lesson.quiz.questions.length) * 100)}% complete</span>
          </div>
          <Progress value={(currentQuestion / lesson.quiz.questions.length) * 100} className="h-2" />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{lesson.quiz.questions[currentQuestion].question}</CardTitle>
          </CardHeader>
          
          <CardContent>
            <RadioGroup 
              value={progress.quizAnswers[currentQuestion]?.toString() || ""} 
              onValueChange={(value) => updateQuizAnswer(currentQuestion, parseInt(value))}
            >
              {lesson.quiz.questions[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`quiz-question-${currentQuestion}-option-${index}`}
                  />
                  <Label 
                    htmlFor={`quiz-question-${currentQuestion}-option-${index}`}
                    className="text-base"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            
            <Button 
              onClick={() => {
                if (currentQuestion < lesson.quiz.questions.length - 1) {
                  setCurrentQuestion(prev => prev + 1);
                } else {
                  setShowResults(true);
                }
              }}
              disabled={progress.quizAnswers[currentQuestion] === undefined || progress.quizAnswers[currentQuestion] === -1}
            >
              {currentQuestion < lesson.quiz.questions.length - 1 ? (
                <>Next <ChevronRight className="h-4 w-4 ml-2" /></>
              ) : (
                "Finish Quiz"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  // Render summary and vocabulary
  const renderSummary = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: lesson.summary }} />
          </CardContent>
        </Card>
        
        {lesson.vocabulary.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Vocabulary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">N'Ko</th>
                      <th className="border p-2 text-left">Transliteration</th>
                      <th className="border p-2 text-left">English</th>
                      <th className="border p-2 text-left">French</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lesson.vocabulary.map((word, index) => (
                      <tr key={index}>
                        <td dir="rtl" className="border p-2 font-nko text-xl">{word.nko}</td>
                        <td className="border p-2">{word.latin}</td>
                        <td className="border p-2">{word.english}</td>
                        <td className="border p-2">{word.french}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <p className="text-center text-muted-foreground">
            You've completed the lesson! Click the button below to mark it as complete.
          </p>
          <Button 
            onClick={completeLesson} 
            className="px-8"
            disabled={progress.lessonCompleted}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {progress.lessonCompleted ? "Lesson Completed" : "Complete Lesson"}
          </Button>
        </div>
      </div>
    );
  };
  
  // Manual save function
  const handleSave = async () => {
    try {
      await onSaveProgress(progress);
      toast({
        title: "Progress saved",
        description: "Your lesson progress has been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="max-w-4xl mx-auto shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{lesson.frontmatter.title}</CardTitle>
            <CardDescription>{lesson.frontmatter.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/nko/lessons">
                <Home className="h-4 w-4 mr-2" />
                Lessons
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between mb-1 text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress.overallProgress}%</span>
          </div>
          <Progress value={progress.overallProgress} className="h-2" />
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {lesson.frontmatter.topics.map(topic => (
            <Badge key={topic} variant="outline">{topic}</Badge>
          ))}
          <Badge className={
            lesson.frontmatter.level === 'beginner' ? 'bg-green-500' : 
            lesson.frontmatter.level === 'intermediate' ? 'bg-blue-500' : 'bg-purple-500'
          }>
            {lesson.frontmatter.level}
          </Badge>
          <Badge variant="secondary">
            {lesson.frontmatter.duration} min
          </Badge>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learn">
            <BookOpen className="h-4 w-4 mr-2" />
            Learn
          </TabsTrigger>
          <TabsTrigger 
            value="quiz" 
            disabled={!progress.sectionsCompleted.every(Boolean)}
          >
            <List className="h-4 w-4 mr-2" />
            Quiz
          </TabsTrigger>
          <TabsTrigger 
            value="summary"
            disabled={!progress.quizCompleted}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="learn">
          <CardContent>
            {lesson.sections.length > 0 && progress.currentSection < lesson.sections.length && (
              renderSection(lesson.sections[progress.currentSection], progress.currentSection)
            )}
            
            {/* Section navigation */}
            <div className="flex flex-wrap gap-2 mt-6">
              {lesson.sections.map((_, index) => (
                <Button
                  key={index}
                  variant={progress.currentSection === index ? "default" : 
                           progress.sectionsCompleted[index] ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => goToSection(index)}
                  className={progress.sectionsCompleted[index] ? "border-green-500" : ""}
                >
                  {progress.sectionsCompleted[index] && (
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  )}
                  {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousSection}
              disabled={progress.currentSection === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            
            {progress.currentSection < lesson.sections.length - 1 ? (
              <Button 
                onClick={goToNextSection} 
                disabled={!progress.sectionsCompleted[progress.currentSection]}
              >
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={() => setActiveTab('quiz')} 
                disabled={!progress.sectionsCompleted.every(Boolean)}
              >
                Take Quiz <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="quiz">
          <CardContent>
            {renderQuiz()}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="summary">
          <CardContent>
            {renderSummary()}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/nko/lessons/content/lesson-layout.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  CheckCircle, 
  Home, 
  Save,
  List
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LessonProvider, useLessonContext } from "@/lib/nko/lessons/lesson-context"
import { LessonSection } from "./lesson-section"
import { LessonQuiz } from "./lesson-quiz"
import { LessonSummary } from "./lesson-summary"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { getMongoDatabaseId } from "@/lib/nko/modules/module-definitions"

interface LessonLayoutProps {
  lessonId: string
  mongoLessonId?: string // MongoDB compatible ID
  title: string
  description: string
  content: any
  initialProgress?: any
}

export function LessonLayout({
  lessonId,
  mongoLessonId,
  title,
  description,
  content,
  initialProgress
}: LessonLayoutProps) {
  
  // If we have initial progress, use it to determine active tab
  const initialTab = initialProgress?.quizCompleted 
    ? 'summary' 
    : initialProgress?.currentSection >= content.sections.length
      ? 'quiz'
      : 'learn';
  
  const [activeTab, setActiveTab] = useState(initialTab || 'learn')
  const { toast } = useToast()
  const router = useRouter()

  // Define a wrapper component that uses the context
  const LessonContent = () => {
    const { 
      progress, 
      goToNextSection, 
      goToPreviousSection, 
      goToSection,
      saveProgress 
    } = useLessonContext()

    // Automatically save progress when sections are completed and when tab changes
    useEffect(() => {
      const saveCurrentProgress = async () => {
        try {
          await saveProgress()
        } catch (error) {
          // Silent fail - we don't want to interrupt the user experience
          console.error('Error auto-saving progress:', error)
        }
      }
      
      saveCurrentProgress()
    }, [progress.sectionsCompleted, progress.quizCompleted, progress.lessonCompleted, activeTab, saveProgress])

    // Local function to handle manual save
    const handleSave = async () => {
      try {
        await saveProgress()
        toast({
          title: "Progress saved",
          description: "Your lesson progress has been saved."
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save progress. Please try again.",
          variant: "destructive"
        })
      }
    }

    return (
      <Card className="max-w-4xl mx-auto shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/nko/lessons">
                  <Home className="h-4 w-4 mr-2" />
                  Lessons
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between mb-1 text-sm">
              <span>Progress</span>
              <span className="font-medium">{progress.overallProgress}%</span>
            </div>
            <Progress value={progress.overallProgress} className="h-2" />
          </div>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="learn">
              <BookOpen className="h-4 w-4 mr-2" />
              Learn
            </TabsTrigger>
            <TabsTrigger 
              value="quiz" 
              disabled={!progress.sectionsCompleted.every(Boolean)}
            >
              <List className="h-4 w-4 mr-2" />
              Quiz
            </TabsTrigger>
            <TabsTrigger 
              value="summary"
              disabled={!progress.quizCompleted}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="learn">
            <CardContent>
              {content.sections.length > 0 && progress.currentSection < content.sections.length && (
                <LessonSection
                  section={content.sections[progress.currentSection]}
                  sectionIndex={progress.currentSection}
                  isCompleted={progress.sectionsCompleted[progress.currentSection]}
                />
              )}
              
              {/* Section navigation */}
              <div className="flex flex-wrap gap-2 mt-6">
                {content.sections.map((_, index) => (
                  <Button
                    key={index}
                    variant={progress.currentSection === index ? "default" : 
                             progress.sectionsCompleted[index] ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => goToSection(index)}
                    className={progress.sectionsCompleted[index] ? "border-green-500" : ""}
                  >
                    {progress.sectionsCompleted[index] && (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    )}
                    {index + 1}
                  </Button>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousSection}
                disabled={progress.currentSection === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              
              {progress.currentSection < content.sections.length - 1 ? (
                <Button 
                  onClick={goToNextSection} 
                  disabled={!progress.sectionsCompleted[progress.currentSection]}
                >
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={() => setActiveTab('quiz')} 
                  disabled={!progress.sectionsCompleted.every(Boolean)}
                >
                  Take Quiz <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardFooter>
          </TabsContent>
          
          <TabsContent value="quiz">
            <CardContent>
              <LessonQuiz 
                questions={content.quizQuestions} 
                onComplete={() => setActiveTab('summary')}
              />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="summary">
            <CardContent>
              <LessonSummary 
                summary={content.summary}
                vocabulary={content.vocabulary}
                onComplete={() => {
                  router.push('/dashboard/nko/lessons')
                }}
              />
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    )
  }

  // Use the MongoDB ID if available, otherwise convert the string ID
  const dbLessonId = mongoLessonId || getMongoDatabaseId(lessonId);

  return (
    <LessonProvider 
      lessonId={lessonId}
      mongoLessonId={dbLessonId}
      totalSections={content.sections.length}
      totalQuizQuestions={content.quizQuestions.length}
      initialProgress={initialProgress}
    >
      <LessonContent />
    </LessonProvider>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/nko/lessons/content/lesson-quiz.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Trophy, ChevronLeft, ChevronRight } from "lucide-react"
import { useLessonContext } from "@/lib/nko/lessons/lesson-context"
import { Separator } from "@/components/ui/separator"

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LessonQuizProps {
  questions: QuizQuestion[];
  onComplete: () => void;
}

export function LessonQuiz({ questions, onComplete }: LessonQuizProps) {
  const { progress, updateQuizAnswer, completeQuiz } = useLessonContext()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  // Calculate score when showing results
  useEffect(() => {
    if (showResults) {
      const correct = progress.quizAnswers.reduce((acc, answer, index) => {
        return acc + (answer === questions[index].correctAnswer ? 1 : 0)
      }, 0)
      setScore(correct)
    }
  }, [showResults, progress.quizAnswers, questions])

  const handleAnswer = (answerIndex: number) => {
    updateQuizAnswer(currentQuestion, answerIndex)
  }

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const finishQuiz = () => {
    completeQuiz()
    onComplete()
  }

  // If quiz is already completed, show results
  useEffect(() => {
    if (progress.quizCompleted) {
      setShowResults(true)
    }
  }, [progress.quizCompleted])

  if (showResults) {
    const quizPassed = score >= Math.ceil(questions.length * 0.7) // 70% to pass
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Trophy className={`h-16 w-16 mx-auto mb-4 ${quizPassed ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          <h2 className="text-2xl font-bold mb-2">
            Quiz Results: {score} / {questions.length}
          </h2>
          <p className={quizPassed ? "text-green-600" : "text-red-600"}>
            {quizPassed ? "Congratulations! You passed the quiz!" : "Keep practicing and try again."}
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={index} className={
              progress.quizAnswers[index] === question.correctAnswer
                ? "border-green-500"
                : "border-red-500"
            }>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base flex items-center gap-2">
                    {progress.quizAnswers[index] === question.correctAnswer ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                    <span>{question.question}</span>
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div 
                      key={optIndex} 
                      className={`px-3 py-2 rounded-md ${
                        optIndex === question.correctAnswer 
                          ? "bg-green-100 border border-green-500" 
                          : optIndex === progress.quizAnswers[index] 
                            ? "bg-red-100 border border-red-500" 
                            : "bg-muted"
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center mt-6">
          <Button onClick={finishQuiz}>
            Continue to Summary
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Question {currentQuestion + 1} of {questions.length}</span>
          <span className="text-sm">{Math.round((currentQuestion / questions.length) * 100)}% complete</span>
        </div>
        <Progress value={(currentQuestion / questions.length) * 100} className="h-2" />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{questions[currentQuestion].question}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <RadioGroup 
            value={progress.quizAnswers[currentQuestion]?.toString() || ""} 
            onValueChange={(value) => handleAnswer(parseInt(value))}
          >
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 py-2">
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`quiz-question-${currentQuestion}-option-${index}`}
                />
                <Label htmlFor={`quiz-question-${currentQuestion}-option-${index}`}>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          
          <Button 
            onClick={goToNextQuestion} 
            disabled={progress.quizAnswers[currentQuestion] === undefined || progress.quizAnswers[currentQuestion] === -1}
          >
            {currentQuestion < questions.length - 1 ? (
              <>Next <ChevronRight className="h-4 w-4 ml-2" /></>
            ) : (
              "Finish Quiz"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/nko/lessons/content/lesson-section.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Volume2, HelpCircle, CheckCheck } from "lucide-react"
import { useLessonContext } from "@/lib/nko/lessons/lesson-context"
import { Badge } from "@/components/ui/badge"

interface Exercise {
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'recognition';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

interface LessonSectionProps {
  section: {
    title: string;
    content: string;
    nkoText?: string;
    pronunciation?: string;
    latinTransliteration?: string;
    exercises?: Exercise[];
    audioPrompt?: string;
  };
  sectionIndex: number;
  isCompleted: boolean;
}

export function LessonSection({
  section,
  sectionIndex,
  isCompleted
}: LessonSectionProps) {
  const { updateSectionProgress } = useLessonContext()
  const [exerciseAnswers, setExerciseAnswers] = useState<(number | null)[]>(
    section.exercises ? Array(section.exercises.length).fill(null) : []
  )
  const [showExplanations, setShowExplanations] = useState<boolean[]>(
    section.exercises ? Array(section.exercises.length).fill(false) : []
  )
  const [allExercisesCorrect, setAllExercisesCorrect] = useState(false)

  // Check if all exercises are answered correctly
  useEffect(() => {
    if (!section.exercises || section.exercises.length === 0) {
      setAllExercisesCorrect(true)
      return
    }

    const allCorrect = exerciseAnswers.every((answer, index) => {
      if (answer === null) return false
      return answer === Number(section.exercises?.[index].correctAnswer)
    })

    setAllExercisesCorrect(allCorrect)

    // If all are correct and not yet marked as completed, update progress
    if (allCorrect && !isCompleted) {
      updateSectionProgress(sectionIndex, true)
    }
  }, [exerciseAnswers, section.exercises, isCompleted, sectionIndex, updateSectionProgress])

  const handleExerciseAnswer = (exerciseIndex: number, answerIndex: number) => {
    const newAnswers = [...exerciseAnswers]
    newAnswers[exerciseIndex] = answerIndex
    setExerciseAnswers(newAnswers)
  }

  const toggleExplanation = (exerciseIndex: number) => {
    const newExplanations = [...showExplanations]
    newExplanations[exerciseIndex] = !newExplanations[exerciseIndex]
    setShowExplanations(newExplanations)
  }

  const playAudio = (text: string) => {
    // In a real implementation, this would call a text-to-speech API
    // For now, we'll just show an alert
    alert(`Playing audio for: ${text}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 flex items-center">
          {section.title}
          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500 ml-2" />}
        </h3>
        <p className="text-muted-foreground">{section.content}</p>
      </div>

      {/* N'Ko text and pronunciation */}
      {section.nkoText && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="font-nko text-3xl mb-4 text-right" dir="rtl">
              {section.nkoText}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={() => section.audioPrompt && playAudio(section.audioPrompt)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            
            {section.latinTransliteration && (
              <div className="mb-2">
                <Badge variant="outline">Transliteration</Badge>
                <div className="mt-1 text-muted-foreground">
                  {section.latinTransliteration}
                </div>
              </div>
            )}
            
            {section.pronunciation && (
              <div>
                <Badge variant="outline">Pronunciation</Badge>
                <div className="mt-1 text-muted-foreground">
                  {section.pronunciation}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      {section.exercises && section.exercises.length > 0 && (
        <div className="space-y-4 mt-6">
          <Separator />
          <h4 className="font-semibold">Practice Exercises</h4>
          
          {section.exercises.map((exercise, index) => (
            <Card key={index} className={
              exerciseAnswers[index] !== null
                ? exerciseAnswers[index] === Number(exercise.correctAnswer)
                  ? "border-green-500"
                  : "border-red-500"
                : ""
            }>
              <CardHeader>
                <CardTitle className="text-base flex items-start gap-2">
                  <span>{index + 1}.</span>
                  <span>{exercise.question}</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <RadioGroup 
                  value={exerciseAnswers[index]?.toString() || ""} 
                  onValueChange={(value) => handleExerciseAnswer(index, parseInt(value))}
                >
                  {exercise.options?.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem 
                        value={optIndex.toString()} 
                        id={`exercise-${index}-option-${optIndex}`} 
                        disabled={exerciseAnswers[index] !== null}
                      />
                      <Label 
                        htmlFor={`exercise-${index}-option-${optIndex}`}
                        className={
                          exerciseAnswers[index] === optIndex && optIndex === Number(exercise.correctAnswer)
                            ? "text-green-600 font-medium"
                            : exerciseAnswers[index] === optIndex && optIndex !== Number(exercise.correctAnswer)
                            ? "text-red-600"
                            : optIndex === Number(exercise.correctAnswer) && exerciseAnswers[index] !== null
                            ? "text-green-600 font-medium"
                            : ""
                        }
                      >
                        {option}
                        {exerciseAnswers[index] === optIndex && optIndex === Number(exercise.correctAnswer) && (
                          <CheckCheck className="inline h-4 w-4 ml-2 text-green-600" />
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
              
              <CardFooter className="flex-col items-start">
                {exerciseAnswers[index] !== null && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleExplanation(index)}
                      className="mb-2"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      {showExplanations[index] ? "Hide Explanation" : "Show Explanation"}
                    </Button>
                    
                    {showExplanations[index] && exercise.explanation && (
                      <div className="text-muted-foreground text-sm mt-2 p-3 bg-muted rounded-md w-full">
                        {exercise.explanation}
                      </div>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
          
          <div className="text-center mt-4">
            {allExercisesCorrect ? (
              <div className="text-green-600 flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>All exercises completed correctly!</span>
              </div>
            ) : (
              <div className="text-muted-foreground">
                Complete all exercises correctly to continue.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/nko/lessons/content/lesson-summary.tsx
"use client"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, Trophy, Download, Check, BookOpen } from "lucide-react"
import { useLessonContext } from "@/lib/nko/lessons/lesson-context"
import { Separator } from "@/components/ui/separator"
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

interface LessonSummaryProps {
  summary: string;
  vocabulary: {
    nko: string;
    latin: string;
    english: string;
    french: string;
  }[];
  onComplete: () => void;
}

export function LessonSummary({ summary, vocabulary, onComplete }: LessonSummaryProps) {
  const { progress, completeLesson, saveProgress } = useLessonContext()
  const [showCertificate, setShowCertificate] = useState(false)
  const { toast } = useToast()

  const playAudio = (text: string) => {
    // In a real implementation, this would call a text-to-speech API
    alert(`Playing audio for: ${text}`)
  }

  const handleComplete = async () => {
    if (!progress.lessonCompleted) {
      completeLesson()
      await saveProgress()
    }
    
    setShowCertificate(true)
  }

  const downloadCertificate = () => {
    toast({
      title: "Certificate Downloaded",
      description: "Your certificate has been downloaded.",
    })
  }

  if (showCertificate) {
    return (
      <div className="text-center space-y-6 py-8">
        <Trophy className="h-20 w-20 text-yellow-500 mx-auto" />
        
        <div>
          <h2 className="text-2xl font-bold mb-1">Congratulations!</h2>
          <p className="text-muted-foreground">You've successfully completed this lesson.</p>
        </div>
        
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 max-w-xl mx-auto border-2 border-primary/20">
          <CardContent className="text-center p-6">
            <h3 className="text-xl font-bold mb-6">Certificate of Completion</h3>
            <p className="mb-2">This certifies that</p>
            <p className="text-2xl font-bold mb-2">Student Name</p>
            <p className="mb-6">has successfully completed the</p>
            <p className="text-xl font-bold mb-8 text-primary">{progress.lessonId} Course</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={downloadCertificate}>
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
              <Button variant="outline" onClick={onComplete}>
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lesson Summary</CardTitle>
          <CardDescription>Review what you've learned</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{summary}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Vocabulary</CardTitle>
          <CardDescription>Key words and phrases from this lesson</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N'Ko</TableHead>
                <TableHead>Transliteration</TableHead>
                <TableHead>English</TableHead>
                <TableHead>French</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vocabulary.map((word, index) => (
                <TableRow key={index}>
                  <TableCell dir="rtl" className="font-nko text-xl">{word.nko}</TableCell>
                  <TableCell>{word.latin}</TableCell>
                  <TableCell>{word.english}</TableCell>
                  <TableCell>{word.french}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => playAudio(word.nko)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Separator />
      
      <div className="flex flex-col items-center justify-center py-4 space-y-4">
        <p className="text-center text-muted-foreground">
          You've completed the lesson! Click the button below to mark it as complete.
        </p>
        <Button onClick={handleComplete} className="px-8">
          <Check className="h-4 w-4 mr-2" />
          Complete Lesson
        </Button>
      </div>
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/nko/lessons/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { getModulesByLevel, getMongoDatabaseId } from "@/lib/nko/modules/module-definitions";

export async function GET(req: Request) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const level = url.searchParams.get("level") || "beginner";
    const track = url.searchParams.get("track");
    
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get all modules for this level
    const modules = getModulesByLevel(level);
    
    // If track is specified, filter modules
    const filteredModules = track 
      ? modules.filter(m => m.track === track)
      : modules;
    
    // Get all lessons from database
    const lessons = await prisma.nkoLesson.findMany();
    
    // Get user progress for lessons
    const userProgress = await prisma.nkoUserLessonProgress.findMany({
      where: { userId: user.id }
    });
    
    // For each module, map lessons back to string IDs and add progress
    const lessonsWithProgress = [];
    
    for (const module of filteredModules) {
      for (const lessonId of module.lessons) {
        // Get MongoDB ID for this lesson
        const mongoId = getMongoDatabaseId(lessonId);
        
        // Find lesson in database
        const lesson = lessons.find(l => l.id === mongoId);
        
        if (lesson) {
          // Find progress for this lesson
          const progress = userProgress.find(p => p.lessonId === mongoId);
          
          // Determine if lesson should be locked
          let isLocked = false;
          const moduleIndex = filteredModules.findIndex(m => m.id === module.id);
          const lessonIndex = module.lessons.indexOf(lessonId);
          
          if (moduleIndex === 0 && lessonIndex === 0) {
            // First lesson of first module is always unlocked
            isLocked = false;
          } else if (lessonIndex > 0) {
            // Not first lesson in module, check if previous lesson is completed
            const prevLessonId = module.lessons[lessonIndex - 1];
            const prevMongoId = getMongoDatabaseId(prevLessonId);
            const prevProgress = userProgress.find(p => p.lessonId === prevMongoId);
            isLocked = !prevProgress || !prevProgress.completed;
          } else {
            // First lesson in module, check if last lesson of previous module is completed
            if (moduleIndex > 0) {
              const prevModule = filteredModules[moduleIndex - 1];
              const lastLessonOfPrevModule = prevModule.lessons[prevModule.lessons.length - 1];
              const prevMongoId = getMongoDatabaseId(lastLessonOfPrevModule);
              const prevProgress = userProgress.find(p => p.lessonId === prevMongoId);
              isLocked = !prevProgress || !prevProgress.completed;
            }
          }
          
          lessonsWithProgress.push({
            id: lessonId, // Use string ID for frontend
            title: lesson.title,
            description: lesson.description,
            level: lesson.level,
            module: lesson.module,
            moduleOrder: lesson.moduleOrder,
            order: lesson.order,
            duration: lesson.duration,
            progress: progress?.progress || 0,
            isLocked,
            isCompleted: progress?.completed || false,
            lastAccessed: progress?.updatedAt,
            topics: lesson.topics
          });
        }
      }
    }
    
    // Sort by order
    lessonsWithProgress.sort((a, b) => a.order - b.order);
    
    return NextResponse.json(lessonsWithProgress);
  } catch (error) {
    console.error("Error fetching NKO lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

// Admin route to create new lessons
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if admin (in a real app, you'd check user role)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const lessonData = await req.json();
    
    // Validate required fields
    const requiredFields = ['id', 'title', 'description', 'level', 'module', 'moduleOrder', 'order', 'duration', 'content'];
    for (const field of requiredFields) {
      if (!lessonData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Convert string ID to MongoDB ID
    const mongoId = getMongoDatabaseId(lessonData.id);

    // Create the lesson
    const newLesson = await prisma.nkoLesson.create({
      data: {
        ...lessonData,
        id: mongoId // Use MongoDB ID for database
      }
    });

    return NextResponse.json({
      ...newLesson,
      id: lessonData.id // Return original string ID
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/nko/lessons/sync/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAllLessons, syncLessonToDatabase } from "@/lib/nko/lesson-loader/lesson-loader";

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Load all lessons from markdown files
    const lessons = await getAllLessons();
    
    // Sync each lesson to the database
    for (const lesson of lessons) {
      await syncLessonToDatabase(lesson);
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${lessons.length} lessons to database`,
      lessons: lessons.map(l => ({
        id: l.id,
        title: l.frontmatter.title,
        level: l.frontmatter.level
      }))
    });
  } catch (error) {
    console.error("Error syncing lessons:", error);
    return NextResponse.json(
      { error: "Failed to sync lessons" },
      { status: 500 }
    );
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/nko/lessons/modules/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getModulesByLevel, getModulesByTrack, moduleDefinitions } from "@/lib/nko/modules/module-definitions";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const level = url.searchParams.get('level');
    const track = url.searchParams.get('track');
    
    // Get modules based on filters
    let modules;
    if (level && track) {
      modules = getModulesByTrack(track).filter(m => m.level === level);
    } else if (level) {
      modules = getModulesByLevel(level);
    } else if (track) {
      modules = getModulesByTrack(track);
    } else {
      modules = moduleDefinitions;
    }
    
    // Sort modules by order
    const sortedModules = [...modules].sort((a, b) => a.order - b.order);
    
    // Get user progress for calculations
    const userLessonProgress = await prisma.nkoUserLessonProgress.findMany({
      where: { userId: user.id }
    });
    
    const completedLessonIds = userLessonProgress
      .filter(p => p.completed)
      .map(p => p.lessonId);
    
    // Calculate module completion status
    const modulesWithProgress = sortedModules.map(module => {
      const moduleLessons = module.lessons;
      const completedModuleLessons = moduleLessons.filter(
        lessonId => completedLessonIds.includes(lessonId)
      );
      
      const completionPercentage = Math.round(
        (completedModuleLessons.length / moduleLessons.length) * 100
      );
      
const isCompleted = completionPercentage === 100;
      
      // A module is locked if no lessons completed in previous module
      // (except for the first module which is always unlocked)
      let isLocked = false;
      const moduleIndex = sortedModules.findIndex(m => m.id === module.id);
      
      if (moduleIndex > 0) {
        const previousModule = sortedModules[moduleIndex - 1];
        const previousModuleLessons = previousModule.lessons;
        const anyPreviousModuleLessonCompleted = previousModuleLessons.some(
          lessonId => completedLessonIds.includes(lessonId)
        );
        
        isLocked = !anyPreviousModuleLessonCompleted;
      }
      
      return {
        ...module,
        completionPercentage,
        isCompleted,
        isLocked
      };
    });
    
    return NextResponse.json(modulesWithProgress);
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/nko/lessons/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { getMongoDatabaseId } from "@/lib/nko/modules/module-definitions";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Convert string ID to MongoDB ID
    const mongoId = getMongoDatabaseId(params.id);
    
    // Get lesson
    const lesson = await prisma.nkoLesson.findUnique({
      where: { id: mongoId }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Get user progress for this lesson
    const progress = await prisma.nkoUserLessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: mongoId
        }
      }
    });

    // Check prerequisites to determine if lesson is locked
    const prerequisites = lesson.prerequisites as string[];
    let isLocked = false;
    
    if (prerequisites.length > 0) {
      // Convert prerequisite string IDs to MongoDB IDs
      const mongoPrerequisiteIds = prerequisites.map(getMongoDatabaseId);
      
      const prerequisiteProgress = await prisma.nkoUserLessonProgress.findMany({
        where: {
          userId: user.id,
          lessonId: { in: mongoPrerequisiteIds }
        }
      });
      
      isLocked = !mongoPrerequisiteIds.every(preReqId => 
        prerequisiteProgress.some(p => p.lessonId === preReqId && p.completed)
      );
    }

    return NextResponse.json({
      ...lesson,
      id: params.id, // Return original string ID
      progress: progress?.progress || 0,
      completed: progress?.completed || false,
      sectionsCompleted: progress?.sectionsCompleted || null,
      quizCompleted: progress?.sectionsCompleted ? true : false,
      isLocked
    });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

// Update lesson (admin only)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if admin (in a real app, you'd check user role)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const updateData = await req.json();
    
    // Convert string ID to MongoDB ID
    const mongoId = getMongoDatabaseId(params.id);
    
    // Check if lesson exists
    const lesson = await prisma.nkoLesson.findUnique({
      where: { id: mongoId }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Update the lesson
    const updatedLesson = await prisma.nkoLesson.update({
      where: { id: mongoId },
      data: updateData
    });

    return NextResponse.json({
      ...updatedLesson,
      id: params.id // Return original string ID
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

// Delete lesson (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if admin (in a real app, you'd check user role)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Convert string ID to MongoDB ID
    const mongoId = getMongoDatabaseId(params.id);
    
    // Check if lesson exists
    const lesson = await prisma.nkoLesson.findUnique({
      where: { id: mongoId }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Delete the lesson and related progress records
    await prisma.$transaction([
      prisma.nkoUserLessonProgress.deleteMany({
        where: { lessonId: mongoId }
      }),
      prisma.nkoLesson.delete({
        where: { id: mongoId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/nko/lessons/[id]/progress/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { getMongoDatabaseId } from "@/lib/nko/modules/module-definitions";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { progress, completed, sectionsCompleted, quizCompleted, timeSpent, lastPosition } = await req.json();
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Convert string ID to MongoDB compatible ID
    const mongoLessonId = getMongoDatabaseId(params.id);
    
    // Check if lesson exists
    const lesson = await prisma.nkoLesson.findUnique({
      where: { id: mongoLessonId }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Update or create progress
    const updatedProgress = await prisma.nkoUserLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: mongoLessonId
        }
      },
      update: {
        progress: progress !== undefined ? progress : undefined,
        completed: completed !== undefined ? completed : undefined,
        sectionsCompleted: sectionsCompleted !== undefined ? sectionsCompleted : undefined,
        timeSpent: timeSpent !== undefined ? { increment: timeSpent } : undefined,
        lastPosition: lastPosition !== undefined ? lastPosition : undefined
      },
      create: {
        userId: user.id,
        lessonId: mongoLessonId,
        progress: progress || 0,
        completed: completed || false,
        sectionsCompleted: sectionsCompleted || null,
        timeSpent: timeSpent || 0,
        lastPosition: lastPosition || '0'
      }
    });

    // If lesson is completed, update overall N'Ko progress for the user
    if (completed) {
      // Determine which track this lesson belongs to
      const trackMapping = {
        "foundations": "alphabet",
        "vocabulary": "vocabulary",
        "grammar": "grammar",
        "practical": "conversation"
      };
      
      // Extract track from module name (e.g., "foundations-intro" -> "foundations")
      const trackName = lesson.module.split('-')[0];
      const progressField = trackMapping[trackName as keyof typeof trackMapping];
      
      if (progressField) {
        await prisma.nkoUserProgress.upsert({
          where: { userId: user.id },
          update: {
            [progressField]: { increment: 5 }, // Increment by 5%
          },
          create: {
            userId: user.id,
            [progressField]: 5
          }
        });
      }
    }

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Convert string ID to MongoDB compatible ID
    const mongoLessonId = getMongoDatabaseId(params.id);
    
    // Get user progress for this lesson
    const progress = await prisma.nkoUserLessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: mongoLessonId
        }
      }
    });

    if (!progress) {
      return NextResponse.json(
        { error: "Progress not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/content-generator.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google's Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2-flash" });

export class NkoContentGenerator {
  /**
   * Generate practice exercises for N'Ko learning
   */
  static async generateExercises(topic: string, level: 'beginner' | 'intermediate' | 'advanced', count: number = 5) {
    const prompt = `
      Generate ${count} N'Ko practice exercises about "${topic}" for ${level}-level students.
      
      For each exercise, include:
      1. A question or prompt in English
      2. The correct N'Ko text/answer
      3. A transliteration of the N'Ko text
      4. An English translation
      5. 3-4 wrong options (for multiple choice questions)
      
      Return the exercises in this JSON format:
      {
        "exercises": [
          {
            "question": "Question text",
            "correctAnswer": "Correct N'Ko answer",
            "transliteration": "Latin transliteration",
            "translation": "English translation",
            "options": ["Wrong option 1", "Wrong option 2", "Wrong option 3", "Correct N'Ko answer"]
          }
        ]
      }
      
      Make sure the response is valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Error parsing generated exercises:", error);
      throw new Error("Failed to generate valid exercises");
    }
  }

  /**
   * Generate example sentences using specific N'Ko vocabulary or grammar
   */
  static async generateExampleSentences(vocabulary: string[], grammarPoint?: string, count: number = 3) {
    const prompt = `
      Generate ${count} example sentences in N'Ko using these vocabulary words: ${vocabulary.join(", ")}.
      ${grammarPoint ? `The sentences should demonstrate this grammar point: ${grammarPoint}.` : ""}
      
      For each sentence, include:
      1. The sentence in N'Ko script
      2. A Latin transliteration
      3. An English translation
      4. A French translation
      
      Return the sentences in this JSON format:
      {
        "sentences": [
          {
            "nko": "N'Ko sentence",
            "transliteration": "Latin transliteration",
            "english": "English translation",
            "french": "French translation"
          }
        ]
      }
      
      Make sure the response is valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Error parsing generated sentences:", error);
      throw new Error("Failed to generate valid sentences");
    }
  }

  /**
   * Translate text between N'Ko, English, and French
   */
  static async translateText(text: string, from: 'nko' | 'english' | 'french', to: 'nko' | 'english' | 'french') {
    const prompt = `
      Translate the following ${from} text to ${to}:
      "${text}"
      
      Return the translation in this JSON format:
      {
        "translation": "Translated text",
        "notes": "Any notes about the translation or cultural context"
      }
      
      If translating to N'Ko, also include a transliteration:
      {
        "translation": "Translated text in N'Ko",
        "transliteration": "Latin transliteration",
        "notes": "Any notes about the translation"
      }
      
      Make sure the response is valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Error parsing translation:", error);
      throw new Error("Failed to generate valid translation");
    }
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/dictionary-helper.ts
import { Anthropic } from '@anthropic-ai/sdk';

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "your-api-key-here"
});

export async function getGeminiDictionaryResults(query: string, language: string = 'english') {
  try {
    // Create the prompt that will ask Claude to generate dictionary entries
    const prompt = `
You are a N'Ko language dictionary API. I'm searching for "${query}" in ${language}.

I need 3-5 dictionary entries that would match this search query.
Each entry should include:
- A unique ID (use "claude-1", "claude-2", etc.)
- The word in N'Ko script
- Latin transliteration
- English translation
- French translation
- Part of speech (noun, verb, adj, etc.)
- Pronunciation guide
- An example sentence with translations in English and French

Make sure all N'Ko script is accurate and meaningful. If you can't find exact matches,
provide the closest relevant terms or related words.

Format your response as a JSON structure with this exact schema:
{
  "results": [
    {
      "id": "claude-1",
      "nko": "N'Ko script word",
      "latin": "Latin transliteration",
      "english": "English translation",
      "french": "French translation",
      "partOfSpeech": "noun/verb/adj",
      "pronunciation": "pronunciation guide",
      "example": {
        "nko": "Example sentence in N'Ko",
        "english": "Example translation in English",
        "french": "Example translation in French"
      }
    },
    ...more entries
  ]
}
`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219", // Use the latest Claude model
      max_tokens: 1500,
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.2, // Lower temperature for more consistent responses
    });

    // Extract the JSON from Claude's response
    const responseText = response.content[0].text;
    
    // Parse the JSON response
    try {
      // Extract JSON from text (in case Claude surrounds it with explanation)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
      const jsonResponse = JSON.parse(jsonStr);
      
      // Mark all results as coming from Claude
      if (jsonResponse.results && Array.isArray(jsonResponse.results)) {
        jsonResponse.results = jsonResponse.results.map((entry) => ({
          ...entry,
          isFromGemini: true, // Keep the same property name for UI compatibility
          isFavorite: false
        }));
      }
      
      return jsonResponse;
    } catch (error) {
      console.error("Error parsing Claude response:", error);
      console.log("Raw response:", responseText);
      
      // Create a fallback response
      return createFallbackResponse(query);
    }
  } catch (error) {
    console.error("Error getting dictionary results from Claude:", error);
    return createFallbackResponse(query);
  }
}

function createFallbackResponse(query: string) {
  // Create a fallback response with the original query
  return {
    results: [{
      id: `claude-${Math.random().toString(36).substring(2, 11)}`,
      nko: "ߝߏ߬ߟߌ߬ߟߊ", // Placeholder N'Ko text
      latin: "folila",
      english: query,
      french: query,
      partOfSpeech: "noun",
      pronunciation: "fo-li-la",
      isFavorite: false,
      isFromGemini: true,
      example: {
        nko: "ߒ ߡߊ߫ ߝߏ߬ߟߌ߬ߟߊ ߟߐ߲߫.",
        english: "I don't know this word.",
        french: "Je ne connais pas ce mot."
      }
    }]
  };
}

export function sanitizeSearchQuery(query: string): string {
  // Trim whitespace and remove special characters that might cause issues
  return query.trim().replace(/[^\w\s]/gi, '');
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/schema-types.ts
// Only use this if the SchemaType is not exported from the Gemini library
export enum SchemaType {
  STRING = "string",
  INTEGER = "integer",
  NUMBER = "number",
  BOOLEAN = "boolean",
  ARRAY = "array",
  OBJECT = "object"
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/transliterator.ts
export class NkoTransliterator {
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

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/seed/seed-lessons.ts
// src/lib/nko/seed/seed-lessons.ts
import { prisma } from "@/lib/db/prisma"
import { alphabetVowelsLesson } from "./lessons/beginner/alphabet-vowels"
import { nkoHistoryLesson } from "./lessons/beginner/nko-history"
import { alphabetBasicsLesson } from "./lessons/beginner/alphabet-basics"
import { getMongoDatabaseId } from "@/lib/nko/modules/module-definitions"

export async function seedNkoLessons() {
  try {
    // Check if lessons already exist
    const existingLessons = await prisma.nkoLesson.findMany();
    
    if (existingLessons.length > 0) {
      console.log(`Found ${existingLessons.length} existing lessons. Checking for new ones to add...`);
    }
    
    // Seed the nko history lesson
    const historyLessonId = getMongoDatabaseId("nko-history");
    const existingHistoryLesson = await prisma.nkoLesson.findUnique({
      where: { id: historyLessonId }
    });
    
    if (!existingHistoryLesson) {
      await prisma.nkoLesson.create({
        data: {
          id: historyLessonId,
          title: nkoHistoryLesson.title,
          description: nkoHistoryLesson.description,
          level: nkoHistoryLesson.level,
          module: nkoHistoryLesson.module,
          moduleOrder: nkoHistoryLesson.moduleOrder,
          order: nkoHistoryLesson.order,
          duration: nkoHistoryLesson.duration,
          content: nkoHistoryLesson.content,
          objectives: nkoHistoryLesson.content.objectives,
          prerequisites: nkoHistoryLesson.prerequisites,
          topics: nkoHistoryLesson.topics
        }
      });
      console.log("Successfully seeded N'Ko history lesson!");
    } else {
      console.log("N'Ko history lesson already exists.");
    }
    
    // Seed the alphabet vowels lesson
    const vowelsLessonId = getMongoDatabaseId("alphabet-vowels");
    const existingVowelsLesson = await prisma.nkoLesson.findUnique({
      where: { id: vowelsLessonId }
    });
    
    if (!existingVowelsLesson) {
      await prisma.nkoLesson.create({
        data: {
          id: vowelsLessonId,
          title: alphabetVowelsLesson.title,
          description: alphabetVowelsLesson.description,
          level: alphabetVowelsLesson.level,
          module: alphabetVowelsLesson.module,
          moduleOrder: alphabetVowelsLesson.moduleOrder,
          order: alphabetVowelsLesson.order,
          duration: alphabetVowelsLesson.duration,
          content: alphabetVowelsLesson.content,
          objectives: alphabetVowelsLesson.content.objectives,
          prerequisites: alphabetVowelsLesson.prerequisites,
          topics: alphabetVowelsLesson.topics
        }
      });
      console.log("Successfully seeded N'Ko alphabet vowels lesson!");
    } else {
      console.log("N'Ko alphabet vowels lesson already exists.");
    }
    
    // Seed the alphabet basics lesson
    const basicsLessonId = getMongoDatabaseId("alphabet-basics");
    const existingBasicsLesson = await prisma.nkoLesson.findUnique({
      where: { id: basicsLessonId }
    });
    
    if (!existingBasicsLesson) {
      await prisma.nkoLesson.create({
        data: {
          id: basicsLessonId,
          title: alphabetBasicsLesson.title,
          description: alphabetBasicsLesson.description,
          level: alphabetBasicsLesson.level,
          module: alphabetBasicsLesson.module,
          moduleOrder: alphabetBasicsLesson.moduleOrder,
          order: alphabetBasicsLesson.order,
          duration: alphabetBasicsLesson.duration,
          content: alphabetBasicsLesson.content,
          objectives: alphabetBasicsLesson.content.objectives,
          prerequisites: alphabetBasicsLesson.prerequisites,
          topics: alphabetBasicsLesson.topics
        }
      });
      console.log("Successfully seeded N'Ko alphabet basics lesson!");
    } else {
      console.log("N'Ko alphabet basics lesson already exists.");
    }
    
    // Add more lesson seeds as you develop them
    
  } catch (error) {
    console.error("Error seeding N'Ko lessons:", error);
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/seed/lessons/beginner/alphabet-vowels.ts
export const alphabetVowelsLesson = {
  id: "alphabet-vowels",
  title: "N'Ko Vowels",
  description: "Learn the seven vowels of the N'Ko alphabet and their pronunciation",
  level: "beginner",
  module: "alphabet-fundamentals",
  moduleOrder: 1,
  order: 2,
  duration: 20,
  prerequisites: ["nko-history"],
  topics: ["alphabet", "vowels", "pronunciation"],
  content: {
    objectives: [
      "Recognize all seven N'Ko vowel characters",
      "Correctly pronounce each vowel sound",
      "Understand the relationship between N'Ko vowels and IPA symbols",
      "Write basic vowel characters"
    ],
    sections: [
      {
        title: "Introduction to N'Ko Vowels",
        content: `
          The N'Ko alphabet has seven vowels, representing the seven basic vowel sounds found in Manding languages.
          
          Unlike many other writing systems, N'Ko has a unique character for each vowel sound, making it very precise for representing pronunciation.
          
          In this lesson, we'll learn each vowel, its pronunciation, and how to write it.
        `,
        audioPrompt: "intro-vowels"
      },
      {
        title: "The Seven Vowels",
        content: `
          Here are the seven vowels of the N'Ko alphabet. Listen to the pronunciation of each and practice saying them aloud.
          
          Pay careful attention to the mouth position for each vowel sound.
        `,
        nkoText: "ߊ ߋ ߌ ߍ ߎ ߏ ߐ",
        pronunciation: "a e i ɛ u o ɔ",
        latinTransliteration: "a e i è u o ò",
        audioPrompt: "vowel-list"
      },
      {
        title: "Vowel Details: ߊ (a)",
        content: `
          The first vowel in the N'Ko alphabet is ߊ, which represents the "a" sound as in "father" or "car".
          
          It is written with a single vertical stroke with a hook at the top.
          
          To write it:
          1. Start at the top with the hook facing right
          2. Draw a straight line downward
        `,
        nkoText: "ߊ",
        pronunciation: "a (as in 'father')",
        latinTransliteration: "a",
        audioPrompt: "vowel-a",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'a' sound:",
            options: ["ߊ", "ߋ", "ߌ", "ߍ"],
            correctAnswer: 0,
            explanation: "ߊ is the character that represents the 'a' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Details: ߋ (e)",
        content: `
          The second vowel is ߋ, which represents the "e" sound as in "day" or "may" (but without the glide).
          
          It looks like a vertical line with a small loop on the right side.
          
          To write it:
          1. Start at the top
          2. Draw a vertical line downward
          3. Add a small loop extending to the right in the middle
        `,
        nkoText: "ߋ",
        pronunciation: "e (as in 'day')",
        latinTransliteration: "e",
        audioPrompt: "vowel-e",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'e' sound:",
            options: ["ߊ", "ߋ", "ߌ", "ߍ"],
            correctAnswer: 1,
            explanation: "ߋ is the character that represents the 'e' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Details: ߌ (i)",
        content: `
          The third vowel is ߌ, which represents the "i" sound as in "machine" or "see".
          
          It looks like a vertical line with a dot on the right side.
          
          To write it:
          1. Start at the top
          2. Draw a vertical line downward
          3. Add a dot to the right of the middle of the line
        `,
        nkoText: "ߌ",
        pronunciation: "i (as in 'machine')",
        latinTransliteration: "i",
        audioPrompt: "vowel-i",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'i' sound:",
            options: ["ߊ", "ߋ", "ߌ", "ߍ"],
            correctAnswer: 2,
            explanation: "ߌ is the character that represents the 'i' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Details: ߍ (ɛ)",
        content: `
          The fourth vowel is ߍ, which represents the "ɛ" sound as in "bet" or "set".
          
          It looks like a vertical line with a horizontal line extending to the right from the middle.
          
          To write it:
          1. Start at the top
          2. Draw a vertical line downward
          3. Add a horizontal line to the right in the middle
        `,
        nkoText: "ߍ",
        pronunciation: "ɛ (as in 'bet')",
        latinTransliteration: "è",
        audioPrompt: "vowel-epsilon",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'ɛ' (as in 'bet') sound:",
            options: ["ߊ", "ߋ", "ߌ", "ߍ"],
            correctAnswer: 3,
            explanation: "ߍ is the character that represents the 'ɛ' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Details: ߎ (u)",
        content: `
          The fifth vowel is ߎ, which represents the "u" sound as in "rude" or "food".
          
          It looks like a vertical line with a small hook at the bottom, resembling a reversed 'j'.
          
          To write it:
          1. Start at the top
          2. Draw a vertical line downward
          3. Curve slightly to the right at the bottom
        `,
        nkoText: "ߎ",
        pronunciation: "u (as in 'food')",
        latinTransliteration: "u",
        audioPrompt: "vowel-u",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'u' sound:",
            options: ["ߎ", "ߏ", "ߐ", "ߊ"],
            correctAnswer: 0,
            explanation: "ߎ is the character that represents the 'u' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Details: ߏ (o)",
        content: `
          The sixth vowel is ߏ, which represents the "o" sound as in "hope" or "go" (but without the glide).
          
          It looks like a vertical line with a small circle attached to the right side.
          
          To write it:
          1. Start at the top
          2. Draw a vertical line downward
          3. Add a small circle to the right in the middle
        `,
        nkoText: "ߏ",
        pronunciation: "o (as in 'hope')",
        latinTransliteration: "o",
        audioPrompt: "vowel-o",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'o' sound:",
            options: ["ߎ", "ߏ", "ߐ", "ߊ"],
            correctAnswer: 1,
            explanation: "ߏ is the character that represents the 'o' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Details: ߐ (ɔ)",
        content: `
          The seventh vowel is ߐ, which represents the "ɔ" sound as in "thought" or "caught".
          
          It looks like a vertical line with a diagonal line extending to the right from the middle.
          
          To write it:
          1. Start at the top
          2. Draw a vertical line downward
          3. Add a diagonal line extending down and to the right from the middle
        `,
        nkoText: "ߐ",
        pronunciation: "ɔ (as in 'thought')",
        latinTransliteration: "ò",
        audioPrompt: "vowel-open-o",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'ɔ' (as in 'thought') sound:",
            options: ["ߎ", "ߏ", "ߐ", "ߊ"],
            correctAnswer: 2,
            explanation: "ߐ is the character that represents the 'ɔ' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Comparison",
        content: `
          Let's compare all the vowels together. Notice the similarities and differences in their shapes.
          
          The N'Ko vowels are designed with consistent elements that make them easy to distinguish:
          
          - All have a vertical stroke
          - They differ in the attachments to the basic vertical stroke
          - The design is systematic, making them easier to learn and remember
        `,
        nkoText: "ߊ ߋ ߌ ߍ ߎ ߏ ߐ",
        pronunciation: "a e i ɛ u o ɔ",
        latinTransliteration: "a e i è u o ò",
        audioPrompt: "vowel-comparison",
        exercises: [
          {
            type: "matching",
            question: "Match each N'Ko vowel with its sound:",
            pairs: [
              { a: "ߊ", b: "a as in father" },
              { a: "ߋ", b: "e as in day" },
              { a: "ߌ", b: "i as in machine" },
              { a: "ߍ", b: "ɛ as in bet" },
              { a: "ߎ", b: "u as in food" },
              { a: "ߏ", b: "o as in hope" },
              { a: "ߐ", b: "ɔ as in thought" }
            ],
            explanation: "Each N'Ko vowel character represents a specific vowel sound."
          }
        ]
      },
      {
        title: "Practice Recognition",
        content: `
          Now let's practice recognizing all seven vowels.
          
          Take your time and get comfortable identifying each one.
        `,
        exercises: [
          {
            type: "multiple-choice",
            question: "Which vowel is this? ߋ",
            options: ["a", "e", "i", "ɛ"],
            correctAnswer: 1,
            explanation: "This is ߋ, which represents the 'e' sound as in 'day'."
          },
          {
            type: "multiple-choice",
            question: "Which vowel is this? ߐ",
            options: ["u", "o", "ɔ", "a"],
            correctAnswer: 2,
            explanation: "This is ߐ, which represents the 'ɔ' sound as in 'thought'."
          },
          {
            type: "multiple-choice",
            question: "Which vowel is this? ߌ",
            options: ["e", "i", "ɛ", "o"],
correctAnswer: 1,
            explanation: "This is ߌ, which represents the 'i' sound as in 'machine'."
          },
          {
            type: "fill-blank",
            question: "The vowel ߎ represents the sound 'u' as in _____.",
            correctAnswer: "food",
            acceptableAnswers: ["food", "rude", "moon", "blue"],
            explanation: "ߎ represents the 'u' sound as in English words like 'food', 'rude', 'moon', etc."
          }
        ]
      }
    ],
    quizQuestions: [
      {
        question: "Which N'Ko character represents the 'a' sound?",
        options: ["ߊ", "ߋ", "ߌ", "ߍ"],
        correctAnswer: 0,
        explanation: "ߊ represents the 'a' sound in N'Ko."
      },
      {
        question: "How many vowels are in the N'Ko alphabet?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 2,
        explanation: "The N'Ko alphabet has 7 vowels."
      },
      {
        question: "Which sound does ߍ represent?",
        options: ["e as in day", "i as in machine", "ɛ as in bet", "o as in hope"],
        correctAnswer: 2,
        explanation: "ߍ represents the 'ɛ' sound as in 'bet'."
      },
      {
        question: "Which is NOT a vowel in the N'Ko alphabet?",
        options: ["ߊ", "ߖ", "ߏ", "ߐ"],
        correctAnswer: 1,
        explanation: "ߖ is not a vowel; it's a consonant in the N'Ko alphabet."
      },
      {
        question: "Which vowel represents the 'o' sound as in 'hope'?",
        options: ["ߎ", "ߏ", "ߐ", "ߊ"],
        correctAnswer: 1,
        explanation: "ߏ represents the 'o' sound as in 'hope'."
      }
    ],
    summary: `
      In this lesson, you've learned all seven vowels of the N'Ko alphabet:
      
      - ߊ (a) as in "father"
      - ߋ (e) as in "day"
      - ߌ (i) as in "machine"
      - ߍ (ɛ) as in "bet"
      - ߎ (u) as in "food"
      - ߏ (o) as in "hope"
      - ߐ (ɔ) as in "thought"
      
      You can now recognize these vowels, understand their sounds, and know the basics of how to write them.
      
      In the next lesson, you'll learn the first group of consonants in the N'Ko alphabet and start combining them with vowels to form syllables.
    `,
    vocabulary: [
      {
        nko: "ߊ",
        latin: "a",
        english: "a (vowel)",
        french: "a (voyelle)"
      },
      {
        nko: "ߋ",
        latin: "e",
        english: "e (vowel)",
        french: "é (voyelle)"
      },
      {
        nko: "ߌ",
        latin: "i",
        english: "i (vowel)",
        french: "i (voyelle)"
      },
      {
        nko: "ߍ",
        latin: "ɛ",
        english: "è (vowel)",
        french: "è (voyelle)"
      },
      {
        nko: "ߎ",
        latin: "u",
        english: "u (vowel)",
        french: "ou (voyelle)"
      },
      {
        nko: "ߏ",
        latin: "o",
        english: "o (vowel)",
        french: "o (voyelle)"
      },
      {
        nko: "ߐ",
        latin: "ɔ",
        english: "ò (vowel)",
        french: "ô (voyelle)"
      }
    ]
  }
};

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/seed/lessons/beginner/nko-history.ts
export const nkoHistoryLesson = {
  id: "nko-history",
  title: "History of N'Ko",
  description: "Learn about the creation and history of the N'Ko writing system",
  level: "beginner",
  module: "intro-to-nko",
  moduleOrder: 1,
  order: 1,
  duration: 15,
  prerequisites: [],
  topics: ["history", "writing system", "cultural context"],
  content: {
    objectives: [
      "Understand who created the N'Ko alphabet and why",
      "Learn about the cultural significance of N'Ko",
      "Recognize the historical context of N'Ko's development",
      "Appreciate the purpose and goals of the N'Ko writing system"
    ],
    sections: [
      {
        title: "The Creator of N'Ko",
        content: `
          The N'Ko alphabet was created by Solomana Kanté, a Guinean writer and educator, in 1949.
          
          Kanté was concerned about the declining literacy rates in West Africa and believed that teaching people to read and write in their native Manding languages would be more effective than using foreign scripts or languages.
          
          After years of research and development, he unveiled the N'Ko script, designed specifically for Manding languages.
        `,
        audioPrompt: "creator-nko"
      },
      {
        title: "The Meaning of N'Ko",
        content: `
          The name "N'Ko" means "I say" in all Manding languages.
          
          This name was chosen to emphasize the importance of self-expression and communication in one's native language.
          
          The script was designed to be a unifying writing system for speakers of Manding languages across West Africa, including Bambara, Dyula, Malinké, and Mandinka.
        `,
        audioPrompt: "meaning-nko",
        exercises: [
          {
            type: "multiple-choice",
            question: "What does the name 'N'Ko' mean?",
            options: ["I write", "I say", "Our language", "My people"],
            correctAnswer: 1,
            explanation: "The name 'N'Ko' means 'I say' in all Manding languages, emphasizing self-expression in one's native tongue."
          }
        ]
      },
      {
        title: "Purpose and Design",
        content: `
          Kanté designed N'Ko with several goals in mind:
          
          - To create a script that could accurately represent all the sounds in Manding languages
          - To develop a tool for preserving traditional knowledge and literature
          - To increase literacy rates by making reading and writing more accessible
          - To empower speakers of Manding languages to document their own history and culture
          
          The N'Ko script is written from right to left, contains 27 letters (including 7 vowels and 20 consonants), and includes various punctuation marks and numerals.
        `,
        audioPrompt: "purpose-design",
        exercises: [
          {
            type: "multiple-choice",
            question: "In which direction is N'Ko written?",
            options: ["Left to right", "Right to left", "Top to bottom", "Bottom to top"],
            correctAnswer: 1,
            explanation: "N'Ko is written from right to left, unlike Latin-based writing systems."
          }
        ]
      },
      {
        title: "The Spread of N'Ko",
        content: `
          After its creation, N'Ko gradually spread across West Africa, particularly in Guinea, Mali, Côte d'Ivoire, and neighboring countries.
          
          N'Ko literacy centers were established to teach the script, and a growing body of literature, newspapers, and educational materials were produced in N'Ko.
          
          The spread of N'Ko was largely a grassroots movement, driven by the dedication of teachers and scholars committed to promoting literacy in Manding languages.
          
          Today, N'Ko continues to be taught and used, with growing interest and support from governments, educational institutions, and international organizations.
        `,
        audioPrompt: "spread-nko",
        exercises: [
          {
            type: "multiple-choice",
            question: "How did N'Ko primarily spread throughout West Africa?",
            options: [
              "Through government mandates", 
              "Via colonial education systems", 
              "Through grassroots movements and literacy centers", 
              "By commercial publishers"
            ],
            correctAnswer: 2,
            explanation: "N'Ko spread primarily through grassroots movements and dedicated literacy centers established by teachers and scholars."
          }
        ]
      },
      {
        title: "Cultural Significance",
        content: `
          The N'Ko script is more than just a writing system; it represents cultural pride, identity, and intellectual independence for many Manding speakers.
          
          By allowing people to read and write in their native language, N'Ko has played a role in preserving oral traditions, historical knowledge, and cultural practices.
          
          N'Ko has also facilitated the documentation of traditional medicine, agriculture, philosophy, and other knowledge systems that might otherwise be lost.
          
          The creation and use of N'Ko is seen as an act of cultural reclamation and empowerment in the post-colonial context of West Africa.
        `,
        audioPrompt: "cultural-significance",
        exercises: [
          {
            type: "multiple-choice",
            question: "What broader cultural significance does N'Ko have beyond being a writing system?",
            options: [
              "It's mainly a decorative script for art", 
              "It represents cultural pride and intellectual independence", 
              "It's primarily used for religious texts", 
              "It's mainly used for government documents"
            ],
            correctAnswer: 1,
            explanation: "N'Ko represents cultural pride, identity, and intellectual independence for many Manding speakers, serving as a tool for cultural reclamation and empowerment."
          }
        ]
      },
      {
        title: "N'Ko in the Digital Age",
        content: `
          In recent decades, N'Ko has made the transition to digital platforms, with the development of N'Ko fonts, keyboards, and software.
          
          N'Ko was added to the Unicode Standard in 2006, making it possible to use the script in websites, applications, and digital documents.
          
          Online communities, social media groups, and digital resources have emerged to support N'Ko learning and usage.
          
          These technological developments have helped to expand the reach and accessibility of N'Ko, connecting new generations with this important cultural heritage.
        `,
        audioPrompt: "digital-nko",
        exercises: [
          {
            type: "multiple-choice",
            question: "When was N'Ko added to the Unicode Standard?",
            options: ["1996", "2000", "2006", "2012"],
            correctAnswer: 2,
            explanation: "N'Ko was added to the Unicode Standard in 2006, enabling its use in digital platforms and technologies."
          }
        ]
      }
    ],
    quizQuestions: [
      {
        question: "Who created the N'Ko alphabet?",
        options: ["Kwame Nkrumah", "Solomana Kanté", "Léopold Sédar Senghor", "Cheikh Anta Diop"],
        correctAnswer: 1,
        explanation: "Solomana Kanté, a Guinean writer and educator, created the N'Ko alphabet in 1949."
      },
      {
        question: "In what year was the N'Ko alphabet created?",
        options: ["1929", "1949", "1969", "1989"],
        correctAnswer: 1,
        explanation: "The N'Ko alphabet was created in 1949 by Solomana Kanté."
      },
      {
        question: "How many letters are in the N'Ko alphabet?",
        options: ["21", "24", "27", "30"],
        correctAnswer: 2,
        explanation: "The N'Ko alphabet contains 27 letters, including 7 vowels and 20 consonants."
      },
      {
        question: "What was one of the primary purposes for creating N'Ko?",
        options: [
          "To replace French as the official language", 
          "To increase literacy by teaching in native languages", 
          "To create a secret writing system", 
          "To simplify the existing writing systems"
        ],
        correctAnswer: 1,
        explanation: "A primary purpose of N'Ko was to increase literacy rates by allowing people to learn reading and writing in their native Manding languages."
      },
      {
        question: "Which of these countries is NOT mentioned as a place where N'Ko spread?",
        options: ["Guinea", "Mali", "Senegal", "Côte d'Ivoire"],
        correctAnswer: 2,
        explanation: "The text mentions that N'Ko spread in Guinea, Mali, Côte d'Ivoire, and neighboring countries, but Senegal is not specifically mentioned."
      }
    ],
    summary: `
      In this lesson, you've learned about the history and significance of the N'Ko writing system:
      
      - N'Ko was created in 1949 by Solomana Kanté, a Guinean educator
      - The name "N'Ko" means "I say" in Manding languages
      - N'Ko was designed to accurately represent Manding languages and increase literacy
      - The script is written from right to left and contains 27 letters
      - N'Ko spread through grassroots movements across West Africa
      - The script has significant cultural importance for Manding speakers
      - N'Ko has successfully transitioned to the digital age
      
      Understanding the history and purpose of N'Ko provides important context for learning the script. In the next lessons, you'll begin to learn the alphabet itself, starting with the basics of the writing system.
    `,
    vocabulary: [
      {
        nko: "ߒߞߏ",
        latin: "N'ko",
        english: "I say",
        french: "Je dis"
      },
      {
        nko: "ߛߟߏߡߊߣߊ ߞߊ߲ߕߍ",
        latin: "Solomana Kanté",
        english: "Creator of N'Ko",
        french: "Créateur de N'Ko"
      },
      {
        nko: "ߞߊ߬ߙߊ߲",
        latin: "karan",
        english: "to read/study",
        french: "lire/étudier"
      },
      {
        nko: "ߛߓߍ",
        latin: "sɛbɛ",
        english: "writing/to write",
        french: "écriture/écrire"
      },
      {
        nko: "ߡߊ߲ߘߋ߲",
        latin: "Manden",
        english: "Manding",
        french: "Mandingue"
      },
      {
        nko: "ߞߊ߲",
        latin: "kan",
        english: "language",
        french: "langue"
      },
      {
        nko: "ߓߊߓߊ",
        latin: "baba",
        english: "alphabet",
        french: "alphabet"
      }
    ]
  }
};

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/utils/object-id.ts
/**
 * A lightweight implementation of MongoDB's ObjectId
 * that doesn't require the MongoDB package
 */
export class ObjectId {
  private static counter = Math.floor(Math.random() * 0xffffff);
  
  /**
   * Generates a MongoDB-compatible ObjectId string
   */
  static generate(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
    const machineId = this.randomByte(3);
    const processId = this.randomByte(2);
    const counter = (this.counter++).toString(16).padStart(6, '0');
    
    return timestamp + machineId + processId + counter;
  }
  
  /**
   * Generates random bytes as hex string
   */
  private static randomByte(size: number): string {
    const bytes = [];
    for (let i = 0; i < size; i++) {
      bytes.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
    }
    return bytes.join('');
  }
  
  /**
   * Validates if a string is a valid ObjectId
   */
  static isValid(id: string): boolean {
    return /^[0-9a-f]{24}$/.test(id);
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/lesson-loader/lesson-loader.ts
import path from 'path';
import fs from 'fs';
import { ParsedLesson, parseLessonMarkdown } from './markdown-parser';
import { getMongoDatabaseId } from '../db/id-mapping-store';
import { prisma } from '@/lib/db/prisma';

export async function loadLessonById(id: string): Promise<ParsedLesson | null> {
  // Look for lesson in multiple locations
  const possiblePaths = [
    `src/content/lessons/beginner/${id}/lesson.md`,
    `src/content/lessons/intermediate/${id}/lesson.md`,
    `src/content/lessons/advanced/${id}/lesson.md`,
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(path.resolve(process.cwd(), filePath))) {
      return await parseLessonMarkdown(filePath);
    }
  }
  
  return null;
}

export async function getAllLessons(): Promise<ParsedLesson[]> {
  const levels = ['beginner', 'intermediate', 'advanced'];
  const allLessons: ParsedLesson[] = [];
  
  for (const level of levels) {
    const levelPath = path.resolve(process.cwd(), `src/content/lessons/${level}`);
    
    if (fs.existsSync(levelPath)) {
      const lessonFolders = fs.readdirSync(levelPath);
      
      for (const folder of lessonFolders) {
        const lessonPath = path.join(levelPath, folder, 'lesson.md');
        
        if (fs.existsSync(lessonPath)) {
          const lesson = await parseLessonMarkdown(lessonPath);
          allLessons.push(lesson);
        }
      }
    }
  }
  
  // Sort by order
  return allLessons.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export async function syncLessonToDatabase(lesson: ParsedLesson): Promise<void> {
  try {
    const mongoId = getMongoDatabaseId(lesson.id);
    
    // Convert lesson to database format
    const lessonData = {
      id: mongoId,
      title: lesson.frontmatter.title,
      description: lesson.frontmatter.description,
      level: lesson.frontmatter.level,
      module: lesson.frontmatter.module,
      moduleOrder: lesson.frontmatter.moduleOrder,
      order: lesson.frontmatter.order,
      duration: lesson.frontmatter.duration,
      content: {
        sections: lesson.sections.map(section => ({
          title: section.title,
          content: section.html,
          exercises: section.exercises || []
        })),
        quizQuestions: lesson.quiz.questions,
        summary: lesson.summary,
        vocabulary: lesson.vocabulary
      },
      objectives: extractObjectives(lesson),
      prerequisites: lesson.frontmatter.prerequisites,
      topics: lesson.frontmatter.topics
    };
    
    // Upsert to database
    await prisma.nkoLesson.upsert({
      where: { id: mongoId },
      update: lessonData,
      create: lessonData
    });
    
    console.log(`Synced lesson ${lesson.id} to database`);
  } catch (error) {
    console.error(`Error syncing lesson ${lesson.id} to database:`, error);
  }
}

function extractObjectives(lesson: ParsedLesson): string[] {
  // Look for the learning objectives section
  const objectivesSection = lesson.sections.find(
    section => section.title.toLowerCase().includes('learning objectives')
  );
  
  if (!objectivesSection) return [];
  
  // Extract list items from the section
  const listItemRegex = /<li>(.*?)<\/li>/g;
  const objectives: string[] = [];
  
  let match;
  while ((match = listItemRegex.exec(objectivesSection.html)) !== null) {
    objectives.push(match[1].trim());
  }
  
  return objectives;
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/lesson-loader/markdown-parser.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

export interface LessonFrontmatter {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  module: string;
  moduleOrder: number;
  order: number;
  duration: number;
  prerequisites: string[];
  topics: string[];
}

export interface ParsedLesson {
  id: string;
  frontmatter: LessonFrontmatter;
  htmlContent: string;
  sections: {
    title: string;
    html: string;
    exercises?: {
      question: string;
      options?: string[];
      correctAnswer?: number | string;
      explanation?: string;
    }[];
  }[];
  quiz: {
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }[];
  };
  summary: string;
  vocabulary: {
    nko: string;
    latin: string;
    english: string;
    french: string;
  }[];
}

export async function parseLessonMarkdown(filePath: string): Promise<ParsedLesson> {
  const fullPath = path.resolve(process.cwd(), filePath);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Parse frontmatter
  const { data, content } = matter(fileContents);
  const frontmatter = data as LessonFrontmatter;

  // Convert Markdown to HTML
  const processedContent = await remark()
    .use(remarkGfm) // Support tables, strikethrough, etc.
    .use(html, { sanitize: false }) // Convert markdown to HTML
    .process(content);
  
  const htmlContent = processedContent.toString();

  // Split content into sections
  const sectionRegex = /<h2>(.*?)<\/h2>([\s\S]*?)(?=<h2>|<h1>|$)/g;
  const sections: { title: string; html: string; exercises?: any[] }[] = [];
  
  let match;
  while ((match = sectionRegex.exec(htmlContent)) !== null) {
    const sectionTitle = match[1];
    const sectionContent = match[2];
    
    // Extract exercises from section content
    const exercises = extractExercises(sectionContent);
    
    sections.push({
      title: sectionTitle,
      html: sectionContent,
      exercises: exercises.length > 0 ? exercises : undefined
    });
  }

  // Extract quiz questions
  const quizSection = sections.find(section => section.title.toLowerCase().includes('quiz'));
  const quiz = quizSection ? {
    questions: extractExercises(quizSection.html)
  } : { questions: [] };

  // Extract summary
  const summarySection = sections.find(section => section.title.toLowerCase().includes('summary'));
  const summary = summarySection ? summarySection.html : '';

  // Extract vocabulary
  const vocabularySection = sections.find(section => section.title.toLowerCase().includes('vocabulary'));
  const vocabulary = vocabularySection ? extractVocabulary(vocabularySection.html) : [];

  return {
    id: frontmatter.id,
    frontmatter,
    htmlContent,
    sections,
    quiz,
    summary,
    vocabulary
  };
}

function extractExercises(html: string): any[] {
  const exerciseRegex = /<p><strong>Question:(.*?)<\/strong><\/p>([\s\S]*?)(?=<p><strong>Question:|<h|$)/g;
  const exercises = [];
  
  let match;
  while ((match = exerciseRegex.exec(html)) !== null) {
    const question = match[1].trim();
    const content = match[2];
    
    // Check if it's a multiple choice question
    const optionsMatch = content.match(/<li>\[([ x])\](.*?)<\/li>/g);
    
    if (optionsMatch) {
      const options = optionsMatch.map(option => {
        const text = option.match(/<li>\[([ x])\](.*?)<\/li>/);
        return text ? text[2].trim() : '';
      });
      
      const correctAnswerIndex = optionsMatch.findIndex(option => option.includes('[x]'));
      
      // Look for explanation
      const explanation = content.match(/<p><strong>Explanation:<\/strong>(.*?)<\/p>/);
      
      exercises.push({
        question,
        options,
        correctAnswer: correctAnswerIndex !== -1 ? correctAnswerIndex : 0,
        explanation: explanation ? explanation[1].trim() : undefined
      });
    } else {
      // It might be a fill-in-the-blank or matching question
      // Handle those cases if needed
      exercises.push({
        question,
        content
      });
    }
  }
  
  return exercises;
}

function extractVocabulary(html: string): any[] {
  const vocabulary = [];
  
  // Extract table rows
  const tableRowRegex = /<tr>([\s\S]*?)<\/tr>/g;
  let match;
  
  let isHeader = true;
  while ((match = tableRowRegex.exec(html)) !== null) {
    if (isHeader) {
      isHeader = false;
      continue; // Skip header row
    }
    
    const cellRegex = /<td>([\s\S]*?)<\/td>/g;
    const cells = [];
    
    let cellMatch;
    while ((cellMatch = cellRegex.exec(match[1])) !== null) {
      cells.push(cellMatch[1].trim());
    }
    
    if (cells.length >= 4) {
      vocabulary.push({
        nko: cells[0],
        latin: cells[1],
        english: cells[2],
        french: cells[3]
      });
    }
  }
  
  return vocabulary;
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/db/id-mapping-store.ts
import { ObjectId } from '../utils/object-id';

// Map to store string IDs to MongoDB-compatible IDs
const idMappings: Record<string, string> = {};

/**
 * Get MongoDB-compatible ID for a string ID
 */
export function getMongoDbId(stringId: string): string {
  if (!idMappings[stringId]) {
    idMappings[stringId] = ObjectId.generate();
  }
  return idMappings[stringId];
}

/**
 * Get string ID for a MongoDB ID
 */
export function getStringId(mongoId: string): string | undefined {
  for (const [stringId, mappedMongoId] of Object.entries(idMappings)) {
    if (mappedMongoId === mongoId) {
      return stringId;
    }
  }
  return undefined;
}

/**
 * Get all ID mappings
 */
export function getAllMappings(): Record<string, string> {
  return { ...idMappings };
}

// Pre-define some mappings for common lesson IDs
[
  "nko-history",
  "writing-system-basics",
  "nko-modern-world",
  "alphabet-vowels",
  "alphabet-consonants-1",
  "alphabet-consonants-2",
  "nasalized-vowels",
  "tone-marks",
  "hand-positioning",
  "letterforms",
  "digital-input",
  "connected-forms",
  "greetings-introductions",
  "numbers-counting",
  "time-expressions",
  "common-objects",
  "family-relationships",
  "food-dining",
  "travel-transportation",
  "work-education"
].forEach(id => getMongoDbId(id));

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/lessons/content-generator.ts
import { Anthropic } from '@anthropic-ai/sdk';

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

type LessonContentType = {
  sections: {
    title: string;
    content: string;
    nkoText?: string;
    pronunciation?: string;
    latinTransliteration?: string;
    exercises?: {
      type: 'multiple-choice' | 'fill-blank' | 'matching' | 'recognition';
      question: string;
      options?: string[];
      correctAnswer: string | number;
      explanation?: string;
    }[];
    audioPrompt?: string;
  }[];
  quizQuestions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  summary: string;
  vocabulary: {
    nko: string;
    latin: string;
    english: string;
    french: string;
  }[];
};

export async function generateLessonContent(
  lessonId: string,
  lessonTitle: string,
  lessonDescription: string
): Promise<LessonContentType> {
  try {
    // For alphabet-vowels lesson, return pre-built content to avoid API call
    if (lessonId === 'alphabet-vowels') {
      return getVowelsLessonContent();
    }
    
    // For alphabet-consonants-1 lesson, return pre-built content
    if (lessonId === 'alphabet-consonants-1') {
      return getConsonantsLessonContent();
    }
    
    // For other lessons, generate with Claude
    const prompt = `
You are an expert N'Ko language teacher and curriculum designer. I need you to create detailed content for the following N'Ko language lesson:

Lesson Title: ${lessonTitle}
Lesson Description: ${lessonDescription}
Lesson ID: ${lessonId}

Please create comprehensive lesson content with the following structure:

1. Multiple educational sections, each containing:
   - Section title
   - Educational content (with proper N'Ko script when relevant)
   - Latin transliteration when N'Ko script is used
   - Pronunciation guidance
   - 2-3 practice exercises for each section

2. 5-7 quiz questions for the entire lesson with:
   - Question text
   - 4 multiple choice options
   - Index of correct answer (0-3)
   - Explanation of the answer

3. A concise lesson summary

4. A vocabulary list with:
   - N'Ko script
   - Latin transliteration
   - English translation
   - French translation

Format your response as a JSON object exactly matching this structure:
{
  "sections": [
    {
      "title": "Section Title",
      "content": "Educational text...",
      "nkoText": "N'Ko script example if relevant",
      "pronunciation": "Pronunciation guide if relevant",
      "latinTransliteration": "Latin transliteration if relevant",
      "exercises": [
        {
          "type": "multiple-choice",
          "question": "Exercise question",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": 0,
          "explanation": "Explanation of correct answer"
        }
      ],
      "audioPrompt": "Text describing what should be in the audio"
    }
  ],
  "quizQuestions": [
    {
      "question": "Quiz question",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "Explanation of correct answer"
    }
  ],
  "summary": "Lesson summary text",
  "vocabulary": [
    {
      "nko": "N'Ko word",
      "latin": "Latin transliteration",
      "english": "English translation",
      "french": "French translation"
    }
  ]
}

Make sure that ALL N'Ko script is accurate.
Include proper educational progression within sections.
Ensure exercises test understanding incrementally, from recognition to production.
`;

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    // Extract the JSON from Claude's response
    const responseText = response.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    
    try {
      return JSON.parse(jsonStr) as LessonContentType;
    } catch (error) {
      console.error("Error parsing lesson content:", error);
      console.log("Raw response:", responseText);
      // Return a basic fallback lesson
      return createFallbackLesson(lessonTitle, lessonDescription);
    }
  } catch (error) {
    console.error("Error generating lesson content:", error);
    return createFallbackLesson(lessonTitle, lessonDescription);
  }
}

function createFallbackLesson(title: string, description: string): LessonContentType {
  return {
    sections: [
      {
        title: "Introduction",
        content: `Welcome to the lesson on ${title}. ${description}`,
        exercises: [
          {
            type: "multiple-choice",
            question: "What will you learn in this lesson?",
            options: [
              `About ${title}`,
              "French grammar",
              "Chinese characters",
              "Programming"
            ],
            correctAnswer: 0,
            explanation: `This lesson focuses on ${title}.`
          }
        ]
      }
    ],
    quizQuestions: [
      {
        question: `What is the main focus of this lesson?`,
        options: [
          `${title}`,
          "Spanish vocabulary",
          "Mathematics",
          "Geography"
        ],
        correctAnswer: 0,
        explanation: `This lesson is primarily about ${title}.`
      }
    ],
    summary: `This lesson introduces you to ${title}. ${description}`,
    vocabulary: [
      {
        nko: "ߝߏ߬ߟߌ߬ߟߊ",
        latin: "folila",
        english: "Example word",
        french: "Mot d'exemple"
      }
    ]
  };
}

function getVowelsLessonContent(): LessonContentType {
  return {
    sections: [
      {
        title: "Introduction to N'Ko Vowels",
        content: "The N'Ko alphabet has 7 vowels, which are written from right to left. Each vowel has a distinct sound, and they are the foundation of N'Ko pronunciation.",
        exercises: [
          {
            type: "multiple-choice",
            question: "How many vowels are there in the N'Ko alphabet?",
            options: ["5", "6", "7", "8"],
            correctAnswer: 2,
            explanation: "The N'Ko alphabet contains 7 vowels."
          }
        ]
      },
      {
        title: "The First Three Vowels: ߊ, ߋ, ߌ",
        content: "Let's learn the first three vowels in the N'Ko alphabet.",
        nkoText: "ߊ, ߋ, ߌ",
        pronunciation: "a, e, i",
        latinTransliteration: "a, e, i",
        exercises: [
          {
            type: "matching",
            question: "Match the N'Ko vowel with its pronunciation",
            options: ["ߊ - a", "ߋ - e", "ߌ - i", "ߊ - i"],
            correctAnswer: 0,
            explanation: "ߊ is pronounced as 'a', ߋ is pronounced as 'e', and ߌ is pronounced as 'i'."
          }
        ],
        audioPrompt: "Pronunciation of the vowels ߊ (a), ߋ (e), ߌ (i)"
      },
      {
        title: "The Next Two Vowels: ߍ, ߎ",
        content: "Now let's learn two more vowels in the N'Ko alphabet.",
        nkoText: "ߍ, ߎ",
        pronunciation: "ɛ, u",
        latinTransliteration: "ɛ, u",
        exercises: [
          {
            type: "recognition",
            question: "Which of these is the N'Ko vowel 'ɛ'?",
            options: ["ߊ", "ߍ", "ߌ", "ߎ"],
            correctAnswer: 1,
            explanation: "ߍ is the N'Ko vowel that represents the sound 'ɛ'."
          }
        ],
        audioPrompt: "Pronunciation of the vowels ߍ (ɛ), ߎ (u)"
      },
      {
        title: "The Final Two Vowels: ߏ, ߐ",
        content: "Let's complete our study of N'Ko vowels with the final two.",
        nkoText: "ߏ, ߐ",
        pronunciation: "o, ɔ",
        latinTransliteration: "o, ɔ",
        exercises: [
          {
            type: "fill-blank",
            question: "The N'Ko vowel ߐ is pronounced as ___.",
            options: ["a", "e", "o", "ɔ"],
            correctAnswer: 3,
            explanation: "The vowel ߐ is pronounced as 'ɔ' as in 'ought' in English."
          }
        ],
        audioPrompt: "Pronunciation of the vowels ߏ (o), ߐ (ɔ)"
      },
      {
        title: "Vowel Combinations and Practice",
        content: "Now let's practice identifying and pronouncing all seven vowels together.",
        nkoText: "ߊ ߋ ߌ ߍ ߎ ߏ ߐ",
        pronunciation: "a e i ɛ u o ɔ",
        latinTransliteration: "a e i ɛ u o ɔ",
        exercises: [
          {
            type: "multiple-choice",
            question: "Which sequence correctly lists all N'Ko vowels in order?",
            options: [
              "ߊ ߋ ߌ ߍ ߎ ߏ ߐ",
              "ߐ ߏ ߎ ߍ ߌ ߋ ߊ",
              "ߊ ߌ ߋ ߍ ߏ ߎ ߐ",
              "ߊ ߋ ߌ ߎ ߍ ߏ ߐ"
            ],
            correctAnswer: 0,
            explanation: "The correct order of N'Ko vowels is ߊ (a), ߋ (e), ߌ (i), ߍ (ɛ), ߎ (u), ߏ (o), ߐ (ɔ)."
          }
        ],
        audioPrompt: "Pronunciation of all seven vowels in sequence: ߊ ߋ ߌ ߍ ߎ ߏ ߐ"
      }
    ],
    quizQuestions: [
      {
        question: "How many vowels does the N'Ko alphabet have?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 2,
        explanation: "The N'Ko alphabet has 7 vowels."
      },
      {
        question: "Which N'Ko vowel represents the sound 'a'?",
        options: ["ߋ", "ߊ", "ߌ", "ߏ"],
        correctAnswer: 1,
        explanation: "ߊ represents the 'a' sound in N'Ko."
      },
      {
        question: "Which N'Ko vowel represents the sound 'u'?",
        options: ["ߌ", "ߍ", "ߎ", "ߐ"],
        correctAnswer: 2,
        explanation: "ߎ represents the 'u' sound in N'Ko."
      },
      {
        question: "What is the correct pronunciation of ߏ?",
        options: ["a", "e", "i", "o"],
        correctAnswer: 3,
        explanation: "ߏ is pronounced as 'o' in N'Ko."
      },
      {
        question: "Which of these is NOT a vowel in N'Ko?",
        options: ["ߊ", "ߋ", "ߒ", "ߐ"],
        correctAnswer: 2,
        explanation: "ߒ is not a vowel in N'Ko. It's actually the first person singular pronoun (I/me)."
      }
    ],
    summary: "In this lesson, you've learned all seven vowels of the N'Ko alphabet: ߊ (a), ߋ (e), ߌ (i), ߍ (ɛ), ߎ (u), ߏ (o), and ߐ (ɔ). You've practiced identifying them visually and learned their pronunciations. These vowels form the foundation of N'Ko writing and pronunciation.",
    vocabulary: [
      {
        nko: "ߊ",
        latin: "a",
        english: "a (as in 'father')",
        french: "a (comme dans 'papa')"
      },
      {
        nko: "ߋ",
        latin: "e",
        english: "e (as in 'day')",
        french: "é (comme dans 'été')"
      },
      {
        nko: "ߌ",
        latin: "i",
        english: "i (as in 'machine')",
        french: "i (comme dans 'midi')"
      },
      {
        nko: "ߍ",
        latin: "ɛ",
        english: "e (as in 'bed')",
        french: "è (comme dans 'père')"
      },
      {
        nko: "ߎ",
        latin: "u",
        english: "u (as in 'rule')",
        french: "ou (comme dans 'cou')"
      },
      {
        nko: "ߏ",
        latin: "o",
        english: "o (as in 'go')",
        french: "o (comme dans 'mot')"
      },
      {
        nko: "ߐ",
        latin: "ɔ",
        english: "o (as in 'bought')",
        french: "o (comme dans 'or')"
      }
    ]
  };
}

function getConsonantsLessonContent(): LessonContentType {
  return {
    sections: [
      {
        title: "Introduction to N'Ko Consonants (Part 1)",
        content: "N'Ko has 19 consonants in total. In this lesson, we will learn the first 10 consonants. Like the vowels, N'Ko consonants are written from right to left.",
        exercises: [
          {
            type: "multiple-choice",
            question: "How many consonants will we learn in this lesson?",
            options: ["5", "7", "10", "19"],
            correctAnswer: 2,
            explanation: "We will learn the first 10 consonants in this lesson."
          }
        ]
      },
      {
        title: "Consonants: ߓ, ߔ, ߕ",
        content: "Let's start with the first three consonants in the N'Ko alphabet.",
        nkoText: "ߓ, ߔ, ߕ",
        pronunciation: "b, p, t",
        latinTransliteration: "b, p, t",
        exercises: [
          {
            type: "matching",
            question: "Match the N'Ko consonant with its pronunciation",
            options: ["ߓ - b", "ߔ - p", "ߕ - t", "ߓ - p"],
            correctAnswer: 0,
            explanation: "ߓ is pronounced as 'b', ߔ is pronounced as 'p', and ߕ is pronounced as 't'."
          }
        ],
        audioPrompt: "Pronunciation of the consonants ߓ (b), ߔ (p), ߕ (t)"
      },
      {
        title: "Consonants: ߖ, ߗ, ߘ, ߙ",
        content: "Now let's learn four more consonants in the N'Ko alphabet.",
        nkoText: "ߖ, ߗ, ߘ, ߙ",
        pronunciation: "j, ch, d, r",
        latinTransliteration: "j, c, d, r",
        exercises: [
          {
            type: "recognition",
            question: "Which of these is the N'Ko consonant 'd'?",
            options: ["ߖ", "ߗ", "ߘ", "ߙ"],
            correctAnswer: 2,
            explanation: "ߘ is the N'Ko consonant that represents the sound 'd'."
          }
        ],
        audioPrompt: "Pronunciation of the consonants ߖ (j), ߗ (ch), ߘ (d), ߙ (r)"
      },
      {
        title: "Consonants: ߚ, ߛ, ߜ",
        content: "Let's complete our study of the first 10 N'Ko consonants with these three.",
        nkoText: "ߚ, ߛ, ߜ",
        pronunciation: "s, gb, f",
        latinTransliteration: "s, gb, f",
        exercises: [
          {
            type: "fill-blank",
            question: "The N'Ko consonant ߛ is pronounced as ___.",
            options: ["s", "g", "gb", "f"],
            correctAnswer: 2,
            explanation: "The consonant ߛ is pronounced as 'gb', a sound found in many West African languages."
          }
        ],
        audioPrompt: "Pronunciation of the consonants ߚ (s), ߛ (gb), ߜ (f)"
      },
      {
        title: "Practice with Consonants and Vowels",
        content: "Now let's practice combining the consonants we've learned with vowels to form syllables.",
        nkoText: "ߓߊ - ba, ߓߋ - be, ߓߌ - bi, ߘߊ - da, ߘߋ - de, ߘߌ - di",
        pronunciation: "ba, be, bi, da, de, di",
        latinTransliteration: "ba, be, bi, da, de, di",
        exercises: [
          {
            type: "multiple-choice",
            question: "What does ߘߊ represent in N'Ko?",
            options: [
              "ba",
              "da",
              "ga",
              "ma"
            ],
            correctAnswer: 1,
            explanation: "ߘߊ represents 'da' in N'Ko, combining the consonant ߘ (d) with the vowel ߊ (a)."
          }
        ],
        audioPrompt: "Pronunciation of syllables: ߓߊ (ba), ߓߋ (be), ߓߌ (bi), ߘߊ (da), ߘߋ (de), ߘߌ (di)"
      }
    ],
    quizQuestions: [
      {
        question: "How many total consonants are in the N'Ko alphabet?",
        options: ["7", "10", "15", "19"],
        correctAnswer: 3,
        explanation: "The N'Ko alphabet has 19 consonants in total."
      },
      {
        question: "Which N'Ko consonant represents the sound 'b'?",
        options: ["ߓ", "ߔ", "ߕ", "ߖ"],
        correctAnswer: 0,
        explanation: "ߓ represents the 'b' sound in N'Ko."
      },
      {
        question: "Which N'Ko consonant represents the sound 'ch'?",
        options: ["ߖ", "ߗ", "ߘ", "ߙ"],
        correctAnswer: 1,
        explanation: "ߗ represents the 'ch' sound in N'Ko."
      },
      {
        question: "What is the correct pronunciation of ߛ?",
        options: ["s", "j", "f", "gb"],
        correctAnswer: 3,
        explanation: "ߛ is pronounced as 'gb' in N'Ko."
      },
      {
        question: "How would you write 'bi' in N'Ko?",
        options: ["ߓߊ", "ߓߋ", "ߓߌ", "ߓߍ"],
        correctAnswer: 2,
        explanation: "ߓߌ combines the consonant ߓ (b) with the vowel ߌ (i) to create 'bi'."
      }
    ],
    summary: "In this lesson, you've learned the first 10 consonants of the N'Ko alphabet: ߓ (b), ߔ (p), ߕ (t), ߖ (j), ߗ (ch), ߘ (d), ߙ (r), ߚ (s), ߛ (gb), and ߜ (f). You've practiced identifying them visually, learned their pronunciations, and begun combining them with vowels to form syllables.",
    vocabulary: [
      {
        nko: "ߓ",
        latin: "b",
        english: "b (as in 'boy')",
        french: "b (comme dans 'bon')"
      },
      {
        nko: "ߔ",
        latin: "p",
        english: "p (as in 'pen')",
        french: "p (comme dans 'père')"
      },
      {
        nko: "ߕ",
        latin: "t",
        english: "t (as in 'top')",
        french: "t (comme dans 'ton')"
      },
      {
        nko: "ߖ",
        latin: "j",
        english: "j (as in 'jam')",
        french: "dj (comme dans 'djinn')"
      },
      {
        nko: "ߗ",
        latin: "c",
        english: "ch (as in 'church')",
        french: "tch (comme dans 'tchèque')"
      },
      {
        nko: "ߘ",
        latin: "d",
        english: "d (as in 'day')",
        french: "d (comme dans 'dire')"
      },
      {
        nko: "ߙ",
        latin: "r",
        english: "r (rolled r)",
        french: "r (comme dans 'rouge')"
      },
      {
        nko: "ߚ",
        latin: "s",
        english: "s (as in 'sun')",
        french: "s (comme dans 'soleil')"
      },
      {
        nko: "ߛ",
        latin: "gb",
        english: "gb (as in West African languages)",
        french: "gb (comme dans les langues ouest-africaines)"
      },
      {
        nko: "ߜ",
        latin: "f",
        english: "f (as in 'fun')",
        french: "f (comme dans 'fou')"
      }
    ]
  };
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/lessons/lesson-context.tsx
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMongoDatabaseId } from '@/lib/nko/modules/module-definitions';

interface LessonProgress {
  currentSection: number;
  sectionsCompleted: boolean[];
  quizAnswers: number[];
  quizCompleted: boolean;
  lessonCompleted: boolean;
  overallProgress: number;
  lessonId: string;
  mongoLessonId: string; // MongoDB compatible ID
}

interface LessonContextType {
  progress: LessonProgress;
  goToNextSection: () => void;
  goToPreviousSection: () => void;
  goToSection: (sectionIndex: number) => void;
  updateSectionProgress: (sectionIndex: number, completed: boolean) => void;
  updateQuizAnswer: (questionIndex: number, answerIndex: number) => void;
  completeQuiz: () => void;
  completeLesson: () => void;
  saveProgress: () => Promise<void>;
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

interface LessonProviderProps {
  children: React.ReactNode;
  lessonId: string;
  mongoLessonId?: string; // MongoDB compatible ID
  totalSections: number;
  totalQuizQuestions: number;
  initialProgress?: Partial<LessonProgress>;
}

export const LessonProvider: React.FC<LessonProviderProps> = ({
  children,
  lessonId,
  mongoLessonId,
  totalSections,
  totalQuizQuestions,
  initialProgress = {}
}) => {
  // Use provided MongoDB ID or convert the string ID
  const dbLessonId = mongoLessonId || getMongoDatabaseId(lessonId);
  
  const [progress, setProgress] = useState<LessonProgress>({
    currentSection: initialProgress.currentSection || 0,
    sectionsCompleted: initialProgress.sectionsCompleted || Array(totalSections).fill(false),
    quizAnswers: initialProgress.quizAnswers || Array(totalQuizQuestions).fill(-1),
    quizCompleted: initialProgress.quizCompleted || false,
    lessonCompleted: initialProgress.lessonCompleted || false,
    overallProgress: initialProgress.overallProgress || 0,
    lessonId,
    mongoLessonId: dbLessonId
  });

  // Calculate overall progress whenever component state changes
  useEffect(() => {
    const completedSections = progress.sectionsCompleted.filter(Boolean).length;
    const totalSteps = totalSections + 1; // +1 for quiz
    
    let currentProgress = 0;
    
    if (progress.lessonCompleted) {
      currentProgress = 100;
    } else if (progress.quizCompleted) {
      currentProgress = Math.floor((totalSteps - 0.1) / totalSteps * 100);
    } else {
      currentProgress = Math.floor((completedSections / totalSteps) * 100);
    }
    
    setProgress(prev => ({
      ...prev,
      overallProgress: currentProgress
    }));
  }, [
    progress.sectionsCompleted, 
    progress.quizCompleted, 
    progress.lessonCompleted, 
    totalSections
  ]);

  const goToNextSection = () => {
    if (progress.currentSection < totalSections - 1) {
      setProgress(prev => ({
        ...prev,
        currentSection: prev.currentSection + 1
      }));
    }
  };

  const goToPreviousSection = () => {
    if (progress.currentSection > 0) {
      setProgress(prev => ({
        ...prev,
        currentSection: prev.currentSection - 1
      }));
    }
  };

  const goToSection = (sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < totalSections) {
      setProgress(prev => ({
        ...prev,
        currentSection: sectionIndex
      }));
    }
  };

  const updateSectionProgress = (sectionIndex: number, completed: boolean) => {
    if (sectionIndex >= 0 && sectionIndex < totalSections) {
      setProgress(prev => {
        const newSectionsCompleted = [...prev.sectionsCompleted];
        newSectionsCompleted[sectionIndex] = completed;
        return {
          ...prev,
          sectionsCompleted: newSectionsCompleted
        };
      });
    }
  };

  const updateQuizAnswer = (questionIndex: number, answerIndex: number) => {
    if (questionIndex >= 0 && questionIndex < totalQuizQuestions) {
      setProgress(prev => {
        const newQuizAnswers = [...prev.quizAnswers];
        newQuizAnswers[questionIndex] = answerIndex;
        return {
          ...prev,
          quizAnswers: newQuizAnswers
        };
      });
    }
  };

  const completeQuiz = () => {
    setProgress(prev => ({
      ...prev,
      quizCompleted: true
    }));
  };

  const completeLesson = () => {
    setProgress(prev => ({
      ...prev,
      lessonCompleted: true
    }));
  };

  const saveProgress = async () => {
    try {
      // Convert the progress object to the format expected by the API
      const progressData = {
        lessonId: progress.mongoLessonId, // Use MongoDB ID for the API
        progress: progress.overallProgress,
        completed: progress.lessonCompleted,
        sectionsCompleted: progress.sectionsCompleted,
        quizAnswers: progress.quizAnswers,
        quizCompleted: progress.quizCompleted,
        timeSpent: 0, // Would be tracked separately
        lastPosition: progress.currentSection.toString(),
      };

      // Call API to save progress
      const response = await fetch(`/api/nko/lessons/${progress.lessonId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  };

  const contextValue: LessonContextType = {
    progress,
    goToNextSection,
    goToPreviousSection,
    goToSection,
    updateSectionProgress,
    updateQuizAnswer,
    completeQuiz,
    completeLesson,
    saveProgress,
  };

  return (
    <LessonContext.Provider value={contextValue}>
      {children}
    </LessonContext.Provider>
  );
};

export const useLessonContext = () => {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error('useLessonContext must be used within a LessonProvider');
  }
  return context;
};

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/lessons/levels/beginner/alphabet-basics.ts
// src/lib/nko/seed/lessons/beginner/alphabet-basics.ts
export const alphabetBasicsLesson = {
    id: "alphabet-basics",
    title: "Alphabet Basics",
    description: "Learn the N'Ko alphabet and basic characters",
    level: "beginner",
    module: "alphabet-fundamentals",
    moduleOrder: 1,
    order: 1,
    duration: 30,
    prerequisites: [],
    topics: ["alphabet", "basics", "writing system"],
    content: {
      objectives: [
        "Understand the structure of the N'Ko alphabet",
        "Learn about the origins of the writing system",
        "Recognize the basic character types",
        "Understand the direction of writing"
      ],
      sections: [
        {
          title: "Introduction to the N'Ko Alphabet",
          content: `
            The N'Ko alphabet is a writing system designed specifically for Manding languages. Created in 1949 by Guinean writer Solomana Kanté, the script is written from right to left and consists of 27 letters: 7 vowels and 20 consonants.
            
            N'Ko was developed to help increase literacy among speakers of Manding languages in West Africa, including Bambara, Jula, and Mandinka.
            
            In this lesson, we'll introduce you to the basic structure of the alphabet and learn how to recognize its components.
          `,
          audioPrompt: "intro-nko-alphabet"
        },
        {
          title: "Right-to-Left Writing",
          content: `
            N'Ko is written from right to left, unlike Latin script which is written from left to right.
            
            This direction was chosen by Solomana Kanté after careful consideration of various factors, including the natural movement of the hand for right-handed writers.
            
            When writing or reading N'Ko, you start from the right side of the page and move to the left.
          `,
          nkoText: "ߞߊ߲ߕߋ",
          pronunciation: "Kanté (the creator's name)",
          latinTransliteration: "Kante",
          audioPrompt: "right-to-left",
          exercises: [
            {
              type: "multiple-choice",
              question: "In which direction is N'Ko written?",
              options: ["Left to right", "Right to left", "Top to bottom", "Bottom to top"],
              correctAnswer: 1,
              explanation: "N'Ko is written from right to left, unlike Latin script which is written from left to right."
            }
          ]
        },
        {
          title: "Components of the Alphabet",
          content: `
            The N'Ko alphabet consists of the following components:
            
            1. 7 vowels (ߊ, ߋ, ߌ, ߍ, ߎ, ߏ, ߐ)
            2. 20 consonants (including ߓ, ߔ, ߕ, etc.)
            3. Diacritical marks for tone (like ߫, ߬, ߭)
            4. Numbers (߀, ߁, ߂, etc.)
            5. Punctuation marks
            
            Each character in N'Ko represents a specific sound, making it a very phonetic writing system.
          `,
          audioPrompt: "components",
          exercises: [
            {
              type: "multiple-choice",
              question: "How many vowels are in the N'Ko alphabet?",
              options: ["5", "6", "7", "8"],
              correctAnswer: 2,
              explanation: "The N'Ko alphabet contains 7 vowels that represent all the vowel sounds in Manding languages."
            }
          ]
        },
        {
          title: "Basic Character Structure",
          content: `
            Each character in N'Ko has a distinctive shape, but they share some common structural elements:
            
            - Most characters include a vertical stem
            - Various hooks, loops, or extensions differentiate the characters
            - The script has a unified, harmonious appearance
            
            The design of N'Ko is both aesthetic and practical, making it relatively easy to learn and write.
          `,
          nkoText: "ߊ ߓ ߞ",
          pronunciation: "a, b, k",
          latinTransliteration: "a, b, k",
          audioPrompt: "character-structure",
          exercises: [
            {
              type: "multiple-choice",
              question: "What common structural element do most N'Ko characters share?",
              options: ["Horizontal line", "Vertical stem", "Circular shape", "Diamond shape"],
              correctAnswer: 1,
              explanation: "Most N'Ko characters include a vertical stem as their main structural element, with various distinguishing features attached."
            }
          ]
        },
        {
          title: "Learning Approach",
          content: `
            The N'Ko alphabet is typically learned in a structured sequence:
            
            1. First, learners master the vowels
            2. Then, consonants are introduced in groups
            3. Finally, tone marks and special characters are taught
            
            This step-by-step approach helps build confidence and ensures a solid foundation in reading and writing N'Ko.
            
            In the following lessons, we'll follow this approach, starting with the seven vowels in detail.
          `,
          audioPrompt: "learning-approach",
          exercises: [
            {
              type: "multiple-choice",
              question: "According to the recommended learning sequence, what should you learn first in N'Ko?",
              options: ["Consonants", "Vowels", "Tone marks", "Numbers"],
              correctAnswer: 1,
              explanation: "Vowels are typically learned first when studying N'Ko, followed by consonants in groups, and then tone marks and special characters."
            }
          ]
        }
      ],
      quizQuestions: [
        {
          question: "Who created the N'Ko alphabet?",
          options: ["Solomana Kanté", "Kwame Nkrumah", "Leopold Senghor", "Cheikh Anta Diop"],
          correctAnswer: 0,
          explanation: "The N'Ko alphabet was created by Solomana Kanté, a Guinean writer and educator, in 1949."
        },
        {
          question: "In which direction is N'Ko written?",
          options: ["Left to right", "Right to left", "Top to bottom", "Bottom to top"],
          correctAnswer: 1,
          explanation: "N'Ko is written from right to left, unlike Latin script."
        },
        {
          question: "How many total letters are in the N'Ko alphabet?",
          options: ["21", "24", "27", "30"],
          correctAnswer: 2,
          explanation: "The N'Ko alphabet consists of 27 letters: 7 vowels and 20 consonants."
        },
        {
          question: "What year was the N'Ko alphabet created?",
          options: ["1929", "1949", "1969", "1989"],
          correctAnswer: 1,
          explanation: "The N'Ko alphabet was created in 1949 by Solomana Kanté."
        },
        {
          question: "What is the recommended first component to learn in the N'Ko alphabet?",
          options: ["Consonants", "Vowels", "Numbers", "Punctuation"],
          correctAnswer: 1,
          explanation: "Vowels are typically the first component learned when studying the N'Ko alphabet."
        }
      ],
      summary: `
        In this lesson, you've learned about the basics of the N'Ko alphabet:
        
        - Created by Solomana Kanté in 1949 for Manding languages
        - Written from right to left
        - Consists of 27 letters (7 vowels and 20 consonants)
        - Includes diacritical marks, numbers, and punctuation
        - Has a structured learning approach starting with vowels
        
        In the next lesson, we'll dive deeper into the seven vowels of N'Ko and learn how to identify and pronounce them.
      `,
      vocabulary: [
        {
          nko: "ߒߞߏ",
          latin: "N'Ko",
          english: "I say (name of the script)",
          french: "Je dis (nom de l'écriture)"
        },
        {
          nko: "ߊߓߗ",
          latin: "abz",
          english: "alphabet",
          french: "alphabet"
        },
        {
          nko: "ߞߊ߲ߕߋ",
          latin: "Kante",
          english: "Kanté (creator's name)",
          french: "Kanté (nom du créateur)"
        },
        {
          nko: "ߖߌ߬ߦߊ߬ߓߍ",
          latin: "jiyabe",
          english: "writing",
          french: "écriture"
        },
        {
          nko: "ߞߊ߬ߙߊ߲߬",
          latin: "karan",
          english: "to read/study",
          french: "lire/étudier"
        }
      ]
    }
  };c
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/nko/modules/module-definitions.ts
import { getMongoDbId } from '../db/id-mapping-store';

// Helper function to get MongoDB ObjectId from string ID
export function getMongoDatabaseId(stringId: string): string {
  return getMongoDbId(stringId);
}

export interface NkoModule {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  track: string;
  lessons: string[]; // Array of lesson IDs in this module
}

export const moduleDefinitions: NkoModule[] = [
  // Foundations Track (Beginner)
  {
    id: "intro-to-nko",
    title: "Introduction to N'Ko",
    description: "Learn about the history and basics of the N'Ko writing system",
    level: "beginner",
    order: 1,
    track: "foundations",
    lessons: [
      "nko-history",
      "writing-system-basics",
      "nko-modern-world"
    ]
  },
  {
    id: "alphabet-fundamentals",
    title: "Alphabet Fundamentals",
    description: "Master the N'Ko alphabet characters and sounds",
    level: "beginner",
    order: 2,
    track: "foundations",
    lessons: [
      "alphabet-vowels",
      "alphabet-consonants-1",
      "alphabet-consonants-2",
      "nasalized-vowels",
      "tone-marks"
    ]
  },
  {
    id: "writing-basics",
    title: "Writing Basics",
    description: "Learn proper N'Ko handwriting techniques",
    level: "beginner",
    order: 3,
    track: "foundations",
    lessons: [
      "hand-positioning",
      "letterforms",
      "digital-input",
      "connected-forms"
    ]
  },
  
  // Vocabulary Track (Beginner)
  {
    id: "essential-words",
    title: "Essential Words",
    description: "Learn fundamental vocabulary for everyday communication",
    level: "beginner",
    order: 4,
    track: "vocabulary",
    lessons: [
      "greetings-introductions",
      "numbers-counting",
      "time-expressions",
      "common-objects"
    ]
  },
  {
    id: "thematic-vocabulary-beginner",
    title: "Thematic Vocabulary",
    description: "Expand your vocabulary with themed word groups",
    level: "beginner",
    order: 5,
    track: "vocabulary",
    lessons: [
      "family-relationships",
      "food-dining",
      "travel-transportation",
      "work-education"
    ]
  }
];

export function getModuleById(id: string): NkoModule | undefined {
  return moduleDefinitions.find(module => module.id === id);
}

export function getModulesByTrack(track: string): NkoModule[] {
  return moduleDefinitions.filter(module => module.track === track);
}

export function getModulesByLevel(level: string): NkoModule[] {
  return moduleDefinitions.filter(module => module.level === level);
}

export function getLessonModuleId(lessonId: string): string | undefined {
  for (const module of moduleDefinitions) {
    if (module.lessons.includes(lessonId)) {
      return module.id;
    }
  }
  return undefined;
}

export function getNextLesson(currentLessonId: string): string | undefined {
  for (const module of moduleDefinitions) {
    const index = module.lessons.indexOf(currentLessonId);
    if (index >= 0 && index < module.lessons.length - 1) {
      return module.lessons[index + 1];
    } else if (index === module.lessons.length - 1) {
      // Last lesson in module, find first lesson in next module
      const nextModuleIndex = moduleDefinitions.findIndex(m => m.id === module.id) + 1;
      if (nextModuleIndex < moduleDefinitions.length) {
        return moduleDefinitions[nextModuleIndex].lessons[0];
      }
    }
  }
  return undefined;
}

export function getPrerequisiteLessons(lessonId: string): string[] {
  for (const module of moduleDefinitions) {
    const index = module.lessons.indexOf(lessonId);
    if (index > 0) {
      // If not first lesson in module, previous lesson is prerequisite
      return [module.lessons[index - 1]];
    } else if (index === 0) {
      // First lesson in module, check if there's a previous module
      const moduleIndex = moduleDefinitions.findIndex(m => m.id === module.id);
      if (moduleIndex > 0) {
        const prevModule = moduleDefinitions[moduleIndex - 1];
        return [prevModule.lessons[prevModule.lessons.length - 1]];
      }
    }
  }
  return [];
}

export function getLearningPath(level: string): {moduleId: string, lessonId: string}[] {
  const path: {moduleId: string, lessonId: string}[] = [];
  
  // Get all modules for the specified level
  const levelModules = moduleDefinitions
    .filter(module => module.level === level)
    .sort((a, b) => a.order - b.order);
    
  // Add all lessons from each module to the path
  for (const module of levelModules) {
    for (const lessonId of module.lessons) {
      path.push({
        moduleId: module.id,
        lessonId
      });
    }
  }
  
  return path;
}

export function getCompletionPercentage(completedLessons: string[]): number {
  // Count total lessons across all modules
  const totalLessons = moduleDefinitions.reduce(
    (total, module) => total + module.lessons.length, 
    0
  );
  
  // Calculate percentage
  return Math.round((completedLessons.length / totalLessons) * 100);
}

export function getTrackCompletionPercentage(track: string, completedLessons: string[]): number {
  // Get all lessons in this track
  const trackLessons: string[] = [];
  
  moduleDefinitions
    .filter(module => module.track === track)
    .forEach(module => {
      trackLessons.push(...module.lessons);
    });
  
  // Count completed lessons in this track
  const completedTrackLessons = completedLessons.filter(
    lessonId => trackLessons.includes(lessonId)
  );
  
  // Calculate percentage
  return trackLessons.length === 0 ? 0 : 
    Math.round((completedTrackLessons.length / trackLessons.length) * 100);
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/prisma/schema.prisma
generator client {
 provider = "prisma-client-js"
}

datasource db {
 provider = "mongodb"
 url      = env("DATABASE_URL")
}

enum Stage {
  PROSPECTING
  QUALIFICATION
  MEETING
  PROPOSAL
  NEGOTIATION
  PAUSED
  WON
  LOST
}

model User {
  id            String       @id @default(auto()) @map("_id") @db.ObjectId
  email         String      @unique
  name          String?
  password      String
  role          Role        @default(USER)
  contacts      Contact[]
  bio           String?
  phoneNumber   String?
  preferences   Json?
  notifications Json?
  activities    Activity[]
  orders        Order[]
  quickNotes    QuickNote[]
  menuItems     MenuItem[]
  visits        Visit[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  qrCodes       QRCode[]
  folders       Folder[]
  coffeeShops   CoffeeShop[] // Add this line to complete the relation
  people        Person[]    // Add relation to Person model
  filterHistory   FilterHistory[]
  savedFilters    SavedFilter[]
  followUps        FollowUp[]
  WordBank        WordBank[]
  translations    Translation[]
  generatedSentences GeneratedSentence[]
  translationHistory TranslationHistory[]
  conversations   ConversationSession[]
  todos           Todo[]
  savedSuggestions   SavedSuggestion[]
  suggestionHistory  SuggestionHistory[]
  nkoProgress       NkoUserProgress?
  nkoLessonProgress NkoUserLessonProgress[]
  nkoSavedTexts     NkoSavedText[]
  nkoFavorites      NkoUserFavorite[]
    nkoTranslations NkoTranslationHistory[]
  nkoVocabulary     NkoUserVocabulary[]
}


model SavedFilter {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  filters     Json
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model FilterHistory {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  filters     Json
  results     Int
  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
}

model Activity {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  contactId   String   @db.ObjectId
  type        String
  description String
  metadata    Json?
  createdAt   DateTime @default(now())
  contact     Contact  @relation(fields: [contactId], references: [id])
}

model Contact {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  firstName   String
  lastName    String
  email       String
  phone       String?
  company     String?
  notes       String?
  status      Status     @default(NEW)
  userId      String     @db.ObjectId
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  activities  Activity[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  shop        Shop?      @relation(fields: [shopId], references: [id])
  shopId      String?    @db.ObjectId
}

model Person {
  id                String     @id @default(auto()) @map("_id") @db.ObjectId
  firstName         String?
  lastName          String?
  email             String
  phone             String?
  emailType         String?    // "professional" or "generic"
  verificationStatus String?   // "VALID", "INVALID", etc.
  lastVerifiedAt    DateTime?
  notes             String?
  userId            String     @db.ObjectId
  user              User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  coffeeShop        CoffeeShop @relation(fields: [coffeeShopId], references: [id])
  coffeeShopId      String     @db.ObjectId
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
  company     String?

}


model MenuItem {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  price       Float
  category    String
  popular     Boolean     @default(false)
  active      Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  userId      String      @db.ObjectId
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  orderItems  OrderItem[]
}

model Order {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  orderNumber     Int
  customerName    String
  status          OrderStatus @default(PENDING)
  timestamp       DateTime    @default(now())
  total          Float
  isComplimentary Boolean     @default(false)
  queueTime      Float
  preparationTime Float?
  startTime      DateTime?
  customerEmail  String?
  customerPhone  String?
  leadInterest   Boolean?
  notes          String?
  items          OrderItem[]
  userId         String      @db.ObjectId
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model OrderItem {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  menuItem    MenuItem  @relation(fields: [menuItemId], references: [id])
  menuItemId  String    @db.ObjectId
  order       Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     String    @db.ObjectId
  quantity    Int
  price       Float
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model QuickNote {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  content   String
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Folder {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  color     String?  @default("#94a3b8")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  qrCodes   QRCode[]
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model QRCode {
  id            String         @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  defaultUrl    String
  shortCode     String         @unique
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  userId        String         @db.ObjectId
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  folderId      String?        @db.ObjectId
  folder        Folder?        @relation(fields: [folderId], references: [id], onDelete: SetNull)
  deviceRules   DeviceRule[]
  scheduleRules ScheduleRule[]
  design        QRDesign?
  scans         Scan[]
}

model QRDesign {
  id                    String   @id @default(auto()) @map("_id") @db.ObjectId
  size                  Int      @default(300)
  backgroundColor       String   @default("#FFFFFF")
  foregroundColor       String   @default("#000000")
  logoImage            String?
  logoWidth            Int?
  logoHeight           Int?
  dotStyle             String    @default("squares")
  margin               Int       @default(20)
  errorCorrectionLevel String    @default("M")
  style                Json
  logoStyle            Json?
  imageRendering       String    @default("auto")
  qrCodeId             String    @unique @db.ObjectId
  qrCode               QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

model Scan {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId    String   @db.ObjectId
  qrCode      QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  userAgent   String?
  ipAddress   String?
  location    String?
  device      String?
  browser     String?
  os          String?
  timestamp   DateTime @default(now())
}

model DeviceRule {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId   String   @db.ObjectId
  qrCode     QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  deviceType String
  browsers   String[]
  os         String[]
  targetUrl  String
  priority   Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model ScheduleRule {
  id         String    @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId   String    @db.ObjectId
  qrCode     QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  startDate  DateTime
  endDate    DateTime?
  timeZone   String
  daysOfWeek Int[]
  startTime  String?
  endTime    String?
  targetUrl  String
  priority   Int
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model Staff {
  id                String            @id @default(auto()) @map("_id") @db.ObjectId
  email             String            @unique
  name              String
  role              StaffRole         @default(BARISTA)
  certifications    String[]
  maxHoursPerWeek   Int               @default(40)
  hourlyRate        Float
  shifts           ShiftAssignment[]
  availability     Availability[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  shiftPreferences Json?
  maxShiftsPerWeek Int               @default(5)
  preferredShiftLength Int           @default(8)
  preferredDays    Int[]
  blackoutDates    DateTime[]
  timeOff          TimeOff[]
  emergencyContact String?
  address          String?
  preferredShifts  String[]
  maxHoursPerDay   Int               @default(8)
  notes            String?
}

model Shift {
  id            String            @id @default(auto()) @map("_id") @db.ObjectId
  type          ShiftType
  startTime     DateTime
  endTime       DateTime
  status        ShiftStatus       @default(DRAFT)
  notes         String?
  requiredRoles Json
  assignedStaff ShiftAssignment[]
  breaks        Break[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

model ShiftAssignment {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  shiftId   String   @db.ObjectId
  staffId   String   @db.ObjectId
  status    String   @default("SCHEDULED")
  shift     Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Break {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  shiftId   String   @db.ObjectId
  staffId   String   @db.ObjectId
  startTime DateTime
  duration  Int
  shift     Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Availability {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  staffId   String   @db.ObjectId
  dayOfWeek Int
  startTime String
  endTime   String
  recurring Boolean  @default(true)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SchedulingRule {
  id                   String   @id @default(auto()) @map("_id") @db.ObjectId
  name                 String
  description          String?
  isActive             Boolean  @default(true)
  ruleType             RuleType @default(BASIC)
  minStaffPerShift     Int?
  maxStaffPerShift     Int?
  requireCertification Boolean  @default(false)
  requiredCertifications String[]
  minHoursBetweenShifts Int?
  maxWeeklyHours       Int?
  preferredDays        Int[]
  preferredHours       String[]
  roleRequirements     Json?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model TimeOff {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  staffId     String       @db.ObjectId
  staff       Staff        @relation(fields: [staffId], references: [id])
  startDate   DateTime
  endDate     DateTime
  type        TimeOffType
  status      TimeOffStatus @default(PENDING)
  notes       String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}


model FollowUp {
  id              String       @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String       @db.ObjectId
  coffeeShop      CoffeeShop   @relation(fields: [coffeeShopId], references: [id])
  type            FollowUpType
  status          FollowUpStatus @default(PENDING)
  priority        Int          @default(3) // 1-5 scale
  dueDate         DateTime
  completedDate   DateTime?
  notes           String?
  contactMethod   String?      // email, text, visit, call
  contactDetails  String?      // phone number, email address
  assignedTo      String       @db.ObjectId
  user            User         @relation(fields: [assignedTo], references: [id])
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

enum FollowUpType {
  INITIAL_CONTACT
  SAMPLE_DELIVERY
  PROPOSAL_FOLLOW
  TEAM_MEETING
  CHECK_IN
  GENERAL
}

enum FollowUpStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
  RESCHEDULED
}

model DeliveryHistory {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String      @db.ObjectId
  coffeeShop      CoffeeShop  @relation(fields: [coffeeShopId], references: [id])
  weekNumber      Int
  year            Int
  volume          Float
  revenue         Float
  isCurrentWeek   Boolean     @default(false)
  delivered       Boolean     @default(false)
  deliveryDate    DateTime?
  notes           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@unique([coffeeShopId, weekNumber, year], name: "delivery_period")
}

model WeeklyVolumeSnapshot {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  weekNumber    Int
  year          Int
  totalVolume   Float
  partnerCount  Int
  averageVolume Float
  metadata      Json?
  createdAt     DateTime  @default(now())
}



model DeliverySchedule {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String      @db.ObjectId
  coffeeShop      CoffeeShop  @relation(fields: [coffeeShopId], references: [id])
  startDate       DateTime
  frequency       String      // WEEKLY, BIWEEKLY, etc.
  volume          Float
  isActive        Boolean     @default(true)
  lastUpdated     DateTime    @updatedAt
  createdAt       DateTime    @default(now())
}

model CoffeeShop {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  title                 String
  address               String
  website               String?
  manager_present       String?
  contact_name          String?
  contact_email         String?
  phone                 String?
  visited               Boolean   @default(false)
  instagram            String?
  followers            Int?
  store_doors          String?
  volume               String?
  first_visit          DateTime?
  second_visit         DateTime?
  third_visit          DateTime?
  rating               Float?
  reviews              Int?
  price_type           String?
  type                 String?
  types                String[]
  service_options      Json?
  hours                String?
  operating_hours      Json?
  gps_coordinates      Json?
  latitude             Float
  longitude            Float
  area                 String?
  is_source            Boolean   @default(false)
  quality_score        Float?
  parlor_coffee_leads  Boolean   @default(false)
  visits               Visit[]
  userId               String?   @db.ObjectId
  user                 User?     @relation(fields: [userId], references: [id])
  owners               Owner[]
  notes                String?
  priority             Int       @default(0)
  isPartner            Boolean   @default(false)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  priorityLastUpdated  DateTime?
  // Add these fields
  emails               Json?     // Stores array of discovered emails
  company_data         Json?     // Stores company enrichment data
  people               Person[]  // Relation to people discovered from emails
  stage     Stage     @default(PROSPECTING)
  delivery_frequency String? // Values: "WEEKLY", "BIWEEKLY", "THREE_WEEKS", "FOUR_WEEKS", "FIVE_WEEKS", "SIX_WEEKS"
  first_delivery_week Int?
  followUps         FollowUp[]
  lastFollowUp      DateTime?
  nextFollowUpDate  DateTime?
  followUpCount     Int         @default(0)
  relationshipStage String?     // INITIAL, SAMPLES_DELIVERED, PROPOSAL_SENT, etc.
  potential         Int?        // 1-5 scale
  interest          Int?        // 1-5 scale
  decisionMaker     String?     // Name of the decision maker
  decisionMakerRole String?     // Role of the decision maker
  communicationPreference String? // email, phone, in-person
  bestTimeToVisit   String?
  competitors       String[]    // Other coffee suppliers they work with
  budget           Float?      // Estimated monthly budget
  closingNotes     String?     // Notes about closing strategy
  deliveryHistory    DeliveryHistory[]
deliverySchedule   DeliverySchedule[]
  currentVolume      Float?
  averageVolume      Float?
  revenueYTD         Float?
  growthRate         Float?
  lastDelivery       DateTime?
  nextDelivery       DateTime?
  weeklyVolumes     Json?          // Stores current week's volume data
  historicalVolumes Json?          // Stores previous weeks' volume data
  volumeLastUpdated DateTime?      // Tracks when volume was last modified
  weekNumber        Int?           // Current week number
  yearNumber        Int?           // Current year
  volumeStats       Json?          // Aggregated volume statistics
 delivery_day String? @default("TUESDAY")

}



model Owner {
 id            String      @id @default(auto()) @map("_id") @db.ObjectId
 name          String
 email         String
 coffeeShopId  String      @db.ObjectId
 coffeeShop    CoffeeShop  @relation(fields: [coffeeShopId], references: [id], onDelete: Cascade)
 createdAt     DateTime    @default(now())
 updatedAt     DateTime    @updatedAt
}

model Visit {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String      @db.ObjectId
  shopId        String    @db.ObjectId
  userId        String    @db.ObjectId
  visitNumber   Int
  date          DateTime
  managerPresent Boolean  @default(false)
  managerName   String?
  managerContact String?
  samplesDropped Boolean  @default(false)
  sampleDetails String?
  notes         String?
  nextVisitDate DateTime?
  photos        Photo[]   
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  shop          Shop      @relation(fields: [shopId], references: [id])
  user          User      @relation(fields: [userId], references: [id])
  coffeeShop    CoffeeShop  @relation(fields: [coffeeShopId], references: [id])

}

model Photo {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  visitId   String   @db.ObjectId
  url       String
  caption   String?
  createdAt DateTime @default(now())
  visit     Visit    @relation(fields: [visitId], references: [id])
}

model Shop {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  address     String
  latitude    Float
  longitude   Float
  rating      Float?
  reviews     Int?
  website     String?
  phone       String?
  visited     Boolean   @default(false)
  visits      Visit[]
  contacts    Contact[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Role {
  USER
  ADMIN
}

enum Status {
  NEW
  CONTACTED
  QUALIFIED
  CONVERTED
  LOST
}

enum OrderStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum StaffRole {
  BARISTA
  SOMMELIER
  MANAGER
  EXECUTIVE
}

enum ShiftType {
  COFFEE
  WINE
}

enum ShiftStatus {
  DRAFT
  PUBLISHED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum RuleType {
  BASIC
  ADVANCED
  CERTIFICATION
  TIME_CONSTRAINT
  ROLE_BASED
}

enum TimeOffType {
  VACATION
  SICK
  PERSONAL
  OTHER
}

enum TimeOffStatus {
  PENDING
  APPROVED
  REJECTED
}




model WordBank {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id])
  word        String
  translation String
  definition  String
  context     String?
  language    String    @default("fr")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Translation {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id])
  sourceText  String
  translation String
  similar     String[]  @default([])
  createdAt   DateTime  @default(now())
}



model GeneratedSentence {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  original    String
  generated   String[]
  translations String[]
  createdAt   DateTime @default(now())
}

model TranslationHistory {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  sourceText  String
  translation String
  audioUrl    String?
  createdAt   DateTime @default(now())
}



model ConversationSession {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  userId        String    @db.ObjectId
  user          User      @relation(fields: [userId], references: [id])
  topic         String
  isAutosave    Boolean   @default(false)
  messages      Message[]
  stats         Json?
  startedAt     DateTime  @default(now())
  endedAt       DateTime?
  duration      Int?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Create a compound index for userId and isAutosave
  @@index([userId, isAutosave])
}

model Message {
  id                String              @id @default(auto()) @map("_id") @db.ObjectId
  sessionId         String              @db.ObjectId
  session           ConversationSession @relation(fields: [sessionId], references: [id])
  role              String
  content           String
  translation       String?
  audioUrl          String?
  timestamp         DateTime            @default(now())
  mood              String?
  correctedContent  String?
  grammarNotes      String[]
  createdAt         DateTime            @default(now())
}


model Todo {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String?
  status      TodoStatus @default(PENDING)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  tags        String[]
  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  attachments String[]
  subtasks    Subtask[]
  category    String?
}

model Subtask {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  completed Boolean  @default(false)
  todoId    String   @db.ObjectId
  todo      Todo     @relation(fields: [todoId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum TodoStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  ARCHIVED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}


model SavedSuggestion {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  userId        String    @db.ObjectId
  user          User      @relation(fields: [userId], references: [id])
  text          String
  translation   String
  category      String    // 'response', 'question', 'clarification'
  context       String?   // Original message that prompted this suggestion
  isFavorite    Boolean   @default(false)
  useCount      Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model SuggestionHistory {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  userId        String    @db.ObjectId
  user          User      @relation(fields: [userId], references: [id])
  prompt        String    // The message that triggered the suggestion
  suggestions   Json      // Array of generated suggestions
  selectedId    String?   // ID of the suggestion that was selected
  createdAt     DateTime  @default(now())
}
// Fix for NkoUserProgress
model NkoUserProgress {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  userId        String   @unique // Added unique constraint for one-to-one relation
  alphabet      Int      @default(0)
  vocabulary    Int      @default(0)
  grammar       Int      @default(0)
  conversation  Int      @default(0)
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Removed duplicate @@index since @unique already creates an index
}



// Fix for NkoSavedText - remove @db.Text annotations
model NkoSavedText {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String
  text      String   // Removed @db.Text
  translation String? // Removed @db.Text
  notes     String?  // Removed @db.Text
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}



// Fix for NkoUserFavorite
model NkoUserFavorite {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String
  entryId   String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  entry     NkoDictionaryEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  @@unique([userId, entryId])
  @@index([userId])
  @@index([entryId])
}

// Fixed NkoTranslationHistory model
model NkoTranslationHistory {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  userId       String
  sourceText   String   // Removed @db.Text
  translation  String   // Removed @db.Text
  sourceLang   String   // "nko", "english", "french"
  targetLang   String   // "nko", "english", "french"
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
// Fix for NkoDictionaryCategory
model NkoDictionaryCategory {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  slug          String   @unique
  description   String?
  wordCount     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  entries       NkoDictionaryCategoryEntry[]
}

// Fix for NkoDictionaryCategoryEntry
model NkoDictionaryCategoryEntry {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  categoryId String   @db.ObjectId
  entryId    String   @db.ObjectId
  category   NkoDictionaryCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  entry      NkoDictionaryEntry    @relation(fields: [entryId], references: [id], onDelete: Cascade)

  @@unique([categoryId, entryId])
  @@index([categoryId])
  @@index([entryId])
}

// Fix for NkoDictionaryEntry
model NkoDictionaryEntry {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  nko             String
  latin           String
  english         String
  french          String
  partOfSpeech    String
  exampleNko      String?
  exampleEnglish  String?
  exampleFrench   String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  categories      NkoDictionaryCategoryEntry[]
  userFavorites   NkoUserFavorite[]
}

model NkoLesson {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  title        String
  description  String
  level        String   // "beginner", "intermediate", "advanced"
  module       String   // Module identifier
  moduleOrder  Int      // Order within module
  order        Int      // Overall order across all lessons
  duration     Int      // in minutes
  content      Json     // Structured lesson content
  objectives   String[] // Learning objectives
  prerequisites String[] // Prerequisite lesson IDs
  topics       String[] // Topic tags
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  userProgress NkoUserLessonProgress[]
}

// Enhanced Progress Tracking
model NkoUserLessonProgress {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  userId         String
  lessonId       String
  progress       Int      @default(0)
  completed      Boolean  @default(false)
  quizScore      Int?     // Score percentage if quiz completed
  sectionsCompleted Json?  // Track individual section completion
  timeSpent      Int      @default(0) // Time spent in minutes
  lastPosition   String?  // Store last position in lesson
  notes          String?  // User notes on lesson
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson         NkoLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
}

// User Vocabulary Tracker
model NkoUserVocabulary {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  userId       String
  word         String   // N'Ko word
  translation  String   // Translation
  confidence   Int      @default(0) // 0-100 confidence level
  lastReviewed DateTime?
  nextReview   DateTime?
  masteryLevel Int      @default(0) // 0-5 mastery level
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, word])
}

// Module structure
model NkoModule {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String
  level       String   // "beginner", "intermediate", "advanced"
  order       Int      // Overall order across all modules
  track       String   // e.g., "foundations", "vocabulary", "grammar"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

________________________________________________________________________________
