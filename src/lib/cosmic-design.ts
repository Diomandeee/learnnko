/**
 * Cosmic Design System Utilities
 *
 * Centralized constants and utilities for the cosmic design theme:
 * - Amber/Orange/Yellow gradients
 * - Space-950/900/800 dark backgrounds
 * - Glow effects and animations
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ===== COLOR CONSTANTS =====

export const COSMIC_COLORS = {
  // Primary gradient colors
  primary: {
    amber: "amber-400",
    orange: "orange-300",
    yellow: "yellow-400",
  },

  // Background colors
  background: {
    darkest: "space-950",
    dark: "space-900",
    medium: "space-800",
  },

  // Border colors
  border: {
    subtle: "amber-500/20",
    default: "amber-500/30",
    bright: "amber-500/40",
  },

  // Text colors
  text: {
    primary: "gray-100",
    secondary: "gray-300",
    muted: "gray-400",
  }
} as const

// ===== GRADIENT CLASSES =====

export const COSMIC_GRADIENTS = {
  // Text gradients
  text: {
    primary: "bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent",
    secondary: "bg-gradient-to-r from-amber-300 via-orange-200 to-yellow-300 bg-clip-text text-transparent",
  },

  // Background gradients
  background: {
    card: "bg-gradient-to-br from-space-800/80 to-space-900/80",
    page: "bg-gradient-to-br from-space-950 via-space-900 to-space-950",
    header: "bg-gradient-to-r from-space-900/95 via-space-800/95 to-space-900/95",
  },

  // Radial gradients for glows
  radial: {
    amber: "bg-gradient-radial from-amber-500/20 via-orange-500/10 to-transparent",
    orange: "bg-gradient-radial from-orange-500/20 via-yellow-500/10 to-transparent",
  }
} as const

// ===== COMPONENT CLASSES =====

export const COSMIC_COMPONENTS = {
  // Page container
  pageContainer: "min-h-screen relative overflow-hidden bg-space-950",
  pageContent: "relative z-10 container mx-auto px-4 py-12",

  // Cards
  card: {
    base: "backdrop-blur-xl border shadow-lg transition-all duration-300",
    cosmic: "bg-gradient-to-br from-space-800/80 to-space-900/80 border-amber-500/20 shadow-amber-500/10",
    hover: "hover:shadow-lg hover:shadow-amber-500/25 hover:border-amber-500/30",
  },

  // Buttons
  button: {
    primary: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white",
    secondary: "bg-space-800 border border-amber-500/30 hover:bg-space-700 hover:border-amber-500/50 text-amber-300",
    ghost: "hover:bg-amber-500/10 text-amber-400 hover:text-amber-300",
  },

  // Inputs
  input: {
    base: "bg-space-900/70 border-amber-500/30 focus:border-amber-500/60 focus:ring-amber-500/20 text-gray-100 placeholder:text-gray-400",
  },

  // Tabs
  tabs: {
    list: "bg-space-800/80 border-amber-500/20",
    trigger: "data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 hover:bg-amber-500/10",
  }
} as const

// ===== ANIMATION CLASSES =====

export const COSMIC_ANIMATIONS = {
  float: "animate-float",
  pulseGlow: "animate-pulse-glow",
  fadeIn: "animate-fade-in",
  fadeInUp: "animate-fade-in-up",
  slideInFromTop: "animate-in slide-in-from-top duration-300",
  slideInFromBottom: "animate-in slide-in-from-bottom duration-300",
} as const

// ===== EFFECTS =====

export const COSMIC_EFFECTS = {
  backdropBlur: {
    light: "backdrop-blur-sm",
    medium: "backdrop-blur-md",
    heavy: "backdrop-blur-xl",
  },

  glow: {
    amber: "shadow-amber-500/25 hover:shadow-amber-500/40",
    orange: "shadow-orange-500/25 hover:shadow-orange-500/40",
  },

  border: {
    glow: "border-amber-500/20 hover:border-amber-500/40 transition-colors",
  }
} as const

// ===== N'KO CHARACTERS FOR DECORATION =====

export const NKO_CHARACTERS = [
  "ߒ", // N'Ko Letter N
  "ߓ", // N'Ko Letter BA
  "ߕ", // N'Ko Letter TA
  "ߖ", // N'Ko Letter JA
  "ߞ", // N'Ko Letter KA
  "ߟ", // N'Ko Letter LA
  "ߡ", // N'Ko Letter MA
  "ߣ", // N'Ko Letter NA
  "ߤ", // N'Ko Letter NYA
] as const

/**
 * Generate random N'Ko character for decoration
 */
export function getRandomNkoChar(): string {
  return NKO_CHARACTERS[Math.floor(Math.random() * NKO_CHARACTERS.length)]
}

/**
 * Generate random position for floating elements
 */
export function getRandomPosition() {
  return {
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
  }
}

/**
 * Generate random animation delay for staggered effects
 */
export function getRandomDelay(max = 5): string {
  return `${Math.random() * max}s`
}

// ===== PRESET COMBINATIONS =====

/**
 * Pre-built class combinations for common patterns
 */
export const COSMIC_PRESETS = {
  // Page header
  pageHeader: cn(
    "text-center mb-12 space-y-4"
  ),

  pageTitle: cn(
    "text-4xl md:text-5xl font-bold",
    COSMIC_GRADIENTS.text.primary,
    "drop-shadow-2xl"
  ),

  pageDescription: cn(
    "text-lg",
    COSMIC_COLORS.text.secondary,
    "max-w-2xl mx-auto"
  ),

  // Card
  cosmicCard: cn(
    COSMIC_COMPONENTS.card.base,
    COSMIC_COMPONENTS.card.cosmic,
    COSMIC_COMPONENTS.card.hover
  ),

  // Section title
  sectionTitle: cn(
    "text-2xl font-bold",
    COSMIC_GRADIENTS.text.primary
  ),

  // Stat card
  statValue: cn(
    "text-3xl font-bold",
    "text-amber-400"
  ),

  statLabel: cn(
    "text-sm",
    COSMIC_COLORS.text.muted
  ),
} as const

/**
 * Create a cosmic radial gradient background element
 */
export function createRadialGradient(color: 'amber' | 'orange' = 'amber', size: 'sm' | 'md' | 'lg' = 'md') {
  const sizes = {
    sm: 'w-64 h-64',
    md: 'w-96 h-96',
    lg: 'w-[600px] h-[600px]',
  }

  const gradients = {
    amber: 'bg-gradient-radial from-amber-500/20 via-orange-500/10 to-transparent',
    orange: 'bg-gradient-radial from-orange-500/20 via-yellow-500/10 to-transparent',
  }

  return cn(
    sizes[size],
    gradients[color],
    'rounded-full blur-3xl'
  )
}
