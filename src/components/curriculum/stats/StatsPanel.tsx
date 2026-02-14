'use client';

/**
 * StatsPanel - Training statistics and budget tracking
 *
 * Displays:
 * - Daily budget gauge
 * - Pass progress bars
 * - Video processing stats
 * - Detection counts
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Video,
  Image as ImageIcon,
  Eye,
  Calendar,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { PipelineStatus, PassNumber } from '@/lib/curriculum/types';
import { PASS_COLORS, PASS_NAMES } from '@/lib/curriculum/types';

interface StatsPanelProps {
  status: PipelineStatus | null;
  isLoading?: boolean;
}

export function StatsPanel({ status, isLoading }: StatsPanelProps) {
  if (isLoading) {
    return (
      <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80 space-y-5">
      {/* Pipeline Status Summary */}
      <PipelineStatusSummary status={status} />

      {/* Budget Gauge */}
      <BudgetGauge
        spent={status?.dailyBudget.spent ?? 0}
        limit={status?.dailyBudget.budgetLimit ?? 1.5}
      />

      {/* Latest Run (with error details if applicable) */}
      <LatestRunSection recentRuns={status?.recentRuns ?? []} />

      {/* Pass Progress */}
      <PassProgressSection passes={status?.passes ?? []} />

      {/* Quick Stats */}
      <QuickStats status={status} />

      {/* Last Updated */}
      {status?.lastUpdated && (
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-amber-500/10">
          Updated {formatRelativeTime(status.lastUpdated)}
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface BudgetGaugeProps {
  spent: number;
  limit: number;
}

function BudgetGauge({ spent, limit }: BudgetGaugeProps) {
  const percentage = Math.min((spent / limit) * 100, 100);
  const remaining = Math.max(limit - spent, 0);

  // Color based on usage
  const getColor = () => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-gray-300">Daily Budget</span>
        </div>
        <span className={`text-sm font-medium ${getColor()}`}>
          ${remaining.toFixed(2)} left
        </span>
      </div>

      {/* Circular gauge */}
      <div className="flex justify-center">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-space-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 3.01} 301`}
              className={getColor()}
              initial={{ strokeDasharray: '0 301' }}
              animate={{ strokeDasharray: `${percentage * 3.01} 301` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">${spent.toFixed(2)}</span>
            <span className="text-xs text-gray-400">of ${limit.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PassProgressSectionProps {
  passes: PipelineStatus['passes'];
}

function PassProgressSection({ passes }: PassProgressSectionProps) {
  if (passes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-gray-300">Pass Progress</span>
      </div>

      <div className="space-y-2.5">
        {passes.map((pass) => {
          const colors = PASS_COLORS[pass.number as PassNumber];
          return (
            <div key={pass.number} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={colors.text}>{pass.name}</span>
                <span className="text-gray-400">
                  {pass.tasksCompleted}/{pass.tasksTotal}
                </span>
              </div>
              <Progress
                value={pass.progress}
                className="h-1.5"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface QuickStatsProps {
  status: PipelineStatus | null;
}

function QuickStats({ status }: QuickStatsProps) {
  const stats = [
    {
      icon: Video,
      label: 'Videos',
      value: status?.progress.completedVideos ?? 0,
      total: status?.progress.totalVideos ?? 0,
      color: 'text-blue-400',
    },
    {
      icon: ImageIcon,
      label: 'Frames',
      value: status?.progress.totalFrames ?? 0,
      color: 'text-purple-400',
    },
    {
      icon: Eye,
      label: 'Detections',
      value: status?.progress.totalDetections ?? 0,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-gray-300">Today's Progress</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 rounded-lg bg-space-900/50 text-center"
            >
              <Icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <div className="text-lg font-semibold text-white">
                {formatNumber(stat.value)}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
              {stat.total !== undefined && stat.total > 0 && (
                <div className="text-xs text-gray-600">/ {stat.total}</div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Pipeline Status Components
// ============================================================================

interface PipelineStatusSummaryProps {
  status: PipelineStatus | null;
}

function PipelineStatusSummary({ status }: PipelineStatusSummaryProps) {
  const health = status?.pipelineHealth;
  if (!health) return null;

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'warning':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'error':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center gap-2 mb-1">
        {getStatusIcon()}
        <span className="text-sm font-medium capitalize">{health.status}</span>
        {health.errorCount > 0 && (
          <span className="text-xs opacity-70">
            ({health.errorCount} failed)
          </span>
        )}
      </div>
      <p className="text-xs opacity-80">{health.message}</p>
    </div>
  );
}

interface LatestRunSectionProps {
  recentRuns: PipelineStatus['recentRuns'];
}

function LatestRunSection({ recentRuns }: LatestRunSectionProps) {
  if (!recentRuns || recentRuns.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-gray-300">Latest Run</span>
        </div>
        <div className="p-3 rounded-lg bg-space-900/50 text-center">
          <p className="text-sm text-gray-500">No runs yet</p>
        </div>
      </div>
    );
  }

  const latestRun = recentRuns[0];
  const isFailed = latestRun.status === 'failed' || latestRun.status === 'completed_with_errors';
  const statusColor = isFailed
    ? 'text-red-400 border-red-500/20'
    : latestRun.status === 'completed'
      ? 'text-emerald-400 border-emerald-500/20'
      : 'text-blue-400 border-blue-500/20';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-gray-300">Latest Run</span>
      </div>

      <div className={`p-3 rounded-lg bg-space-900/50 border ${isFailed ? 'border-red-500/20' : 'border-gray-700/30'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">
            {latestRun.id.slice(0, 12)}...
          </span>
          <span className={`text-xs font-medium capitalize ${statusColor}`}>
            {latestRun.status.replace(/_/g, ' ')}
          </span>
        </div>

        {latestRun.error && (
          <div className="mb-2 p-2 rounded bg-red-900/20 border border-red-500/10">
            <p className="text-xs text-red-400 break-words">{latestRun.error}</p>
          </div>
        )}

        {latestRun.failedVideo && (
          <p className="text-xs text-gray-500">
            Video: <span className="text-gray-400">{latestRun.failedVideo}</span>
          </p>
        )}

        {latestRun.completedAt && (
          <p className="text-xs text-gray-500 mt-1">
            {formatRelativeTime(latestRun.completedAt)}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  if (diffSecs < 60) return 'just now';
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
  return date.toLocaleDateString();
}

export default StatsPanel;
