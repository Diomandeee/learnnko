import { NkoLessonSeed } from "../lesson-library-types"

export const beginnerAlphabetExpandedLessons: NkoLessonSeed[] = [
  {
    slug: "nko-vowels",
    title: "N'Ko Vowels (ߊ ߋ ߌ ߍ ߎ ߏ ߐ)",
    description: "Learn the seven core vowel letters and how they anchor pronunciation and spelling.",
    level: "beginner",
    module: "foundations-alphabet",
    moduleOrder: 3,
    track: "foundations",
    order: 1,
    prerequisites: ["intro-to-nko"],
    topics: ["vowels", "pronunciation", "alphabet"],
    estimatedTime: 40,
    duration: "40 minutes",
    tags: ["vowels", "pronunciation"],
    objectives: [
      "Recognize the seven vowel letters instantly",
      "Associate each vowel with a stable anchor sound",
      "Combine vowels with consonants to form readable syllables",
    ],
    vocabulary: ["ߊ", "ߋ", "ߌ", "ߍ", "ߎ", "ߏ", "ߐ"],
    grammarPoints: [],
    culturalNotes: ["Many Manding languages use tone and (in some contexts) vowel length contrasts; vowels are central to clarity."],
    difficulty: 1,
    content: {
      sections: [
        {
          id: "vowel-inventory",
          title: "The Seven Vowels (Quick Recognition)",
          content: `The seven core vowel letters are:
ߊ ߋ ߌ ߍ ߎ ߏ ߐ

Beginner goal: recognize them like digits—instantly, without “drawing” them in your head.

Two practice directions:
- seeing → naming (you see ߎ and you say “u”)
- naming → writing (you hear “o” and you write ߏ)`,
          nkoText: "ߊ ߋ ߌ ߍ ߎ ߏ ߐ",
          latinTransliteration: "a ee i e u oo o",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which set contains only N’Ko vowel letters?",
              options: ["ߓ ߞ ߟ ߡ", "ߊ ߋ ߌ ߍ", "߫ ߬ ߭ ߮", "߀ ߁ ߂ ߃"],
              correctAnswer: 1,
              explanation: "ߊ ߋ ߌ ߍ are all vowel letters.",
            },
          ],
        },
        {
          id: "syllable-drill",
          title: "Syllable Drill (Consonant + Vowel)",
          content: `A powerful early skill is syllable building: choose one consonant and attach each vowel.

Example consonant: ߞ
Practice the pattern:
ߞߊ ߞߋ ߞߌ ߞߍ ߞߎ ߞߏ ߞߐ

These do not need to be real words yet. This is a reading gym: it trains your eyes to track letters smoothly.`,
          nkoText: "ߞߊ ߞߋ ߞߌ ߞߍ ߞߎ ߞߏ ߞߐ",
          latinTransliteration: "ka kee ki ke ku koo ko",
          exercises: [
            {
              type: "multiple-choice",
              question: "In the sequence ߞߊ ߞߋ ߞߌ, what changes each time?",
              options: ["The consonant", "The vowel", "The writing direction", "The punctuation"],
              correctAnswer: 1,
              explanation: "The consonant ߞ stays; the vowel changes.",
            },
          ],
        },
        {
          id: "common-confusions",
          title: "Common Vowel Confusions (Shape Families)",
          content: `Some vowels look similar because N’Ko uses systematic design patterns.

To avoid confusion:
- Always look for the “attachment” on the vertical stroke (dot, hook, bar, angle).
- Practice in pairs: (ߋ vs ߍ), (ߏ vs ߐ).
- When in doubt, read the whole syllable, not the isolated letter.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Which pair is commonly confused early due to similar shapes?",
              options: ["߀ and ߉", "ߋ and ߍ", "ߓ and ߫", "ߞ and ߁"],
              correctAnswer: 1,
              explanation: "ߋ and ߍ are visually related and often confused by beginners.",
            },
          ],
        },
      ],
      summary:
        "You can identify the 7 vowels and start building consonant+vowel ladders to accelerate reading growth.",
      vocabulary: [
        { nko: "ߊ", latin: "a", english: "vowel a", french: "voyelle a" },
        { nko: "ߋ", latin: "ee", english: "vowel ee", french: "voyelle é/ee" },
        { nko: "ߌ", latin: "i", english: "vowel i", french: "voyelle i" },
        { nko: "ߍ", latin: "e", english: "vowel e", french: "voyelle è/e" },
        { nko: "ߎ", latin: "u", english: "vowel u", french: "voyelle u" },
        { nko: "ߏ", latin: "oo", english: "vowel oo", french: "voyelle o/oo" },
        { nko: "ߐ", latin: "o", english: "vowel o", french: "voyelle ò/o" },
      ],
    },
  },
  {
    slug: "nko-consonants",
    title: "N'Ko Consonants: Core Letters and Reading Practice",
    description: "Learn the high-frequency consonant letters and build confident consonant+vowel reading patterns.",
    level: "beginner",
    module: "foundations-alphabet",
    moduleOrder: 3,
    track: "foundations",
    order: 2,
    prerequisites: ["nko-vowels"],
    topics: ["consonants", "alphabet", "syllables"],
    estimatedTime: 55,
    duration: "55 minutes",
    tags: ["consonants", "reading"],
    objectives: [
      "Recognize the core consonant inventory by shape",
      "Read consonant+vowel syllables smoothly",
      "Preview special consonant series used in loanwords",
    ],
    vocabulary: ["ߒ", "ߓ", "ߔ", "ߕ", "ߖ", "ߗ", "ߘ", "ߙ", "ߛ", "ߝ", "ߞ", "ߟ", "ߡ", "ߥ", "ߦ"],
    grammarPoints: [],
    culturalNotes: ["Some letter series are especially relevant when writing borrowed terms or names."],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "inventory",
          title: "Core Consonant Inventory (High Frequency)",
          content: `Below is a practical core set to start reading. You will add more letters and special series later.

Letter → rough Latin value (learning approximation):
ߒ n
ߓ b
ߔ p
ߕ t
ߖ j
ߗ ch
ߘ d
ߙ r
ߛ s
ߝ f
ߞ k
ߟ l
ߡ m
ߥ w
ߦ y

Beginner priority is stable recognition: you see the letter, you can name it.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Which character is the N’Ko letter BA?",
              options: ["ߓ", "ߞ", "ߊ", "߬"],
              correctAnswer: 0,
              explanation: "ߓ is NKO LETTER BA (U+07D3).",
            },
            {
              type: "multiple-choice",
              question: "Which character is the N’Ko letter KA?",
              options: ["ߟ", "ߞ", "ߋ", "߶"],
              correctAnswer: 1,
              explanation: "ߞ is NKO LETTER KA (U+07DE).",
            },
          ],
        },
        {
          id: "syllable-ladders",
          title: "Syllable Ladders (Build Reading Speed Safely)",
          content: `Choose a consonant and run through all vowels. This builds fluency without guessing.

Example with ߓ:
ߓߊ ߓߋ ߓߌ ߓߍ ߓߎ ߓߏ ߓߐ

Example with ߟ:
ߟߊ ߟߋ ߟߌ ߟߍ ߟߎ ߟߏ ߟߐ

Read them aloud slowly. Then read again faster without losing accuracy.`,
          nkoText: "ߓߊ ߓߋ ߓߌ ߓߍ ߓߎ ߓߏ ߓߐ",
          latinTransliteration: "ba bee bi be bu boo bo",
          exercises: [
            {
              type: "multiple-choice",
              question: "In ߓߎ, which part is the vowel?",
              options: ["ߓ", "ߎ", "Both", "Neither"],
              correctAnswer: 1,
              explanation: "ߎ is the vowel letter; ߓ is the consonant.",
            },
          ],
        },
        {
          id: "special-series",
          title: "Special Series: WOLOSO and JONA Letters (Preview)",
          content: `Unicode includes special letter series that help write sounds in loanwords or specific pronunciation needs.

Examples you may see:
- WOLOSO letters: ߠ ߧ (among others)
- JONA letters: ߨ ߩ ߪ

At beginner level, recognize them as valid N’Ko letters so they don’t feel mysterious when encountered.`,
          nkoText: "ߠ ߧ ߨ ߩ ߪ",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which set contains WOLOSO/JONA series letters?",
              options: ["ߠ ߧ ߨ", "߀ ߁ ߂", "߫ ߬ ߭", "ߊ ߋ ߌ"],
              correctAnswer: 0,
              explanation: "ߠ ߧ ߨ are letters from those special series.",
            },
          ],
        },
      ],
      summary:
        "You learned a usable core set of consonants and practiced syllable ladders to build early reading fluency.",
      vocabulary: [],
    },
  },
  {
    slug: "syllables-and-spelling",
    title: "Syllables, Word Shapes, and Spelling Strategies",
    description: "Connect letters into readable chunks: syllables, word shapes, spacing, and beginner spelling habits.",
    level: "beginner",
    module: "foundations-alphabet",
    moduleOrder: 3,
    track: "foundations",
    order: 3,
    prerequisites: ["nko-vowels", "nko-consonants"],
    topics: ["syllables", "spelling", "reading"],
    estimatedTime: 35,
    duration: "35 minutes",
    tags: ["syllables", "spelling"],
    objectives: [
      "Chunk words into syllables when reading",
      "Use consistent spacing and avoid letter-by-letter panic",
      "Use a proofreading method that catches common mistakes",
    ],
    vocabulary: [],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "chunking",
          title: "Chunking: Read Syllables, Not Individual Letters",
          content: `Reading becomes easier when you stop reading letter-by-letter.

Try this:
1) Identify the consonant+vowel chunk (CV).
2) Blend it quickly (“ba”, “ka”, “la”…).
3) Move to the next chunk.

This is especially effective in N’Ko because many words are composed of clear, repeatable chunks.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "A helpful reading strategy in N’Ko is to…",
              options: [
                "read each letter slowly forever",
                "guess words without looking",
                "chunk into consonant+vowel units",
                "ignore vowels entirely",
              ],
              correctAnswer: 2,
              explanation: "Chunking CV units speeds reading while preserving accuracy.",
            },
          ],
        },
        {
          id: "spacing",
          title: "Spacing and Word Boundaries",
          content: `Spacing is a readability tool. Beginners often either:
- jam everything together, or
- over-space, breaking words apart.

Rule of thumb:
- Keep syllables inside a word close together.
- Use spaces to separate words and major chunks (like a name + number).`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Why does spacing matter?",
              options: [
                "It changes the Unicode code points",
                "It helps the reader find word boundaries quickly",
                "It removes the need for vowels",
                "It makes text left-to-right",
              ],
              correctAnswer: 1,
              explanation: "Good spacing makes scanning and comprehension faster.",
            },
          ],
        },
        {
          id: "proofreading",
          title: "A Beginner Proofreading Checklist (Fast and Effective)",
          content: `Proofread in layers:
1) Direction: did you keep the line RTL?
2) Vowels: did each syllable get the intended vowel?
3) Similar shapes: re-check letters you often confuse (especially vowel pairs).
4) Diacritics: if used, are they attached to the correct vowel?

This method catches most beginner errors quickly.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Which proofreading order is most effective for beginners?",
              options: [
                "Diacritics first, then direction",
                "Direction → vowels → similar shapes → diacritics",
                "Only check the first letter of each word",
                "Never proofread; speed matters more",
              ],
              correctAnswer: 1,
              explanation: "Direction and vowels create the biggest errors; check those first.",
            },
          ],
        },
      ],
      summary: "You learned how to read in chunks, use spacing for readability, and proofread efficiently.",
      vocabulary: [],
    },
  },
]

