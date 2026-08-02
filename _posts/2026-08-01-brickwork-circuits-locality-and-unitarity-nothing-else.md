---
layout: post
title: "Brickwork Circuits: Locality and Unitarity, Nothing Else"
date: 2026-08-01 08:00:00-0700
description: Strip quantum many-body dynamics down to the two ingredients no theory gets to drop — things happen locally, and they happen unitarily — and what remains is a brickwork circuit, a tensor network filling spacetime. Two diagrammatic rules then prove strict causality for free. What they do not do is make anything else computable, and seeing exactly where the exponential hides is the point of drawing the picture.
tags: [dual-unitary, quantum-circuits, tensor-networks, many-body-dynamics]
categories: [solvable-circuits]
related_posts: false
provides: [brickwork-circuit, tensor-network-diagrams, operator-vectorization, lightcone-causality]
requires: [pauli-algebra, density-matrix]
uses: [folded-circuit, space-time-rotation]
toc:
  sidebar: left
---

<style>
  .sec-divider {
    text-align: center;
    color: var(--global-theme-color);
    opacity: 0.6;
    letter-spacing: 0.6em;
    margin: 2.75rem 0 2rem;
    user-select: none;
  }
  .thread-note {
    --thread-color: #b3760a; /* amber — the 'narrative thread' colour, not the teal accent */
    border-left: 4px solid var(--thread-color);
    background: color-mix(in srgb, var(--thread-color) 8%, transparent);
    border-radius: 0 6px 6px 0;
    padding: 0.6rem 0.9rem;
    margin: 1.4rem 0;
    font-size: 0.95rem;
  }
  html[data-theme="dark"] .thread-note {
    --thread-color: #e0a63a;
  }
  .thread-note .thread-label {
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.09em;
    font-weight: 700;
    color: var(--thread-color);
    margin-right: 0.5rem;
  }
  .ledger-note {
    --ledger-color: #a34732; /* brick red — the assumptions ledger */
    border-left: 4px solid var(--ledger-color);
    background: color-mix(in srgb, var(--ledger-color) 7%, transparent);
    border-radius: 0 6px 6px 0;
    padding: 0.6rem 0.9rem;
    margin: 1.4rem 0;
    font-size: 0.95rem;
  }
  html[data-theme="dark"] .ledger-note {
    --ledger-color: #cf6a50;
  }
  .ledger-note .ledger-label {
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.09em;
    font-weight: 700;
    color: var(--ledger-color);
    margin-right: 0.5rem;
  }
  .learn-more-box {
    border: 1.5px solid var(--global-theme-color);
    border-radius: 10px;
    background: color-mix(in srgb, var(--global-theme-color) 6%, transparent);
    margin: 1.5rem 0;
    overflow: hidden;
  }
  .learn-more-box > details > summary {
    cursor: pointer;
    padding: 0.7rem 1rem;
    font-weight: 600;
    color: var(--global-theme-color);
  }
  .learn-more-box > details > summary:hover {
    background: color-mix(in srgb, var(--global-theme-color) 10%, transparent);
  }
  .learn-more-box > details[open] > summary {
    border-bottom: 1px solid var(--global-divider-color);
  }
  .learn-more-box > details > *:not(summary) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .learn-more-box > details > summary + * {
    padding-top: 0.75rem;
  }
  .learn-more-box > details > *:not(summary):last-child {
    padding-bottom: 0.75rem;
  }
</style>

<!-- =====================================================================
     SERIES: "Solvable Circuits" — Part 1 of a planned 7 (internal map:
     P1 brickwork/TN calculus → P2 dual unitarity & exact correlations
     [P1+P2 published together] → P3 gate zoo/classification → P4
     entanglement & membrane → P5 temporal entanglement bridge to the
     influence-matrix thread → P6 projected ensembles → P7 biunitarity &
     the solvability hierarchy. Spine reference: Bertini–Claeys–Prosen,
     arXiv:2505.11489. Roadmap stays internal per site policy — each post
     ends on ONE open question only.

     THROUGH-LINE (escalates over the series): solvability here is not a
     conserved quantity or a clever ansatz — it is a GEOMETRIC property
     of the spacetime tensor network. P1: the network and its two rules.
     P2: one extra symmetry (unitary sideways) makes chaos computable.

     SERIES CONVENTIONS (pinned here, do not drift):
       q       local Hilbert dimension (q=2 in every demo)
       sites   x = 0..L-1, PBC in demos; site 0 = MSB in basis indices
       layers  even layer first: gates on (0,1),(2,3),…; then odd:
               (1,2),(3,4),…,(L-1,0). One layer = one HALF-step; t counts
               full periods. Speed: one site per layer ⇒ cone edge moves
               2 sites per period.
       a_x(t)  Heisenberg operator U_F^{-t} a_x U_F^t
       |O⟩⟩    vectorized operator; folded leg dimension q²
       σ_α     Hilbert–Schmidt-orthonormal one-site basis, σ_0 = 1/√q
       Ũ       the reshuffled (space-direction) gate — introduced in P2,
               NOT the partial transpose, say so loudly there.
     Numerics verified in scratchpad du_reference.py (numpy) and mirrored
     in the widget's node harness — every number quoted below is checked.
     Widget: assets/js/spacetime-circuit.js.
     ===================================================================== -->

Every thread on this blog eventually runs into the same wall. The
[free-fermion posts]({% post_url 2026-07-06-free-fermions-one-matrix %}) climb over it
with Gaussianity, the
[matchgate posts]({% post_url 2026-07-28-matchgates-free-fermions-wearing-qubit-clothing %})
with a special gate algebra, the
[influence-matrix posts]({% post_url 2026-07-28-influence-matrix-integrating-out-everything-but-the-question %})
by compressing the environment in the time direction. The wall itself is always the same:
a many-body quantum state is $$q^L$$ complex numbers, and generic dynamics scrambles all
of them.

This post starts a new thread that walks up to the wall carrying as little as possible.
No Hamiltonian, no symmetry, no integrability — just the two ingredients no quantum
theory gets to drop: **things happen locally**, and **they happen unitarily**. The
cleanest model with exactly those two ingredients and nothing else is a *brickwork
circuit*, and the right way to hold it is as a **tensor network filling spacetime**. Two
diagrammatic rules will fall out of the picture, and together they prove a real theorem —
strict causality — in about four moves. What they will *not* do is make anything else
computable. Seeing precisely where the exponential survives inside the light cone is the
whole reason to draw the picture, because the next post removes it with one symmetry.

## 1 · The minimal model of many-body dynamics

Take a ring of $$L$$ sites, each carrying a $$q$$-dimensional Hilbert space —
$$q = 2$$, a qubit, in every demo below. Time advances in discrete strokes. One stroke
applies a two-site unitary gate $$U \in U(q^2)$$ to every *even* pair of neighbours,
$$ (0,1), (2,3), \dots$$; the next stroke applies it to every *odd* pair,
$$(1,2), (3,4), \dots$$ One full period is the pair of layers,

$$
U_F \;=\; \Big[\textstyle\bigotimes_{\text{odd } i} U_{i,i+1}\Big]
          \Big[\textstyle\bigotimes_{\text{even } i} U_{i,i+1}\Big],
$$

and the pattern of gates, drawn in the plane with time running upward, is a wall of
staggered bricks:

<div style="text-align:center;margin:1.5rem 0;">
  <svg viewBox="0 0 520 240" style="max-width:520px;width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Brickwork circuit: staggered rows of two-site gates, time running upward">
    <defs>
      <marker id="p1f1-a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor" fill-opacity="0.6"/></marker>
    </defs>
    <!-- wires -->
    <g stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2">
      <line x1="70" y1="210" x2="70" y2="30"/><line x1="120" y1="210" x2="120" y2="30"/>
      <line x1="170" y1="210" x2="170" y2="30"/><line x1="220" y1="210" x2="220" y2="30"/>
      <line x1="270" y1="210" x2="270" y2="30"/><line x1="320" y1="210" x2="320" y2="30"/>
      <line x1="370" y1="210" x2="370" y2="30"/><line x1="420" y1="210" x2="420" y2="30"/>
    </g>
    <!-- even layers -->
    <g fill="var(--global-theme-color)" fill-opacity="0.18" stroke="var(--global-theme-color)" stroke-width="1.5">
      <rect x="55" y="176" width="80" height="24" rx="7"/><rect x="155" y="176" width="80" height="24" rx="7"/>
      <rect x="255" y="176" width="80" height="24" rx="7"/><rect x="355" y="176" width="80" height="24" rx="7"/>
      <rect x="55" y="96" width="80" height="24" rx="7"/><rect x="155" y="96" width="80" height="24" rx="7"/>
      <rect x="255" y="96" width="80" height="24" rx="7"/><rect x="355" y="96" width="80" height="24" rx="7"/>
    </g>
    <!-- odd layers (staggered) -->
    <g fill="var(--global-theme-color)" fill-opacity="0.18" stroke="var(--global-theme-color)" stroke-width="1.5">
      <rect x="105" y="136" width="80" height="24" rx="7"/><rect x="205" y="136" width="80" height="24" rx="7"/>
      <rect x="305" y="136" width="80" height="24" rx="7"/>
      <rect x="105" y="56" width="80" height="24" rx="7"/><rect x="205" y="56" width="80" height="24" rx="7"/>
      <rect x="305" y="56" width="80" height="24" rx="7"/>
    </g>
    <g fill="var(--global-theme-color)" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">
      <text x="95" y="192">U</text><text x="195" y="192">U</text><text x="295" y="192">U</text><text x="395" y="192">U</text>
      <text x="145" y="152">U</text><text x="245" y="152">U</text><text x="345" y="152">U</text>
      <text x="95" y="112">U</text><text x="195" y="112">U</text><text x="295" y="112">U</text><text x="395" y="112">U</text>
      <text x="145" y="72">U</text><text x="245" y="72">U</text><text x="345" y="72">U</text>
    </g>
    <!-- axes -->
    <line x1="40" y1="205" x2="40" y2="120" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.2" marker-end="url(#p1f1-a)"/>
    <text x="40" y="110" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">time</text>
    <line x1="70" y1="228" x2="160" y2="228" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.2" marker-end="url(#p1f1-a)"/>
    <text x="188" y="232" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" fill-opacity="0.8">space</text>
    <text x="452" y="192" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" fill-opacity="0.7">even layer</text>
    <text x="452" y="152" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" fill-opacity="0.7">odd layer</text>
  </svg>
</div>

Why is this the *right* minimal model, and not a caricature? Three reasons.

**It keeps exactly the two universal ingredients.** Any local Hamiltonian evolution
Trotterizes into precisely this pattern; any quantum computation compiles into it. The
brickwork is what locality plus unitarity look like when you refuse to add anything else.
Continuous time, energy conservation, even the existence of a Hamiltonian are extras —
and the dynamics questions we care about (how do correlations spread? how fast is
information scrambled?) never needed them.

**Every knob is one object.** The entire model is the single $$q^2 \times q^2$$ matrix
$$U$$. Choose it once and repeat it everywhere — a *Floquet* circuit, discrete
translation invariance in both space and time — or draw each brick at random and study
the ensemble. This thread is about the Floquet case; the random case is the
indispensable point of comparison and we will meet it in §5.

**It is where the modern results live.** The last decade's sharpest statements about
chaos, scrambling and entanglement growth — the ones this series is built to reach —
are theorems about brickwork circuits, not about any Hamiltonian
{% cite fisher2023random --file refs_dual_unitary %}.

<p class="ledger-note"><span class="ledger-label">Assumptions ledger</span>
One gate everywhere (Floquet); local dimension q finite; a ring of L sites with L large
enough that boundaries never enter (every claim below is checked at finite L and the
light cone never wraps); observables are one-site operators; and — from §3 on — the
infinite-temperature state is the background. Each entry is load-bearing and we will
point at the ones that fail first when relaxed.</p>

## 2 · Boxes and wires: the only two rules

A tensor network is bookkeeping made visual: a box is a tensor, a leg is an index, and
joining two legs means summing over that index. The gate $$U$$, matrix elements
$$\langle a b \rvert U \lvert c d\rangle$$, is a box with two legs entering from below
(the inputs $$c, d$$) and two leaving above (the outputs $$a, b$$). The brickwork
picture of §1 *is* the tensor network of the evolution operator: contract all the
internal legs and you recover the $$q^L \times q^L$$ matrix $$U_F^t$$, one monstrous
tensor assembled from cheap identical pieces.

The reason to draw the picture is that the two physical ingredients become two *local,
graphical* rules.

**Rule 1 — unitarity.** $$U^\dagger U = \mathbb{1}$$ says: a box meeting its dagger
through both legs is invisible. Diagrammatically, the pair annihilates into two straight
wires:

<div style="text-align:center;margin:1.5rem 0;">
  <svg viewBox="0 0 500 150" style="max-width:500px;width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Unitarity as a diagrammatic rule: a gate contracted with its dagger equals two straight wires">
    <!-- U dagger U = 1 -->
    <g stroke="currentColor" stroke-opacity="0.5" stroke-width="1.2">
      <line x1="100" y1="130" x2="100" y2="20"/><line x1="150" y1="130" x2="150" y2="20"/>
    </g>
    <rect x="82" y="82" width="86" height="24" rx="7" fill="var(--global-theme-color)" fill-opacity="0.18" stroke="var(--global-theme-color)" stroke-width="1.5"/>
    <rect x="82" y="44" width="86" height="24" rx="7" fill="var(--global-theme-color)" fill-opacity="0.18" stroke="var(--global-theme-color)" stroke-width="1.5"/>
    <text x="125" y="98" fill="var(--global-theme-color)" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">U</text>
    <text x="125" y="60" fill="var(--global-theme-color)" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">U&#8224;</text>
    <text x="215" y="80" fill="currentColor" font-size="15" font-family="system-ui, sans-serif" text-anchor="middle">=</text>
    <g stroke="currentColor" stroke-opacity="0.5" stroke-width="1.2">
      <line x1="265" y1="130" x2="265" y2="20"/><line x1="315" y1="130" x2="315" y2="20"/>
    </g>
    <text x="415" y="70" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">two wires:</text>
    <text x="415" y="84" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">the pair annihilates</text>
  </svg>
</div>

**Rule 2 — locality.** There is no rule 2. Locality is not an equation — it is the
*shape* of the network: a gate touches two neighbouring wires and nothing else. Every
consequence of locality will be read off the geometry of the bricks.

That is the entire calculus. It looks too small to prove anything. The rest of this post
is one long demonstration that it is not, and the punchline of the series is that adding
a *second* copy of Rule 1 — rotated ninety degrees — turns the calculus from "proves
causality" into "computes correlation functions of a chaotic model exactly." But that is
the next post.

<p class="thread-note"><span class="thread-label">The through-line</span>
Solvability, in this thread, will never come from a conserved quantity or a clever
ansatz. It will come from the <em>geometry</em> of this picture — from which directions
of the spacetime lattice the boxes are unitary in. Hold on to the diagram; it is the
protagonist.</p>

## 3 · Folding: a correlation function as one network

The observable this series cares about first is the infinite-temperature dynamical
two-point function — the most permissive probe of how a local kick at the origin is
felt $$x$$ sites away, $$t$$ periods later:

$$
C^{\alpha\beta}(x, t) \;=\; \frac{1}{q^L}\,
\mathrm{Tr}\!\left[\, \sigma_\alpha(x, t)\, \sigma_\beta(0, 0) \,\right],
\qquad
\sigma_\alpha(x,t) = U_F^{-t}\, \sigma_\alpha(x)\, U_F^{t}.
$$

Here $$\{\sigma_\alpha\}$$ is a Hilbert–Schmidt-orthonormal basis of one-site operators
— for a qubit, $$\{\mathbb 1, X, Y, Z\}/\sqrt{2}$$ — so that
$$\tfrac1q\mathrm{Tr}[\sigma_\alpha^\dagger \sigma_\beta^{\vphantom\dagger}] = \delta_{\alpha\beta}$$
after the conventional normalisation. Infinite temperature sounds like a concession; it
is actually the honest arena for chaos, because any structure that survives averaging
over *every* state is structure of the dynamics itself.

Written as a trace of a product of $$2t$$ circuit layers and their daggers, $$C$$ is a
mess: bras and kets of the full many-body space woven together. The standard move — the
same one the influence-matrix thread makes before rotating the network sideways — is to
**fold**. Vectorize operators, $$O \mapsto \lvert O \rangle\rangle$$, with the
Hilbert–Schmidt pairing $$\langle\langle A \vert B \rangle\rangle = \mathrm{Tr}[A^\dagger B]$$;
Heisenberg evolution then acts on the vectorized operator as a single matrix, the
**folded gate**

$$
\mathcal U \;=\; U \otimes U^{*},
$$

one copy for the ket side of the trace, one (conjugated) for the bra side. Graphically:
stack the circuit and its mirror image and glue them leg by leg, so every wire becomes a
double wire of dimension $$q^2$$, and every brick becomes one thicker brick. The
two-point function is now a *single* tensor network with no external legs at all — a
number, assembled from local pieces:
$$\lvert \sigma_\beta \rangle\rangle$$ enters at the bottom at site $$0$$, every other
bottom leg carries the vectorized identity
$$\lvert \mathbb 1/\sqrt q\,\rangle\rangle$$ (that is what the infinite-temperature
trace means), the folded bricks fill the bulk, and
$$\langle\langle \sigma_\alpha \rvert$$ closes site $$x$$ at the top while plain caps —
the trace — close every other top leg.

<div class="learn-more-box" markdown="0">
{% details Vectorization, step by step %}
<p>Pick the computational basis and flatten: <em>O</em> with matrix elements
O<sub>ij</sub> becomes the vector |O⟩⟩ with components O<sub>ij</sub> in the doubled
space H ⊗ H*. Then:</p>
<ul>
<li>⟨⟨A|B⟩⟩ = Tr[A†B] — the Hilbert–Schmidt inner product is the flat inner product of the doubled space.</li>
<li>|UOU†⟩⟩ = (U ⊗ U*)|O⟩⟩ — conjugation becomes one matrix acting from the left. Applied per gate, per layer, this is the folded circuit.</li>
<li>|1/√q⟩⟩ is, up to the √q, the maximally entangled pair between the ket copy and the bra copy — a bent wire, a "cup". The infinite-temperature state is a row of cups; the trace at the top is the matching row of "caps". This is why the folded picture and the diagrams of §2 speak the same language: states and effects are bent wires, and unitarity (Rule 1) becomes the statement that a folded gate applied to cups on its inputs returns cups on its outputs, 𝒰|cup ⊗ cup⟩ = |cup ⊗ cup⟩, and dually for caps.</li>
</ul>
<p>That last identity — <em>folded unitarity</em> — is Rule 1 dressed for the folded
network, and it is the only tool §4 uses. The influence-matrix thread built the same
folded object before rotating it sideways; here we stay upright and ask what the folding
alone already proves.</p>
{% enddetails %}
</div>

## 4 · The theorem that comes for free: strict causality

Here is what the two rules prove before breakfast. Take the folded network for
$$C^{\alpha\beta}(x,t)$$ and start simplifying *from the top*. The top boundary is caps
everywhere except at site $$x$$. A folded brick whose two output legs both end in caps
is, by folded unitarity, replaceable by caps on its two *input* legs — the brick
evaporates. Every gate outside the **backward light cone** of the point $$(x, t)$$ has
this property, and the evaporation propagates row by row until the cone's edge. Now
simplify *from the bottom*: cups everywhere except site $$0$$, and the mirror-image
argument deletes every gate outside the **forward light cone** of $$(0,0)$$.

What survives is the intersection — a causal diamond of bricks strung between the two
points. And if $$(x,t)$$ lies *outside* the forward cone of the origin, the intersection
is empty: every single gate cancels, the network collapses to
$$\langle\langle \sigma_\alpha \vert \sigma_\beta \rangle\rangle \cdot 0$$-many bricks
— a product of overlaps of cups, caps and the two inserted operators that vanishes by
orthogonality, $$\langle\langle \mathbb 1 \vert \sigma_\beta\rangle\rangle = 0$$ for
traceless $$\sigma_\beta$$. Hence:

$$
C^{\alpha\beta}(x, t) \;=\; 0
\qquad \text{outside the light cone } \lvert x \rvert \le 2t,
$$

*identically* — not exponentially small, not after averaging: **zero**, at one site per
layer, two sites per period, for every gate $$U$$ and every pair of traceless
operators. Locality plus unitarity forbid signalling faster than the lattice speed, and
the diagrammatic proof is nothing but "cancel boxes from the outside in." (Relativity
was never invoked; the circuit has a built-in speed limit purely because information
must hop brick by brick. The butterfly velocity of a later post lives *inside* this hard
edge, $$v_B \le 1$$ in units of sites per layer.)

Watch it happen. Place the two operators, then contract — every fading brick below is
one application of Rule 1, and when the diamond comes up empty you have proven the
correlator vanishes without computing anything:

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="sc-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.1rem;align-items:center;justify-content:center;margin-top:0.85rem;font-size:0.9rem;">
    <button id="sc-contract" style="font-size:0.85rem;padding:0.35rem 0.9rem;border-radius:6px;border:1px solid var(--global-theme-color);background:transparent;color:inherit;cursor:pointer;">contract the network</button>
    <button id="sc-reset" style="font-size:0.8rem;padding:0.3rem 0.7rem;border-radius:6px;border:1px solid var(--global-divider-color);background:transparent;color:inherit;cursor:pointer;">reset</button>
    <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">
      <input id="sc-fold" type="checkbox"> folded view (U &#8855; U*)
    </label>
    <span id="sc-status" style="font-variant-numeric:tabular-nums;opacity:0.85;"></span>
  </div>
  <p style="font-size:0.8rem;opacity:0.75;margin:0.7rem 0 0;text-align:center;">
    Click any bottom site to place the source &#963;<sub>&#946;</sub>, any upper site to
    place the probe &#963;<sub>&#945;</sub>; "contract" applies unitarity from the top
    boundary down and the bottom boundary up. The right panel is not schematic: it is the
    exact operator weight of the evolved &#963;<sub>&#946;</sub> on an 8-site chain
    (generic gate), computed in your browser — the interior of the cone really is full.
  </p>
</div>

<script src="{{ '/assets/js/spacetime-circuit.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("sc-mount");
    if (!mount || typeof createSpacetimeCircuit !== "function") return;
    var w = createSpacetimeCircuit(mount, {});
    document.getElementById("sc-contract").addEventListener("click", function () { w.contract(); });
    document.getElementById("sc-reset").addEventListener("click", function () { w.reset(); });
    document.getElementById("sc-fold").addEventListener("change", function () { w.setFolded(this.checked); });
    w.onStatus(function (msg) { document.getElementById("sc-status").textContent = msg; });
  })();
</script>

## 5 · Inside the cone, the exponential is still there

Causality is a statement about where the network *dies*. Inside the causal diamond it is
very much alive, and this is where the minimal model shows its teeth.

Count what survives for a correlator at the edge of a large cone: order $$t^2$$ bricks.
Contracting them row by row means pushing a boundary of up to $$\sim 2t$$ folded wires
through the diamond — an object of dimension $$q^{2\cdot 2t}$$. The diagram converted
"evolve $$q^L$$ amplitudes for $$t$$ steps" into "contract a transfer matrix of
dimension $$q^{4t}$$": the exponential in *system size* became an exponential in
*time*. That is genuine progress for short times — it is exactly how the widget's right
panel and every "exact numerics" curve in this series is produced, and how the
influence-matrix thread frames its sideways contraction — but as $$t$$ grows the wall
is the same wall. The two rules of §2, used naively, prove where correlations vanish
and give no way to compute them where they don't.

It is worth being precise about what *is* known there, because it calibrates how
shocking the next post should be. For **Haar-random** bricks — redraw every gate, every
period, from the uniform measure — ensemble-*averaged* correlators can be computed, and
they are almost all zero: averaging washes out everything but a hydrodynamic skeleton,
and the interesting objects become averaged out-of-time-order correlators and operator
weights, which spread diffusively around a front moving at $$v_B < 1$$
{% cite nahum2018operator --file refs_dual_unitary %}
{% cite fisher2023random --file refs_dual_unitary %}. Those are ensemble statements —
true about the average circuit, silent about any particular one. For a *fixed, clean,
deterministic* brickwork — one gate, repeated forever, no averaging, no fine-tuned
integrability — the two-point function inside the cone was simply out of reach.

<div class="learn-more-box" markdown="0">
{% details Where exactly the hardness lives (and what it has to do with entanglement) %}
<p>The row-by-row contraction fails because the boundary vector — the evolved, folded
operator — generically carries entanglement close to maximal across the diamond, so no
matrix-product compression of the boundary stays honest: bond dimension marches upward
exponentially in t. Every escape hatch this blog has visited is a structural reason the
boundary object stays small: Gaussianity collapses it to a correlation matrix
(free-fermion thread), a restricted gate algebra keeps it in a small Lie group
(matchgates), and low temporal entanglement lets an MPS in the time direction survive
(influence-matrix thread). The question this series asks is different in kind: is there
a property of a <em>single generic gate</em> — no algebra, no Gaussianity, chaotic by
every spectral measure — that kills the boundary growth exactly? Part 2's answer is yes,
and it is a symmetry of the diagram, not of the physics it computes.</p>
{% enddetails %}
</div>

## 6 · One question

Stare once more at the two rules. Rule 1 is an equation about the *vertical* direction:
$$U^\dagger U = \mathbb 1$$ means bricks annihilate when contracted along **time**. Rule
2 — the geometry — does not know which direction is which: the brickwork pattern is
symmetric under a quarter turn. Nothing in the *diagram* distinguishes space from time.
The asymmetry is entirely in the algebra: reading a brick bottom-to-top is unitary;
reading it left-to-right is, for a generic gate, just some linear map.

Everything hard about §5 traces back to that asymmetry — the contractions that would
have evaporated the inside of the diamond are the *sideways* ones, and sideways the
boxes don't cancel.

So the question this post ends on is the obvious one, and the next post is its answer:
**what happens if you demand that the same brick be unitary in both directions?**

<div class="sec-divider" aria-hidden="true">•••</div>

{% bibliography --file refs_dual_unitary --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
