'use client';

import { FrameData } from '@/lib/learning/types';
import { Card, CardContent } from '@/components/ui/card';
import { TimingIndicator } from '../visualizations/TimingIndicator';
import { NkoTextDisplay } from '../nko/NkoTextDisplay';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';

interface AdaptiveFrameDisplayProps {
    frame: FrameData | null;
    onUserCorrection: (frame: FrameData) => void;
}

export function AdaptiveFrameDisplay({ frame, onUserCorrection }: AdaptiveFrameDisplayProps) {
    if (!frame) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                <p>Waiting for stream data...</p>
                <span className="text-sm opacity-50">Connect the Analyzer to start learning</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Current Focus
                    </h3>
                    <div className="text-xs font-mono text-muted-foreground">
                        ID: {frame.frameId.slice(0, 8)}
                    </div>
                </div>

                {frame.adaptiveTiming && (
                    <TimingIndicator
                        delay={frame.adaptiveTiming.suggestedDelay}
                        reason={frame.adaptiveTiming.reason}
                    />
                )}
            </div>

            <div className="py-8 text-center bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                <NkoTextDisplay
                    text={frame.content.nkoText}
                    size="xl"
                    showBreakdown={false}
                    className="mb-4"
                />

                <div className="space-y-2 max-w-md mx-auto">
                    <p className="text-lg font-medium">{frame.content.latinText}</p>
                    <p className="text-muted-foreground italic">&ldquo;{frame.content.translation}&rdquo;</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <div className="h-2 w-24 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${(frame.confidence || 0) * 100}%` }}
                        />
                    </div>
                    <span className="text-xs font-mono">{Math.round((frame.confidence || 0) * 100)}%</span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => onUserCorrection(frame)}
                >
                    <Edit2 className="w-3 h-3 mr-2" />
                    Suggest Correction
                </Button>
            </div>
        </div>
    );
}
