import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google's Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2-flash" });

export class NkoContentGenerator {
  /**
   * Generate practice exercises for N'Ko learning
   */
  static async generateExercises(topic: string, level: 'beginner' | 'intermediate' | 'advanced', count: number = 5) {
    const prompt = `
      Generate ${count} N'Ko practice exercises about "${topic}" for ${level}-level students.
      
      For each exercise, include:
      1. A question or prompt in English
      2. The correct N'Ko text/answer
      3. A transliteration of the N'Ko text
      4. An English translation
      5. 3-4 wrong options (for multiple choice questions)
      
      Return the exercises in this JSON format:
      {
        "exercises": [
          {
            "question": "Question text",
            "correctAnswer": "Correct N'Ko answer",
            "transliteration": "Latin transliteration",
            "translation": "English translation",
            "options": ["Wrong option 1", "Wrong option 2", "Wrong option 3", "Correct N'Ko answer"]
          }
        ]
      }
      
      Make sure the response is valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Error parsing generated exercises:", error);
      throw new Error("Failed to generate valid exercises");
    }
  }

  /**
   * Generate example sentences using specific N'Ko vocabulary or grammar
   */
  static async generateExampleSentences(vocabulary: string[], grammarPoint?: string, count: number = 3) {
    const prompt = `
      Generate ${count} example sentences in N'Ko using these vocabulary words: ${vocabulary.join(", ")}.
      ${grammarPoint ? `The sentences should demonstrate this grammar point: ${grammarPoint}.` : ""}
      
      For each sentence, include:
      1. The sentence in N'Ko script
      2. A Latin transliteration
      3. An English translation
      4. A French translation
      
      Return the sentences in this JSON format:
      {
        "sentences": [
          {
            "nko": "N'Ko sentence",
            "transliteration": "Latin transliteration",
            "english": "English translation",
            "french": "French translation"
          }
        ]
      }
      
      Make sure the response is valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Error parsing generated sentences:", error);
      throw new Error("Failed to generate valid sentences");
    }
  }

  /**
   * Translate text between N'Ko, English, and French
   */
  static async translateText(text: string, from: 'nko' | 'english' | 'french', to: 'nko' | 'english' | 'french') {
    const prompt = `
      Translate the following ${from} text to ${to}:
      "${text}"
      
      Return the translation in this JSON format:
      {
        "translation": "Translated text",
        "notes": "Any notes about the translation or cultural context"
      }
      
      If translating to N'Ko, also include a transliteration:
      {
        "translation": "Translated text in N'Ko",
        "transliteration": "Latin transliteration",
        "notes": "Any notes about the translation"
      }
      
      Make sure the response is valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Error parsing translation:", error);
      throw new Error("Failed to generate valid translation");
    }
  }
}
