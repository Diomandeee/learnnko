/**
 * Technical Documentation Page
 *
 * Deep dive into the N'Ko Inscription System architecture:
 * - DELL (Dual-Equilibrium Latent Learning)
 * - Graph Kernel (Deterministic Context Slicing)
 * - Inscription Pipeline
 * - Basin Lifecycle
 * - Lexicon Versioning
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Code,
  Database,
  GitBranch,
  Layers,
  Activity,
  Cpu,
  Network,
  BookOpen,
  Zap,
  Timer,
  Hash,
  Shield,
  Box,
  Terminal,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Brain,
  Workflow,
  FileCode,
  FileJson,
  Fingerprint,
  Clock,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Sparkles,
  Radio,
  Home,
  Navigation,
  MapPin,
  Repeat,
  HeartPulse,
  Target,
  CircleDot,
  RefreshCcw,
  Merge,
  Split,
  Archive,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CLAIM_SIGILS, type ClaimType } from '@/lib/inscription/types';
import { motion, AnimatePresence } from 'framer-motion';

// =====================================================
// CODE BLOCK COMPONENT
// =====================================================

function CodeBlock({
  code,
  language = 'rust',
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-amber-500/20 bg-space-950">
      {title && (
        <div className="px-4 py-2 bg-space-900/80 border-b border-amber-500/10 flex items-center justify-between">
          <span className="text-xs font-mono text-amber-300">{title}</span>
          <Badge variant="outline" className="text-[10px] text-gray-500">
            {language}
          </Badge>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 p-2 rounded-md bg-space-800/80 text-gray-400 hover:text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy code"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

// =====================================================
// EXPANDABLE SECTION
// =====================================================

function ExpandableSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-amber-500/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-space-900/50 hover:bg-space-800/50 flex items-center justify-between text-left transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-amber-400" />
          <span className="font-medium text-amber-200">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="p-4 border-t border-amber-500/10">{children}</div>}
    </div>
  );
}

// =====================================================
// SECTION NAVIGATION
// =====================================================

type Section = 'overview' | 'dell' | 'kernel' | 'inscription' | 'claims' | 'basin' | 'api' | 'glossary';

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'dell', label: 'DELL Theory', icon: Brain },
  { id: 'kernel', label: 'Graph Kernel', icon: Network },
  { id: 'inscription', label: 'Pipeline', icon: Workflow },
  { id: 'claims', label: 'Claims IR', icon: FileCode },
  { id: 'basin', label: 'Basin Lifecycle', icon: GitBranch },
  { id: 'api', label: 'API Reference', icon: Terminal },
  { id: 'glossary', label: 'Glossary', icon: BookOpen },
];

// =====================================================
// CLAIM TYPE DATA (Technical)
// =====================================================

interface ClaimTechnical {
  type: ClaimType;
  name: string;
  sigil: string;
  index: number;
  unicode: string;
  irType: string;
  formula: string;
  canonicalForm: string;
  fields: { name: string; type: string; desc: string }[];
  icon: React.ElementType;
  colorClass: string;
}

const CLAIM_TECHNICAL: ClaimTechnical[] = [
  {
    type: 'stabilize',
    name: 'Stabilization',
    sigil: CLAIM_SIGILS.stabilize,
    index: 0,
    unicode: 'U+07DB',
    irType: 'StabilizeClaim',
    formula: 'σ(t) - σ(t-Δ) < -θ',
    canonicalForm: 'ߛ ⟦t0–t1⟧ : z(σ) ↓ ; ⟦place⟧ ; c=⟦conf⟧',
    fields: [
      { name: 'window', type: 'TimeWindow', desc: 'Time interval [t0, t1]' },
      { name: 'dims', type: 'Vec<usize>', desc: 'Which dimensions contracted' },
      { name: 'metric', type: 'DispersionMetric', desc: 'Variance or Speed' },
      { name: 'delta', type: 'f64', desc: 'Contraction amount (negative)' },
      { name: 'confidence', type: 'Confidence', desc: 'Detection certainty [0,1]' },
    ],
    icon: TrendingDown,
    colorClass: 'text-emerald-400',
  },
  {
    type: 'disperse',
    name: 'Dispersion',
    sigil: CLAIM_SIGILS.disperse,
    index: 1,
    unicode: 'U+07DC',
    irType: 'DisperseClaim',
    formula: 'σ(t) - σ(t-Δ) > +θ',
    canonicalForm: 'ߜ ⟦t0–t1⟧ : z(σ) ↑ ; ⟦place⟧ ; c=⟦conf⟧',
    fields: [
      { name: 'window', type: 'TimeWindow', desc: 'Time interval [t0, t1]' },
      { name: 'metric', type: 'EntropyMetric', desc: 'Variance or Entropy' },
      { name: 'delta', type: 'f64', desc: 'Expansion amount (positive)' },
      { name: 'confidence', type: 'Confidence', desc: 'Detection certainty [0,1]' },
    ],
    icon: TrendingUp,
    colorClass: 'text-orange-400',
  },
  {
    type: 'transition',
    name: 'Transition',
    sigil: CLAIM_SIGILS.transition,
    index: 2,
    unicode: 'U+07D5',
    irType: 'TransitionClaim',
    formula: 'place(t) ≠ place(t-1)',
    canonicalForm: 'ߕ ⟦t*⟧ : ⟦B_from⟧ → ⟦B_to⟧ ; κ=⟦sharp⟧ ; c=⟦conf⟧',
    fields: [
      { name: 't_star', type: 'f64', desc: 'The instant of transition' },
      { name: 'from_basin', type: 'Option<BasinId>', desc: 'Source basin' },
      { name: 'to_basin', type: 'Option<BasinId>', desc: 'Target basin' },
      { name: 'sharpness', type: 'f64', desc: 'Curvature magnitude (κ)' },
    ],
    icon: Navigation,
    colorClass: 'text-blue-400',
  },
  {
    type: 'return',
    name: 'Return',
    sigil: CLAIM_SIGILS.return,
    index: 3,
    unicode: 'U+07D9',
    irType: 'ReturnClaim',
    formula: 'basin(t) ∈ BasinHistory',
    canonicalForm: 'ߙ ⟦t*⟧ : ↺ ⟦B⟧ ; last=⟦Δt⟧ ; d=⟦dist⟧',
    fields: [
      { name: 't_star', type: 'f64', desc: 'Return timestamp' },
      { name: 'basin', type: 'BasinId', desc: 'Previously known basin' },
      { name: 'last_seen', type: 'f64', desc: 'Timestamp of previous visit' },
      { name: 'distance', type: 'f64', desc: 'How far traveled before return' },
    ],
    icon: RotateCcw,
    colorClass: 'text-violet-400',
  },
  {
    type: 'dwell',
    name: 'Dwell',
    sigil: CLAIM_SIGILS.dwell,
    index: 4,
    unicode: 'U+07E1',
    irType: 'DwellClaim',
    formula: 'σ < θ_low for t > t_min',
    canonicalForm: 'ߡ ⟦t0–t1⟧ : stay(⟦B⟧)=⟦τ⟧ ; ϕ=⟦stab⟧',
    fields: [
      { name: 'window', type: 'TimeWindow', desc: 'Duration of stay' },
      { name: 'basin', type: 'BasinId', desc: 'Basin dwelled in' },
      { name: 'dwell_time', type: 'f64', desc: 'Duration in seconds (τ)' },
      { name: 'stability', type: 'f64', desc: 'Internal dispersion metric (ϕ)' },
    ],
    icon: Home,
    colorClass: 'text-teal-400',
  },
  {
    type: 'oscillate',
    name: 'Oscillation',
    sigil: CLAIM_SIGILS.oscillate,
    index: 5,
    unicode: 'U+07DA',
    irType: 'OscillateClaim',
    formula: 'autocorr(σ) shows periodic peak',
    canonicalForm: 'ߚ ⟦t0–t1⟧ : ⟦B1⟧ ⇄ ⟦B2⟧ ; f=⟦freq⟧ ; a=⟦amp⟧',
    fields: [
      { name: 'window', type: 'TimeWindow', desc: 'Oscillation period' },
      { name: 'basins', type: 'Vec<BasinId>', desc: 'Alternating basins [B1, B2]' },
      { name: 'frequency', type: 'f64', desc: 'Crossings per unit time (f)' },
      { name: 'amplitude', type: 'f64', desc: 'Average excursion distance (a)' },
    ],
    icon: Radio,
    colorClass: 'text-pink-400',
  },
  {
    type: 'recover',
    name: 'Recovery',
    sigil: CLAIM_SIGILS.recover,
    index: 6,
    unicode: 'U+07DE',
    irType: 'RecoverClaim',
    formula: 'σ↓ following recent σ spike',
    canonicalForm: 'ߞ ⟦t*⟧ : rec→⟦B⟧ ; τ=⟦lat⟧ (×⟦ratio⟧)',
    fields: [
      { name: 'event_t', type: 'f64', desc: 'Disruption timestamp' },
      { name: 'target_basin', type: 'BasinId', desc: 'Recovery target' },
      { name: 'latency', type: 'f64', desc: 'Seconds to return (τ)' },
      { name: 'ratio', type: 'f64', desc: 'latency / baseline' },
    ],
    icon: HeartPulse,
    colorClass: 'text-lime-400',
  },
  {
    type: 'novel',
    name: 'Novelty',
    sigil: CLAIM_SIGILS.novel,
    index: 7,
    unicode: 'U+07E3',
    irType: 'NovelClaim',
    formula: 'basin(t) ∉ BasinLexicon',
    canonicalForm: 'ߣ ⟦t*⟧ : new⟦P⟧ ; d*=⟦dist⟧ ; k=⟦support⟧',
    fields: [
      { name: 't_star', type: 'f64', desc: 'Discovery timestamp' },
      { name: 'proto_id', type: 'ProtoBasinId', desc: 'Provisional identifier' },
      { name: 'distance_to_nearest', type: 'f64', desc: 'Distance to known basins (d*)' },
      { name: 'support_k', type: 'usize', desc: 'Samples in region (k)' },
    ],
    icon: Sparkles,
    colorClass: 'text-amber-400',
  },
  {
    type: 'placeShift',
    name: 'Place-Shift',
    sigil: CLAIM_SIGILS.placeShift,
    index: 8,
    unicode: 'U+07E0',
    irType: 'PlaceShiftClaim',
    formula: 'place(t) ∉ PlaceHistory',
    canonicalForm: 'ߠ ⟦t*⟧ : ⟦P_from⟧ → ⟦P_to⟧ ; ↪ ⟦claim_sigil⟧ ; c=⟦conf⟧',
    fields: [
      { name: 't_star', type: 'f64', desc: 'Shift timestamp' },
      { name: 'from', type: 'PlaceClass', desc: 'Source location' },
      { name: 'to', type: 'PlaceClass', desc: 'Target location' },
      { name: 'coupled_claim', type: 'CoupledClaimType', desc: 'Associated claim' },
    ],
    icon: MapPin,
    colorClass: 'text-cyan-400',
  },
  {
    type: 'echo',
    name: 'Echo',
    sigil: CLAIM_SIGILS.echo,
    index: 9,
    unicode: 'U+07E5',
    irType: 'EchoClaim',
    formula: 'sim(claim_t, claim_{t-k}) > θ',
    canonicalForm: 'ߥ ⟦t0–t1⟧ : ≈ ⟦E#⟧ ; sim=⟦s⟧ ; refs=⟦n⟧',
    fields: [
      { name: 'window', type: 'TimeWindow', desc: 'Echo window' },
      { name: 'match_set', type: 'Vec<NodeId>', desc: 'Matched nodes from slice' },
      { name: 'similarity', type: 'f64', desc: 'Pattern similarity (sim)' },
      { name: 'outcome_tag', type: 'Option<Symbol>', desc: 'Outcome reference' },
    ],
    icon: Repeat,
    colorClass: 'text-indigo-400',
  },
];

// =====================================================
// SECTION 1: OVERVIEW
// =====================================================

function OverviewSection() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          Technical Documentation
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
          N'Ko Inscription System
        </h1>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          A system that compiles embodied dynamics into justified N'Ko statements
          with cryptographic provenance. Every inscription is traceable to its source
          evidence through a typed IR pipeline.
        </p>
      </div>

      {/* Architecture Diagram */}
      <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80 overflow-hidden">
        <h3 className="font-semibold text-amber-200 mb-6 flex items-center gap-2">
          <Workflow className="w-5 h-5" />
          System Architecture
        </h3>

        {/* Main Pipeline Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 rounded-xl" />
          <div className="relative border border-amber-500/30 rounded-xl p-6 space-y-6">
            {/* Title */}
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-300 tracking-wider uppercase">
                Inscription Pipeline
              </span>
            </div>

            {/* Primary Data Flow */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-4">
              {[
                { label: 'Motion Sensors', sub: '60 Hz', color: 'from-violet-500/20 to-violet-600/20', border: 'border-violet-500/40', text: 'text-violet-300' },
                { label: 'DELL', sub: 'Dual-Eq', color: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/40', text: 'text-blue-300' },
                { label: 'z-trajectory', sub: 'embeddings', color: 'from-cyan-500/20 to-cyan-600/20', border: 'border-cyan-500/40', text: 'text-cyan-300' },
                { label: 'ClaimDetector', sub: '10 detectors', color: 'from-amber-500/20 to-amber-600/20', border: 'border-amber-500/40', text: 'text-amber-300' },
              ].map((node, i, arr) => (
                <React.Fragment key={node.label}>
                  <div className={`px-4 py-2.5 rounded-lg bg-gradient-to-br ${node.color} border ${node.border} text-center min-w-[120px]`}>
                    <div className={`font-semibold text-sm ${node.text}`}>{node.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{node.sub}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex items-center text-amber-500/60">
                      <div className="w-6 h-0.5 bg-gradient-to-r from-amber-500/40 to-amber-500/60" />
                      <ArrowRight className="w-4 h-4 -ml-1" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Claim Detection Section */}
            <div className="border border-orange-500/20 rounded-lg bg-gradient-to-br from-orange-500/5 to-yellow-500/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-xs font-semibold text-orange-300 tracking-wider uppercase">
                  Claim Detection · 6 Hz
                </span>
              </div>

              <div className="grid lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-center">
                {/* Input */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-space-900/60 border border-space-700/50">
                    <Code className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300 font-mono">z<sub className="text-xs">t-k:t</sub></span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-space-900/60 border border-space-700/50">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">place</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-space-900/60 border border-space-700/50">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">slice_id</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden lg:flex items-center text-orange-500/60">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-orange-500/30 to-orange-500/60" />
                  <ArrowRight className="w-4 h-4 -ml-1" />
                </div>

                {/* Detectors */}
                <div className="px-4 py-4 rounded-lg bg-gradient-to-br from-space-900/80 to-space-800/80 border border-orange-500/20">
                  <div className="text-xs font-semibold text-orange-300 mb-3 text-center">10 Typed Detectors</div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {['Variance', 'Spatial', 'Temporal', 'Pattern', 'Transition'].map((d) => (
                      <div key={d} className="px-2 py-1 rounded bg-space-800/60 text-gray-400 text-center">{d}</div>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden lg:flex items-center text-orange-500/60">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-orange-500/30 to-orange-500/60" />
                  <ArrowRight className="w-4 h-4 -ml-1" />
                </div>

                {/* Output Stack */}
                <div className="space-y-2">
                  <div className="px-4 py-2.5 rounded-lg bg-gradient-to-br from-emerald-500/15 to-emerald-600/15 border border-emerald-500/30 text-center">
                    <div className="text-sm font-semibold text-emerald-300">Claim IR</div>
                    <div className="text-xs text-gray-400">typed representation</div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-0.5 h-4 bg-gradient-to-b from-emerald-500/40 to-amber-500/40" />
                  </div>
                  <div className="px-4 py-2.5 rounded-lg bg-gradient-to-br from-amber-500/15 to-yellow-500/15 border border-amber-500/30 text-center">
                    <div className="text-sm font-semibold text-amber-300">Lexicon</div>
                    <div className="text-xs text-gray-400">versioned (vN)</div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-0.5 h-4 bg-gradient-to-b from-amber-500/40 to-violet-500/40" />
                  </div>
                  <div className="px-4 py-2.5 rounded-lg bg-gradient-to-br from-violet-500/15 to-purple-500/15 border border-violet-500/30 text-center">
                    <div className="text-sm font-semibold text-violet-300">Surface</div>
                    <div className="text-xs text-gray-400">N&apos;Ko render</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Provenance Chain */}
            <div className="border border-blue-500/20 rounded-lg bg-gradient-to-br from-blue-500/5 to-indigo-500/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300 tracking-wider uppercase">
                  Provenance Chain
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                {['Evidence', 'IR', 'Surface', 'Proof Scaffold', 'Graph Kernel'].map((step, i, arr) => (
                  <React.Fragment key={step}>
                    <span className="px-3 py-1.5 rounded-md bg-space-900/60 border border-blue-500/20 text-gray-300 font-medium">
                      {step}
                    </span>
                    {i < arr.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-blue-500/50" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Components Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: Brain,
            title: 'DELL',
            desc: 'Dual-Equilibrium Latent Learning - neural architecture operating on two timescales',
            color: 'text-violet-400',
            link: 'dell',
          },
          {
            icon: Network,
            title: 'Graph Kernel',
            desc: 'Deterministic context slicing engine for bounded, reproducible slices',
            color: 'text-blue-400',
            link: 'kernel',
          },
          {
            icon: Workflow,
            title: 'Inscription Pipeline',
            desc: '10 claim detectors converting z-trajectory to typed IR to N\'Ko surface',
            color: 'text-amber-400',
            link: 'inscription',
          },
          {
            icon: FileCode,
            title: 'Claim IR',
            desc: 'Strongly-typed intermediate representation for each claim type',
            color: 'text-emerald-400',
            link: 'claims',
          },
          {
            icon: GitBranch,
            title: 'Basin Lifecycle',
            desc: 'Proto-basin → Basin → Split/Merge/Retire state machine',
            color: 'text-pink-400',
            link: 'basin',
          },
          {
            icon: Terminal,
            title: 'API Reference',
            desc: 'Full API documentation for integration and development',
            color: 'text-cyan-400',
            link: 'api',
          },
        ].map((item) => (
          <Card
            key={item.title}
            className="p-4 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80 hover:border-amber-500/40 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <item.icon className={`w-6 h-6 ${item.color} flex-shrink-0`} />
              <div>
                <h4 className="font-semibold text-amber-200">{item.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Design Philosophy */}
      <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-amber-200 mb-4">Design Philosophy</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-space-900/50 border-l-2 border-amber-500/50">
            <h4 className="font-medium text-amber-300 mb-2">Anticipation Over Prediction</h4>
            <p className="text-sm text-gray-400">
              The system does not predict what will happen; it detects when dynamics
              become constrained enough that a claim is warranted.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50 border-l-2 border-violet-500/50">
            <h4 className="font-medium text-violet-300 mb-2">Non-Retroactive Corpus</h4>
            <p className="text-sm text-gray-400">
              Old inscriptions are never rewritten. When the lexicon evolves,
              original inscriptions remain untouched.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50 border-l-2 border-blue-500/50">
            <h4 className="font-medium text-blue-300 mb-2">Provenance by Design</h4>
            <p className="text-sm text-gray-400">
              Every claim maintains a chain: z-trajectory → ClaimDetector → Typed IR
              → Lexicon → N'Ko Surface → Proof Scaffold.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50 border-l-2 border-emerald-500/50">
            <h4 className="font-medium text-emerald-300 mb-2">Determinism First</h4>
            <p className="text-sm text-gray-400">
              Every operation must be deterministic. Same inputs must produce
              byte-identical outputs across runs, sessions, and machines.
            </p>
          </div>
        </div>
      </Card>

      {/* Line Skeleton */}
      <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-amber-200 mb-4">N'Ko Line Skeleton</h3>
        <p className="text-gray-400 mb-4">Every inscription follows this structure:</p>
        <CodeBlock
          code={`⟨operator-sigil⟩ ⟨time-marker⟩ : ⟨claim-body⟩ ; ⟨slots⟩

Example:
ߛ ⟦100.0–200.0⟧ : z(σ) ↓ ; ⟦home⟧ ; c=0.85

Reads as: "Stabilization claim from t=100.0 to t=200.0,
          dispersion decreased, at place 'home', confidence 0.85"`}
          language="text"
          title="inscription_skeleton.nko"
        />
      </Card>
    </div>
  );
}

// =====================================================
// SECTION 2: DELL THEORY
// =====================================================

function DELLSection() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
          Neural Architecture
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold text-violet-200">
          DELL: Dual-Equilibrium Latent Learning
        </h2>
        <p className="text-gray-400 max-w-3xl mx-auto">
          A novel neural architecture operating on two timescales simultaneously to bridge
          immediate sensorimotor response (fast equilibrium) and long-horizon creative
          coherence (slow equilibrium).
        </p>
      </div>

      {/* Core Insight */}
      <Card className="p-6 border-violet-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-violet-200 mb-4">The Core Insight</h3>
        <p className="text-gray-300 mb-4">
          Traditional motion-to-audio systems operate on a <strong>single timescale</strong>, either:
        </p>
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <h4 className="font-medium text-red-300 mb-1">Too Fast</h4>
            <p className="text-sm text-gray-400">
              Reactive, jittery, no memory (e.g., direct MIDI mapping)
            </p>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <h4 className="font-medium text-red-300 mb-1">Too Slow</h4>
            <p className="text-sm text-gray-400">
              Laggy, unresponsive, loses real-time feel (e.g., ML prediction)
            </p>
          </div>
        </div>
        <p className="text-gray-300">
          DELL solves this by maintaining <strong>two parallel equilibrium states</strong> that communicate:
        </p>
        <div className="mt-4 font-mono text-sm text-gray-300 bg-space-900/50 p-4 rounded-lg">
          <pre>{`Fast Equilibrium (60 Hz):  Immediate sensorimotor loop
      ↕ ↕ ↕               (Reflexive, low-latency)
      Coordinator          Bi-directional coupling
      ↕ ↕ ↕               (Learned gating)
Slow Equilibrium (~2.5 Hz): Long-horizon coherence
                           (Contextual, memory-aware)`}</pre>
        </div>
      </Card>

      {/* Dual-Timescale Hypothesis */}
      <Card className="p-6 border-violet-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-violet-200 mb-4">The Dual-Timescale Hypothesis</h3>
        <p className="text-gray-300 mb-4">
          Human movement expertise emerges from the interaction of two distinct neural processes:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <h4 className="font-medium text-emerald-300 mb-2">Fast Process</h4>
            <p className="text-xs text-gray-500 mb-2">Cerebellum, basal ganglia</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Latency: ~100-200ms</li>
              <li>• Function: Reflexive motor control, balance</li>
              <li>• High-frequency, low-dimensional, reactive</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h4 className="font-medium text-blue-300 mb-2">Slow Process</h4>
            <p className="text-xs text-gray-500 mb-2">Prefrontal cortex, hippocampus</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Latency: ~500ms-2s</li>
              <li>• Function: Planning, creativity, style</li>
              <li>• Low-frequency, high-dimensional, predictive</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Mathematical Formulation */}
      <Card className="p-6 border-violet-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-violet-200 mb-4">Mathematical Formulation</h3>

        <div className="space-y-6">
          {/* Notation */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Notation</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-500/20">
                    <th className="text-left py-2 text-amber-300 font-mono">Symbol</th>
                    <th className="text-left py-2 text-amber-300">Meaning</th>
                    <th className="text-left py-2 text-amber-300">Dimension</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800">
                    <td className="py-2 font-mono">x_t</td>
                    <td className="py-2">Motion input at time t</td>
                    <td className="py-2 font-mono text-gray-500">ℝ^64-128</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 font-mono">h_t^F</td>
                    <td className="py-2">Fast equilibrium hidden state</td>
                    <td className="py-2 font-mono text-gray-500">ℝ^32</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 font-mono">h_t^S</td>
                    <td className="py-2">Slow equilibrium hidden state</td>
                    <td className="py-2 font-mono text-gray-500">ℝ^32</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 font-mono">z_t</td>
                    <td className="py-2">Coordinator latent state</td>
                    <td className="py-2 font-mono text-gray-500">ℝ^16</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 font-mono">τ_F</td>
                    <td className="py-2">Fast timescale</td>
                    <td className="py-2 font-mono text-gray-500">0.0167s (60 Hz)</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono">τ_S</td>
                    <td className="py-2">Slow timescale</td>
                    <td className="py-2 font-mono text-gray-500">0.4s (2.5 Hz)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Core Equations */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Core Equations</h4>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-space-900/50">
                <h5 className="text-amber-300 font-medium mb-2">Fast Equilibrium Dynamics</h5>
                <code className="block text-emerald-300 font-mono text-sm mb-2">
                  h^F_{'{t+1}'} = (1 - α_F) h^F_t + α_F · f_F(x_t, z_t; θ_F)
                </code>
                <p className="text-xs text-gray-500">
                  where α_F = Δt / τ_F (typically 1.0 at 60Hz)
                </p>
              </div>
              <div className="p-4 rounded-lg bg-space-900/50">
                <h5 className="text-amber-300 font-medium mb-2">Slow Equilibrium Dynamics</h5>
                <code className="block text-blue-300 font-mono text-sm mb-2">
                  h^S_{'{t+1}'} = (1 - α_S) h^S_t + α_S · f_S(x̄_t, z_t; θ_S)
                </code>
                <p className="text-xs text-gray-500">
                  where α_S ≈ 0.042 (slow integration), x̄_t is 400ms temporal average
                </p>
              </div>
              <div className="p-4 rounded-lg bg-space-900/50">
                <h5 className="text-amber-300 font-medium mb-2">Coordinator (Gating Network)</h5>
                <code className="block text-violet-300 font-mono text-sm mb-2">
                  z_t = σ(W_F h^F_t + W_S h^S_t + W_c c_t + b)
                </code>
                <p className="text-xs text-gray-500">
                  where c_t are anticipation scalars (commitment, uncertainty, etc.)
                </p>
              </div>
              <div className="p-4 rounded-lg bg-space-900/50">
                <h5 className="text-amber-300 font-medium mb-2">Output Decoder</h5>
                <code className="block text-pink-300 font-mono text-sm mb-2">
                  y_t = W_y [h^F_t; h^S_t; z_t] + b_y
                </code>
                <p className="text-xs text-gray-500">
                  Concatenation of both equilibria plus coordinator for final output
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Architecture Diagram - Animated */}
      <Card className="p-6 border-violet-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80 overflow-hidden">
        <h3 className="font-semibold text-violet-200 mb-6 flex items-center gap-2">
          <Workflow className="w-5 h-5" />
          DELL Architecture
          <Badge variant="outline" className="ml-2 text-xs border-violet-500/40 text-violet-300">Interactive</Badge>
        </h3>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-blue-500/5 to-violet-500/5 rounded-xl" />

          <div className="relative border border-violet-500/30 rounded-xl p-6 space-y-6">
            {/* Animated Data Particles - flowing through the pipeline */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              {/* Particle 1 - Main flow */}
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"
                style={{ left: '50%', marginLeft: '-4px' }}
                animate={{
                  y: [40, 120, 200, 320, 420],
                  opacity: [0, 1, 1, 1, 0],
                  scale: [0.5, 1, 1, 1, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                  times: [0, 0.2, 0.4, 0.7, 1],
                }}
              />
              {/* Particle 2 - Left branch (slow) */}
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50"
                style={{ left: '35%' }}
                animate={{
                  y: [140, 200, 280],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              />
              {/* Particle 3 - Right branch (fast) */}
              <motion.div
                className="absolute w-1.5 h-1.5 rounded-full bg-pink-400 shadow-lg shadow-pink-400/50"
                style={{ left: '65%' }}
                animate={{
                  y: [140, 200, 280],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: 0.5,
                }}
              />
            </div>

            {/* Motion Input - Top */}
            <motion.div
              className="flex justify-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <motion.div
                className="px-6 py-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-center max-w-md w-full cursor-pointer relative overflow-hidden group"
                whileHover={{ borderColor: 'rgba(245, 158, 11, 0.6)' }}
              >
                {/* Shimmer effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
                <div className="relative">
                  <div className="font-semibold text-amber-300 mb-1 flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    >
                      <Radio className="w-4 h-4" />
                    </motion.div>
                    Motion Input
                  </div>
                  <div className="font-mono text-sm text-amber-200/80">x_t</div>
                  <div className="text-xs text-gray-400 mt-1">64-dim: anticipation + gesture</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Animated Arrow down with split */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-0.5 h-4 bg-gradient-to-b from-amber-500/60 to-violet-500/60"
                  animate={{ scaleY: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="w-32 h-0.5 bg-gradient-to-r from-violet-500/40 via-violet-500/60 to-violet-500/40"
                  animate={{ scaleX: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="flex justify-between w-32">
                  <motion.div
                    className="w-0.5 h-4 bg-violet-500/60"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-0.5 h-4 bg-violet-500/60"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Dual Input Paths - with hover expansion */}
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              <motion.div
                className="px-4 py-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/40 text-center cursor-pointer"
                whileHover={{ scale: 1.05, borderColor: 'rgba(99, 102, 241, 0.6)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-blue-300 text-sm">Temporal Avg</div>
                <motion.div
                  className="text-xs text-blue-200/70 mt-1"
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1 }}
                >
                  400ms sliding window
                </motion.div>
                <div className="font-mono text-xs text-gray-400 mt-1">x̄_t</div>
              </motion.div>
              <motion.div
                className="px-4 py-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-center cursor-pointer"
                whileHover={{ scale: 1.05, borderColor: 'rgba(34, 211, 238, 0.6)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-cyan-300 text-sm">Direct Passthrough</div>
                <motion.div
                  className="text-xs text-cyan-200/70 mt-1"
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1 }}
                >
                  Zero-delay immediate
                </motion.div>
                <div className="font-mono text-xs text-gray-400 mt-1">x_t</div>
              </motion.div>
            </div>

            {/* Arrow down */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="flex justify-between w-32">
                  <motion.div
                    className="w-0.5 h-4 bg-violet-500/60"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-0.5 h-4 bg-violet-500/60"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                </div>
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowDown className="w-5 h-5 text-violet-400" />
                </motion.div>
              </div>
            </div>

            {/* DELLCoordinator Block - Enhanced */}
            <motion.div
              className="border-2 border-violet-500/40 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-5 max-w-xl mx-auto relative overflow-hidden"
              whileHover={{ borderColor: 'rgba(139, 92, 246, 0.6)' }}
            >
              {/* Background pulse */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <div className="relative">
                <div className="text-center mb-4">
                  <motion.span
                    className="inline-block px-4 py-1.5 bg-gradient-to-r from-violet-500/30 to-purple-500/30 border border-violet-500/40 rounded-full text-xs font-semibold text-violet-300 tracking-wider uppercase"
                    animate={{ boxShadow: ['0 0 0px rgba(139,92,246,0)', '0 0 15px rgba(139,92,246,0.3)', '0 0 0px rgba(139,92,246,0)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    DELLCoordinator
                  </motion.span>
                </div>

                {/* Dual Equilibrium - with animated indicators */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <motion.div
                    className="px-4 py-4 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/40 text-center cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-indigo-500/30 flex items-center justify-center relative">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-indigo-400/20"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-3 h-3 rounded-full bg-indigo-400"
                        animate={{ scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                    </div>
                    <div className="font-medium text-indigo-300 text-sm">Slow Equilibrium</div>
                    <div className="font-mono text-xs text-indigo-200/70 mt-1">h<sup>S</sup><sub>t</sub> (32-dim)</div>
                    <motion.div
                      className="text-xs text-gray-400 mt-1"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      τ<sub>S</sub> = 0.4s
                    </motion.div>
                  </motion.div>
                  <motion.div
                    className="px-4 py-4 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/40 text-center cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-pink-500/30 flex items-center justify-center relative">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-pink-400/20"
                        animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-3 h-3 rounded-full bg-pink-400"
                        animate={{ scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    </div>
                    <div className="font-medium text-pink-300 text-sm">Fast Equilibrium</div>
                    <div className="font-mono text-xs text-pink-200/70 mt-1">h<sup>F</sup><sub>t</sub> (32-dim)</div>
                    <motion.div
                      className="text-xs text-gray-400 mt-1"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      τ<sub>F</sub> = 0.017s
                    </motion.div>
                  </motion.div>
                </div>

                {/* Animated Merge arrows */}
                <div className="flex justify-center mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-0.5 bg-gradient-to-r from-indigo-500/40 to-violet-500/60 rounded"
                      animate={{ scaleX: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      animate={{ y: [0, 2, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowDown className="w-4 h-4 text-violet-400" />
                    </motion.div>
                    <motion.div
                      className="w-12 h-0.5 bg-gradient-to-l from-pink-500/40 to-violet-500/60 rounded"
                      animate={{ scaleX: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                  </div>
                </div>

                {/* Gating Network - with pulsing glow */}
                <div className="flex justify-center">
                  <motion.div
                    className="px-6 py-3 rounded-lg bg-gradient-to-br from-purple-500/25 to-violet-500/25 border border-purple-500/50 text-center relative"
                    whileHover={{ scale: 1.05 }}
                    animate={{ boxShadow: ['0 0 0px rgba(168,85,247,0)', '0 0 20px rgba(168,85,247,0.3)', '0 0 0px rgba(168,85,247,0)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="font-medium text-purple-300 text-sm flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 180, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-3 h-3" />
                      </motion.div>
                      Gating Network
                    </div>
                    <div className="font-mono text-xs text-purple-200/70 mt-1">z_t (16-dim)</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Animated Arrow to output */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-0.5 h-4 bg-gradient-to-b from-violet-500/60 to-emerald-500/60"
                  animate={{ scaleY: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <ArrowDown className="w-5 h-5 text-emerald-400" />
                </motion.div>
              </div>
            </div>

            {/* Output Decoder - with success glow */}
            <motion.div
              className="flex justify-center"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="px-6 py-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-center cursor-pointer relative overflow-hidden"
                animate={{ boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 25px rgba(16,185,129,0.2)', '0 0 0px rgba(16,185,129,0)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <div className="relative">
                  <div className="font-semibold text-emerald-300 flex items-center justify-center gap-2">
                    Output Decoder
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  </div>
                  <div className="font-mono text-sm text-emerald-200/80">y_t</div>
                  <div className="text-xs text-gray-400 mt-1">8-12 dim motion classification</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Enhanced Data flow legend */}
            <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-violet-500/20">
              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className="w-6 h-0.5 bg-gradient-to-r from-amber-500/60 to-violet-500/60 rounded"
                  animate={{ scaleX: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-gray-400">Data Flow</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.1 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 w-3 h-3 rounded-full bg-indigo-400/30"
                    animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <div className="w-3 h-3 rounded-full bg-indigo-400" />
                </div>
                <span className="text-xs text-gray-400">Slow (2.5 Hz)</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.1 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 w-3 h-3 rounded-full bg-pink-400/30"
                    animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                  <div className="w-3 h-3 rounded-full bg-pink-400" />
                </div>
                <span className="text-xs text-gray-400">Fast (60 Hz)</span>
              </motion.div>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance */}
      <Card className="p-6 border-violet-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-violet-200 mb-4">Performance Characteristics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-500/20">
                <th className="text-left py-2 text-amber-300">Metric</th>
                <th className="text-left py-2 text-amber-300">Target</th>
                <th className="text-left py-2 text-amber-300">Measured</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2">Update latency</td>
                <td className="py-2 font-mono text-gray-500">&lt; 500μs</td>
                <td className="py-2 font-mono text-emerald-400">~300μs</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2">Memory footprint</td>
                <td className="py-2 font-mono text-gray-500">&lt; 10KB</td>
                <td className="py-2 font-mono text-emerald-400">~8KB</td>
              </tr>
              <tr>
                <td className="py-2">Throughput</td>
                <td className="py-2 font-mono text-gray-500">60 Hz sustained</td>
                <td className="py-2 font-mono text-emerald-400">60 Hz</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// =====================================================
// SECTION 3: GRAPH KERNEL
// =====================================================

function GraphKernelSection() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          Context Construction
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold text-blue-200">
          Graph Kernel
        </h2>
        <p className="text-gray-400 max-w-3xl mx-auto">
          A deterministic context construction engine that transforms raw conversation
          DAG data into bounded, reproducible context slices suitable for semantic analysis.
        </p>
      </div>

      {/* Architecture Diagram - Interactive */}
      <Card className="p-6 border-blue-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80 overflow-hidden">
        <h3 className="font-semibold text-blue-200 mb-6 flex items-center gap-2">
          <Workflow className="w-5 h-5" />
          Context Slice Construction
          <Badge variant="outline" className="ml-2 text-xs border-blue-500/40 text-blue-300">Interactive</Badge>
        </h3>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-xl" />

          <div className="relative border border-blue-500/30 rounded-xl p-6 space-y-6">
            {/* Input Stage */}
            <div className="grid lg:grid-cols-3 gap-4 items-start">
              {/* Conversation DAG - Animated */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center">
                  <motion.span
                    className="inline-block px-3 py-1 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-full text-xs font-semibold text-violet-300 tracking-wider uppercase"
                    animate={{ boxShadow: ['0 0 0px rgba(139,92,246,0)', '0 0 10px rgba(139,92,246,0.3)', '0 0 0px rgba(139,92,246,0)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Input
                  </motion.span>
                </div>
                <motion.div
                  className="p-4 rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/15 border border-violet-500/30 cursor-pointer"
                  whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.5)' }}
                >
                  <div className="font-medium text-violet-300 text-center mb-3">Conversation DAG</div>
                  {/* Animated Mini DAG visualization */}
                  <div className="flex flex-col items-center gap-1 py-2">
                    <motion.div
                      className="w-6 h-6 rounded-full bg-violet-500/40 border border-violet-400/50"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    />
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <motion.div
                          className="w-0.5 h-3 bg-violet-500/40"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.div
                          className="w-5 h-5 rounded-full bg-violet-500/30 border border-violet-400/40"
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <motion.div
                          className="w-0.5 h-3 bg-amber-500/60"
                          animate={{ opacity: [0.6, 1, 0.6], scaleY: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <motion.div
                          className="w-5 h-5 rounded-full bg-amber-500/40 border-2 border-amber-400 relative"
                          animate={{ boxShadow: ['0 0 0px rgba(245,158,11,0)', '0 0 15px rgba(245,158,11,0.5)', '0 0 0px rgba(245,158,11,0)'] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <motion.div
                            className="absolute inset-0 rounded-full bg-amber-400/30"
                            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        </motion.div>
                        <motion.div
                          className="text-[10px] text-amber-300 mt-1"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          anchor
                        </motion.div>
                      </div>
                      <div className="flex flex-col items-center">
                        <motion.div
                          className="w-0.5 h-3 bg-violet-500/40"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        />
                        <motion.div
                          className="w-5 h-5 rounded-full bg-violet-500/30 border border-violet-400/40"
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-8 mt-1">
                      <motion.div
                        className="w-4 h-4 rounded-full bg-violet-500/20 border border-violet-400/30"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
                      />
                      <motion.div
                        className="w-4 h-4 rounded-full bg-violet-500/20 border border-violet-400/30"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 text-center mt-2">Session turns + edges</div>
                </motion.div>
              </motion.div>

              {/* Animated Arrow with flowing particle */}
              <div className="hidden lg:flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2 relative">
                  <motion.div
                    className="px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-center"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                    animate={{ boxShadow: ['0 0 0px rgba(59,130,246,0)', '0 0 12px rgba(59,130,246,0.3)', '0 0 0px rgba(59,130,246,0)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div
                      className="text-xs font-medium text-blue-300"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Priority BFS
                    </motion.div>
                    <div className="text-[10px] text-gray-400">+ Policy</div>
                  </motion.div>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="w-6 h-6 text-blue-400" />
                  </motion.div>
                  {/* Flowing particle */}
                  <motion.div
                    className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
                    style={{ top: '60%' }}
                    animate={{
                      x: [-40, 40],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>
              </div>

              {/* Output Slice - Animated */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="text-center">
                  <motion.span
                    className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-300 tracking-wider uppercase"
                    animate={{ boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 10px rgba(16,185,129,0.3)', '0 0 0px rgba(16,185,129,0)'] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    Output
                  </motion.span>
                </div>
                <motion.div
                  className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 cursor-pointer"
                  whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.5)' }}
                >
                  <div className="font-medium text-emerald-300 text-center mb-3">Context Slice</div>
                  <div className="space-y-2 text-xs">
                    {[
                      { icon: Hash, color: 'emerald', name: 'slice_id', detail: 'xxHash64', delay: 0 },
                      { icon: Target, color: 'amber', name: 'anchor_turn_id', detail: null, delay: 0.1 },
                      { icon: FileJson, color: 'blue', name: 'turns[]', detail: 'BTreeSet', delay: 0.2 },
                      { icon: GitBranch, color: 'purple', name: 'edges[]', detail: 'sorted', delay: 0.3 },
                    ].map((item) => (
                      <motion.div
                        key={item.name}
                        className="flex items-center gap-2 text-gray-300"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: item.delay + 0.5 }}
                        whileHover={{ x: 3 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: item.delay }}
                        >
                          <item.icon className={`w-3 h-3 text-${item.color}-400`} style={{ color: item.color === 'emerald' ? 'rgb(52,211,153)' : item.color === 'amber' ? 'rgb(251,191,36)' : item.color === 'blue' ? 'rgb(96,165,250)' : 'rgb(192,132,252)' }} />
                        </motion.div>
                        <span className="font-mono" style={{ color: item.color === 'emerald' ? 'rgb(167,243,208)' : item.color === 'amber' ? 'rgb(253,230,138)' : item.color === 'blue' ? 'rgb(191,219,254)' : 'rgb(233,213,255)' }}>{item.name}</span>
                        {item.detail && <span className="text-gray-500">{item.detail}</span>}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Process Pipeline - Animated */}
            <motion.div
              className="border border-cyan-500/20 rounded-lg bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-4 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Background flowing gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />

              <div className="relative">
                <div className="text-center mb-4">
                  <motion.span
                    className="inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs font-semibold text-cyan-300 tracking-wider uppercase"
                    animate={{ boxShadow: ['0 0 0px rgba(6,182,212,0)', '0 0 12px rgba(6,182,212,0.3)', '0 0 0px rgba(6,182,212,0)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Expansion Algorithm
                  </motion.span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {[
                    { step: '1', label: 'Seed Queue', desc: 'anchor + neighbors', color: 'amber', bg: 'rgba(245,158,11,0.15)', text: 'rgb(252,211,77)', pulse: 'rgba(245,158,11,0.4)' },
                    { step: '2', label: 'Priority Sort', desc: 'phase × salience', color: 'blue', bg: 'rgba(59,130,246,0.15)', text: 'rgb(147,197,253)', pulse: 'rgba(59,130,246,0.4)' },
                    { step: '3', label: 'Budget Check', desc: 'max_nodes, radius', color: 'violet', bg: 'rgba(139,92,246,0.15)', text: 'rgb(196,181,253)', pulse: 'rgba(139,92,246,0.4)' },
                    { step: '4', label: 'Expand Best', desc: 'add neighbors', color: 'cyan', bg: 'rgba(6,182,212,0.15)', text: 'rgb(103,232,249)', pulse: 'rgba(6,182,212,0.4)' },
                    { step: '5', label: 'Hash & Emit', desc: 'fingerprint slice', color: 'emerald', bg: 'rgba(16,185,129,0.15)', text: 'rgb(110,231,183)', pulse: 'rgba(16,185,129,0.4)' },
                  ].map((item, i, arr) => (
                    <React.Fragment key={item.step}>
                      <motion.div
                        className="px-3 py-2 rounded-lg border text-center min-w-[100px] cursor-pointer"
                        style={{
                          background: item.bg,
                          borderColor: `${item.pulse}`,
                        }}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.5 }}
                      >
                        <motion.div
                          className="w-5 h-5 mx-auto mb-1 rounded-full flex items-center justify-center text-xs font-bold text-white relative"
                          style={{ background: item.pulse }}
                          whileHover={{ scale: 1.2 }}
                        >
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ background: item.pulse }}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                          />
                          <span className="relative z-10">{item.step}</span>
                        </motion.div>
                        <div className="font-medium text-sm" style={{ color: item.text }}>
                          {item.label}
                        </div>
                        <div className="text-[10px] text-gray-400">{item.desc}</div>
                      </motion.div>
                      {i < arr.length - 1 && (
                        <motion.div
                          animate={{ x: [0, 3, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                        >
                          <ArrowRight className="w-4 h-4 text-cyan-500/50 hidden sm:block" />
                        </motion.div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Invariants Footer - Animated */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-blue-500/20">
              {[
                { label: 'Determinism', detail: 'Byte-identical', color: 'amber' },
                { label: 'Anchor ∈ Slice', detail: 'Always included', color: 'emerald' },
                { label: '|Slice| ≤ Budget', detail: 'Hard limit', color: 'blue' },
                { label: 'Sorted Output', detail: 'Canonical order', color: 'violet' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="text-center p-2 bg-space-900/50 rounded-lg cursor-pointer"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(15, 23, 42, 0.7)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.8 }}
                >
                  <motion.div
                    className="text-xs font-medium"
                    style={{ color: item.color === 'amber' ? 'rgb(252,211,77)' : item.color === 'emerald' ? 'rgb(110,231,183)' : item.color === 'blue' ? 'rgb(147,197,253)' : 'rgb(196,181,253)' }}
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  >
                    {item.label}
                  </motion.div>
                  <div className="text-[10px] text-gray-400">{item.detail}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* What It Does */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5 border-emerald-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <h3 className="font-semibold text-emerald-300 mb-3 flex items-center gap-2">
            <Check className="w-5 h-5" />
            What It Does
          </h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Select relevant turns around an anchor point</li>
            <li>• Prioritize by phase importance and salience</li>
            <li>• Respect budget constraints (node count, radius)</li>
            <li>• Produce content-derived fingerprints for provenance</li>
          </ul>
        </Card>
        <Card className="p-5 border-red-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <h3 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            What It Does NOT Do
          </h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Parse or analyze message content</li>
            <li>• Make semantic judgments</li>
            <li>• Learn or adapt from data</li>
            <li>• Store or persist slices</li>
          </ul>
        </Card>
      </div>

      {/* Design Principles */}
      <Card className="p-6 border-blue-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-blue-200 mb-4">Design Principles</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-space-900/50 border-l-2 border-amber-500/50">
            <h4 className="font-medium text-amber-300 mb-2">Determinism First</h4>
            <p className="text-sm text-gray-400 mb-2">
              Same inputs must produce byte-identical outputs across runs, sessions, and machines.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• BTreeMap/BTreeSet instead of HashMap</li>
              <li>• Explicit Ord implementations</li>
              <li>• Canonical JSON serialization</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50 border-l-2 border-violet-500/50">
            <h4 className="font-medium text-violet-300 mb-2">Budget Discipline</h4>
            <p className="text-sm text-gray-400 mb-2">
              Context slices must be bounded to prevent memory exhaustion and token overruns.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Hard caps: max_nodes, max_radius</li>
              <li>• Priority-queue expansion (best-first)</li>
              <li>• Early termination when exhausted</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50 border-l-2 border-blue-500/50">
            <h4 className="font-medium text-blue-300 mb-2">Provenance by Design</h4>
            <p className="text-sm text-gray-400 mb-2">
              Every slice must be traceable via the slice_id fingerprint.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Content-derived hashing (xxHash64)</li>
              <li>• Policy params included in fingerprint</li>
              <li>• Schema version included</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50 border-l-2 border-emerald-500/50">
            <h4 className="font-medium text-emerald-300 mb-2">Minimal Assumptions</h4>
            <p className="text-sm text-gray-400 mb-2">
              Types are containers, not interpreters. Validation is structural.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Message content: opaque strings</li>
              <li>• Session structure: any DAG topology</li>
              <li>• Phase/salience: passed through as-is</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Phase Weights */}
      <Card className="p-6 border-blue-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-blue-200 mb-4">Phase Weights</h3>
        <p className="text-gray-400 mb-4 text-sm">
          Weights calibrated based on typical information density per phase:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-500/20">
                <th className="text-left py-2 text-amber-300">Phase</th>
                <th className="text-left py-2 text-amber-300">Weight</th>
                <th className="text-left py-2 text-amber-300">Rationale</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 font-medium text-violet-400">Synthesis</td>
                <td className="py-2 font-mono">1.0</td>
                <td className="py-2 text-gray-500">Rare (0.1%), concentrated insight</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 font-medium text-blue-400">Planning</td>
                <td className="py-2 font-mono">0.9</td>
                <td className="py-2 text-gray-500">Strategic thinking, goal-setting</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 font-medium text-emerald-400">Consolidation</td>
                <td className="py-2 font-mono">0.6</td>
                <td className="py-2 text-gray-500">Summarization, integration</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 font-medium text-orange-400">Debugging</td>
                <td className="py-2 font-mono">0.5</td>
                <td className="py-2 text-gray-500">Problem-solving, often repetitive</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-gray-400">Exploration</td>
                <td className="py-2 font-mono">0.3</td>
                <td className="py-2 text-gray-500">Brainstorming, often tangential</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Expansion Algorithm */}
      <Card className="p-6 border-blue-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-blue-200 mb-4">Expansion Algorithm: Priority BFS</h3>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-500/20">
                <th className="text-left py-2 text-amber-300">Algorithm</th>
                <th className="text-left py-2 text-amber-300">Pros</th>
                <th className="text-left py-2 text-amber-300">Cons</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2">BFS</td>
                <td className="py-2 text-gray-500">Simple, fair</td>
                <td className="py-2 text-gray-500">Ignores importance</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2">DFS</td>
                <td className="py-2 text-gray-500">Follows chains</td>
                <td className="py-2 text-gray-500">Misses branches</td>
              </tr>
              <tr className="border-b border-gray-800 bg-emerald-500/5">
                <td className="py-2 font-medium text-emerald-400">Priority BFS ✓</td>
                <td className="py-2 text-emerald-400/80">Best-first</td>
                <td className="py-2 text-gray-500">More complex</td>
              </tr>
              <tr>
                <td className="py-2">Random walk</td>
                <td className="py-2 text-gray-500">Diverse</td>
                <td className="py-2 text-gray-500">Non-deterministic</td>
              </tr>
            </tbody>
          </table>
        </div>
        <CodeBlock
          code={`impl Ord for ExpansionCandidate {
    fn cmp(&self, other: &Self) -> Ordering {
        // 1. Higher priority first
        match self.priority.partial_cmp(&other.priority) {
            Some(Ordering::Equal) | None => {
                // 2. Lower distance first (closer to anchor)
                match self.distance.cmp(&other.distance).reverse() {
                    Ordering::Equal => {
                        // 3. By TurnId for determinism
                        self.turn.id.cmp(&other.turn.id)
                    }
                    ord => ord
                }
            }
            Some(ord) => ord
        }
    }
}`}
          language="rust"
          title="candidate_ordering.rs"
        />
      </Card>

      {/* Invariants */}
      <Card className="p-6 border-blue-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-blue-200 mb-4">Production Invariants</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-space-900/50">
            <h4 className="text-amber-300 font-mono text-sm mb-2">Determinism Invariant</h4>
            <code className="text-xs text-gray-400">
              ∀ anchor, policy, graph:<br />
              slice(anchor, policy, graph).slice_id<br />
              == slice(anchor, policy, graph).slice_id
            </code>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50">
            <h4 className="text-amber-300 font-mono text-sm mb-2">Anchor Invariant</h4>
            <code className="text-xs text-gray-400">
              ∀ slice:<br />
              slice.contains_turn(slice.anchor_turn_id)<br />
              == true
            </code>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50">
            <h4 className="text-amber-300 font-mono text-sm mb-2">Budget Invariant</h4>
            <code className="text-xs text-gray-400">
              ∀ slice, policy:<br />
              slice.num_turns() &lt;= policy.max_nodes
            </code>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50">
            <h4 className="text-amber-300 font-mono text-sm mb-2">Ordering Invariant</h4>
            <code className="text-xs text-gray-400">
              ∀ slice:<br />
              slice.turns == sort_by_turn_id(slice.turns)<br />
              slice.edges == sort_by_parent_child(slice.edges)
            </code>
          </div>
        </div>
      </Card>
    </div>
  );
}

// =====================================================
// SECTION 4: INSCRIPTION PIPELINE
// =====================================================

function InscriptionPipelineSection() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
          Claim Detection
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold text-amber-200">
          Inscription Pipeline
        </h2>
        <p className="text-gray-400 max-w-3xl mx-auto">
          The pipeline that transforms continuous motion data into discrete,
          justified claims expressed in N'Ko script.
        </p>
      </div>

      {/* Pipeline Architecture - Animated */}
      <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80 overflow-hidden">
        <h3 className="font-semibold text-amber-200 mb-6 flex items-center gap-2">
          <Workflow className="w-5 h-5" />
          Full Inscription Pipeline
          <Badge variant="outline" className="ml-2 text-xs border-amber-500/40 text-amber-300">Interactive</Badge>
        </h3>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-orange-500/5 to-pink-500/5 rounded-xl" />

          <div className="relative border border-amber-500/30 rounded-xl p-6 space-y-8">
            {/* Flowing data particle overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              {/* Multiple flowing particles across the pipeline */}
              {[0, 1, 2].map((idx) => (
                <motion.div
                  key={idx}
                  className="absolute w-2 h-2 rounded-full shadow-lg"
                  style={{
                    top: '80px',
                    background: `linear-gradient(to right, rgb(139,92,246), rgb(59,130,246), rgb(6,182,212), rgb(16,185,129), rgb(245,158,11), rgb(249,115,22), rgb(236,72,153))`,
                    boxShadow: '0 0 10px rgba(245,158,11,0.5)',
                  }}
                  animate={{
                    x: ['-5%', '105%'],
                    opacity: [0, 1, 1, 1, 1, 1, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: idx * 2,
                  }}
                />
              ))}
            </div>

            {/* Main Pipeline Flow - Top Row */}
            <div className="relative grid grid-cols-1 lg:grid-cols-7 gap-2 lg:gap-1">
              {[
                { stage: 1, name: 'Motion Input', icon: <Radio className="w-4 h-4" />, rate: '60 Hz', rgb: '139,92,246', text: 'rgb(196,181,253)', sub: 'Sensors' },
                { stage: 2, name: 'DELL', icon: <Brain className="w-4 h-4" />, rate: 'Dual-Eq', rgb: '59,130,246', text: 'rgb(147,197,253)', sub: 'Neural' },
                { stage: 3, name: 'z-trajectory', icon: <Activity className="w-4 h-4" />, rate: '64-128d', rgb: '6,182,212', text: 'rgb(103,232,249)', sub: 'Embeddings' },
                { stage: 4, name: 'Detectors', icon: <Target className="w-4 h-4" />, rate: '6 Hz', rgb: '16,185,129', text: 'rgb(110,231,183)', sub: '10 types' },
                { stage: 5, name: 'Typed IR', icon: <Code className="w-4 h-4" />, rate: 'Enums', rgb: '245,158,11', text: 'rgb(252,211,77)', sub: 'Claims' },
                { stage: 6, name: 'Lexicon', icon: <BookOpen className="w-4 h-4" />, rate: 'v1.0', rgb: '249,115,22', text: 'rgb(253,186,116)', sub: 'Tokens' },
                { stage: 7, name: "N'Ko", icon: <Sparkles className="w-4 h-4" />, rate: 'RTL', rgb: '236,72,153', text: 'rgb(244,114,182)', sub: 'Surface' },
              ].map((item, i, arr) => (
                <React.Fragment key={item.stage}>
                  <div className="flex lg:flex-col items-center gap-2 lg:gap-1">
                    {/* Stage Card - Animated */}
                    <motion.div
                      className="w-full px-3 py-3 rounded-lg border text-center cursor-pointer relative overflow-hidden"
                      style={{
                        background: `linear-gradient(to bottom right, rgba(${item.rgb}, 0.2), rgba(${item.rgb}, 0.1))`,
                        borderColor: `rgba(${item.rgb}, 0.4)`,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.08, y: -3, borderColor: `rgba(${item.rgb}, 0.7)` }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Pulse effect on hover */}
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: `rgba(${item.rgb}, 0.1)` }}
                        animate={{ opacity: [0, 0.3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      />
                      {/* Icon with stage number */}
                      <motion.div
                        className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center text-white relative"
                        style={{
                          background: `linear-gradient(to bottom right, rgba(${item.rgb}, 0.6), rgba(${item.rgb}, 0.8))`,
                        }}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{ background: `rgba(${item.rgb}, 0.3)` }}
                          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        />
                        <span className="relative z-10">{item.icon}</span>
                      </motion.div>
                      <motion.div
                        className="font-semibold text-sm mb-1 relative"
                        style={{ color: item.text }}
                        animate={{ opacity: [0.9, 1, 0.9] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                      >
                        {item.name}
                      </motion.div>
                      <div className="text-[10px] text-gray-400 relative">{item.sub}</div>
                      <Badge
                        variant="outline"
                        className="mt-2 text-[10px] py-0 px-1.5 relative"
                        style={{
                          borderColor: `rgba(${item.rgb}, 0.5)`,
                          color: item.text,
                        }}
                      >
                        {item.rate}
                      </Badge>
                    </motion.div>
                    {/* Animated Arrow */}
                    {i < arr.length - 1 && (
                      <motion.div
                        className="hidden lg:block -mr-2 flex-shrink-0"
                        animate={{ x: [0, 3, 0], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                      >
                        <ArrowRight className="w-4 h-4 text-amber-500/60" />
                      </motion.div>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Detector Detail Section - Animated */}
            <motion.div
              className="border border-emerald-500/20 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-4 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {/* Sweeping highlight */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              />

              <div className="relative text-center mb-4">
                <motion.span
                  className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-300 tracking-wider uppercase"
                  animate={{ boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 15px rgba(16,185,129,0.3)', '0 0 0px rgba(16,185,129,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  10 Claim Detectors
                </motion.span>
              </div>
              <div className="relative grid grid-cols-5 lg:grid-cols-10 gap-2">
                {[
                  { sigil: 'ߛ', name: 'Stabilize', rgb: '16,185,129' },
                  { sigil: 'ߜ', name: 'Disperse', rgb: '239,68,68' },
                  { sigil: 'ߕ', name: 'Transition', rgb: '59,130,246' },
                  { sigil: 'ߙ', name: 'Return', rgb: '245,158,11' },
                  { sigil: 'ߡ', name: 'Dwell', rgb: '168,85,247' },
                  { sigil: 'ߚ', name: 'Oscillate', rgb: '6,182,212' },
                  { sigil: 'ߞ', name: 'Recover', rgb: '34,197,94' },
                  { sigil: 'ߣ', name: 'Novel', rgb: '236,72,153' },
                  { sigil: 'ߠ', name: 'PlaceShift', rgb: '249,115,22' },
                  { sigil: 'ߥ', name: 'Echo', rgb: '139,92,246' },
                ].map((claim, i) => (
                  <motion.div
                    key={claim.name}
                    className="p-2 rounded-lg border text-center cursor-pointer relative overflow-hidden"
                    style={{
                      background: `rgba(${claim.rgb}, 0.15)`,
                      borderColor: `rgba(${claim.rgb}, 0.4)`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    whileHover={{ scale: 1.15, y: -3, borderColor: `rgba(${claim.rgb}, 0.8)`, zIndex: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div
                      className="text-xl font-bold mb-0.5"
                      style={{ fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif" }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                    >
                      {claim.sigil}
                    </motion.div>
                    <div className="text-[9px] text-gray-400 truncate">{claim.name}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Output Example - Animated */}
            <motion.div
              className="border border-pink-500/20 rounded-lg bg-gradient-to-br from-pink-500/5 to-rose-500/5 p-4 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <div className="relative text-center mb-3">
                <motion.span
                  className="inline-block px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-xs font-semibold text-pink-300 tracking-wider uppercase"
                  animate={{ boxShadow: ['0 0 0px rgba(236,72,153,0)', '0 0 15px rgba(236,72,153,0.3)', '0 0 0px rgba(236,72,153,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Surface Output Example
                </motion.span>
              </div>
              <div className="relative text-center">
                <motion.code
                  className="inline-block px-4 py-3 rounded-lg bg-space-900/80 border border-pink-500/30 text-lg text-pink-300 font-mono relative overflow-hidden"
                  dir="rtl"
                  lang="nqo"
                  style={{ fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif" }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(236, 72, 153, 0.6)' }}
                  animate={{ boxShadow: ['0 0 0px rgba(236,72,153,0)', '0 0 20px rgba(236,72,153,0.2)', '0 0 0px rgba(236,72,153,0)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="relative">ߛ ⟦t0–t1⟧ : z(σ) ↓ ; place ; c=0.85</span>
                </motion.code>
                <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-400">
                  {[
                    { text: 'ߛ', label: 'sigil', color: 'rgb(110,231,183)' },
                    { text: '⟦t0–t1⟧', label: 'time', color: 'rgb(147,197,253)' },
                    { text: 'z(σ)', label: 'metric', color: 'rgb(103,232,249)' },
                    { text: 'place', label: 'basin', color: 'rgb(252,211,77)' },
                    { text: 'c=0.85', label: 'conf', color: 'rgb(244,114,182)' },
                  ].map((item, i) => (
                    <motion.span
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + i * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <span style={{ color: item.color }}>{item.text}</span> {item.label}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Pipeline Stats Footer - Animated */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-amber-500/20">
              {[
                { value: '60', label: 'Hz Input Rate', color: 'rgb(196,181,253)' },
                { value: '6', label: 'Hz Detection', color: 'rgb(110,231,183)' },
                { value: '10', label: 'Claim Types', color: 'rgb(252,211,77)' },
                { value: 'RTL', label: "N'Ko Output", color: 'rgb(244,114,182)' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-3 bg-space-900/50 rounded-lg cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + i * 0.1 }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(15, 23, 42, 0.7)' }}
                >
                  <motion.div
                    className="text-2xl font-bold"
                    style={{ color: stat.color }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Crate Structure */}
      <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-amber-200 mb-4">Crate Structure</h3>
        <CodeBlock
          code={`core/cc-inscription/
├── Cargo.toml
├── src/
│   ├── lib.rs                 # Main entry, re-exports
│   ├── claims/                # 10 typed claim IR structs
│   │   ├── mod.rs             # Claim enum + core types
│   │   ├── stabilize.rs       # ߛ Stabilization
│   │   ├── disperse.rs        # ߜ Dispersion
│   │   ├── transition.rs      # ߕ Transition
│   │   ├── return_.rs         # ߙ Return
│   │   ├── dwell.rs           # ߡ Dwell
│   │   ├── oscillate.rs       # ߚ Oscillation
│   │   ├── recover.rs         # ߞ Recovery
│   │   ├── novel.rs           # ߣ Novelty
│   │   ├── place_shift.rs     # ߠ Place-Shift
│   │   └── echo.rs            # ߥ Echo
│   ├── basin/                 # Basin lifecycle management
│   ├── lexicon/               # Versioned lexicon
│   ├── surface/               # N'Ko rendering
│   ├── phrase/                # Phrase emergence
│   ├── detector/              # Claim detection
│   └── integration/           # External system bridges
├── lexicons/
│   └── v1.0.json              # Initial lexicon
└── docs/`}
          language="text"
          title="cc-inscription/"
        />
      </Card>

      {/* Detection Config */}
      <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-amber-200 mb-4">Detector Configuration</h3>
        <CodeBlock
          code={`let config = DetectorConfig {
    min_confidence: 0.6,        // Minimum confidence threshold
    dispersion_window: 10.0,    // Window size for σ calculation (frames)
    curvature_threshold: 0.5,   // κ threshold for transitions
    min_dwell_time: 5.0,        // Minimum dwell duration (seconds)
    oscillation_threshold: 0.2, // Frequency threshold for oscillation
    novelty_threshold: 3.0,     // Distance to nearest basin for novelty
};

let mut detector = ClaimDetector::new(config);

// Register known basins
detector.register_basin(basin_id, centroid);

// Detect claims from trajectory window
let samples: Vec<ZSample> = /* ... */;
let claims = detector.detect(&samples);`}
          language="rust"
          title="detector_config.rs"
        />
      </Card>

      {/* Integration Points */}
      <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-amber-200 mb-4">Integration Points</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-space-900/50">
            <h4 className="font-medium text-blue-300 mb-2">Graph Kernel</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Input: Slice fingerprint for Echo</li>
              <li>• Output: Admissibility token</li>
              <li>• Role: Provenance enforcement</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50">
            <h4 className="font-medium text-emerald-300 mb-2">RAG++</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Input: Query for pattern matching</li>
              <li>• Output: Similar episodes</li>
              <li>• Role: Echo claim evidence</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50">
            <h4 className="font-medium text-violet-300 mb-2">DELL</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Input: Subscribe to z-trajectory</li>
              <li>• Output: z(t) embeddings</li>
              <li>• Role: Source of all detection</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

// =====================================================
// SECTION 5: CLAIMS IR
// =====================================================

function ClaimsIRSection() {
  const [selectedClaim, setSelectedClaim] = React.useState<ClaimType>('stabilize');
  const claim = CLAIM_TECHNICAL.find((c) => c.type === selectedClaim)!;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
          Typed Intermediate Representation
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold text-emerald-200">
          The 10 Claim Types
        </h2>
        <p className="text-gray-400 max-w-3xl mx-auto">
          Each claim has a unique N'Ko sigil, a typed IR structure, and a canonical surface form.
        </p>
      </div>

      {/* Claim Index Table */}
      <Card className="p-6 border-emerald-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80 overflow-x-auto">
        <h3 className="font-semibold text-emerald-200 mb-4">Claim Type Index</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-amber-500/20">
              <th className="text-left py-2 text-amber-300">#</th>
              <th className="text-left py-2 text-amber-300">Sigil</th>
              <th className="text-left py-2 text-amber-300">Name</th>
              <th className="text-left py-2 text-amber-300">Unicode</th>
              <th className="text-left py-2 text-amber-300">IR Type</th>
              <th className="text-left py-2 text-amber-300">Detection</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {CLAIM_TECHNICAL.map((c) => (
              <tr
                key={c.type}
                className={`border-b border-gray-800 cursor-pointer hover:bg-space-800/50 ${
                  selectedClaim === c.type ? 'bg-emerald-500/10' : ''
                }`}
                onClick={() => setSelectedClaim(c.type)}
              >
                <td className="py-2 font-mono text-gray-500">{c.index}</td>
                <td className="py-2">
                  <span
                    className={`text-2xl ${c.colorClass}`}
                    style={{ fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif" }}
                  >
                    {c.sigil}
                  </span>
                </td>
                <td className={`py-2 font-medium ${c.colorClass}`}>{c.name}</td>
                <td className="py-2 font-mono text-gray-500">{c.unicode}</td>
                <td className="py-2 font-mono text-xs text-amber-300">{c.irType}</td>
                <td className="py-2 font-mono text-xs text-gray-500">{c.formula}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Selected Claim Detail */}
      <Card className="p-6 border-emerald-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <div className="flex items-center gap-4 mb-6">
          <span
            className={`text-5xl ${claim.colorClass}`}
            style={{ fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif" }}
          >
            {claim.sigil}
          </span>
          <div>
            <h3 className={`text-2xl font-bold ${claim.colorClass}`}>
              {claim.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                Index: {claim.index}
              </Badge>
              <Badge variant="outline" className="text-xs font-mono">
                {claim.unicode}
              </Badge>
            </div>
          </div>
        </div>

        {/* Formula */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Detection Formula</h4>
          <code className="block p-3 rounded-lg bg-space-900/50 text-amber-300 font-mono">
            {claim.formula}
          </code>
        </div>

        {/* Canonical Form */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Canonical N'Ko Form</h4>
          <code
            className="block p-3 rounded-lg bg-space-900/50 text-emerald-300 font-mono"
            dir="rtl"
            lang="nqo"
          >
            {claim.canonicalForm}
          </code>
        </div>

        {/* IR Fields */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">IR Structure: {claim.irType}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-500/20">
                  <th className="text-left py-2 text-amber-300">Field</th>
                  <th className="text-left py-2 text-amber-300">Type</th>
                  <th className="text-left py-2 text-amber-300">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {claim.fields.map((field) => (
                  <tr key={field.name} className="border-b border-gray-800">
                    <td className="py-2 font-mono text-violet-300">{field.name}</td>
                    <td className="py-2 font-mono text-xs text-gray-500">{field.type}</td>
                    <td className="py-2 text-gray-400">{field.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Claim Enum */}
      <Card className="p-6 border-emerald-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-emerald-200 mb-4">Unified Claim Enum</h3>
        <CodeBlock
          code={`pub enum Claim {
    Stabilize(StabilizeClaim),
    Disperse(DisperseClaim),
    Transition(TransitionClaim),
    Return(ReturnClaim),
    Dwell(DwellClaim),
    Oscillate(OscillateClaim),
    Recover(RecoverClaim),
    Novel(NovelClaim),
    PlaceShift(PlaceShiftClaim),
    Echo(EchoClaim),
}

impl Claim {
    pub fn sigil(&self) -> char;
    pub fn claim_type(&self) -> ClaimType;
    pub fn id(&self) -> ClaimId;
    pub fn confidence(&self) -> Confidence;
    pub fn time_range(&self) -> (f64, f64);
    pub fn time_window(&self) -> Option<TimeWindow>;
    pub fn instant(&self) -> Option<f64>;
    pub fn place(&self) -> Option<&PlaceClass>;
}`}
          language="rust"
          title="claim_enum.rs"
        />
      </Card>
    </div>
  );
}

// =====================================================
// SECTION 6: BASIN LIFECYCLE
// =====================================================

function BasinLifecycleSection() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
          Hypothesis Management
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold text-pink-200">
          Basin Lifecycle
        </h2>
        <p className="text-gray-400 max-w-3xl mx-auto">
          Basins are <strong>hypotheses the machine bets its consistency on</strong>. Each basin
          has an origin, stability phase, possible refinement, and eventual persistence or retirement.
        </p>
      </div>

      {/* State Machine Diagram - Animated */}
      <Card className="p-6 border-pink-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80 overflow-hidden">
        <h3 className="font-semibold text-pink-200 mb-6 flex items-center gap-2">
          <Workflow className="w-5 h-5" />
          Basin State Machine
          <Badge variant="outline" className="ml-2 text-xs border-pink-500/40 text-pink-300">Interactive</Badge>
        </h3>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-pink-500/5 rounded-xl" />

          <div className="relative border border-pink-500/30 rounded-xl p-6 space-y-6">
            {/* Animated state transition particle */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              <motion.div
                className="absolute w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"
                style={{ top: '120px' }}
                animate={{
                  x: ['20%', '80%'],
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.2, 0.8, 1],
                }}
              />
            </div>

            {/* Main State Flow */}
            <div className="relative grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
              {/* ProtoBasin - Animated */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="p-5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/40 text-center cursor-pointer relative overflow-hidden"
                  whileHover={{ scale: 1.03, borderColor: 'rgba(245, 158, 11, 0.6)' }}
                  animate={{ boxShadow: ['0 0 0px rgba(245,158,11,0)', '0 0 20px rgba(245,158,11,0.2)', '0 0 0px rgba(245,158,11,0)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.div
                    className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-500/40 to-orange-500/40 flex items-center justify-center relative"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-amber-400/20"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    >
                      <CircleDot className="w-6 h-6 text-amber-300" />
                    </motion.div>
                  </motion.div>
                  <div className="font-semibold text-lg text-amber-300">ProtoBasin</div>
                  <div className="text-xs text-gray-400 mt-1">Scratch hypothesis</div>
                  <motion.div
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge variant="outline" className="mt-2 text-[10px] border-amber-500/40 text-amber-300">
                      Unproven
                    </Badge>
                  </motion.div>
                </motion.div>

                {/* Animated Expires path */}
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="flex-1 h-0.5 bg-gradient-to-r from-amber-500/40 to-gray-500/40"
                    animate={{ scaleX: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowDown className="w-4 h-4 text-gray-400" />
                  </motion.div>
                </motion.div>

                {/* Retired (Spurious) - Animated */}
                <motion.div
                  className="p-4 rounded-lg bg-gradient-to-br from-gray-500/15 to-slate-500/15 border border-gray-500/30 text-center cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(107, 114, 128, 0.5)' }}
                >
                  <motion.div
                    className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-500/30 flex items-center justify-center"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Archive className="w-5 h-5 text-gray-400" />
                  </motion.div>
                  <div className="font-medium text-gray-400">Retired</div>
                  <div className="text-[10px] text-gray-500 mt-1">Spurious ⊘ₛ</div>
                </motion.div>
              </motion.div>

              {/* Animated Graduation Arrow */}
              <motion.div
                className="hidden lg:flex flex-col items-center justify-start pt-8 gap-2 relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-center"
                  whileHover={{ scale: 1.1 }}
                  animate={{ boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 15px rgba(16,185,129,0.3)', '0 0 0px rgba(16,185,129,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    className="text-xs font-medium text-emerald-300"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Graduation
                  </motion.div>
                  <div className="text-[10px] text-gray-400">3 signals</div>
                </motion.div>
                <motion.div
                  className="w-16 h-0.5 bg-gradient-to-r from-emerald-500/40 to-emerald-500/60"
                  animate={{ scaleX: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 text-emerald-400" />
                </motion.div>
              </motion.div>

              {/* Basin (Identity) - Animated */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  className="p-5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-violet-500/40 text-center cursor-pointer relative overflow-hidden"
                  whileHover={{ scale: 1.03, borderColor: 'rgba(139, 92, 246, 0.6)' }}
                  animate={{ boxShadow: ['0 0 0px rgba(139,92,246,0)', '0 0 25px rgba(139,92,246,0.2)', '0 0 0px rgba(139,92,246,0)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {/* Background pulse */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="relative w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-violet-500/40 to-purple-500/40 flex items-center justify-center"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-violet-400/20"
                      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Target className="w-6 h-6 text-violet-300" />
                    </motion.div>
                  </motion.div>
                  <div className="relative font-semibold text-lg text-violet-300">Basin</div>
                  <div className="relative text-xs text-gray-400 mt-1">Established identity</div>
                  <Badge variant="outline" className="relative mt-2 text-[10px] border-violet-500/40 text-violet-300">
                    Stable
                  </Badge>
                </motion.div>

                {/* Animated Operations grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Split - Animated */}
                  <motion.div
                    className="p-3 rounded-lg bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-500/30 text-center cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.08, y: -2, borderColor: 'rgba(59, 130, 246, 0.6)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Split className="w-4 h-4 mx-auto mb-1 text-blue-300" />
                    </motion.div>
                    <div className="text-xs font-medium text-blue-300">Split</div>
                    <div className="text-[10px] text-gray-500">→ Children</div>
                  </motion.div>

                  {/* Merge - Animated */}
                  <motion.div
                    className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/15 to-teal-500/15 border border-cyan-500/30 text-center cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.08, y: -2, borderColor: 'rgba(6, 182, 212, 0.6)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    >
                      <Merge className="w-4 h-4 mx-auto mb-1 text-cyan-300" />
                    </motion.div>
                    <div className="text-xs font-medium text-cyan-300">Merge</div>
                    <div className="text-[10px] text-gray-500">→ Parent</div>
                  </motion.div>
                </div>

                {/* Animated Retirement path */}
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.div
                    className="flex-1 h-0.5 bg-gradient-to-r from-violet-500/40 to-pink-500/40"
                    animate={{ scaleX: [0.9, 1.1, 0.9], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowDown className="w-4 h-4 text-pink-400" />
                  </motion.div>
                </motion.div>

                {/* Retired (Real-gone) - Animated */}
                <motion.div
                  className="p-4 rounded-lg bg-gradient-to-br from-pink-500/15 to-rose-500/15 border border-pink-500/30 text-center cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(236, 72, 153, 0.5)' }}
                >
                  <motion.div
                    className="w-10 h-10 mx-auto mb-2 rounded-full bg-pink-500/30 flex items-center justify-center"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  >
                    <Archive className="w-5 h-5 text-pink-400" />
                  </motion.div>
                  <div className="font-medium text-pink-400">Retired</div>
                  <div className="text-[10px] text-gray-400 mt-1">Real-gone ⊘ᵣ / Coord-shift ⊘ᶜ</div>
                </motion.div>
              </motion.div>
            </div>

            {/* Animated Legend */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-pink-500/20">
              {[
                { icon: CircleDot, color: 'amber', label: 'Proto', detail: 'Scratch' },
                { icon: Target, color: 'violet', label: 'Basin', detail: 'Identity' },
                { icon: RefreshCcw, color: 'emerald', label: 'Graduation', detail: '3 signals' },
                { icon: Archive, color: 'pink', label: 'Retired', detail: 'Final state' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="flex items-center gap-2 p-2 bg-space-900/50 rounded-lg cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + i * 0.1 }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(15, 23, 42, 0.7)' }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                  >
                    <item.icon className="w-4 h-4" style={{ color: item.color === 'amber' ? 'rgb(251,191,36)' : item.color === 'violet' ? 'rgb(167,139,250)' : item.color === 'emerald' ? 'rgb(52,211,153)' : 'rgb(244,114,182)' }} />
                  </motion.div>
                  <div>
                    <motion.div
                      className="text-xs font-medium"
                      style={{ color: item.color === 'amber' ? 'rgb(252,211,77)' : item.color === 'violet' ? 'rgb(196,181,253)' : item.color === 'emerald' ? 'rgb(110,231,183)' : 'rgb(244,114,182)' }}
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      {item.label}
                    </motion.div>
                    <div className="text-[10px] text-gray-500">{item.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Graduation Criteria */}
      <Card className="p-6 border-pink-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-pink-200 mb-4">Graduation Criteria</h3>
        <p className="text-gray-400 mb-4 text-sm">
          A proto-basin becomes a basin when it earns <strong>three independent persistence signals</strong>:
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-space-900/50 border-l-2 border-emerald-500">
            <h4 className="font-medium text-emerald-300 mb-2">1. Re-entry</h4>
            <p className="text-sm text-gray-400">
              Return visits across separate sessions/day partitions
            </p>
            <code className="text-xs text-gray-500 mt-2 block">min_return_sessions: 3</code>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50 border-l-2 border-blue-500">
            <h4 className="font-medium text-blue-300 mb-2">2. Low Dispersion</h4>
            <p className="text-sm text-gray-400">
              Internal dispersion vs global ratio
            </p>
            <code className="text-xs text-gray-500 mt-2 block">max_ratio: 0.3</code>
          </div>
          <div className="p-4 rounded-lg bg-space-900/50 border-l-2 border-violet-500">
            <h4 className="font-medium text-violet-300 mb-2">3. Transition Consistency</h4>
            <p className="text-sm text-gray-400">
              Entry/exit pattern consistency
            </p>
            <code className="text-xs text-gray-500 mt-2 block">threshold: 0.7</code>
          </div>
        </div>

        <CodeBlock
          code={`pub struct GraduationCriteria {
    /// 1. Re-entry across separate sessions (minimum 3)
    pub min_return_sessions: usize,

    /// 2. Low internal dispersion vs global (max 0.3 ratio)
    pub max_internal_dispersion_ratio: f64,

    /// 3. Repeatable transition signature (min 0.7 consistency)
    pub transition_consistency_threshold: f64,
}`}
          language="rust"
          title="graduation_criteria.rs"
        />
      </Card>

      {/* Split and Merge Rules */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <h3 className="font-semibold text-amber-200 mb-3">Split Rules</h3>
          <p className="text-sm text-gray-400 mb-3">
            A split is NOT "I realized there are two kinds." It's:
          </p>
          <div className="p-3 rounded-lg bg-space-900/50 border-l-2 border-amber-500">
            <p className="text-sm text-amber-300 italic">
              "The distribution is demonstrably multi-modal in a way that
              <strong> predicts different downstream dynamics</strong>."
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Two subclusters that look different but lead to same transition behavior
            = ornamental complexity, refuse split.
          </p>
        </Card>
        <Card className="p-5 border-violet-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <h3 className="font-semibold text-violet-200 mb-3">Merge Rules</h3>
          <p className="text-sm text-gray-400 mb-3">
            A merge is NOT "these names feel redundant." It's:
          </p>
          <div className="p-3 rounded-lg bg-space-900/50 border-l-2 border-violet-500">
            <p className="text-sm text-violet-300 italic">
              "Two basin keys have become <strong>empirically indistinguishable</strong>
              within measurement resolution."
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Reasons: Sensor coverage changed, contexts abandoned, behavior converged.
          </p>
        </Card>
      </div>

      {/* Retirement Types */}
      <Card className="p-6 border-pink-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-pink-200 mb-4">Retirement Types</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-500/20">
                <th className="text-left py-2 text-amber-300">Type</th>
                <th className="text-left py-2 text-amber-300">Marker</th>
                <th className="text-left py-2 text-amber-300">Meaning</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 font-medium text-gray-400">Spurious</td>
                <td className="py-2 font-mono text-xl">⊘ₛ</td>
                <td className="py-2 text-gray-500">Proto-basin never graduated</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 font-medium text-gray-400">Real-Gone</td>
                <td className="py-2 font-mono text-xl">⊘ᵣ</td>
                <td className="py-2 text-gray-500">Attractor vanished (life changed)</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-gray-400">Coordinate-Shift</td>
                <td className="py-2 font-mono text-xl">⊘ᵥ</td>
                <td className="py-2 text-gray-500">Embedding pipeline changed, old region unrepresentable</td>
              </tr>
            </tbody>
          </table>
        </div>
        <CodeBlock
          code={`pub enum RetirementType {
    /// Never real: proto-basin never graduated
    Spurious { proto_id, reason },

    /// Real but gone: attractor vanished
    RealButGone { basin_id, last_visit, total_dwells },

    /// Coordinate system changed
    CoordinateShift { basin_id, old_version, new_version },
}`}
          language="rust"
          title="retirement_type.rs"
        />
      </Card>

      {/* Lexicon Versioning */}
      <Card className="p-6 border-pink-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-pink-200 mb-4">Lexicon Versioning</h3>
        <p className="text-gray-400 mb-4 text-sm">
          <strong>Core Principle:</strong> No retroactive rewriting. Old inscriptions remain untouched.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-500/20">
                <th className="text-left py-2 text-amber-300">Component</th>
                <th className="text-left py-2 text-amber-300">Stability</th>
                <th className="text-left py-2 text-amber-300">Can Change When</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2">Operator sigils (ߛ, ߜ, ߕ...)</td>
                <td className="py-2 font-medium text-red-400">LOCKED</td>
                <td className="py-2 text-gray-500">Never (breaking change)</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2">Grammar skeletons</td>
                <td className="py-2 font-medium text-amber-400">STABLE</td>
                <td className="py-2 text-gray-500">Rarely (requires migration)</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2">Basin tokens</td>
                <td className="py-2 font-medium text-emerald-400">EVOLVING</td>
                <td className="py-2 text-gray-500">Split/merge/naturalization</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2">Place-class tokens</td>
                <td className="py-2 font-medium text-emerald-400">EVOLVING</td>
                <td className="py-2 text-gray-500">New places discovered</td>
              </tr>
              <tr>
                <td className="py-2">Connective tissue</td>
                <td className="py-2 font-medium text-emerald-400">EVOLVING</td>
                <td className="py-2 text-gray-500">Naturalization improves</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// =====================================================
// SECTION 7: API REFERENCE
// =====================================================

function APIReferenceSection() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
          Integration Guide
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold text-cyan-200">
          API Reference
        </h2>
        <p className="text-gray-400 max-w-3xl mx-auto">
          Full API documentation for integrating with the N'Ko Inscription System.
        </p>
      </div>

      {/* Main Exports */}
      <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-cyan-200 mb-4">Main Exports</h3>
        <CodeBlock
          code={`// Claims
pub use claims::{
    Claim, ClaimId, ClaimType,
    StabilizeClaim, DisperseClaim, TransitionClaim, ReturnClaim,
    DwellClaim, OscillateClaim, RecoverClaim, NovelClaim,
    PlaceShiftClaim, EchoClaim,
    BasinId, ProtoBasinId, PlaceClass, TimeWindow, Confidence,
    DispersionMetric, EntropyMetric, CoupledClaimType, NodeId, Symbol,
};

// Basin lifecycle
pub use basin::{Basin, ProtoBasin, GraduationCriteria, RetirementType};

// Lexicon
pub use lexicon::{Lexicon, LexiconVersion, BasinToken, PlaceToken};

// Surface rendering
pub use surface::{SurfaceRenderer, NKoLine};`}
          language="rust"
          title="lib.rs"
        />
      </Card>

      {/* Core Types */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5 border-cyan-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <h4 className="font-semibold text-cyan-200 mb-3">BasinId</h4>
          <p className="text-sm text-gray-400 mb-3">
            Kernel-level primary key that survives renaming. A 16-byte UUID.
          </p>
          <CodeBlock
            code={`pub struct BasinId(pub [u8; 16]);

impl BasinId {
    pub fn mint() -> Self;
    pub fn to_hex(&self) -> String;
    pub fn short_hex(&self) -> String;
}`}
            language="rust"
          />
        </Card>
        <Card className="p-5 border-cyan-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <h4 className="font-semibold text-cyan-200 mb-3">TimeWindow</h4>
          <p className="text-sm text-gray-400 mb-3">
            Time interval [t0, t1] in seconds since epoch.
          </p>
          <CodeBlock
            code={`pub struct TimeWindow {
    pub t0: f64,
    pub t1: f64,
}

impl TimeWindow {
    pub fn duration(&self) -> f64;
    pub fn midpoint(&self) -> f64;
    pub fn contains(&self, t: f64) -> bool;
}`}
            language="rust"
          />
        </Card>
        <Card className="p-5 border-cyan-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <h4 className="font-semibold text-cyan-200 mb-3">Confidence</h4>
          <p className="text-sm text-gray-400 mb-3">
            Score in [0, 1] indicating claim certainty.
          </p>
          <CodeBlock
            code={`pub struct Confidence(pub f32);

impl Confidence {
    pub fn new(value: f32) -> Self;
    pub fn value(&self) -> f32;
    pub fn is_high(&self) -> bool;  // >= 0.7
    pub fn is_low(&self) -> bool;   // < 0.3
}`}
            language="rust"
          />
        </Card>
        <Card className="p-5 border-cyan-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <h4 className="font-semibold text-cyan-200 mb-3">PlaceClass</h4>
          <p className="text-sm text-gray-400 mb-3">
            Coarse categorical location (not GPS coordinates).
          </p>
          <CodeBlock
            code={`pub struct PlaceClass(pub String);

impl PlaceClass {
    pub fn new(name: impl Into<String>) -> Self;
}

// Examples: "home", "office", "gym", "transit"`}
            language="rust"
          />
        </Card>
      </div>

      {/* Basic Usage */}
      <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-cyan-200 mb-4">Basic Usage</h3>
        <CodeBlock
          code={`use cc_inscription::{
    Claim, StabilizeClaim, TimeWindow, Confidence, PlaceClass,
    DispersionMetric, Lexicon, SurfaceRenderer,
};
use std::sync::Arc;

// Create a stabilization claim
let claim = StabilizeClaim::new(
    TimeWindow::new(100.0, 200.0),
    vec![0, 1, 2],           // Dimensions that contracted
    DispersionMetric::Variance,
    -0.5,                    // Delta (negative = contraction)
    0.5,                     // Magnitude
    Confidence::new(0.85),
    PlaceClass::new("home"),
);

// Render to N'Ko
let lexicon = Arc::new(Lexicon::v1());
let renderer = SurfaceRenderer::new(lexicon);
let line = renderer.render(&Claim::Stabilize(claim));

println!("{}", line.text);
// Output: ߛ ⟦100.0–200.0⟧ : z(σ) ↓ ; home ; c=0.85`}
          language="rust"
          title="basic_usage.rs"
        />
      </Card>

      {/* WebSocket Message Types */}
      <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-cyan-200 mb-4">WebSocket Message Format</h3>
        <CodeBlock
          code={`// Backend message envelope
interface InscriptionWebSocketMessage {
  type: 'inscription';
  timestamp: number;
  data: {
    id: string;
    claim_type: number;     // 0-9 index
    nko_text: string;       // Rendered N'Ko line
    timestamp_ms: number;
    window?: { t0: number; t1: number } | null;
    confidence: number;
    place?: string;
    basin_id?: string;
    provenance: {
      fusion_frame_id: number;
      sensor_frame_ids: number[];
      claim_ir: Record<string, unknown>;
    };
  };
}`}
          language="typescript"
          title="websocket_types.ts"
        />
      </Card>

      {/* Database Schema */}
      <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-cyan-200 mb-4">Database Schema (Supabase)</h3>
        <CodeBlock
          code={`-- nko_inscriptions table
CREATE TABLE nko_inscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  session_id UUID REFERENCES sessions(id),
  claim_type SMALLINT NOT NULL CHECK (claim_type BETWEEN 0 AND 9),
  nko_text TEXT NOT NULL,
  timestamp_ms BIGINT NOT NULL,
  window_t0 REAL,
  window_t1 REAL,
  confidence REAL NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  place TEXT,
  basin_id TEXT,
  fusion_frame_id BIGINT,
  sensor_frame_ids BIGINT[],
  claim_ir JSONB DEFAULT '{}'
);

-- Index for efficient querying
CREATE INDEX idx_inscriptions_session ON nko_inscriptions(session_id);
CREATE INDEX idx_inscriptions_claim_type ON nko_inscriptions(claim_type);
CREATE INDEX idx_inscriptions_created_at ON nko_inscriptions(created_at DESC);`}
          language="sql"
          title="schema.sql"
        />
      </Card>

      {/* Related Documentation */}
      <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <h3 className="font-semibold text-cyan-200 mb-4">Related Documentation</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { name: '00-PROJECT_CHARTER.md', desc: 'Project purpose and goals' },
            { name: '01-GLOSSARY.md', desc: 'Term definitions' },
            { name: '02-INVARIANTS_LEDGER.md', desc: 'System invariants' },
            { name: '03-IMPLEMENTATION_GUIDE.md', desc: 'Implementation details' },
            { name: 'DESIGN.md', desc: 'Complete design document' },
            { name: 'lexicons/v1.0.json', desc: 'Initial lexicon schema' },
          ].map((doc) => (
            <div key={doc.name} className="flex items-center gap-3 p-3 rounded-lg bg-space-900/50">
              <FileCode className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <code className="text-sm text-amber-300">{doc.name}</code>
                <p className="text-xs text-gray-500">{doc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// =====================================================
// SECTION 8: GLOSSARY
// =====================================================

interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'core' | 'mathematical' | 'nko' | 'system' | 'claim' | 'architecture';
  aliases?: string[];
  relatedTerms?: string[];
  formula?: string;
  nkoRepresentation?: string;
  codeReference?: string;
  boundTo?: string[];
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  // ===== CORE CONCEPTS =====
  {
    term: 'DELL',
    definition: 'Dual-Equilibrium Latent Learning. A neural architecture that processes motion data through two parallel equilibrium networks operating at different timescales (fast ~60Hz, slow ~2.5Hz), coordinated by a gating network that produces z-trajectory embeddings.',
    category: 'core',
    aliases: ['Dual-Equilibrium', 'DELL Architecture'],
    relatedTerms: ['Fast Equilibrium', 'Slow Equilibrium', 'Coordinator', 'z-trajectory'],
    boundTo: ['Motion Input', 'z-trajectory', 'Claim Detection'],
  },
  {
    term: 'Basin',
    definition: 'A stable attractor state in z-space representing a recurring pattern of embodied behavior. Basins are discovered through repeated visits and assigned unique N\'Ko tokens. They form the vocabulary of the inscription lexicon.',
    category: 'core',
    aliases: ['Attractor Basin', 'z-Basin'],
    relatedTerms: ['ProtoBasin', 'Lexicon', 'z-space', 'Basin Lifecycle'],
    nkoRepresentation: 'Unique N\'Ko token (e.g., ߊ, ߋ, ߌ)',
    boundTo: ['Lexicon', 'ProtoBasin', 'Visit Count', 'Semantic Label'],
  },
  {
    term: 'Claim',
    definition: 'A typed assertion about embodied dynamics detected by one of 10 specialized detectors. Each claim has a canonical N\'Ko form and is backed by cryptographic provenance linking it to source sensor data.',
    category: 'core',
    aliases: ['Inscription Claim', 'ClaimIR'],
    relatedTerms: ['ClaimDetector', 'Inscription', 'Provenance', 'Sigil'],
    boundTo: ['ClaimType (0-9)', 'N\'Ko Sigil', 'TimeWindow', 'Confidence'],
  },
  {
    term: 'Inscription',
    definition: 'A complete N\'Ko text statement generated from a detected claim. Inscriptions are the primary output of the system, combining sigil, time window, claim-specific data, and confidence into a canonical RTL Unicode string.',
    category: 'core',
    aliases: ['N\'Ko Inscription', 'InscriptionRecord'],
    relatedTerms: ['Claim', 'Sigil', 'Provenance', 'nkoText'],
    nkoRepresentation: 'e.g., ߛ ⟦100.0–200.0⟧ : z(σ) ↓ ; home ; c=0.85',
    boundTo: ['ClaimType', 'TimeWindow', 'Confidence', 'Place', 'Provenance'],
  },
  {
    term: 'z-trajectory',
    definition: 'The 16-dimensional latent embedding produced by the DELL coordinator network. It represents the current semantic state of embodied movement, integrating both fast (reactive) and slow (deliberative) processing.',
    category: 'core',
    aliases: ['z_t', 'Latent Trajectory', 'Coordinator Output'],
    relatedTerms: ['DELL', 'Coordinator', 'Claim Detection'],
    formula: 'z_t = σ(W_F h^F_t + W_S h^S_t + W_c c_t + b)',
    boundTo: ['Fast Hidden State (h^F)', 'Slow Hidden State (h^S)', 'Anticipation Scalars (c)'],
  },
  {
    term: 'Lexicon',
    definition: 'The versioned vocabulary of all known basins, mapping basin IDs to N\'Ko tokens. The lexicon grows as new basins are discovered and is stored with full version history for reproducibility.',
    category: 'core',
    aliases: ['Basin Lexicon', 'N\'Ko Vocabulary'],
    relatedTerms: ['Basin', 'ProtoBasin', 'Semantic Label'],
    codeReference: 'lexicons/v1.0.json',
    boundTo: ['Basin ID', 'N\'Ko Token', 'Visit Count', 'Discovery Timestamp'],
  },
  {
    term: 'ProtoBasin',
    definition: 'A candidate basin that has been detected but not yet graduated to full basin status. ProtoBasins require multiple visits (typically 3+) before promotion to ensure stability.',
    category: 'core',
    relatedTerms: ['Basin', 'Graduation', 'Visit Threshold'],
    boundTo: ['Centroid', 'Visit Count', 'First Seen', 'Radius Estimate'],
  },

  // ===== MATHEMATICAL CONCEPTS =====
  {
    term: 'Fast Equilibrium',
    definition: 'The high-frequency equilibrium network in DELL (h^F_t), processing motion at 60Hz with ~100-200ms latency. Handles reflexive motor control and immediate responses.',
    category: 'mathematical',
    aliases: ['h^F_t', 'Fast Process', 'Cerebellar Loop'],
    formula: 'h^F_{t+1} = (1 - α_F) h^F_t + α_F · f_F(x_t, z_t; θ_F)',
    relatedTerms: ['DELL', 'Slow Equilibrium', 'α_F'],
    boundTo: ['α_F = Δt / τ_F ≈ 1.0', 'Motion Input (x_t)', 'Coordinator (z_t)'],
  },
  {
    term: 'Slow Equilibrium',
    definition: 'The low-frequency equilibrium network in DELL (h^S_t), processing temporally-averaged motion at 2.5Hz with ~500ms-2s latency. Handles planning, creativity, and style.',
    category: 'mathematical',
    aliases: ['h^S_t', 'Slow Process', 'Prefrontal Loop'],
    formula: 'h^S_{t+1} = (1 - α_S) h^S_t + α_S · f_S(x̄_t, z_t; θ_S)',
    relatedTerms: ['DELL', 'Fast Equilibrium', 'α_S', 'Temporal Average'],
    boundTo: ['α_S ≈ 0.042', 'Temporal Average (x̄_t, 400ms window)', 'Coordinator (z_t)'],
  },
  {
    term: 'Coordinator',
    definition: 'The gating network in DELL that combines fast and slow equilibrium states with anticipation scalars to produce the z-trajectory embedding.',
    category: 'mathematical',
    aliases: ['Gating Network', 'z-Generator'],
    formula: 'z_t = σ(W_F h^F_t + W_S h^S_t + W_c c_t + b)',
    relatedTerms: ['z-trajectory', 'Anticipation Scalars', 'DELL'],
    boundTo: ['Fast State (h^F)', 'Slow State (h^S)', 'Scalars (c)', 'Weights (W_F, W_S, W_c)'],
  },
  {
    term: 'Anticipation Scalars',
    definition: 'Scalar values (c_t) fed into the coordinator representing meta-cognitive signals: commitment level, uncertainty, confidence bounds. These bias the z-trajectory without learning.',
    category: 'mathematical',
    aliases: ['c_t', 'Meta-Scalars', 'Commitment Signals'],
    relatedTerms: ['Coordinator', 'z-trajectory'],
    boundTo: ['Commitment (0-1)', 'Uncertainty (0-1)', 'Confidence Bounds'],
  },
  {
    term: 'TimeWindow',
    definition: 'A pair of timestamps (t0, t1) in milliseconds defining the interval over which a claim was detected. Instant claims (novel, placeShift) have null windows.',
    category: 'mathematical',
    aliases: ['[t0, t1]', 'Detection Window'],
    formula: 't0 ≤ t ≤ t1 (in ms relative to session start)',
    relatedTerms: ['Claim', 'Inscription'],
    boundTo: ['t0 (start)', 't1 (end)', 'Duration = t1 - t0'],
  },
  {
    term: 'Variance (σ)',
    definition: 'The statistical variance of the z-trajectory over a time window. Used to detect stabilize/disperse claims by measuring whether embodied dynamics are converging or expanding.',
    category: 'mathematical',
    aliases: ['z(σ)', 'z-variance', 'Trajectory Variance'],
    formula: 'σ = Var(z_{t-k:t}) over window',
    relatedTerms: ['Stabilize', 'Disperse', 'z-trajectory'],
    boundTo: ['Delta (Δσ)', 'Threshold (θ_σ)', 'Window Size (k)'],
  },
  {
    term: 'Delta (Δ)',
    definition: 'The signed change in variance between consecutive detection windows. Negative delta indicates stabilization; positive indicates dispersion.',
    category: 'mathematical',
    aliases: ['Δσ', 'Variance Delta'],
    formula: 'Δ = σ(t) - σ(t-k)',
    relatedTerms: ['Variance', 'Stabilize', 'Disperse'],
    boundTo: ['Threshold for claim detection'],
  },

  // ===== N'KO SPECIFIC =====
  {
    term: 'Sigil',
    definition: 'The N\'Ko Unicode character that begins each inscription, identifying the claim type. There are 10 sigils corresponding to the 10 claim types.',
    category: 'nko',
    aliases: ['Claim Sigil', 'N\'Ko Prefix'],
    relatedTerms: ['ClaimType', 'Inscription'],
    nkoRepresentation: 'ߛ (stabilize), ߜ (disperse), ߕ (transition), ߙ (return), ߡ (dwell), ߚ (oscillate), ߞ (recover), ߣ (novel), ߠ (placeShift), ߥ (echo)',
    boundTo: ['ClaimType Index (0-9)', 'Unicode Codepoint'],
  },
  {
    term: 'RTL',
    definition: 'Right-to-Left. N\'Ko script is written and read from right to left, like Arabic and Hebrew. All inscriptions are rendered in RTL Unicode.',
    category: 'nko',
    aliases: ['Right-to-Left', 'dir="rtl"'],
    relatedTerms: ['Inscription', 'Unicode'],
    boundTo: ['HTML dir attribute', 'Unicode BiDi algorithm'],
  },
  {
    term: 'Canonical Form',
    definition: 'The standardized format for rendering each claim type as an N\'Ko inscription. Each claim type has a specific canonical form that determines field order and formatting.',
    category: 'nko',
    aliases: ['Inscription Format', 'nkoText Format'],
    relatedTerms: ['Inscription', 'ClaimType', 'Sigil'],
    nkoRepresentation: 'e.g., ⟦sigil⟧ ⟦window⟧ : ⟦claim-data⟧ ; ⟦place⟧ ; c=⟦conf⟧',
    boundTo: ['Sigil', 'TimeWindow', 'Claim Fields', 'Place', 'Confidence'],
  },
  {
    term: 'Unicode Range',
    definition: 'N\'Ko characters occupy Unicode range U+07C0 to U+07FF. The sigils use specific codepoints within this range.',
    category: 'nko',
    aliases: ['N\'Ko Unicode Block'],
    relatedTerms: ['Sigil', 'RTL'],
    boundTo: ['U+07C0-07FF', 'Font Support (Geeza Pro, Al Nile)'],
  },

  // ===== CLAIM TYPES =====
  {
    term: 'Stabilize',
    definition: 'Claim type 0. Detected when z-trajectory variance decreases below threshold, indicating embodied dynamics are settling into a stable pattern.',
    category: 'claim',
    aliases: ['stabilize', 'Variance Decrease'],
    formula: 'Δσ < -θ_stabilize',
    nkoRepresentation: 'ߛ ⟦t0–t1⟧ : z(σ) ↓ Δ=⟦δ⟧ ; ⟦P⟧ ; c=⟦conf⟧',
    relatedTerms: ['Disperse', 'Variance', 'Dwell'],
    boundTo: ['Index: 0', 'Sigil: ߛ (U+07DB)', 'IR: StabilizeClaim'],
  },
  {
    term: 'Disperse',
    definition: 'Claim type 1. Detected when z-trajectory variance increases above threshold, indicating embodied dynamics are expanding into exploration.',
    category: 'claim',
    aliases: ['disperse', 'Variance Increase'],
    formula: 'Δσ > +θ_disperse',
    nkoRepresentation: 'ߜ ⟦t0–t1⟧ : z(σ) ↑ Δ=⟦δ⟧ ; ⟦P⟧ ; c=⟦conf⟧',
    relatedTerms: ['Stabilize', 'Variance', 'Oscillate'],
    boundTo: ['Index: 1', 'Sigil: ߜ (U+07DC)', 'IR: DisperseClaim'],
  },
  {
    term: 'Transition',
    definition: 'Claim type 2. Detected when semantic place changes, indicating movement between distinct activity contexts.',
    category: 'claim',
    aliases: ['transition', 'Place Change'],
    formula: 'place(t) ≠ place(t-1)',
    nkoRepresentation: 'ߕ ⟦t*⟧ : ⟦P_from⟧ → ⟦P_to⟧ ; c=⟦conf⟧',
    relatedTerms: ['Place', 'PlaceShift', 'Return'],
    boundTo: ['Index: 2', 'Sigil: ߕ (U+07D5)', 'IR: TransitionClaim'],
  },
  {
    term: 'Return',
    definition: 'Claim type 3. Detected when z-trajectory returns to a previously visited basin, indicating revisitation of a known stable state.',
    category: 'claim',
    aliases: ['return', 'Basin Revisit'],
    formula: 'd(z_t, centroid_B) < radius_B for known basin B',
    nkoRepresentation: 'ߙ ⟦t*⟧ : ↩ ⟦B#⟧ ; visits=⟦n⟧ ; c=⟦conf⟧',
    relatedTerms: ['Basin', 'Novel', 'Dwell'],
    boundTo: ['Index: 3', 'Sigil: ߙ (U+07D9)', 'IR: ReturnClaim'],
  },
  {
    term: 'Dwell',
    definition: 'Claim type 4. Detected when z-trajectory variance remains low for an extended period, indicating sustained stability.',
    category: 'claim',
    aliases: ['dwell', 'Extended Stability'],
    formula: 'σ(z_{t-k:t}) < θ_dwell for duration > τ_dwell',
    nkoRepresentation: 'ߡ ⟦t0–t1⟧ : ∂σ/∂t ≈ 0 ; dur=⟦Δt⟧ms ; ⟦P⟧ ; c=⟦conf⟧',
    relatedTerms: ['Stabilize', 'Basin', 'Variance'],
    boundTo: ['Index: 4', 'Sigil: ߡ (U+07E1)', 'IR: DwellClaim'],
  },
  {
    term: 'Oscillate',
    definition: 'Claim type 5. Detected when z-trajectory variance shows periodic changes, indicating rhythmic or cyclical patterns in movement.',
    category: 'claim',
    aliases: ['oscillate', 'Rhythmic Pattern'],
    formula: 'FFT(σ(z)) shows dominant frequency f > f_min',
    nkoRepresentation: 'ߚ ⟦t0–t1⟧ : ~⟦f⟧Hz ; amp=⟦a⟧ ; cycles=⟦n⟧ ; c=⟦conf⟧',
    relatedTerms: ['Variance', 'Disperse', 'Echo'],
    boundTo: ['Index: 5', 'Sigil: ߚ (U+07DA)', 'IR: OscillateClaim'],
  },
  {
    term: 'Recover',
    definition: 'Claim type 6. Detected when z-trajectory variance decreases after a spike, indicating return to equilibrium after perturbation.',
    category: 'claim',
    aliases: ['recover', 'Spike Recovery'],
    formula: 'σ(t) < σ(t-k) after σ(t-k) > θ_spike',
    nkoRepresentation: 'ߞ ⟦t0–t1⟧ : σ ↓↓ from=⟦peak⟧ ; Δt=⟦recovery_time⟧ ; c=⟦conf⟧',
    relatedTerms: ['Stabilize', 'Disperse', 'Variance'],
    boundTo: ['Index: 6', 'Sigil: ߞ (U+07DE)', 'IR: RecoverClaim'],
  },
  {
    term: 'Novel',
    definition: 'Claim type 7. Detected when z-trajectory enters a region with no known basin, indicating discovery of a new pattern.',
    category: 'claim',
    aliases: ['novel', 'New Basin Discovery'],
    formula: 'd(z_t, nearest_basin) > θ_novelty',
    nkoRepresentation: 'ߣ ⟦t*⟧ : ★ ⟦B_new⟧ ; nearest=⟦B_near#⟧,d=⟦dist⟧ ; c=⟦conf⟧',
    relatedTerms: ['Basin', 'ProtoBasin', 'Return'],
    boundTo: ['Index: 7', 'Sigil: ߣ (U+07E3)', 'IR: NovelClaim'],
  },
  {
    term: 'PlaceShift',
    definition: 'Claim type 8. Detected on first visit to a new semantic place, indicating spatial novelty in activity context.',
    category: 'claim',
    aliases: ['placeShift', 'New Place Discovery'],
    formula: 'place(t) ∉ PlaceHistory',
    nkoRepresentation: 'ߠ ⟦t*⟧ : ⟦P_from⟧ → ⟦P_to⟧ ; ↪ ⟦coupled_claim⟧ ; c=⟦conf⟧',
    relatedTerms: ['Place', 'Transition', 'Novel'],
    boundTo: ['Index: 8', 'Sigil: ߠ (U+07E0)', 'IR: PlaceShiftClaim'],
  },
  {
    term: 'Echo',
    definition: 'Claim type 9. Detected when current claim pattern is similar to a recent claim, indicating repetition or reinforcement.',
    category: 'claim',
    aliases: ['echo', 'Pattern Repetition'],
    formula: 'sim(claim_t, claim_{t-k}) > θ_echo',
    nkoRepresentation: 'ߥ ⟦t0–t1⟧ : ≈ ⟦E#⟧ ; sim=⟦similarity⟧ ; refs=⟦n⟧ ; c=⟦conf⟧',
    relatedTerms: ['Oscillate', 'Return', 'Similarity'],
    boundTo: ['Index: 9', 'Sigil: ߥ (U+07E5)', 'IR: EchoClaim'],
  },

  // ===== SYSTEM COMPONENTS =====
  {
    term: 'ClaimDetector',
    definition: 'One of 10 specialized detector modules that analyze z-trajectory to detect specific claim patterns. Detectors run at 6Hz (every 10 frames at 60fps).',
    category: 'system',
    aliases: ['Detector', 'Claim Detector Module'],
    relatedTerms: ['Claim', 'z-trajectory', 'Detection Rate'],
    codeReference: 'fusion_bridge.rs::ClaimDetector',
    boundTo: ['Detection Frequency: 6Hz', '10 Detector Types', 'Confidence Threshold'],
  },
  {
    term: 'Fusion Loop',
    definition: 'The 60Hz processing loop that receives sensor data, runs DELL encoding, and outputs z-trajectory frames. The core real-time processing pipeline.',
    category: 'system',
    aliases: ['FusionLoop', 'Main Loop'],
    relatedTerms: ['DELL', 'Sensor Receiver', 'z-trajectory'],
    codeReference: 'fusion_loop.rs',
    boundTo: ['60Hz Rate', 'Sensor Input', 'z-trajectory Output'],
  },
  {
    term: 'Sensor Receiver',
    definition: 'Module that receives motion data from mocopi suit at 60Hz. Handles deserialization and queuing of sensor frames for the fusion loop.',
    category: 'system',
    aliases: ['SensorReceiver', 'Motion Input'],
    relatedTerms: ['Fusion Loop', 'Motion Sensors'],
    codeReference: 'sensor_receiver.rs',
    boundTo: ['WebSocket Connection', 'Frame Buffer', 'Timestamp Alignment'],
  },
  {
    term: 'Provenance',
    definition: 'The cryptographic chain of evidence linking an inscription back to its source sensor data. Includes fusion frame ID, sensor frame IDs, and typed intermediate representation.',
    category: 'system',
    aliases: ['InscriptionProvenance', 'Evidence Chain'],
    relatedTerms: ['Inscription', 'Fusion Loop', 'ClaimIR'],
    codeReference: 'types.ts::InscriptionProvenance',
    boundTo: ['Fusion Frame ID', 'Sensor Frame IDs[]', 'Claim IR'],
  },
  {
    term: 'Place',
    definition: 'A semantic location or activity context derived from sensor data (e.g., "home", "studio", "transit"). Places provide spatial grounding for claims.',
    category: 'system',
    aliases: ['Semantic Place', 'PlaceClass'],
    relatedTerms: ['Transition', 'PlaceShift', 'Place History'],
    boundTo: ['Place Label', 'GPS/Context', 'Place History Set'],
  },
  {
    term: 'Graph Kernel',
    definition: 'The deterministic algorithm for slicing claim context into directed acyclic graphs (DAGs). Ensures reproducible context retrieval for any inscription.',
    category: 'system',
    aliases: ['Context Kernel', 'DAG Slicer'],
    relatedTerms: ['Slice', 'DAG', 'Context Window'],
    codeReference: 'cc-graph-kernel',
    boundTo: ['Node Limit', 'Time Window', 'Deterministic Hash'],
  },
  {
    term: 'Slice',
    definition: 'A DAG-structured subset of the z-trajectory context around a claim. Slices are deterministically reproducible given the same input parameters.',
    category: 'system',
    aliases: ['Context Slice', 'DAG Slice'],
    relatedTerms: ['Graph Kernel', 'DAG', 'Claim'],
    boundTo: ['Slice ID', 'Root Node', 'Node Set', 'Edge Set'],
  },

  // ===== ARCHITECTURE =====
  {
    term: 'Typed IR',
    definition: 'Typed Intermediate Representation. The structured data format between raw z-trajectory and final N\'Ko text. Each claim type has a specific IR schema.',
    category: 'architecture',
    aliases: ['ClaimIR', 'Intermediate Representation'],
    relatedTerms: ['Claim', 'Inscription', 'Provenance'],
    boundTo: ['Type-specific fields', 'JSON serialization', 'Validation schema'],
  },
  {
    term: 'Detection Pipeline',
    definition: 'The full processing chain from motion sensors to inscriptions: Sensors → Fusion → DELL → z-trajectory → ClaimDetectors → IR → N\'Ko Render.',
    category: 'architecture',
    aliases: ['Inscription Pipeline', 'Processing Pipeline'],
    relatedTerms: ['Fusion Loop', 'ClaimDetector', 'Inscription'],
    boundTo: ['7 Pipeline Stages', 'Real-time Processing', 'Provenance Chain'],
  },
  {
    term: 'Basin Lifecycle',
    definition: 'The state machine governing basin evolution: Detection → ProtoBasin → Graduation → Basin. Includes operations like Split and Merge.',
    category: 'architecture',
    relatedTerms: ['Basin', 'ProtoBasin', 'Graduation'],
    boundTo: ['Visit Threshold (3+)', 'Split/Merge Operations', 'Semantic Labeling'],
  },
  {
    term: 'Lexicon Versioning',
    definition: 'The system for tracking lexicon evolution over time. Each change (new basin, split, merge) creates a new version, enabling historical reproducibility.',
    category: 'architecture',
    relatedTerms: ['Lexicon', 'Basin', 'Version History'],
    codeReference: 'lexicons/v1.0.json',
    boundTo: ['Version ID', 'Changelog', 'Backwards Compatibility'],
  },
  {
    term: 'Supabase',
    definition: 'The cloud database backend storing inscriptions, basins, and sessions. Provides real-time subscriptions for live inscription streaming.',
    category: 'architecture',
    aliases: ['Database', 'Cloud Backend'],
    relatedTerms: ['Inscription', 'Basin', 'Real-time'],
    boundTo: ['nko_inscriptions table', 'nko_basins table', 'Real-time subscriptions'],
  },
  {
    term: 'WebSocket',
    definition: 'The real-time communication protocol used for both sensor input (mocopi → backend) and inscription output (backend → frontend).',
    category: 'architecture',
    relatedTerms: ['Sensor Receiver', 'Real-time', 'Streaming'],
    boundTo: ['ws://136.114.76.114:8765', 'Message Envelope', 'Binary Frames'],
  },
];

const CATEGORY_CONFIG: Record<GlossaryTerm['category'], { label: string; color: string; bgColor: string; borderColor: string }> = {
  core: { label: 'Core Concept', color: 'text-amber-300', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  mathematical: { label: 'Mathematical', color: 'text-blue-300', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  nko: { label: 'N\'Ko Specific', color: 'text-purple-300', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  claim: { label: 'Claim Type', color: 'text-orange-300', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
  system: { label: 'System Component', color: 'text-emerald-300', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  architecture: { label: 'Architecture', color: 'text-pink-300', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30' },
};

function GlossarySection() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<GlossaryTerm['category'] | 'all'>('all');
  const [expandedTerms, setExpandedTerms] = React.useState<Set<string>>(new Set());

  const filteredTerms = React.useMemo(() => {
    return GLOSSARY_TERMS.filter((term) => {
      const matchesSearch = searchQuery === '' ||
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.aliases?.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toggleTerm = (term: string) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(term)) {
        next.delete(term);
      } else {
        next.add(term);
      }
      return next;
    });
  };

  const categories = ['all', 'core', 'mathematical', 'nko', 'claim', 'system', 'architecture'] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          Reference Documentation
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
          System Glossary
        </h1>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          Comprehensive reference of all terms, concepts, and associations in the N'Ko Inscription System.
          Each term includes its definition, relationships, and technical bindings.
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search terms, definitions, aliases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-space-900/80 border border-amber-500/20 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-space-800/50 text-gray-400 border border-space-700/50 hover:text-amber-300 hover:border-amber-500/30'
                }`}
              >
                {cat === 'all' ? 'All' : CATEGORY_CONFIG[cat].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredTerms.length} of {GLOSSARY_TERMS.length} terms
        </div>
      </Card>

      {/* Glossary Terms */}
      <div className="space-y-4">
        {filteredTerms.map((term) => {
          const config = CATEGORY_CONFIG[term.category];
          const isExpanded = expandedTerms.has(term.term);

          return (
            <motion.div
              key={term.term}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`border ${config.borderColor} ${config.bgColor} overflow-hidden`}>
                {/* Header - Always visible */}
                <button
                  onClick={() => toggleTerm(term.term)}
                  className="w-full p-6 text-left flex items-start gap-4 hover:bg-space-800/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-xl font-bold ${config.color}`}>{term.term}</h3>
                      <Badge variant="outline" className={`text-xs ${config.color} border-current`}>
                        {config.label}
                      </Badge>
                      {term.nkoRepresentation && (
                        <span
                          className="text-lg text-amber-400"
                          style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
                          dir="rtl"
                        >
                          {term.nkoRepresentation.split(',')[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 leading-relaxed">{term.definition}</p>

                    {/* Aliases - inline */}
                    {term.aliases && term.aliases.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">Also known as:</span>
                        {term.aliases.map((alias) => (
                          <span key={alias} className="text-xs text-gray-400 bg-space-800/50 px-2 py-0.5 rounded">
                            {alias}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-space-700/50 space-y-4">
                        {/* Formula */}
                        {term.formula && (
                          <div className="p-4 rounded-lg bg-space-900/60 border border-space-700/50">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Formula / Condition</h4>
                            <code className="text-emerald-300 font-mono text-sm">{term.formula}</code>
                          </div>
                        )}

                        {/* N'Ko Representation */}
                        {term.nkoRepresentation && (
                          <div className="p-4 rounded-lg bg-space-900/60 border border-space-700/50">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">N'Ko Representation</h4>
                            <div
                              className="text-amber-300 font-mono text-sm"
                              style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
                              dir="rtl"
                            >
                              {term.nkoRepresentation}
                            </div>
                          </div>
                        )}

                        {/* Bound To */}
                        {term.boundTo && term.boundTo.length > 0 && (
                          <div className="p-4 rounded-lg bg-space-900/60 border border-amber-500/20">
                            <h4 className="text-sm font-semibold text-amber-400 uppercase mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Bound To / Associations
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {term.boundTo.map((binding) => (
                                <span key={binding} className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
                                  {binding}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Related Terms */}
                        {term.relatedTerms && term.relatedTerms.length > 0 && (
                          <div className="p-4 rounded-lg bg-space-900/60 border border-space-700/50">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
                              <Network className="w-4 h-4" />
                              Related Terms
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {term.relatedTerms.map((related) => (
                                <button
                                  key={related}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchQuery(related);
                                    setSelectedCategory('all');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-space-800/80 border border-space-600/50 text-gray-300 text-sm hover:border-amber-500/30 hover:text-amber-300 transition-colors"
                                >
                                  {related}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Code Reference */}
                        {term.codeReference && (
                          <div className="p-4 rounded-lg bg-space-900/60 border border-space-700/50">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2 flex items-center gap-2">
                              <FileCode className="w-4 h-4" />
                              Code Reference
                            </h4>
                            <code className="text-pink-300 font-mono text-sm">{term.codeReference}</code>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredTerms.length === 0 && (
        <Card className="p-12 text-center border-gray-700/50 bg-space-900/50">
          <p className="text-gray-400 text-lg">No terms found matching your search.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 text-amber-400 hover:text-amber-300 transition-colors"
          >
            Clear filters
          </button>
        </Card>
      )}

      {/* Quick Reference Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {/* Sigil Quick Reference */}
        <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <h3 className="font-semibold text-amber-300 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Sigil Quick Reference
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(CLAIM_SIGILS).map(([type, sigil]) => (
              <div key={type} className="text-center p-2 rounded-lg bg-space-900/60 border border-space-700/50">
                <div
                  className="text-2xl text-amber-400 mb-1"
                  style={{ fontFamily: "'Geeza Pro', 'Al Nile', serif" }}
                >
                  {sigil}
                </div>
                <div className="text-[10px] text-gray-500 truncate">{type}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Statistics */}
        <Card className="p-6 border-purple-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <h3 className="font-semibold text-purple-300 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Term Categories
          </h3>
          <div className="space-y-2">
            {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
              const count = GLOSSARY_TERMS.filter(t => t.category === cat).length;
              return (
                <div key={cat} className="flex items-center justify-between">
                  <span className={`text-sm ${config.color}`}>{config.label}</span>
                  <Badge variant="outline" className="text-xs text-gray-400">{count}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Key Associations */}
        <Card className="p-6 border-emerald-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
          <h3 className="font-semibold text-emerald-300 mb-4 flex items-center gap-2">
            <Network className="w-5 h-5" />
            Key Data Flow
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              Motion → DELL → z-trajectory
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              z-trajectory → Detectors → Claims
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              Claims → IR → N'Ko Inscription
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              Basin → Lexicon → Semantic Label
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// =====================================================
// MAIN PAGE COMPONENT
// =====================================================

export default function TechnicalPage() {
  const [currentSection, setCurrentSection] = React.useState<Section>('overview');

  const goToSection = (section: Section) => {
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-space-950">
      {/* Cosmic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-space-950 via-space-900 to-space-950" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.08),transparent_40%)]" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.06),transparent_40%)]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/15 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <Link
            href="/claims"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Claims Reference</span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-gray-400">
              v1.0.0
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
              Production
            </Badge>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="inline-flex bg-space-800/50 rounded-lg p-1 min-w-full sm:min-w-0">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === currentSection;
              return (
                <button
                  key={section.id}
                  onClick={() => goToSection(section.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-all ${
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

        {/* Section Content */}
        <div className="animate-in fade-in duration-500">
          {currentSection === 'overview' && <OverviewSection />}
          {currentSection === 'dell' && <DELLSection />}
          {currentSection === 'kernel' && <GraphKernelSection />}
          {currentSection === 'inscription' && <InscriptionPipelineSection />}
          {currentSection === 'claims' && <ClaimsIRSection />}
          {currentSection === 'basin' && <BasinLifecycleSection />}
          {currentSection === 'api' && <APIReferenceSection />}
          {currentSection === 'glossary' && <GlossarySection />}
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-6 border-t border-amber-500/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm"
            >
              <Activity className="w-4 h-4" />
              View Live Inscriptions
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/nip"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm"
              >
                <Shield className="w-4 h-4" />
                NIP Docs
              </Link>
              <Link
                href="/claims"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Claims Reference
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
