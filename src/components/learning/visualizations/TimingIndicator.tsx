'use client';

interface TimingIndicatorProps {
    delay: number;
    reason: string;
}

export function TimingIndicator({ delay, reason }: TimingIndicatorProps) {
    const normalizedDelay = Math.min(delay / 10000, 1); // 0-1 scale

    return (
        <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300 ease-out"
                    style={{ width: `${normalizedDelay * 100}%` }}
                />
            </div>
            <span className="text-xs text-muted-foreground animate-pulse">
                {reason === 'novel' && '🆕 Processing new pattern'}
                {reason === 'complex' && '🧩 Analyzing complexity'}
                {reason === 'simple' && '✓ Quick recognition'}
                {reason === 'review' && '🔄 Reinforcing memory'}
                {!['novel', 'complex', 'simple', 'review'].includes(reason) && reason}
            </span>
        </div>
    );
}
