import { prisma } from "@/lib/db/prisma"
import { nkoLessonLibrary } from "./lessons/lesson-library"

export async function seedNkoLessons() {
  try {
    const existingCount = await prisma.nkoLesson.count()
    if (existingCount > 0) {
      console.log(
        `Found ${existingCount} existing lessons. Upserting lesson library (adds new, updates existing)...`
      )
    } else {
      console.log("No existing lessons found. Seeding lesson library...")
    }

    for (const lesson of nkoLessonLibrary) {
      await prisma.nkoLesson.upsert({
        where: { slug: lesson.slug },
        update: {
          ...lesson,
          isActive: lesson.isActive ?? true,
        },
        create: {
          ...lesson,
          isActive: lesson.isActive ?? true,
        },
      })
    }

    console.log(`✅ Seeded/updated ${nkoLessonLibrary.length} N'Ko lessons from the lesson library.`)
  } catch (error) {
    console.error("Error seeding N'Ko lessons:", error)
  }
}
