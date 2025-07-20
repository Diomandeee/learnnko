import { Metadata } from "next"
import { LessonViewer } from "@/components/nko/lessons/lesson-viewer"
import { EnhancedIntroLesson } from "@/components/nko/lessons/content/enhanced-intro-lesson"
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

function EnhancedLessonLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="animate-pulse">
            <Skeleton className="h-16 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-xl mb-4" />
            <Skeleton className="h-8 bg-emerald-100 rounded w-96 mb-2" />
            <Skeleton className="h-4 bg-emerald-100 rounded w-64" />
          </div>
          
          {/* Progress card skeleton */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  <Skeleton className="h-10 bg-gradient-to-r from-teal-100 to-cyan-100 rounded w-80" />
                  <Skeleton className="h-6 bg-slate-100 rounded w-96" />
                  <div className="flex gap-4">
                    <Skeleton className="h-8 bg-emerald-100 rounded w-24" />
                    <Skeleton className="h-8 bg-teal-100 rounded w-32" />
                    <Skeleton className="h-8 bg-cyan-100 rounded w-28" />
                  </div>
                </div>
                <Skeleton className="h-24 w-24 bg-emerald-100 rounded-full" />
              </div>
            </CardContent>
          </Card>
          
          {/* Main content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12 bg-slate-100 rounded" />
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <Skeleton className="h-96 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params
  
  // Use enhanced component for intro lessons
  const isIntroLesson = id === 'intro-to-nko' || id === 'nko-comprehensive-scholarly-introduction'
  
  return (
    <Suspense fallback={isIntroLesson ? <EnhancedLessonLoadingSkeleton /> : <LessonLoadingSkeleton />}>
      {isIntroLesson ? (
        <EnhancedIntroLesson lessonId={id} />
      ) : (
        <LessonViewer lessonId={id} />
      )}
    </Suspense>
  )
} 