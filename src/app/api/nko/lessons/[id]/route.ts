import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id

    // Get lesson from database
    const lesson = await prisma.nkoLesson.findUnique({
      where: { id: lessonId },
      include: {
        userProgress: true
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      )
    }

    // Transform lesson to include progress info
    const transformedLesson = {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || "",
      level: lesson.level,
      duration: lesson.duration || 0,
      topics: lesson.topics || [],
      prerequisites: lesson.prerequisites || [],
      content: lesson.content,
      objectives: lesson.objectives || [],
      // Mock progress for now
      progress: lesson.id === "intro-to-nko" ? 100 : 
                lesson.id === "alphabet-vowels" ? 75 :
                lesson.id === "alphabet-consonants-1" ? 40 : 0,
      isCompleted: lesson.id === "intro-to-nko",
      isLocked: !lesson.prerequisites.length && 
                (lesson.id === "intro-to-nko" || lesson.id === "alphabet-vowels" || lesson.id === "alphabet-consonants-1") 
                ? false : true
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
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await req.json();
    
    // Convert string ID to MongoDB ID
    const mongoId = getMongoDatabaseId(params.id);
    
    // Check if lesson exists
    const lesson = await prisma.nkoLesson.findUnique({
      where: { id: mongoId }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Update the lesson
    const updatedLesson = await prisma.nkoLesson.update({
      where: { id: mongoId },
      data: updateData
    });

    return NextResponse.json({
      ...updatedLesson,
      id: params.id // Return original string ID
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
  { params }: { params: { id: string } }
) {
  try {
    // Convert string ID to MongoDB ID
    const mongoId = getMongoDatabaseId(params.id);
    
    // Check if lesson exists
    const lesson = await prisma.nkoLesson.findUnique({
      where: { id: mongoId }
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
        where: { lessonId: mongoId }
      }),
      prisma.nkoLesson.delete({
        where: { id: mongoId }
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
