/**
 * N'Ko Language Learning Database - TypeScript Types
 * 
 * Auto-generated from the Supabase schema.
 * These types map directly to the database tables.
 */

// ============================================
// Enums
// ============================================

export type SourceType = 'youtube' | 'file' | 'upload' | 'stream';
export type SourceStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type CharacterType = 'digit' | 'vowel' | 'consonant' | 'combining' | 'punctuation' | 'whitespace' | 'other';

export type DetectionStatus = 'raw' | 'validated' | 'corrected' | 'rejected' | 'disputed';
export type ContextType = 'greeting' | 'vocabulary' | 'phrase' | 'sentence' | 'lesson_title' | 'instruction' | 'number' | 'alphabet' | 'proverb' | 'dialogue' | 'other';
export type TextRegion = 'title' | 'body' | 'caption' | 'overlay' | 'unknown';

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'conjunction' | 'preposition' | 'postposition' | 'interjection' | 'particle' | 'determiner' | 'number' | 'letter' | 'phrase' | 'affix';
export type VocabularyStatus = 'unverified' | 'verified' | 'disputed' | 'deprecated' | 'merged';
export type CategoryLevel = 'basic' | 'common' | 'intermediate' | 'advanced' | 'academic' | 'technical' | 'literary' | 'colloquial' | 'archaic';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type TextType = 'word' | 'phrase' | 'sentence' | 'paragraph' | 'dialogue' | 'proverb';
export type Formality = 'formal' | 'informal' | 'neutral' | 'literary';
export type Register = 'spoken' | 'written' | 'both';
export type QualityTier = 'gold' | 'silver' | 'bronze' | 'raw';

export type UserRole = 'learner' | 'contributor' | 'validator' | 'expert' | 'moderator' | 'admin';
export type NkoProficiency = 'none' | 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced' | 'native';

export type CorrectionType = 'typo' | 'mistranslation' | 'missing_content' | 'wrong_content' | 'formatting' | 'grammar' | 'spelling' | 'tone_mark' | 'other';
export type CorrectionStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'superseded' | 'withdrawn';
export type ValidationVote = 'approve' | 'reject' | 'unsure';

export type SessionType = 'realtime_learning' | 'batch_review' | 'practice' | 'assessment' | 'exploration' | 'correction';
export type LearningPhase = 'exploration' | 'consolidation' | 'synthesis' | 'debugging' | 'planning';
export type EventType = 'view' | 'learn' | 'review' | 'correct' | 'validate' | 'quiz_correct' | 'quiz_incorrect' | 'skip' | 'bookmark' | 'share';
export type TrajectoryType = 'learning_path' | 'content_flow' | 'error_pattern' | 'mastery_path';
export type NodeOutcome = 'success' | 'partial' | 'failure' | 'skip' | 'unknown';

export type RelationshipType = 'synonym' | 'antonym' | 'hypernym' | 'hyponym' | 'meronym' | 'holonym' | 'derived' | 'compound' | 'related' | 'see_also';
export type GrammarCategory = 'morphology' | 'syntax' | 'phonology' | 'tone' | 'noun_class' | 'verb_conjugation' | 'word_order' | 'agreement';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ContentType = 'word' | 'phrase' | 'sentence' | 'paragraph' | 'detection' | 'definition' | 'example';

// ============================================
// Source Layer Types
// ============================================

export interface NkoSource {
  id: string;
  source_type: SourceType;
  url: string;
  external_id: string | null;
  title: string | null;
  description: string | null;
  channel_name: string | null;
  channel_id: string | null;
  duration_ms: number | null;
  language: string;
  quality: string | null;
  status: SourceStatus;
  error_message: string | null;
  frame_count: number;
  nko_frame_count: number;
  total_detections: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
}

export interface NkoFrame {
  id: string;
  source_id: string;
  frame_index: number;
  timestamp_ms: number;
  width: number | null;
  height: number | null;
  format: string;
  has_nko: boolean;
  detection_count: number;
  confidence: number;
  is_keyframe: boolean;
  blur_score: number | null;
  brightness: number | null;
  image_hash: string | null;
  is_duplicate: boolean;
  duplicate_of_id: string | null;
  storage_path: string | null;
  storage_bucket: string | null;
  thumbnail_path: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============================================
// Detection Layer Types
// ============================================

export interface NkoDetection {
  id: string;
  frame_id: string;
  nko_text: string;
  nko_text_normalized: string | null;
  latin_text: string | null;
  english_text: string | null;
  char_count: number;
  word_count: number;
  vowel_count: number;
  consonant_count: number;
  digit_count: number;
  combining_mark_count: number;
  punctuation_count: number;
  confidence: number;
  nko_coverage: number;
  is_valid_structure: boolean;
  validation_errors: string[];
  validation_warnings: string[];
  bounding_box: BoundingBox | null;
  text_region: TextRegion | null;
  context_type: ContextType | null;
  gemini_response_id: string | null;
  gemini_model: string | null;
  raw_response: Record<string, unknown> | null;
  processing_time_ms: number | null;
  status: DetectionStatus;
  validated_by: string | null;
  validated_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface NkoCharacter {
  id: string;
  detection_id: string;
  char: string;
  code_point: number;
  position: number;
  char_type: CharacterType;
  block_name: string | null;
  unicode_name: string | null;
  base_char_id: string | null;
  is_combining: boolean;
  combining_class: number | null;
  created_at: string;
}

// ============================================
// Linguistic Layer Types
// ============================================

export interface NkoVocabulary {
  id: string;
  word: string;
  word_normalized: string;
  latin: string | null;
  latin_variants: string[];
  meaning_primary: string | null;
  meanings: string[];
  definition: string | null;
  pos: PartOfSpeech | null;
  root_word_id: string | null;
  plural_form: string | null;
  singular_form: string | null;
  verb_conjugations: Record<string, Record<string, string>> | null;
  verb_class: string | null;
  noun_class: string | null;
  gender: string | null;
  dialects: string[];
  variants: Record<string, string>;
  is_loanword: boolean;
  loanword_source: string | null;
  frequency: number;
  frequency_rank: number | null;
  category: CategoryLevel | null;
  cefr_level: CefrLevel | null;
  difficulty_score: number | null;
  topics: string[];
  learn_count: number;
  learn_mean: number;
  learn_m2: number;
  ipa_transcription: string | null;
  audio_url: string | null;
  tone_pattern: string | null;
  status: VocabularyStatus;
  merged_into_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NkoTranslation {
  id: string;
  nko_text: string;
  nko_text_normalized: string | null;
  latin_text: string | null;
  english_text: string | null;
  french_text: string | null;
  arabic_text: string | null;
  vocabulary_ids: string[];
  detection_id: string | null;
  source_id: string | null;
  frame_id: string | null;
  text_type: TextType | null;
  context_type: string | null;
  formality: Formality | null;
  register: Register | null;
  confidence: number;
  validated: boolean;
  validation_score: number | null;
  validation_count: number;
  correction_count: number;
  is_training_sample: boolean;
  is_validation_sample: boolean;
  is_test_sample: boolean;
  quality_tier: QualityTier | null;
  created_at: string;
  updated_at: string;
}

export interface NkoExample {
  id: string;
  vocabulary_id: string;
  nko_sentence: string;
  latin_sentence: string | null;
  english_sentence: string | null;
  french_sentence: string | null;
  word_start_pos: number | null;
  word_end_pos: number | null;
  source_id: string | null;
  translation_id: string | null;
  context_note: string | null;
  is_verified: boolean;
  difficulty_level: DifficultyLevel | null;
  created_at: string;
}

export interface NkoPhonetic {
  id: string;
  vocabulary_id: string;
  ipa: string;
  ipa_broad: string | null;
  ipa_narrow: string | null;
  tone_pattern: string | null;
  tone_marks: string | null;
  audio_url: string | null;
  audio_duration_ms: number | null;
  syllables: string[];
  syllable_count: number | null;
  dialect: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface NkoGrammarRule {
  id: string;
  rule_name: string;
  rule_category: GrammarCategory | null;
  description: string;
  pattern: string | null;
  pattern_nko: string | null;
  examples: GrammarExample[];
  exceptions: GrammarException[];
  related_vocabulary_ids: string[];
  difficulty_level: DifficultyLevel | null;
  prerequisite_rule_ids: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface GrammarExample {
  nko: string;
  latin?: string;
  english: string;
  explanation?: string;
}

export interface GrammarException {
  nko: string;
  english: string;
  reason: string;
}

export interface NkoWordRelationship {
  id: string;
  word_id: string;
  related_word_id: string;
  relationship_type: RelationshipType;
  strength: number;
  is_bidirectional: boolean;
  created_at: string;
}

// ============================================
// User Layer Types
// ============================================

export interface NkoUser {
  id: string;
  auth_id: string | null;
  anonymous_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  native_language: string | null;
  native_languages: string[];
  learning_languages: string[];
  nko_proficiency: NkoProficiency | null;
  manding_dialects: string[];
  role: UserRole;
  trust_score: number;
  reputation_points: number;
  corrections_submitted: number;
  corrections_accepted: number;
  corrections_rejected: number;
  validations_count: number;
  validations_correct: number;
  vocabulary_learned: number;
  sessions_completed: number;
  total_learning_time_ms: number;
  preferences: Record<string, unknown>;
  notification_settings: Record<string, unknown>;
  is_active: boolean;
  is_verified: boolean;
  banned_until: string | null;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

export interface NkoCorrection {
  id: string;
  detection_id: string | null;
  translation_id: string | null;
  vocabulary_id: string | null;
  example_id: string | null;
  field_corrected: string;
  original_value: string;
  corrected_value: string;
  correction_note: string | null;
  correction_type: CorrectionType | null;
  user_id: string | null;
  status: CorrectionStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  rejection_reason: string | null;
  confidence: number | null;
  community_votes: number;
  upvotes: number;
  downvotes: number;
  is_applied: boolean;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NkoValidation {
  id: string;
  detection_id: string | null;
  translation_id: string | null;
  correction_id: string | null;
  user_id: string;
  vote: ValidationVote;
  confidence: number;
  feedback_note: string | null;
  issues_found: string[];
  created_at: string;
}

// ============================================
// Session/Trajectory Layer Types
// ============================================

export interface NkoSession {
  id: string;
  user_id: string | null;
  anonymous_id: string | null;
  session_type: SessionType;
  source_id: string | null;
  vocabulary_focus_ids: string[];
  topic_focus: string[];
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  active_time_ms: number | null;
  frames_processed: number;
  detections_viewed: number;
  vocabulary_encountered: number;
  vocabulary_learned: number;
  vocabulary_reviewed: number;
  corrections_made: number;
  confidence_count: number;
  confidence_mean: number;
  confidence_m2: number;
  current_phase: LearningPhase | null;
  phase_transitions: PhaseTransition[];
  engagement_score: number | null;
  completion_rate: number | null;
  device_type: string | null;
  platform: string | null;
  app_version: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PhaseTransition {
  phase: LearningPhase;
  timestamp_ms: number;
  trigger: string;
  confidence: number;
}

export interface NkoLearningEvent {
  id: string;
  session_id: string;
  vocabulary_id: string | null;
  detection_id: string | null;
  translation_id: string | null;
  event_type: EventType;
  timestamp_ms: number;
  duration_ms: number | null;
  was_correct: boolean | null;
  confidence: number | null;
  difficulty_rating: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface NkoTrajectory {
  id: string;
  session_id: string | null;
  user_id: string | null;
  name: string | null;
  description: string | null;
  trajectory_type: TrajectoryType | null;
  max_depth: number;
  total_nodes: number;
  avg_homogeneity: number;
  total_complexity: number;
  avg_temporal: number;
  dominant_phase: LearningPhase | null;
  phase_distribution: Record<LearningPhase, number>;
  phase_transition_count: number;
  avg_salience: number;
  high_salience_count: number;
  terminal_node_count: number;
  coherence_score: number | null;
  coverage_score: number | null;
  efficiency_score: number | null;
  is_complete: boolean;
  is_successful: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface NkoTrajectoryNode {
  id: string;
  trajectory_id: string;
  learning_event_id: string | null;
  detection_id: string | null;
  vocabulary_id: string | null;
  node_index: number;
  trajectory_depth: number;
  trajectory_sibling_order: number;
  trajectory_homogeneity: number;
  trajectory_temporal: number;
  trajectory_complexity: number;
  trajectory_phase: LearningPhase | null;
  trajectory_phase_confidence: number;
  salience_score: number;
  is_phase_transition: boolean;
  is_terminal: boolean;
  parent_node_id: string | null;
  child_count: number;
  content_preview: string | null;
  content_type: string | null;
  outcome: NodeOutcome | null;
  timestamp_ms: number | null;
  created_at: string;
}

export interface NkoWelfordStats {
  id: string;
  vocabulary_id: string | null;
  user_id: string | null;
  stat_type: 'confidence' | 'response_time' | 'accuracy' | 'retention';
  count: number;
  mean: number;
  m2: number;
  variance: number;
  std_dev: number;
  ci_lower: number | null;
  ci_upper: number | null;
  min_value: number | null;
  max_value: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Embedding Layer Types
// ============================================

export interface NkoEmbedding {
  id: string;
  vocabulary_id: string | null;
  translation_id: string | null;
  detection_id: string | null;
  example_id: string | null;
  embedding: number[]; // 768-dimensional vector
  model_name: string;
  model_version: string | null;
  model_dimensions: number;
  content_type: ContentType | null;
  content_text: string | null;
  content_language: string;
  is_valid: boolean;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Insert/Update Types (without id, timestamps)
// ============================================

export type NkoSourceInsert = Omit<NkoSource, 'id' | 'created_at' | 'updated_at' | 'frame_count' | 'nko_frame_count' | 'total_detections'> & {
  id?: string;
};

export type NkoFrameInsert = Omit<NkoFrame, 'id' | 'created_at' | 'has_nko' | 'detection_count' | 'confidence'> & {
  id?: string;
};

export type NkoDetectionInsert = Omit<NkoDetection, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type NkoVocabularyInsert = Omit<NkoVocabulary, 'id' | 'created_at' | 'updated_at' | 'frequency' | 'frequency_rank' | 'learn_count' | 'learn_mean' | 'learn_m2'> & {
  id?: string;
};

export type NkoTranslationInsert = Omit<NkoTranslation, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type NkoCorrectionInsert = Omit<NkoCorrection, 'id' | 'created_at' | 'updated_at' | 'community_votes' | 'upvotes' | 'downvotes'> & {
  id?: string;
};

export type NkoSessionInsert = Omit<NkoSession, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type NkoTrajectoryInsert = Omit<NkoTrajectory, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type NkoTrajectoryNodeInsert = Omit<NkoTrajectoryNode, 'id' | 'created_at'> & {
  id?: string;
};

// ============================================
// Database Schema Type (for Supabase client)
// ============================================

export interface Database {
  public: {
    Tables: {
      nko_sources: {
        Row: NkoSource;
        Insert: NkoSourceInsert;
        Update: Partial<NkoSourceInsert>;
      };
      nko_frames: {
        Row: NkoFrame;
        Insert: NkoFrameInsert;
        Update: Partial<NkoFrameInsert>;
      };
      nko_detections: {
        Row: NkoDetection;
        Insert: NkoDetectionInsert;
        Update: Partial<NkoDetectionInsert>;
      };
      nko_characters: {
        Row: NkoCharacter;
        Insert: Omit<NkoCharacter, 'id' | 'created_at'>;
        Update: Partial<Omit<NkoCharacter, 'id' | 'created_at'>>;
      };
      nko_vocabulary: {
        Row: NkoVocabulary;
        Insert: NkoVocabularyInsert;
        Update: Partial<NkoVocabularyInsert>;
      };
      nko_translations: {
        Row: NkoTranslation;
        Insert: NkoTranslationInsert;
        Update: Partial<NkoTranslationInsert>;
      };
      nko_examples: {
        Row: NkoExample;
        Insert: Omit<NkoExample, 'id' | 'created_at'>;
        Update: Partial<Omit<NkoExample, 'id' | 'created_at'>>;
      };
      nko_users: {
        Row: NkoUser;
        Insert: Omit<NkoUser, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NkoUser, 'id' | 'created_at' | 'updated_at'>>;
      };
      nko_corrections: {
        Row: NkoCorrection;
        Insert: NkoCorrectionInsert;
        Update: Partial<NkoCorrectionInsert>;
      };
      nko_validations: {
        Row: NkoValidation;
        Insert: Omit<NkoValidation, 'id' | 'created_at'>;
        Update: Partial<Omit<NkoValidation, 'id' | 'created_at'>>;
      };
      nko_sessions: {
        Row: NkoSession;
        Insert: NkoSessionInsert;
        Update: Partial<NkoSessionInsert>;
      };
      nko_learning_events: {
        Row: NkoLearningEvent;
        Insert: Omit<NkoLearningEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<NkoLearningEvent, 'id' | 'created_at'>>;
      };
      nko_trajectories: {
        Row: NkoTrajectory;
        Insert: NkoTrajectoryInsert;
        Update: Partial<NkoTrajectoryInsert>;
      };
      nko_trajectory_nodes: {
        Row: NkoTrajectoryNode;
        Insert: NkoTrajectoryNodeInsert;
        Update: Partial<NkoTrajectoryNodeInsert>;
      };
      nko_welford_stats: {
        Row: NkoWelfordStats;
        Insert: Omit<NkoWelfordStats, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NkoWelfordStats, 'id' | 'created_at' | 'updated_at'>>;
      };
      nko_embeddings: {
        Row: NkoEmbedding;
        Insert: Omit<NkoEmbedding, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NkoEmbedding, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      find_similar_embeddings: {
        Args: {
          query_embedding: number[];
          match_count?: number;
          similarity_threshold?: number;
        };
        Returns: {
          embedding_id: string;
          vocabulary_id: string | null;
          translation_id: string | null;
          content_text: string | null;
          similarity: number;
        }[];
      };
      find_similar_vocabulary: {
        Args: {
          query_text: string;
          query_embedding: number[];
          match_count?: number;
        };
        Returns: {
          vocabulary_id: string;
          word: string;
          latin: string | null;
          meaning: string | null;
          similarity: number;
        }[];
      };
      update_welford_stats: {
        Args: {
          p_vocabulary_id: string;
          p_user_id: string;
          p_stat_type: string;
          p_new_value: number;
        };
        Returns: void;
      };
    };
  };
}

