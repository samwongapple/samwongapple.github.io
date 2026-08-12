# Readings Section + Non-Equilibrium Field Theory Study Roadmap — v2

> **Status:** name confirmed **"readings"**; infrastructure BUILT (2026-08-08):
> `readings` collection in `_config.yml`, `_data/reading_threads.yml`,
> `_pages/readings.md`, prod exclusions in `_config_prod.yml`,
> `_bibliography/refs_negf.bib`, and `_readings/template-reading-note.md`.
> No real notes drafted yet. v2 changes: Phase IV (electron–phonon + two-particle +
> electron-gas Green's-function content) promoted from optional branches to core, per
> user request; visual strategy added (§B.7) — every note carries at least one visual.
> First topic: nonequilibrium field theory and Green's functions, from the three
> references in `~/Desktop/Non-equlibrium/`.

This document plays the same role as `berciu-series-roadmap.md`: the plan lives here,
not on any published page (per the no-published-roadmaps rule). It has two parts —
**A** designs the new section (infrastructure, mirroring blog/algorithms), **B** is the
study plan for topic 1.

---

# Part A — The section

## A.0 What this section is

Blog = _derive it yourself, one idea per post_. Algorithms = _implement it, run it,
check it_. The new section is the third mode: **working through a book or long review
front-to-back, chapter by chapter, writing the notes you'd want on a second reading.**
Study notes, not essays: a post here may lean on the source's ordering, quote its
equations, track its conventions, and stay honest about what was skipped. Private,
like the other two.

Name candidates (pick one, then it's just the slug):

| Name         | Flavor                                                                |
| ------------ | --------------------------------------------------------------------- |
| **readings** | recommended — parallel to "algorithms", says exactly what it is       |
| study        | plainer; "study notes" is the natural page subtitle                   |
| margins      | evocative (notes in the margins of books), less discoverable          |
| bookshelf    | groups by source book naturally, but sounds like a review site        |
| seminar      | self-run reading seminar; nice frame, slightly grandiose for solo use |

Suggested listing-page tagline (mirrors the other two sections' style):
_"working through books and long reviews, one chapter at a time — study notes written
to be reread"_.

## A.1 Infrastructure (clone of the algorithms pattern) — BUILT 2026-08-08

Everything mirrors the algorithms section one-for-one (all items below exist now;
kept as documentation of the wiring):

1. **Collection** — in `_config.yml` under `collections:`:
   ```yaml
   readings:
     output: true
     permalink: /readings/:title/
   ```
2. **Entries** — `_readings/<topic>-<nn>-<slug>.md`, front matter identical to an
   algorithms entry (`layout: post`, `categories: [<thread-slug>]`, `toc.sidebar: left`,
   `related_posts: false`).
3. **Threads file** — `_data/reading_threads.yml`, same schema as
   `algorithm_threads.yml` (slug / name / blurb, order = page order, empty threads
   skipped). A _thread = one topic_ (usually one book or one cluster of sources), and
   entries inside are in reading order.
4. **Listing page** — `_pages/readings.md`, cloned from `_pages/algorithms.md`
   (thread grouping + "Other notes" fall-through), `nav_order: 3`.
5. **Privacy** — append to the private block in `_config_prod.yml` (remembering it
   REPLACES arrays, the block is already a verbatim copy):
   ```yaml
   - _readings # study-notes collection
   - _pages/readings.md # readings listing page (+ its navbar link)
   ```
6. **Concept graph** — study notes participate in the concept system _lightly_:
   `requires`/`uses` freely, but `provides` only when a note genuinely becomes the
   site's canonical derivation of something no blog post owns. Default is
   `provides: []` — the blog remains the canonical home of derivations; notes cite
   into it via `{% concept_link %}` rather than competing with it.
7. **Bibliography** — one bib file per topic, `_bibliography/refs_negf.bib` for
   topic 1, following the per-series bib-file convention.

First thread entry for `_data/reading_threads.yml`:

```yaml
- slug: negf
  name: Non-equilibrium field theory
  blurb: Green's functions with the clock running — one contour ordering the bra and the ket, read three ways: operator equations of motion (Stefanucci–van Leeuwen), the path integral (Kamenev), and the fast bridge from Matsubara (Kita) — down the hierarchy from Dyson to Boltzmann to hydrodynamics.
```

---

# Part B — Topic 1: nonequilibrium field theory and Green's functions

## B.0 The three sources and the role each plays

All three were read (ToC + preface + chapter-level skim for the books; cover-to-cover
for the article) on 2026-08-08. Division of labor:

- **Stefanucci & van Leeuwen, _Nonequilibrium Many-Body Theory of Quantum Systems_,
  2nd ed. 2025 (721 pp) — "SvL", the spine of Phase I.** Operator-based, zero path
  integrals. One unified contour (forward + backward + vertical Matsubara track, i.e.
  Konstantinov–Perel) from which Matsubara, zero-T, and Keldysh formalisms all _drop
  out_ as special cases — "no need to learn the same thing three times." Initial
  correlations kept honestly (KMS boundary conditions, mixed vertical-track
  components). Every result derived. New-in-2e Ch 16 (electron–phonon NEGF) and Ch 17
  (the ladder KBE → GKBA → semiconductor Bloch → Boltzmann → Redfield/Lindblad) are
  directly relevant payloads. Page map: printed p. N = PDF p. N+22.
- **Kamenev, _Field Theory of Non-Equilibrium Systems_, 2nd ed. 2023 (513 pp) —
  the spine of Phase II.** Path-integral throughout: discretized contour → coherent
  states → Keldysh rotation (cl/q), Z = 1 causality as the running principle. Uniquely
  unifies quantum Keldysh, Lindblad (new Ch 5), and classical MSR/Langevin in one
  notation, and is the gateway to the literature my research actually touches
  (fermionic Lindbladians, sigma-model treatments of monitored fermions, OTOCs on the
  four-branch contour). Page map: printed p. N = PDF p. N+21.
- **Kita, "Introduction to Nonequilibrium Statistical Mechanics with Quantum Field
  Theory", Prog. Theor. Phys. 123, 581 (2010) (78 pp) — the bridge and two
  irreplaceable modules.** §2–3 is the most efficient path from "I know
  Matsubara/zero-T diagrams" to "I can write the contour Dyson equation and
  Φ-derivable self-energies" (~17 pages, operator language, branch-index Feynman rules
  as an alternative to Langreth). Its unique payloads, in neither book: a
  nonequilibrium **entropy density with an H-theorem** (§4.5–4.6, App. D), and the
  complete microscopic chain **Dyson → transport → Boltzmann → Chapman–Enskog →
  Navier–Stokes with a computed Prandtl number** (§5, §8–9). Journal p. N = PDF
  p. N−580.

Deliberate omissions from all three (so the notes must bridge, not expect): circuits,
measurements-as-dynamics, entanglement measures, replica tricks for monitored systems,
tensor networks. That bridging is exactly the value of writing the notes.

## B.1 The intellectual spine

One sentence: **out of equilibrium the spectral function and the occupation stop being
locked together, and the whole formalism is bookkeeping for that divorce.**

The arc the series walks, which is also the hierarchy Kita states as his aim:

1. Expectation values of Heisenberg operators fold time into a closed contour —
   the bra and ket evolutions become the two branches (this is _the same doubling_ as
   the folded influence-matrix picture already on the site).
2. One contour-ordered G, one Dyson equation; all equilibrium formalisms are limits.
3. Keldysh components: G^R/G^A carry spectrum (what states exist), G^K / G^< carry
   occupation (how they're filled); equilibrium = FDT locks them; nonequilibrium =
   the lock is off, and a kinetic equation governs the occupation.
4. Wigner transform + gradient expansion turns the Dyson equation into quantum
   kinetics; the quasiparticle limit is Boltzmann; moments of Boltzmann are
   hydrodynamics; entropy growth (H-theorem) enters at a _provable_ step.
5. The same structure read as a path integral gives the Keldysh action, whose
   classical limit is MSR/Langevin and whose Markovian open-system limit is Lindblad —
   one formalism containing quantum dynamics, classical stochastic dynamics, and
   open-system master equations as corners.

## B.2 Convention decisions (fix once, before R1)

The three sources genuinely disagree; the series picks one dictionary and each note
translates on contact:

- **Contour:** SvL's full contour (γ₋ forward, γ₊ backward, vertical Matsubara track)
  is the master object; Keldysh's adiabatic-switching two-branch contour (Kamenev,
  Kita — who explicitly _rejects_ the vertical track) is derived as the
  initial-correlations-free limit. Note the disagreement in R2; it is physics
  (pre-thermalization vs. explicit initial correlations), not taste.
- **Component names:** G^≷, G^R, G^A, G^M plus the two mixed vertical components
  (SvL's ⌐-shaped pair). Kita's numbered branches: G^12 = G^<, G^21 = G^>.
- **Fermionic Keldysh rotation:** Larkin–Ovchinnikov upper-triangular
  [[G^R, G^K],[0, G^A]] (Kamenev's fermions and Kita agree). Kamenev's _bosonic_
  cl/q factors (1/2 vs 1/√2 asymmetry, and the Sieberer-review symmetric convention)
  get an explicit dictionary box in R8.
- **Occupation bookkeeping:** G^K = G^R∘F − F∘G^A with F = tanh / coth in
  equilibrium (Kamenev), alongside Kita's (A, φ) split G^< = ∓iAφ — the two
  parametrizations of the same divorce; R4 owns the comparison.
- **ℏ = 1** (both books; Kita keeps ℏ — silently normalize when quoting him).
- **Site notation audit** (full pass at drafting time, per CONTRIBUTING-posts.md):
  Σ (self-energy) and A (spectral function) already carry these meanings in the
  dressed-particles thread — consistent, reuse. Watch: **F** (distribution matrix
  here; free energy elsewhere — scope in prose), **φ** (Kita's distribution
  function vs. any phase usage), **Φ** (Luttinger–Ward functional — new symbol,
  add to concepts if it lands in a `provides`), **Z** already has documented
  exceptions (quasiparticle weight in dressed-particles — this thread inherits that
  scoped meaning, no new exception needed), **λ, Δ, Ω** per existing site rules.

## B.3 Post list

Three phases ≈ three sub-arcs; ~15 core notes plus optional branches. Reading
assignments are what the note digests, not everything the note mentions. Each note
ends on one open question (per the no-roadmap-in-public rule).

### Phase I — The contour, operator first (SvL spine + Kita bridge)

**R1 — "Why time folds back"**
_Read:_ SvL Ch 3–4 (pp. 79–122); Kita §2 (the 5-page contour derivation).
_Payload:_ the contour emerges from ⟨U† O U⟩, never postulated; branch doubling ≡
bra/ket legs of the folded picture; adiabatic switching vs. vertical track as two
answers to "where did the initial state come from"; contour Heisenberg picture.
_Seam:_ explicit dictionary to the influence-matrix folded-time objects — this note
is the missing "why the IM has two legs per time step" prequel to that series.

**R2 — "One Green's function, three formalisms"**
_Read:_ SvL Ch 5 (pp. 123–146); Kita §3.1–3.2; skim SvL App. B.
_Payload:_ contour-ordered G*n; Martin–Schwinger hierarchy with KMS boundary
conditions; Wick's theorem on the contour (valid for any Gaussian ρ₀ — Danielewicz's
point); Matsubara / zero-T / Keldysh as limits of one object.
\_Seam:* Wick-on-the-contour is the two-time generalization of the correlation-matrix
toolkit from the free-fermions thread.

**R3 — "The component zoo"**
_Read:_ SvL §5.5 + §6.1–6.2 (Langreth rules, noninteracting G in every component);
Kita §3.3 + §3.5 (branch-summation rules, Larkin–Ovchinnikov rotation) as the
alternative bookkeeping.
_Payload:_ Langreth table derived once, carefully; the noninteracting (Gaussian)
propagator in all components — the free-fermion Keldysh propagator as _the_ worked
example.

**R4 — "Spectrum and occupation get divorced"**
_Read:_ SvL §6.3 (Lehmann, FDT, spectral function); Kita §4.1 ((A, φ) split).
_Payload:_ the series' central idea stated cleanly: G^R/A know what states exist,
G^≷/G^K know how they're filled; KMS/FDT as the equilibrium lock; F-parametrization
vs (A, φ) as the two divorce settlements.
_Seam:_ this is what "beyond the equal-time correlation matrix" means — the
free-fermion posts live at equal time; this note is the two-time upgrade.

**R5 — "Diagrams on the contour"**
_Read:_ SvL Ch 7 (pp. 195–214) + Ch 8 fast (Hartree–Fock as time-local Σ).
_Payload:_ same diagram topology as equilibrium, only the time axis changed; Dyson
equation on the contour; G-skeleton vs W-skeleton.
_Seam:_ direct nonequilibrium extension of the dressed-particles series' Dyson/Σ
machinery ("The Self-Energy Is a Matrix" gets a time axis).

**R6 — "Approximations that don't leak"**
_Read:_ SvL Ch 12 (+ §11.3 for the Φ functional, selective); Kita §3.4 + §8
(symmetry-based conservation proofs — the compact version).
_Payload:_ Φ-derivability; Baym's theorem: conserving ⟺ Σ = δΦ/δG; GW and T-matrix
as the standard conserving pair; what breaks when you improvise a self-energy.

**R7 — "Kadanoff–Baym: dynamics with memory"**
_Read:_ SvL Ch 9 (pp. 235–256), incl. §9.4–9.5 (open systems, embedding self-energy,
Meir–Wingreen, Landauer–Büttiker); App. J (KBE numerics) skimmed.
_Payload:_ the KBE as the exact two-time dynamics; memory integrals as the price of
integrating out; embedding Σ as "the lead is an influence functional."
_Seam:_ the resonant-level-model IM solver (algorithms, influence-matrix 05) computes
exactly what Meir–Wingreen computes — a quantitative cross-check is the natural
companion-algorithm entry (see B.5).

### Phase II — The same physics as a path integral (Kamenev spine)

**R8 — "Z = 1: the Keldysh path integral"**
_Read:_ Kamenev Ch 1–2 (pp. 1–32).
_Payload:_ discretized contour done honestly (the ±i0 and boundary-term pitfalls);
coherent-state construction; Keldysh rotation, cl/q components; causality structure
of the action; why Z = 1 kills denominators (and later, why disorder averaging needs
no replicas). Conventions dictionary box (Kamenev vs SvL vs Sieberer factors).

**R9 — "The influence functional was Keldysh all along"**
_Read:_ Kamenev Ch 3 (pp. 33–49).
_Payload:_ particle + Caldeira–Leggett bath on the contour; integrating out the bath
= Feynman–Vernon influence functional, in cl/q variables; Matsubara↔Keldysh
dictionary; dissipative tunneling.
_Seam:_ the influence-matrix series built this object as a tensor; here it is as an
action. Strongest single bridge in the whole plan.

**R10 — "When ℏ drops out"**
_Read:_ Kamenev Ch 4 (pp. 50–86), skimming §4.5–4.8 as needed.
_Payload:_ MSR action as the classical limit; X^q survives as the response field;
Langevin via Hubbard–Stratonovich; Fokker–Planck; Ito vs Stratonovich from contour
discretization; fluctuation relations.
_Seam:_ the noise/filter-function thread's classical stochastic machinery, now as a
corner of one quantum formalism.

**R11 — "Lindblad from Keldysh and back"**
_Read:_ Kamenev Ch 5 (pp. 87–124); SvL §17.7 (Redfield/Lindblad from NEGF) as the
operator-side mirror.
_Payload:_ RWA + Markov bath ⇒ Lindblad as a limit of the Keldysh action; the reverse
map (Lindbladian as Keldysh action); validity conditions stated as approximations,
not axioms; dark spaces, dissipative symmetries.
_Seam:_ monitored-dynamics thread — this is the no-measurement (averaged) half of
monitoring; the note should say precisely what averaging over outcomes discards.

**R12 — "Grassmann on the contour"**
_Read:_ Kamenev Ch 10 (pp. 245–273), incl. Problem 10.9.3 (fermionic Lindbladian
action).
_Payload:_ Grassmann Gaussian integrals in real time; fermionic LO rotation; free
Fermi gas Keldysh action; the fermionic Lindbladian — the quadratic-Lindbladian
setting of the monitored-free-fermions post, now derivable.
_Seam:_ matchgates/fermionic-shadows Grassmann machinery, real-time edition.

### Phase III — Down the hierarchy (kinetics and irreversibility)

**R13 — "From Dyson to Boltzmann"**
_Read:_ Kamenev Ch 6 (pp. 125–145) + §11.1; Kita §4.1–4.4 + §5 (the (A, φ) kinetic
equation, Botermans–Malfliet, quasiparticle vs quasiclassical limits).
_Payload:_ Wigner transform, Moyal product, first-order gradient expansion; the
kinetic equation as the Keldysh component of Dyson; collision integrals; exactly
which approximations separate "exact two-time KBE" from "Boltzmann."

**R14 — "Where irreversibility enters"**
_Read:_ Kita §4.5–4.6 + App. D; SvL §17.5.2; Kita §3.1's arrow-of-time digression.
_Payload:_ nonequilibrium entropy density that reduces to the exact equilibrium
entropy; H-theorem proven within second-order Φ (and open beyond it); irreversibility
as a consequence of stated approximations — the microscopic answer to "when did we
break time-reversal."
_Seam:_ conceptual counterpoint to entanglement-entropy growth in the monitored and
solvable-circuits threads; the note should draw the contrast explicitly.

**R15 — "The ladder down: GKBA and its children"**
_Read:_ SvL Ch 17 (pp. 521–572), §17.1 + §17.5–17.7 carefully, §17.3–17.4 skimmed.
_Payload:_ the full ladder KBE (T³, exact memory) → GKBA (time-linear, mirrored form)
→ semiconductor Bloch → Boltzmann → Redfield/Lindblad, every rung an explicit
approximation; cost-vs-memory framing.
_Seam:_ GKBA truncates memory _perturbatively_; the influence matrix truncates it by
_temporal entanglement_. That comparison — same problem, two compressions — is the
series' closing open question and a genuine research seam.

### Phase IV — Green's functions at work (promoted to core in v2)

The "more Green's-function content" phase: two-particle objects, the electron gas as
the standard worked example, and phonons on the contour — chosen because each one is
the nonequilibrium completion of something the site already derives.

**R16 — "Phonons join the contour"**
_Read:_ SvL Ch 16 (pp. 451–520; §16.1–16.2 skimmed, §16.3–16.11 the meat) + SvL §2.8
(Holstein, Peierls, Lang–Firsov) as warm-up; Kamenev Ch 18 (§18.1–18.4) for the
path-integral mirror (phonon action, distribution matrix B, Fröhlich vs Pippard).
_Payload:_ boson ("phoson") Green's functions D on the contour; the mixed
electron–boson Martin–Schwinger hierarchy and Wick theorem; Fan–Migdal self-energy;
Hedin–Baym equations; coupled electron + phonon Kadanoff–Baym dynamics.
_Seam:_ the direct nonequilibrium completion of the dressed-particles thread — what
the Holstein polaron's spectral function (MA's central object) becomes with the clock
running. This is the note that pays the Berciu series back.

**R17 — "Two particles on the contour"**
_Read:_ SvL Ch 14 (pp. 357–410; §14.1–14.8 carefully, §14.9–14.10 skimmed) + SvL
§6.4 (what TR-ARPES and photoemission actually measure).
_Payload:_ G₂ diagrammatics; Bethe–Salpeter equation with kernel K = ±δΣ/δG;
excitons and the excitonic Mott transition; the particle–particle T-matrix and
Cooper-pair formation; response functions as two-particle objects.
_Seam:_ the two-time, conserving generalization of the Berciu series' few-particle
Green's functions (P5) and two-particle pairing story (P7); Kita §7 gives the compact
functional-derivative version worth quoting.

**R18 — "The electron gas as the standard candle"**
_Read:_ SvL Ch 15 (pp. 411–450); Kamenev Ch 7 (§7.1–7.4) for RPA/plasmons in
action language.
_Payload:_ GW in practice: lifetimes, quasiparticle weight Z*k, RPA screening,
plasmons and Landau damping, the GW spectral function with satellites — plus the
genuinely nonequilibrium example (quench dynamics of plasmons). The one chapter where
every abstraction of R1–R7 computes a number.
\_Seam:* spectral-function anatomy (quasiparticle peak + satellite) is exactly the
polaron phenomenology of the dressed-particles thread, in a different medium.

### Optional branch notes (unscheduled; pick by research pull)

- **B-dis — Disorder without replicas, and the sigma model.** Kamenev Ch 14.
  Steep, but it is the technology under Keldysh/NLSM treatments of monitored
  fermions — the field-theory sequel the monitored thread currently gestures at.
- **B-otoc — Four branches: OTOCs.** Kamenev §12.5. Short; the contour picture
  behind the folded objects in the solvable-circuits thread.
- **B-fcs — Counting statistics.** Kamenev §4.9 + §13.3. Statistics of measurement
  records; distant kinship with shadows/tomography interests.
- **B-hydro — All the way to Navier–Stokes.** Kita §9 (+§8.4). Chapman–Enskog with
  a computed Prandtl number; satisfying closure of Kita's hierarchy, low research
  relevance — write only if the itch demands it.

## B.4 Sequencing and honest scoping

- **Order within phases is load-bearing** (each note assumes the previous); the
  _phases_ are more independent than they look — Phase II (Kamenev) needs only
  R1–R4 from Phase I, so R8 can start while R5–R7 are half-digested if momentum
  wants it. R13–R15 genuinely need both spines. Phase IV needs R5–R7 (diagrams,
  Φ-derivability, KBE); R16 additionally benefits from R8's action language, and
  R17–R18 can be read in either order after R16.
- **Phase IV is core but last** — it is the payoff phase, and pulling it earlier
  (e.g. R16 right after R7, if the dressed-particles thread is hot) is a legitimate
  reordering; only the R5–R7 prerequisite is hard.
- Kita §2–3 + App. B–C is officially _pre-reading for R1–R2_ — the fastest
  Matsubara-to-contour bridge — even though its payload notes (R14) come last.
- Natural pause points: after R7 (operator formalism complete), after R12 (both
  representations in hand), after R15 (the hierarchy walked). Each phase ends
  somewhere self-respecting.
- Skipped consciously: SvL Ch 1–2 (second quantization — known; §2.4/§2.7/§2.8 kept
  as reference), SvL Ch 10–11 (reference on demand), Kamenev Ch 8–9 and 15–17
  (BEC/mesoscopics/superconductors — beautiful, not on the critical path),
  Kita §6 (gauge-invariant EM transport) and App. A.
- ~18 core notes is honest for two textbook spines + a review; do not let R5/R6
  balloon — the dressed-particles thread owns deep diagrammatics, these notes cite
  into it.

## B.5 Companion-algorithm seams (future `_algorithms` entries, not this section)

1. **KBE vs. IM on the resonant level model** — solve the Kadanoff–Baym equations
   (SvL App. J) for the RLM and cross-check the influence-matrix solver from
   influence-matrix-05. One model, two exact methods, one plot. (After R7.)
2. **GKBA vs. exact memory** — implement time-linear GKBA (SvL §17.6) on the same
   model; measure what the memory truncation costs vs. the IM's temporal-entanglement
   truncation. (After R15; this is the series' closing question made runnable.)
3. **Fermionic Lindbladian ↔ quadratic master equation** — Kamenev Problem 10.9.3
   numerically, tied to the monitored-free-fermions machinery. (After R12.)

## B.6 Visual strategy (added in v2)

**Rule: every note carries at least one visual**, chosen by what the idea _is_:

- **Structure → theme-aware inline SVG.** Contours, component tables, diagram
  topologies, hierarchy ladders. Colors via CSS variables
  (`--global-theme-color`, `--global-text-color`, `--global-divider-color`) so both
  themes work; no raster images of equations or contours, ever.
- **Parameter dependence → `<canvas>` + `<script>` widget** (the established site
  pattern, e.g. `assets/js/matchgate-sandbox.js`; JS in `assets/js/<note-slug>.js`,
  theme colors read from the CSS variables). If the sentence describing the figure
  contains "as you increase…", it should be a widget, not a static plot.
- **Numbers → tiny precomputed plots** only when a widget would need a real solver;
  keep the generating script alongside future companion-algorithm entries.

Per-note visual plan (the load-bearing ones; more welcome at drafting time):

| Note | Visual                                                                                                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1   | SVG sequence: one timeline → folded double timeline → contour with vertical track; side-by-side with the influence-matrix folded-tensor picture (same doubling, two costumes)     |
| R2   | SVG map: the one contour G with Matsubara / zero-T / Keldysh limits as contour deformations (SvL's "learn it once" picture)                                                       |
| R3   | Interactive component map: hover a pair of contour-time placements (z on γ₋/γ₊/vertical) → which component G^≷/R/A/M/⌐ it is + its Langreth rule                                  |
| R4   | **The series' flagship widget:** A(ω) and occupation side by side with an "equilibrium lock" toggle — FDT on: φ slaved to tanh; off: independent; shows what "divorce" means      |
| R5   | SVG: same diagram topology drawn twice — imaginary-time axis vs contour — "only the time axis changed"                                                                            |
| R7   | SVG: the two-time (t, t′) plane with KBE time-stepping structure, memory integrals as shaded regions                                                                              |
| R8   | SVG: discretized contour with the ±i0 regularization sites marked; cl/q rotation as a 45° change of basis                                                                         |
| R9   | Widget: Caldeira–Leggett kernel — bath spectral density J(ω) knob → friction + noise kernels; the Gaussian influence functional as a heat map over (t, t′)                        |
| R11  | SVG ladder: Keldysh action → (RWA, Markov) → Lindblad, each arrow labeled by the approximation it costs                                                                           |
| R13  | Widget: Wigner function of a wave packet with an ℏ/gradient-expansion knob — watch the Moyal correction terms matter, then not                                                    |
| R14  | Widget or plot: entropy density s(t) for a relaxing two-level distribution — monotone growth, equality only at local equilibrium                                                  |
| R15  | SVG ladder: KBE → GKBA → Bloch → Boltzmann → Redfield/Lindblad, arrows = approximations, annotated with cost scaling (T³ → T…)                                                    |
| R16  | Widget: polaron-style spectral function A(k, ω) with e–ph coupling knob — quasiparticle peak, phonon satellites, Fan–Migdal broadening (visual twin of the Berciu-thread widgets) |
| R17  | SVG: BSE ladder/bubble topologies; excitonic binding pulling a pole out of the continuum (small plot)                                                                             |
| R18  | Widget: RPA dielectric function — plasmon dispersion and Landau-damping region as r_s / q vary; GW spectral function with its plasmon satellite                                   |

## B.7 Drafting workflow

Per note: (1) read the assignment with the payload bullets as the extraction target;
(2) draft from `_readings/template-reading-note.md` (source-note box naming the
source + exact section range read, since study notes must be honest about scope);
(3) build the §B.6 visual for the note — at least one, SVG or widget;
(4) notation pass against §B.2 and `/notation/`; (5) concept front matter — default
`provides: []`, `requires`/`uses` from the blog's existing graph; (6) end on one
open question; (7) `bin/validate-concepts`.

Roadmap-level drafting prompt, per note:

> Draft readings-section note R<n> "<title>" per docs/readings-section-roadmap.md
> §B.3, starting from \_readings/template-reading-note.md. Sources: <assignment with
> page ranges>. Extract the payload bullets as the note's sections; translate all
> conventions into the series dictionary (§B.2); build the note's visual per §B.6
> (SVG or canvas widget, theme-aware); cite existing blog derivations via
> concept_link instead of re-deriving; keep the seam paragraph concrete; end on the
> listed open question.
