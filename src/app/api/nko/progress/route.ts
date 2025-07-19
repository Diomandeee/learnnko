import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    // Get global N'Ko progress (first available record)
    const progress = await prisma.nkoUserProgress.findFirst();

    // Get total completed lessons globally
    const completedLessons = await prisma.nkoUserLessonProgress.findMany({
      where: { 
        completed: true
      }
    });

    // Get vocabulary progress globally
    const vocabularyCount = await prisma.nkoUserVocabulary.count();

    // Get latest lesson accessed globally
    const latestLesson = await prisma.nkoUserLessonProgress.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    // Calculate global total time spent
    const totalTimeSpent = await prisma.nkoUserLessonProgress.aggregate({
      _sum: { timeSpent: true }
    });

    return NextResponse.json({
      progress: progress || {
        alphabet: 0,
        vocabulary: 0,
        grammar: 0,
        conversation: 0
      },
      completedLessons: completedLessons.map(lesson => lesson.lessonId),
      vocabularyCount,
      latestLesson: latestLesson?.lessonId,
      streak: progress?.streak || 0,
      timeStudied: totalTimeSpent._sum.timeSpent || 0
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const progressData = await req.json();
    
    // Update global progress (create or update first record)
    const existingProgress = await prisma.nkoUserProgress.findFirst();
    
    let updatedProgress;
    if (existingProgress) {
      updatedProgress = await prisma.nkoUserProgress.update({
        where: { id: existingProgress.id },
        data: progressData
      });
    } else {
      updatedProgress = await prisma.nkoUserProgress.create({
        data: progressData
      });
    }

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
