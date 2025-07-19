// NKO Lesson Structure
export interface NkoLesson {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  progress: number
  isLocked: boolean
  isCompleted: boolean
  topics: string[]
}

export interface NkoLessonContent {
  title: string
  introduction: string
  sections: NkoLessonSection[]
  exercises: NkoExercise[]
  culturalNotes?: string
}

export interface NkoLessonSection {
  title: string
  content: string
  examples: NkoExample[]
}

export interface NkoExample {
  nko: string
  transliteration: string
  translation: string
}

// NKO Exercise Types
export interface NkoExercise {
  question: string
  correctAnswer: string
  transliteration?: string
  translation?: string
  options?: string[]
  type?: 'multiple-choice' | 'writing' | 'matching' | 'reading'
}

export interface NkoExerciseResponse {
  exercises: NkoExercise[]
}

// NKO Dictionary Types
export interface NkoDictionaryEntry {
  nko: string
  latin: string
  english: string
  french: string
  partOfSpeech: string
  example?: {
    nko: string
    english: string
    french: string
  }
}

export interface NkoDictionarySearchResponse {
  results: NkoDictionaryEntry[]
}

// NKO Translation Types
export interface NkoTranslationResponse {
  translation: string
  transliteration?: string
  notes?: string
}

// NKO Progress Types
export interface NkoProgress {
  alphabet: number
  vocabulary: number
  grammar: number
  conversation: number
}

// NKO Example Sentence Types
export interface NkoSentence {
  nko: string
  transliteration: string
  english: string
  french: string
}

export interface NkoSentenceResponse {
  sentences: NkoSentence[]
}
