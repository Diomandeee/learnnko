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
            ${lesson.status === 'in-progress' ? 'border-orange-500/50' : ''}
            ${lesson.status === 'locked' ? 'opacity-60' : ''}
          `}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lesson.status === 'completed' ? (
                  <CircleCheck className="h-5 w-5 text-amber-500" />
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
