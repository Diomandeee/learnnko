'use client';

/**
 * BoundingBoxOverlay - SVG overlay for N'Ko text detections
 *
 * Renders animated bounding boxes over detected N'Ko text regions.
 * Boxes animate in with a draw effect and show labels on hover.
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import type { CurriculumDetection, BoundingBox } from '@/lib/curriculum/types';

interface BoundingBoxOverlayProps {
  detections: CurriculumDetection[];
  frameWidth: number;
  frameHeight: number;
  showLabels?: boolean;
}

export function BoundingBoxOverlay({
  detections,
  frameWidth,
  frameHeight,
  showLabels = true,
}: BoundingBoxOverlayProps) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  // Filter detections with valid bounding boxes
  const validDetections = detections.filter(
    (d) => d.boundingBox && isValidBoundingBox(d.boundingBox)
  );

  if (validDetections.length === 0) {
    return null;
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${frameWidth} ${frameHeight}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Gradient for active box */}
        <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {validDetections.map((detection, index) => (
        <DetectionBox
          key={detection.id}
          detection={detection}
          index={index}
          frameWidth={frameWidth}
          frameHeight={frameHeight}
          isHovered={hoveredId === detection.id}
          onHover={(hovered) => setHoveredId(hovered ? detection.id : null)}
          showLabel={showLabels}
        />
      ))}
    </svg>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface DetectionBoxProps {
  detection: CurriculumDetection;
  index: number;
  frameWidth: number;
  frameHeight: number;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  showLabel: boolean;
}

function DetectionBox({
  detection,
  index,
  frameWidth,
  frameHeight,
  isHovered,
  onHover,
  showLabel,
}: DetectionBoxProps) {
  const box = detection.boundingBox!;

  // Convert normalized coordinates to absolute pixels
  const x = box.x * frameWidth;
  const y = box.y * frameHeight;
  const width = box.width * frameWidth;
  const height = box.height * frameHeight;

  // Color based on status
  const statusColors: Record<string, string> = {
    raw: '#F59E0B',
    validated: '#10B981',
    corrected: '#8B5CF6',
    rejected: '#EF4444',
  };

  const color = statusColors[detection.status] || statusColors.raw;

  // Animation variants
  const boxVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.5, delay: index * 0.1 },
        opacity: { duration: 0.2, delay: index * 0.1 },
      },
    },
    hover: {
      strokeWidth: 3,
      filter: 'url(#glow)',
    },
  };

  const labelVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.3 + index * 0.1 },
    },
  };

  return (
    <g
      className="pointer-events-auto cursor-pointer"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Bounding box rectangle */}
      <motion.rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill="transparent"
        stroke={color}
        strokeWidth={isHovered ? 3 : 2}
        strokeDasharray={isHovered ? undefined : '4 2'}
        initial="hidden"
        animate={isHovered ? 'hover' : 'visible'}
        variants={boxVariants}
        transform={box.rotation ? `rotate(${box.rotation} ${x + width / 2} ${y + height / 2})` : undefined}
      />

      {/* Corner markers */}
      <CornerMarkers x={x} y={y} width={width} height={height} color={color} />

      {/* Label */}
      {showLabel && (isHovered || detection.nkoText) && (
        <motion.g
          initial="hidden"
          animate="visible"
          variants={labelVariants}
        >
          {/* Label background */}
          <rect
            x={x}
            y={y - 24}
            width={Math.min(width, Math.max(60, detection.nkoText.length * 12))}
            height={20}
            rx={4}
            fill={color}
            opacity={0.9}
          />

          {/* Label text */}
          <text
            x={x + 6}
            y={y - 10}
            fill="white"
            fontSize={12}
            fontWeight={500}
            className="select-none"
          >
            {truncateText(detection.nkoText, 15)}
          </text>

          {/* Confidence badge */}
          {isHovered && detection.confidence > 0 && (
            <>
              <rect
                x={x + width - 40}
                y={y - 24}
                width={36}
                height={20}
                rx={4}
                fill="rgba(0,0,0,0.7)"
              />
              <text
                x={x + width - 36}
                y={y - 10}
                fill="white"
                fontSize={10}
                className="select-none"
              >
                {Math.round(detection.confidence * 100)}%
              </text>
            </>
          )}
        </motion.g>
      )}

      {/* Hover info tooltip */}
      {isHovered && detection.latinText && (
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <rect
            x={x}
            y={y + height + 8}
            width={Math.max(100, detection.latinText.length * 7)}
            height={24}
            rx={4}
            fill="rgba(0,0,0,0.85)"
          />
          <text
            x={x + 8}
            y={y + height + 24}
            fill="#D1D5DB"
            fontSize={11}
            className="select-none"
          >
            {detection.latinText}
          </text>
        </motion.g>
      )}
    </g>
  );
}

interface CornerMarkersProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

function CornerMarkers({ x, y, width, height, color }: CornerMarkersProps) {
  const size = 8;

  return (
    <g stroke={color} strokeWidth={2} fill="none">
      {/* Top-left */}
      <path d={`M ${x} ${y + size} L ${x} ${y} L ${x + size} ${y}`} />
      {/* Top-right */}
      <path d={`M ${x + width - size} ${y} L ${x + width} ${y} L ${x + width} ${y + size}`} />
      {/* Bottom-left */}
      <path d={`M ${x} ${y + height - size} L ${x} ${y + height} L ${x + size} ${y + height}`} />
      {/* Bottom-right */}
      <path d={`M ${x + width - size} ${y + height} L ${x + width} ${y + height} L ${x + width} ${y + height - size}`} />
    </g>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function isValidBoundingBox(box: BoundingBox): boolean {
  return (
    typeof box.x === 'number' &&
    typeof box.y === 'number' &&
    typeof box.width === 'number' &&
    typeof box.height === 'number' &&
    box.width > 0 &&
    box.height > 0
  );
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

export default BoundingBoxOverlay;
