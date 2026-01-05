import { beginnerAlphabetExpandedLessons } from "./beginner/alphabet-expanded.ts"
import { beginnerDiacriticsExpandedLessons } from "./beginner/diacritics-expanded.ts"
import { beginnerExpansionPackLessons } from "./beginner/expansion-pack.ts"
import { beginnerFoundationsExpandedLessons } from "./beginner/foundations-expanded.ts"
import { beginnerLiteracyExpandedLessons } from "./beginner/literacy-expanded.ts"
import { beginnerPunctuationAndNumbersLessons } from "./beginner/punctuation-and-numbers.ts"
import { beginnerUnicodeChartsLessons } from "./beginner/unicode-charts.ts"
import { NkoLessonSeed } from "./lesson-library-types.ts"

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
