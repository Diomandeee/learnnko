import { Metadata } from "next"
import { LessonViewer } from "@/components/nko/lessons/lesson-viewer"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface LessonPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `N'Ko Lesson: ${id} | Learn N'Ko`,
    description: `Learn N'Ko through interactive lessons`,
  }
}

function LessonLoadingSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params
  
  return (
    <Suspense fallback={<LessonLoadingSkeleton />}>
      <LessonViewer lessonId={id} />
    </Suspense>
  )
} 