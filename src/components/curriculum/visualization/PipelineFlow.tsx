'use client';

/**
 * PipelineFlow - Abstract visualization of the 4-pass training pipeline
 *
 * Shows an animated flow diagram with:
 * - 4 pipeline stages (Extraction, Consolidation, Worlds, Transcription)
 * - Animated particles flowing between stages
 * - Progress indicators for each stage
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  FileText,
  Globe2,
  Mic,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Clock,
  XCircle,
} from 'lucide-react';
import type { PipelinePass, PassNumber } from '@/lib/curriculum/types';
import { PASS_COLORS } from '@/lib/curriculum/types';

interface PipelineFlowProps {
  passes: PipelinePass[];
}

export function PipelineFlow({ passes }: PipelineFlowProps) {
  // Default passes if none provided
  const displayPasses: PipelinePass[] =
    passes.length === 4
      ? passes
      : [
          { number: 1, name: 'Extraction', status: 'pending', tasksCompleted: 0, tasksTotal: 0, currentVideoId: null, progress: 0 },
          { number: 2, name: 'Consolidation', status: 'pending', tasksCompleted: 0, tasksTotal: 0, currentVideoId: null, progress: 0 },
          { number: 3, name: 'Worlds', status: 'pending', tasksCompleted: 0, tasksTotal: 0, currentVideoId: null, progress: 0 },
          { number: 4, name: 'Transcription', status: 'pending', tasksCompleted: 0, tasksTotal: 0, currentVideoId: null, progress: 0 },
        ];

  return (
    <div className="p-6 min-h-[400px]">
      {/* Title */}
      <div className="mb-8 text-center">
        <h2 className="text-lg font-semibold text-amber-300">Training Pipeline</h2>
        <p className="text-sm text-gray-400 mt-1">4-pass N'Ko language processing</p>
      </div>

      {/* Pipeline Flow */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-2">
        {displayPasses.map((pass, index) => (
          <React.Fragment key={pass.number}>
            <PipelineStage pass={pass} />
            {index < 3 && <FlowArrow isActive={pass.status === 'completed'} />}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs">
        <LegendItem icon={<Clock className="w-3 h-3" />} label="Pending" color="gray" />
        <LegendItem icon={<Loader2 className="w-3 h-3 animate-spin" />} label="Processing" color="amber" />
        <LegendItem icon={<CheckCircle2 className="w-3 h-3" />} label="Completed" color="emerald" />
        <LegendItem icon={<XCircle className="w-3 h-3" />} label="Failed" color="red" />
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface PipelineStageProps {
  pass: PipelinePass;
}

function PipelineStage({ pass }: PipelineStageProps) {
  const colors = PASS_COLORS[pass.number as PassNumber];
  const Icon = getPassIcon(pass.number as PassNumber);

  const isProcessing = pass.status === 'processing';
  const isCompleted = pass.status === 'completed';
  const isFailed = pass.status === 'failed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: pass.number * 0.1 }}
      className={`
        relative p-4 rounded-xl border-2 w-full lg:w-40
        ${colors.bg} ${colors.border}
        ${isProcessing ? 'ring-2 ring-amber-500/50 ring-offset-2 ring-offset-space-900' : ''}
        transition-all duration-300
      `}
    >
      {/* Status Badge */}
      <div className="absolute -top-2 -right-2">
        <StatusBadge status={pass.status} />
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-3">
        <motion.div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${isProcessing ? 'animate-pulse' : ''}
            ${colors.bg} border ${colors.border}
          `}
          animate={isProcessing ? { scale: [1, 1.05, 1] } : {}}
          transition={isProcessing ? { duration: 2, repeat: Infinity } : {}}
        >
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </motion.div>
      </div>

      {/* Name */}
      <h3 className={`text-center text-sm font-medium mb-2 ${colors.text}`}>
        {pass.name}
      </h3>

      {/* Progress Bar */}
      <div className="h-1.5 bg-space-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-amber-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${pass.progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Stats */}
      <div className="mt-2 text-center text-xs text-gray-400">
        {pass.tasksTotal > 0 ? (
          <span>
            {pass.tasksCompleted}/{pass.tasksTotal}
          </span>
        ) : (
          <span>No tasks</span>
        )}
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-amber-500"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}

interface FlowArrowProps {
  isActive: boolean;
}

function FlowArrow({ isActive }: FlowArrowProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hidden lg:flex items-center justify-center w-8"
    >
      <motion.div
        animate={
          isActive
            ? {
                x: [0, 4, 0],
                opacity: [0.5, 1, 0.5],
              }
            : {}
        }
        transition={
          isActive
            ? {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : {}
        }
      >
        <ArrowRight
          className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-gray-600'}`}
        />
      </motion.div>
    </motion.div>
  );
}

interface StatusBadgeProps {
  status: PipelinePass['status'];
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<string, { icon: typeof Clock; color: string; animate?: boolean }> = {
    pending: { icon: Clock, color: 'bg-gray-600 text-gray-300' },
    processing: { icon: Loader2, color: 'bg-amber-500 text-white', animate: true },
    completed: { icon: CheckCircle2, color: 'bg-emerald-500 text-white' },
    failed: { icon: XCircle, color: 'bg-red-500 text-white' },
    skipped: { icon: Clock, color: 'bg-gray-500 text-gray-300' },
  };

  const { icon: Icon, color, animate = false } = config[status] || config.pending;

  return (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${color}`}>
      <Icon className={`w-3.5 h-3.5 ${animate ? 'animate-spin' : ''}`} />
    </div>
  );
}

interface LegendItemProps {
  icon: React.ReactNode;
  label: string;
  color: string;
}

function LegendItem({ icon, label, color }: LegendItemProps) {
  const colorClasses: Record<string, string> = {
    gray: 'text-gray-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    red: 'text-red-400',
  };

  return (
    <div className={`flex items-center gap-1.5 ${colorClasses[color] || 'text-gray-400'}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function getPassIcon(passNumber: PassNumber) {
  const icons = {
    1: Video,
    2: FileText,
    3: Globe2,
    4: Mic,
  };
  return icons[passNumber];
}

export default PipelineFlow;
