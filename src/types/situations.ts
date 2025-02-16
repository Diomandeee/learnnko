export interface Situation {
  id: string
  title: string
  description: string
  icon: any
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  categories: string[]
  culturalNotes: string[]
  requiredVocabulary: VocabularyItem[]
  objectives: string[]
  estimatedTime: number
  xpReward: number
}

export interface VocabularyItem {
  french: string
  english: string
  pronunciation: string
  context: string
  examples: string[]
  usageNotes: string[]
  formality: 'formal' | 'informal' | 'both'
}

export interface DialogueStep {
  id: string
  role: 'system' | 'npc' | 'user'
  content: string
  translation: string
  audioUrl?: string
  alternatives: string[]
  culturalNotes?: string[]
  grammarNotes?: string[]
  expectedResponses?: UserResponse[]
}

export interface UserResponse {
  text: string
  translation: string
  accuracy: number
  grammarCorrections?: string[]
  pronunciationTips?: string[]
}

export interface ScenarioProgress {
  situationId: string
  completedSteps: string[]
  userResponses: Record<string, UserResponse>
  accuracyScore: number
  timeSpent: number
  mistakesMade: number
  vocabularyLearned: string[]
}

export interface SituationMetrics {
  totalAttempts: number
  bestAccuracy: number
  averageTime: number
  commonMistakes: string[]
  masteredPhrases: string[]
  improvement: number
}
