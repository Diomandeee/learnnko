import { beginnerAlphabetExpandedLessons } from "./beginner/alphabet-expanded"
import { beginnerDiacriticsExpandedLessons } from "./beginner/diacritics-expanded"
import { beginnerExpansionPackLessons } from "./beginner/expansion-pack"
import { beginnerFoundationsExpandedLessons } from "./beginner/foundations-expanded"
import { beginnerLiteracyExpandedLessons } from "./beginner/literacy-expanded"
import { beginnerPunctuationAndNumbersLessons } from "./beginner/punctuation-and-numbers"
import { beginnerUnicodeChartsLessons } from "./beginner/unicode-charts"
import { NkoLessonSeed } from "./lesson-library-types"

export const nkoLessonLibrary: NkoLessonSeed[] = [
  ...beginnerFoundationsExpandedLessons,
  ...beginnerAlphabetExpandedLessons,
  ...beginnerExpansionPackLessons,
  ...beginnerDiacriticsExpandedLessons,
  ...beginnerPunctuationAndNumbersLessons,
  ...beginnerLiteracyExpandedLessons,
  ...beginnerUnicodeChartsLessons,
]

export function getLessonFromLibrary(slug: string): NkoLessonSeed | undefined {
  return nkoLessonLibrary.find((lesson) => lesson.slug === slug)
}
