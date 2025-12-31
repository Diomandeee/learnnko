import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@supabase/supabase-js";
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

interface DictionaryEntry {
  id: string;
  word: string;
  word_normalized: string;
  word_class: string | null;
  definitions_en: string[];
  definitions_fr: string[];
  examples: { bambara: string; english?: string; french?: string }[];
  variants: string[];
  synonyms: string[];
  has_tone_marks: boolean;
  source_url: string | null;
  similarity?: number;
}

// Initialize Supabase client for dictionary entries cache
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * Normalize a Manding word for matching.
 * Handles special characters: ɛ→e, ɔ→o, ɲ→ny, ŋ→ng
 * Removes tone diacritics while preserving base characters.
 */
function normalizeForSearch(query: string): string {
  return query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks (tones)
    .replace(/ɛ/g, 'e')
    .replace(/ɔ/g, 'o')
    .replace(/ɲ/g, 'ny')
    .replace(/ŋ/g, 'ng');
}

/**
 * Expand query with Manding character variants.
 * e.g., "dogo" -> also match "dɔgɔ"
 */
function getQueryVariants(query: string): string[] {
  const variants = new Set<string>([query, query.toLowerCase()]);
  
  // Add variants with special characters
  const expanded = query.toLowerCase()
    .replace(/e/g, '[eɛ]')
    .replace(/o/g, '[oɔ]')
    .replace(/ny/g, '[nyɲ]')
    .replace(/ng/g, '[ngŋ]');
  
  // Simple character swaps for common typos
  const swaps: [string, string][] = [
    ['e', 'ɛ'], ['ɛ', 'e'],
    ['o', 'ɔ'], ['ɔ', 'o'],
  ];
  
  for (const [from, to] of swaps) {
    if (query.includes(from)) {
      variants.add(query.replace(new RegExp(from, 'g'), to));
    }
  }
  
  return Array.from(variants);
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

    // Search local Prisma dictionary entries
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

    // Search Supabase dictionary cache (Ankataa scraped data)
    // Uses fuzzy matching with trigram similarity
    let cachedEntries: DictionaryEntry[] = [];
    if (supabase) {
      try {
        // Try fuzzy search first (uses pg_trgm for similarity)
        const { data: fuzzyData, error: fuzzyError } = await supabase
          .rpc('search_dictionary', { 
            search_term: normalizeForSearch(query),
            limit_count: 15 
          });
        
        if (!fuzzyError && fuzzyData && fuzzyData.length > 0) {
          cachedEntries = fuzzyData as DictionaryEntry[];
        } else {
          // Fallback to ILIKE search with query variants
          const variants = getQueryVariants(query);
          const orConditions = variants.map(v => 
            `word.ilike.%${v}%,word_normalized.ilike.%${v}%`
          ).join(',');
          
          const { data: ilikeData, error: ilikeError } = await supabase
            .from('dictionary_entries')
            .select('*')
            .or(`word.ilike.%${query}%,word_normalized.ilike.%${normalizeForSearch(query)}%,definitions_en.cs.{${query}}`)
            .limit(15);
          
          if (!ilikeError && ilikeData) {
            cachedEntries = ilikeData as DictionaryEntry[];
          }
        }
        
        // Also search in definitions (English and French)
        if (cachedEntries.length < 5) {
          const { data: defData } = await supabase
            .from('dictionary_entries')
            .select('*')
            .or(`definitions_en.cs.{"${query}"},definitions_fr.cs.{"${query}"}`)
            .limit(10);
          
          if (defData) {
            // Merge without duplicates
            const existingIds = new Set(cachedEntries.map(e => e.id));
            for (const entry of defData) {
              if (!existingIds.has(entry.id)) {
                cachedEntries.push(entry as DictionaryEntry);
              }
            }
          }
        }
      } catch (cacheError) {
        console.warn("Dictionary cache search failed:", cacheError);
      }
    }

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

    // Format cached dictionary entries (Ankataa scraped data)
    const cachedFormatted = cachedEntries.map(entry => ({
      id: entry.id,
      nkoText: entry.word,
      translation: entry.definitions_en?.[0] || '',
      definition: entry.definitions_en?.join('; ') || '',
      definitionFr: entry.definitions_fr?.join('; ') || '',
      pronunciation: entry.word_normalized,
      wordClass: entry.word_class,
      examples: entry.examples?.map(e => e.bambara) || [],
      variants: entry.variants || [],
      synonyms: entry.synonyms || [],
      hasToneMarks: entry.has_tone_marks,
      categories: ['bambara', 'cached'],
      source: 'ankataa-cache',
      url: entry.source_url
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

    // Sort results by relevance (exact matches first, then by similarity)
    const allResults = [...localFormatted, ...cachedFormatted, ...externalFormatted];
    const sortedResults = allResults.sort((a, b) => {
      // Exact matches first
      const aExact = a.nkoText?.toLowerCase() === query.toLowerCase() || 
                     a.translation?.toLowerCase() === query.toLowerCase();
      const bExact = b.nkoText?.toLowerCase() === query.toLowerCase() || 
                     b.translation?.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then by source priority (local > cached > external)
      const sourcePriority: Record<string, number> = { 'local': 0, 'ankataa-cache': 1, 'mande-dictionary': 2 };
      return (sourcePriority[a.source] || 3) - (sourcePriority[b.source] || 3);
    });

    // Queue for expansion if no results or poor quality results
    // This enables continuous learning from user queries
    const hasGoodResults = sortedResults.length > 0 && sortedResults.some(r => 
      r.source === 'local' || r.source === 'ankataa-cache'
    );
    
    if (!hasGoodResults && supabase && query.length >= 2) {
      // Queue this word for future enrichment (non-blocking)
      try {
        const { error: queueError } = await supabase.rpc('queue_word_for_enrichment', {
          p_word: query,
          p_source_type: 'user_query',
          p_priority: 2, // High priority - user is looking for this
          p_context: {
            normalized: normalizeForSearch(query),
            external_results_count: externalFormatted.length,
            search_timestamp: Date.now(),
          }
        });
        
        if (!queueError) {
          console.log(`Queued "${query}" for vocabulary expansion`);
        }
      } catch (queueErr) {
        // Non-critical - don't fail the search for queue errors
        console.debug("Queue hook failed (non-critical):", queueErr);
      }
    }

    // Build response with cache headers
    const response = NextResponse.json({
      query,
      normalized: normalizeForSearch(query),
      results: sortedResults,
      totalResults: sortedResults.length,
      sources: {
        local: localFormatted.length,
        cached: cachedFormatted.length,
        external: externalFormatted.length
      },
      meta: {
        searchTime: Date.now(),
        hasExactMatch: sortedResults.some(r => 
          r.nkoText?.toLowerCase() === query.toLowerCase()
        ),
        queued: !hasGoodResults && query.length >= 2,
      }
    });

    // Cache for 5 minutes (dictionary data changes infrequently)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
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
