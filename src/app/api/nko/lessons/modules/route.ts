import { NextResponse } from "next/server";
import { getModulesByLevel, getModulesByTrack, moduleDefinitions } from "@/lib/nko/modules/module-definitions";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const level = url.searchParams.get('level');
    const track = url.searchParams.get('track');
    
    // Get modules based on filters
    let modules;
    if (level && track) {
      modules = getModulesByTrack(track).filter(m => m.level === level);
    } else if (level) {
      modules = getModulesByLevel(level);
    } else if (track) {
      modules = getModulesByTrack(track);
    } else {
      modules = moduleDefinitions;
    }
    
    // Sort modules by order
    const sortedModules = [...modules].sort((a, b) => a.order - b.order);
    
    // Get global progress for calculations
    const globalLessonProgress = await prisma.nkoUserLessonProgress.findMany();
    
    const completedLessonIds = globalLessonProgress
      .filter(p => p.completed)
      .map(p => p.lessonId);
    
    // For each module, calculate progress
    const modulesWithProgress = sortedModules.map(module => {
      // Calculate completion percentage for this module
      const totalLessons = module.lessons.length;
      const completedInModule = module.lessons.filter(lessonId => 
        completedLessonIds.includes(lessonId)
      ).length;
      
      const completionPercentage = totalLessons > 0 
        ? Math.round((completedInModule / totalLessons) * 100)
        : 0;
      
      return {
        ...module,
        completionPercentage,
        completedLessons: completedInModule,
        totalLessons
      };
    });
    
    return NextResponse.json({
      modules: modulesWithProgress,
      summary: {
        totalModules: modulesWithProgress.length,
        completedModules: modulesWithProgress.filter(m => m.completionPercentage === 100).length,
        inProgressModules: modulesWithProgress.filter(m => m.completionPercentage > 0 && m.completionPercentage < 100).length
      }
    });
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}
