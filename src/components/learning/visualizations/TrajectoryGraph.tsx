'use client';

import { TrajectoryNode } from '@/lib/learning/types';
import { useEffect, useRef, useState } from 'react';

interface TrajectoryGraphProps {
    nodes: TrajectoryNode[];
}

export function TrajectoryGraph({ nodes }: TrajectoryGraphProps) {
    // Simple force-directed layout simulation simplified to random/grid for now to avoid D3 dependency issues
    // In a real app with @types/d3, we would use d3-force.
    const [positions, setPositions] = useState<{ id: string, x: number, y: number }[]>([]);

    useEffect(() => {
        // Mock layout: distribute nodes in a circle or grid
        // Since we don't have edges in the mock data, just show nodes
        const newPositions = nodes.map((node, i) => {
            const angle = (i / Math.max(1, nodes.length)) * 2 * Math.PI;
            const radius = 100;
            return {
                id: node.id,
                x: 150 + Math.cos(angle) * radius,
                y: 150 + Math.sin(angle) * radius
            };
        });
        setPositions(newPositions);
    }, [nodes]);

    return (
        <div className="w-full h-[300px] border rounded-lg bg-gray-50 dark:bg-zinc-900/50 flex items-center justify-center overflow-hidden relative">
            {nodes.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground p-4">
                    <p>No trajectory data yet.</p>
                    <div className="flex justify-center gap-2 mt-2">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-75"></span>
                        <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse delay-150"></span>
                    </div>
                </div>
            ) : (
                <svg viewBox="0 0 300 300" className="w-full h-full">
                    {/* Links would go here */}

                    {/* Nodes */}
                    {nodes.map((node, i) => {
                        const pos = positions[i] || { x: 150, y: 150 };
                        return (
                            <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                                <circle
                                    r={12}
                                    fill={node.confidence > 0.8 ? "#10B981" : "#3B82F6"}
                                    className="transition-all duration-500 ease-out"
                                />
                                <text
                                    dy={4}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize={10}
                                    pointerEvents="none"
                                >
                                    {i + 1}
                                </text>

                                {/* Hover info could be added here */}
                            </g>
                        );
                    })}
                </svg>
            )}
        </div>
    );
}
