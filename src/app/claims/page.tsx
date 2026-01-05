/**
 * Claims Reference Page - Comprehensive Learning Journey
 *
 * A multi-section educational experience for understanding N'Ko inscription claims:
 * 1. Journey Introduction - Welcome and overview
 * 2. Walkthrough - Guided step-by-step understanding
 * 3. Live Demo - Interactive claim demonstration
 * 4. Reading Guide - How to interpret inscriptions
 * 5. Technical Reference - Deep dive into the mechanics
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Waves,
  Compass,
  RotateCcw,
  Home,
  Radio,
  HeartPulse,
  Sparkles,
  MapPin,
  Copy,
  Activity,
  Info,
  BookOpen,
  Zap,
  Play,
  Pause,
  ChevronRight,
  Eye,
  Code,
  Lightbulb,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Repeat,
  Navigation,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type ClaimType,
  CLAIM_SIGILS,
  CLAIM_DESCRIPTIONS,
} from '@/lib/inscription/types';

// =====================================================
// SECTION NAVIGATION
// =====================================================

type Section = 'journey' | 'walkthrough' | 'demo' | 'reading' | 'technical';

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'journey', label: 'Start', icon: Play },
  { id: 'walkthrough', label: 'Learn', icon: BookOpen },
  { id: 'demo', label: 'Demo', icon: Eye },
  { id: 'reading', label: 'Read', icon: Target },
  { id: 'technical', label: 'Deep Dive', icon: Code },
];

// =====================================================
// CLAIM TYPE DATA
// =====================================================

interface ClaimTypeDetail {
  type: ClaimType;
  name: string;
  sigil: string;
  emoji: string;
  category: 'variance' | 'spatial' | 'temporal' | 'pattern';
  shortDescription: string;
  longDescription: string;
  bodyMetaphor: string;
  technicalFormula: string;
  examples: string[];
  colorClass: string;
  bgGradient: string;
  icon: React.ElementType;
}

const CLAIM_DETAILS: ClaimTypeDetail[] = [
  {
    type: 'stabilize',
    name: 'Stabilize',
    sigil: CLAIM_SIGILS.stabilize,
    emoji: '🌊➡️🪨',
    category: 'variance',
    shortDescription: 'Movement settling into consistency',
    longDescription: 'The stabilize claim detects when your body\'s movement variance decreases - like water settling into stillness. Your movements are becoming more regular, more predictable, more centered.',
    bodyMetaphor: 'Imagine standing still after spinning - your body finds its center, your breath steadies, your movements become small and controlled.',
    technicalFormula: 'σ(t) - σ(t-Δ) < -θ',
    examples: [
      'Sitting down after walking',
      'Finding your balance in a yoga pose',
      'Settling into a comfortable position',
      'Focus narrowing during concentration',
    ],
    colorClass: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
    icon: TrendingDown,
  },
  {
    type: 'disperse',
    name: 'Disperse',
    sigil: CLAIM_SIGILS.disperse,
    emoji: '🪨➡️🌊',
    category: 'variance',
    shortDescription: 'Movement expanding into exploration',
    longDescription: 'The disperse claim is the opposite of stabilize - your movement variance is increasing. Like ripples spreading from a stone dropped in water, your body is exploring more varied patterns.',
    bodyMetaphor: 'Think of stretching after sitting still for a long time - your body wants to move, to explore, to expand its range.',
    technicalFormula: 'σ(t) - σ(t-Δ) > +θ',
    examples: [
      'Standing up from sitting',
      'Beginning to pace or walk around',
      'Stretching and warming up',
      'Getting animated in conversation',
    ],
    colorClass: 'text-orange-400',
    bgGradient: 'from-orange-500/20 via-orange-600/10 to-transparent',
    icon: TrendingUp,
  },
  {
    type: 'transition',
    name: 'Transition',
    sigil: CLAIM_SIGILS.transition,
    emoji: '🚪',
    category: 'spatial',
    shortDescription: 'Moving between distinct states',
    longDescription: 'A transition marks movement between semantic places - qualitatively different regions in your embodied state space. Unlike gradual changes, transitions are discrete jumps.',
    bodyMetaphor: 'Like walking through a doorway from one room to another - you\'re not just moving, you\'re changing context entirely.',
    technicalFormula: 'place(t) ≠ place(t-1)',
    examples: [
      'Moving from standing to walking',
      'Shifting from work mode to rest',
      'Changing between focused and relaxed',
      'Moving between different activities',
    ],
    colorClass: 'text-blue-400',
    bgGradient: 'from-blue-500/20 via-blue-600/10 to-transparent',
    icon: Navigation,
  },
  {
    type: 'return',
    name: 'Return',
    sigil: CLAIM_SIGILS.return,
    emoji: '🏠',
    category: 'spatial',
    shortDescription: 'Coming back to familiar territory',
    longDescription: 'A return claim fires when you revisit a previously encountered basin - a stable attractor state your body has been in before. It\'s recognition: "I\'ve been here."',
    bodyMetaphor: 'Like finding your favorite spot on the couch again - your body remembers this configuration, this state of being.',
    technicalFormula: 'basin(t) ∈ BasinHistory',
    examples: [
      'Returning to your desk after a break',
      'Resuming a familiar posture',
      'Going back to a practiced movement',
      'Returning to a resting position',
    ],
    colorClass: 'text-violet-400',
    bgGradient: 'from-violet-500/20 via-violet-600/10 to-transparent',
    icon: RotateCcw,
  },
  {
    type: 'dwell',
    name: 'Dwell',
    sigil: CLAIM_SIGILS.dwell,
    emoji: '🏡',
    category: 'temporal',
    shortDescription: 'Sustained stability over time',
    longDescription: 'Dwell claims mark extended periods of low variance - not just momentary stability, but committed stillness. You\'re staying in one place, not just passing through.',
    bodyMetaphor: 'Like sitting down and actually staying seated, not just touching the chair. Your body has chosen this state and is maintaining it.',
    technicalFormula: 'σ < θ_low for t > t_min',
    examples: [
      'Deep focus during work',
      'Meditation or mindfulness',
      'Sustained rest or sleep',
      'Maintaining attention in conversation',
    ],
    colorClass: 'text-teal-400',
    bgGradient: 'from-teal-500/20 via-teal-600/10 to-transparent',
    icon: Home,
  },
  {
    type: 'oscillate',
    name: 'Oscillate',
    sigil: CLAIM_SIGILS.oscillate,
    emoji: '〰️',
    category: 'temporal',
    shortDescription: 'Rhythmic, periodic movement',
    longDescription: 'Oscillate claims detect periodic patterns in your movement variance - your body has found a rhythm, a regular back-and-forth, a wave-like pattern.',
    bodyMetaphor: 'Think of walking, breathing, rocking - any movement with a beat, a cycle, a repeating pattern your body naturally falls into.',
    technicalFormula: 'autocorr(σ) shows periodic peak',
    examples: [
      'Walking at a steady pace',
      'Rhythmic breathing',
      'Rocking while thinking',
      'Repetitive work movements',
    ],
    colorClass: 'text-pink-400',
    bgGradient: 'from-pink-500/20 via-pink-600/10 to-transparent',
    icon: Radio,
  },
  {
    type: 'recover',
    name: 'Recover',
    sigil: CLAIM_SIGILS.recover,
    emoji: '💨➡️😌',
    category: 'variance',
    shortDescription: 'Returning to calm after disruption',
    longDescription: 'Recover claims mark the restoration of equilibrium after a spike - your body\'s resilience in action. After being perturbed, you\'re finding your way back to balance.',
    bodyMetaphor: 'Like catching your breath after being startled, or your heart rate settling after excitement. Your body knows how to return to baseline.',
    technicalFormula: 'σ↓ following recent σ spike',
    examples: [
      'Calming after being startled',
      'Catching breath after exertion',
      'Settling after emotion',
      'Refocusing after interruption',
    ],
    colorClass: 'text-lime-400',
    bgGradient: 'from-lime-500/20 via-lime-600/10 to-transparent',
    icon: HeartPulse,
  },
  {
    type: 'novel',
    name: 'Novel',
    sigil: CLAIM_SIGILS.novel,
    emoji: '✨',
    category: 'pattern',
    shortDescription: 'First encounter with a new state',
    longDescription: 'A novel claim marks discovery - a basin your body has never visited before. This is genuine newness, a movement pattern that doesn\'t match anything in your vocabulary.',
    bodyMetaphor: 'Like finding a new way to hold your body that feels right but unfamiliar. You\'re expanding your repertoire of possible states.',
    technicalFormula: 'basin(t) ∉ BasinLexicon',
    examples: [
      'Learning a new movement',
      'Finding an unusual position',
      'First time doing a task',
      'Discovering a new body state',
    ],
    colorClass: 'text-amber-400',
    bgGradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
    icon: Sparkles,
  },
  {
    type: 'placeShift',
    name: 'Place Shift',
    sigil: CLAIM_SIGILS.placeShift,
    emoji: '🗺️',
    category: 'spatial',
    shortDescription: 'First visit to new territory',
    longDescription: 'Place shift is like novel, but at a higher level - entering a semantic region you\'ve never visited. Not just a new basin, but a new kind of place entirely.',
    bodyMetaphor: 'Like visiting a new city for the first time - everything about the context is unfamiliar, not just one specific location.',
    technicalFormula: 'place(t) ∉ PlaceHistory',
    examples: [
      'Entering a new environment',
      'Starting a new type of activity',
      'First experience of a context',
      'Encountering unfamiliar territory',
    ],
    colorClass: 'text-cyan-400',
    bgGradient: 'from-cyan-500/20 via-cyan-600/10 to-transparent',
    icon: MapPin,
  },
  {
    type: 'echo',
    name: 'Echo',
    sigil: CLAIM_SIGILS.echo,
    emoji: '🔄',
    category: 'pattern',
    shortDescription: 'Pattern repetition or confirmation',
    longDescription: 'Echo claims detect when the current pattern resembles a very recent one - repetition, confirmation, or sustained patterns. Echoes help distinguish isolated events from stable states.',
    bodyMetaphor: 'Like the second step confirming you\'re walking, or the second breath confirming you\'re breathing slowly. Repetition that says "yes, this is what\'s happening."',
    technicalFormula: 'sim(claim_t, claim_{t-k}) > θ',
    examples: [
      'Continuing to stabilize',
      'Multiple transitions in sequence',
      'Repeated oscillation confirming rhythm',
      'Successive dwells showing deep rest',
    ],
    colorClass: 'text-indigo-400',
    bgGradient: 'from-indigo-500/20 via-indigo-600/10 to-transparent',
    icon: Repeat,
  },
];

const CATEGORY_INFO = {
  variance: {
    name: 'Variance Claims',
    description: 'Changes in how much your movement varies',
    claims: ['stabilize', 'disperse', 'recover'],
    color: 'text-emerald-300',
  },
  spatial: {
    name: 'Spatial Claims',
    description: 'Movement through different states and places',
    claims: ['transition', 'return', 'placeShift'],
    color: 'text-blue-300',
  },
  temporal: {
    name: 'Temporal Claims',
    description: 'Time-extended patterns and rhythms',
    claims: ['dwell', 'oscillate'],
    color: 'text-pink-300',
  },
  pattern: {
    name: 'Pattern Claims',
    description: 'Discovery and recognition of movement patterns',
    claims: ['novel', 'echo'],
    color: 'text-amber-300',
  },
};

// =====================================================
// SECTION 1: JOURNEY INTRODUCTION
// =====================================================

function JourneySection({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/30 mb-4">
          <span className="text-4xl font-nko">ߛ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
          Understanding Claims
        </h1>
        <p className="text-gray-300 text-lg max-w-xl mx-auto">
          Your body is always speaking. Learn to read the language of movement.
        </p>
      </div>

      {/* Introduction Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Lightbulb className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-200 mb-1">What are Claims?</h3>
              <p className="text-sm text-gray-300">
                Claims are statements about your embodied state - descriptions of how your body is moving, settling, transitioning, or discovering new patterns.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Activity className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-violet-200 mb-1">How are they detected?</h3>
              <p className="text-sm text-gray-300">
                Motion sensors capture your movement, fusion algorithms analyze the patterns, and claim detectors identify meaningful events in real-time.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* The 10 Claims Preview */}
      <Card className="p-5 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-amber-200 mb-4 text-center">The 10 Fundamental Claims</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {CLAIM_DETAILS.map((claim) => (
            <div
              key={claim.type}
              className="flex flex-col items-center group cursor-default"
              title={claim.name}
            >
              <span
                className={`text-3xl sm:text-4xl transition-transform group-hover:scale-125 ${claim.colorClass}`}
                style={{ fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif" }}
              >
                {claim.sigil}
              </span>
              <span className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {claim.name}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Journey Map */}
      <Card className="p-5 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-amber-200 mb-4">Your Learning Journey</h3>
        <div className="space-y-3">
          {[
            { step: 1, title: 'Learn the Basics', desc: 'Understand each claim type and what it means', icon: BookOpen },
            { step: 2, title: 'See it in Action', desc: 'Interactive demo showing how claims appear', icon: Eye },
            { step: 3, title: 'Learn to Read', desc: 'Decode real inscription text line by line', icon: Target },
            { step: 4, title: 'Go Deep', desc: 'Technical details for the curious mind', icon: Code },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">
                {step}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-200">{title}</span>
                </div>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Start Button */}
      <div className="text-center pt-4">
        <Button
          onClick={onNext}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 text-lg"
        >
          Begin the Journey
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// =====================================================
// SECTION 2: WALKTHROUGH
// =====================================================

function WalkthroughSection({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [activeCategory, setActiveCategory] = React.useState<string>('variance');
  const [expandedClaim, setExpandedClaim] = React.useState<string | null>('stabilize');

  const categoryOrder = ['variance', 'spatial', 'temporal', 'pattern'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
          Step 1 of 4
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-200">
          Understanding Each Claim
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Claims are organized into four categories. Explore each to understand what your body is saying.
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 bg-space-800/50 p-1">
          {categoryOrder.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className={`text-xs sm:text-sm data-[state=active]:${CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO].color}`}
            >
              {CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO].name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {categoryOrder.map((cat) => {
          const category = CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO];
          const claims = CLAIM_DETAILS.filter((c) => c.category === cat);

          return (
            <TabsContent key={cat} value={cat} className="mt-4 space-y-4">
              {/* Category Description */}
              <div className={`text-center p-3 rounded-lg bg-space-800/50 ${category.color}`}>
                <p className="text-sm opacity-80">{category.description}</p>
              </div>

              {/* Claims */}
              <div className="space-y-3">
                {claims.map((claim) => {
                  const isExpanded = expandedClaim === claim.type;
                  const Icon = claim.icon;

                  return (
                    <Card
                      key={claim.type}
                      className={`overflow-hidden border-amber-500/20 bg-gradient-to-br ${claim.bgGradient} transition-all duration-300`}
                    >
                      {/* Header */}
                      <button
                        onClick={() => setExpandedClaim(isExpanded ? null : claim.type)}
                        className="w-full p-4 text-left flex items-center gap-4"
                      >
                        <span
                          className={`text-4xl ${claim.colorClass}`}
                          style={{ fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif" }}
                        >
                          {claim.sigil}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-bold text-lg ${claim.colorClass}`}>{claim.name}</span>
                            <span className="text-lg">{claim.emoji}</span>
                          </div>
                          <p className="text-sm text-gray-300 truncate">{claim.shortDescription}</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-4 border-t border-amber-500/10 pt-4 animate-in slide-in-from-top-2">
                          {/* Body Metaphor */}
                          <div className="p-3 rounded-lg bg-space-800/50 border-l-2 border-amber-500/50">
                            <p className="text-sm text-gray-200 italic">"{claim.bodyMetaphor}"</p>
                          </div>

                          {/* Long Description */}
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {claim.longDescription}
                          </p>

                          {/* Examples */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Examples</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {claim.examples.map((ex, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${claim.colorClass}`} />
                                  <span className="text-gray-300">{ex}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} className="border-amber-500/30 text-amber-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          See Demo
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// =====================================================
// SECTION 3: LIVE DEMO
// =====================================================

function DemoSection({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [demoItems, setDemoItems] = React.useState<ClaimTypeDetail[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Demo sequence
  const demoSequence: ClaimType[] = [
    'stabilize', 'stabilize', 'dwell', 'disperse', 'transition',
    'oscillate', 'oscillate', 'echo', 'recover', 'stabilize',
    'novel', 'return', 'dwell',
  ];

  React.useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= demoSequence.length) {
          setIsPlaying(false);
          return prev;
        }

        const claimType = demoSequence[next];
        const detail = CLAIM_DETAILS.find((c) => c.type === claimType)!;
        setDemoItems((items) => [detail, ...items].slice(0, 10));
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const startDemo = () => {
    setDemoItems([]);
    setCurrentIndex(-1);
    setIsPlaying(true);
    // Add first item
    setTimeout(() => {
      const detail = CLAIM_DETAILS.find((c) => c.type === demoSequence[0])!;
      setDemoItems([detail]);
      setCurrentIndex(0);
    }, 500);
  };

  const currentClaim = currentIndex >= 0 ? CLAIM_DETAILS.find((c) => c.type === demoSequence[currentIndex]) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
          Step 2 of 4
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold text-violet-200">
          Live Demo
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Watch how claims appear in real-time as movement patterns are detected.
        </p>
      </div>

      {/* Demo Display */}
      <Card className="overflow-hidden border-violet-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        {/* Ticker Display */}
        <div
          className="min-h-[100px] flex items-center justify-center p-6 bg-gradient-to-l from-space-900/90 via-space-800/80 to-transparent border-b border-violet-500/10"
          dir="rtl"
        >
          {demoItems.length === 0 ? (
            <p className="text-gray-500 text-sm">Press play to start the demo</p>
          ) : (
            <div className="flex flex-row-reverse flex-wrap items-center gap-3">
              {demoItems.map((item, i) => (
                <span
                  key={`${item.type}-${i}`}
                  className={`text-4xl sm:text-5xl animate-in fade-in slide-in-from-right duration-500 ${item.colorClass}`}
                  style={{
                    fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif",
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  {item.sigil}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Current Claim Info */}
        {currentClaim && (
          <div className="p-4 bg-space-800/50 animate-in fade-in">
            <div className="flex items-center gap-3">
              <span
                className={`text-3xl ${currentClaim.colorClass}`}
                style={{ fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif" }}
              >
                {currentClaim.sigil}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${currentClaim.colorClass}`}>{currentClaim.name}</span>
                  <span>{currentClaim.emoji}</span>
                </div>
                <p className="text-sm text-gray-400">{currentClaim.shortDescription}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-4 flex items-center justify-center gap-4 border-t border-violet-500/10">
          <Button
            onClick={isPlaying ? () => setIsPlaying(false) : startDemo}
            className={isPlaying
              ? 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30'
              : 'bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/30'
            }
            variant="outline"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {demoItems.length > 0 ? 'Restart' : 'Start Demo'}
              </>
            )}
          </Button>
        </div>

        {/* Progress */}
        {demoItems.length > 0 && (
          <div className="px-4 pb-4">
            <Progress value={((currentIndex + 1) / demoSequence.length) * 100} className="h-1" />
            <p className="text-xs text-gray-500 text-center mt-1">
              {currentIndex + 1} of {demoSequence.length} events
            </p>
          </div>
        )}
      </Card>

      {/* Demo Explanation */}
      <Card className="p-4 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-amber-200 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          What you're seeing
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>This demo simulates a typical movement session:</p>
          <ol className="list-decimal pl-5 space-y-1 text-gray-400">
            <li><span className="text-emerald-400">Stabilize</span> - Person settles into position</li>
            <li><span className="text-teal-400">Dwell</span> - They remain still for a while</li>
            <li><span className="text-orange-400">Disperse</span> - Movement begins</li>
            <li><span className="text-blue-400">Transition</span> - They change states</li>
            <li><span className="text-pink-400">Oscillate</span> - Walking rhythm detected</li>
            <li><span className="text-indigo-400">Echo</span> - Pattern continues</li>
            <li><span className="text-lime-400">Recover</span> - Settling back down</li>
            <li><span className="text-amber-400">Novel</span> - New movement discovered!</li>
            <li><span className="text-violet-400">Return</span> - Back to familiar territory</li>
          </ol>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} className="border-amber-500/30 text-amber-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          Learn to Read
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// =====================================================
// SECTION 4: READING GUIDE
// =====================================================

function ReadingSection({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [activeExample, setActiveExample] = React.useState(0);

  const examples = [
    {
      text: 'ߛ ⟦100.0–200.0⟧ : z(σ) ↓ ; home ; c=0.85',
      parts: [
        { value: 'ߛ', label: 'Sigil', desc: 'Stabilize - variance decreasing', color: 'text-emerald-400' },
        { value: '⟦100.0–200.0⟧', label: 'Time Window', desc: 'Event occurred from 100ms to 200ms', color: 'text-blue-300' },
        { value: 'z(σ) ↓', label: 'Technical', desc: 'Z-sigma is decreasing', color: 'text-gray-400' },
        { value: 'home', label: 'Place', desc: 'Semantic location "home"', color: 'text-violet-400' },
        { value: 'c=0.85', label: 'Confidence', desc: '85% detection confidence', color: 'text-amber-400' },
      ],
    },
    {
      text: 'ߣ ⟦500.0⟧ : basin=7a3f ; discovery ; c=0.92',
      parts: [
        { value: 'ߣ', label: 'Sigil', desc: 'Novel - new basin discovered', color: 'text-amber-400' },
        { value: '⟦500.0⟧', label: 'Timestamp', desc: 'Instant event at 500ms', color: 'text-blue-300' },
        { value: 'basin=7a3f', label: 'Basin ID', desc: 'Unique identifier for this state', color: 'text-cyan-400' },
        { value: 'discovery', label: 'Event Type', desc: 'First-time encounter', color: 'text-violet-400' },
        { value: 'c=0.92', label: 'Confidence', desc: '92% detection confidence', color: 'text-amber-400' },
      ],
    },
    {
      text: 'ߚ ⟦300.0–800.0⟧ : period=250ms ; walking ; c=0.78',
      parts: [
        { value: 'ߚ', label: 'Sigil', desc: 'Oscillate - rhythmic pattern', color: 'text-pink-400' },
        { value: '⟦300.0–800.0⟧', label: 'Time Window', desc: '500ms of oscillation', color: 'text-blue-300' },
        { value: 'period=250ms', label: 'Period', desc: 'Cycle repeats every 250ms', color: 'text-gray-400' },
        { value: 'walking', label: 'Pattern', desc: 'Detected as walking rhythm', color: 'text-violet-400' },
        { value: 'c=0.78', label: 'Confidence', desc: '78% detection confidence', color: 'text-amber-400' },
      ],
    },
  ];

  const currentExample = examples[activeExample];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
          Step 3 of 4
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold text-cyan-200">
          Reading Inscriptions
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Learn to decode inscription text and understand what each part means.
        </p>
      </div>

      {/* Example Selector */}
      <div className="flex justify-center gap-2">
        {examples.map((_, i) => (
          <Button
            key={i}
            variant={activeExample === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveExample(i)}
            className={activeExample === i
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              : 'border-gray-600 text-gray-400'
            }
          >
            Example {i + 1}
          </Button>
        ))}
      </div>

      {/* Inscription Display */}
      <Card className="overflow-hidden border-cyan-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <div className="p-6 text-center" dir="rtl" lang="nqo">
          <p
            className="text-xl sm:text-2xl text-gray-200 font-mono break-all"
            style={{ fontFamily: "'Noto Sans NKo', 'Ebrima', monospace" }}
          >
            {currentExample.text}
          </p>
        </div>

        <div className="border-t border-cyan-500/10 p-4">
          <h4 className="text-sm font-semibold text-cyan-200 mb-4">Breaking it down:</h4>
          <div className="space-y-3">
            {currentExample.parts.map((part, i) => (
              <div key={i} className="flex items-start gap-3">
                <code className={`px-2 py-1 rounded bg-space-800/50 text-sm font-mono ${part.color}`}>
                  {part.value}
                </code>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-200">{part.label}</span>
                  <p className="text-xs text-gray-400">{part.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Confidence Guide */}
      <Card className="p-4 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-amber-200 mb-3">Confidence Levels</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-red-400 font-bold">0.0 - 0.5</div>
            <div className="text-xs text-gray-400 mt-1">Uncertain</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-yellow-400 font-bold">0.5 - 0.8</div>
            <div className="text-xs text-gray-400 mt-1">Probable</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-green-400 font-bold">0.8 - 1.0</div>
            <div className="text-xs text-gray-400 mt-1">Confident</div>
          </div>
        </div>
      </Card>

      {/* Reading Tips */}
      <Card className="p-4 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-amber-200 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Pattern Reading Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">•</span>
            <span><strong className="text-emerald-400">Stabilize → Dwell</strong> sequences show settling into rest</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400">•</span>
            <span><strong className="text-orange-400">Disperse → Transition</strong> shows exploration leading to change</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400">•</span>
            <span><strong className="text-indigo-400">Echo</strong> after any claim confirms the pattern is sustained</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-400">•</span>
            <span><strong className="text-pink-400">Oscillate</strong> patterns reveal your natural movement rhythms</span>
          </li>
        </ul>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} className="border-amber-500/30 text-amber-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          Technical Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// =====================================================
// SECTION 5: TECHNICAL DEEP DIVE
// =====================================================

function TechnicalSection({ onPrev }: { onPrev: () => void }) {
  const [selectedClaim, setSelectedClaim] = React.useState<ClaimType>('stabilize');

  const claim = CLAIM_DETAILS.find((c) => c.type === selectedClaim)!;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          Step 4 of 4
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-200">
          Technical Reference
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          For the curious: detection formulas, categories, and system architecture.
        </p>
      </div>

      {/* Quick Select */}
      <div className="flex flex-wrap justify-center gap-2">
        {CLAIM_DETAILS.map((c) => (
          <button
            key={c.type}
            onClick={() => setSelectedClaim(c.type)}
            className={`p-2 rounded-lg transition-all ${
              selectedClaim === c.type
                ? 'bg-purple-500/20 border border-purple-500/50 scale-110'
                : 'bg-space-800/50 hover:bg-space-700/50'
            }`}
            title={c.name}
          >
            <span
              className={`text-2xl ${c.colorClass}`}
              style={{ fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif" }}
            >
              {c.sigil}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Claim Technical Details */}
      <Card className="overflow-hidden border-purple-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <div className={`p-6 bg-gradient-to-r ${claim.bgGradient}`}>
          <div className="flex items-center gap-4">
            <span
              className={`text-5xl ${claim.colorClass}`}
              style={{ fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif" }}
            >
              {claim.sigil}
            </span>
            <div>
              <h3 className={`text-2xl font-bold ${claim.colorClass}`}>{claim.name}</h3>
              <Badge variant="outline" className="mt-1 capitalize">
                {claim.category}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Formula */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Detection Formula</h4>
            <code className="block p-3 rounded-lg bg-space-900/50 text-purple-300 font-mono text-sm">
              {claim.technicalFormula}
            </code>
          </div>

          {/* Index */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1">Claim Index</h4>
              <p className="text-2xl font-bold text-amber-400">{CLAIM_DETAILS.indexOf(claim)}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1">Unicode</h4>
              <p className="text-lg font-mono text-gray-300">U+{claim.sigil.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Technical Description</h4>
            <p className="text-sm text-gray-300">{claim.longDescription}</p>
          </div>
        </div>
      </Card>

      {/* System Overview */}
      <Card className="p-4 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-amber-200 mb-4">System Architecture</h3>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Sensor Input', value: 'Motion sensors @ 60Hz', icon: Activity },
            { label: 'Fusion Loop', value: 'Kalman filter @ 60Hz', icon: Zap },
            { label: 'Claim Detection', value: 'Every 10 frames (6Hz)', icon: Target },
            { label: 'WebSocket Stream', value: 'Real-time inscription events', icon: Radio },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between p-2 rounded-lg bg-space-800/50">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">{label}</span>
              </div>
              <code className="text-xs text-amber-300 font-mono">{value}</code>
            </div>
          ))}
        </div>
      </Card>

      {/* Category Reference */}
      <Card className="p-4 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-amber-200 mb-4">Category Reference</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(CATEGORY_INFO).map(([key, cat]) => (
            <div key={key} className="p-3 rounded-lg bg-space-800/50">
              <h4 className={`font-medium ${cat.color}`}>{cat.name}</h4>
              <p className="text-xs text-gray-400 mb-2">{cat.description}</p>
              <div className="flex gap-2">
                {cat.claims.map((c) => {
                  const detail = CLAIM_DETAILS.find((d) => d.type === c)!;
                  return (
                    <span
                      key={c}
                      className={`text-xl ${detail.colorClass}`}
                      style={{ fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif" }}
                      title={detail.name}
                    >
                      {detail.sigil}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Full Technical Docs Link */}
      <Card className="p-4 border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-space-900/80">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-purple-200">Want More Technical Details?</h3>
            <p className="text-sm text-gray-400">
              Deep dive into DELL theory, Graph Kernel design, and full API reference.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/nip">
              <Button className="bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                NIP Docs
              </Button>
            </Link>
            <Link href="/technical">
              <Button className="bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30" variant="outline">
                <Code className="w-4 h-4 mr-2" />
                Technical Docs
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} className="border-amber-500/30 text-amber-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Link href="/">
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <Activity className="w-4 h-4 mr-2" />
            View Live Inscriptions
          </Button>
        </Link>
      </div>
    </div>
  );
}

// =====================================================
// MAIN PAGE COMPONENT
// =====================================================

export default function ClaimsPage() {
  const [currentSection, setCurrentSection] = React.useState<Section>('journey');

  const sectionIndex = SECTIONS.findIndex((s) => s.id === currentSection);

  const goToSection = (section: Section) => {
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = () => {
    const nextIndex = Math.min(sectionIndex + 1, SECTIONS.length - 1);
    goToSection(SECTIONS[nextIndex].id);
  };

  const goPrev = () => {
    const prevIndex = Math.max(sectionIndex - 1, 0);
    goToSection(SECTIONS[prevIndex].id);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-space-950">
      {/* Cosmic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-space-950 via-space-900 to-space-950" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.08),transparent_40%)]" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.06),transparent_40%)]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/15 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Floating Sigils */}
        {CLAIM_DETAILS.slice(0, 5).map((claim, i) => (
          <div
            key={claim.type}
            className={`absolute ${claim.colorClass} opacity-10 text-4xl animate-float font-nko`}
            style={{
              top: `${15 + i * 18}%`,
              left: `${10 + (i % 2) * 75}%`,
              animationDelay: `${i * 0.5}s`,
              fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif",
            }}
          >
            {claim.sigil}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-6 max-w-5xl">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Inscriptions</span>
          </Link>

          {/* Progress Dots */}
          <div className="flex items-center gap-1">
            {SECTIONS.map((section, i) => (
              <button
                key={section.id}
                onClick={() => goToSection(section.id)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === sectionIndex
                    ? 'bg-amber-400 w-6'
                    : i < sectionIndex
                    ? 'bg-amber-400/50'
                    : 'bg-gray-600'
                }`}
                title={section.label}
              />
            ))}
          </div>
        </div>

        {/* Section Content */}
        {currentSection === 'journey' && <JourneySection onNext={goNext} />}
        {currentSection === 'walkthrough' && <WalkthroughSection onNext={goNext} onPrev={goPrev} />}
        {currentSection === 'demo' && <DemoSection onNext={goNext} onPrev={goPrev} />}
        {currentSection === 'reading' && <ReadingSection onNext={goNext} onPrev={goPrev} />}
        {currentSection === 'technical' && <TechnicalSection onPrev={goPrev} />}

        {/* Bottom Section Navigation */}
        <div className="mt-8 pt-6 border-t border-amber-500/10">
          <div className="flex justify-center">
            <div className="inline-flex bg-space-800/50 rounded-lg p-1">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === currentSection;
                return (
                  <button
                    key={section.id}
                    onClick={() => goToSection(section.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'text-gray-400 hover:text-amber-300 hover:bg-space-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
