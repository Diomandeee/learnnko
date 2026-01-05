import { NkoLessonSeed } from "../lesson-library-types"

export const beginnerExpansionPackLessons: NkoLessonSeed[] = [
  {
    slug: "woloso-letters",
    title: "WOLOSO Letters: Extended Sounds and Loanwords",
    description:
      "Meet the WOLOSO letter series and learn how N’Ko represents additional sounds in names and borrowed vocabulary.",
    level: "beginner",
    module: "foundations-alphabet",
    moduleOrder: 3,
    track: "foundations",
    order: 4,
    prerequisites: ["nko-consonants"],
    topics: ["alphabet", "woloso", "loanwords", "reading"],
    estimatedTime: 30,
    duration: "30 minutes",
    tags: ["extended-letters", "loanwords"],
    objectives: [
      "Recognize WOLOSO-series letters in text",
      "Understand why extended letters exist (writing new/borrowed sounds)",
      "Avoid confusing WOLOSO letters with similar base letters",
    ],
    vocabulary: ["ߠ", "ߧ"],
    grammarPoints: [],
    culturalNotes: ["Extended letter series help N’Ko adapt to new vocabulary and names without breaking the writing system."],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "what-woloso",
          title: "What “WOLOSO” Letters Are",
          content: `Unicode includes an extended series called WOLOSO (you’ll see it in character names).

Learner takeaway:
- These are valid N’Ko letters.
- They exist so writers can represent additional sounds (often in loanwords, names, or careful pronunciation).
- At beginner level, your job is recognition: don’t panic when you see them.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "The WOLOSO letters are best described as…",
              options: [
                "digits used for counting",
                "punctuation marks",
                "extended letters used to represent additional sounds",
                "decorative symbols only",
              ],
              correctAnswer: 2,
              explanation: "WOLOSO letters are an extended letter series used for additional sound distinctions in writing.",
            },
          ],
        },
        {
          id: "recognize",
          title: "Recognition Practice",
          content: `Here are a few letters from this zone of the Unicode block:
ߠ ߧ

Practice:
- Look at each letter for 3 seconds.
- Close your eyes and “redraw” the shape mentally.
- Open your eyes and check accuracy.

This simple drill prevents “shape blur” later.`,
          nkoText: "ߠ ߧ",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which character below is a WOLOSO-series letter?",
              options: ["ߠ", "߀", "ߊ", "߫"],
              correctAnswer: 0,
              explanation: "ߠ is NKO LETTER NA WOLOSO in the Unicode N’Ko block.",
            },
          ],
        },
      ],
      summary:
        "You can recognize WOLOSO-series letters and you understand why extended letter series exist in a living writing system.",
      vocabulary: [],
    },
  },
  {
    slug: "jona-letters",
    title: "JONA Letters: Another Extended Series",
    description:
      "Learn to recognize the JONA letter series and understand why some texts use special letters for names or borrowed sounds.",
    level: "beginner",
    module: "foundations-alphabet",
    moduleOrder: 3,
    track: "foundations",
    order: 5,
    prerequisites: ["woloso-letters"],
    topics: ["alphabet", "jona", "loanwords", "recognition"],
    estimatedTime: 25,
    duration: "25 minutes",
    tags: ["extended-letters"],
    objectives: ["Recognize JONA letters in text", "Avoid misreading JONA letters as punctuation or digits"],
    vocabulary: ["ߨ", "ߩ", "ߪ"],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "what-jona",
          title: "What JONA Letters Are",
          content: `JONA letters are another small extended series in Unicode:
ߨ ߩ ߪ

You may see them in careful writing of certain names or borrowed sounds.

Beginner strategy:
Treat them as letters first (don’t guess punctuation), then rely on context.`,
          nkoText: "ߨ ߩ ߪ",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which set contains JONA letters?",
              options: ["ߨ ߩ ߪ", "߀ ߁ ߂", "߸ ߹ ߷", "ߊ ߋ ߌ"],
              correctAnswer: 0,
              explanation: "ߨ ߩ ߪ are JONA letters in the N’Ko Unicode block.",
            },
          ],
        },
        {
          id: "recognition",
          title: "Recognition Drill (Fast Identification)",
          content: `Rapid drill:
1) Look at ߨ and say “JONA”.
2) Look at ߩ and say “JONA”.
3) Look at ߪ and say “JONA”.

You’re not aiming for perfect pronunciation labels yet—just instant category recognition.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "If you see ߩ in a text, the safest beginner assumption is…",
              options: ["it is a digit", "it is a letter", "it is a comma", "it is a space"],
              correctAnswer: 1,
              explanation: "ߩ is a JONA letter; treat it as a letter and use context to interpret.",
            },
          ],
        },
      ],
      summary: "You can recognize the JONA letters and treat them correctly as letters when reading.",
      vocabulary: [],
    },
  },
  {
    slug: "dagbasinna-letter",
    title: "The Extra Letter ߑ (DAGBASINNA): Recognition and Context",
    description:
      "Learn to recognize ߑ (Unicode: NKO LETTER DAGBASINNA) and understand why some letter inventories include it.",
    level: "beginner",
    module: "foundations-alphabet",
    moduleOrder: 3,
    track: "foundations",
    order: 6,
    prerequisites: ["nko-vowels"],
    topics: ["alphabet", "unicode", "recognition"],
    estimatedTime: 15,
    duration: "15 minutes",
    tags: ["unicode", "extended-letters"],
    objectives: [
      "Recognize ߑ quickly",
      "Understand that Unicode may include letters you see less often in beginner materials",
      "Use context and reference charts instead of guessing",
    ],
    vocabulary: ["ߑ"],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "what-it-is",
          title: "What ߑ Is",
          content: `In the Unicode N’Ko block, ߑ is named NKO LETTER DAGBASINNA (U+07D1).

You may encounter it less often in beginner primers, but it can appear in:
- reference charts,
- Unicode tables,
- specialized texts.

Beginner goal: recognize it and confirm meaning from context or a trusted chart—don’t guess.`,
          nkoText: "ߑ",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which character is NKO LETTER DAGBASINNA?",
              options: ["ߑ", "ߐ", "߲", "߁"],
              correctAnswer: 0,
              explanation: "ߑ is the DAGBASINNA letter in the Unicode N’Ko block.",
            },
          ],
        },
        {
          id: "how-to-handle",
          title: "How to Handle Rare Characters",
          content: `When you see a rare character:
1) Don’t panic.
2) Don’t guess.
3) Copy it and look it up (Unicode name, chart, dictionary, or teacher).
4) Save it as a flashcard if it appears repeatedly in your reading.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "The best response to a rare character you don’t recognize is to…",
              options: ["guess and keep going", "skip the whole sentence forever", "look it up using a chart or Unicode name", "replace it with a random vowel"],
              correctAnswer: 2,
              explanation: "Lookup prevents fossilized mistakes and builds confidence.",
            },
          ],
        },
      ],
      summary: "You can recognize ߑ and you have a safe strategy for handling rare characters without guessing.",
      vocabulary: [],
    },
  },
  {
    slug: "special-marks-and-apostrophes",
    title: "Special Marks: Apostrophes, LAJANYALAN, and DANTAYALAN",
    description:
      "Recognize a handful of less-common N’Ko marks (ߴ ߵ ߺ ߽ …) so they don’t disrupt your reading.",
    level: "beginner",
    module: "foundations-diacritics",
    moduleOrder: 4,
    track: "foundations",
    order: 3,
    prerequisites: ["tone-marks-diacritics"],
    topics: ["diacritics", "orthography", "unicode", "recognition"],
    estimatedTime: 25,
    duration: "25 minutes",
    tags: ["diacritics", "unicode"],
    objectives: [
      "Recognize tone apostrophes (ߴ ߵ) and a few additional marks",
      "Learn to treat unfamiliar marks as readable symbols, not noise",
      "Know where these marks live in Unicode (same N’Ko block)",
    ],
    vocabulary: ["ߴ", "ߵ", "ߺ", "߽", "߾", "߿"],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "apostrophes",
          title: "Tone Apostrophes (ߴ ߵ)",
          content: `Unicode includes:
- ߴ NKO HIGH TONE APOSTROPHE
- ߵ NKO LOW TONE APOSTROPHE

You may see these in certain orthographic conventions or educational materials.

Beginner approach: recognize them and check a reference if you’re unsure how they function in a specific text.`,
          nkoText: "ߴ ߵ",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which pair are the N’Ko tone apostrophes?",
              options: ["ߴ ߵ", "߸ ߹", "߀ ߁", "ߊ ߋ"],
              correctAnswer: 0,
              explanation: "ߴ and ߵ are high/low tone apostrophes in Unicode.",
            },
          ],
        },
        {
          id: "other-marks",
          title: "Other Marks and Signs (Recognition)",
          content: `A few additional N’Ko marks in Unicode include:
- ߺ NKO LAJANYALAN
- ߽ NKO DANTAYALAN (a combining mark)
- ߾ NKO DOROME SIGN
- ߿ NKO TAMAN SIGN

You don’t need to master usage now. The goal is: recognize that these belong to N’Ko writing and stay calm when you see them.`,
          nkoText: "ߺ ߽ ߾ ߿",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which set contains only N’Ko marks/signs (not digits or vowel letters)?",
              options: ["ߺ ߽ ߾ ߿", "߀ ߁ ߂ ߃", "ߊ ߋ ߌ ߍ", "ߓ ߞ ߟ ߡ"],
              correctAnswer: 0,
              explanation: "These are marks/signs in the Unicode N’Ko block.",
            },
          ],
        },
      ],
      summary: "You can recognize less-common N’Ko marks and keep reading without derailing your comprehension.",
      vocabulary: [],
    },
  },
  {
    slug: "confusables-and-proofreading",
    title: "Common Confusions: Similar Shapes and Proofreading Tactics",
    description:
      "Learn the most frequent look-alike pairs and a systematic proofreading method to catch errors before they stick.",
    level: "beginner",
    module: "foundations-reading",
    moduleOrder: 5,
    track: "literacy",
    order: 2,
    prerequisites: ["nko-vowels", "nko-consonants"],
    topics: ["confusables", "proofreading", "reading"],
    estimatedTime: 30,
    duration: "30 minutes",
    tags: ["proofreading", "accuracy"],
    objectives: [
      "Identify common look-alike pairs (especially vowels)",
      "Use a 4-step proofreading checklist",
      "Reduce error rate without slowing down forever",
    ],
    vocabulary: ["ߋ", "ߍ", "ߏ", "ߐ"],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "pairs",
          title: "High-Impact Look-Alike Pairs",
          content: `Start with the pairs that cause the most reading errors:
- ߋ vs ߍ (visually related vowels)
- ߏ vs ߐ (visually related vowels)

Approach:
1) Practice them in isolation.
2) Practice them inside syllables (same consonant, different vowel).
3) Practice them in short lines (don’t guess).`,
          nkoText: "ߋ ߍ   ߏ ߐ",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which pair below is a common vowel look-alike pair?",
              options: ["ߋ and ߍ", "߀ and ߁", "ߓ and ߹", "߫ and ߸"],
              correctAnswer: 0,
              explanation: "These two vowels are visually related and often confused early.",
            },
          ],
        },
        {
          id: "checklist",
          title: "The 4-Step Proofreading Checklist",
          content: `Use this order:
1) Direction (RTL): did you keep the line direction consistent?
2) Vowels: did you pick the intended vowel for each syllable?
3) Confusables: re-check the look-alike pairs.
4) Marks: scan for diacritics (tone/length/nasalization) last.

Why this order works: it catches the biggest meaning-changing errors first.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "In the recommended checklist, which comes first?",
              options: ["Tone marks", "Direction (RTL)", "Rare symbols", "Advanced grammar"],
              correctAnswer: 1,
              explanation: "Direction errors break whole lines of reading; fix those first.",
            },
          ],
        },
      ],
      summary: "You can recognize common confusions and you have a repeatable proofreading routine to prevent fossilized errors.",
      vocabulary: [],
    },
  },
  {
    slug: "practice-lines-1",
    title: "Reading Practice Pack 1: Syllable Lines (No Guessing)",
    description:
      "Guided reading practice using consonant+vowel ladders and short lines designed to build speed without sacrificing accuracy.",
    level: "beginner",
    module: "foundations-reading",
    moduleOrder: 5,
    track: "literacy",
    order: 3,
    prerequisites: ["syllables-and-spelling"],
    topics: ["practice", "reading", "fluency"],
    estimatedTime: 25,
    duration: "25 minutes",
    tags: ["practice", "fluency"],
    objectives: [
      "Read short syllable lines right-to-left smoothly",
      "Track vowels accurately under speed",
      "Build confidence with longer sequences",
    ],
    vocabulary: [],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "line-1",
          title: "Line 1 (Slow, Perfect Accuracy)",
          content: `Read this line right-to-left. Do not rush. Aim for 100% accuracy:
ߓߊ ߓߋ ߓߌ ߓߍ ߓߎ ߓߏ ߓߐ`,
          nkoText: "ߓߊ ߓߋ ߓߌ ߓߍ ߓߎ ߓߏ ߓߐ",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which syllable in the line contains the vowel ߎ?",
              options: ["ߓߊ", "ߓߍ", "ߓߎ", "ߓߐ"],
              correctAnswer: 2,
              explanation: "ߓߎ contains ߎ.",
            },
          ],
        },
        {
          id: "line-2",
          title: "Line 2 (A Second Consonant)",
          content: `Same drill with ߟ:
ߟߊ ߟߋ ߟߌ ߟߍ ߟߎ ߟߏ ߟߐ`,
          nkoText: "ߟߊ ߟߋ ߟߌ ߟߍ ߟߎ ߟߏ ߟߐ",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which syllable contains vowel ߐ?",
              options: ["ߟߊ", "ߟߎ", "ߟߐ", "ߟߌ"],
              correctAnswer: 2,
              explanation: "ߟߐ ends with vowel ߐ.",
            },
          ],
        },
      ],
      summary: "You practiced two syllable lines without guessing. Repeat them until you can read smoothly while staying accurate.",
      vocabulary: [],
    },
  },
  {
    slug: "beginner-capstone",
    title: "Beginner Capstone: Consolidation and Self-Assessment",
    description:
      "A checkpoint lesson that ties everything together: vowels, consonants, diacritics awareness, numbers, and reading habits.",
    level: "beginner",
    module: "foundations-review",
    moduleOrder: 7,
    track: "foundations",
    order: 1,
    prerequisites: [
      "nko-vowels",
      "nko-consonants",
      "syllables-and-spelling",
      "tone-marks-diacritics",
      "digits-and-number-writing",
      "punctuation-and-symbols",
    ],
    topics: ["review", "assessment", "practice"],
    estimatedTime: 35,
    duration: "35 minutes",
    tags: ["capstone", "review"],
    objectives: [
      "Verify you can recognize all 7 vowels quickly",
      "Verify core consonant recognition under mild speed",
      "Confirm you notice diacritics and punctuation while reading",
      "Plan your next focus areas",
    ],
    vocabulary: [],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "checklist",
          title: "Self-Assessment Checklist",
          content: `You’re ready to move beyond beginner foundations when you can:
- Identify all vowels (ߊ ߋ ߌ ߍ ߎ ߏ ߐ) instantly
- Read two syllable lines without guessing
- Notice diacritics and punctuation (you may not interpret every mark yet, but you notice them)
- Handle numbers left-to-right inside N’Ko text

If any item feels weak, that is normal. Use the practice lessons to strengthen it.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Which is the best sign you should move forward?",
              options: [
                "You can read fast but guess often",
                "You can read accurately and improve speed gradually",
                "You ignore diacritics completely",
                "You only memorize vocabulary without reading",
              ],
              correctAnswer: 1,
              explanation: "Accuracy-first fluency is the safest foundation for long-term speed.",
            },
          ],
        },
        {
          id: "quick-quiz",
          title: "Quick Check: Recognition",
          content: "Answer a few recognition questions. If you miss any, revisit the corresponding lesson and try again tomorrow.",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which character is a vowel letter?",
              options: ["ߓ", "ߊ", "߸", "߀"],
              correctAnswer: 1,
              explanation: "ߊ is a vowel letter.",
            },
            {
              type: "multiple-choice",
              question: "Which character is the N’Ko digit for 9?",
              options: ["߉", "߈", "߀", "ߊ"],
              correctAnswer: 0,
              explanation: "߉ is NKO DIGIT NINE.",
            },
            {
              type: "multiple-choice",
              question: "Which character is a common combining mark (diacritic)?",
              options: ["߬", "ߞ", "߁", "ߍ"],
              correctAnswer: 0,
              explanation: "߬ is a combining mark.",
            },
          ],
        },
      ],
      summary: "You completed a beginner consolidation checkpoint. Use your results to choose what to practice next.",
      vocabulary: [],
    },
  },
]

