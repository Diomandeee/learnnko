import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    // Get all lessons from database
    const lessons = await prisma.nkoLesson.findMany({
      orderBy: [
        { level: 'asc' },
        { order: 'asc' }
      ],
      include: {
        progress: true
      }
    })

    // Transform lessons to match the UI format
    const transformedLessons = lessons.map(lesson => ({
      id: lesson.slug, // Use slug as ID for frontend compatibility
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description || "",
      level: lesson.level,
      duration: lesson.duration || "30 minutes",
      estimatedTime: lesson.estimatedTime,
      topics: lesson.topics || [],
      prerequisites: lesson.prerequisites || [],
      // Use actual progress data from database
      progress: lesson.progress?.progress || 0,
      isCompleted: lesson.progress?.completed || false,
      isLocked: lesson.prerequisites.length === 0 ? false : 
                lesson.prerequisites.some(prereq => 
                  !lessons.find(l => l.slug === prereq)?.progress?.completed
                ),
      content: lesson.content,
      objectives: lesson.objectives || [],
      vocabulary: lesson.vocabulary || [],
      grammarPoints: lesson.grammarPoints || [],
      culturalNotes: lesson.culturalNotes || [],
      difficulty: lesson.difficulty,
      tags: lesson.tags || []
    }))

    return NextResponse.json(transformedLessons)
  } catch (error) {
    console.error("Error fetching lessons:", error)
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    )
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
