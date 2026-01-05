import { NkoLessonSeed } from "../lesson-library-types.ts"

export const beginnerDiacriticsExpandedLessons: NkoLessonSeed[] = [
  {
    slug: "tone-marks-diacritics",
    title: "Tone Marks and Diacritics (߫ ߬ ߭ ߮ …)",
    description:
      "Learn N'Ko combining marks used for tone/length and other pronunciation details, and practice placing them correctly.",
    level: "beginner",
    module: "foundations-diacritics",
    moduleOrder: 4,
    track: "foundations",
    order: 1,
    prerequisites: ["nko-vowels", "nko-consonants"],
    topics: ["diacritics", "tones", "nasalization", "orthography"],
    estimatedTime: 60,
    duration: "60 minutes",
    tags: ["diacritics", "tone"],
    objectives: [
      "Recognize common N’Ko combining marks by shape",
      "Understand why tone/length marking matters",
      "Attach marks to the correct vowel (not the consonant)",
    ],
    vocabulary: ["߫", "߬", "߭", "߮", "߯", "߰", "߱", "߲", "߳"],
    grammarPoints: [],
    culturalNotes: ["Tone can distinguish meaning in Manding languages; diacritics help writing preserve those distinctions."],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "combining",
          title: "Combining Marks: What They Are",
          content: `Many N’Ko marks are “combining”: they attach to a base letter and modify how it is read.

Common marks you will see:
߫ ߬ ߭ ߮ ߯ ߰ ߱ ߲ ߳

Key beginner rule:
Attach the mark to the vowel of the syllable. If you attach it to the wrong letter, the word becomes hard to read and may change meaning.`,
          nkoText: "ߊ߫ ߊ߬ ߊ߭ ߊ߮",
          latinTransliteration: "a + marks",
          exercises: [
            {
              type: "multiple-choice",
              question: "Combining marks in N’Ko most commonly attach to…",
              options: ["vowels", "numbers", "spaces", "punctuation"],
              correctAnswer: 0,
              explanation: "Tone/length marks typically attach to the vowel of a syllable.",
            },
          ],
        },
        {
          id: "tone-length",
          title: "Tone/Length Marks (Short vs Long)",
          content: `Unicode distinguishes several tone/length-related marks, including:
- short marks (e.g., ߫ ߬ ߭)
- long marks (e.g., ߯ ߰ ߱)

As a learner, don’t try to master every linguistic nuance on day one. Instead:
1) learn to SEE the mark,
2) learn to PLACE it correctly,
3) learn to READ the syllable consistently.

Later lessons connect marks to tone patterns for a chosen Manding language.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Which set contains only combining marks (not letters or digits)?",
              options: ["߫ ߬ ߭", "ߊ ߋ ߌ", "߀ ߁ ߂", "ߓ ߞ ߟ"],
              correctAnswer: 0,
              explanation: "߫ ߬ ߭ are combining diacritics.",
            },
          ],
        },
        {
          id: "nasalization",
          title: "Nasalization and Other Marks (߲ ߳)",
          content: `Some marks indicate additional pronunciation features. For example:
߲ is the N’Ko combining nasalization mark.
߳ is the N’Ko combining double dot above.

At beginner level, focus on recognition + correct attachment to the vowel.`,
          nkoText: "ߊ߲ ߊ߳",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which character is the combining nasalization mark?",
              options: ["߲", "ߐ", "ߞ", "߁"],
              correctAnswer: 0,
              explanation: "߲ is the combining nasalization mark.",
            },
          ],
        },
      ],
      summary: "You can recognize and place common N’Ko diacritics, especially tone/length marks and nasalization.",
      vocabulary: [],
    },
  },
  {
    slug: "tone-in-meaning",
    title: "Tone in Meaning: Minimal Contrasts and Safe Reading Habits",
    description:
      "Build intuition for why tone matters, how diacritics prevent ambiguity, and how to read carefully when tone is marked.",
    level: "beginner",
    module: "foundations-diacritics",
    moduleOrder: 4,
    track: "foundations",
    order: 2,
    prerequisites: ["tone-marks-diacritics"],
    topics: ["tone", "meaning", "reading-strategy"],
    estimatedTime: 35,
    duration: "35 minutes",
    tags: ["tone", "meaning"],
    objectives: [
      "Understand that tone can change meaning",
      "Treat diacritics as cues (not decoration)",
      "Develop a reading habit that respects marks (don’t skip them)",
    ],
    vocabulary: ["߫", "߬"],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "why-tone",
          title: "Why Tone Matters",
          content: `Many Manding languages are tonal, meaning pitch patterns can distinguish words.

In writing, tone marks help:
- disambiguate words that look identical without tone,
- preserve meaning in careful texts (education, literature, dictionaries),
- support learners when pronunciation contrasts are important.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Tone is important because it can…",
              options: ["change the meaning of a word", "change the writing direction", "remove vowels from words", "turn letters into numbers"],
              correctAnswer: 0,
              explanation: "In tonal languages, tone contrasts can distinguish words.",
            },
          ],
        },
        {
          id: "reading-habit",
          title: "A Safe Reading Habit: Don’t Skip Marks",
          content: `Beginner mistake: ignoring diacritics because “the letters are hard enough already.”

Instead:
1) Read the base letters.
2) Immediately re-scan for marks.
3) Re-read the syllable with the mark included.

This adds only a moment but prevents building bad habits that later slow you down.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "The best beginner approach to diacritics is to…",
              options: ["ignore them until advanced level", "treat them as cues and always re-scan for them", "delete them from the text", "replace them with Latin accents"],
              correctAnswer: 1,
              explanation: "Re-scanning for marks preserves accuracy and prevents fossilized mistakes.",
            },
          ],
        },
      ],
      summary: "You understand why tone marks matter and you have a practical reading habit to include them accurately.",
      vocabulary: [],
    },
  },
]

