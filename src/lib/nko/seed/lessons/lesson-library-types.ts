export type NkoLessonLevel = "beginner" | "intermediate" | "advanced"

export type NkoLessonExercise = {
  type: "multiple-choice" | "fill-blank" | "matching" | "recognition"
  question: string
  options?: string[]
  correctAnswer: number | string
  explanation?: string
}

export type NkoLessonSection = {
  id: string
  title: string
  content: string
  nkoText?: string
  latinTransliteration?: string
  pronunciation?: string
  exercises?: NkoLessonExercise[]
  audioPrompt?: string
}

export type NkoLessonContent = {
  sections: NkoLessonSection[]
  quizQuestions?: Array<{
    id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
  }>
  summary?: string
  vocabulary?: Array<{
    nko: string
    latin: string
    english: string
    french: string
  }>
}

export type NkoLessonSeed = {
  slug: string
  title: string
  description: string
  level: NkoLessonLevel
  module: string
  moduleOrder: number
  track: string
  order: number
  prerequisites: string[]
  topics: string[]
  estimatedTime: number
  duration: string
  tags: string[]
  objectives: string[]
  vocabulary: string[]
  grammarPoints: string[]
  culturalNotes: string[]
  difficulty: number
  isActive?: boolean
  content: NkoLessonContent
}

