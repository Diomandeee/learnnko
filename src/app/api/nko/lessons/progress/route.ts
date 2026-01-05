import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      lessonId,
      progress,
      isCompleted,
      completed,
      timeSpent,
      quizScore,
    } = body as {
      lessonId?: string
      progress?: number
      isCompleted?: boolean
      completed?: boolean
      timeSpent?: number
      quizScore?: number
    }

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    const lesson = await prisma.nkoLesson.findUnique({ where: { slug: lessonId } })
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const clampedProgress = Math.min(Math.max(progress || 0, 0), 100)
    const completedFlag = Boolean(isCompleted ?? completed ?? false)
    const timeSpentMinutes = Math.max(timeSpent || 0, 0)
    const lastAccessed = new Date()

    let updatedProgress
    if (userId) {
      updatedProgress = await prisma.nkoUserLessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId: lesson.id } },
        update: {
          progress: clampedProgress,
          completed: completedFlag,
          timeSpent: { increment: timeSpentMinutes },
          lastAccessed,
          ...(quizScore !== undefined && {
            quizScores: {
              push: {
                score: quizScore,
                timestamp: new Date(),
              },
            },
          }),
        },
        create: {
          userId,
          lessonId: lesson.id,
          progress: clampedProgress,
          completed: completedFlag,
          timeSpent: timeSpentMinutes,
          lastAccessed,
          sectionsCompleted: [],
          quizCompleted: false,
          currentSection: 0,
          lastPosition: 0,
          exercisesCompleted: [],
          ...(quizScore !== undefined && {
            quizScores: [
              {
                score: quizScore,
                timestamp: new Date(),
              },
            ],
          }),
        },
      })
    } else {
      const existingProgress = await prisma.nkoUserLessonProgress.findFirst({
        where: { lessonId: lesson.id, userId: null },
        orderBy: { lastAccessed: "desc" },
      })

      if (existingProgress) {
        updatedProgress = await prisma.nkoUserLessonProgress.update({
          where: { id: existingProgress.id },
          data: {
            progress: clampedProgress,
            completed: completedFlag,
            timeSpent: { increment: timeSpentMinutes },
            lastAccessed,
            ...(quizScore !== undefined && {
              quizScores: {
                push: {
                  score: quizScore,
                  timestamp: new Date(),
                },
              },
            }),
          },
        })
      } else {
        updatedProgress = await prisma.nkoUserLessonProgress.create({
          data: {
            userId: null,
            lessonId: lesson.id,
            progress: clampedProgress,
            completed: completedFlag,
            timeSpent: timeSpentMinutes,
            lastAccessed,
            sectionsCompleted: [],
            quizCompleted: false,
            currentSection: 0,
            lastPosition: 0,
            exercisesCompleted: [],
            ...(quizScore !== undefined && {
              quizScores: [
                {
                  score: quizScore,
                  timestamp: new Date(),
                },
              ],
            }),
          },
        })
      }
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
