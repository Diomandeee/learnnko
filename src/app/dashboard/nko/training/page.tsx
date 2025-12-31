'use client';

import { ExplorationPanel } from '@/components/learning/ExplorationPanel';

export default function TrainingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">N&apos;Ko Training Pipeline</h1>
        <p className="text-muted-foreground">
          Process YouTube videos to extract N&apos;Ko content and generate multi-world training data.
        </p>
      </div>
      
      <ExplorationPanel />
    </div>
  );
}

