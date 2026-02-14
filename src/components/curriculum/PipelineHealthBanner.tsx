'use client';

/**
 * PipelineHealthBanner - Displays pipeline health status prominently
 *
 * Shows health status based on pipeline state:
 * - healthy (green): Pipeline running or completed successfully
 * - idle (gray): No active processing
 * - warning (amber): Some runs failed
 * - error (red): All runs failed or pipeline stopped
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PipelineHealth, RecentRun } from '@/lib/curriculum/types';

interface PipelineHealthBannerProps {
  health: PipelineHealth | null;
  recentRuns: RecentRun[];
  onRetry?: () => void;
}

export function PipelineHealthBanner({
  health,
  recentRuns,
  onRetry,
}: PipelineHealthBannerProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!health) return null;

  const statusConfig = getStatusConfig(health.status);
  const StatusIcon = statusConfig.icon;

  // Auto-expand if there are errors
  const hasErrors = health.status === 'error' || health.status === 'warning';
  const failedRuns = recentRuns.filter(
    (r) => r.status === 'failed' || r.status === 'completed_with_errors'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`border ${statusConfig.borderColor} ${statusConfig.bgColor} overflow-hidden`}
      >
        {/* Main Banner */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg ${statusConfig.iconBg} flex items-center justify-center`}
            >
              <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${statusConfig.textColor}`}>
                  {statusConfig.title}
                </span>
                {health.errorCount > 0 && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${statusConfig.badgeClass}`}
                  >
                    {health.errorCount} failed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400">{health.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRetry && hasErrors && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className={`${statusConfig.buttonClass}`}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
            {failedRuns.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-300"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    View Details
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Expandable Error Details */}
        <AnimatePresence>
          {isExpanded && failedRuns.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-gray-700/50">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Recent Failed Runs
                </h4>
                <div className="space-y-2">
                  {failedRuns.slice(0, 3).map((run) => (
                    <RunErrorCard key={run.id} run={run} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

interface RunErrorCardProps {
  run: RecentRun;
}

function RunErrorCard({ run }: RunErrorCardProps) {
  const timeAgo = run.completedAt
    ? formatTimeAgo(run.completedAt)
    : run.startedAt
      ? formatTimeAgo(run.startedAt)
      : 'Unknown';

  return (
    <div className="p-3 rounded-lg bg-space-900/50 border border-gray-700/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-300">
              Run {run.id.slice(0, 8)}
            </span>
            <Badge
              variant="outline"
              className={
                run.status === 'failed'
                  ? 'border-red-500/30 text-red-400 text-xs'
                  : 'border-amber-500/30 text-amber-400 text-xs'
              }
            >
              {run.status === 'completed_with_errors' ? 'Partial' : 'Failed'}
            </Badge>
          </div>

          {run.error && (
            <p className="text-sm text-red-400/80 truncate">{run.error}</p>
          )}

          {run.failedVideo && (
            <p className="text-xs text-gray-500 mt-1">
              Video: {run.failedVideo}
            </p>
          )}
        </div>

        <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Configuration & Utilities
// ============================================================================

function getStatusConfig(status: PipelineHealth['status']) {
  switch (status) {
    case 'healthy':
      return {
        icon: CheckCircle,
        title: 'Pipeline Healthy',
        borderColor: 'border-emerald-500/30',
        bgColor: 'bg-emerald-900/10',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        textColor: 'text-emerald-300',
        badgeClass: 'border-emerald-500/30 text-emerald-400',
        buttonClass: 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10',
      };
    case 'idle':
      return {
        icon: Clock,
        title: 'Pipeline Idle',
        borderColor: 'border-gray-500/30',
        bgColor: 'bg-gray-900/10',
        iconBg: 'bg-gray-500/20',
        iconColor: 'text-gray-400',
        textColor: 'text-gray-300',
        badgeClass: 'border-gray-500/30 text-gray-400',
        buttonClass: 'border-gray-500/30 text-gray-400 hover:bg-gray-500/10',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        title: 'Pipeline Warning',
        borderColor: 'border-amber-500/30',
        bgColor: 'bg-amber-900/10',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
        textColor: 'text-amber-300',
        badgeClass: 'border-amber-500/30 text-amber-400',
        buttonClass: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10',
      };
    case 'error':
      return {
        icon: XCircle,
        title: 'Pipeline Error',
        borderColor: 'border-red-500/30',
        bgColor: 'bg-red-900/10',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
        textColor: 'text-red-300',
        badgeClass: 'border-red-500/30 text-red-400',
        buttonClass: 'border-red-500/30 text-red-400 hover:bg-red-500/10',
      };
  }
}

function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  if (diffSecs < 60) return 'just now';
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
  return date.toLocaleDateString();
}

export default PipelineHealthBanner;
