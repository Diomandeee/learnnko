import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

// Helper function to check if prerequisites are completed
async function checkPrerequisites(prerequisiteSlugs: string[]): Promise<boolean> {
  if (prerequisiteSlugs.length === 0) return false

  // Get all prerequisite lessons
  const prerequisiteLessons = await prisma.nkoLesson.findMany({
    where: {
      slug: {
        in: prerequisiteSlugs
      }
    },
    include: {
      progress: true
    }
  })

  // Check if all prerequisites are completed
  return prerequisiteLessons.every(lesson => 
    lesson.progress && lesson.progress.completed
  )
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lessonSlug = id

    // Get lesson from database using slug
    const lesson = await prisma.nkoLesson.findUnique({
      where: { slug: lessonSlug }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      )
    }

    // Get or create lesson progress
    let lessonProgress = await prisma.nkoUserLessonProgress.findUnique({
      where: { lessonId: lesson.id }
    })

    // Create default progress if none exists
    if (!lessonProgress) {
      lessonProgress = await prisma.nkoUserLessonProgress.create({
        data: {
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
      // Real progress from database
      progress: lessonProgress.progress,
      isCompleted: lessonProgress.completed,
      currentSection: lessonProgress.currentSection,
      sectionsCompleted: lessonProgress.sectionsCompleted,
      quizCompleted: lessonProgress.quizCompleted,
      timeSpent: lessonProgress.timeSpent,
      // Determine if lesson is locked based on prerequisites
      isLocked: lesson.prerequisites.length === 0 ? false : await checkPrerequisites(lesson.prerequisites)
    }

    return NextResponse.json(transformedLesson)
  } catch (error) {
    console.error("Error fetching lesson:", error)
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    )
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
