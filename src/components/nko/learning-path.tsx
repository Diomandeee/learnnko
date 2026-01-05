"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  CircleCheck, 
  CircleDashed, 
  GraduationCap, 
  BookOpen, 
  Pencil,
  ArrowRight
} from "lucide-react"

interface LearningPathProps {
  className?: string
}

export function LearningPath({ className }: LearningPathProps) {
  const modules = [
    {
      title: "Alphabet Basics",
      description: "Learn the N'Ko letters and their pronunciations",
      progress: 100,
      status: "completed",
      lessons: 5,
      icon: BookOpen,
      path: "/dashboard/nko/lessons/alphabet",
    },
    {
      title: "Reading Practice",
      description: "Practice reading simple N'Ko words and phrases",
      progress: 60,
      status: "in-progress",
      lessons: 8,
      icon: GraduationCap,
      path: "/dashboard/nko/lessons/reading",
    },
    {
      title: "Writing Basics",
      description: "Learn to write N'Ko characters and words",
      progress: 0,
      status: "locked",
      lessons: 10,
      icon: Pencil,
      path: "/dashboard/nko/lessons/writing",
    },
  ]

  const statusIcons = {
    "completed": CircleCheck,
    "in-progress": CircleDashed,
    "locked": CircleDashed,
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Learning Path</CardTitle>
        <CardDescription>
          Your personalized N'Ko learning journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {modules.map((module, index) => {
            const StatusIcon = statusIcons[module.status];
            
            return (
              <div key={index} className={`
                border rounded-lg p-4 
                ${module.status === 'completed' ? 'border-primary/50 bg-primary/5' : ''}
                ${module.status === 'in-progress' ? 'border-orange-500/50 bg-orange-500/5' : ''}
                ${module.status === 'locked' ? 'border-muted opacity-70' : ''}
              `}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <StatusIcon className={`
                      h-5 w-5 mr-2 
                      ${module.status === 'completed' ? 'text-amber-500' : ''}
                      ${module.status === 'in-progress' ? 'text-orange-500' : ''}
                      ${module.status === 'locked' ? 'text-muted-foreground' : ''}
                    `} />
                    <h3 className="font-medium">{module.title}</h3>
                  </div>
                  
                  <Badge variant={
                    module.status === 'completed' ? 'default' :
                    module.status === 'in-progress' ? 'secondary' : 'outline'
                  }>
                    {module.status === 'completed' ? 'Completed' :
                     module.status === 'in-progress' ? 'In Progress' : 'Locked'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <module.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {module.lessons} lessons
                  </span>
                </div>
                
                <Progress
                  value={module.progress}
                  className={`h-2 mb-4 ${module.status === 'locked' ? 'opacity-50' : ''}`}
                />
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground max-w-[70%]">
                    {module.description}
                  </p>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={module.status === 'locked'}
                    asChild
                  >
                    <Link href={module.path}>
                      {module.status === 'completed' ? 'Review' : 
                       module.status === 'in-progress' ? 'Continue' : 'Start'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
