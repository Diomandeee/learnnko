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
