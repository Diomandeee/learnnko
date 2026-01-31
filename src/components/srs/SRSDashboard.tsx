'use client';

import React, { useEffect, useState } from 'react';
import { useSRS } from '@/hooks/useSRS';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  GraduationCap,
  Play,
  RefreshCw,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';

interface SRSDashboardProps {
  onStartReview?: () => void;
}

export function SRSDashboard({ onStartReview }: SRSDashboardProps) {
  const { stats, loading, error, fetchStats, fetchQueue } = useSRS();
  const [dueCount, setDueCount] = useState(0);
  
  useEffect(() => {
    async function loadData() {
      try {
        await fetchStats({ history: true, historyDays: 7 });
        const queueData = await fetchQueue({ limit: 1 });
        setDueCount(queueData?.queue?.due || 0);
      } catch (err) {
        console.error('Failed to load SRS data:', err);
      }
    }
    loadData();
  }, [fetchStats, fetchQueue]);
  
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => fetchStats()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const totalDue = (stats?.dueCounts?.today || 0) + (stats?.cardCounts?.new || 0);
  const masteryPercent = stats?.cardCounts?.total 
    ? Math.round((stats.cardCounts.mastered / stats.cardCounts.total) * 100)
    : 0;
  
  return (
    <div className="space-y-6">
      {/* Call to Action */}
      {totalDue > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">
                  {totalDue} cards ready for review
                </h3>
                <p className="text-muted-foreground">
                  {stats?.dueCounts?.overdue ? `${stats.dueCounts.overdue} overdue • ` : ''}
                  {stats?.cardCounts?.new || 0} new cards to learn
                </p>
              </div>
              <Button size="lg" onClick={onStartReview} className="gap-2">
                <Play className="h-5 w-5" />
                Start Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.streak?.current || 0}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
            {stats?.streak?.longest ? (
              <p className="text-xs text-muted-foreground mt-2">
                Best: {stats.streak.longest} days
              </p>
            ) : null}
          </CardContent>
        </Card>
        
        {/* Retention Rate */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(stats?.performance?.retentionRate || 0)}%
                </p>
                <p className="text-xs text-muted-foreground">Retention</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Reviews Today */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.activity?.reviewsToday || 0}</p>
                <p className="text-xs text-muted-foreground">Reviewed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Cards */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.cardCounts?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Cards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Card Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Card Progress
          </CardTitle>
          <CardDescription>
            Your cards by learning stage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mastery Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Mastery</span>
              <span className="font-medium">{masteryPercent}%</span>
            </div>
            <Progress value={masteryPercent} className="h-3" />
          </div>
          
          {/* Status breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4">
            <StatusCard
              label="New"
              count={stats?.cardCounts?.new || 0}
              icon={<Zap className="h-4 w-4" />}
              color="blue"
            />
            <StatusCard
              label="Learning"
              count={stats?.cardCounts?.learning || 0}
              icon={<BookOpen className="h-4 w-4" />}
              color="yellow"
            />
            <StatusCard
              label="Review"
              count={stats?.cardCounts?.review || 0}
              icon={<RefreshCw className="h-4 w-4" />}
              color="orange"
            />
            <StatusCard
              label="Mastered"
              count={stats?.cardCounts?.mastered || 0}
              icon={<Trophy className="h-4 w-4" />}
              color="green"
            />
            <StatusCard
              label="Due Today"
              count={stats?.dueCounts?.today || 0}
              icon={<Calendar className="h-4 w-4" />}
              color="red"
              highlight
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">This Week</span>
                <span className="font-medium">{stats?.activity?.reviewsThisWeek || 0} reviews</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-medium">{stats?.activity?.reviewsThisMonth || 0} reviews</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Reviews</span>
                <span className="font-medium">{stats?.activity?.totalReviews || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Study Time</span>
                <span className="font-medium">
                  {formatStudyTime(stats?.activity?.totalStudyTimeMinutes || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Today</span>
                <span className="font-medium text-primary">{stats?.dueCounts?.today || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due This Week</span>
                <span className="font-medium">{stats?.dueCounts?.thisWeek || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overdue</span>
                <span className={`font-medium ${(stats?.dueCounts?.overdue || 0) > 0 ? 'text-red-500' : ''}`}>
                  {stats?.dueCounts?.overdue || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average EF</span>
                <span className="font-medium">
                  {(stats?.performance?.averageEaseFactor || 2.5).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Empty state */}
      {(!stats?.cardCounts?.total || stats.cardCounts.total === 0) && (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No cards yet</h3>
            <p className="text-muted-foreground mb-4">
              Add vocabulary or complete lessons to start building your review deck.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface StatusCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'orange' | 'green' | 'red';
  highlight?: boolean;
}

function StatusCard({ label, count, icon, color, highlight }: StatusCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };
  
  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color]} ${highlight ? 'ring-2 ring-offset-2 ring-primary' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  );
}

function formatStudyTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default SRSDashboard;
