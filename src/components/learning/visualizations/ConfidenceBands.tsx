'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LearningStats } from '@/lib/learning/types';

interface ConfidenceBandsProps {
    statsHistory: LearningStats[];
}

export function ConfidenceBands({ statsHistory }: ConfidenceBandsProps) {
    if (!statsHistory || statsHistory.length < 2) {
        return <div className="h-40 flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">More data needed...</div>;
    }

    const data = statsHistory.map((stat, i) => ({
        index: i,
        mean: stat.mean,
        lower: stat.confidence.lower,
        upper: stat.confidence.upper
    }));

    return (
        <div className="h-40 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} >
                    <defs>
                        <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="index" hide />
                    <YAxis hide domain={[0, 1]} />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelFormatter={() => ''}
                    />
                    {/* Confidence Interval (Band) */}
                    <Area
                        type="monotone"
                        dataKey="upper"
                        stroke="none"
                        fill="url(#colorConfidence)"
                        baseLine={0}
                    />
                    <Area
                        type="monotone"
                        dataKey="lower"
                        stroke="none"
                        fill="#fff" // Hack to "mask" the area below lower bound if we assume white background, but ideal is range area. 
                    // Recharts Area doesn't support ranges easily without custom shapes or stacked areas.
                    // Better approach: Mean line + area
                    />
                    {/* For true bands we need [lower, upper] range which Area chart doesn't natively do as a single shape easily
                        Simpler V1: Just plot the mean line and maybe an area under it.
                        Or use two Areas, one for upper (green), one for lower (white/bg) to mask it, creating a band. 
                    */}

                    <Area
                        type="monotone"
                        dataKey="mean"
                        stroke="#059669"
                        strokeWidth={2}
                        fill="none"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
