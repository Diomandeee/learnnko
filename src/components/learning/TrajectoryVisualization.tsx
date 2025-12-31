'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GitBranch, 
  Globe, 
  MessageCircle, 
  BookOpen,
  Crown,
  GraduationCap,
  ChevronRight,
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

// World icons mapping
const WORLD_ICONS: Record<string, typeof Globe> = {
  everyday: MessageCircle,
  formal: Crown,
  storytelling: BookOpen,
  proverbs: GitBranch,
  educational: GraduationCap,
};

const WORLD_COLORS: Record<string, string> = {
  everyday: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  formal: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  storytelling: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  proverbs: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  educational: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

interface TrajectoryNode {
  id: string;
  worldName: string;
  variant: string;
  latinVariant: string;
  translation: string;
  culturalNotes?: string;
  confidence: number;
}

interface Trajectory {
  id: string;
  detectionId: string;
  sourceNko: string;
  sourceLatin: string;
  sourceEnglish: string;
  nodes: TrajectoryNode[];
  totalVariants: number;
  coherenceScore: number;
  createdAt: string;
}

interface VocabularyEntry {
  id: string;
  nkoText: string;
  latinText: string;
  englishText: string;
  isDictionaryVerified: boolean;
  confidence: number;
  trajectories: Trajectory[];
  relatedWords: string[];
}

interface TrajectoryVisualizationProps {
  vocabularyId?: string;
  initialData?: VocabularyEntry;
}

export function TrajectoryVisualization({ 
  vocabularyId, 
  initialData 
}: TrajectoryVisualizationProps) {
  const [vocabulary, setVocabulary] = useState<VocabularyEntry | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorld, setSelectedWorld] = useState<string>('all');

  useEffect(() => {
    if (vocabularyId && !initialData) {
      fetchVocabulary();
    }
  }, [vocabularyId]);

  const fetchVocabulary = async () => {
    if (!vocabularyId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/learning/vocabulary/${vocabularyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vocabulary');
      }
      const data = await response.json();
      setVocabulary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-white/5 bg-white/[0.02]">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400/60" />
        </CardContent>
      </Card>
    );
  }

  if (error || !vocabulary) {
    return (
      <Card className="border-white/5 bg-white/[0.02]">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-rose-400">{error || 'No vocabulary selected'}</p>
          {vocabularyId && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchVocabulary}
              className="border-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Get all unique worlds from trajectories
  const worlds = new Set<string>();
  vocabulary.trajectories.forEach(t => {
    t.nodes.forEach(n => worlds.add(n.worldName));
  });

  // Filter nodes by selected world
  const filteredTrajectories = vocabulary.trajectories.map(t => ({
    ...t,
    nodes: selectedWorld === 'all' 
      ? t.nodes 
      : t.nodes.filter(n => n.worldName === selectedWorld),
  })).filter(t => t.nodes.length > 0);

  return (
    <Card className="border-white/5 bg-white/[0.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              <span className="nko-text text-3xl text-cyan-400">{vocabulary.nkoText}</span>
            </CardTitle>
            <CardDescription className="mt-2 text-lg">
              <span className="font-mono text-white/70">{vocabulary.latinText}</span>
              <span className="mx-2 text-white/30">•</span>
              <span className="text-white/50">{vocabulary.englishText}</span>
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {vocabulary.isDictionaryVerified && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <BookOpen className="h-3 w-3 mr-1" />
                Dictionary Verified
              </Badge>
            )}
            <Badge variant="outline" className="border-white/10">
              {vocabulary.trajectories.length} trajectories
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* World Filter Tabs */}
        <Tabs value={selectedWorld} onValueChange={setSelectedWorld} className="mb-6">
          <TabsList className="bg-white/5">
            <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
              All Worlds
            </TabsTrigger>
            {Array.from(worlds).map(world => {
              const Icon = WORLD_ICONS[world] || Globe;
              return (
                <TabsTrigger 
                  key={world} 
                  value={world}
                  className="data-[state=active]:bg-white/10"
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {world.charAt(0).toUpperCase() + world.slice(1)}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Trajectory Tree */}
        <ScrollArea className="h-[500px]">
          <div className="space-y-6">
            {filteredTrajectories.map((trajectory, tIdx) => (
              <div 
                key={trajectory.id} 
                className="relative pl-4 border-l-2 border-white/10"
              >
                {/* Trajectory header */}
                <div className="flex items-center gap-3 mb-4 -ml-[9px]">
                  <div className="w-4 h-4 rounded-full bg-cyan-500/20 border-2 border-cyan-500/40" />
                  <span className="text-xs text-white/40 font-mono">
                    Trajectory {tIdx + 1} • {trajectory.nodes.length} variants
                  </span>
                  <Badge variant="outline" className="text-xs border-white/10">
                    {(trajectory.coherenceScore * 100).toFixed(0)}% coherence
                  </Badge>
                </div>

                {/* Trajectory nodes (variants) */}
                <div className="grid gap-3 ml-4">
                  {trajectory.nodes.map((node, nIdx) => {
                    const Icon = WORLD_ICONS[node.worldName] || Globe;
                    const colorClass = WORLD_COLORS[node.worldName] || 'bg-white/5 text-white/70';

                    return (
                      <div 
                        key={node.id}
                        className={`
                          relative p-4 rounded-lg border backdrop-blur-sm
                          transition-all hover:border-white/20
                          ${colorClass}
                        `}
                      >
                        {/* Connection line */}
                        {nIdx > 0 && (
                          <div className="absolute -top-3 left-6 w-px h-3 bg-white/10" />
                        )}
                        
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* N'Ko variant */}
                            <div className="nko-text text-xl mb-1 text-white">
                              {node.variant}
                            </div>
                            
                            {/* Latin + translation */}
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <span className="font-mono opacity-80">
                                {node.latinVariant}
                              </span>
                              <ChevronRight className="h-3 w-3 opacity-40" />
                              <span className="opacity-60">{node.translation}</span>
                            </div>

                            {/* Cultural notes */}
                            {node.culturalNotes && (
                              <p className="text-xs opacity-50 italic mt-2">
                                {node.culturalNotes}
                              </p>
                            )}
                          </div>

                          {/* World badge */}
                          <Badge 
                            variant="outline" 
                            className={`${colorClass} shrink-0`}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {node.worldName}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Related words */}
        {vocabulary.relatedWords.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <h4 className="text-sm font-medium text-white/60 mb-3">Related Words</h4>
            <div className="flex flex-wrap gap-2">
              {vocabulary.relatedWords.map(word => (
                <Badge 
                  key={word} 
                  variant="outline" 
                  className="border-white/10 hover:border-white/20 cursor-pointer"
                >
                  {word}
                  <ExternalLink className="h-3 w-3 ml-1.5 opacity-40" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TrajectoryVisualization;

