import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as cheerio from 'cheerio';

interface SearchResult {
  term: string;
  translation: string;
  partOfSpeech?: string;
  entryName: string;
  url: string;
  definition?: string;
  example?: string;
  exampleTranslation?: string;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get search parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const language = searchParams.get('lang') || 'english';
    
    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Convert the search language to the external dictionary format
    const searchType = language === 'english' ? 'english' : 
                       language === 'french' ? 'french' : 'lexicon';
    
    // Fetch data from An Ka Taa dictionary
    const response = await fetch(
      `https://dictionary.ankataa.com/search.php?input=${encodeURIComponent(query)}&search=${searchType}`,
      { headers: { 'User-Agent': 'NKO Learning App/1.0' } }
    );

    const html = await response.text();
    const results = parseSearchResults(html);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in external dictionary search:", error);
    return NextResponse.json(
      { error: "External dictionary search failed" },
      { status: 500 }
    );
  }
}

function parseSearchResults(html: string): SearchResult[] {
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  // Find all search results
  $('.search-result').each((i, el) => {
    try {
      const term = $(el).find('.lpIndexEnglish').text().trim();
      const entryName = $(el).find('.lpLexEntryName').text().trim();
      const aTag = $(el).find('a').first();
      const url = 'https://dictionary.ankataa.com/' + aTag.attr('href');
      
      // Get part of speech if available
      let partOfSpeech = '';
      const posElement = $(el).find('.lpPartOfSpeech');
      if (posElement.length > 0) {
        partOfSpeech = posElement.text().trim();
      }

      // Get definition and example if available
      const fullResultDiv = $(el).find('.full-lexicon-result');
      let definition = '';
      let example = '';
      let exampleTranslation = '';

      if (fullResultDiv.length > 0) {
        // Try to extract English gloss
        const englishGloss = fullResultDiv.find('.lpGlossEnglish').first().text().trim();
        if (englishGloss) {
          definition = englishGloss;
        }

        // Try to extract example
        const exampleEl = fullResultDiv.find('.lpExample').first();
        if (exampleEl.length > 0) {
          example = exampleEl.text().trim();
          
          // Try to get the example translation
          const exampleTransEl = exampleEl.next('.lpGlossEnglish');
          if (exampleTransEl.length > 0) {
            exampleTranslation = exampleTransEl.text().trim();
          }
        }
      }

      results.push({
        term,
        translation: entryName,
        partOfSpeech,
        entryName,
        url,
        definition,
        example,
        exampleTranslation
      });
    } catch (e) {
      console.error("Error parsing search result:", e);
    }
  });

  return results;
}
