import { PrismaClient } from '@prisma/client'

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

  // Seed N'Ko Lessons
  const lessons = [
    {
      title: 'Introduction to N\'Ko Script',
      description: 'Learn the basics of N\'Ko writing system and its history',
      level: 'beginner',
      module: 'foundations',
      moduleOrder: 1,
      track: 'foundations',
      order: 1,
      prerequisites: [],
      topics: ['script-basics', 'history', 'overview'],
      estimatedTime: 30,
      duration: '30 minutes',
      tags: ['introduction', 'script', 'history'],
      objectives: [
        'Understand the history and importance of N\'Ko script',
        'Recognize basic N\'Ko characters',
        'Learn the direction of N\'Ko writing'
      ],
      vocabulary: ['ߒߞߏ', 'ߞߊ߲', 'ߝߊ߬ߙߊ߲߬ߕߍ'],
      grammarPoints: ['Right-to-left writing direction', 'Character formation'],
      culturalNotes: [
        'N\'Ko was created by Solomana Kante in 1949',
        'Used primarily for Manding languages'
      ],
      difficulty: 1,
      content: {
        sections: [
          {
            id: 'intro',
            title: 'What is N\'Ko?',
            content: 'N\'Ko is a script created for Manding languages...',
            exercises: []
          },
          {
            id: 'history',
            title: 'Historical Background',
            content: 'Created by Solomana Kante in 1949...',
            exercises: []
          }
        ],
        quizQuestions: [
          {
            id: 'q1',
            question: 'Who created the N\'Ko script?',
            options: ['Solomana Kante', 'Ibn Battuta', 'Al-Umari', 'Sundiata'],
            correct: 0,
            explanation: 'Solomana Kante created N\'Ko in 1949'
          }
        ],
        summary: 'You\'ve learned the basics of N\'Ko script and its historical significance.',
        vocabulary: [
          { nko: 'ߒߞߏ', french: 'notre langue', english: 'our language' }
        ]
      }
    },
    {
      title: 'N\'Ko Vowels and Pronunciation',
      description: 'Master the seven vowels of N\'Ko and their pronunciation',
      level: 'beginner',
      module: 'foundations',
      moduleOrder: 1,
      track: 'foundations',
      order: 2,
      prerequisites: ['1'],
      topics: ['vowels', 'pronunciation', 'phonetics'],
      estimatedTime: 45,
      duration: '45 minutes',
      tags: ['vowels', 'pronunciation', 'phonetics'],
      objectives: [
        'Identify all seven N\'Ko vowels',
        'Pronounce vowels correctly',
        'Distinguish between similar vowel sounds'
      ],
      vocabulary: ['ߊ', 'ߋ', 'ߌ', 'ߍ', 'ߎ', 'ߏ', 'ߐ'],
      grammarPoints: ['Vowel harmony', 'Vowel length'],
      culturalNotes: [
        'Vowel pronunciation varies by region',
        'Tone is important in N\'Ko languages'
      ],
      difficulty: 1,
      content: {
        sections: [
          {
            id: 'vowel-intro',
            title: 'The Seven Vowels',
            content: 'N\'Ko has seven distinct vowel sounds...',
            exercises: []
          },
          {
            id: 'pronunciation',
            title: 'Pronunciation Guide',
            content: 'Each vowel has a specific sound...',
            exercises: []
          }
        ],
        quizQuestions: [
          {
            id: 'q1',
            question: 'How many vowels does N\'Ko have?',
            options: ['5', '6', '7', '8'],
            correct: 2,
            explanation: 'N\'Ko has seven distinct vowels'
          }
        ],
        summary: 'You can now identify and pronounce all N\'Ko vowels.',
        vocabulary: [
          { nko: 'ߊ', french: 'a', english: 'a (as in father)' },
          { nko: 'ߋ', french: 'é', english: 'e (as in hey)' }
        ]
      }
    },
    {
      title: 'Basic N\'Ko Consonants',
      description: 'Learn fundamental consonants and character formation',
      level: 'beginner',
      module: 'foundations',
      moduleOrder: 1,
      track: 'foundations',
      order: 3,
      prerequisites: ['1', '2'],
      topics: ['consonants', 'character-formation', 'writing'],
      estimatedTime: 60,
      duration: '60 minutes',
      tags: ['consonants', 'writing', 'characters'],
      objectives: [
        'Recognize basic N\'Ko consonants',
        'Write consonants correctly',
        'Combine consonants with vowels'
      ],
      vocabulary: ['ߓ', 'ߕ', 'ߖ', 'ߘ', 'ߞ', 'ߟ', 'ߡ'],
      grammarPoints: ['Consonant clusters', 'Character connection'],
      culturalNotes: [
        'Some consonants are unique to certain dialects',
        'Writing style can vary between regions'
      ],
      difficulty: 2,
      content: {
        sections: [
          {
            id: 'basic-consonants',
            title: 'Introduction to Consonants',
            content: 'N\'Ko consonants form the backbone of words...',
            exercises: []
          },
          {
            id: 'writing-practice',
            title: 'Writing Practice',
            content: 'Practice writing each consonant...',
            exercises: []
          }
        ],
        quizQuestions: [
          {
            id: 'q1',
            question: 'Which character represents the "b" sound?',
            options: ['ߓ', 'ߕ', 'ߖ', 'ߘ'],
            correct: 0,
            explanation: 'ߓ represents the "b" sound in N\'Ko'
          }
        ],
        summary: 'You can now write and recognize basic N\'Ko consonants.',
        vocabulary: [
          { nko: 'ߓߊ', french: 'chèvre', english: 'goat' },
          { nko: 'ߕߌ', french: 'arbre', english: 'tree' }
        ]
      }
    }
  ]

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
  console.log('  - 3 N\'Ko lessons')
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