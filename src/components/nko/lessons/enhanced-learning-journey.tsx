"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  BookOpen, 
  Clock, 
  CheckCircle2,
  CircleDot,
  Lock,
  ArrowRight,
  Star,
  Users,
  Lightbulb,
  Trophy,
  Sparkles,
  User,
  GraduationCap,
  MoreVertical
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface Lesson {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  progress: number
  isLocked: boolean
  isCompleted: boolean
  category: string
  order: number
  topics: string[]
}

interface EnhancedLearningJourneyProps {
  lessons?: Lesson[]
  userProgress?: {
    totalProgress: number
    completedLessons: number
    totalLessons: number
  }
}

export function EnhancedLearningJourney({ 
  lessons = [], 
  userProgress = { totalProgress: 0, completedLessons: 0, totalLessons: 12 }
}: EnhancedLearningJourneyProps) {
  
  const sampleLessons: Lesson[] = [
    {
      id: "intro-to-nko",
      title: "Introduction: Beyond the Simple Story",
      description: "Most people know the basic story: Solomana Kanté invented N'Ko in 1949. But there's so much more to discover about this revolutionary writing system.",
      level: "beginner",
      duration: 8,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      category: "Introduction",
      order: 1,
      topics: ["history", "culture", "writing-system"]
    },
    {
      id: "afro-muslim-context",
      title: "The Afro-Muslim Vernacular Tradition: Setting the Context",
      description: "To understand N'Ko, you must first understand the 'Afro-Muslim vernacular tradition' - the rich intellectual heritage that laid the groundwork.",
      level: "beginner", 
      duration: 7,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      category: "Practice",
      order: 2,
      topics: ["context", "tradition", "islamic-influence"]
    },
    {
      id: "ajami-foundation",
      title: "Ajami: The 300-Year Foundation",
      description: "The foundation for N'Ko was laid centuries before Kanté's birth. Discover the Ajami tradition that shaped West African literacy.",
      level: "beginner",
      duration: 9,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      category: "Practice",
      order: 3,
      topics: ["ajami", "arabic-script", "historical-context"]
    },
    {
      id: "scholarly-networks",
      title: "Scholarly Networks: The Invisible Web",
      description: "Behind every innovation is a network of scholars. Learn about the intellectual communities that influenced N'Ko's development.",
      level: "intermediate",
      duration: 12,
      progress: 0,
      isLocked: false,
      isCompleted: false,
      category: "Practice",
      order: 4,
      topics: ["scholars", "networks", "intellectual-history"]
    }
  ]

  const displayLessons = lessons.length > 0 ? lessons : sampleLessons

  const getStatusIcon = (lesson: Lesson) => {
    if (lesson.isCompleted) return CheckCircle2
    if (lesson.isLocked) return Lock
    if (lesson.progress > 0) return CircleDot
    return BookOpen
  }

  const getStatusColor = (lesson: Lesson) => {
    if (lesson.isCompleted) return "text-amber-400"
    if (lesson.isLocked) return "text-slate-400"
    if (lesson.progress > 0) return "text-orange-400"
    return "text-amber-400"
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'introduction': return BookOpen
      case 'practice': return GraduationCap
      case 'advanced': return Trophy
      default: return Lightbulb
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-amber-500 text-white'
      case 'intermediate': return 'bg-orange-500 text-white'
      case 'advanced': return 'bg-yellow-600 text-white'
      default: return 'bg-space-700 text-white'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Journey Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-space-900/80 via-space-800/80 to-space-900/80 border-amber-500/20">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-100">Learning Journey</CardTitle>
                <CardDescription className="text-base text-gray-200">
                  Your progress through N'Ko
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-400">{userProgress.totalProgress}%</div>
              <div className="text-sm text-gray-300">Complete</div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-100">Overall Progress</span>
              <span className="text-sm text-gray-200">
                {userProgress.completedLessons} of {userProgress.totalLessons} lessons
              </span>
            </div>
            <Progress value={userProgress.totalProgress} className="h-3" />
          </div>
        </CardHeader>
      </Card>

      {/* Lessons Timeline */}
      <div className="space-y-6">
        {displayLessons.map((lesson, index) => {
          const StatusIcon = getStatusIcon(lesson)
          const CategoryIcon = getCategoryIcon(lesson.category)
          const isNext = !lesson.isCompleted && !lesson.isLocked && index === displayLessons.findIndex(l => !l.isCompleted)

          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Timeline connector */}
              {index < displayLessons.length - 1 && (
                <div className="absolute left-6 top-20 w-0.5 h-12 bg-gradient-to-b from-amber-500/30 to-orange-500/30"></div>
              )}

              <Card className={`
                relative overflow-hidden transition-all duration-300 hover:shadow-lg border-space-700/50
                ${lesson.isCompleted ? 'border-amber-500/50 bg-space-900/50' : ''}
                ${isNext ? 'border-orange-500/50 bg-space-800/80 shadow-md' : ''}
                ${lesson.isLocked ? 'opacity-70' : ''}
                ${lesson.progress > 0 && !lesson.isCompleted ? 'border-orange-500/50 bg-space-900/50' : ''}
              `}>
                {/* Next lesson highlight */}
                {isNext && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
                )}

                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    {/* Status Icon */}
                    <div className={`
                      flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                      ${lesson.isCompleted ? 'bg-amber-900/30' : ''}
                      ${lesson.isLocked ? 'bg-space-800/50' : ''}
                      ${lesson.progress > 0 && !lesson.isCompleted ? 'bg-orange-900/30' : ''}
                      ${lesson.progress === 0 && !lesson.isLocked ? 'bg-amber-900/20' : ''}
                    `}>
                      <StatusIcon className={`w-6 h-6 ${getStatusColor(lesson)}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CategoryIcon className="w-5 h-5 text-amber-400" />
                            <span className="text-sm font-medium text-amber-300">{lesson.category}</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-100 mb-2 leading-tight">
                            {lesson.title}
                          </h3>
                          <p className="text-gray-200 leading-relaxed">
                            {lesson.description}
                          </p>
                        </div>

                        {/* Lesson metadata */}
                        <div className="flex flex-col items-end gap-3 ml-6">
                          <Badge className={getLevelColor(lesson.level)}>
                            {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-300">
                            <Clock className="w-4 h-4" />
                            <span>{lesson.duration} min</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar for active lessons */}
                      {lesson.progress > 0 && !lesson.isCompleted && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-100">Progress</span>
                            <span className="text-sm text-gray-200">{lesson.progress}%</span>
                          </div>
                          <Progress value={lesson.progress} className="h-2" />
                        </div>
                      )}

                      {/* Topics */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {lesson.topics.map((topic, topicIndex) => (
                          <Badge 
                            key={topicIndex} 
                            variant="outline" 
                            className="text-xs px-2 py-1"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end">
                        {lesson.isLocked ? (
                          <Button variant="outline" disabled className="px-6">
                            <Lock className="w-4 h-4 mr-2" />
                            Locked
                          </Button>
                        ) : (
                          <Link href={`/nko/lessons/${lesson.id}`}>
                            <Button 
                              className={`
                                px-6 transition-all
                                ${isNext ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg' : ''}
                              `}
                            >
                              {lesson.isCompleted ? (
                                <>
                                  <BookOpen className="w-4 h-4 mr-2" />
                                  Review
                                </>
                              ) : lesson.progress > 0 ? (
                                <>
                                  <ArrowRight className="w-4 h-4 mr-2" />
                                  Continue
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  {isNext ? 'Start Next' : 'Start'}
                                </>
                              )}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Journey Stats */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-space-900/50 to-space-800/50 border-amber-500/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-gray-100">{userProgress.completedLessons}</div>
              <div className="text-sm text-gray-200">Lessons Completed</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-gray-100">
                {Math.round(userProgress.totalProgress)}%
              </div>
              <div className="text-sm text-gray-200">Journey Progress</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-gray-100">
                {userProgress.totalLessons - userProgress.completedLessons}
              </div>
              <div className="text-sm text-gray-200">Lessons Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 