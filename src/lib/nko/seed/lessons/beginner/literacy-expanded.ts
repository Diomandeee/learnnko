import { NkoLessonSeed } from "../lesson-library-types"

export const beginnerLiteracyExpandedLessons: NkoLessonSeed[] = [
  {
    slug: "reading-foundations",
    title: "Reading Foundations: Accuracy First, Then Speed",
    description:
      "Build a daily reading routine, avoid guessing, and gain confidence with longer lines of N’Ko.",
    level: "beginner",
    module: "foundations-reading",
    moduleOrder: 5,
    track: "literacy",
    order: 1,
    prerequisites: ["syllables-and-spelling"],
    topics: ["reading", "fluency", "practice"],
    estimatedTime: 30,
    duration: "30 minutes",
    tags: ["reading", "fluency"],
    objectives: [
      "Use finger-tracking and chunking to reduce errors",
      "Practice short daily routines that compound quickly",
      "Learn what “good difficulty” feels like when reading",
    ],
    vocabulary: [],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "accuracy",
          title: "Accuracy Is the Foundation",
          content: `Speed without accuracy creates guessing habits.

Your beginner goal:
- read slowly enough to be correct,
- repeat the same short text until it feels easy,
- then increase difficulty.

This is how you build fluency without frustration.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "What should come first in reading practice?",
              options: ["Speed", "Accuracy", "Skipping hard words", "Writing only"],
              correctAnswer: 1,
              explanation: "Accuracy builds the mental map; speed comes later.",
            },
          ],
        },
        {
          id: "routine",
          title: "A 10-Minute Daily Routine",
          content: `Try this routine daily:
1) 2 min: vowel flash drill (random vowel recognition)
2) 3 min: syllable ladder (one consonant × all vowels)
3) 3 min: short line reading (finger-tracking RTL)
4) 2 min: proofreading drill (circle confusing letters/marks)

Consistency beats intensity. Ten minutes daily is better than one hour once a week.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Which study pattern usually produces faster long-term progress?",
              options: ["10 minutes daily", "2 hours once a month", "only weekends", "never repeat"],
              correctAnswer: 0,
              explanation: "Short, consistent practice compounds.",
            },
          ],
        },
      ],
      summary: "You have a practical daily reading routine and know why accuracy-first learning prevents future slowdowns.",
      vocabulary: [],
    },
  },
  {
    slug: "handwriting-strokes-and-forms",
    title: "Handwriting: Strokes, Consistency, and Legibility",
    description:
      "Write N’Ko clearly: baseline discipline, consistent size, spacing, and a method to self-correct handwriting.",
    level: "beginner",
    module: "foundations-writing",
    moduleOrder: 5,
    track: "literacy",
    order: 2,
    prerequisites: ["nko-vowels", "nko-consonants"],
    topics: ["handwriting", "strokes", "legibility"],
    estimatedTime: 40,
    duration: "40 minutes",
    tags: ["handwriting"],
    objectives: [
      "Write letters with consistent proportion and spacing",
      "Avoid common legibility failures (merged strokes, drifting baseline)",
      "Build a practice method for handwriting that improves quickly",
    ],
    vocabulary: [],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "baseline",
          title: "Baseline and Proportion",
          content: `Even when letters look “right”, messy proportion makes reading hard.

Two constraints:
1) Keep a stable baseline (letters sit on an invisible line).
2) Keep vertical strokes roughly the same height within a word.

If your letters drift up/down, slow down and use lined paper for a week.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "A stable baseline primarily improves…",
              options: ["internet speed", "legibility", "tone marks", "Unicode encoding"],
              correctAnswer: 1,
              explanation: "Baseline consistency makes words easier to recognize.",
            },
          ],
        },
        {
          id: "strokes",
          title: "Stroke Discipline (Write the Same Way Every Time)",
          content: `Pick a consistent stroke order for each letter and keep it.

Why:
- consistency creates muscle memory,
- muscle memory frees attention for spelling and diacritics,
- readers recognize stable shapes faster.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Why is consistent stroke order helpful?",
              options: [
                "It changes the meaning of the letter",
                "It builds muscle memory and reduces mistakes",
                "It makes writing left-to-right",
                "It replaces the need for reading",
              ],
              correctAnswer: 1,
              explanation: "Consistency builds a reliable handwriting habit.",
            },
          ],
        },
      ],
      summary: "You learned practical handwriting constraints: baseline, proportion, and consistent stroke habits for legibility.",
      vocabulary: [],
    },
  },
]

