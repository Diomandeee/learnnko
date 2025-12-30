'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';
import { NkoContent } from '@/lib/learning/types';

interface WorldStoryGeneratorProps {
    onGenerate: (context: string) => Promise<void>;
}

export function WorldStoryGenerator({ onGenerate }: WorldStoryGeneratorProps) {
    const [context, setContext] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!context) return;
        setIsGenerating(true);
        try {
            await onGenerate(context);
            setContext('');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm">Generate World Context</h3>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
                Simulate how the AI understands phrases in different scenarios (market, school, formal).
            </p>

            <div className="flex gap-2">
                <Input
                    placeholder="e.g. 'Marketplace negotiation'"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="bg-white dark:bg-black/20"
                />
                <Button onClick={handleGenerate} disabled={!context || isGenerating} size="icon">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightIcon />}
                </Button>
            </div>
        </Card>
    );
}

function ArrowRightIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
