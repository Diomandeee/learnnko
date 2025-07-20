import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import * as cheerio from 'cheerio';

interface MandeSearchResult {
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
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const lang = searchParams.get('lang') || 'nko';

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Search local dictionary entries
    const localEntries = await prisma.nkoDictionaryEntry.findMany({
      where: {
        OR: [
          { nkoText: { contains: query, mode: 'insensitive' } },
          { definition: { contains: query, mode: 'insensitive' } },
          { translation: { contains: query, mode: 'insensitive' } },
          { pronunciation: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10,
      orderBy: { nkoText: 'asc' }
    });

    // Search external Mande dictionary
    let externalResults: MandeSearchResult[] = [];
    try {
      const searchType = lang === 'english' ? 'english' : 
                         lang === 'french' ? 'french' : 'lexicon';
      
      const response = await fetch(
        `https://dictionary.ankataa.com/search.php?input=${encodeURIComponent(query)}&search=${searchType}`,
        { 
          headers: { 'User-Agent': 'NKO Learning App/1.0' },
          timeout: 5000 
        }
      );

      if (response.ok) {
        const html = await response.text();
        externalResults = parseMandeSearchResults(html);
      }
    } catch (externalError) {
      console.warn("External dictionary search failed:", externalError);
      // Continue with local results only
    }

    // Combine and format results
    const localFormatted = localEntries.map(entry => ({
      id: entry.id,
      nkoText: entry.nkoText,
      translation: entry.translation,
      definition: entry.definition,
      pronunciation: entry.pronunciation,
      examples: entry.examples,
      categories: entry.categories,
      source: 'local'
    }));

    const externalFormatted = externalResults.slice(0, 10).map((result, index) => ({
      id: `external-${index}`,
      nkoText: result.translation,
      translation: result.term,
      definition: result.definition,
      pronunciation: result.partOfSpeech,
      examples: result.example ? [result.example] : [],
      categories: ['external'],
      source: 'mande-dictionary',
      url: result.url
    }));

    return NextResponse.json({
      query,
      results: [...localFormatted, ...externalFormatted],
      sources: {
        local: localFormatted.length,
        external: externalFormatted.length
      }
    });
  } catch (error) {
    console.error("Error searching dictionary:", error);
    return NextResponse.json(
      { error: "Failed to search dictionary" },
      { status: 500 }
    );
  }
}

function parseMandeSearchResults(html: string): MandeSearchResult[] {
  const $ = cheerio.load(html);
  const results: MandeSearchResult[] = [];

  $('.search-result').each((i, el) => {
    try {
      const term = $(el).find('.lpIndexEnglish').text().trim();
      const entryName = $(el).find('.lpLexEntryName').text().trim();
      const aTag = $(el).find('a').first();
      const url = 'https://dictionary.ankataa.com/' + aTag.attr('href');
      
      let partOfSpeech = '';
      const posElement = $(el).find('.lpPartOfSpeech');
      if (posElement.length > 0) {
        partOfSpeech = posElement.text().trim();
      }

      const fullResultDiv = $(el).find('.full-lexicon-result');
      let definition = '';
      let example = '';
      let exampleTranslation = '';

      if (fullResultDiv.length > 0) {
        const englishGloss = fullResultDiv.find('.lpGlossEnglish').first().text().trim();
        if (englishGloss) {
          definition = englishGloss;
        }

        const exampleEl = fullResultDiv.find('.lpExample').first();
        if (exampleEl.length > 0) {
          example = exampleEl.text().trim();
          
          const exampleTransEl = exampleEl.next('.lpGlossEnglish');
          if (exampleTransEl.length > 0) {
            exampleTranslation = exampleTransEl.text().trim();
          }
        }
      }

      if (term && entryName) {
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
      }
    } catch (e) {
      console.error("Error parsing search result:", e);
    }
  });

  return results;
}
