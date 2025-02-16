import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateSimilarSentences(text: string, count: number = 3) {
  const prompt = `Generate ${count} new French sentences that are similar in structure and theme to this French text, but with different vocabulary: "${text}". Return only the French sentences, one per line.`;

  try {
    const result = await model.generateContent(prompt);
    const sentences = result.response.text().split('\n').filter(Boolean);
    return sentences;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}



