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
        userProgress: true
      }
    })

    // Transform lessons to match the UI format
    const transformedLessons = lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || "",
      level: lesson.level,
      duration: lesson.duration || 0,
      topics: lesson.topics || [],
      prerequisites: lesson.prerequisites || [],
      // For now, using mock progress - will implement user-specific progress later
      progress: lesson.id === "intro-to-nko" ? 100 : 
                lesson.id === "alphabet-vowels" ? 75 :
                lesson.id === "alphabet-consonants-1" ? 40 : 0,
      isCompleted: lesson.id === "intro-to-nko",
      isLocked: !lesson.prerequisites.length && 
                (lesson.id === "intro-to-nko" || lesson.id === "alphabet-vowels" || lesson.id === "alphabet-consonants-1") 
                ? false : true,
      content: lesson.content,
      objectives: lesson.objectives || []
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
