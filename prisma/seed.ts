import { PrismaClient } from '@prisma/client'
import { nkoLessonLibrary } from '../src/lib/nko/seed/lessons/lesson-library'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (optional - remove in production)
  await prisma.nkoUserLessonProgress.deleteMany({})
  await prisma.nkoLesson.deleteMany({})
  await prisma.nkoDictionaryEntry.deleteMany({})
  await prisma.nkoDictionaryCategory.deleteMany({})
  await prisma.nkoUserVocabulary.deleteMany({})
  await prisma.wordBank.deleteMany({})

  // Seed Dictionary Categories
  const categories = await prisma.nkoDictionaryCategory.createMany({
    data: [
      {
        name: 'Basic Greetings',
        slug: 'greetings',
        description: 'Common N\'Ko greetings and salutations',
        order: 1
      },
      {
        name: 'Family & Relationships',
        slug: 'family',
        description: 'Family members and relationship terms',
        order: 2
      },
      {
        name: 'Numbers & Time',
        slug: 'numbers-time',
        description: 'Numbers, dates, and time expressions',
        order: 3
      },
      {
        name: 'Food & Drink',
        slug: 'food-drink',
        description: 'Food, beverages, and dining terms',
        order: 4
      },
      {
        name: 'Daily Activities',
        slug: 'daily-activities',
        description: 'Common daily activities and verbs',
        order: 5
      }
    ]
  })

  // Seed Dictionary Entries
  const dictionaryEntries = [
    {
      nkoText: 'ߌ ߣߌ߫ ߗߋ',
      pronunciation: 'i ni che',
      translation: 'hello/good morning',
      definition: 'A common greeting used in the morning',
      examples: ['ߌ ߣߌ߫ ߗߋ ߞߎ߬ߙߎ - Hello everyone'],
      categories: ['greetings'],
      difficulty: 'beginner',
      tags: ['greeting', 'morning', 'basic']
    },
    {
      nkoText: 'ߌ ߣߌ߫ ߛߋ',
      pronunciation: 'i ni se',
      translation: 'good evening',
      definition: 'Evening greeting',
      examples: ['ߌ ߣߌ߫ ߛߋ ߞߎ߬ߙߎ - Good evening everyone'],
      categories: ['greetings'],
      difficulty: 'beginner',
      tags: ['greeting', 'evening', 'basic']
    },
    {
      nkoText: 'ߒ ߬ߝߊ',
      pronunciation: 'n ba',
      translation: 'my father',
      definition: 'Term for father in N\'Ko',
      examples: ['ߒ ߬ߝߊ ߟߊ߫ - my father\'s'],
      categories: ['family'],
      difficulty: 'beginner',
      tags: ['family', 'father', 'basic']
    },
    {
      nkoText: 'ߒ ߬ߣߊ',
      pronunciation: 'n na',
      translation: 'my mother',
      definition: 'Term for mother in N\'Ko',
      examples: ['ߒ ߬ߣߊ ߟߊ߫ - my mother\'s'],
      categories: ['family'],
      difficulty: 'beginner',
      tags: ['family', 'mother', 'basic']
    },
    {
      nkoText: 'ߞߏ߫',
      pronunciation: 'ko',
      translation: 'one',
      definition: 'The number one',
      examples: ['ߞߏ߫ ߞߎ߬ߙߎ - one person'],
      categories: ['numbers-time'],
      difficulty: 'beginner',
      tags: ['number', 'counting', 'basic']
    }
  ]

  for (const entry of dictionaryEntries) {
    await prisma.nkoDictionaryEntry.create({
      data: entry
    })
  }

  // Seed Word Bank
  const wordBankEntries = [
    {
      word: 'bonjour',
      translation: 'ߌ ߣߌ߫ ߗߋ',
      definition: 'greeting used in the morning',
      context: 'formal greeting',
      language: 'fr'
    },
    {
      word: 'bonsoir',
      translation: 'ߌ ߣߌ߫ ߛߋ',
      definition: 'greeting used in the evening',
      context: 'formal greeting',
      language: 'fr'
    },
    {
      word: 'famille',
      translation: 'ߘߌߡߌ߲',
      definition: 'group of related people',
      context: 'family relationships',
      language: 'fr'
    },
    {
      word: 'eau',
      translation: 'ߖߌ',
      definition: 'water, essential liquid',
      context: 'beverages',
      language: 'fr'
    },
    {
      word: 'manger',
      translation: 'ߞߍ߫',
      definition: 'to consume food',
      context: 'daily activities',
      language: 'fr'
    }
  ]

  await prisma.wordBank.createMany({
    data: wordBankEntries
  })

  // Seed N'Ko Lessons (from the in-repo lesson library)
  const lessons = nkoLessonLibrary.map((lesson) => ({
    ...lesson,
    isActive: lesson.isActive ?? true,
  }))

  for (const lesson of lessons) {
    await prisma.nkoLesson.create({
      data: lesson
    })
  }

  // Seed User Vocabulary
  const vocabularyEntries = [
    {
      word: 'ߌ ߣߌ߫ ߗߋ',
      translation: 'hello/good morning',
      definition: 'Common morning greeting',
      example: 'ߌ ߣߌ߫ ߗߋ ߞߎ߬ߙߎ',
      difficulty: 'beginner',
      mastery: 85.0,
      timesReviewed: 5
    },
    {
      word: 'ߒߞߏ',
      translation: 'N\'Ko language',
      definition: 'The N\'Ko language and script',
      example: 'ߒߞߏ ߞߊ߲ ߞߎ߬ߙߎ',
      difficulty: 'beginner',
      mastery: 70.0,
      timesReviewed: 3
    },
    {
      word: 'ߘߌߡߌ߲',
      translation: 'family',
      definition: 'Family or related group',
      example: 'ߘߌߡߌ߲ ߞߎ߬ߙߎ',
      difficulty: 'beginner',
      mastery: 90.0,
      timesReviewed: 7
    }
  ]

  await prisma.nkoUserVocabulary.createMany({
    data: vocabularyEntries
  })

  // Seed User Progress
  await prisma.nkoUserProgress.create({
    data: {
      alphabet: 75,
      vocabulary: 60,
      grammar: 40,
      conversation: 30,
      streak: 5,
      totalTime: 240, // 4 hours
      lastStudied: new Date()
    }
  })

  console.log('✅ Database seeding completed successfully!')
  console.log('📊 Created:')
  console.log('  - 5 Dictionary categories')
  console.log('  - 5 Dictionary entries')
  console.log('  - 5 Word bank entries')
  console.log(`  - ${lessons.length} N'Ko lessons`)
  console.log('  - 3 Vocabulary entries')
  console.log('  - 1 User progress record')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
