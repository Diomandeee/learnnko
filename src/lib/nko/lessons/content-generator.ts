import { Anthropic } from '@anthropic-ai/sdk';

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

type LessonContentType = {
  sections: {
    title: string;
    content: string;
    nkoText?: string;
    pronunciation?: string;
    latinTransliteration?: string;
    exercises?: {
      type: 'multiple-choice' | 'fill-blank' | 'matching' | 'recognition';
      question: string;
      options?: string[];
      correctAnswer: string | number;
      explanation?: string;
    }[];
    audioPrompt?: string;
  }[];
  quizQuestions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  summary: string;
  vocabulary: {
    nko: string;
    latin: string;
    english: string;
    french: string;
  }[];
};

export async function generateLessonContent(
  lessonId: string,
  lessonTitle: string,
  lessonDescription: string
): Promise<LessonContentType> {
  try {
    // For alphabet-vowels lesson, return pre-built content to avoid API call
    if (lessonId === 'alphabet-vowels') {
      return getVowelsLessonContent();
    }
    
    // For alphabet-consonants-1 lesson, return pre-built content
    if (lessonId === 'alphabet-consonants-1') {
      return getConsonantsLessonContent();
    }
    
    // For other lessons, generate with Claude
    const prompt = `
You are an expert N'Ko language teacher and curriculum designer. I need you to create detailed content for the following N'Ko language lesson:

Lesson Title: ${lessonTitle}
Lesson Description: ${lessonDescription}
Lesson ID: ${lessonId}

Please create comprehensive lesson content with the following structure:

1. Multiple educational sections, each containing:
   - Section title
   - Educational content (with proper N'Ko script when relevant)
   - Latin transliteration when N'Ko script is used
   - Pronunciation guidance
   - 2-3 practice exercises for each section

2. 5-7 quiz questions for the entire lesson with:
   - Question text
   - 4 multiple choice options
   - Index of correct answer (0-3)
   - Explanation of the answer

3. A concise lesson summary

4. A vocabulary list with:
   - N'Ko script
   - Latin transliteration
   - English translation
   - French translation

Format your response as a JSON object exactly matching this structure:
{
  "sections": [
    {
      "title": "Section Title",
      "content": "Educational text...",
      "nkoText": "N'Ko script example if relevant",
      "pronunciation": "Pronunciation guide if relevant",
      "latinTransliteration": "Latin transliteration if relevant",
      "exercises": [
        {
          "type": "multiple-choice",
          "question": "Exercise question",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": 0,
          "explanation": "Explanation of correct answer"
        }
      ],
      "audioPrompt": "Text describing what should be in the audio"
    }
  ],
  "quizQuestions": [
    {
      "question": "Quiz question",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "Explanation of correct answer"
    }
  ],
  "summary": "Lesson summary text",
  "vocabulary": [
    {
      "nko": "N'Ko word",
      "latin": "Latin transliteration",
      "english": "English translation",
      "french": "French translation"
    }
  ]
}

Make sure that ALL N'Ko script is accurate.
Include proper educational progression within sections.
Ensure exercises test understanding incrementally, from recognition to production.
`;

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    // Extract the JSON from Claude's response
    const responseText = response.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    
    try {
      return JSON.parse(jsonStr) as LessonContentType;
    } catch (error) {
      console.error("Error parsing lesson content:", error);
      console.log("Raw response:", responseText);
      // Return a basic fallback lesson
      return createFallbackLesson(lessonTitle, lessonDescription);
    }
  } catch (error) {
    console.error("Error generating lesson content:", error);
    return createFallbackLesson(lessonTitle, lessonDescription);
  }
}

function createFallbackLesson(title: string, description: string): LessonContentType {
  return {
    sections: [
      {
        title: "Introduction",
        content: `Welcome to the lesson on ${title}. ${description}`,
        exercises: [
          {
            type: "multiple-choice",
            question: "What will you learn in this lesson?",
            options: [
              `About ${title}`,
              "French grammar",
              "Chinese characters",
              "Programming"
            ],
            correctAnswer: 0,
            explanation: `This lesson focuses on ${title}.`
          }
        ]
      }
    ],
    quizQuestions: [
      {
        question: `What is the main focus of this lesson?`,
        options: [
          `${title}`,
          "Spanish vocabulary",
          "Mathematics",
          "Geography"
        ],
        correctAnswer: 0,
        explanation: `This lesson is primarily about ${title}.`
      }
    ],
    summary: `This lesson introduces you to ${title}. ${description}`,
    vocabulary: [
      {
        nko: "ߝߏ߬ߟߌ߬ߟߊ",
        latin: "folila",
        english: "Example word",
        french: "Mot d'exemple"
      }
    ]
  };
}

function getVowelsLessonContent(): LessonContentType {
  return {
    sections: [
      {
        title: "Introduction to N'Ko Vowels",
        content: "The N'Ko alphabet has 7 vowels, which are written from right to left. Each vowel has a distinct sound, and they are the foundation of N'Ko pronunciation.",
        exercises: [
          {
            type: "multiple-choice",
            question: "How many vowels are there in the N'Ko alphabet?",
            options: ["5", "6", "7", "8"],
            correctAnswer: 2,
            explanation: "The N'Ko alphabet contains 7 vowels."
          }
        ]
      },
      {
        title: "The First Three Vowels: ߊ, ߋ, ߌ",
        content: "Let's learn the first three vowels in the N'Ko alphabet.",
        nkoText: "ߊ, ߋ, ߌ",
        pronunciation: "a, e, i",
        latinTransliteration: "a, e, i",
        exercises: [
          {
            type: "matching",
            question: "Match the N'Ko vowel with its pronunciation",
            options: ["ߊ - a", "ߋ - e", "ߌ - i", "ߊ - i"],
            correctAnswer: 0,
            explanation: "ߊ is pronounced as 'a', ߋ is pronounced as 'e', and ߌ is pronounced as 'i'."
          }
        ],
        audioPrompt: "Pronunciation of the vowels ߊ (a), ߋ (e), ߌ (i)"
      },
      {
        title: "The Next Two Vowels: ߍ, ߎ",
        content: "Now let's learn two more vowels in the N'Ko alphabet.",
        nkoText: "ߍ, ߎ",
        pronunciation: "ɛ, u",
        latinTransliteration: "ɛ, u",
        exercises: [
          {
            type: "recognition",
            question: "Which of these is the N'Ko vowel 'ɛ'?",
            options: ["ߊ", "ߍ", "ߌ", "ߎ"],
            correctAnswer: 1,
            explanation: "ߍ is the N'Ko vowel that represents the sound 'ɛ'."
          }
        ],
        audioPrompt: "Pronunciation of the vowels ߍ (ɛ), ߎ (u)"
      },
      {
        title: "The Final Two Vowels: ߏ, ߐ",
        content: "Let's complete our study of N'Ko vowels with the final two.",
        nkoText: "ߏ, ߐ",
        pronunciation: "o, ɔ",
        latinTransliteration: "o, ɔ",
        exercises: [
          {
            type: "fill-blank",
            question: "The N'Ko vowel ߐ is pronounced as ___.",
            options: ["a", "e", "o", "ɔ"],
            correctAnswer: 3,
            explanation: "The vowel ߐ is pronounced as 'ɔ' as in 'ought' in English."
          }
        ],
        audioPrompt: "Pronunciation of the vowels ߏ (o), ߐ (ɔ)"
      },
      {
        title: "Vowel Combinations and Practice",
        content: "Now let's practice identifying and pronouncing all seven vowels together.",
        nkoText: "ߊ ߋ ߌ ߍ ߎ ߏ ߐ",
        pronunciation: "a e i ɛ u o ɔ",
        latinTransliteration: "a e i ɛ u o ɔ",
        exercises: [
          {
            type: "multiple-choice",
            question: "Which sequence correctly lists all N'Ko vowels in order?",
            options: [
              "ߊ ߋ ߌ ߍ ߎ ߏ ߐ",
              "ߐ ߏ ߎ ߍ ߌ ߋ ߊ",
              "ߊ ߌ ߋ ߍ ߏ ߎ ߐ",
              "ߊ ߋ ߌ ߎ ߍ ߏ ߐ"
            ],
            correctAnswer: 0,
            explanation: "The correct order of N'Ko vowels is ߊ (a), ߋ (e), ߌ (i), ߍ (ɛ), ߎ (u), ߏ (o), ߐ (ɔ)."
          }
        ],
        audioPrompt: "Pronunciation of all seven vowels in sequence: ߊ ߋ ߌ ߍ ߎ ߏ ߐ"
      }
    ],
    quizQuestions: [
      {
        question: "How many vowels does the N'Ko alphabet have?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 2,
        explanation: "The N'Ko alphabet has 7 vowels."
      },
      {
        question: "Which N'Ko vowel represents the sound 'a'?",
        options: ["ߋ", "ߊ", "ߌ", "ߏ"],
        correctAnswer: 1,
        explanation: "ߊ represents the 'a' sound in N'Ko."
      },
      {
        question: "Which N'Ko vowel represents the sound 'u'?",
        options: ["ߌ", "ߍ", "ߎ", "ߐ"],
        correctAnswer: 2,
        explanation: "ߎ represents the 'u' sound in N'Ko."
      },
      {
        question: "What is the correct pronunciation of ߏ?",
        options: ["a", "e", "i", "o"],
        correctAnswer: 3,
        explanation: "ߏ is pronounced as 'o' in N'Ko."
      },
      {
        question: "Which of these is NOT a vowel in N'Ko?",
        options: ["ߊ", "ߋ", "ߒ", "ߐ"],
        correctAnswer: 2,
        explanation: "ߒ is not a vowel in N'Ko. It's actually the first person singular pronoun (I/me)."
      }
    ],
    summary: "In this lesson, you've learned all seven vowels of the N'Ko alphabet: ߊ (a), ߋ (e), ߌ (i), ߍ (ɛ), ߎ (u), ߏ (o), and ߐ (ɔ). You've practiced identifying them visually and learned their pronunciations. These vowels form the foundation of N'Ko writing and pronunciation.",
    vocabulary: [
      {
        nko: "ߊ",
        latin: "a",
        english: "a (as in 'father')",
        french: "a (comme dans 'papa')"
      },
      {
        nko: "ߋ",
        latin: "e",
        english: "e (as in 'day')",
        french: "é (comme dans 'été')"
      },
      {
        nko: "ߌ",
        latin: "i",
        english: "i (as in 'machine')",
        french: "i (comme dans 'midi')"
      },
      {
        nko: "ߍ",
        latin: "ɛ",
        english: "e (as in 'bed')",
        french: "è (comme dans 'père')"
      },
      {
        nko: "ߎ",
        latin: "u",
        english: "u (as in 'rule')",
        french: "ou (comme dans 'cou')"
      },
      {
        nko: "ߏ",
        latin: "o",
        english: "o (as in 'go')",
        french: "o (comme dans 'mot')"
      },
      {
        nko: "ߐ",
        latin: "ɔ",
        english: "o (as in 'bought')",
        french: "o (comme dans 'or')"
      }
    ]
  };
}

function getConsonantsLessonContent(): LessonContentType {
  return {
    sections: [
      {
        title: "Introduction to N'Ko Consonants (Part 1)",
        content: "N'Ko has 19 consonants in total. In this lesson, we will learn the first 10 consonants. Like the vowels, N'Ko consonants are written from right to left.",
        exercises: [
          {
            type: "multiple-choice",
            question: "How many consonants will we learn in this lesson?",
            options: ["5", "7", "10", "19"],
            correctAnswer: 2,
            explanation: "We will learn the first 10 consonants in this lesson."
          }
        ]
      },
      {
        title: "Consonants: ߓ, ߔ, ߕ",
        content: "Let's start with the first three consonants in the N'Ko alphabet.",
        nkoText: "ߓ, ߔ, ߕ",
        pronunciation: "b, p, t",
        latinTransliteration: "b, p, t",
        exercises: [
          {
            type: "matching",
            question: "Match the N'Ko consonant with its pronunciation",
            options: ["ߓ - b", "ߔ - p", "ߕ - t", "ߓ - p"],
            correctAnswer: 0,
            explanation: "ߓ is pronounced as 'b', ߔ is pronounced as 'p', and ߕ is pronounced as 't'."
          }
        ],
        audioPrompt: "Pronunciation of the consonants ߓ (b), ߔ (p), ߕ (t)"
      },
      {
        title: "Consonants: ߖ, ߗ, ߘ, ߙ",
        content: "Now let's learn four more consonants in the N'Ko alphabet.",
        nkoText: "ߖ, ߗ, ߘ, ߙ",
        pronunciation: "j, ch, d, r",
        latinTransliteration: "j, c, d, r",
        exercises: [
          {
            type: "recognition",
            question: "Which of these is the N'Ko consonant 'd'?",
            options: ["ߖ", "ߗ", "ߘ", "ߙ"],
            correctAnswer: 2,
            explanation: "ߘ is the N'Ko consonant that represents the sound 'd'."
          }
        ],
        audioPrompt: "Pronunciation of the consonants ߖ (j), ߗ (ch), ߘ (d), ߙ (r)"
      },
      {
        title: "Consonants: ߚ, ߛ, ߜ",
        content: "Let's complete our study of the first 10 N'Ko consonants with these three.",
        nkoText: "ߚ, ߛ, ߜ",
        pronunciation: "s, gb, f",
        latinTransliteration: "s, gb, f",
        exercises: [
          {
            type: "fill-blank",
            question: "The N'Ko consonant ߛ is pronounced as ___.",
            options: ["s", "g", "gb", "f"],
            correctAnswer: 2,
            explanation: "The consonant ߛ is pronounced as 'gb', a sound found in many West African languages."
          }
        ],
        audioPrompt: "Pronunciation of the consonants ߚ (s), ߛ (gb), ߜ (f)"
      },
      {
        title: "Practice with Consonants and Vowels",
        content: "Now let's practice combining the consonants we've learned with vowels to form syllables.",
        nkoText: "ߓߊ - ba, ߓߋ - be, ߓߌ - bi, ߘߊ - da, ߘߋ - de, ߘߌ - di",
        pronunciation: "ba, be, bi, da, de, di",
        latinTransliteration: "ba, be, bi, da, de, di",
        exercises: [
          {
            type: "multiple-choice",
            question: "What does ߘߊ represent in N'Ko?",
            options: [
              "ba",
              "da",
              "ga",
              "ma"
            ],
            correctAnswer: 1,
            explanation: "ߘߊ represents 'da' in N'Ko, combining the consonant ߘ (d) with the vowel ߊ (a)."
          }
        ],
        audioPrompt: "Pronunciation of syllables: ߓߊ (ba), ߓߋ (be), ߓߌ (bi), ߘߊ (da), ߘߋ (de), ߘߌ (di)"
      }
    ],
    quizQuestions: [
      {
        question: "How many total consonants are in the N'Ko alphabet?",
        options: ["7", "10", "15", "19"],
        correctAnswer: 3,
        explanation: "The N'Ko alphabet has 19 consonants in total."
      },
      {
        question: "Which N'Ko consonant represents the sound 'b'?",
        options: ["ߓ", "ߔ", "ߕ", "ߖ"],
        correctAnswer: 0,
        explanation: "ߓ represents the 'b' sound in N'Ko."
      },
      {
        question: "Which N'Ko consonant represents the sound 'ch'?",
        options: ["ߖ", "ߗ", "ߘ", "ߙ"],
        correctAnswer: 1,
        explanation: "ߗ represents the 'ch' sound in N'Ko."
      },
      {
        question: "What is the correct pronunciation of ߛ?",
        options: ["s", "j", "f", "gb"],
        correctAnswer: 3,
        explanation: "ߛ is pronounced as 'gb' in N'Ko."
      },
      {
        question: "How would you write 'bi' in N'Ko?",
        options: ["ߓߊ", "ߓߋ", "ߓߌ", "ߓߍ"],
        correctAnswer: 2,
        explanation: "ߓߌ combines the consonant ߓ (b) with the vowel ߌ (i) to create 'bi'."
      }
    ],
    summary: "In this lesson, you've learned the first 10 consonants of the N'Ko alphabet: ߓ (b), ߔ (p), ߕ (t), ߖ (j), ߗ (ch), ߘ (d), ߙ (r), ߚ (s), ߛ (gb), and ߜ (f). You've practiced identifying them visually, learned their pronunciations, and begun combining them with vowels to form syllables.",
    vocabulary: [
      {
        nko: "ߓ",
        latin: "b",
        english: "b (as in 'boy')",
        french: "b (comme dans 'bon')"
      },
      {
        nko: "ߔ",
        latin: "p",
        english: "p (as in 'pen')",
        french: "p (comme dans 'père')"
      },
      {
        nko: "ߕ",
        latin: "t",
        english: "t (as in 'top')",
        french: "t (comme dans 'ton')"
      },
      {
        nko: "ߖ",
        latin: "j",
        english: "j (as in 'jam')",
        french: "dj (comme dans 'djinn')"
      },
      {
        nko: "ߗ",
        latin: "c",
        english: "ch (as in 'church')",
        french: "tch (comme dans 'tchèque')"
      },
      {
        nko: "ߘ",
        latin: "d",
        english: "d (as in 'day')",
        french: "d (comme dans 'dire')"
      },
      {
        nko: "ߙ",
        latin: "r",
        english: "r (rolled r)",
        french: "r (comme dans 'rouge')"
      },
      {
        nko: "ߚ",
        latin: "s",
        english: "s (as in 'sun')",
        french: "s (comme dans 'soleil')"
      },
      {
        nko: "ߛ",
        latin: "gb",
        english: "gb (as in West African languages)",
        french: "gb (comme dans les langues ouest-africaines)"
      },
      {
        nko: "ߜ",
        latin: "f",
        english: "f (as in 'fun')",
        french: "f (comme dans 'fou')"
      }
    ]
  };
}
