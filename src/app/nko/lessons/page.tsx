import { Metadata } from "next"
import { NkoLessonList } from "@/components/nko/lessons/nko-lesson-list"
import { ProgressDashboard } from "@/components/nko/lessons/progress-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "N'Ko Lessons | French Connect",
  description: "Learn N'Ko through structured lessons and courses",
}

export default function NkoLessonsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">N'Ko Lessons</h1>
          <p className="text-muted-foreground">
            Structured lessons to master the N'Ko language and script
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <ProgressDashboard 
            completedLessons={[]}
            vocabularyCount={0}
            daysStreak={0}
            timeStudied={0}
            lastLessonId={null}
          />
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="beginner">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="beginner">
              <NkoLessonList level="beginner" completedLessons={[]} />
            </TabsContent>
            
            <TabsContent value="intermediate">
              <NkoLessonList level="intermediate" completedLessons={[]} />
            </TabsContent>
            
            <TabsContent value="advanced">
              <NkoLessonList level="advanced" completedLessons={[]} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 