"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Star, 
  BookOpen,
  Lightbulb,
  Award,
  Users,
  Globe
} from "lucide-react"

interface TimelineSection {
  title: string
  duration: number
  type: 'introduction' | 'content' | 'practice' | 'cultural' | 'summary'
  isCompleted: boolean
  isCurrent: boolean
  description?: string
}

interface LessonProgressTimelineProps {
  sections: TimelineSection[]
  currentSection: number
  onSectionClick: (index: number) => void
  totalProgress: number
}

export function LessonProgressTimeline({
  sections,
  currentSection,
  onSectionClick,
  totalProgress
}: LessonProgressTimelineProps) {
  
  const getSectionIcon = (type: string, isCompleted: boolean, isCurrent: boolean) => {
    const iconClass = `w-5 h-5 ${
      isCompleted ? 'text-amber-400' :
      isCurrent ? 'text-orange-400' :
      'text-gray-400'
    }`
    
    switch (type) {
      case 'introduction':
        return <Star className={iconClass} />
      case 'content':
        return <BookOpen className={iconClass} />
      case 'practice':
        return <Lightbulb className={iconClass} />
      case 'cultural':
        return <Globe className={iconClass} />
      case 'summary':
        return <Award className={iconClass} />
      default:
        return <Circle className={iconClass} />
    }
  }

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'introduction':
        return 'from-amber-500 to-orange-500'
      case 'content':
        return 'from-orange-500 to-yellow-500'
      case 'practice':
        return 'from-amber-500 to-orange-500'
      case 'cultural':
        return 'from-purple-500 to-pink-500'
      case 'summary':
        return 'from-yellow-500 to-orange-500'
      default:
        return 'from-slate-500 to-gray-500'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'introduction':
        return 'Introduction'
      case 'content':
        return 'Core Content'
      case 'practice':
        return 'Practice'
      case 'cultural':
        return 'Cultural Context'
      case 'summary':
        return 'Summary'
      default:
        return 'Section'
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-space-900/80 to-space-800/80 border-space-700/50">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-100">Learning Journey</h3>
              <p className="text-sm text-gray-300">Your progress through N'Ko</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">{totalProgress}%</div>
            <div className="text-xs text-gray-300">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-space-800/50 rounded-full h-2"></div>
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-300">
            <span>Start</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="ghost"
                className={`w-full p-4 h-auto justify-start transition-all duration-200 ${
                  section.isCurrent
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30'
                    : section.isCompleted
                    ? 'bg-amber-900/20 hover:bg-amber-900/30'
                    : 'hover:bg-space-800/50'
                }`}
                onClick={() => onSectionClick(index)}
              >
                <div className="flex items-center gap-4 w-full">
                  {/* Step indicator */}
                  <div className="relative flex items-center justify-center">
                    {section.isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    ) : section.isCurrent ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-8 h-8 bg-gradient-to-br ${getSectionColor(section.type)} rounded-full flex items-center justify-center`}
                      >
                        {getSectionIcon(section.type, section.isCompleted, section.isCurrent)}
                      </motion.div>
                    ) : (
                      <div className="w-8 h-8 bg-space-800/50 rounded-full flex items-center justify-center">
                        {getSectionIcon(section.type, section.isCompleted, section.isCurrent)}
                      </div>
                    )}

                    {/* Connection line */}
                    {index < sections.length - 1 && (
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                        <div className={`w-0.5 h-6 ${
                          section.isCompleted ? 'bg-amber-500/30' : 'bg-space-700/50'
                        }`} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${
                        section.isCurrent ? 'text-amber-300' :
                        section.isCompleted ? 'text-amber-400' :
                        'text-gray-200'
                      }`}>
                        {section.title}
                      </h4>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          section.isCurrent ? 'bg-orange-900/30 text-orange-300' :
                          section.isCompleted ? 'bg-amber-900/30 text-amber-300' :
                          'bg-space-800/50 text-gray-300'
                        }`}
                      >
                        {getTypeLabel(section.type)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-300">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{section.duration} min</span>
                      </div>

                      {section.description && (
                        <p className="text-xs text-gray-300 flex-1">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="flex flex-col items-center">
                    {section.isCompleted && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-amber-400"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </motion.div>
                    )}
                    {section.isCurrent && !section.isCompleted && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="text-orange-400"
                      >
                        <Circle className="w-5 h-5" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Cultural Quote */}
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-500/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">ߒ</span>
            </div>
            <div>
              <p className="text-sm text-amber-300 italic leading-relaxed">
                "ߒߞߏ ߦߋ߫ ߞߊ߬ߙߊ߲ ߞߎ߲߬ߠߊ߬ߛߌ߮ ߟߋ߬ ߘߌ߫"
              </p>
              <p className="text-xs text-amber-400 mt-1">
                "N'Ko is an ancient learning tradition" - Traditional saying
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to convert lesson sections to timeline format
export function createTimelineFromSections(
  lessonSections: any[],
  currentSection: number,
  completedSections: Record<number, boolean>
) {
  return lessonSections.map((section, index) => ({
    title: section.title,
    duration: section.duration || 5,
    type: index === 0 ? 'introduction' : 
          index === lessonSections.length - 1 ? 'summary' :
          section.title.toLowerCase().includes('practice') || section.exercises?.length > 0 ? 'practice' :
          section.title.toLowerCase().includes('cultural') || section.title.toLowerCase().includes('tradition') ? 'cultural' :
          'content',
    isCompleted: completedSections[index] || false,
    isCurrent: currentSection === index,
    description: section.content?.substring(0, 60) + '...' || ''
  }))
} 