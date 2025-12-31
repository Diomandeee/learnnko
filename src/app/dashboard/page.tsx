'use client';

import { useState, useEffect } from 'react';
import { VocabularyExpansionStats } from '@/components/learning/VocabularyExpansionStats';
import { TrajectoryVisualization } from '@/components/learning/TrajectoryVisualization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  BookOpen,
  Brain,
  TrendingUp,
  Database,
  Video,
  RefreshCw,
  Loader2,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
} from 'lucide-react';

interface VocabWord {
  id: string;
  nkoText: string;
  latinText: string;
  englishText: string;
  isDictionaryVerified: boolean;
  confidence: number;
}

interface PipelineStatus {
  isRunning: boolean;
  currentChannel: string | null;
  videosProcessed: number;
  videosTotal: number;
  framesExtracted: number;
  detectionsFound: number;
  lastUpdated: string;
}

interface ChannelStats {
  name: string;
  videosTotal: number;
  videosProcessed: number;
  detections: number;
  lastProcessed: string | null;
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VocabWord[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null);
  const [channels, setChannels] = useState<ChannelStats[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch pipeline status periodically
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/pipeline/status');
        if (response.ok) {
          const data = await response.json();
          setPipelineStatus(data.pipeline);
          setChannels(data.channels || []);
        }
      } catch (err) {
        console.error('Failed to fetch pipeline status:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Search vocabulary
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(`/api/learning/vocabulary/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="nko-text text-cyan-400">ߒߞߏ</span>
                <span className="ml-2 text-white/80">Learning Dashboard</span>
              </h1>
              <p className="text-sm text-white/40 mt-1">
                Unified N'Ko vocabulary building and trajectory exploration
              </p>
            </div>

            {pipelineStatus?.isRunning && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <PlayCircle className="h-3 w-3 mr-1.5 animate-pulse" />
                Pipeline Running
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="data-[state=active]:bg-white/10">
              <BookOpen className="h-4 w-4 mr-2" />
              Vocabulary
            </TabsTrigger>
            <TabsTrigger value="trajectories" className="data-[state=active]:bg-white/10">
              <Brain className="h-4 w-4 mr-2" />
              Trajectories
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-white/10">
              <Video className="h-4 w-4 mr-2" />
              Pipeline
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <VocabularyExpansionStats refreshInterval={60000} />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {channels.map(channel => (
                <Card key={channel.name} className="border-white/5 bg-white/[0.02]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{channel.name}</CardTitle>
                    <CardDescription>
                      {channel.videosProcessed}/{channel.videosTotal} videos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={(channel.videosProcessed / channel.videosTotal) * 100} 
                      className="h-2 mb-2"
                    />
                    <div className="flex justify-between text-sm text-white/50">
                      <span>{channel.detections} detections</span>
                      <span>{channel.lastProcessed || 'Not started'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="space-y-6">
            {/* Search */}
            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader>
                <CardTitle>Search Vocabulary</CardTitle>
                <CardDescription>
                  Search by N'Ko text, Latin transliteration, or English translation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      placeholder="Type to search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 bg-white/5 border-white/10"
                    />
                  </div>
                  <Button 
                    onClick={handleSearch} 
                    disabled={searching}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
                  >
                    {searching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <ScrollArea className="h-[300px] mt-4">
                    <div className="space-y-2">
                      {searchResults.map(word => (
                        <button
                          key={word.id}
                          onClick={() => {
                            setSelectedVocab(word.id);
                            setActiveTab('trajectories');
                          }}
                          className={`
                            w-full p-3 rounded-lg text-left transition-all
                            border border-white/5 hover:border-white/20
                            bg-white/[0.02] hover:bg-white/[0.04]
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="nko-text text-lg text-cyan-400">
                                {word.nkoText}
                              </span>
                              <span className="mx-2 text-white/30">•</span>
                              <span className="font-mono text-white/70">
                                {word.latinText}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {word.isDictionaryVerified && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              )}
                              <ChevronRight className="h-4 w-4 text-white/30" />
                            </div>
                          </div>
                          <p className="text-sm text-white/50 mt-1">
                            {word.englishText}
                          </p>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trajectories Tab */}
          <TabsContent value="trajectories" className="space-y-6">
            {selectedVocab ? (
              <TrajectoryVisualization vocabularyId={selectedVocab} />
            ) : (
              <Card className="border-white/5 bg-white/[0.02]">
                <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                  <Brain className="h-12 w-12 text-white/20" />
                  <p className="text-white/40">
                    Select a word from the Vocabulary tab to view its trajectories
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('vocabulary')}
                    className="border-white/10"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search Vocabulary
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-6">
            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Processing Pipeline</CardTitle>
                    <CardDescription>
                      Video extraction and analysis status
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-white/10"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pipelineStatus ? (
                  <div className="space-y-6">
                    {/* Status indicator */}
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-3 h-3 rounded-full 
                        ${pipelineStatus.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}
                      `} />
                      <span className="font-medium">
                        {pipelineStatus.isRunning ? 'Running' : 'Idle'}
                      </span>
                      {pipelineStatus.currentChannel && (
                        <Badge variant="outline" className="border-white/10">
                          {pipelineStatus.currentChannel}
                        </Badge>
                      )}
                    </div>

                    {/* Progress */}
                    {pipelineStatus.isRunning && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/60">Videos</span>
                          <span className="font-mono">
                            {pipelineStatus.videosProcessed}/{pipelineStatus.videosTotal}
                          </span>
                        </div>
                        <Progress 
                          value={(pipelineStatus.videosProcessed / pipelineStatus.videosTotal) * 100}
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <Video className="h-5 w-5 text-cyan-400/60 mb-2" />
                        <div className="text-2xl font-bold">{pipelineStatus.videosProcessed}</div>
                        <div className="text-xs text-white/40">Videos Processed</div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <Database className="h-5 w-5 text-violet-400/60 mb-2" />
                        <div className="text-2xl font-bold">{pipelineStatus.framesExtracted}</div>
                        <div className="text-xs text-white/40">Frames Extracted</div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <BookOpen className="h-5 w-5 text-emerald-400/60 mb-2" />
                        <div className="text-2xl font-bold">{pipelineStatus.detectionsFound}</div>
                        <div className="text-xs text-white/40">N'Ko Detections</div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <Clock className="h-5 w-5 text-amber-400/60 mb-2" />
                        <div className="text-sm font-mono truncate">
                          {pipelineStatus.lastUpdated}
                        </div>
                        <div className="text-xs text-white/40">Last Updated</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Channel details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map(channel => (
                <Card key={channel.name} className="border-white/5 bg-white/[0.02]">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Video className="h-4 w-4 text-cyan-400/60" />
                      {channel.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/50">Progress</span>
                        <span className="font-mono">
                          {channel.videosProcessed}/{channel.videosTotal}
                        </span>
                      </div>
                      <Progress 
                        value={(channel.videosProcessed / channel.videosTotal) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Detections</span>
                        <span className="font-mono">{channel.detections}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
