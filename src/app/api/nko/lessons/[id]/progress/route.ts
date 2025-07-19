import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id;

    // Get global lesson progress (first available record)
    const progress = await prisma.nkoUserLessonProgress.findFirst({
      where: { lessonId }
    });

    if (!progress) {
      // Return default progress if none exists
      return NextResponse.json({
        lessonId,
        progress: 0,
        completed: false,
        timeSpent: 0,
        lastAccessed: null,
        exercisesCompleted: [],
        currentSection: 0
      });
    }

    return NextResponse.json(progress);
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
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id;
    const {
      progress,
      completed,
      timeSpent,
      exercisesCompleted,
      currentSection,
      notes
    } = await req.json();

    // Update or create global lesson progress
    const lessonProgress = await prisma.nkoUserLessonProgress.upsert({
      where: {
        // Use lesson ID as unique identifier since we're going global
        lessonId
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
        lessonId,
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
