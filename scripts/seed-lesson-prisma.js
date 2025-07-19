// Seeding script using Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getMongoDatabaseId } = require('./src/lib/nko/modules/module-definitions');

// Lesson data
const alphabetBasicsLesson = {
  id: "alphabet-basics",
  title: "Alphabet Basics",
  description: "Learn the N'Ko alphabet and basic characters",
  level: "beginner",
  module: "foundations-intro",
  moduleOrder: 1,
  order: 1,
  duration: 30,
  prerequisites: [],
  topics: ["alphabet", "basics", "writing system"],
  content: {
    objectives: [
      "Understand the basic structure of the N'Ko alphabet",
      "Learn how to recognize N'Ko characters",
      "Understand the right-to-left writing direction",
      "Get familiar with the history of the alphabet"
    ],
    sections: [
      {
        title: "Introduction to N'Ko Alphabet",
        content: "The N'Ko alphabet was created by Solomana Kanté in 1949. It consists of 27 letters written from right to left and is used to write several Manding languages in West Africa.",
        exercises: [
          {
            type: "multiple-choice",
            question: "Who created the N'Ko alphabet?",
            options: ["Solomana Kanté", "Chinua Achebe", "Wole Soyinka", "Kwame Nkrumah"],
            correctAnswer: 0,
            explanation: "Solomana Kanté created the N'Ko alphabet in 1949."
          }
        ]
      },
      // Add other sections as needed
    ],
    quizQuestions: [
      {
        question: "Who created the N'Ko alphabet?",
        options: ["Solomana Kanté", "Chinua Achebe", "Kwame Nkrumah", "Leopold Senghor"],
        correctAnswer: 0,
        explanation: "Solomana Kanté created the N'Ko alphabet in 1949."
      },
      // Add more quiz questions
    ],
    summary: "In this lesson, you've learned about the basic structure of the N'Ko alphabet, its history, and its writing direction.",
    vocabulary: [
      {
        nko: "ߒߞߏ",
        latin: "N'ko",
        english: "I say",
        french: "Je dis"
      }
    ]
  }
};

async function seedLesson() {
  try {
    const dbId = getMongoDatabaseId(alphabetBasicsLesson.id);
    console.log(`Database ID for ${alphabetBasicsLesson.id}: ${dbId}`);
    
    // Check if lesson already exists
    const existingLesson = await prisma.nkoLesson.findUnique({
      where: { id: dbId }
    });
    
    if (existingLesson) {
      console.log("Lesson already exists. Updating...");
      
      // Update the lesson
      await prisma.nkoLesson.update({
        where: { id: dbId },
        data: {
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
    } else {
      console.log("Creating new lesson...");
      
      // Create the lesson with Prisma
      await prisma.nkoLesson.create({
        data: {
          id: dbId,
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
    }
    
    console.log("Lesson seeded successfully!");
  } catch (error) {
    console.error("Error seeding lesson:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLesson();
