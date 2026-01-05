import { NkoLessonSeed } from "../lesson-library-types.ts"

export const beginnerPunctuationAndNumbersLessons: NkoLessonSeed[] = [
  {
    slug: "digits-and-number-writing",
    title: "N'Ko Digits and Number Writing (߀–߉)",
    description:
      "Learn the N'Ko digits, practice multi-digit numbers, and handle the left-to-right digit rule inside N'Ko text.",
    level: "beginner",
    module: "foundations-script-basics",
    moduleOrder: 2,
    track: "foundations",
    order: 2,
    prerequisites: ["writing-direction-and-layout"],
    topics: ["digits", "numbers", "layout"],
    estimatedTime: 30,
    duration: "30 minutes",
    tags: ["numbers"],
    objectives: [
      "Recognize digits ߀–߉ instantly",
      "Write multi-digit numbers in correct order (LTR)",
      "Read numbers inside RTL text without confusion",
    ],
    vocabulary: ["߀", "߁", "߂", "߃", "߄", "߅", "߆", "߇", "߈", "߉"],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 1,
    content: {
      sections: [
        {
          id: "digits",
          title: "Digits 0–9",
          content: `N’Ko digits:
߀ ߁ ߂ ߃ ߄ ߅ ߆ ߇ ߈ ߉

Flash drill:
- point randomly and say the value,
- then write the digit from memory.`,
          nkoText: "߀ ߁ ߂ ߃ ߄ ߅ ߆ ߇ ߈ ߉",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which digit is “five”?",
              options: ["߄", "߅", "߆", "߇"],
              correctAnswer: 1,
              explanation: "߅ is NKO DIGIT FIVE (U+07C5).",
            },
          ],
        },
        {
          id: "multi-digit",
          title: "Multi-Digit Numbers (Left-to-Right)",
          content: `Write multi-digit numbers left-to-right:
Example: 2026 → ߂߀߂߆

Practice:
10 → ߁߀
99 → ߉߉
105 → ߁߀߅`,
          nkoText: "߂߀߂߆",
          latinTransliteration: "2026",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which way do N’Ko digits run in a multi-digit number?",
              options: ["Right-to-left", "Left-to-right", "Top-to-bottom", "Random"],
              correctAnswer: 1,
              explanation: "N’Ko numbers run left-to-right.",
            },
          ],
        },
      ],
      summary: "You can read and write N’Ko digits and follow the key rule: digit strings run left-to-right.",
      vocabulary: [],
    },
  },
  {
    slug: "punctuation-and-symbols",
    title: "Punctuation and Symbols in N'Ko",
    description:
      "Learn key punctuation marks (comma, exclamation) and a few script-specific symbols you may encounter in texts.",
    level: "beginner",
    module: "foundations-script-basics",
    moduleOrder: 2,
    track: "foundations",
    order: 3,
    prerequisites: ["writing-direction-and-layout"],
    topics: ["punctuation", "symbols", "reading"],
    estimatedTime: 25,
    duration: "25 minutes",
    tags: ["punctuation"],
    objectives: [
      "Recognize the N’Ko comma and exclamation mark",
      "Use punctuation as a reading cue for pauses and emphasis",
      "Recognize a few script-specific symbols in Unicode",
    ],
    vocabulary: ["߸", "߹", "߶", "߷"],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 1,
    content: {
      sections: [
        {
          id: "comma-exclamation",
          title: "Comma and Exclamation",
          content: `N’Ko includes its own punctuation characters.

Two common ones:
- ߸ NKO COMMA
- ߹ NKO EXCLAMATION MARK

You’ll see them in many modern texts, especially messaging and educational materials.`,
          nkoText: "߸ ߹",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which character is the N’Ko comma?",
              options: ["߸", "߹", "߬", "߀"],
              correctAnswer: 0,
              explanation: "߸ is NKO COMMA (U+07F8).",
            },
          ],
        },
        {
          id: "symbols",
          title: "Script-Specific Symbols (Recognize, Don’t Fear)",
          content: `You may encounter symbols such as:
- ߶ NKO SYMBOL OO DENNEN
- ߷ NKO SYMBOL GBAKURUNEN

At beginner level, you don’t need to master their full usage. The goal is recognition: they are part of the writing system’s Unicode block.`,
          nkoText: "߶ ߷",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which pair below contains N’Ko symbols (not digits or vowels)?",
              options: ["߶ ߷", "߀ ߁", "ߊ ߋ", "߫ ߬"],
              correctAnswer: 0,
              explanation: "߶ and ߷ are N’Ko symbols in Unicode.",
            },
          ],
        },
      ],
      summary: "You can recognize core N’Ko punctuation and you’ve previewed a couple script-specific symbols.",
      vocabulary: [],
    },
  },
]

