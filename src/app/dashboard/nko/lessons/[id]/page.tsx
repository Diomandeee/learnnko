import { Metadata } from "next"
import { notFound } from "next/navigation"
import { MarkdownLessonView } from "@/components/nko/lessons/markdown/markdown-lesson-view"
import { prisma } from "@/lib/db/prisma"
import { getMongoDatabaseId } from "@/lib/nko/modules/module-definitions"

// Properly handle params
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `N'Ko Lesson: ${params.id}`,
    description: "Learn N'Ko language and writing system",
  }
}

export default async function LessonPage({ params }: { params: { id: string } }) {
  const lessonId = params.id;

  try {
    // Find lesson by title or id
    let lesson;
    
    if (lessonId === "alphabet-basics") {
      lesson = await prisma.nkoLesson.findFirst({
        where: {
          OR: [
            { title: "Alphabet Basics" },
            { id: getMongoDatabaseId(lessonId) }
          ]
        }
      });
    } else {
      lesson = await prisma.nkoLesson.findUnique({
        where: { id: getMongoDatabaseId(lessonId) }
      });
    }

    if (!lesson) {
      console.error(`Lesson not found: ${lessonId}`);
      notFound();
    }

    // Get global progress for this lesson
    const progress = await prisma.nkoUserLessonProgress.findFirst({
      where: {
        lessonId: lesson.id
      }
    });

    // Format initial progress
    const initialProgress = progress ? {
      currentSection: 0,
      sectionsCompleted: progress.sectionsCompleted || 
                        Array(lesson.content.sections?.length || 0).fill(false),
      quizAnswers: Array(lesson.content.quizQuestions?.length || 0).fill(-1),
      quizCompleted: progress.completed,
      lessonCompleted: progress.completed,
      overallProgress: progress.progress || 0
    } : undefined;

    // Save progress function (global progress)
    const saveProgress = async (newProgress: any) => {
      try {
        // Update or create global progress for this lesson
        const existingProgress = await prisma.nkoUserLessonProgress.findFirst({
          where: { lessonId: lesson.id }
        });

        if (existingProgress) {
          await prisma.nkoUserLessonProgress.update({
            where: { id: existingProgress.id },
            data: {
              progress: newProgress.overallProgress,
              completed: newProgress.lessonCompleted,
              sectionsCompleted: newProgress.sectionsCompleted,
              updatedAt: new Date()
            }
          });
        } else {
          await prisma.nkoUserLessonProgress.create({
            data: {
              lessonId: lesson.id,
              progress: newProgress.overallProgress,
              completed: newProgress.lessonCompleted,
              sectionsCompleted: newProgress.sectionsCompleted
            }
          });
        }
        return true;
      } catch (error) {
        console.error("Error saving progress:", error);
        return false;
      }
    };

    return (
      <div className="container mx-auto py-6">
        <MarkdownLessonView
          lesson={{
            id: lessonId,
            frontmatter: {
              id: lessonId,
              title: lesson.title,
              description: lesson.description,
              level: lesson.level as any,
              module: lesson.module,
              moduleOrder: lesson.moduleOrder,
              order: lesson.order,
              duration: lesson.duration,
              prerequisites: lesson.prerequisites as any,
              topics: lesson.topics as any
            },
            htmlContent: "",
            sections: lesson.content.sections,
            quiz: {
              questions: lesson.content.quizQuestions
            },
            summary: lesson.content.summary,
            vocabulary: lesson.content.vocabulary
          }}
          onSaveProgress={saveProgress}
          initialProgress={initialProgress}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading lesson:", error);
    notFound();
  }
}
