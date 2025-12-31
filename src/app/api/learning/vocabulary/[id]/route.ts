import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const vocabularyId = params.id;

  if (!vocabularyId) {
    return NextResponse.json(
      { error: 'Vocabulary ID required' },
      { status: 400 }
    );
  }

  try {
    // Fetch vocabulary entry
    // Note: nko_vocabulary uses: word, latin, meaning_primary (not nko_text, latin_text, english_text)
    const { data: vocabulary, error: vocabError } = await supabase
      .from('nko_vocabulary')
      .select(`
        id,
        word,
        latin,
        meaning_primary,
        is_dictionary_verified,
        status,
        frequency,
        pos,
        verified_english,
        verified_french,
        variants,
        dictionary_entry_id
      `)
      .eq('id', vocabularyId)
      .single();

    if (vocabError || !vocabulary) {
      return NextResponse.json(
        { error: 'Vocabulary not found' },
        { status: 404 }
      );
    }

    // Fetch trajectories for this vocabulary
    const { data: detections, error: detectError } = await supabase
      .from('nko_detections')
      .select('id')
      .eq('vocabulary_id', vocabularyId)
      .limit(10);

    let trajectories: any[] = [];

    if (detections && detections.length > 0) {
      const detectionIds = detections.map(d => d.id);

      // Fetch trajectories linked to these detections
      const { data: trajData, error: trajError } = await supabase
        .from('nko_trajectories')
        .select(`
          id,
          detection_id,
          total_variants,
          coherence_score,
          created_at,
          nko_trajectory_nodes (
            id,
            world_name,
            nko_variant,
            latin_variant,
            english_translation,
            cultural_notes,
            confidence
          )
        `)
        .in('detection_id', detectionIds)
        .limit(5);

      if (trajData) {
        trajectories = trajData.map(t => ({
          id: t.id,
          detectionId: t.detection_id,
          sourceNko: vocabulary.word,           // word column = N'Ko text
          sourceLatin: vocabulary.latin,         // latin column
          sourceEnglish: vocabulary.meaning_primary,  // meaning_primary column
          nodes: (t.nko_trajectory_nodes || []).map((n: any) => ({
            id: n.id,
            worldName: n.world_name,
            variant: n.nko_variant,
            latinVariant: n.latin_variant,
            translation: n.english_translation,
            culturalNotes: n.cultural_notes,
            confidence: n.confidence,
          })),
          totalVariants: t.total_variants,
          coherenceScore: t.coherence_score,
          createdAt: t.created_at,
        }));
      }
    }

    // Fetch related words from vocabulary_relationships
    let relatedWords: string[] = [];
    const { data: relationships } = await supabase
      .from('vocabulary_relationships')
      .select('target_word, relationship_type')
      .eq('source_vocabulary_id', vocabularyId)
      .limit(20);

    if (relationships) {
      relatedWords = relationships.map(r => r.target_word);
    }

    // Transform response using correct column names
    const response = {
      id: vocabulary.id,
      nkoText: vocabulary.word,                    // word column = N'Ko text
      latinText: vocabulary.latin,                 // latin column
      englishText: vocabulary.meaning_primary,     // meaning_primary column
      isDictionaryVerified: vocabulary.is_dictionary_verified,
      confidence: vocabulary.frequency ? Math.min(vocabulary.frequency / 10, 1) : 0.5,
      wordClass: vocabulary.pos,                   // pos column = part of speech
      status: vocabulary.status,
      verifiedEnglish: vocabulary.verified_english,
      verifiedFrench: vocabulary.verified_french,
      variants: vocabulary.variants,
      trajectories,
      relatedWords,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Vocabulary fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary', details: String(error) },
      { status: 500 }
    );
  }
}

