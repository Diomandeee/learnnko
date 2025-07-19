import path from 'path';
import fs from 'fs';
import { ParsedLesson, parseLessonMarkdown } from './markdown-parser';
import { getMongoDatabaseId } from '../db/id-mapping-store';
import { prisma } from '@/lib/db/prisma';

export async function loadLessonById(id: string): Promise<ParsedLesson | null> {
  // Look for lesson in multiple locations
  const possiblePaths = [
    `src/content/lessons/beginner/${id}/lesson.md`,
    `src/content/lessons/intermediate/${id}/lesson.md`,
    `src/content/lessons/advanced/${id}/lesson.md`,
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(path.resolve(process.cwd(), filePath))) {
      return await parseLessonMarkdown(filePath);
    }
  }
  
  return null;
}

export async function getAllLessons(): Promise<ParsedLesson[]> {
  const levels = ['beginner', 'intermediate', 'advanced'];
  const allLessons: ParsedLesson[] = [];
  
  for (const level of levels) {
    const levelPath = path.resolve(process.cwd(), `src/content/lessons/${level}`);
    
    if (fs.existsSync(levelPath)) {
      const lessonFolders = fs.readdirSync(levelPath);
      
      for (const folder of lessonFolders) {
        const lessonPath = path.join(levelPath, folder, 'lesson.md');
        
        if (fs.existsSync(lessonPath)) {
          const lesson = await parseLessonMarkdown(lessonPath);
          allLessons.push(lesson);
        }
      }
    }
  }
  
  // Sort by order
  return allLessons.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export async function syncLessonToDatabase(lesson: ParsedLesson): Promise<void> {
  try {
    const mongoId = getMongoDatabaseId(lesson.id);
    
    // Convert lesson to database format
    const lessonData = {
      id: mongoId,
      title: lesson.frontmatter.title,
      description: lesson.frontmatter.description,
      level: lesson.frontmatter.level,
      module: lesson.frontmatter.module,
      moduleOrder: lesson.frontmatter.moduleOrder,
      order: lesson.frontmatter.order,
      duration: lesson.frontmatter.duration,
      content: {
        sections: lesson.sections.map(section => ({
          title: section.title,
          content: section.html,
          exercises: section.exercises || []
        })),
        quizQuestions: lesson.quiz.questions,
        summary: lesson.summary,
        vocabulary: lesson.vocabulary
      },
      objectives: extractObjectives(lesson),
      prerequisites: lesson.frontmatter.prerequisites,
      topics: lesson.frontmatter.topics
    };
    
    // Upsert to database
    await prisma.nkoLesson.upsert({
      where: { id: mongoId },
      update: lessonData,
      create: lessonData
    });
    
    console.log(`Synced lesson ${lesson.id} to database`);
  } catch (error) {
    console.error(`Error syncing lesson ${lesson.id} to database:`, error);
  }
}

function extractObjectives(lesson: ParsedLesson): string[] {
  // Look for the learning objectives section
  const objectivesSection = lesson.sections.find(
    section => section.title.toLowerCase().includes('learning objectives')
  );
  
  if (!objectivesSection) return [];
  
  // Extract list items from the section
  const listItemRegex = /<li>(.*?)<\/li>/g;
  const objectives: string[] = [];
  
  let match;
  while ((match = listItemRegex.exec(objectivesSection.html)) !== null) {
    objectives.push(match[1].trim());
  }
  
  return objectives;
}
