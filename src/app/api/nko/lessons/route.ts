import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { nkoLessonLibrary } from "@/lib/nko/seed/lessons/lesson-library"

const levelOrder: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
}

function serializeLessonForClient(args: {
  lesson: any
  progress?: { progress: number; completed: boolean } | null
  isLocked: boolean
}) {
  const { lesson, progress, isLocked } = args
  return {
    id: lesson.slug,
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description || "",
    level: lesson.level,
    duration: lesson.duration || "30 minutes",
    estimatedTime: lesson.estimatedTime || 0,
    topics: lesson.topics || [],
    prerequisites: lesson.prerequisites || [],
    progress: progress?.progress || 0,
    isCompleted: progress?.completed || false,
    isLocked,
    content: lesson.content,
    objectives: lesson.objectives || [],
    vocabulary: lesson.vocabulary || [],
    grammarPoints: lesson.grammarPoints || [],
    culturalNotes: lesson.culturalNotes || [],
    difficulty: lesson.difficulty || 1,
    tags: lesson.tags || [],
    track: lesson.track,
    module: lesson.module,
    moduleOrder: lesson.moduleOrder,
    order: lesson.order,
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    const lessons = await prisma.nkoLesson.findMany({
      orderBy: [{ moduleOrder: "asc" }, { order: "asc" }],
      include: {
        progress: userId
          ? { where: { userId }, take: 1 }
          : { where: { userId: null }, orderBy: { lastAccessed: "desc" }, take: 1 },
      },
    })

    const completedSlugs = new Set<string>()
    if (userId) {
      for (const lesson of lessons) {
        const p = lesson.progress?.[0]
        if (p?.completed) completedSlugs.add(lesson.slug)
      }
    }

    const transformedLessons = lessons
      .slice()
      .sort((a, b) => {
        const levelDiff = (levelOrder[a.level] || 999) - (levelOrder[b.level] || 999)
        if (levelDiff !== 0) return levelDiff
        const moduleDiff = (a.moduleOrder || 0) - (b.moduleOrder || 0)
        if (moduleDiff !== 0) return moduleDiff
        return (a.order || 0) - (b.order || 0)
      })
      .map((lesson) => {
        const p = lesson.progress?.[0]
        const isLocked = userId ? lesson.prerequisites.some((s: string) => !completedSlugs.has(s)) : false
        return serializeLessonForClient({
          lesson,
          progress: p ? { progress: p.progress || 0, completed: !!p.completed } : null,
          isLocked,
        })
      })

    return NextResponse.json(transformedLessons)
  } catch (error) {
    console.error("Error fetching lessons:", error)
    // Fallback: return the in-repo lesson library (useful in dev or if DB is unavailable)
    const fallback = nkoLessonLibrary
      .slice()
      .sort((a, b) => {
        const levelDiff = (levelOrder[a.level] || 999) - (levelOrder[b.level] || 999)
        if (levelDiff !== 0) return levelDiff
        const moduleDiff = (a.moduleOrder || 0) - (b.moduleOrder || 0)
        if (moduleDiff !== 0) return moduleDiff
        return (a.order || 0) - (b.order || 0)
      })
      .map((lesson) =>
        serializeLessonForClient({
          lesson,
          progress: null,
          isLocked: false,
        })
      )

    return NextResponse.json(fallback)
  }
}

// Create lesson (simplified)
export async function POST(req: Request) {
  try {
    const lessonData = await req.json();
    
    // Create the lesson
    const newLesson = await prisma.nkoLesson.create({
      data: {
        ...lessonData,
        estimatedTime: lessonData.estimatedTime || 0
      }
    });

    return NextResponse.json(newLesson);
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
