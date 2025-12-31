'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  TrendingUp, 
  Clock,
  Sparkles,
  Database,
  RefreshCw
} from 'lucide-react';

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

interface LearningStats {
  today: DailyStats;
  weekly: DailyStats[];
  queue: QueueStatus;
  vocabulary: VocabularyStats;
}

interface VocabularyExpansionStatsProps {
  refreshInterval?: number; // ms, default 60000 (1 minute)
  compact?: boolean;
}

export function VocabularyExpansionStats({ 
  refreshInterval = 60000,
  compact = false 
}: VocabularyExpansionStatsProps) {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/learning/stats?days=7');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <Card className="border-violet-500/20 bg-black/40 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-violet-400" />
          <span className="ml-2 text-slate-400">Loading learning stats...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-red-500/20 bg-black/40 backdrop-blur-sm">
        <CardContent className="py-8 text-center">
          <p className="text-red-400">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const { today, queue, vocabulary, weekly } = stats;

  // Calculate weekly totals
  const weeklyTotal = weekly.reduce((sum, day) => sum + day.wordsEnriched, 0);
  const weeklyAverage = weekly.length > 0 ? weeklyTotal / weekly.length : 0;

  // Calculate vocabulary verification percentage
  const verificationRate = vocabulary.total > 0 
    ? (vocabulary.verified / vocabulary.total) * 100 
    : 0;

  if (compact) {
    return (
      <Card className="border-violet-500/20 bg-black/40 backdrop-blur-sm">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-slate-200">
                  {vocabulary.total.toLocaleString()} words
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-slate-300">
                  +{today.wordsEnriched} today
                </span>
              </div>
              {queue.pending > 0 && (
                <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                  <Clock className="mr-1 h-3 w-3" />
                  {queue.pending} queued
                </Badge>
              )}
            </div>
            <button 
              onClick={fetchStats}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Refresh stats"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vocabulary Size */}
        <Card className="border-violet-500/20 bg-black/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Database className="h-4 w-4 text-violet-400" />
              Total Vocabulary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">
              {vocabulary.total.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {vocabulary.verified.toLocaleString()} dictionary-verified
            </p>
            <Progress 
              value={verificationRate} 
              className="mt-2 h-1" 
            />
          </CardContent>
        </Card>

        {/* Today's Progress */}
        <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Today&apos;s Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">
              +{today.wordsEnriched}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                <BookOpen className="mr-1 h-3 w-3" />
                {today.dictionaryMatches} verified
              </Badge>
              {today.aiEnrichments > 0 && (
                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                  <Sparkles className="mr-1 h-3 w-3" />
                  {today.aiEnrichments} AI
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Queue Status */}
        <Card className="border-amber-500/20 bg-black/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              Expansion Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">
              {queue.pending}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              words waiting for enrichment
            </p>
            {queue.processing > 0 && (
              <Badge variant="outline" className="mt-2 text-xs border-blue-500/30 text-blue-400">
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                {queue.processing} processing
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card className="border-violet-500/20 bg-black/40 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Brain className="h-4 w-4 text-violet-400" />
            Weekly Learning Activity
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {weeklyTotal} words enriched • avg {weeklyAverage.toFixed(1)}/day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-16">
            {weekly.slice(0, 7).reverse().map((day, i) => {
              const maxEnriched = Math.max(...weekly.map(d => d.wordsEnriched), 1);
              const height = (day.wordsEnriched / maxEnriched) * 100;
              
              return (
                <div 
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div 
                    className="w-full rounded-t bg-gradient-to-t from-violet-600/50 to-cyan-500/50 transition-all duration-300 hover:from-violet-500/70 hover:to-cyan-400/70"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${day.date}: ${day.wordsEnriched} words`}
                  />
                  <span className="text-[10px] text-slate-500">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Queue Sources */}
      {Object.keys(queue.bySource).length > 0 && (
        <Card className="border-slate-500/20 bg-black/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Queue by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(queue.bySource).map(([source, count]) => (
                <Badge 
                  key={source} 
                  variant="outline" 
                  className="text-xs border-slate-500/30"
                >
                  {source.replace(/_/g, ' ')}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center">
          <button 
            onClick={fetchStats}
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors inline-flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Updated {lastUpdated.toLocaleTimeString()}
          </button>
        </div>
      )}
    </div>
  );
}

export default VocabularyExpansionStats;

