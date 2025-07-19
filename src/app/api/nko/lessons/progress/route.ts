import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(request: Request) {
  try {
    const { lessonId, progress, isCompleted, timeSpent, quizScore } = await request.json()

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      )
    }

    // For now, we'll store progress without user authentication
    // In the future, this would be tied to a specific user
    const progressData = {
      lessonId,
      progress: Math.min(Math.max(progress || 0, 0), 100), // Ensure 0-100 range
      isCompleted: isCompleted || false,
      timeSpent: timeSpent || 0,
      lastAccessed: new Date()
    }

    // Try to update existing progress or create new
    const existingProgress = await prisma.nkoUserLessonProgress.findFirst({
      where: { 
        lessonId,
        userId: null // For guest users, we'll use null
      }
    })

    let updatedProgress
    if (existingProgress) {
      updatedProgress = await prisma.nkoUserLessonProgress.update({
        where: { id: existingProgress.id },
        data: {
          progress: progressData.progress,
          isCompleted: progressData.isCompleted,
          timeSpent: (existingProgress.timeSpent || 0) + (timeSpent || 0),
          lastAccessed: progressData.lastAccessed,
          ...(quizScore && {
            quizScores: {
              push: {
                score: quizScore,
                timestamp: new Date(),
                attempt: (existingProgress.quizScores as any[])?.length + 1 || 1
              }
            }
          })
        }
      })
    } else {
      updatedProgress = await prisma.nkoUserLessonProgress.create({
        data: {
          ...progressData,
          ...(quizScore && {
            quizScores: [{
              score: quizScore,
              timestamp: new Date(),
              attempt: 1
            }]
          })
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      progress: updatedProgress 
    })
  } catch (error) {
    console.error("Error updating lesson progress:", error)
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
} 