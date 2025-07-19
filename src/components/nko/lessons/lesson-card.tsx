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
