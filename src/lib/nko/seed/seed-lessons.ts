// src/lib/nko/seed/seed-lessons.ts
import { prisma } from "@/lib/db/prisma"
import { alphabetVowelsLesson } from "./lessons/beginner/alphabet-vowels"
import { nkoHistoryLesson } from "./lessons/beginner/nko-history"
import { alphabetBasicsLesson } from "./lessons/beginner/alphabet-basics"
import { getMongoDatabaseId } from "@/lib/nko/modules/module-definitions"

export async function seedNkoLessons() {
  try {
    // Check if lessons already exist
    const existingLessons = await prisma.nkoLesson.findMany();
    
    if (existingLessons.length > 0) {
      console.log(`Found ${existingLessons.length} existing lessons. Checking for new ones to add...`);
    }
    
    // Seed the nko history lesson
    const historyLessonId = getMongoDatabaseId("nko-history");
    const existingHistoryLesson = await prisma.nkoLesson.findUnique({
      where: { id: historyLessonId }
    });
    
    if (!existingHistoryLesson) {
      await prisma.nkoLesson.create({
        data: {
          id: historyLessonId,
          title: nkoHistoryLesson.title,
          description: nkoHistoryLesson.description,
          level: nkoHistoryLesson.level,
          module: nkoHistoryLesson.module,
          moduleOrder: nkoHistoryLesson.moduleOrder,
          order: nkoHistoryLesson.order,
          duration: nkoHistoryLesson.duration,
          content: nkoHistoryLesson.content,
          objectives: nkoHistoryLesson.content.objectives,
          prerequisites: nkoHistoryLesson.prerequisites,
          topics: nkoHistoryLesson.topics
        }
      });
      console.log("Successfully seeded N'Ko history lesson!");
    } else {
      console.log("N'Ko history lesson already exists.");
    }
    
    // Seed the alphabet vowels lesson
    const vowelsLessonId = getMongoDatabaseId("alphabet-vowels");
    const existingVowelsLesson = await prisma.nkoLesson.findUnique({
      where: { id: vowelsLessonId }
    });
    
    if (!existingVowelsLesson) {
      await prisma.nkoLesson.create({
        data: {
          id: vowelsLessonId,
          title: alphabetVowelsLesson.title,
          description: alphabetVowelsLesson.description,
          level: alphabetVowelsLesson.level,
          module: alphabetVowelsLesson.module,
          moduleOrder: alphabetVowelsLesson.moduleOrder,
          order: alphabetVowelsLesson.order,
          duration: alphabetVowelsLesson.duration,
          content: alphabetVowelsLesson.content,
          objectives: alphabetVowelsLesson.content.objectives,
          prerequisites: alphabetVowelsLesson.prerequisites,
          topics: alphabetVowelsLesson.topics
        }
      });
      console.log("Successfully seeded N'Ko alphabet vowels lesson!");
    } else {
      console.log("N'Ko alphabet vowels lesson already exists.");
    }
    
    // Seed the alphabet basics lesson
    const basicsLessonId = getMongoDatabaseId("alphabet-basics");
    const existingBasicsLesson = await prisma.nkoLesson.findUnique({
      where: { id: basicsLessonId }
    });
    
    if (!existingBasicsLesson) {
      await prisma.nkoLesson.create({
        data: {
          id: basicsLessonId,
          title: alphabetBasicsLesson.title,
          description: alphabetBasicsLesson.description,
          level: alphabetBasicsLesson.level,
          module: alphabetBasicsLesson.module,
          moduleOrder: alphabetBasicsLesson.moduleOrder,
          order: alphabetBasicsLesson.order,
          duration: alphabetBasicsLesson.duration,
          content: alphabetBasicsLesson.content,
          objectives: alphabetBasicsLesson.content.objectives,
          prerequisites: alphabetBasicsLesson.prerequisites,
          topics: alphabetBasicsLesson.topics
        }
      });
      console.log("Successfully seeded N'Ko alphabet basics lesson!");
    } else {
      console.log("N'Ko alphabet basics lesson already exists.");
    }
    
    // Add more lesson seeds as you develop them
    
  } catch (error) {
    console.error("Error seeding N'Ko lessons:", error);
  }
}