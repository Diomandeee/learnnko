'use client';

import { TrajectoryWorld } from '@/lib/learning/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NkoTextDisplay } from '../nko/NkoTextDisplay';

interface TrajectorySelectorProps {
    worlds: TrajectoryWorld[];
    onSelect: (path: string[]) => void;
}

export function TrajectorySelector({
    worlds,
    onSelect
}: TrajectorySelectorProps) {
    return (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            <h3 className="font-semibold text-lg text-muted-foreground">Explore Learning Paths</h3>

            {worlds.map((world) => (
                <Card key={world.worldId} className="p-4 border-l-4 hover:bg-accent/5 transition-colors cursor-pointer border-l-primary/50 hover:border-l-primary">
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="capitalize">{world.context.replace('_', ' ')}</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                            {world.variants.length} variants
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {world.variants.map((variant) => (
                            <button
                                key={variant.variantId}
                                onClick={() => onSelect([world.worldId, variant.variantId])}
                                className="p-3 border rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-all group relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/20 to-transparent group-hover:via-primary block" />
                                <NkoTextDisplay
                                    text={variant.nkoText}
                                    size="sm"
                                    className="mb-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1 font-medium">
                                    {variant.differentiator}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${variant.confidence * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono opacity-70">{Math.round(variant.confidence * 100)}%</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>
            ))}
        </div>
    );
}
