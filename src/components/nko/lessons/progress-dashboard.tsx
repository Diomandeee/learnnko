"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
                <Calendar className="h-5 w-5 text-orange-500 mb-1" />
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
                    achievement.unlocked ? "border-primary" : "border-space-700/50 opacity-50"
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
