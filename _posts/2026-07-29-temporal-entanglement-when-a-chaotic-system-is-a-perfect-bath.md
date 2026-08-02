---
layout: post
title: "Temporal Entanglement: When a Chaotic System Is a Perfect Bath"
date: 2026-07-29 03:00:00-0700
description: The influence matrix is a state on a temporal lattice, so it has an entanglement. That number is the bath's memory of itself, it decides whether an MPS in time can compress the exact object of Part 1 — and at the kicked Ising chain's self-dual point it is exactly zero, making a maximally chaotic system the best possible bath.
tags: [influence-matrix, tensor-networks, many-body-dynamics, temporal-entanglement]
categories: [influence-matrix]
related_posts: false
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
    --thread-color: #b3760a; /* amber — a distinct 'narrative thread' colour, not the teal accent */
    border-left: 4px solid var(--thread-color);
    background: color-mix(in srgb, var(--thread-color) 8%, transparent);
    border-radius: 0 6px 6px 0;
    padding: 0.6rem 0.9rem;
    margin: 1.4rem 0;
    font-size: 0.95rem;
  }
  html[data-theme="dark"] .thread-note {
    --thread-color: #e0a63a; /* brighter amber for dark backgrounds */
  }
  .thread-note .thread-label {
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.09em;
    font-weight: 700;
    color: var(--thread-color);
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
     SERIES: "The Influence Matrix" — Part 2 of 5.
     Through-line stage: the temporal state's entanglement is the system's
     memory of itself — and chaotic can mean memoryless.
     Depends on Part 1 (the IM construction, conventions: s_t enters step t,
     σ_t = (s_t, s̄_t), IM ∈ (C⁴)^⊗T, kicked Ising U_F = kick · Ising).
     All numbers quoted below are outputs of the companion script
     c2_temporal_mps.jl (and were cross-checked against the dense c1 code).
     Widget: assets/js/temporal-entanglement.js (verified vs Julia in node).
     ===================================================================== -->

## 1 · The number Part 1 promised

[Part 1]({% post_url 2026-07-28-influence-matrix-integrating-out-everything-but-the-question %})
ended with an exact object and an honest confession. The influence matrix — everything the
bath will ever do to one site, contracted into a single tensor — is a *state on a temporal
lattice*: one leg per time step, $$\mathrm{IM} \in (\mathbb{C}^4)^{\otimes T}$$. And it is
$$4^T$$-dimensional, which is to say useless, so far, for anything but understanding.
The confession came with a promise: the way out is to ask how *entangled* this state is.
This post asks.

The question means exactly what it would for any other one-dimensional quantum state. Pick
a cut — here, a moment in time between step $$k$$ and step $$k+1$$. Schmidt-decompose
across it:

$$
\mathrm{IM} \;=\; \sum_{\alpha} \lambda_\alpha \;
\lvert \mathrm{past}_\alpha \rangle \otimes \lvert \mathrm{future}_\alpha \rangle ,
$$

with $$\lvert\mathrm{past}_\alpha\rangle$$ living on legs $$\sigma_1 \dots \sigma_k$$ and
$$\lvert\mathrm{future}_\alpha\rangle$$ on the rest. The **temporal entanglement** is the
entropy of that decomposition,
$$S(k) = -\sum_\alpha p_\alpha \ln p_\alpha$$ with $$p_\alpha = \lambda_\alpha^2 / \sum_\beta \lambda_\beta^2$$
{% cite sonner2021influence --file refs_influence_matrix %}.

Before any physics, register what this number *does*. A one-dimensional state whose
entanglement is small across every cut is precisely a state that a **matrix-product state
compresses**: the number of Schmidt terms you must keep — the bond dimension $$\chi$$ —
is set by the entanglement, and the storage cost collapses from $$4^T$$ to
$$O(T \chi^2)$$. Every success of DMRG and friends in space rests on that logic. The
entire bet of the influence-matrix program is that the same logic works *in time*
{% cite lerose2021influence sonner2021influence --file refs_influence_matrix %}. Whether
the bet pays depends on one question — how big is $$S(k)$$? — and the answer, it turns
out, is not a numerical detail. It is a property of the bath's own dynamical phase, and
this post computes it for the first time in the series.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 520 200" width="520" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The influence matrix drawn as a matrix-product state on the temporal lattice: six tensors in a row, one per time step, each with a downward physical leg labelled sigma one through sigma six, connected by horizontal bonds. A dashed cut between steps three and four carries the label chi equals the number of Schmidt terms, and the two halves are labelled past and future">
    <defs>
      <marker id="p2f1-a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor" fill-opacity="0.6"/></marker>
    </defs>
    <!-- MPS tensors -->
    <g>
      <rect x="46" y="70" width="36" height="30" rx="8" fill="var(--global-theme-color)" fill-opacity="0.2" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <rect x="122" y="70" width="36" height="30" rx="8" fill="var(--global-theme-color)" fill-opacity="0.2" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <rect x="198" y="70" width="36" height="30" rx="8" fill="var(--global-theme-color)" fill-opacity="0.2" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <rect x="286" y="70" width="36" height="30" rx="8" fill="var(--global-theme-color)" fill-opacity="0.2" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <rect x="362" y="70" width="36" height="30" rx="8" fill="var(--global-theme-color)" fill-opacity="0.2" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <rect x="438" y="70" width="36" height="30" rx="8" fill="var(--global-theme-color)" fill-opacity="0.2" stroke="var(--global-theme-color)" stroke-width="1.5"/>
    </g>
    <!-- bonds -->
    <g stroke="var(--global-theme-color)" stroke-width="1.6">
      <line x1="82" y1="85" x2="122" y2="85"/><line x1="158" y1="85" x2="198" y2="85"/>
      <line x1="234" y1="85" x2="286" y2="85"/>
      <line x1="322" y1="85" x2="362" y2="85"/><line x1="398" y1="85" x2="438" y2="85"/>
    </g>
    <!-- physical legs (doubled, ket+bra) -->
    <g stroke="var(--global-theme-color)" stroke-width="1.2">
      <line x1="62.5" y1="100" x2="62.5" y2="126"/><line x1="65.5" y1="100" x2="65.5" y2="126" stroke-dasharray="3 3"/>
      <line x1="138.5" y1="100" x2="138.5" y2="126"/><line x1="141.5" y1="100" x2="141.5" y2="126" stroke-dasharray="3 3"/>
      <line x1="214.5" y1="100" x2="214.5" y2="126"/><line x1="217.5" y1="100" x2="217.5" y2="126" stroke-dasharray="3 3"/>
      <line x1="302.5" y1="100" x2="302.5" y2="126"/><line x1="305.5" y1="100" x2="305.5" y2="126" stroke-dasharray="3 3"/>
      <line x1="378.5" y1="100" x2="378.5" y2="126"/><line x1="381.5" y1="100" x2="381.5" y2="126" stroke-dasharray="3 3"/>
      <line x1="454.5" y1="100" x2="454.5" y2="126"/><line x1="457.5" y1="100" x2="457.5" y2="126" stroke-dasharray="3 3"/>
    </g>
    <g fill="var(--global-theme-color)" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">
      <text x="64" y="140">&#963;&#8321;</text><text x="140" y="140">&#963;&#8322;</text><text x="216" y="140">&#963;&#8323;</text>
      <text x="304" y="140">&#963;&#8324;</text><text x="380" y="140">&#963;&#8325;</text><text x="456" y="140">&#963;&#8326;</text>
    </g>
    <!-- the cut -->
    <line x1="260" y1="40" x2="260" y2="150" stroke="var(--global-theme-color)" stroke-width="1.75" stroke-dasharray="6 4"/>
    <text x="260" y="32" fill="var(--global-theme-color)" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">a cut in time</text>
    <text x="260" y="168" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">bond carries &#967; Schmidt terms &#8212; &#967; is set by S(k)</text>
    <!-- past / future labels -->
    <g fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">
      <text x="140" y="58">the bath&#8217;s past</text>
      <text x="380" y="58">the bath&#8217;s future</text>
    </g>
    <!-- time axis -->
    <line x1="46" y1="186" x2="150" y2="186" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.2" marker-end="url(#p2f1-a)"/>
    <text x="160" y="190" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="start" fill-opacity="0.8">time</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.82;max-width:34rem;margin:0.5rem auto 0;">
    The influence matrix as a matrix-product state on the temporal lattice — the same
    doubled legs σ₁ … σ_T as Part 1's figures, now strung on bonds. A cut between two time
    steps splits the bath's record into past and future; the entanglement S(k) across that
    cut counts how many Schmidt terms the bond must carry, and therefore whether the
    compression pays.
  </figcaption>
</figure>

<div class="sec-divider" aria-hidden="true">•••</div>

## 2 · Compressing time: the transverse contraction, now with truncation

Part 1 introduced the transverse sweep — absorb the bath one site at a time, carrying a
temporal object — but carried the object *exactly*, all $$4^T$$ components of it. Now that
compression is on the table, the algorithm can be stated in its real form, the one that
actually runs {% cite lerose2021influence banuls2009matrix --file refs_influence_matrix %}:

1. **Store** the influence matrix as an MPS over the temporal lattice: tensors
   $$A_t[\chi_{l}, 4, \chi_{r}]$$, one per time step.
2. **Absorb** one more bath site. One site's world-line, read sideways, is a
   matrix-product *operator* in time with bond dimension 4 — its bond variable is the
   folded spin $$(z_t, \bar z_t)$$ of the site being absorbed, and because the coupling is
   diagonal, the old IM's legs are pinned to exactly that variable. Applying the MPO
   multiplies each bond dimension by 4.
3. **Truncate**: sweep through the chain with SVDs, keep the largest $$\chi$$ Schmidt
   values per cut, discard the rest. The discarded weight is the compression error, and
   the kept $$\lambda_\alpha$$ are — for free — the temporal entanglement spectrum.
4. Repeat until the influence matrix stops changing: the fixed point of Part 1, now
   reached in $$O(T\chi^2)$$ memory instead of $$4^T$$.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 540 240" width="540" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The truncated transverse contraction as a three-stage cycle. Stage one: a five-tensor temporal MPS with bond chi. Stage two: a column of MPO tensors, one bath site's world-line with bond four, is applied from above, enlarging the bonds to four chi. Stage three: SVD truncation compresses the bonds back to chi, and an arrow loops back to stage one labelled repeat for each bath site">
    <defs>
      <marker id="p2f2-a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--global-theme-color)"/></marker>
    </defs>
    <!-- stage 1: MPS -->
    <text x="92" y="26" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">the IM, bond &#967;</text>
    <g>
      <circle cx="42" cy="60" r="11" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <circle cx="78" cy="60" r="11" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <circle cx="114" cy="60" r="11" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <circle cx="150" cy="60" r="11" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
    </g>
    <g stroke="var(--global-theme-color)" stroke-width="1.4">
      <line x1="53" y1="60" x2="67" y2="60"/><line x1="89" y1="60" x2="103" y2="60"/><line x1="125" y1="60" x2="139" y2="60"/>
      <line x1="42" y1="71" x2="42" y2="86"/><line x1="78" y1="71" x2="78" y2="86"/><line x1="114" y1="71" x2="114" y2="86"/><line x1="150" y1="71" x2="150" y2="86"/>
    </g>
    <!-- arrow to stage 2 -->
    <line x1="176" y1="60" x2="216" y2="60" stroke="var(--global-theme-color)" stroke-width="1.6" marker-end="url(#p2f2-a)"/>
    <text x="196" y="48" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">absorb a site</text>

    <!-- stage 2: MPO applied -->
    <text x="306" y="26" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">one site&#8217;s world-line, an MPO of bond 4</text>
    <g>
      <rect x="235" y="38" width="22" height="14" rx="4" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.3"/>
      <rect x="271" y="38" width="22" height="14" rx="4" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.3"/>
      <rect x="307" y="38" width="22" height="14" rx="4" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.3"/>
      <rect x="343" y="38" width="22" height="14" rx="4" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.3"/>
    </g>
    <g stroke="currentColor" stroke-opacity="0.6" stroke-width="1.2">
      <line x1="257" y1="45" x2="271" y2="45"/><line x1="293" y1="45" x2="307" y2="45"/><line x1="329" y1="45" x2="343" y2="45"/>
    </g>
    <g>
      <circle cx="246" cy="78" r="11" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <circle cx="282" cy="78" r="11" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <circle cx="318" cy="78" r="11" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <circle cx="354" cy="78" r="11" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
    </g>
    <!-- fat bonds -->
    <g stroke="var(--global-theme-color)" stroke-width="3.4" stroke-opacity="0.8">
      <line x1="257" y1="78" x2="271" y2="78"/><line x1="293" y1="78" x2="307" y2="78"/><line x1="329" y1="78" x2="343" y2="78"/>
    </g>
    <g stroke="currentColor" stroke-opacity="0.55" stroke-width="1.1">
      <line x1="246" y1="52" x2="246" y2="67"/><line x1="282" y1="52" x2="282" y2="67"/><line x1="318" y1="52" x2="318" y2="67"/><line x1="354" y1="52" x2="354" y2="67"/>
    </g>
    <g stroke="var(--global-theme-color)" stroke-width="1.4">
      <line x1="246" y1="89" x2="246" y2="102"/><line x1="282" y1="89" x2="282" y2="102"/><line x1="318" y1="89" x2="318" y2="102"/><line x1="354" y1="89" x2="354" y2="102"/>
    </g>
    <text x="300" y="120" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">bonds swell: &#967; &#8594; 4&#967;</text>

    <!-- arrow to stage 3 -->
    <line x1="382" y1="78" x2="422" y2="78" stroke="var(--global-theme-color)" stroke-width="1.6" marker-end="url(#p2f2-a)"/>
    <text x="402" y="66" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">SVD, keep &#967;</text>

    <!-- stage 3: truncated -->
    <text x="478" y="26" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">compressed</text>
    <g>
      <circle cx="442" cy="78" r="11" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <circle cx="478" cy="78" r="11" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <circle cx="514" cy="78" r="11" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
    </g>
    <g stroke="var(--global-theme-color)" stroke-width="1.4">
      <line x1="453" y1="78" x2="467" y2="78"/><line x1="489" y1="78" x2="503" y2="78"/>
      <line x1="442" y1="89" x2="442" y2="102"/><line x1="478" y1="89" x2="478" y2="102"/><line x1="514" y1="89" x2="514" y2="102"/>
    </g>
    <text x="478" y="120" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">back to bond &#967;</text>

    <!-- loop arrow back -->
    <path d="M 478 132 C 478 178, 96 178, 96 100" fill="none" stroke="var(--global-theme-color)" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#p2f2-a)"/>
    <text x="290" y="196" fill="var(--global-theme-color)" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">repeat for every bath site &#8212; the truncated dual evolution</text>

    <text x="270" y="226" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.7">cost per site: O(T &#183; &#967;&#179;) &#8212; the exponential in T is gone</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.82;max-width:34rem;margin:0.5rem auto 0;">
    The algorithm of the series, finally in its practical form. Absorbing a bath site means
    applying that site's world-line — an MPO in time with bond dimension 4 — to the IM-MPS,
    which quadruples every bond; an SVD sweep then keeps only the χ largest Schmidt values
    per cut. Whether this loop is exact-in-practice or garbage is decided entirely by the
    temporal entanglement: χ must reach e^{S(k)}-ish, and S is what the next two sections
    measure.
  </figcaption>
</figure>

The companion to this post,
[**A matrix-product state in the time direction**]({{ '/programming/influence-matrix-02-temporal-mps/' | relative_url }}),
implements every line of this from scratch — the MPO, the sweeps, the truncation — in
plain Julia, and referees it against Part 1's exact dense object. Three of its measured
numbers set the scene for everything below. At a generic point $$(J{=}0.7, b{=}0.6)$$ with
$$T=10$$: bond dimension $$\chi = 32$$ reproduces the exact influence matrix to a relative
error of $$2.5\times 10^{-2}$$, and $$\chi$$ at the light-cone-saturated value stops
growing with bath depth entirely. And a $$T = 20$$, 40-site bath — dense cost
$$4^{20} \approx 10^{12}$$ — takes **11 seconds** at $$\chi \le 64$$. The bet of section 1
pays, and the reason it pays is the subject of the next section.

<div class="learn-more-box" markdown="0">
{% details The compression loop, precisely: canonical forms, truncation optimality, and what χ buys %}
Three standard facts, stated for the temporal chain since that is where we use them.

**1 · The SVD sweep is optimal.** Bring the MPS to canonical form by a QR sweep from the
right; then at each cut the reshaped tensor's singular values *are* the state's Schmidt
values $$\lambda_\alpha$$ across that cut, and dropping the smallest ones is the best
rank-$$\chi$$ approximation in the 2-norm (Eckart–Young). The squared discarded weight
$$\varepsilon^2 = \sum_{\alpha > \chi} \lambda_\alpha^2$$ bounds the error of the
compressed influence matrix, and — through the contraction of Part 1's key formula — of
every observable computed from it.

**2 · What χ must be.** If the Schmidt spectrum decays exponentially,
$$\lambda_\alpha^2 \sim e^{-c\alpha}$$, then $$\chi \sim e^{S}$$ suffices for fixed error,
with $$S$$ the entanglement across the worst cut. This is the exact sense in which
"temporal entanglement decides the bond dimension": $$S$$ growing with $$T$$ means
$$\chi$$ growing with $$T$$ and the method dying; $$S$$ saturating means a $$T$$-independent
$$\chi$$ and simulations to arbitrary times.

**3 · The MPO, explicitly.** With the conventions of Part 1 (diagonal coupling, kick
$$K$$), the tensor absorbed per time step is

$$
W[\beta_{\mathrm{in}}, \eta, \sigma, \beta_{\mathrm{out}}]
= \delta_{\sigma, \beta_{\mathrm{in}}}\,
e^{-iJ(\eta_z z - \bar\eta_z \bar z)}\,
K_{z' z} \bar K_{\bar z' \bar z},
$$

where $$\beta = (z, \bar z)$$ is the absorbed site's folded spin (the 4-dimensional MPO
bond), $$\eta$$ the leg handed to the next site inward, and the delta pins the old IM's
leg to the bond — the tensor-network spelling of "the coupling reads the spin." The
boundary closures are the two vectors Part 1 already met: the initial state at the bottom,
the trace $$\delta_{z\bar z}$$ at the top. Fifty lines of Julia, all in the companion.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## 3 · What temporal entanglement measures: memory

Part 1 section 4 ended on a sentence that this section makes quantitative: *a memoryless
bath is a product state in time.* The converse reading is the useful one. Temporal
entanglement across the cut at step $$k$$ correlates the bath's record before $$k$$ with
its record after $$k$$ — it is, quite literally, **how much the bath's future behaviour
remembers of what was done to it in the past**. $$S(k) = 0$$ at every cut means the bath
consults nothing: a Markovian environment. Large $$S(k)$$ means the bath carries a rich
internal record forward, and any faithful simulation must carry it too.

Here is the measured profile for the series' reference point, from the companion
($$J = 0.7$$, $$b = 0.6$$, $$T = 10$$, bath 16 sites deep — deep enough that these
numbers have converged in depth):

$$
S(1{\dots}9) = 0,\; 0.72,\; 0.95,\; 1.02,\; 1.05,\; 1.01,\; 0.95,\; 0.82,\; 0.53 .
$$

Three features, each with a physical reading. **The first cut is exactly zero** — not
small, zero. That is an initial-condition statement: the bath starts in a product state,
so the first Ising layer reads a *deterministic* boundary spin and the first leg
factorizes off. **The profile saturates around $$\sim 1$$** in the middle, comparable to
$$\ln 2 \approx 0.69$$ — order *one shared bit* of memory, not order $$T$$ bits. And **it
sags at late cuts**, where less future remains to remember with. Contrast the spatial
story: after the same quench, entanglement between spatial halves grows linearly in $$t$$,
which is exactly why spatial MPS methods choke at long times. The temporal state of the
same dynamics is *bounded* {% cite lerose2021influence --file refs_influence_matrix %}. Same
system, same chaos, opposite verdicts — the entire reason this series exists.

Why should a many-body bath's memory be so poor? The tempting slogan: it *scrambles* —
whatever imprint the system leaves on the boundary spin gets swept into ever more
non-local correlations, out of reach of the one site the system can read. Thermalization,
seen from inside, is forgetting. Hold that slogan loosely, though, and one confession
before proceeding: the clean kicked Ising chain is secretly a *free-fermion model in
disguise* (a Jordan–Wigner transformation away from quadratic), so this reference bath is
integrable, not chaotic — and what happens to the temporal entanglement when the bath is
made *genuinely* chaotic is a genuine surprise, saved for Part 3. What survives all
caveats is the extreme case: a bath that forgets *perfectly*. The kicked Ising chain
contains one, and it is not fragile — it survives even the perturbation that makes the
model truly chaotic.

<div class="sec-divider" aria-hidden="true">•••</div>

## 4 · The perfect dephaser: chaos as the best possible bath

Set the two knobs of the kicked Ising chain to the **self-dual point**

$$
b \;=\; J \;=\; \frac{\pi}{4}.
$$

Something special happens there, known since before influence matrices were named: the
network becomes **dual-unitary** — the gate read *sideways*, with space and time swapped,
is itself a unitary {% cite akila2016particle bertini2019exact --file refs_influence_matrix %}.
Part 1 called this the "solvable extreme of the rotation." Two facts make this point
remarkable, and they compose. First, dual-unitarity is *robust in exactly the direction
that matters*: adding a longitudinal field $$g\sum_j Z_j$$ — the perturbation that breaks
the clean model's hidden free-fermion integrability and makes it genuinely, provably
chaotic (random-matrix spectral statistics, maximal entanglement growth
{% cite bertini2019exact --file refs_influence_matrix %}) — leaves the self-dual point
dual-unitary, because a $$Z$$-field commutes with the space-time swap of diagonal gates.
By every spatial measure the self-dual model with a generic longitudinal field is the
*most* violently thermalizing point of the family.

Now look at the same point through the temporal lens. The sideways evolution being unitary
means the dual transfer matrix $$\hat{\mathcal{T}}$$ of Part 1 preserves norms instead of
contracting — and its fixed point collapses to something trivial. For a bath prepared at
infinite temperature, the influence matrix becomes *exactly*

$$
\mathrm{IM}\left[\sigma_1, \dots, \sigma_T\right]
\;=\; \prod_{t=1}^{T} \delta_{s_t \bar s_t}
\qquad \text{— the \textbf{perfect dephaser} (PD)}
$$

{% cite lerose2021influence --file refs_influence_matrix %}: a product state in time, zero
temporal entanglement at every cut, no memory whatsoever. And — the second composable
fact — the PD form holds *with the longitudinal field on*: dephasing gates commute
through $$Z$$-fields, so the maximally chaotic member of the family has exactly this
influence matrix too. The numerics confirm both statements to machine precision: at
$$T=6$$ an infinite-temperature bath 4 sites deep gives
$$\max\lvert \mathrm{IM} - \prod\delta\rvert = 1.1\times 10^{-15}$$ with $$g=0$$, and
$$2\times 10^{-16}$$ with strong random longitudinal fields.

Unpack what that object *does* to the system, because it is not "nothing." Each leg's
$$\delta_{s_t \bar s_t}$$ kills every contribution in which the forward and backward
trajectories disagree — it erases the system's coherences in the $$Z$$ basis, once per
step, completely. The bath acts as a perfect dephasing channel: strong decoherence, zero
memory, no back-action beyond it. In the language of open systems this is the ideal
Markovian bath that master equations postulate — except nothing here is postulated,
weak, or coarse-grained. The coupling is strong, the "bath" is one more site of the same
chain, and the Markovianity is *exact*, enforced by maximal chaos. **The best possible
bath is a maximally chaotic system**: it thermalizes you perfectly precisely because it
forgets you perfectly. That inversion — spatially the wildest point, temporally the
simplest — is the single most instructive fact in this series.

Two honest fine-prints, both visible in the numerics. *Finite baths have light cones*: a
bath $$L_b$$ sites deep can only display PD behaviour for cuts the light cone has closed
over, so the exact zeros march outward as the bath deepens (at $$T=6$$ the polarized bath
shows $$S = 0$$ at every cut once $$L_b \gtrsim 8$$). And *the initial state matters*: a
bath started in $$\lvert\uparrow\cdots\uparrow\rangle$$ at the self-dual point also gives
an exactly-zero-TE product state — but a *different* product than
$$\prod\delta$$, one that still dephases without being the ideal channel. Special
"solvable" initial states of dual-unitary circuits are a subject of their own
{% cite piroli2020exact --file refs_influence_matrix %}; the infinite-temperature state is
the one for which the PD form is exact.

Explore both facts live: the heatmap below is the half-cut temporal entanglement over the
whole $$(b, J)$$ plane — the dark valley bottoming out at *exactly zero* on the self-dual
point is the money shot of this post — and the bars are the full cut-by-cut profile at
your chosen parameters.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="te-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:center;margin-top:0.85rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      kick b
      <input id="te-b" type="range" min="0.05" max="1.55" step="0.01" value="0.60">
      <span id="te-b-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">0.60</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      coupling J
      <input id="te-j" type="range" min="0.05" max="1.55" step="0.01" value="0.70">
      <span id="te-j-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">0.70</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">
      <input id="te-bath" type="checkbox"> bath at T = &#8734;
    </label>
    <button id="te-snap" style="font-size:0.8rem;padding:0.3rem 0.7rem;border-radius:6px;border:1px solid var(--global-theme-color);background:transparent;color:inherit;cursor:pointer;">snap to self-dual</button>
  </div>
  <p style="font-size:0.8rem;opacity:0.75;margin:0.7rem 0 0;text-align:center;">
    All exact dense computations, in your browser. Unchecked, the bath starts polarized
    (|↑…↑⟩); checked, at infinite temperature — at the self-dual point the former gives a
    zero-TE product state and the latter the exact ∏δ perfect dephaser.
  </p>
</div>

<script src="{{ '/assets/js/temporal-entanglement.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("te-mount");
    if (!mount || typeof createTemporalEntanglement !== "function") return;
    var w = createTemporalEntanglement(mount, { b: 0.6, J: 0.7 });
    var bS = document.getElementById("te-b"), jS = document.getElementById("te-j");
    var bV = document.getElementById("te-b-val"), jV = document.getElementById("te-j-val");
    bS.addEventListener("input", function () { bV.textContent = (+bS.value).toFixed(2); });
    jS.addEventListener("input", function () { jV.textContent = (+jS.value).toFixed(2); });
    bS.addEventListener("change", function () { w.setParams(bS.value, jS.value); });
    jS.addEventListener("change", function () { w.setParams(bS.value, jS.value); });
    document.getElementById("te-bath").addEventListener("change", function () {
      w.setBath(this.checked ? "mixed" : "up");
    });
    document.getElementById("te-snap").addEventListener("click", function () {
      var p = w.snapSelfDual();
      bS.value = p.b; jS.value = p.J;
      bV.textContent = p.b.toFixed(2); jV.textContent = p.J.toFixed(2);
    });
  })();
</script>

<p class="thread-note"><span class="thread-label">The through-line</span> A many-body
system, seen from inside, is a state in time. Part 1 showed the state exists; now we know
what its entanglement <em>is</em>: the system's memory of itself. And at the self-dual
point the memory vanishes identically — chaotic can mean memoryless.</p>

<div class="learn-more-box" markdown="0">
{% details Why dual-unitarity forces the perfect dephaser (sketch) %}
The claim: at $$b = J = \pi/4$$ with an infinite-temperature bath, the influence matrix of
a semi-infinite kicked Ising bath is exactly $$\prod_t \delta_{s_t\bar s_t}$$.

**Step 1 — the dual gate is unitary.** Write the one-period, two-site gate of the kicked
Ising chain and reshuffle its four legs so that *space* becomes the propagation direction
(input = left legs, output = right legs). At the self-dual point the reshuffled matrix is
unitary — this is the particle-time duality of the kicked Ising chain
{% cite akila2016particle --file refs_influence_matrix %}, the defining property of
dual-unitary circuits {% cite bertini2019exact --file refs_influence_matrix %}.

**Step 2 — folded unitarity is a fixed-point equation.** The dual transfer matrix
$$\hat{\mathcal T}$$ of the folded network is the dual gate applied forward composed with
its conjugate backward, $$\hat{\mathcal T} = U_{\mathrm{dual}} \otimes U_{\mathrm{dual}}^*$$
column by column. Unitarity of $$U_{\mathrm{dual}}$$ means
$$\hat{\mathcal T}$$ preserves the "identity string": contracting
$$U_{\mathrm{dual}}^{\vphantom{\dagger}} (\cdot) U_{\mathrm{dual}}^\dagger$$ with a trace
on the incoming folded legs returns a trace on the outgoing ones —
$$\mathrm{Tr}\!\left[U \rho U^\dagger\right] = \mathrm{Tr}\,\rho$$, read sideways. The
infinite-temperature initial state supplies exactly the maximally-mixed boundary vector
that this identity needs at the bottom of every column; the trace closure supplies it at
the top.

**Step 3 — telescoping.** Absorbing a bath site therefore maps the identity-string
temporal state to itself exactly — no transient, no decay: the fixed point is reached in
one step, and the fixed point *is* the folded identity on every leg. Reading the folded
identity leg by leg gives $$\delta_{s_t \bar s_t}$$, i.e. the perfect dephaser. For a
*finite* bath the argument needs the light cone to close (the last site's closure must
have propagated across), which is precisely the $$L_b$$-dependence the numerics show.

**What fails off self-duality:** $$U_{\mathrm{dual}}$$ is a contraction rather than a
unitary, the identity string is no longer preserved, and the fixed point acquires
correlations between legs — nonzero temporal entanglement, i.e. memory. The distance from
self-duality controls how much, which is visible as the smooth walls of the widget's
valley.

For polarized solvable initial states the same machinery applies with a different boundary
vector, yielding a different — still product! — influence matrix
{% cite piroli2020exact --file refs_influence_matrix %}: zero memory again, but a channel
that is not pure dephasing.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## 5 · Where this goes

The scorecard of this post: temporal entanglement defined, an algorithm that lives or dies
by it, a generic chaotic bath measured at *order one bit* of memory, and a maximally
chaotic bath measured at *exactly zero* — with the widget's valley showing how the zero
sits inside the $$(b, J)$$ plane. The bet of the series — compress time, not space — is
now backed by numbers: $$T = 20$$ with a 40-site bath in seconds, where the dense object
of Part 1 would have $$10^{12}$$ components.

But everything so far was measured at one reference point — which section 3 confessed is
secretly *integrable* — and one very special point. The obvious next move is to break the
integrability (a longitudinal field does it) and watch what genuine chaos does to the
temporal state; to disorder the fields and watch what *localization* does; and to compare.
That is [Part 3]({% post_url 2026-07-30-dynamical-phases-through-the-temporal-lens %}), and the punchline inverts this post's naive slogan: the TE profile is not
just a cost estimate but a **diagnostic** — integrable, chaotic and localized baths write
qualitatively different growth laws into the temporal state, and the "chaos forgets"
intuition survives only where it is protected by something sharper than chaos itself.

The full implementation behind this post — the temporal MPS, the truncated transverse
contraction, the perfect-dephaser checks and the convergence study — is the programming
companion, [**A matrix-product state in the time direction**]({{ '/programming/influence-matrix-02-temporal-mps/' | relative_url }}),
built from scratch and refereed by Part 1's exact code.

One open question to carry out the door: our generic point saturated near one bit of
temporal memory — but *why one bit*, and what selects the saturation value? Nothing in
this post explains that number. Watching how it changes as the bath's dynamical phase
changes is exactly where the series goes next.

## References

{% bibliography --file refs_influence_matrix --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }
