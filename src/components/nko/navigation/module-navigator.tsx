"use client"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Check, Lock } from "lucide-react"
import Link from "next/link"
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
import { getModuleById, getModulesByLevel, getModulesByTrack } from "@/lib/nko/modules/module-definitions"

interface ModuleNavigatorProps {
  currentLessonId?: string
  completedLessons: string[]
  level?: 'beginner' | 'intermediate' | 'advanced'
  track?: string
}

export function ModuleNavigator({ 
  currentLessonId,
  completedLessons,
  level = 'beginner',
  track 
}: ModuleNavigatorProps) {
  // Get modules based on filters
  const modules = track 
    ? getModulesByTrack(track).filter(m => m.level === level)
    : getModulesByLevel(level);
  
  // Sort modules by order
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);
  
  // Find current module
  const currentModuleId = currentLessonId 
    ? modules.find(m => m.lessons.includes(currentLessonId))?.id 
    : undefined;
  
  // Track expanded modules
  const [expandedModules, setExpandedModules] = useState<string[]>(
    currentModuleId ? [currentModuleId] : []
  );
  
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };
  
  // Calculate if a lesson is locked
  const isLessonLocked = (moduleIndex: number, lessonIndex: number) => {
    // First module, first lesson is always unlocked
    if (moduleIndex === 0 && lessonIndex === 0) return false;
    
    // Check if previous lesson is completed
    const currentModule = sortedModules[moduleIndex];
    
    if (lessonIndex > 0) {
      // Not first lesson in module, check if previous lesson is completed
      const prevLessonId = currentModule.lessons[lessonIndex - 1];
      return !completedLessons.includes(prevLessonId);
    } else {
      // First lesson in module, check if last lesson of previous module is completed
      if (moduleIndex > 0) {
        const prevModule = sortedModules[moduleIndex - 1];
        const lastLessonOfPrevModule = prevModule.lessons[prevModule.lessons.length - 1];
        return !completedLessons.includes(lastLessonOfPrevModule);
      }
    }
    
    return false;
  };
  
  // Calculate module completion percentage
  const getModuleCompletionPercentage = (moduleId: string) => {
    const moduleItem = getModuleById(moduleId);
    if (!moduleItem) return 0;
    
    const moduleLessons = moduleItem.lessons;
    const completedModuleLessons = moduleLessons.filter(
      lessonId => completedLessons.includes(lessonId)
    );
    
    return Math.round((completedModuleLessons.length / moduleLessons.length) * 100);
  };
  
  return (
    <div className="space-y-4">
      {sortedModules.map((module, moduleIndex) => (
        <Collapsible
          key={module.id}
          open={expandedModules.includes(module.id)}
          onOpenChange={() => toggleModule(module.id)}
          className="border rounded-lg"
        >
          <Card className="border-0 shadow-none">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {expandedModules.includes(module.id) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                  <Badge className="ml-2">
                    {getModuleCompletionPercentage(module.id)}%
                  </Badge>
                </div>
                <Progress 
                  value={getModuleCompletionPercentage(module.id)} 
                  className="h-1 mt-2" 
                />
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {module.lessons.map((lessonId, lessonIndex) => {
                    const isCompleted = completedLessons.includes(lessonId);
                    const isCurrent = lessonId === currentLessonId;
                    const isLocked = isLessonLocked(moduleIndex, lessonIndex);
                    
                    return (
                      <li key={lessonId}>
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : isLocked ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                          )}
                          
                          {isLocked ? (
                            <span className="text-muted-foreground">
                              Lesson {lessonIndex + 1}
                            </span>
                          ) : (
                            <Link 
                              href={`/dashboard/nko/lessons/${lessonId}`}
                              className={`hover:underline ${isCurrent ? 'font-bold' : ''}`}
                            >
                              Lesson {lessonIndex + 1}
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}
