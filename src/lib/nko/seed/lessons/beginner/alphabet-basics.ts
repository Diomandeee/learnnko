export const alphabetBasicsLesson = {
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
      {
        title: "Writing Direction",
        content: "N'Ko is written from right to left, similar to Arabic and Hebrew. This can be challenging for those used to left-to-right writing systems, but with practice it becomes natural.",
        exercises: [
          {
            type: "multiple-choice",
            question: "In which direction is N'Ko written?",
            options: ["Left to right", "Right to left", "Top to bottom", "Bottom to top"],
            correctAnswer: 1,
            explanation: "N'Ko is written from right to left."
          }
        ]
      },
      {
        title: "Basic Structure",
        content: "The N'Ko alphabet consists of 27 letters: 7 vowels and 20 consonants. It also includes diacritical marks to indicate tones and other features of pronunciation.",
        exercises: [
          {
            type: "multiple-choice",
            question: "How many vowels are in the N'Ko alphabet?",
            options: ["5", "6", "7", "8"],
            correctAnswer: 2,
            explanation: "The N'Ko alphabet has 7 vowels."
          }
        ]
      }
    ],
    quizQuestions: [
      {
        question: "Who created the N'Ko alphabet?",
        options: ["Solomana Kanté", "Chinua Achebe", "Kwame Nkrumah", "Leopold Senghor"],
        correctAnswer: 0,
        explanation: "Solomana Kanté created the N'Ko alphabet in 1949."
      },
      {
        question: "In which year was the N'Ko alphabet created?",
        options: ["1929", "1949", "1969", "1989"],
        correctAnswer: 1,
        explanation: "The N'Ko alphabet was created in 1949."
      },
      {
        question: "How many letters are in the N'Ko alphabet?",
        options: ["21", "24", "27", "30"],
        correctAnswer: 2,
        explanation: "The N'Ko alphabet consists of 27 letters."
      },
      {
        question: "Which way is N'Ko written?",
        options: ["Left to right", "Right to left", "Top to bottom", "Bottom to top"],
        correctAnswer: 1,
        explanation: "N'Ko is written from right to left, similar to Arabic and Hebrew."
      },
      {
        question: "What does 'N'Ko' mean?",
        options: ["I say", "Our language", "First letters", "Unity"],
        correctAnswer: 0,
        explanation: "'N'Ko' means 'I say' in all Manding languages."
      }
    ],
    summary: "In this lesson, you've learned about the basic structure of the N'Ko alphabet, its history, and its writing direction. You now understand that it was created by Solomana Kanté in 1949, consists of 27 letters (7 vowels and 20 consonants), and is written from right to left.",
    vocabulary: [
      {
        nko: "ߒߞߏ",
        latin: "N'ko",
        english: "I say",
        french: "Je dis"
      },
      {
        nko: "ߛߏߟߊߡߊߣߊ ߞߊ߲ߕߍ",
        latin: "Solomana Kanté",
        english: "Solomana Kanté (creator)",
        french: "Solomana Kanté (créateur)"
      },
      {
        nko: "ߊߟߌߝߊߓߍ",
        latin: "alifabe",
        english: "alphabet",
        french: "alphabet"
      }
    ]
  }
};
