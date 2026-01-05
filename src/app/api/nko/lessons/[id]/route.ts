import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { getLessonFromLibrary } from "@/lib/nko/seed/lessons/lesson-library"

async function getIsLockedForUser(args: { userId: string; prerequisiteSlugs: string[] }) {
  const { userId, prerequisiteSlugs } = args
  if (prerequisiteSlugs.length === 0) return false

  const prereqLessons = await prisma.nkoLesson.findMany({
    where: { slug: { in: prerequisiteSlugs } },
    select: { id: true, slug: true },
  })

  const prereqById = new Map(prereqLessons.map((l) => [l.id, l.slug]))
  const progress = await prisma.nkoUserLessonProgress.findMany({
    where: { userId, lessonId: { in: prereqLessons.map((l) => l.id) }, completed: true },
    select: { lessonId: true },
  })

  const completedSlugs = new Set(progress.map((p) => prereqById.get(p.lessonId)).filter(Boolean) as string[])
  return prerequisiteSlugs.some((slug) => !completedSlugs.has(slug))
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const lessonSlug = id

  try {
    // Get user session
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // Get lesson from database using slug
    const lesson = await prisma.nkoLesson.findUnique({
      where: { slug: lessonSlug }
    })

    if (!lesson) {
      const fallback = getLessonFromLibrary(lessonSlug)
      if (!fallback) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
      }

      return NextResponse.json({
        id: fallback.slug,
        slug: fallback.slug,
        title: fallback.title,
        description: fallback.description || "",
        level: fallback.level,
        duration: fallback.duration || "30 minutes",
        estimatedTime: fallback.estimatedTime || 0,
        topics: fallback.topics || [],
        prerequisites: fallback.prerequisites || [],
        content: fallback.content,
        objectives: fallback.objectives || [],
        vocabulary: fallback.vocabulary || [],
        grammarPoints: fallback.grammarPoints || [],
        culturalNotes: fallback.culturalNotes || [],
        difficulty: fallback.difficulty || 1,
        tags: fallback.tags || [],
        track: fallback.track,
        module: fallback.module,
        moduleOrder: fallback.moduleOrder,
        order: fallback.order,
        progress: 0,
        isCompleted: false,
        currentSection: 0,
        sectionsCompleted: [],
        quizCompleted: false,
        timeSpent: 0,
        isLocked: false,
      })
    }

    let lessonProgress = null

    // Get or create lesson progress only if user is authenticated
    if (userId) {
      lessonProgress = await prisma.nkoUserLessonProgress.findUnique({
        where: { 
          userId_lessonId: {
            userId,
            lessonId: lesson.id
          }
        }
      })

      // Create default progress if none exists
      if (!lessonProgress) {
        lessonProgress = await prisma.nkoUserLessonProgress.create({
          data: {
            userId,
            lessonId: lesson.id,
            progress: 0,
            completed: false,
            timeSpent: 0,
            sectionsCompleted: [],
            quizCompleted: false,
            currentSection: 0,
            lastPosition: 0,
            exercisesCompleted: []
          }
        })
      }
    }

    // Transform lesson to include progress info
    const transformedLesson = {
      id: lesson.slug, // Use slug as ID for frontend compatibility
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description || "",
      level: lesson.level,
      duration: lesson.duration || "30 minutes",
      estimatedTime: lesson.estimatedTime,
      topics: lesson.topics || [],
      prerequisites: lesson.prerequisites || [],
      content: lesson.content,
      objectives: lesson.objectives || [],
      vocabulary: lesson.vocabulary || [],
      grammarPoints: lesson.grammarPoints || [],
      culturalNotes: lesson.culturalNotes || [],
      difficulty: lesson.difficulty,
      tags: lesson.tags || [],
      track: lesson.track,
      module: lesson.module,
      moduleOrder: lesson.moduleOrder,
      order: lesson.order,
      // Real progress from database (or defaults if user not authenticated)
      progress: lessonProgress?.progress || 0,
      isCompleted: lessonProgress?.completed || false,
      currentSection: lessonProgress?.currentSection || 0,
      sectionsCompleted: lessonProgress?.sectionsCompleted || [],
      quizCompleted: lessonProgress?.quizCompleted || false,
      timeSpent: lessonProgress?.timeSpent || 0,
      // Determine if lesson is locked based on prerequisites
      isLocked: userId ? await getIsLockedForUser({ userId, prerequisiteSlugs: lesson.prerequisites }) : false,
    }

    return NextResponse.json(transformedLesson)
  } catch (error) {
    console.error("Error fetching lesson:", error)
    const fallback = getLessonFromLibrary(lessonSlug)
    if (fallback) {
      return NextResponse.json({
        id: fallback.slug,
        slug: fallback.slug,
        title: fallback.title,
        description: fallback.description || "",
        level: fallback.level,
        duration: fallback.duration || "30 minutes",
        estimatedTime: fallback.estimatedTime || 0,
        topics: fallback.topics || [],
        prerequisites: fallback.prerequisites || [],
        content: fallback.content,
        objectives: fallback.objectives || [],
        vocabulary: fallback.vocabulary || [],
        grammarPoints: fallback.grammarPoints || [],
        culturalNotes: fallback.culturalNotes || [],
        difficulty: fallback.difficulty || 1,
        tags: fallback.tags || [],
        track: fallback.track,
        module: fallback.module,
        moduleOrder: fallback.moduleOrder,
        order: fallback.order,
        progress: 0,
        isCompleted: false,
        currentSection: 0,
        sectionsCompleted: [],
        quizCompleted: false,
        timeSpent: 0,
        isLocked: false,
      })
    }

    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 })
  }
}

// Update lesson (simplified)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const updateData = await req.json();
    const { id } = await params
    const lessonSlug = id;
    
    // Check if lesson exists
    const lesson = await prisma.nkoLesson.findUnique({
      where: { slug: lessonSlug }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Update the lesson
    const updatedLesson = await prisma.nkoLesson.update({
      where: { slug: lessonSlug },
      data: updateData
    });

    return NextResponse.json({
      ...updatedLesson,
      id: updatedLesson.slug // Return slug as ID for frontend compatibility
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

// Delete lesson (simplified)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lessonSlug = id;
    
    // Check if lesson exists
    const lesson = await prisma.nkoLesson.findUnique({
      where: { slug: lessonSlug }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Delete the lesson and related progress records
    await prisma.$transaction([
      prisma.nkoUserLessonProgress.deleteMany({
        where: { lessonId: lesson.id }
      }),
      prisma.nkoLesson.delete({
        where: { id: lesson.id }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
