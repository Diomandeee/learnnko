export const alphabetVowelsLesson = {
  id: "alphabet-vowels",
  title: "N'Ko Vowels",
  description: "Learn the seven vowels of the N'Ko alphabet and their pronunciation",
  level: "beginner",
  module: "alphabet-fundamentals",
  moduleOrder: 1,
  order: 2,
  duration: 20,
  prerequisites: ["nko-history"],
  topics: ["alphabet", "vowels", "pronunciation"],
  content: {
    objectives: [
      "Recognize all seven N'Ko vowel characters",
      "Correctly pronounce each vowel sound",
      "Understand the relationship between N'Ko vowels and IPA symbols",
      "Write basic vowel characters"
    ],
    sections: [
      {
        title: "Introduction to N'Ko Vowels",
        content: `
          The N'Ko alphabet has seven vowels, representing the seven basic vowel sounds found in Manding languages.
          
          Unlike many other writing systems, N'Ko has a unique character for each vowel sound, making it very precise for representing pronunciation.
          
          In this lesson, we'll learn each vowel, its pronunciation, and how to write it.
        `,
        audioPrompt: "intro-vowels"
      },
      {
        title: "The Seven Vowels",
        content: `
          Here are the seven vowels of the N'Ko alphabet. Listen to the pronunciation of each and practice saying them aloud.
          
          Pay careful attention to the mouth position for each vowel sound.
        `,
        nkoText: "ߊ ߋ ߌ ߍ ߎ ߏ ߐ",
        pronunciation: "a e i ɛ u o ɔ",
        latinTransliteration: "a e i è u o ò",
        audioPrompt: "vowel-list"
      },
      {
        title: "Vowel Details: ߊ (a)",
        content: `
          The first vowel in the N'Ko alphabet is ߊ, which represents the "a" sound as in "father" or "car".
          
          It is written with a single vertical stroke with a hook at the top.
          
          To write it:
          1. Start at the top with the hook facing right
          2. Draw a straight line downward
        `,
        nkoText: "ߊ",
        pronunciation: "a (as in 'father')",
        latinTransliteration: "a",
        audioPrompt: "vowel-a",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'a' sound:",
            options: ["ߊ", "ߋ", "ߌ", "ߍ"],
            correctAnswer: 0,
            explanation: "ߊ is the character that represents the 'a' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Details: ߋ (e)",
        content: `
          The second vowel is ߋ, which represents the "e" sound as in "day" or "may" (but without the glide).
          
          It looks like a vertical line with a small loop on the right side.
          
          To write it:
          1. Start at the top
          2. Draw a vertical line downward
          3. Add a small loop extending to the right in the middle
        `,
        nkoText: "ߋ",
        pronunciation: "e (as in 'day')",
        latinTransliteration: "e",
        audioPrompt: "vowel-e",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'e' sound:",
            options: ["ߊ", "ߋ", "ߌ", "ߍ"],
            correctAnswer: 1,
            explanation: "ߋ is the character that represents the 'e' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Details: ߌ (i)",
        content: `
          The third vowel is ߌ, which represents the "i" sound as in "machine" or "see".
          
          It looks like a vertical line with a dot on the right side.
          
          To write it:
          1. Start at the top
          2. Draw a vertical line downward
          3. Add a dot to the right of the middle of the line
        `,
        nkoText: "ߌ",
        pronunciation: "i (as in 'machine')",
        latinTransliteration: "i",
        audioPrompt: "vowel-i",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'i' sound:",
            options: ["ߊ", "ߋ", "ߌ", "ߍ"],
            correctAnswer: 2,
            explanation: "ߌ is the character that represents the 'i' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Details: ߍ (ɛ)",
        content: `
          The fourth vowel is ߍ, which represents the "ɛ" sound as in "bet" or "set".
          
          It looks like a vertical line with a horizontal line extending to the right from the middle.
          
          To write it:
          1. Start at the top
          2. Draw a vertical line downward
          3. Add a horizontal line to the right in the middle
        `,
        nkoText: "ߍ",
        pronunciation: "ɛ (as in 'bet')",
        latinTransliteration: "è",
        audioPrompt: "vowel-epsilon",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'ɛ' (as in 'bet') sound:",
            options: ["ߊ", "ߋ", "ߌ", "ߍ"],
            correctAnswer: 3,
            explanation: "ߍ is the character that represents the 'ɛ' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Details: ߎ (u)",
        content: `
          The fifth vowel is ߎ, which represents the "u" sound as in "rude" or "food".
          
          It looks like a vertical line with a small hook at the bottom, resembling a reversed 'j'.
          
          To write it:
          1. Start at the top
          2. Draw a vertical line downward
          3. Curve slightly to the right at the bottom
        `,
        nkoText: "ߎ",
        pronunciation: "u (as in 'food')",
        latinTransliteration: "u",
        audioPrompt: "vowel-u",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'u' sound:",
            options: ["ߎ", "ߏ", "ߐ", "ߊ"],
            correctAnswer: 0,
            explanation: "ߎ is the character that represents the 'u' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Details: ߏ (o)",
        content: `
          The sixth vowel is ߏ, which represents the "o" sound as in "hope" or "go" (but without the glide).
          
          It looks like a vertical line with a small circle attached to the right side.
          
          To write it:
          1. Start at the top
          2. Draw a vertical line downward
          3. Add a small circle to the right in the middle
        `,
        nkoText: "ߏ",
        pronunciation: "o (as in 'hope')",
        latinTransliteration: "o",
        audioPrompt: "vowel-o",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'o' sound:",
            options: ["ߎ", "ߏ", "ߐ", "ߊ"],
            correctAnswer: 1,
            explanation: "ߏ is the character that represents the 'o' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Details: ߐ (ɔ)",
        content: `
          The seventh vowel is ߐ, which represents the "ɔ" sound as in "thought" or "caught".
          
          It looks like a vertical line with a diagonal line extending to the right from the middle.
          
          To write it:
          1. Start at the top
          2. Draw a vertical line downward
          3. Add a diagonal line extending down and to the right from the middle
        `,
        nkoText: "ߐ",
        pronunciation: "ɔ (as in 'thought')",
        latinTransliteration: "ò",
        audioPrompt: "vowel-open-o",
        exercises: [
          {
            type: "recognition",
            question: "Select the character that represents the 'ɔ' (as in 'thought') sound:",
            options: ["ߎ", "ߏ", "ߐ", "ߊ"],
            correctAnswer: 2,
            explanation: "ߐ is the character that represents the 'ɔ' sound in N'Ko."
          }
        ]
      },
      {
        title: "Vowel Comparison",
        content: `
          Let's compare all the vowels together. Notice the similarities and differences in their shapes.
          
          The N'Ko vowels are designed with consistent elements that make them easy to distinguish:
          
          - All have a vertical stroke
          - They differ in the attachments to the basic vertical stroke
          - The design is systematic, making them easier to learn and remember
        `,
        nkoText: "ߊ ߋ ߌ ߍ ߎ ߏ ߐ",
        pronunciation: "a e i ɛ u o ɔ",
        latinTransliteration: "a e i è u o ò",
        audioPrompt: "vowel-comparison",
        exercises: [
          {
            type: "matching",
            question: "Match each N'Ko vowel with its sound:",
            pairs: [
              { a: "ߊ", b: "a as in father" },
              { a: "ߋ", b: "e as in day" },
              { a: "ߌ", b: "i as in machine" },
              { a: "ߍ", b: "ɛ as in bet" },
              { a: "ߎ", b: "u as in food" },
              { a: "ߏ", b: "o as in hope" },
              { a: "ߐ", b: "ɔ as in thought" }
            ],
            explanation: "Each N'Ko vowel character represents a specific vowel sound."
          }
        ]
      },
      {
        title: "Practice Recognition",
        content: `
          Now let's practice recognizing all seven vowels.
          
          Take your time and get comfortable identifying each one.
        `,
        exercises: [
          {
            type: "multiple-choice",
            question: "Which vowel is this? ߋ",
            options: ["a", "e", "i", "ɛ"],
            correctAnswer: 1,
            explanation: "This is ߋ, which represents the 'e' sound as in 'day'."
          },
          {
            type: "multiple-choice",
            question: "Which vowel is this? ߐ",
            options: ["u", "o", "ɔ", "a"],
            correctAnswer: 2,
            explanation: "This is ߐ, which represents the 'ɔ' sound as in 'thought'."
          },
          {
            type: "multiple-choice",
            question: "Which vowel is this? ߌ",
            options: ["e", "i", "ɛ", "o"],
correctAnswer: 1,
            explanation: "This is ߌ, which represents the 'i' sound as in 'machine'."
          },
          {
            type: "fill-blank",
            question: "The vowel ߎ represents the sound 'u' as in _____.",
            correctAnswer: "food",
            acceptableAnswers: ["food", "rude", "moon", "blue"],
            explanation: "ߎ represents the 'u' sound as in English words like 'food', 'rude', 'moon', etc."
          }
        ]
      }
    ],
    quizQuestions: [
      {
        question: "Which N'Ko character represents the 'a' sound?",
        options: ["ߊ", "ߋ", "ߌ", "ߍ"],
        correctAnswer: 0,
        explanation: "ߊ represents the 'a' sound in N'Ko."
      },
      {
        question: "How many vowels are in the N'Ko alphabet?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 2,
        explanation: "The N'Ko alphabet has 7 vowels."
      },
      {
        question: "Which sound does ߍ represent?",
        options: ["e as in day", "i as in machine", "ɛ as in bet", "o as in hope"],
        correctAnswer: 2,
        explanation: "ߍ represents the 'ɛ' sound as in 'bet'."
      },
      {
        question: "Which is NOT a vowel in the N'Ko alphabet?",
        options: ["ߊ", "ߖ", "ߏ", "ߐ"],
        correctAnswer: 1,
        explanation: "ߖ is not a vowel; it's a consonant in the N'Ko alphabet."
      },
      {
        question: "Which vowel represents the 'o' sound as in 'hope'?",
        options: ["ߎ", "ߏ", "ߐ", "ߊ"],
        correctAnswer: 1,
        explanation: "ߏ represents the 'o' sound as in 'hope'."
      }
    ],
    summary: `
      In this lesson, you've learned all seven vowels of the N'Ko alphabet:
      
      - ߊ (a) as in "father"
      - ߋ (e) as in "day"
      - ߌ (i) as in "machine"
      - ߍ (ɛ) as in "bet"
      - ߎ (u) as in "food"
      - ߏ (o) as in "hope"
      - ߐ (ɔ) as in "thought"
      
      You can now recognize these vowels, understand their sounds, and know the basics of how to write them.
      
      In the next lesson, you'll learn the first group of consonants in the N'Ko alphabet and start combining them with vowels to form syllables.
    `,
    vocabulary: [
      {
        nko: "ߊ",
        latin: "a",
        english: "a (vowel)",
        french: "a (voyelle)"
      },
      {
        nko: "ߋ",
        latin: "e",
        english: "e (vowel)",
        french: "é (voyelle)"
      },
      {
        nko: "ߌ",
        latin: "i",
        english: "i (vowel)",
        french: "i (voyelle)"
      },
      {
        nko: "ߍ",
        latin: "ɛ",
        english: "è (vowel)",
        french: "è (voyelle)"
      },
      {
        nko: "ߎ",
        latin: "u",
        english: "u (vowel)",
        french: "ou (voyelle)"
      },
      {
        nko: "ߏ",
        latin: "o",
        english: "o (vowel)",
        french: "o (voyelle)"
      },
      {
        nko: "ߐ",
        latin: "ɔ",
        english: "ò (vowel)",
        french: "ô (voyelle)"
      }
    ]
  }
};
