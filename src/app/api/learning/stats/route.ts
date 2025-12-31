import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

interface LearningStats {
  today: DailyStats;
  weekly: DailyStats[];
  queue: QueueStatus;
  vocabulary: VocabularyStats;
}

interface DailyStats {
  date: string;
  wordsDetected: number;
  wordsEnriched: number;
  dictionaryMatches: number;
  aiEnrichments: number;
  queueItemsAdded: number;
  queueItemsCompleted: number;
}

interface QueueStatus {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  bySource: Record<string, number>;
}

interface VocabularyStats {
  total: number;
  verified: number;
  withTranslations: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '7', 10);

  if (!supabase) {
    return NextResponse.json({ 
      error: 'Database not configured',
      today: {
        date: new Date().toISOString().split('T')[0],
        wordsDetected: 0,
        wordsEnriched: 0,
        dictionaryMatches: 0,
        aiEnrichments: 0,
        queueItemsAdded: 0,
        queueItemsCompleted: 0,
      },
      weekly: [],
      queue: { pending: 0, processing: 0, completed: 0, failed: 0, bySource: {} },
      vocabulary: { total: 0, verified: 0, withTranslations: 0 },
    });
  }

  try {
    // Fetch learning stats for the past N days
    const { data: statsData, error: statsError } = await supabase
      .from('learning_stats')
      .select('*')
      .order('stat_date', { ascending: false })
      .limit(days);

    if (statsError) {
      console.warn('Failed to fetch learning stats:', statsError);
    }

    // Fetch queue status
    const { data: queueData, error: queueError } = await supabase
      .from('queue_status')
      .select('*');

    if (queueError) {
      console.warn('Failed to fetch queue status:', queueError);
    }

    // Fetch vocabulary counts
    const { count: totalVocab } = await supabase
      .from('nko_vocabulary')
      .select('*', { count: 'exact', head: true });

    const { count: verifiedVocab } = await supabase
      .from('nko_vocabulary')
      .select('*', { count: 'exact', head: true })
      .eq('is_dictionary_verified', true);

    const { count: withTranslations } = await supabase
      .from('nko_vocabulary')
      .select('*', { count: 'exact', head: true })
      .not('english_text', 'is', null);

    // Process stats data
    const weekly = (statsData || []).map(stat => ({
      date: stat.stat_date,
      wordsDetected: stat.words_detected || 0,
      wordsEnriched: stat.words_enriched || 0,
      dictionaryMatches: stat.dictionary_matches || 0,
      aiEnrichments: stat.ai_enrichments || 0,
      queueItemsAdded: stat.queue_items_added || 0,
      queueItemsCompleted: stat.queue_items_completed || 0,
    }));

    const today = weekly.length > 0 ? weekly[0] : {
      date: new Date().toISOString().split('T')[0],
      wordsDetected: 0,
      wordsEnriched: 0,
      dictionaryMatches: 0,
      aiEnrichments: 0,
      queueItemsAdded: 0,
      queueItemsCompleted: 0,
    };

    // Process queue status
    const queueStatus: QueueStatus = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      bySource: {},
    };

    for (const row of queueData || []) {
      const status = row.status as keyof typeof queueStatus;
      const count = row.count || 0;
      
      if (status in queueStatus && typeof queueStatus[status] === 'number') {
        queueStatus[status] = (queueStatus[status] as number) + count;
      }
      
      // Track by source
      const source = row.source_type || 'unknown';
      queueStatus.bySource[source] = (queueStatus.bySource[source] || 0) + count;
    }

    const response: LearningStats = {
      today,
      weekly,
      queue: queueStatus,
      vocabulary: {
        total: totalVocab || 0,
        verified: verifiedVocab || 0,
        withTranslations: withTranslations || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching learning stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
