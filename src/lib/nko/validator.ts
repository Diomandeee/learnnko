// src/lib/nko/validator.ts

// N'Ko Unicode ranges
export const NKO_BLOCK_START = 0x07C0;
export const NKO_BLOCK_END = 0x07FF;
export const NKO_DIGITS = { start: 0x07C0, end: 0x07C9 };
export const NKO_VOWELS = { start: 0x07CA, end: 0x07D0 };
export const NKO_CONSONANTS = { start: 0x07D1, end: 0x07E7 };
export const NKO_TONE_MARKS = { start: 0x07EB, end: 0x07F3 };

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  charBreakdown: CharacterAnalysis[];
}

export interface ValidationError {
  type: string;
  position: number;
  char: string;
  message: string;
}

export interface ValidationWarning {
  type: string;
  position: number;
  char: string;
  message: string;
}

export interface CharacterAnalysis {
  char: string;
  codePoint: number;
  type: 'vowel' | 'consonant' | 'tone' | 'digit' | 'punctuation' | 'unknown';
  isValid: boolean;
  position: number;
}

export function validateNkoText(text: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charBreakdown: CharacterAnalysis[] = [];

  let position = 0;
  for (const char of text) {
    const codePoint = char.codePointAt(0)!;
    const analysis = analyzeCharacter(char, codePoint, position);
    charBreakdown.push(analysis);

    if (!analysis.isValid) {
      errors.push({
        type: 'invalid_character',
        position,
        char,
        message: `Character '${char}' (U+${codePoint.toString(16).toUpperCase()}) is not valid N'Ko`,
      });
    }

    // Check for tone marks not following base letters
    if (analysis.type === 'tone') {
      const prevChar = charBreakdown[position - 1];
      if (!prevChar || (prevChar.type !== 'vowel' && prevChar.type !== 'consonant')) {
        errors.push({
          type: 'orphan_tone_mark',
          position,
          char,
          message: `Tone mark must follow a base letter`,
        });
      }
    }

    position++;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    charBreakdown,
  };
}

function analyzeCharacter(char: string, codePoint: number, position: number): CharacterAnalysis {
  let type: CharacterAnalysis['type'] = 'unknown';
  let isValid = false;

  if (codePoint >= NKO_VOWELS.start && codePoint <= NKO_VOWELS.end) {
    type = 'vowel';
    isValid = true;
  } else if (codePoint >= NKO_CONSONANTS.start && codePoint <= NKO_CONSONANTS.end) {
    type = 'consonant';
    isValid = true;
  } else if (codePoint >= NKO_TONE_MARKS.start && codePoint <= NKO_TONE_MARKS.end) {
    type = 'tone';
    isValid = true;
  } else if (codePoint >= NKO_DIGITS.start && codePoint <= NKO_DIGITS.end) {
    type = 'digit';
    isValid = true;
  } else if (codePoint >= 0x07F4 && codePoint <= 0x07FF) {
    type = 'punctuation';
    isValid = true;
  } else if (char === ' ' || char === '\n') {
    type = 'punctuation';  // Whitespace is allowed
    isValid = true;
  }

  return { char, codePoint, type, isValid, position };
}
