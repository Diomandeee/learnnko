import { NkoLessonSeed } from "../lesson-library-types"

export const beginnerUnicodeChartsLessons: NkoLessonSeed[] = [
  {
    slug: "nko-unicode-letter-chart",
    title: "Unicode Letter Chart: Vowels and Consonants (U+07CA–U+07EA)",
    description:
      "A reference-friendly chart of N’Ko letters using their official Unicode names, to help you confirm characters without guessing.",
    level: "beginner",
    module: "foundations-reference",
    moduleOrder: 8,
    track: "foundations",
    order: 1,
    prerequisites: ["nko-vowels", "nko-consonants"],
    topics: ["unicode", "reference", "letters", "alphabet"],
    estimatedTime: 25,
    duration: "25 minutes",
    tags: ["reference", "unicode"],
    objectives: [
      "Use Unicode names as a reliable reference system",
      "Recognize the official letter inventory in the N’Ko Unicode block",
      "Reduce errors by checking charts instead of guessing",
    ],
    vocabulary: [],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "vowels",
          title: "Vowels (Unicode Names)",
          content: `Vowel letters (glyph → Unicode name):
ߊ → NKO LETTER A
ߋ → NKO LETTER EE
ߌ → NKO LETTER I
ߍ → NKO LETTER E
ߎ → NKO LETTER U
ߏ → NKO LETTER OO
ߐ → NKO LETTER O

Note: Unicode names are stable identifiers. Pronunciation labels vary slightly by language/dialect and teaching tradition.`,
          nkoText: "ߊ ߋ ߌ ߍ ߎ ߏ ߐ",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which character is Unicode 'NKO LETTER I'?",
              options: ["ߌ", "ߍ", "ߋ", "ߊ"],
              correctAnswer: 0,
              explanation: "ߌ is NKO LETTER I (U+07CC).",
            },
          ],
        },
        {
          id: "consonants",
          title: "Consonants (Unicode Names)",
          content: `Core consonant letters (glyph → Unicode name):
ߒ → NKO LETTER N
ߓ → NKO LETTER BA
ߔ → NKO LETTER PA
ߕ → NKO LETTER TA
ߖ → NKO LETTER JA
ߗ → NKO LETTER CHA
ߘ → NKO LETTER DA
ߙ → NKO LETTER RA
ߚ → NKO LETTER RRA
ߛ → NKO LETTER SA
ߜ → NKO LETTER GBA
ߝ → NKO LETTER FA
ߞ → NKO LETTER KA
ߟ → NKO LETTER LA
ߡ → NKO LETTER MA
ߢ → NKO LETTER NYA
ߣ → NKO LETTER NA
ߤ → NKO LETTER HA
ߥ → NKO LETTER WA
ߦ → NKO LETTER YA

Extended series:
ߠ → NKO LETTER NA WOLOSO
ߧ → NKO LETTER NYA WOLOSO
ߨ → NKO LETTER JONA JA
ߩ → NKO LETTER JONA CHA
ߪ → NKO LETTER JONA RA`,
          nkoText: "ߒ ߓ ߔ ߕ ߖ ߗ ߘ ߙ ߚ ߛ ߜ ߝ ߞ ߟ ߡ ߢ ߣ ߤ ߥ ߦ",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which character is Unicode 'NKO LETTER GBA'?",
              options: ["ߜ", "ߛ", "ߞ", "ߦ"],
              correctAnswer: 0,
              explanation: "ߜ is NKO LETTER GBA (U+07DC).",
            },
          ],
        },
      ],
      summary:
        "You can use Unicode names as a dependable reference for vowels, consonants, and extended letter series in N’Ko.",
      vocabulary: [],
    },
  },
  {
    slug: "nko-unicode-marks-and-punctuation",
    title: "Unicode Marks and Punctuation (U+07EB–U+07FF)",
    description:
      "A reference lesson for N’Ko combining marks, punctuation, and symbols, using official Unicode names.",
    level: "beginner",
    module: "foundations-reference",
    moduleOrder: 8,
    track: "foundations",
    order: 2,
    prerequisites: ["tone-marks-diacritics", "punctuation-and-symbols"],
    topics: ["unicode", "reference", "diacritics", "punctuation"],
    estimatedTime: 25,
    duration: "25 minutes",
    tags: ["reference", "unicode"],
    objectives: [
      "Recognize common combining marks by shape and name",
      "Recognize N’Ko punctuation and symbols in Unicode",
      "Use Unicode names to look up unfamiliar marks",
    ],
    vocabulary: ["߫", "߬", "߭", "߮", "߯", "߰", "߱", "߲", "߳", "߸", "߹", "ߴ", "ߵ", "ߺ", "߽"],
    grammarPoints: [],
    culturalNotes: [],
    difficulty: 2,
    content: {
      sections: [
        {
          id: "combining",
          title: "Combining Marks (Diacritics)",
          content: `Combining tone/length marks:
߫ → NKO COMBINING SHORT HIGH TONE
߬ → NKO COMBINING SHORT LOW TONE
߭ → NKO COMBINING SHORT RISING TONE
߮ → NKO COMBINING LONG DESCENDING TONE
߯ → NKO COMBINING LONG HIGH TONE
߰ → NKO COMBINING LONG LOW TONE
߱ → NKO COMBINING LONG RISING TONE

Other combining marks:
߲ → NKO COMBINING NASALIZATION MARK
߳ → NKO COMBINING DOUBLE DOT ABOVE
߽ → NKO DANTAYALAN (combining)`,
          nkoText: "߫ ߬ ߭ ߮ ߯ ߰ ߱ ߲ ߳ ߽",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which character is the combining nasalization mark?",
              options: ["߲", "߳", "߸", "ߐ"],
              correctAnswer: 0,
              explanation: "߲ is NKO COMBINING NASALIZATION MARK (U+07F2).",
            },
          ],
        },
        {
          id: "punctuation",
          title: "Punctuation, Symbols, and Signs",
          content: `Punctuation:
߸ → NKO COMMA
߹ → NKO EXCLAMATION MARK

Symbols:
߶ → NKO SYMBOL OO DENNEN
߷ → NKO SYMBOL GBAKURUNEN

Apostrophes:
ߴ → NKO HIGH TONE APOSTROPHE
ߵ → NKO LOW TONE APOSTROPHE

Other marks/signs:
ߺ → NKO LAJANYALAN
߾ → NKO DOROME SIGN
߿ → NKO TAMAN SIGN`,
          nkoText: "߸ ߹ ߶ ߷ ߴ ߵ ߺ ߾ ߿",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which character is Unicode 'NKO COMMA'?",
              options: ["߸", "߹", "߬", "߀"],
              correctAnswer: 0,
              explanation: "߸ is NKO COMMA (U+07F8).",
            },
          ],
        },
      ],
      summary:
        "You have a reliable reference chart for N’Ko marks and punctuation using stable Unicode names.",
      vocabulary: [],
    },
  },
]

