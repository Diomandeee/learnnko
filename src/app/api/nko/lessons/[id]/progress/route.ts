import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lessonSlug = id;

    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // First find the lesson by slug
    const lesson = await prisma.nkoLesson.findUnique({
      where: { slug: lessonSlug }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Get lesson progress using the composite key
    const progress = await prisma.nkoUserLessonProgress.findUnique({
      where: { 
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lesson.id
        }
      }
    });

    if (!progress) {
      // Return default progress if none exists
      return NextResponse.json({
        lessonId: lesson.id,
        lessonSlug: lesson.slug,
        progress: 0,
        completed: false,
        timeSpent: 0,
        lastAccessed: null,
        exercisesCompleted: [],
        currentSection: 0
      });
    }

    return NextResponse.json({
      ...progress,
      lessonSlug: lesson.slug
    });
  } catch (error) {
    console.error("Error fetching lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson progress" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lessonSlug = id;
    const {
      progress,
      completed,
      timeSpent,
      exercisesCompleted,
      currentSection,
      notes
    } = await req.json();

    // First find the lesson by slug
    const lesson = await prisma.nkoLesson.findUnique({
      where: { slug: lessonSlug }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Update or create lesson progress using the actual lesson ID
    const lessonProgress = await prisma.nkoUserLessonProgress.upsert({
      where: {
        lessonId: lesson.id
      },
      update: {
        progress: progress ?? undefined,
        completed: completed ?? undefined,
        timeSpent: timeSpent ?? undefined,
        exercisesCompleted: exercisesCompleted ?? undefined,
        currentSection: currentSection ?? undefined,
        notes: notes ?? undefined,
        lastAccessed: new Date(),
        updatedAt: new Date()
      },
      create: {
        lessonId: lesson.id,
        progress: progress || 0,
        completed: completed || false,
        timeSpent: timeSpent || 0,
        exercisesCompleted: exercisesCompleted || [],
        currentSection: currentSection || 0,
        notes: notes || null,
        lastAccessed: new Date()
      }
    });

    return NextResponse.json(lessonProgress);
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to update lesson progress" },
      { status: 500 }
    );
  }
}
