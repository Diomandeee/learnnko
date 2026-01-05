import { NkoLessonSeed } from "../lesson-library-types"

export const beginnerFoundationsExpandedLessons: NkoLessonSeed[] = [
  {
    slug: "intro-to-nko",
    title: "Introduction to N'Ko Script",
    description:
      "A practical orientation: what N'Ko is, what it writes, and how you'll learn it step-by-step.",
    level: "beginner",
    module: "foundations-intro",
    moduleOrder: 1,
    track: "foundations",
    order: 1,
    prerequisites: [],
    topics: ["overview", "history", "learning-plan", "rtl"],
    estimatedTime: 30,
    duration: "30 minutes",
    tags: ["introduction", "script"],
    objectives: [
      "Know what N'Ko is (a script, not a separate language)",
      "Understand right-to-left reading direction",
      "Know the Unicode block for N’Ko",
      "Understand the recommended learning order (vowels → consonants → diacritics → fluency)",
    ],
    vocabulary: ["ߒߞߏ", "ߞߊ߲", "ߛߓߍ"],
    grammarPoints: [],
    culturalNotes: [
      "N'Ko is used to write multiple Manding (Mande) languages across West Africa.",
      "Learning N'Ko supports literacy by representing Manding sounds systematically.",
    ],
    difficulty: 1,
    content: {
      sections: [
        {
          id: "what-it-is",
          title: "What N'Ko Is (and Isn't)",
          content: `N'Ko is a writing system (a script). It is used to write several Manding languages (often called Mande or Manding), such as Bambara, Maninka, and Jula/Dyula.

That means:
- N'Ko is like the Latin alphabet: it can write different languages.
- When we learn “N'Ko lessons”, we are learning how to read and write the script, plus core literacy skills that apply to Manding texts written in N’Ko.

In this curriculum we’ll clearly separate “script knowledge” (letters, direction, tone marks) from “language knowledge” (vocabulary and grammar of a specific Manding language).`,
          exercises: [
            {
              type: "multiple-choice",
              question: "N'Ko is best described as…",
              options: [
                "A single spoken language",
                "A writing system used for several languages",
                "A secret code used only for poetry",
                "A dialect of French",
              ],
              correctAnswer: 1,
              explanation:
                "N'Ko is a script used to write multiple Manding languages; it is not itself a separate spoken language.",
            },
          ],
        },
        {
          id: "direction",
          title: "Direction and Flow (Right-to-Left)",
          content: `N'Ko text is written from right to left.

Practical habits to build:
- When you start a line, begin on the right margin and move left.
- When you scan a paragraph, your eyes move right → left on each line, and top → bottom across lines.
- When copying text, copy it in the same direction. Avoid “mirroring” letters; focus on the whole word shape.`,
          nkoText: "ߒߞߏ",
          latinTransliteration: "N'Ko",
          pronunciation: "n-kɔ (approx.)",
          exercises: [
            {
              type: "multiple-choice",
              question: "Which direction do you read N'Ko text?",
              options: ["Left-to-right", "Right-to-left", "Top-to-bottom", "Bottom-to-top"],
              correctAnswer: 1,
              explanation: "N'Ko is written and read right-to-left.",
            },
          ],
        },
        {
          id: "course-map",
          title: "A Realistic Learning Map",
          content: `You will progress fastest if you learn in layers:

1) Vowels (7 core vowel letters)
2) Core consonants (high-frequency letters)
3) Syllable building (CV ladders, chunking)
4) Diacritics (tone/length marks, nasalization, special marks)
5) Reading fluency (speed + accuracy + proofreading habits)
6) Writing fluency (legibility + spacing + keyboard skills)

Important mindset: early on, speed does not matter. Accuracy does. Build accuracy first, then speed.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Which sequence is the best beginner progression?",
              options: [
                "Tone marks → consonants → vowels",
                "Vowels → consonants → syllables → diacritics",
                "Vocabulary → poetry → tone marks",
                "Only handwriting; reading can wait",
              ],
              correctAnswer: 1,
              explanation:
                "Learning vowels first makes syllables readable early; diacritics refine meaning and pronunciation later.",
            },
          ],
        },
        {
          id: "unicode",
          title: "N'Ko in Unicode (Digital Reality Check)",
          content: `In modern software, N'Ko is encoded in Unicode. The main Unicode block is U+07C0–U+07FF.

Why that matters:
- If your device supports Unicode N'Ko, you can type and share N'Ko across apps.
- If the font is missing, characters may show as empty boxes. That is a font issue, not “wrong spelling”.

Keep this mental model:
text = Unicode code points
appearance = font + rendering`,
          exercises: [
            {
              type: "multiple-choice",
              question: "If N’Ko letters show as empty boxes, the most likely issue is…",
              options: [
                "The text is not Unicode",
                "A missing/unsupported font for N'Ko",
                "The internet is disconnected",
                "The language is illegal to display",
              ],
              correctAnswer: 1,
              explanation: "Boxes usually mean the font/rendering stack doesn't support N'Ko.",
            },
          ],
        },
      ],
      summary:
        "You know what N'Ko is, how it flows on the page (right-to-left), and how you’ll build skills in the right order.",
      vocabulary: [
        { nko: "ߒߞߏ", latin: "N'Ko", english: "N’Ko (script name)", french: "N’Ko (nom de l’écriture)" },
        { nko: "ߞߊ߲", latin: "kan", english: "language/speech", french: "langue/parole" },
        { nko: "ߛߓߍ", latin: "sɛbɛ", english: "writing / to write", french: "écriture / écrire" },
      ],
    },
  },
  {
    slug: "nko-history-culture",
    title: "N'Ko: History, Purpose, and Cultural Impact",
    description:
      "Why N'Ko was created, what problems it solved, and why it matters today (including digital use).",
    level: "beginner",
    module: "foundations-intro",
    moduleOrder: 1,
    track: "foundations",
    order: 2,
    prerequisites: ["intro-to-nko"],
    topics: ["history", "culture", "literacy", "identity"],
    estimatedTime: 35,
    duration: "35 minutes",
    tags: ["history", "culture"],
    objectives: [
      "Explain why N'Ko was created and what it was designed to do",
      "Describe how a script can support literacy and knowledge preservation",
      "Recognize that N'Ko is a living, modern script (including digital use)",
    ],
    vocabulary: ["ߒߞߏ", "ߞߊ߲ߕߍ", "ߞߊ߬ߙߊ߲"],
    grammarPoints: [],
    culturalNotes: [
      "N'Ko is strongly associated with community-led literacy and publishing.",
      "N’Ko writing supports education, correspondence, literature, religious texts, and cultural archives.",
    ],
    difficulty: 1,
    content: {
      sections: [
        {
          id: "problem",
          title: "The Problem N’Ko Set Out to Solve",
          content: `Manding societies have rich traditions of scholarship, oral literature, and learning. But writing systems historically used in the region (including borrowed scripts) often struggled to represent Manding sounds clearly and consistently.

N’Ko was designed to:
- fit the sound system of Manding languages (especially vowels and tone),
- support mass literacy (systematic letter shapes),
- empower communities to write their own knowledge in their own languages.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Which is a core design goal of N’Ko?",
              options: [
                "Avoid representing vowels",
                "Represent Manding sounds accurately and systematically",
                "Replace all spoken languages with one standard",
                "Only work in print, not handwriting",
              ],
              correctAnswer: 1,
              explanation:
                "N’Ko’s letter inventory and diacritics are designed to match Manding phonology and support literacy.",
            },
          ],
        },
        {
          id: "meaning",
          title: "The Meaning of “N'Ko”",
          content: `“N'Ko” is commonly glossed as “I say.” It centers voice, self-expression, and the ability to speak in writing.

As a learner, treat this as a reminder:
- your goal is not only to recognize letters,
- your goal is to express meaning accurately on the page.`,
          nkoText: "ߒߞߏ",
          latinTransliteration: "N'Ko",
          exercises: [
            {
              type: "multiple-choice",
              question: "“N'Ko” is often translated as…",
              options: ["I write", "I say", "My book", "Our nation"],
              correctAnswer: 1,
              explanation: "The commonly taught gloss is “I say.”",
            },
          ],
        },
        {
          id: "digital",
          title: "N’Ko Today: Print, Phones, and the Web",
          content: `Modern learners often encounter N’Ko first on a phone.

Digital realities:
- N’Ko is used in messaging, social media, PDFs, and educational materials.
- Unicode makes it possible to search, copy/paste, and store N’Ko text reliably.
- Fonts and keyboards determine what you can see and type.

Your goal is practical literacy: read, write, type, and proofread with confidence.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Unicode support is important for N’Ko because it…",
              options: [
                "makes N’Ko look prettier",
                "allows N’Ko text to be stored and exchanged consistently across apps",
                "prevents handwriting from being used",
                "translates N’Ko automatically into French",
              ],
              correctAnswer: 1,
              explanation: "Unicode is the encoding standard that keeps text consistent across platforms.",
            },
          ],
        },
      ],
      summary:
        "N’Ko is a purpose-built script for Manding languages that supports literacy, cultural preservation, and modern digital use.",
      vocabulary: [
        { nko: "ߞߊ߬ߙߊ߲", latin: "karan", english: "to read/study", french: "lire/étudier" },
        { nko: "ߛߓߍ", latin: "sɛbɛ", english: "writing", french: "écriture" },
      ],
    },
  },
  {
    slug: "writing-direction-and-layout",
    title: "Right-to-Left Writing: Layout, Numbers, and Mixed Text",
    description:
      "Master the practical mechanics of reading and writing N'Ko on paper and screens: direction, line breaks, and numbers.",
    level: "beginner",
    module: "foundations-script-basics",
    moduleOrder: 2,
    track: "foundations",
    order: 1,
    prerequisites: ["intro-to-nko"],
    topics: ["rtl", "layout", "numbers", "punctuation"],
    estimatedTime: 30,
    duration: "30 minutes",
    tags: ["rtl", "layout"],
    objectives: [
      "Read right-to-left confidently",
      "Understand why N’Ko digits run left-to-right",
      "Write mixed N’Ko + Latin text without losing direction",
    ],
    vocabulary: ["߀", "߁", "߂", "߸", "߹"],
    grammarPoints: [],
    culturalNotes: ["Many modern texts mix scripts (N’Ko, Latin, Arabic); layout habits preserve readability."],
    difficulty: 1,
    content: {
      sections: [
        {
          id: "rtl-mechanics",
          title: "RTL Mechanics You Can Practice Today",
          content: `Quick drills (2 minutes each):
1) Finger-tracking: follow a short line of N’Ko from right to left with your finger.
2) “Start-point” drill: draw a dot at the right margin of each line before writing, to reinforce direction.
3) Line-return drill: when you reach the left margin, jump back to the right margin on the next line.

These drills prevent the most common beginner error: writing correct letters in the wrong direction.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "When you finish a line in N’Ko, you should…",
              options: [
                "jump to the left edge of the next line",
                "jump to the right edge of the next line",
                "start again at the top of the page",
                "switch to left-to-right for the next line",
              ],
              correctAnswer: 1,
              explanation: "N’Ko lines run right-to-left; you begin the next line at the right margin.",
            },
          ],
        },
        {
          id: "numbers",
          title: "Numbers: Left-to-Right Inside Right-to-Left Text",
          content: `N’Ko digits are written left-to-right, even when surrounded by right-to-left text.

How to think about it:
- N’Ko words flow RTL.
- Number strings flow LTR (like “123”).

This keeps years and multi-digit values readable and consistent.`,
          nkoText: "߂߀߂߆",
          latinTransliteration: "2026",
          exercises: [
            {
              type: "multiple-choice",
              question: "Inside a line of N’Ko text, a multi-digit number is typically written…",
              options: ["right-to-left", "left-to-right", "top-to-bottom", "as words only"],
              correctAnswer: 1,
              explanation: "Digits preserve left-to-right order.",
            },
          ],
        },
        {
          id: "mixed-text",
          title: "Mixed N’Ko + Latin Text (Emails, URLs, Names)",
          content: `In modern messaging, you may mix scripts: N’Ko words + Latin names + URLs.

Practical rules:
- Keep long Latin sequences (URLs, emails) separated with spaces to avoid confusing directionality.
- Treat Latin/number chunks as left-to-right “islands” inside an RTL paragraph.
- Proofread by reading the N’Ko parts RTL, then the chunks LTR.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "A good way to prevent direction confusion when typing a URL next to N’Ko is…",
              options: [
                "remove all spaces",
                "insert a space before and after the URL chunk",
                "reverse the URL letters",
                "convert the URL into digits",
              ],
              correctAnswer: 1,
              explanation: "Spacing isolates mixed-direction chunks and makes text easier to parse.",
            },
          ],
        },
      ],
      summary:
        "You can manage the most important real-world layout issue: RTL words with LTR digit chunks, plus mixed-script text.",
      vocabulary: [
        { nko: "߸", latin: ",", english: "comma", french: "virgule" },
        { nko: "߹", latin: "!", english: "exclamation mark", french: "point d'exclamation" },
      ],
    },
  },
  {
    slug: "unicode-and-digital-tools",
    title: "Unicode, Fonts, and Keyboards for N'Ko",
    description:
      "How N'Ko works on computers and phones: Unicode range, fonts, keyboards, and common troubleshooting.",
    level: "beginner",
    module: "foundations-digital",
    moduleOrder: 6,
    track: "tools",
    order: 1,
    prerequisites: ["intro-to-nko"],
    topics: ["unicode", "fonts", "keyboards", "troubleshooting"],
    estimatedTime: 25,
    duration: "25 minutes",
    tags: ["unicode", "digital"],
    objectives: [
      "Know the N’Ko Unicode block (U+07C0–U+07FF)",
      "Understand the difference between encoding and fonts",
      "Recognize typical keyboard/font problems and their fixes",
    ],
    vocabulary: [],
    grammarPoints: [],
    culturalNotes: ["Digital access has accelerated N’Ko learning and publishing across borders."],
    difficulty: 1,
    content: {
      sections: [
        {
          id: "unicode-block",
          title: "Unicode: The Skeleton of Digital N'Ko",
          content: `Unicode assigns a number (code point) to each character. The main N’Ko block is U+07C0–U+07FF.

Examples:
- ߀..߉ are digits (U+07C0..U+07C9)
- ߊ.. are letters (starting at U+07CA)
- ߫ ߬ ߭ … are combining marks (tone/length marks, nasalization, etc.)

This is why copy/paste works: the code point stays the same across apps.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Unicode primarily provides…",
              options: ["a standardized way to encode characters", "a specific font for every language", "automatic translation", "a dictionary of meanings"],
              correctAnswer: 0,
              explanation: "Unicode is an encoding standard; fonts are separate.",
            },
          ],
        },
        {
          id: "fonts",
          title: "Fonts: The Skin (How N’Ko Looks)",
          content: `A font is a visual design for characters. The same N’Ko text can look different depending on the font.

Common symptom: “boxes” (missing glyphs).
Cause: the device doesn’t have an N’Ko-capable font.
Fix: install/enable an N’Ko font or use an app that bundles one.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "If N’Ko displays as squares, the most likely fix is…",
              options: ["turn the screen upside down", "install/enable an N’Ko font", "delete the text and retype in Latin", "restart your router"],
              correctAnswer: 1,
              explanation: "Boxes usually mean missing font support.",
            },
          ],
        },
        {
          id: "keyboards",
          title: "Keyboards: How You Enter Characters",
          content: `Keyboards map your taps/keystrokes to characters.

Strategies:
- Mobile: add an N’Ko keyboard layout (system keyboard or third-party).
- Desktop: use an IME/layout or a web keyboard.
- Learning tip: keep a reference chart nearby so typing reinforces recognition.

Typing isn’t optional: it turns passive recognition into active recall.`,
          exercises: [
            {
              type: "multiple-choice",
              question: "Typing practice is valuable because it…",
              options: ["reduces the number of letters", "forces active recall of characters", "removes the need to read", "automatically adds tone marks"],
              correctAnswer: 1,
              explanation: "Typing strengthens recall and fluency.",
            },
          ],
        },
      ],
      summary:
        "You understand the digital stack: Unicode encodes N’Ko, fonts display it, and keyboards input it.",
      vocabulary: [],
    },
  },
]

