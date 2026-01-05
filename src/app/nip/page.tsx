/**
 * N'Ko Improvement Proposals (NIP) Documentation Page
 *
 * Constitutional framework for the N'Ko Inscription System.
 * Displays the full markdown documentation for each NIP.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Activity,
  Code,
  BookOpen,
  Shield,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Full NIP content embedded for elegant rendering
const NIP_CONTENT: Record<string, { title: string; status: string; type: string; content: string }> = {
  'NIP-0001': {
    title: 'Core Charter for the N\'Ko Inscription System',
    status: 'Constitutional',
    type: 'Protocol Charter / Epistemic Law',
    content: `## 0. Definitions and Normative Keywords

### 0.1 Normative language

* **MUST / MUST NOT / REQUIRED** indicate non-negotiable constraints for compliance.
* **SHOULD / SHOULD NOT** indicate strong defaults; deviations require explicit justification and tests.
* **MAY / OPTIONAL** indicate permissible extensions.

### 0.2 Primitive objects

* **Claim**: a typed assertion produced by a detector from admissible evidence, parameterized by time, basis, and measurable quantities.
* **Evidence**: a sum-typed provenance input to a claim: \`Graph | Sensor | Hybrid\`, each with a digest that is cryptographically committed.
* **Surface**: a N'Ko canonical text form produced by a renderer using a lexicon version and grammar skeleton.
* **Inscription**: a tuple \`(Claim, Evidence, Basis, Lexicon, Surface)\` committed to an \`InscriptionId\`.
* **InscriptionId**: a cryptographic commitment computed from canonical serialization of the above tuple.
* **Slice**: a kernel-governed admissibility boundary determining which graph nodes are allowed to influence a computation.
* **Ontology**: the evolving set of basin identities, their constitutions, and the lexicon mapping used to render them.
* **Derived view**: a transformation that produces a new interpretation layer over immutable inscriptions without rewriting them.

---

## 1. Mission and Non-Goals

### 1.1 Mission

The system exists to produce **replayable, justified, bounded** inscriptions from embodied dynamics, rendered in a controlled N'Ko technical register, with **cryptographic provenance** and **audit-grade determinism**.

### 1.2 Non-goals (explicitly disallowed as defining purposes)

* Producing fluent natural language N'Ko as a primary objective.
* Maximizing expressiveness at the expense of determinism.
* Retrofitting meaning into old inscriptions by rewriting their bodies or IDs.
* Allowing retrieval systems to "decide ontology" rather than measure.

---

## 2. The Constitutional Object: An Inscription

### 2.1 What an inscription is

An inscription is a **verifiable computation**. It is not a story, a label, a vibe, or a human summary.

Compliance requirements:

* An inscription **MUST** be generated from **typed evidence** and **typed time**.
* An inscription **MUST** be renderable into a **canonical surface form** used for hashing and verification, and an optional **display surface form** used for UI safety.
* An inscription **MUST** include or reference: the evidence digest(s), the slice fingerprint, the coordinate basis identifier, the lexicon bundle hash, the detector configuration hash, and the surface hash of canonical text.

### 2.2 What an inscription is not

* It **MUST NOT** exist without evidence digests.
* It **MUST NOT** be mutable in storage once published.
* It **MUST NOT** depend on ambient state for recomputation.

---

## 3. Fundamental Law: Replayability

### 3.1 The Replayability Law (normative)

For any inscription with identifier \`id\`, there exists a **witnessable replay procedure** such that:

* Inputs required for replay **MUST** be sufficient to re-run evidence acquisition, claim detection, canonical surface rendering, and \`InscriptionId\` recomputation.
* The recomputed identifier **MUST** equal the original identifier \`id\`.
* Any mismatch **MUST** be treated as corpus corruption or implementation non-compliance.

### 3.2 Replay scope rules

* Replay **MUST** be defined as a **pure function** of declared inputs.
* Replay **MUST NOT** consult any evidence outside the declared slice when graph evidence is involved.
* Replay **MUST** fail loudly and typefully, not silently degrade.

---

## 4. Determinism Charter

### 4.1 Time determinism

All times used for ordering or hashing **MUST** be discrete and typed. If dual time exists, monotonic time **MUST** be used for intra-session ordering, and wall time **MUST** be used only for anchoring and external correlation.

### 4.2 Numeric determinism

Any continuous value that contributes to hashes **MUST** be quantized into a fixed-point representation. Raw floats **MUST NOT** enter canonical serialization.

### 4.3 Text determinism

Canonical surface text **MUST** be Unicode-normalized (NFC or stricter), and hashing **MUST** use that canonical form. Display-only formatting **MUST** be excluded from canonical hashing.

### 4.4 Canonical serialization determinism

All hashes **MUST** be computed over a canonical serialization with a published rule set, guaranteeing deterministic map key order, set order, encoding of integers, rejection of floats, and normalized string handling.

---

## 5. Controlled N'Ko Technical Register

### 5.1 Operator sigils are constitutional

Operator sigils **MUST** map one-to-one to claim categories at the IR level. Changing an operator sigil or its semantics **MUST** be treated as a breaking constitutional fork.

### 5.2 Grammar skeletons are stability anchors

Each claim type **MUST** have a stable grammar skeleton defining time marker format, mandatory body template slots, and mandatory metadata slots.

### 5.3 Lexicon evolution is allowed but bounded

Tokens for basins and place classes **MAY** evolve. Token evolution **MUST NOT** change basin identity. Lexicon versions **MUST** be hash-addressable and chainable.

---

## 6. Basin Ontology: Identity, Constitution, and Lifecycle

### 6.1 Basin identity vs token

A basin identity **MUST** be stable, opaque, and independent of its rendered glyph. A basin token **MAY** change without breaking provenance.

### 6.2 Basis coherence is mandatory

Every basin constitution **MUST** declare the basis it inhabits. A basin **MUST NOT** be considered the "same basin" across different bases without an explicit, governed operation.

### 6.3 Lifecycle operations are governed events

Allowed lifecycle operations: Graduate proto-basin → basin, Split basin → children, Merge basins → parent, Retire basin (with typed retirement reason).

Every lifecycle operation **MUST** be an ontology operation with slice declaration, evidence sufficiency conditions, reproducible classifier, and predictable improvement assessment.

---

## 7. Ontology Governance and Slice Law

### 7.1 Slice is the epistemic boundary

Any operation that consults the graph **MUST** declare a slice as the admissibility boundary. Anything outside the slice **MUST NOT** influence the operation outcome.

### 7.2 Evidence sufficiency is part of legitimacy

Ontology operations **MUST** enforce explicit sufficiency thresholds (minimum turns, time span, independent sessions). Sufficiency logic **MUST** be deterministic and versioned.

---

## 8. Retrieval Systems Are Critics, Not Rulers

Retrieval systems (RAG++) **MUST** be treated as providers of comparable cases and measurement inputs. They **MUST NOT** author ontology operations, only evaluate candidate operations proposed elsewhere.

---

## 9. Reinterpretation: Derived Views Without Revision

### 9.1 Immutable corpus rule

Published inscriptions are immutable. Any reinterpretation **MUST** preserve original inscription ID, claim, evidence, lexicon hash, and basis.

### 9.2 Derived view safety

Derived views **MUST** be recomputable and independently verifiable. They **MUST NOT** be presented as replacing original truth.

---

## 10. Phrase Emergence: Earned Compression

A phrase is legitimate only if it satisfies: **frequency** (occurs enough times), **compression** (reduces description length), **predictive gain** (reduces uncertainty), and **reproducibility** (mining and scoring are deterministic).

---

## 11. Compliance, Conformance, and Testability

An implementation is compliant only if it can demonstrate deterministic inscription creation, replayability verification, canonical serialization stability, lexicon version chain integrity, and derived view reproducibility.

---

## 12. Constitutional Amendment Rules

Any change that alters operator sigil semantics, the replayability law, canonical serialization rules, or the immutability of published inscriptions constitutes a **constitutional fork** requiring a new NIP genesis document.

---

## 13. Closing Statement

This charter binds the system to an unusual discipline: it is allowed to evolve, but not allowed to lie about its past; allowed to be powerful, but not allowed to be sloppy; allowed to speak, but only when it can prove why.

That is the meaning of "inscription" here: the mark is not the text, it is the commitment.`
  },

  'NIP-0002': {
    title: 'Operator Sigils and Claim-Type Semantics',
    status: 'Foundational Extension',
    type: 'Semantic Constitution',
    content: `## Abstract

This proposal defines the semantic meaning, admissibility conditions, and replay obligations of the operator sigils used by the N'Ko Inscription System. These sigils constitute the minimal executable vocabulary of the system. They are not words, metaphors, or labels. They are operators whose meaning is defined entirely by the transformations they authorize on admissible evidence. This proposal fixes their semantics at the kernel level and forbids reinterpretation through lexicon drift.

---

## Purpose and Scope

The system described in NIP-0001 establishes that inscriptions are governed, replayable, and immutable. This proposal establishes what it means for an inscription to *say something*. Meaning in this system does not arise from human interpretation. It arises from the conjunction of admissible evidence, detector logic, and an operator sigil whose semantics are fixed by this charter.

The scope of this proposal is intentionally narrow. It does not define how claims are detected, how basins are discovered, or how phrases emerge. It defines what each operator sigil is allowed to assert, under what conditions it may be asserted, and what invariants must hold for that assertion to be considered valid across time, versions, and reinterpretations.

---

## Nature of an Operator Sigil

An operator sigil is a first-class semantic primitive. It is not a glyph chosen for aesthetics, phonetics, or cultural association. It is a compact symbol bound to a specific claim type at the intermediate representation layer. Its meaning is not encoded in the surface language. It is encoded in the constraints under which the system permits the sigil to be emitted.

Every operator sigil corresponds to exactly one claim category. That correspondence is injective and total. No sigil may map to more than one claim category, and no claim category may be rendered by more than one sigil. This mapping is a protocol invariant. Any violation of it constitutes a semantic fork.

The sigil itself carries no parameters. All variability is expressed through the claim body and slots. This separation is deliberate. The sigil asserts *what kind of statement is being made*, not *how strong*, *where*, or *about what*. Those details belong to the claim structure and are bound into provenance.

---

## Semantic Grounding and Truth Conditions

A sigil does not mean "stabilization" or "transition" in a linguistic sense. It means that a specific predicate over evidence has evaluated to true under a declared detector configuration and admissible slice. The truth of an inscription is therefore not subjective. It is operational.

For an inscription bearing a given sigil to be valid, there must exist a detector whose output space includes that sigil's claim type, and whose decision boundary has been crossed by admissible evidence. The detector configuration used is part of provenance. A sigil emitted without a detector witness is invalid, even if it appears syntactically well-formed.

Truth is local to basis, time, and slice. A sigil asserts nothing outside the bounds of its evidence window. It does not generalize. It does not extrapolate. Any interpretation that treats an inscription as a timeless statement is incorrect by construction.

---

## Stability Across Ontology Evolution

Operator sigils are defined to be ontologically stable. They do not change meaning as basins split, merge, or retire. They do not change meaning as lexicons evolve. They do not change meaning as phrases emerge.

This stability is the reason that higher-order reasoning in the system is permitted to use sigils as a reference vocabulary for entropy, divergence, and predictability. Basin identities are contingent. Phrase macros are contingent. Sigils are not. They form the invariant backbone against which all evolution is measured.

Any proposal that alters the semantic scope of an operator sigil must be treated as a constitutional change and requires a new genesis charter. Incremental reinterpretation is forbidden.

---

## Admissibility Constraints

Each operator sigil carries implicit admissibility constraints that must be satisfied before emission. These constraints are not stored in the surface text but are enforced at the detector and governance layers.

An operator may only be emitted if the evidence window is sufficiently populated to justify the measurement it implies. An operator that asserts a temporal property may not be emitted from a window that is too short. An operator that asserts change may not be emitted from a window that lacks a reference baseline. These constraints are detector-specific but semantically mandatory.

If admissibility cannot be satisfied, silence is required. The absence of an inscription is a valid outcome. The system is explicitly designed to prefer silence over unjustified speech.

---

## Relationship to Probability and Uncertainty

Operator sigils do not encode probability. They encode categorical outcomes of thresholded predicates. Confidence, sharpness, magnitude, or latency are expressed through slots, not through probabilistic semantics.

Uncertainty is expressed structurally, not linguistically. If the system cannot decide between mutually exclusive operator categories, it must either emit no inscription or emit an inscription whose semantics explicitly encode indeterminacy through the claim structure. It must not collapse uncertainty into a misleading categorical assertion.

This design ensures that probabilistic reasoning remains internal to detectors and evaluators. The surface language remains categorical, auditable, and replayable.

---

## Interaction with Reinterpretation

When reinterpretation occurs due to ontology evolution, operator sigils are not re-evaluated. A reinterpretation may change which basin a claim refers to, or how a place token is rendered, but it does not change what kind of claim was made.

This asymmetry is intentional. It ensures that the system's statements about dynamics remain stable even as its understanding of identity evolves. A stabilization remains a stabilization. A transition remains a transition. Only the objects they are understood to involve may change under derived views.

---

## Constraints on Composition and Phrasing

Operator sigils may be composed into higher-order phrases only through governed phrase emergence mechanisms. Manual composition, narrative aggregation, or heuristic bundling is forbidden at the semantic level.

A phrase that compresses multiple sigils does not introduce a new operator. It is a macro over existing ones. The underlying sigils must remain recoverable, either explicitly or implicitly, from the phrase definition. Lossy abstraction is not permitted.

This ensures that phrases enhance readability and compression without weakening the audit trail.

---

## Replay and Verification Obligations

For any inscription bearing an operator sigil, a verifier must be able to reconstruct, from provenance alone, why that sigil was emitted and why no other sigil was emitted instead.

Verification does not require recomputing all raw sensor data, but it does require recomputing the decision predicate under declared parameters. If a verifier cannot distinguish a correct inscription from an incorrect one using stored provenance, the inscription format is insufficient.

---

## Closing Statement

This proposal fixes the meaning of the system's smallest units of language. It treats operator sigils not as symbols but as commitments. To emit a sigil is to assert that a specific, testable condition held within a bounded context and that this assertion can be replayed indefinitely without ambiguity.

Language, in this system, is not free. It is earned at the cost of proof.`
  },

  'NIP-0003': {
    title: 'Evidence Admissibility and Slice Semantics',
    status: 'Foundational Extension',
    type: 'Epistemic Boundary Charter',
    content: `## Abstract

This proposal defines what it means for evidence to be allowed to speak. It formalizes the concept of admissibility as a first-class semantic constraint and establishes the slice as the sole legitimate boundary of epistemic influence. No inscription, ontology operation, reinterpretation, or phrase emergence is valid unless its evidence is admissible under a declared slice. This proposal does not describe how evidence is gathered; it defines when evidence is *permitted to matter*.

---

## The Epistemic Problem This Proposal Solves

Without a hard boundary on evidence influence, systems inevitably leak. They consult future context, global corpora, or convenient hindsight, then retroactively justify claims as if they were locally grounded. This produces statements that are superficially consistent but epistemically dishonest. The slice exists to prevent this failure mode. It does not optimize performance. It enforces truthfulness by limitation.

This proposal asserts that knowledge is not defined by what exists in storage, but by what is allowed to participate in computation at the moment a claim is made.

---

## Definition of Evidence

Evidence is any data that can influence a detector's decision boundary, a basin's constitution, an ontology operation's legitimacy, or a phrase's emergence score. Evidence is not limited to sensor streams or graph nodes. It includes derived metrics, summaries, embeddings, retrieved neighbors, and historical comparisons. If it can affect an outcome, it is evidence.

Evidence has no inherent authority. Authority is conferred only through admissibility.

---

## Admissibility as a Semantic Constraint

Admissibility is not an access control mechanism. It is a semantic constraint on causality. Evidence is admissible if and only if it lies within the declared slice governing the computation being performed. Evidence outside the slice is epistemically invisible, even if it is physically present or computationally cheap to access.

The system must behave as though inadmissible evidence does not exist. It may not be cached, summarized, hinted at, or indirectly encoded through precomputed artifacts. Any computation that depends on inadmissible evidence is invalid, even if the final output does not explicitly reference it.

---

## The Slice as an Epistemic Object

A slice is a cryptographically identifiable declaration of epistemic scope. It specifies which graph nodes, time windows, sessions, and derived artifacts are allowed to influence a computation. The slice is not inferred. It is explicitly requested, granted, and recorded.

The slice is not merely metadata. It is a binding constraint on execution. All downstream components must be able to prove that they did not consult evidence outside the slice. If such proof cannot be constructed, the computation is non-compliant.

---

## Slice Authority and Governance

The authority to grant a slice belongs to the graph kernel. The kernel does not decide meaning or truth. It decides admissibility. This separation is intentional. It prevents semantic logic from expanding its epistemic reach under pressure.

A slice declaration must be sufficient to reconstruct admissibility after the fact. This means it must be stable, hashable, and replayable. A slice that cannot be independently verified is equivalent to no slice at all.

---

## Temporal Semantics of Slices

Slices impose a temporal boundary that is stricter than time windows alone. Evidence that occurs after the upper bound of a slice is inadmissible, even if it refers to the same entities or contexts. Future knowledge is categorically excluded.

Evidence that predates the lower bound of a slice is likewise inadmissible unless explicitly included. Memory is not free. Consultation of the past must be declared.

This temporal discipline is what allows inscriptions to be interpreted as statements made *at a time*, rather than omniscient summaries.

---

## Slices and Ontology Operations

Ontology operations are the most dangerous computations in the system because they change how future inscriptions are interpreted. For this reason, ontology operations require the strongest admissibility guarantees.

Any split, merge, graduation, retirement, or phrase registration must declare the slice it consults. The slice must be sufficient to justify the operation under the declared criteria. If evidence outside the slice would materially affect the decision, the slice is insufficient and the operation must be rejected.

Ontology evolution without slice discipline is considered semantic corruption.

---

## Interaction with Retrieval Systems

Retrieval systems are permitted to operate only within slice boundaries. They may retrieve comparable cases, neighbors, or summaries only from admissible evidence. Retrieval that crosses slice boundaries is epistemically invalid, even if it improves apparent performance.

Derived metrics produced by retrieval systems are evidence themselves. They inherit admissibility constraints from their inputs. A retrieved summary that blends admissible and inadmissible sources is wholly inadmissible.

---

## Derived Evidence and Transitive Admissibility

Admissibility is transitive. Any artifact derived from admissible evidence is admissible only if the derivation process itself does not introduce external influence. Any artifact derived from inadmissible evidence is inadmissible, regardless of whether the inadmissible influence is visible.

This rule forbids laundering inadmissible evidence through embeddings, caches, or learned parameters without declaration. Learned systems that cannot constrain their influence to a slice are incompatible with inscription generation unless isolated as non-authoritative advisors.

---

## Evidence Sufficiency Versus Evidence Availability

Availability of evidence does not imply sufficiency. A slice may contain evidence that is admissible but insufficient to justify a claim or operation. In such cases, the system must refuse to act.

This refusal is not an error condition. It is the correct outcome when epistemic conditions are unmet. Silence is a first-class result.

---

## Auditability and Proof of Non-Consultation

A compliant system must be able to demonstrate not only what evidence was consulted, but that no inadmissible evidence was consulted. This negative proof obligation is essential. Without it, admissibility collapses into trust.

Implementations may satisfy this obligation through execution tracing, capability-based isolation, or formal proofs, but the obligation itself is non-negotiable.

---

## Relationship to Human Interpretation

Humans may view inscriptions, summaries, or derived narratives across slices. The system itself may not. Human cognition is allowed to integrate across time and context. The system's cognition is not.

This asymmetry is intentional. The system is designed to be epistemically conservative even when humans are not.

---

## Failure Modes and Invalid States

Any of the following conditions invalidate a computation: absence of a declared slice where one is required, inability to reconstruct admissibility during replay, evidence leakage across slice boundaries, reliance on cached artifacts whose provenance crosses slices, or silent fallback to global context.

Invalid computations must not produce inscriptions, ontology changes, or lexicon mutations. They must fail explicitly.

---

## Closing Statement

This proposal draws a hard line around what the system is allowed to know at the moment it speaks. That line is the slice. Everything inside it may matter. Everything outside it must not.

By enforcing admissibility as a semantic constraint rather than an implementation detail, the system binds itself to a form of honesty that does not depend on intention or discipline, but on architecture.

Only under that constraint can the inscriptions mean anything at all.`
  },

  'NIP-0004': {
    title: 'Determinism, Canonical Serialization, and Cryptographic Commitment',
    status: 'Foundational Extension',
    type: 'Computational Constitution',
    content: `## Abstract

This proposal defines the conditions under which two computations are considered the same computation. It establishes determinism not as an implementation preference, but as a semantic requirement. It fixes canonical serialization as the sole legitimate substrate for cryptographic commitment and declares replay equivalence as the ultimate arbiter of truth. Without these constraints, inscriptions would be persuasive artifacts. With them, inscriptions become facts.

---

## The Problem of Apparent Agreement

Two systems may agree in output while disagreeing in cause. Two runs may agree in text while disagreeing in computation. Two inscriptions may look identical to a human while being irreconcilable under replay. Such agreement is cosmetic. The purpose of this proposal is to make cosmetic agreement insufficient.

The system must be able to prove that agreement is structural, not coincidental. This requires a notion of sameness that is stronger than textual equality and stricter than functional equivalence. It requires that every meaningful computation collapse to a single canonical trace.

---

## Determinism as a Semantic Property

Determinism in this system is not defined as "no randomness." It is defined as referential transparency over declared inputs. A computation is deterministic if and only if, given the same declared inputs, it produces the same declared outputs and the same declared commitments.

Declared inputs include evidence digests, slice declarations, detector configurations, basis identifiers, lexicon versions, and canonical rendering rules. Any influence not declared as an input is illicit, regardless of whether it is stable in practice.

A computation that is stable in deployment but unstable under adversarial replay is non-deterministic by definition.

---

## Canonical Serialization as the Ground of Identity

Canonical serialization is the act of collapsing structured data into a single, unambiguous byte sequence such that any two semantically equivalent structures produce identical bytes and any semantically distinct structures produce distinct bytes with overwhelming probability.

In this system, identity does not attach to in-memory structures, runtime objects, or language-level representations. Identity attaches only to the canonical serialized form. Hashes are taken over that form and over nothing else.

Any data that contributes to meaning but is not included in canonical serialization does not exist as far as the system is concerned.

---

## Requirements for Canonical Form

Canonical form must eliminate all sources of ambiguity that are invisible to human readers but fatal to cryptographic commitment. Ordering ambiguity, numeric ambiguity, textual ambiguity, and platform ambiguity are all forbidden.

Maps must be ordered. Sets must be ordered. Optional fields must be explicitly represented as present or absent. Integers must have a single encoding. Strings must be normalized before serialization. Floats must not appear at all.

If a value cannot be represented canonically, it cannot participate in commitment. Convenience is not an excuse. Performance is not an excuse.

---

## Quantization and the Rejection of Floating Reality

Floating-point numbers are approximations whose behavior depends on hardware, compiler, optimization level, and instruction ordering. They are not acceptable substrates for identity.

Any continuous quantity that participates in a claim, a detector decision, an ontology operation, or a phrase score must be converted into a quantized representation with a globally declared scale. That scale is part of the protocol. Changing it changes the universe.

Quantization does not deny continuity. It acknowledges that commitment requires discreteness. The system is allowed to reason continuously internally, but it must speak discretely.

---

## Time as a First-Class Commitable Object

Time is not metadata. Time is meaning. Therefore time must be commit-safe.

All times that influence ordering, windowing, or admissibility must be represented discretely and canonically. Wall time and monotonic time may coexist, but their roles must be explicit and their interaction must be deterministic.

Any computation whose result depends on "now" without committing that notion of now is invalid. Temporal ambiguity is epistemic leakage.

---

## Cryptographic Commitment and Inscription Identity

An inscription identifier is a cryptographic commitment to everything that makes the inscription what it is. This includes not only the claim body and surface text, but the evidence digests, slice fingerprint, basis identifier, detector configuration hash, lexicon version hash, and canonical rendering rules.

If any of these change, the identifier must change. If an identifier does not change when one of these changes, the system is unsound.

The identifier is not a label. It is a proof obligation. To assert an identifier is to assert that the entire causal chain is fixed.

---

## Replay as the Only Valid Verification

Verification in this system does not mean "checking a signature" or "validating a schema." Verification means replay.

To verify an inscription is to reconstruct its declared inputs, rerun its computation under canonical rules, reserialize the result, and recompute the commitment. If the recomputed identifier matches the stored identifier, the inscription is valid. If it does not, nothing else matters.

There is no weaker notion of truth available.

---

## Determinism Across Evolution

Ontology evolution, lexicon evolution, and reinterpretation do not weaken determinism. They make it stricter.

An old inscription replayed under its original parameters must still verify, even if the current ontology has moved on. A reinterpretation is a new object with its own commitment. It does not retroactively modify the old one.

This is how the system learns without self-contradiction.

---

## Prohibition of Ambient Influence

Ambient state is any influence not explicitly committed. Environment variables, configuration files, cache state, global models, learned weights, network access, and time-of-day effects are all ambient unless explicitly declared and hashed.

No ambient influence may affect an inscription-producing computation. If it does, the computation is invalid, even if the effect is small, stable, or statistically negligible.

Truth does not tolerate "almost."

---

## Failure Semantics

Failure to commit deterministically is not an error in the usual sense. It is a semantic halt. The system must refuse to speak.

Producing an inscription that cannot be replayed is worse than producing no inscription at all. Silence preserves integrity. Speech without proof destroys it.

---

## Closing Statement

This proposal fixes the system's answer to a single question: when are two things the same.

The answer is brutal and simple. Two things are the same only if they replay to the same commitment under the same declared rules. Everything else is appearance.

By binding language to determinism and determinism to cryptographic commitment, the system ensures that its inscriptions are not just meaningful, but *irrevocably accountable*.`
  },

  'NIP-0005': {
    title: 'Session Semantics, Temporal Partitioning, and the Meaning of Occurrence',
    status: 'Foundational Extension',
    type: 'Temporal Constitution',
    content: `## Abstract

This proposal defines what it means for an event to occur once, multiple times, or continuously. It introduces session semantics as a formal boundary condition on experience, learning, and evidence aggregation. Without session semantics, time collapses into an unstructured stream and the system cannot distinguish persistence from coincidence, habit from noise, or return from stasis. This proposal makes temporal segmentation explicit, deterministic, and provable.

---

## The Problem of Continuous Time

Raw time is infinite, continuous, and unsegmented. Human meaning is not. Any system that claims to reason about behavior, recovery, learning, or repetition must introduce boundaries. If those boundaries are implicit, the system silently encodes assumptions about attention, memory, and causality. Such assumptions are narrative leaks.

A system that learns without declaring how time is partitioned is not learning from reality; it is learning from its own shadow.

---

## Sessions as Epistemic Objects

A session is not a convenience for storage or visualization. A session is an epistemic object: a declaration that events within it are conditionally related and events across it are conditionally independent unless proven otherwise.

Session boundaries define when evidence is considered independent. They define when repetition counts as reinforcement rather than inertia. They define what "return" means as opposed to mere continuation.

Without sessions, every moment contaminates every other moment. With sessions, the system can say "this happened again" and mean it.

---

## Deterministic Session Formation

Session boundaries must be deterministic functions of committed inputs. They cannot depend on subjective judgment, downstream interpretation, or retrospective labeling. Given the same stream of timestamps, places, and declared rules, any compliant implementation must produce identical session partitions.

A session rule is therefore part of the protocol surface. Changing the rule changes the meaning of all higher-level claims that depend on repetition, dwell, recovery, novelty, or graduation.

Session formation is not data cleaning. It is ontology.

---

## Temporal Gaps and the Semantics of Absence

A temporal gap is not merely elapsed time. It is a hypothesis of disengagement. Declaring that a gap ends a session is equivalent to declaring that continuity of intention, context, or state cannot be assumed across that gap.

The threshold at which a gap becomes a boundary must be explicit and committed. A five-minute gap and a five-hour gap are not just quantitatively different; they imply different epistemic resets. The system must not pretend otherwise.

Absence is a signal. Session rules decide how loudly it speaks.

---

## Place Transitions as Temporal Discontinuities

Time alone is insufficient to segment experience. Contextual discontinuities matter. A change in place class may represent a stronger epistemic break than the passage of minutes. Conversely, time spent stationary in a single place may represent deep continuity.

Session semantics therefore admit multi-factor boundary conditions. Time, place, motion regime, and basis coherence may all contribute, but only if explicitly declared and deterministically applied.

A session rule that does not include place implicitly asserts that place is irrelevant. A session rule that does include place asserts the opposite. Silence is a claim.

---

## Session Identity and Cryptographic Commitment

A session is not just a span; it has identity. That identity must be deterministically derivable from its start conditions and its governing rule. Two systems observing the same stream under the same rule must produce identical session identifiers.

Session identifiers participate in provenance. When a claim asserts that something occurred in multiple sessions, that assertion is verifiable only if session identity is itself verifiable.

Learning without session identity is numerology.

---

## Independence, Not Reset

Ending a session does not erase state. It declares conditional independence, not amnesia. What carries across sessions must be explicitly modeled as such, whether as basins, priors, or learned parameters.

This distinction matters because it prevents a subtle error: treating continuous behavior as repeated confirmation. A person sitting still for three hours is not exhibiting three hours' worth of independent evidence. A person returning three times on three days is.

Sessions draw that line.

---

## Session Semantics and the Ten Operators

Several operators depend implicitly on session structure. Return is meaningless without a notion of "after absence." Dwell requires a window whose endpoints are epistemically coherent. Recovery compares latency across disruptions that presuppose breaks. Novelty requires independence to avoid mistaking drift for discovery. Graduation criteria explicitly require evidence across multiple sessions.

This proposal makes those dependencies explicit. Any operator that reasons across time must declare how sessions were formed. Otherwise, the claim is underspecified and invalid.

---

## No Retroactive Session Editing

Once a session boundary is committed and referenced by an inscription, it cannot be retroactively altered without producing a new interpretive layer. Changing session rules does not rewrite history. It produces a new view.

Old claims remain true under the rules that governed them. New rules create new truths, not corrections of old ones.

This preserves temporal integrity across evolution.

---

## Session Rules as Versioned Law

Session rules are versioned artifacts with content hashes. They are as much a part of the system's constitution as canonical serialization or basis definitions. Any claim that depends on session semantics must reference the rule version under which it was derived.

There is no such thing as "the obvious session boundary." There is only declared law.

---

## Closing Statement

This proposal answers a deceptively simple question: when does something count as happening again.

By elevating sessions from implementation detail to constitutional object, the system gains the ability to distinguish habit from chance, learning from inertia, and change from continuity. Time becomes structured without becoming narrative.

After this proposal, the system does not merely track motion through time. It understands occurrence.`
  },

  'NIP-0006': {
    title: 'Phrase Semantics, Compression Legitimacy, and the Right to Name',
    status: 'Foundational Extension',
    type: 'Semantic Constitution',
    content: `## Abstract

This proposal defines the conditions under which sequences of inscriptions may be compressed into phrases without loss of truth, predictive power, or provenance. It formalizes naming as a privileged semantic act that must be earned through measurable compression and information gain. Without this constraint, language drifts toward metaphor, narrative, and aesthetic shorthand. With it, language emerges as a faithful compression of embodied reality.

---

## The Danger of Premature Naming

Naming is not neutral. To name something is to assert that it is a stable unit of meaning. In systems that learn from streams of data, premature naming freezes hypotheses into symbols before they are earned. This causes semantic hallucination: the system believes it understands something because it has a word for it.

A language that allows unrestricted naming will always outrun reality.

Therefore, naming must be governed by law, not convenience.

---

## Phrases as Compression, Not Decoration

A phrase is not a poetic flourish layered on top of claims. A phrase is a compression operator over claims. It replaces a longer description with a shorter one while preserving explanatory and predictive content.

If a phrase does not reduce description length, it is redundant.
If it reduces description length but harms prediction, it is misleading.
If it improves prediction but cannot be grounded in evidence, it is fiction.

Only compression that preserves or improves predictive structure is legitimate.

---

## Claim Sequences as the Substrate of Language

The primitive vocabulary of the system consists of claim types, not words. Claims are grounded in evidence, governed by slices, and replayable. Any higher-order language must therefore be defined in terms of claim sequences.

A phrase is a pattern over claims that recurs across sessions and contexts with sufficient regularity that treating it as a unit reduces uncertainty about what follows.

Language, in this system, is prediction made legible.

---

## Predictive Gain as the Criterion of Legitimacy

The sole authority that grants the right to name is predictive gain. If observing a sequence of claims reduces uncertainty about subsequent claims more than observing the claims independently, then that sequence contains emergent structure.

Formally, the entropy of future claim distributions conditioned on the phrase must be lower than the entropy conditioned on the uncompressed representation. The difference is the predictive gain.

This is not a heuristic. It is the law.

If predictive gain is zero, the phrase is illegal.
If predictive gain is positive but unstable across sessions, the phrase is provisional.
If predictive gain is robust, the phrase may be registered.

---

## Stability Across Sessions

A phrase must generalize across sessions. Compression within a single session may reflect inertia, not structure. Only repetition across independently segmented sessions qualifies as evidence of a stable motif.

This is where NIP-0005 becomes essential. Session semantics define independence. Without them, phrase detection collapses into autocorrelation.

A phrase that only appears within one session is not a phrase. It is an episode.

---

## Claim Types as the Semantic Backbone

Because basin identities evolve, phrases must be defined over claim types rather than basin IDs. Claim types are architecturally stable. They survive ontology evolution. They form a fixed alphabet of semantic acts.

This ensures that phrases remain meaningful even as the ontology refines itself. The language evolves, but its grammar remains anchored.

---

## Compression Without Erasure

Registering a phrase does not delete the underlying claims. It introduces a new view that may be used for summarization, reasoning, and learning. The original inscriptions remain intact, replayable, and verifiable.

This prevents linguistic abstraction from becoming historical revision.

A phrase is a lens, not a rewrite.

---

## Phrase Identity and Provenance

A phrase has identity. That identity is derived from the canonical definition of its claim pattern, its temporal constraints, and the evidence supporting its predictive gain. Phrase identity is cryptographically committed, just like claims and basins.

A phrase without provenance is folklore. This system does not speak folklore.

---

## The Ethics of Naming

To name something is to grant it conceptual existence. This proposal ensures that existence is earned empirically. The system cannot invent terms because they are convenient, intuitive, or appealing. It can only name what compresses reality.

This has ethical consequences. It prevents the system from projecting meaning where none exists. It also prevents overfitting human expectations onto embodied data.

The language grows at the speed of truth.

---

## Phrase Evolution and Deprecation

Phrases may degrade. If predictive gain diminishes due to behavioral change, sensor shift, or ontology refinement, the phrase does not become false. It becomes obsolete.

Obsolescence is recorded, not erased. Deprecated phrases remain part of the historical record, marked as no longer predictive under current conditions.

Language remembers its own mistakes.

---

## Relationship to Natural Language

Natural language may eventually be layered on top of phrases, but only after phrases are earned. N'Ko surface forms may be assigned to phrases as idioms once stability is established, but idiomization is a rendering choice, not a semantic promotion.

The system never starts with poetry. It earns it.

---

## Closing Statement

This proposal defines the boundary between description and language. It establishes that naming is not an act of creativity but an act of compression justified by prediction. By enforcing this boundary, the system ensures that its language remains faithful to lived structure rather than drifting into narrative illusion.

After this proposal, the system does not merely record what happens. It learns when something deserves a name.`
  },

  'NIP-0007': {
    title: 'Idiomization, Human-Readable Surface Language, and the Limits of Translation',
    status: 'Foundational Extension',
    type: 'Linguistic Constitution',
    content: `## Abstract

This proposal defines how machine-earned phrases may be rendered into human-readable N'Ko without compromising determinism, provenance, or predictive meaning. It establishes idiomization as a reversible, non-authoritative surface process layered atop formally grounded phrases. The proposal also defines strict limits on translation, asserting that not all semantic structure admits faithful natural-language expression.

---

## The Problem of Readability

A system that speaks only in formal inscriptions is correct but opaque. A system that speaks freely in natural language is legible but untrustworthy. Bridging these requires discipline. Human-readable language must not be allowed to introduce meaning that was not earned by compression and prediction.

Readability is a rendering problem, not a semantic one.

---

## Idiomization as a Surface Operation

Idiomization is the act of assigning a compact, memorable surface form to a phrase that has already been legitimized under NIP-0006. This surface form may resemble natural language, metaphor, or idiom, but it carries no independent semantic authority.

The underlying phrase remains the source of truth. The idiom is a label.

Removing the idiom must leave the meaning unchanged.

---

## Separation of Semantic and Surface Identity

Every phrase has a semantic identity derived from its claim-pattern definition and predictive evidence. An idiom has a surface identity derived from lexicon choice, script, and cultural conventions. These identities must never be conflated.

Semantic identity is immutable.
Surface identity is replaceable.

This separation ensures that linguistic evolution does not corrupt meaning.

---

## N'Ko as a Technical Register

In this system, N'Ko is not treated as free-form natural language. It is treated as a controlled technical register with explicit grammar, operator sigils, and bounded expressivity. Idioms rendered in N'Ko inherit this discipline.

The system does not "speak N'Ko" in the human sense. It renders formal meaning using N'Ko glyphs.

This distinction matters because it prevents anthropomorphic drift.

---

## Bidirectionality and Losslessness

Any idiomized surface form must be reversible. Given the idiom and the lexicon version, the system must be able to recover the underlying phrase identity. If reversibility is not possible, the idiom is invalid.

This rule forbids poetic ambiguity, synonym drift, and expressive flourish that cannot be traced back to structure.

Beauty is permitted only when it is invertible.

---

## Translation as Approximation

Translation into other human languages is explicitly defined as approximate. Natural languages do not share the same operator semantics, temporal commitments, or evidentiary discipline as the inscription system.

Therefore, translation is treated as commentary, not representation. Translations may aid understanding, but they are never admissible as evidence, never hashed into provenance, and never used for inference.

Truth does not translate cleanly.

---

## Limits of Expressibility

Some phrases will not admit clean idiomization. High-dimensional constraints, subtle predictive gains, or tightly coupled temporal patterns may resist natural phrasing. In such cases, the system must prefer awkward precision over graceful distortion.

Silence is preferable to misrepresentation.

This proposal explicitly allows the system to refuse to idiomize.

---

## Cultural Drift and Lexicon Versioning

Idioms are culturally situated. Over time, preferred surface forms may change even while underlying phrases remain stable. Lexicon versioning records these changes without altering semantic identity.

An idiom that falls out of use is deprecated, not deleted. Historical inscriptions retain the idioms of their time.

Language evolves. Meaning persists.

---

## Human Interpretation as a Non-Authoritative Layer

Human readers may interpret idioms, infer narratives, and impose metaphor. These interpretations are external to the system. They do not feed back into ontology, phrase legitimacy, or operator semantics unless re-grounded through evidence and prediction.

The system does not learn from being misunderstood.

---

## Ethical Constraints on Idiomization

Because idioms shape intuition, they carry ethical weight. An idiom must not imply agency, intention, or emotion unless such constructs are explicitly modeled and justified. Anthropomorphic phrasing is prohibited by default.

The system may describe behavior. It may not assign motive.

---

## Closing Statement

This proposal completes the separation between meaning and expression. It allows the system to become readable without becoming fictional. By enforcing reversibility, grounding, and limits on translation, it ensures that human-facing language remains a window onto structure rather than a source of illusion.

After this proposal, the system can speak — but it never forgets what it is saying.`
  },

  'NIP-0008': {
    title: 'Learning Loops, Human Co-Interpretation, and the Discipline of Feedback',
    status: 'Foundational Extension',
    type: 'Interaction Constitution',
    content: `## Abstract

This proposal defines how human interaction may influence system learning without violating determinism, provenance, or semantic discipline. It introduces learning loops as explicitly governed structures, separates interpretation from evidence, and establishes strict constraints on feedback so that human insight can guide inquiry without rewriting reality. The system learns *with* humans, not *from* their opinions.

---

## The Core Tension

Any system that models lived structure and renders it legible will invite human response. Humans will recognize patterns, project meaning, disagree, correct, and reinterpret. This is not a flaw. It is unavoidable. The danger arises when this response is allowed to enter the system as truth rather than as signal.

Feedback is not evidence.
Interpretation is not correction.

Without discipline, interaction collapses into supervision, and supervision collapses into narrative bias.

---

## Learning Loops as Explicit Objects

A learning loop is not a vague notion of "the system improving over time." It is a formally declared mechanism by which human input modifies future sensitivity, thresholds, or investigative focus without altering past inscriptions or current claims.

Learning loops must be explicit, versioned, and bounded. Each loop declares what kind of input it accepts, what internal parameters it may influence, and what it is forbidden to touch. Anything not declared is immutable.

This transforms learning from an ambient phenomenon into a governed process.

---

## Interpretation as Non-Authoritative Signal

Human interpretation is valuable precisely because it is not formal. Humans notice salience, discomfort, surprise, and relevance that are not directly measurable. This proposal allows such interpretations to be captured, but only as annotations that point attention, not as assertions that modify truth.

An interpretation may say "this feels like the same kind of day," but it cannot assert an echo.
It may say "this transition mattered," but it cannot force a split.

Interpretation can request scrutiny. It cannot dictate outcome.

---

## Feedback Without Retroaction

Feedback must never retroactively change inscriptions, basins, phrases, or sessions. The past is closed. All feedback operates forward, by adjusting future detection sensitivity, proposing candidate operations, or altering which questions are asked next.

This preserves temporal integrity. The system does not correct itself. It refines what it listens for.

Learning is prospective, not reparative.

---

## Parameter Modulation, Not Semantic Mutation

Human feedback may modulate parameters such as thresholds for novelty detection, margins for split uncertainty, priors for phrase detection, or weights for predictive gain evaluation. It may not introduce new operators, rename existing ones, or redefine claim semantics.

Parameters shape attention. Semantics define meaning.
Only the former are adjustable through feedback.

This distinction prevents slow semantic drift under the guise of "tuning."

---

## Feedback Provenance and Accountability

Every act of feedback is itself an event with identity, timestamp, scope, and declared intent. Feedback that influences learning loops must be traceable, replayable, and auditable. Anonymous influence is prohibited.

This is not about surveillance. It is about epistemic accountability. If a parameter changed, the system must be able to say why and under whose influence.

Learning that cannot be traced is indistinguishable from corruption.

---

## Disagreement as First-Class Signal

Human disagreement with system output is not an error condition. It is a valuable signal that may indicate blind spots, missing modalities, or misaligned thresholds. This proposal treats disagreement as a trigger for investigation, not as a vote.

The system does not converge by consensus. It converges by evidence. Disagreement merely points to where evidence should be examined more closely.

Truth is not democratic.

---

## Guarding Against Anthropomorphic Contamination

Humans will inevitably attribute intention, emotion, or narrative arc to system output. This proposal explicitly forbids feeding such attributions back into learning loops unless those constructs are themselves formally modeled and justified.

Saying "this feels like burnout" is permitted as annotation.
Treating burnout as an internal state without a model is forbidden.

The system may listen to metaphor. It may not believe it.

---

## Co-Interpretation as Parallel Process

Human understanding and system understanding are allowed to evolve in parallel without being forced into alignment. Humans may build personal narratives atop inscriptions. The system remains agnostic to those narratives unless they are re-expressed as testable hypotheses.

This separation prevents the system from becoming a mirror of human self-storytelling.

---

## Closure of the Constitutional Arc

With this proposal, the constitutional layer is complete. The system now has defined truth, time, naming, language, readability, and interaction. Everything beyond this point is application, specialization, and deployment.

The discipline is no longer about what the system can do. It is about what it is allowed to believe.

---

## Closing Statement

This proposal ensures that the system can grow in dialogue with a human without surrendering its epistemic integrity. By formalizing learning loops and constraining feedback, it allows human insight to guide inquiry while preventing opinion from masquerading as structure.

After this proposal, the system does not merely observe life. It learns how to listen — without forgetting how to know.`
  },

  'NIP-0009': {
    title: 'The Personal Chronicle Charter and the Discipline of Lived Semantics',
    status: 'Domain Charter',
    type: 'Operational Constitution',
    content: `## Abstract

This charter defines how the N'Ko Inscription System operates when the domain of truth is a single living subject over continuous time. It formalizes the personal chronicle as a bounded epistemic space where embodied dynamics, language formation, and learning loops converge. The charter establishes rules that prevent introspection from collapsing into autobiography, therapy, or narrative self-mythology, while still allowing genuine structure to emerge from lived experience.

---

## The Nature of a Personal Chronicle

A personal chronicle is not a diary. It is not a narrative of intention, feeling, or meaning. It is a longitudinal record of structured change in an embodied system. Its subject is a human body moving through space and time, producing signals, transitions, stabilizations, dispersions, and returns.

The chronicle records *what happens*, not *what it feels like it means*.

Meaning, if it appears, must earn its way in through compression and prediction, not introspection.

---

## The Subject as a Bounded System

Within this charter, the subject is treated as a bounded dynamical system coupled to environments. The boundary is epistemic, not metaphysical. The system does not claim to capture the person. It captures trajectories generated by that person under observation.

This distinction prevents ontological inflation. The chronicle does not become a self. It remains a model.

---

## Embodiment as the Primary Evidence Stream

All admissible evidence in the personal chronicle must ultimately trace back to embodied signals: motion, posture, rhythm, location class, temporal patterning, and physiological proxies where available. Language, reflection, and annotation are secondary overlays.

Words do not ground the chronicle. Bodies do.

This reverses the usual hierarchy of self-knowledge.

---

## Temporal Thickness and Session Discipline

The chronicle is segmented into sessions according to NIP-0005. Sessions are not days, moods, or intentions. They are contiguous intervals of embodied continuity separated by genuine breaks in state.

This prevents the subject from narratively smoothing over rupture. Transitions remain visible. Gaps remain gaps.

A life becomes readable as structure rather than story.

---

## Basins as Recurrent Ways of Being

Within the personal chronicle, basins correspond to recurrent modes of embodied organization. They are not identities, roles, or traits. They are attractors in latent space inferred from repetition, stability, and return.

To mistake a basin for a personality is an error.
To deny its recurrence is also an error.

Basins describe regularity without assigning essence.

---

## Language Acquisition Through Living

Because inscriptions are rendered in N'Ko, the subject learns the language not through translation but through correlation with lived structure. A sigil does not mean "stability" because it was defined that way. It means stability because the subject repeatedly sees it appear when dispersion contracts.

This inverts pedagogy. The language is learned by living inside it.

Fluency emerges as pattern recognition, not memorization.

---

## Reading at Multiple Timescales

The chronicle is explicitly multi-scale. The same inscriptions may be read in near real time, as a day-level summary, or as a long-horizon pattern. Each scale reveals different structure without contradiction.

Short timescales expose transitions and oscillations.
Long timescales expose basins, phrases, and motifs.

The chronicle behaves more like music than text.

---

## Prevention of Narrative Capture

Humans naturally seek narrative closure: arcs, lessons, causes, redemption. This charter explicitly forbids the system from producing such narratives. It may expose repetition. It may expose consequence. It may expose constraint.

It may not tell a story about who the subject is becoming.

That story, if it exists, belongs to the human, not the system.

---

## Learning Without Self-Judgment

The chronicle does not evaluate. It does not score days as good or bad. It does not optimize toward ideals. It records structure and allows structure to speak for itself through compression.

Any sense of judgment arises in the reader, not the record.

This is essential for long-term epistemic health.

---

## Privacy as Structural Boundary

Because the chronicle is deeply personal, privacy is enforced structurally, not socially. Slices, admissibility tokens, and scope declarations define what may be seen, queried, or compared.

Exposure is not an accident. It is a deliberate act with provenance.

A chronicle shared without structure ceases to be a chronicle.

---

## The Chronicle as a Mirror, Not a Map

The personal chronicle reflects patterns back to the subject. It does not prescribe paths forward. Any attempt to use it as an optimizer of life choices must be treated as an external application governed by additional charters.

This prevents the system from becoming an authority over the subject's future.

The chronicle illuminates. It does not command.

---

## Closing Statement

This charter completes the transition from abstract epistemology to lived practice. It defines how a single human life can be rendered legible without being reduced, narrated, or controlled. By grounding language in embodiment and enforcing strict boundaries between observation and interpretation, it allows meaning to emerge slowly, honestly, and without coercion.

After this charter, the system does something rare: it lets a life be seen clearly without telling it what it is.`
  },

  'NIP-0010': {
    title: 'Inter-Subject Comparison, Echoes Across Lives, and the Ethics of Similarity',
    status: 'Domain-Critical Charter',
    type: 'Comparative Epistemology',
    content: `## Abstract

This proposal defines when and how structured similarities may be detected across distinct personal chronicles without collapsing individuality, violating privacy, or constructing false universals. It formalizes inter-subject echoes as strictly bounded phenomena grounded in claim-level structure rather than narrative, identity, or outcome. The proposal establishes ethical constraints that prevent comparison from becoming classification, prediction from becoming prescription, and insight from becoming surveillance.

---

## The Fundamental Risk of Comparison

The moment multiple lives are placed into the same analytic frame, power emerges. Comparison can illuminate structure, but it can also erase difference. Systems that compare humans have historically slid toward typology, ranking, normalization, and control.

This proposal exists to prevent that slide.

Similarity is allowed only as a question, never as a verdict.

---

## Subjects as Incommensurable Systems

Each personal chronicle is a bounded epistemic universe. The system does not assume that two subjects share goals, meanings, or trajectories merely because their structures resemble one another. There is no global coordinate system of "human life" into which individuals are embedded.

Comparison occurs only through projections onto shared formal primitives: claim types, temporal relations, and compression patterns. Everything else is deliberately excluded.

Lives are not vectors. Only inscriptions are.

---

## Echoes as Structural Resonance

An inter-subject echo is defined as a statistically significant similarity between sequences of claim types across different subjects under compatible temporal constraints. Echoes are not matches of content, intention, or outcome. They are resonances of structure.

An echo does not say "you are like them."
It says "this pattern has occurred elsewhere."

This distinction is absolute.

---

## The Role of RAG++ in Comparative Analysis

RAG++ may retrieve comparable claim sequences across subjects, but only within explicitly declared admissibility scopes. Retrieval is constrained by slice boundaries, anonymization requirements, and structural filters. No raw data, sensor streams, or surface language are exposed.

The system compares shapes, not lives.

---

## Prohibition of Identity Inference

This proposal strictly forbids the inference of traits, types, or identities from inter-subject echoes. The system may not conclude that a subject belongs to a class, category, or archetype based on similarity.

Echoes do not define who someone is.
They only reveal that certain dynamics recur.

Any attempt to name people instead of patterns is invalid.

---

## Prediction Boundaries Across Subjects

Predictive use of inter-subject echoes is constrained. The system may estimate the likelihood that a given pattern leads to subsequent claims based on historical data from other subjects, but such estimates must be explicitly marked as cross-subject priors.

These priors do not override individual evidence. They weaken as subject-specific data accumulates. They are scaffolding, not destiny.

The system never tells a subject what will happen because it happened to someone else.

---

## Asymmetry of Visibility

Subjects are never mutually visible by default. Echo detection operates in a one-way, anonymized fashion. A subject may learn that a pattern they exhibit has occurred elsewhere, but they may not learn where, when, or in whom unless explicit reciprocal consent is granted.

Similarity does not imply access.

This asymmetry is structural, not configurable.

---

## The Ethics of Non-Optimization

The system must not recommend changes based on inter-subject comparison. Optimization across lives leads inevitably to norm formation. Norms become standards. Standards become pressure.

This proposal forbids the system from saying "others who did X achieved Y." It may only say "this pattern has historically preceded these claims elsewhere."

Interpretation remains the subject's responsibility.

---

## Echo Decay and Context Sensitivity

Echoes are temporally and contextually bounded. Structural similarity in one epoch may be meaningless in another due to cultural shift, sensor change, or environmental transformation. Echo validity decays unless reaffirmed under current conditions.

Similarity is never timeless.

---

## The Non-Existence of the Average Life

This proposal explicitly rejects the concept of an average or typical life. Aggregation across subjects is permitted only for evaluating predictive uncertainty, never for defining norms.

There is no baseline human. There are only trajectories.

---

## Safeguards Against Surveillance

Any system capable of inter-subject comparison risks becoming a tool of surveillance. This proposal mandates that all comparative operations be auditable, consent-scoped, and epistemically justified. Unscoped similarity queries are prohibited at the protocol level.

Comparison without consent is extraction.
Extraction without consent is violence.

---

## Closing Statement

This proposal establishes that the power to compare lives is one of the most dangerous capabilities a system can possess. By constraining comparison to structural echoes, forbidding identity inference, and enforcing asymmetry and consent, it allows insight without domination.

After this proposal, the system can recognize that lives rhyme — without ever claiming they should.`
  }
};

const statusColors: Record<string, string> = {
  'Constitutional': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Foundational Extension': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'Domain Charter': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'Domain-Critical Charter': 'bg-red-500/20 text-red-300 border-red-500/40'
};

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown renderer for the NIP content
  const sections = content.split(/\n---\n/);

  return (
    <div className="prose prose-invert prose-amber max-w-none">
      {sections.map((section, idx) => {
        const lines = section.trim().split('\n');
        return (
          <div key={idx} className={idx > 0 ? 'mt-8 pt-8 border-t border-amber-500/10' : ''}>
            {lines.map((line, lineIdx) => {
              // H2 headers
              if (line.startsWith('## ')) {
                return (
                  <h2 key={lineIdx} className="text-xl font-semibold text-amber-200 mt-6 mb-4">
                    {line.replace('## ', '')}
                  </h2>
                );
              }
              // H3 headers
              if (line.startsWith('### ')) {
                return (
                  <h3 key={lineIdx} className="text-lg font-medium text-amber-300/90 mt-5 mb-3">
                    {line.replace('### ', '')}
                  </h3>
                );
              }
              // List items
              if (line.startsWith('* ')) {
                const text = line.replace('* ', '');
                return (
                  <div key={lineIdx} className="flex items-start gap-2 my-2 ml-4">
                    <span className="text-amber-500 mt-1.5">•</span>
                    <span className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{
                      __html: text
                        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-amber-200">$1</strong>')
                        .replace(/\`([^`]+)\`/g, '<code class="bg-space-800 px-1.5 py-0.5 rounded text-amber-400 text-sm">$1</code>')
                    }} />
                  </div>
                );
              }
              // Empty lines
              if (line.trim() === '') {
                return <div key={lineIdx} className="h-2" />;
              }
              // Regular paragraphs
              return (
                <p key={lineIdx} className="text-gray-300 leading-relaxed my-3" dangerouslySetInnerHTML={{
                  __html: line
                    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-amber-200">$1</strong>')
                    .replace(/\*([^*]+)\*/g, '<em class="text-gray-200">$1</em>')
                    .replace(/\`([^`]+)\`/g, '<code class="bg-space-800 px-1.5 py-0.5 rounded text-amber-400 text-sm">$1</code>')
                }} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function NIPDocument({ id, data }: { id: string; data: typeof NIP_CONTENT[string] }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80 backdrop-blur-sm overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer hover:bg-amber-500/5 transition-colors p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-amber-200">{id}</h2>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-amber-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <p className="text-gray-300 mt-1">{data.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{data.type}</p>
                </div>
              </div>
              <Badge variant="outline" className={cn('text-xs shrink-0', statusColors[data.status])}>
                {data.status}
              </Badge>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-6 pb-6 pt-2 border-t border-amber-500/10">
            <MarkdownContent content={data.content} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function NIPPage() {
  const nipIds = Object.keys(NIP_CONTENT).sort();

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

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
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
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
              Constitutional
            </Badge>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 mb-4">
            N&apos;Ko Improvement Proposals
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The constitutional framework for the N&apos;Ko Inscription System. These proposals define
            truth, time, language, and interaction — establishing invariant laws that govern how
            embodied dynamics become verifiable inscriptions.
          </p>
        </div>

        {/* Constitutional Hierarchy */}
        <Card className="mb-8 border-amber-500/20 bg-gradient-to-br from-space-800/60 to-space-900/60 p-6">
          <h2 className="text-lg font-semibold text-amber-200 mb-4">Constitutional Hierarchy</h2>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={statusColors['Constitutional']}>Constitutional</Badge>
              <span className="text-gray-400">Founding principles and invariant laws (NIP-0001)</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={statusColors['Foundational Extension']}>Foundational Extension</Badge>
              <span className="text-gray-400">Core semantic machinery (NIP-0002 through NIP-0008)</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={statusColors['Domain Charter']}>Domain Charter</Badge>
              <span className="text-gray-400">Application to bounded domains (NIP-0009)</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={statusColors['Domain-Critical Charter']}>Domain-Critical Charter</Badge>
              <span className="text-gray-400">Ethical constraints for comparison (NIP-0010)</span>
            </div>
          </div>
        </Card>

        {/* NIP Documents */}
        <div className="space-y-4">
          {nipIds.map((id) => (
            <NIPDocument key={id} id={id} data={NIP_CONTENT[id]} />
          ))}
        </div>

        {/* Footer Quote */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 italic">
            After these proposals, the system does not merely record what happens.
            It knows when something deserves a name — and why that matters.
          </p>
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
                href="/claims"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Claims Reference
              </Link>
              <Link
                href="/technical"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm"
              >
                Technical Docs
                <Code className="w-4 h-4" />
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
