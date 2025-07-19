import { Anthropic } from '@anthropic-ai/sdk';

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "your-api-key-here"
});

export async function getGeminiDictionaryResults(query: string, language: string = 'english') {
  try {
    // Create the prompt that will ask Claude to generate dictionary entries
    const prompt = `
You are a N'Ko language dictionary API. I'm searching for "${query}" in ${language}.

I need 3-5 dictionary entries that would match this search query.
Each entry should include:
- A unique ID (use "claude-1", "claude-2", etc.)
- The word in N'Ko script
- Latin transliteration
- English translation
- French translation
- Part of speech (noun, verb, adj, etc.)
- Pronunciation guide
- An example sentence with translations in English and French

Make sure all N'Ko script is accurate and meaningful. If you can't find exact matches,
provide the closest relevant terms or related words.

Format your response as a JSON structure with this exact schema:
{
  "results": [
    {
      "id": "claude-1",
      "nko": "N'Ko script word",
      "latin": "Latin transliteration",
      "english": "English translation",
      "french": "French translation",
      "partOfSpeech": "noun/verb/adj",
      "pronunciation": "pronunciation guide",
      "example": {
        "nko": "Example sentence in N'Ko",
        "english": "Example translation in English",
        "french": "Example translation in French"
      }
    },
    ...more entries
  ]
}
`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219", // Use the latest Claude model
      max_tokens: 1500,
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.2, // Lower temperature for more consistent responses
    });

    // Extract the JSON from Claude's response
    const responseText = response.content[0].text;
    
    // Parse the JSON response
    try {
      // Extract JSON from text (in case Claude surrounds it with explanation)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
      const jsonResponse = JSON.parse(jsonStr);
      
      // Mark all results as coming from Claude
      if (jsonResponse.results && Array.isArray(jsonResponse.results)) {
        jsonResponse.results = jsonResponse.results.map((entry) => ({
          ...entry,
          isFromGemini: true, // Keep the same property name for UI compatibility
          isFavorite: false
        }));
      }
      
      return jsonResponse;
    } catch (error) {
      console.error("Error parsing Claude response:", error);
      console.log("Raw response:", responseText);
      
      // Create a fallback response
      return createFallbackResponse(query);
    }
  } catch (error) {
    console.error("Error getting dictionary results from Claude:", error);
    return createFallbackResponse(query);
  }
}

function createFallbackResponse(query: string) {
  // Create a fallback response with the original query
  return {
    results: [{
      id: `claude-${Math.random().toString(36).substring(2, 11)}`,
      nko: "ߝߏ߬ߟߌ߬ߟߊ", // Placeholder N'Ko text
      latin: "folila",
      english: query,
      french: query,
      partOfSpeech: "noun",
      pronunciation: "fo-li-la",
      isFavorite: false,
      isFromGemini: true,
      example: {
        nko: "ߒ ߡߊ߫ ߝߏ߬ߟߌ߬ߟߊ ߟߐ߲߫.",
        english: "I don't know this word.",
        french: "Je ne connais pas ce mot."
      }
    }]
  };
}

export function sanitizeSearchQuery(query: string): string {
  // Trim whitespace and remove special characters that might cause issues
  return query.trim().replace(/[^\w\s]/gi, '');
}
