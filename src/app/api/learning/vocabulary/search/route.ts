import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter required' },
      { status: 400 }
    );
  }

  try {
    // Search across multiple columns using full text search or ILIKE
    const normalizedQuery = query.toLowerCase().trim();

    // Try exact match first
    // Note: nko_vocabulary uses: word, latin, meaning_primary (not nko_text, latin_text, english_text)
    const { data: exactMatches, error: exactError } = await supabase
      .from('nko_vocabulary')
      .select(`
        id,
        word,
        latin,
        meaning_primary,
        is_dictionary_verified,
        status,
        frequency,
        verified_english,
        verified_french
      `)
      .or(`latin.eq.${normalizedQuery},word.eq.${query}`)
      .limit(5);

    if (exactError) {
      console.error('Exact search error:', exactError);
    }

    // Then fuzzy match
    const { data: fuzzyMatches, error: fuzzyError } = await supabase
      .from('nko_vocabulary')
      .select(`
        id,
        word,
        latin,
        meaning_primary,
        is_dictionary_verified,
        status,
        frequency,
        verified_english,
        verified_french
      `)
      .or(`latin.ilike.%${normalizedQuery}%,meaning_primary.ilike.%${normalizedQuery}%,word.ilike.%${query}%`)
      .order('frequency', { ascending: false })
      .limit(limit);

    if (fuzzyError) {
      console.error('Fuzzy search error:', fuzzyError);
      throw fuzzyError;
    }

    // Combine and deduplicate results
    const allResults = [...(exactMatches || []), ...(fuzzyMatches || [])];
    const seen = new Set<string>();
    const results = allResults.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    }).slice(0, limit);

    // Transform to camelCase for frontend
    // Using actual nko_vocabulary columns: word, latin, meaning_primary
    const transformed = results.map(r => ({
      id: r.id,
      nkoText: r.word,           // word column = N'Ko text
      latinText: r.latin,         // latin column = Latin transliteration
      englishText: r.meaning_primary,  // meaning_primary = English meaning
      isDictionaryVerified: r.is_dictionary_verified,
      confidence: r.frequency ? Math.min(r.frequency / 10, 1) : 0.5,  // Derive from frequency
      status: r.status,
      verifiedEnglish: r.verified_english,
      verifiedFrench: r.verified_french,
    }));

    return NextResponse.json({
      results: transformed,
      total: transformed.length,
      query,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: String(error) },
      { status: 500 }
    );
  }
}

