'use client';

import { LearningStats, LearningPhase } from '@/lib/learning/types';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MoveUp, Target } from 'lucide-react';

interface LearningProgressRingProps {
    stats: LearningStats;
    phase: LearningPhase;
    isActive: boolean;
}

export function LearningProgressRing({ stats, phase, isActive }: LearningProgressRingProps) {
    const data = [
        {
            name: 'Confidence',
            value: stats.mean * 100,
            fill: isActive ? '#10B981' : '#6B7280',
        }
    ];

    return (
        <div className="flex items-center justify-between">
            <div className="h-[140px] w-[140px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="80%"
                        barSize={10}
                        data={data}
                        startAngle={90}
                        endAngle={-270}
                    >
                        <PolarAngleAxis
                            type="number"
                            domain={[0, 100]}
                            angleAxisId={0}
                            tick={false}
                        />
                        <RadialBar
                            background
                            dataKey="value"
                            cornerRadius={30}
                            fill="#10B981"
                        />
                    </RadialBarChart>
                </ResponsiveContainer>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-mono">
                        {Math.round(stats.mean * 100)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Accuracy
                    </span>
                </div>
            </div>

            <div className="flex-1 pl-6 space-y-4">
                <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Learning Samples
                    </div>
                    <div className="text-2xl font-bold">{stats.count.toLocaleString()}</div>
                </div>

                <div className={cn(
                    "px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2",
                    isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                )}>
                    {isActive ? <span className="animate-pulse w-2 h-2 rounded-full bg-green-500" /> : <span className="w-2 h-2 rounded-full bg-gray-400" />}
                    <span className="capitalize">{phase} Phase</span>
                </div>
            </div>
        </div>
    );
}
