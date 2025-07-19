// src/lib/nko/seed/lessons/beginner/alphabet-basics.ts
export const alphabetBasicsLesson = {
    id: "alphabet-basics",
    title: "Alphabet Basics",
    description: "Learn the N'Ko alphabet and basic characters",
    level: "beginner",
    module: "alphabet-fundamentals",
    moduleOrder: 1,
    order: 1,
    duration: 30,
    prerequisites: [],
    topics: ["alphabet", "basics", "writing system"],
    content: {
      objectives: [
        "Understand the structure of the N'Ko alphabet",
        "Learn about the origins of the writing system",
        "Recognize the basic character types",
        "Understand the direction of writing"
      ],
      sections: [
        {
          title: "Introduction to the N'Ko Alphabet",
          content: `
            The N'Ko alphabet is a writing system designed specifically for Manding languages. Created in 1949 by Guinean writer Solomana Kanté, the script is written from right to left and consists of 27 letters: 7 vowels and 20 consonants.
            
            N'Ko was developed to help increase literacy among speakers of Manding languages in West Africa, including Bambara, Jula, and Mandinka.
            
            In this lesson, we'll introduce you to the basic structure of the alphabet and learn how to recognize its components.
          `,
          audioPrompt: "intro-nko-alphabet"
        },
        {
          title: "Right-to-Left Writing",
          content: `
            N'Ko is written from right to left, unlike Latin script which is written from left to right.
            
            This direction was chosen by Solomana Kanté after careful consideration of various factors, including the natural movement of the hand for right-handed writers.
            
            When writing or reading N'Ko, you start from the right side of the page and move to the left.
          `,
          nkoText: "ߞߊ߲ߕߋ",
          pronunciation: "Kanté (the creator's name)",
          latinTransliteration: "Kante",
          audioPrompt: "right-to-left",
          exercises: [
            {
              type: "multiple-choice",
              question: "In which direction is N'Ko written?",
              options: ["Left to right", "Right to left", "Top to bottom", "Bottom to top"],
              correctAnswer: 1,
              explanation: "N'Ko is written from right to left, unlike Latin script which is written from left to right."
            }
          ]
        },
        {
          title: "Components of the Alphabet",
          content: `
            The N'Ko alphabet consists of the following components:
            
            1. 7 vowels (ߊ, ߋ, ߌ, ߍ, ߎ, ߏ, ߐ)
            2. 20 consonants (including ߓ, ߔ, ߕ, etc.)
            3. Diacritical marks for tone (like ߫, ߬, ߭)
            4. Numbers (߀, ߁, ߂, etc.)
            5. Punctuation marks
            
            Each character in N'Ko represents a specific sound, making it a very phonetic writing system.
          `,
          audioPrompt: "components",
          exercises: [
            {
              type: "multiple-choice",
              question: "How many vowels are in the N'Ko alphabet?",
              options: ["5", "6", "7", "8"],
              correctAnswer: 2,
              explanation: "The N'Ko alphabet contains 7 vowels that represent all the vowel sounds in Manding languages."
            }
          ]
        },
        {
          title: "Basic Character Structure",
          content: `
            Each character in N'Ko has a distinctive shape, but they share some common structural elements:
            
            - Most characters include a vertical stem
            - Various hooks, loops, or extensions differentiate the characters
            - The script has a unified, harmonious appearance
            
            The design of N'Ko is both aesthetic and practical, making it relatively easy to learn and write.
          `,
          nkoText: "ߊ ߓ ߞ",
          pronunciation: "a, b, k",
          latinTransliteration: "a, b, k",
          audioPrompt: "character-structure",
          exercises: [
            {
              type: "multiple-choice",
              question: "What common structural element do most N'Ko characters share?",
              options: ["Horizontal line", "Vertical stem", "Circular shape", "Diamond shape"],
              correctAnswer: 1,
              explanation: "Most N'Ko characters include a vertical stem as their main structural element, with various distinguishing features attached."
            }
          ]
        },
        {
          title: "Learning Approach",
          content: `
            The N'Ko alphabet is typically learned in a structured sequence:
            
            1. First, learners master the vowels
            2. Then, consonants are introduced in groups
            3. Finally, tone marks and special characters are taught
            
            This step-by-step approach helps build confidence and ensures a solid foundation in reading and writing N'Ko.
            
            In the following lessons, we'll follow this approach, starting with the seven vowels in detail.
          `,
          audioPrompt: "learning-approach",
          exercises: [
            {
              type: "multiple-choice",
              question: "According to the recommended learning sequence, what should you learn first in N'Ko?",
              options: ["Consonants", "Vowels", "Tone marks", "Numbers"],
              correctAnswer: 1,
              explanation: "Vowels are typically learned first when studying N'Ko, followed by consonants in groups, and then tone marks and special characters."
            }
          ]
        }
      ],
      quizQuestions: [
        {
          question: "Who created the N'Ko alphabet?",
          options: ["Solomana Kanté", "Kwame Nkrumah", "Leopold Senghor", "Cheikh Anta Diop"],
          correctAnswer: 0,
          explanation: "The N'Ko alphabet was created by Solomana Kanté, a Guinean writer and educator, in 1949."
        },
        {
          question: "In which direction is N'Ko written?",
          options: ["Left to right", "Right to left", "Top to bottom", "Bottom to top"],
          correctAnswer: 1,
          explanation: "N'Ko is written from right to left, unlike Latin script."
        },
        {
          question: "How many total letters are in the N'Ko alphabet?",
          options: ["21", "24", "27", "30"],
          correctAnswer: 2,
          explanation: "The N'Ko alphabet consists of 27 letters: 7 vowels and 20 consonants."
        },
        {
          question: "What year was the N'Ko alphabet created?",
          options: ["1929", "1949", "1969", "1989"],
          correctAnswer: 1,
          explanation: "The N'Ko alphabet was created in 1949 by Solomana Kanté."
        },
        {
          question: "What is the recommended first component to learn in the N'Ko alphabet?",
          options: ["Consonants", "Vowels", "Numbers", "Punctuation"],
          correctAnswer: 1,
          explanation: "Vowels are typically the first component learned when studying the N'Ko alphabet."
        }
      ],
      summary: `
        In this lesson, you've learned about the basics of the N'Ko alphabet:
        
        - Created by Solomana Kanté in 1949 for Manding languages
        - Written from right to left
        - Consists of 27 letters (7 vowels and 20 consonants)
        - Includes diacritical marks, numbers, and punctuation
        - Has a structured learning approach starting with vowels
        
        In the next lesson, we'll dive deeper into the seven vowels of N'Ko and learn how to identify and pronounce them.
      `,
      vocabulary: [
        {
          nko: "ߒߞߏ",
          latin: "N'Ko",
          english: "I say (name of the script)",
          french: "Je dis (nom de l'écriture)"
        },
        {
          nko: "ߊߓߗ",
          latin: "abz",
          english: "alphabet",
          french: "alphabet"
        },
        {
          nko: "ߞߊ߲ߕߋ",
          latin: "Kante",
          english: "Kanté (creator's name)",
          french: "Kanté (nom du créateur)"
        },
        {
          nko: "ߖߌ߬ߦߊ߬ߓߍ",
          latin: "jiyabe",
          english: "writing",
          french: "écriture"
        },
        {
          nko: "ߞߊ߬ߙߊ߲߬",
          latin: "karan",
          english: "to read/study",
          french: "lire/étudier"
        }
      ]
    }
  };c