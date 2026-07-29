---
layout: post
title: "Free Fermions: All the Entanglement Is in One Matrix"
date: 2026-07-06 04:00:00-0700
description: For a Gaussian fermion state the exponentially large density matrix collapses to one L×L correlation matrix — every question about entanglement becomes a question about its eigenvalues.
tags: [condensed-matter, free-fermions, entanglement]
categories: [free-fermions]
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
     THROUGH-LINE THESIS (recurs in .thread-note callouts across sections):
     For a Gaussian state, the exponentially large density matrix collapses
     to an L×L correlation matrix C_ij = <c_i† c_j>. Every question about
     entanglement becomes a question about the eigenvalues of a small matrix.
     Corollary intuition: entanglement counts the orbitals caught straddling
     the cut.

     Audience: curious undergrads AND PhD peers simultaneously. Physical
     intuition in the main text; derivations in collapsible .learn-more-box.

     This post is A1 of the free-fermion arc (see free-fermion-arc-roadmap
     memory). RESTRUCTURED 2026-07-28: Majorana language + BdG + Kitaev chain
     moved OUT of this post into A2 ("Pairing: Majoranas, BdG, and the Kitaev
     chain" — absorbs the old §4/§5 outlines and widget 2, kitaev-entanglement.js,
     with the γ sign flipped to match the matchgates post: γ_{2k} = i(c†_k − c_k)).
     This post stays number-conserving start to finish. The Gaussian formalism
     is derived carefully here, ONCE, so the rest of the arc can cite it.
     Per no-published-series-roadmaps: the published text never enumerates the
     arc — each post ends on ONE open question (here: pairing).
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — Why free fermions are special (~400 words, minimal math)
     - Problem: a state of L fermionic modes lives in a 2^L-dim space;
       entanglement entropy naively needs diagonalizing an exponentially
       large ρ_A.
     - Escape hatch: for eigenstates (and thermal states) of quadratic
       Hamiltonians, Wick's theorem means ALL correlators reduce to the
       two-point function C_ij = <c_i† c_j>. The state IS the matrix.
     - Set expectations: complex fermions first (number-conserving), then
       Majoranas and pairing later. Tight-binding chain as running example.
     ===================================================================== -->

## 1 · Why free fermions are special

Write down a general quantum state of $$L$$ fermionic modes and you are already in trouble.
The Hilbert space has dimension $$2^L$$ — one amplitude for every way of filling or emptying
each mode — so a modest chain of $$L = 50$$ sites already asks for more complex numbers than
there are atoms in your body. Now pose an *entanglement* question. Cut the system into a
region $$A$$ and its complement $$B$$; the entanglement entropy needs the reduced density
matrix $$\rho_A = \mathrm{Tr}_B\,\lvert\psi\rangle\langle\psi\rvert$$, a
$$2^{L_A}\times 2^{L_A}$$ object you must diagonalize to get its eigenvalues $$p_\alpha$$ and
then $$S_A = -\sum_\alpha p_\alpha \ln p_\alpha$$. The wall is exponential twice over, and for
a generic interacting system there is no way around it.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 460 182" width="470" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A tight-binding chain bipartitioned into subsystem A and environment B by an entanglement cut, with correlations straddling the cut">
    <!-- region backgrounds -->
    <rect x="26" y="78" width="192" height="46" rx="8" fill="var(--global-theme-color)" fill-opacity="0.13"/>
    <rect x="226" y="78" width="196" height="46" rx="8" fill="currentColor" fill-opacity="0.05"/>
    <!-- bonds (hopping) -->
    <g stroke="currentColor" stroke-opacity="0.45" stroke-width="1.5">
      <line x1="42" y1="101" x2="74" y2="101"/>
      <line x1="74" y1="101" x2="106" y2="101"/>
      <line x1="106" y1="101" x2="138" y2="101"/>
      <line x1="138" y1="101" x2="170" y2="101"/>
      <line x1="170" y1="101" x2="202" y2="101"/>
      <line x1="202" y1="101" x2="234" y2="101"/>
      <line x1="234" y1="101" x2="266" y2="101"/>
      <line x1="266" y1="101" x2="298" y2="101"/>
      <line x1="298" y1="101" x2="330" y2="101"/>
      <line x1="330" y1="101" x2="362" y2="101"/>
      <line x1="362" y1="101" x2="394" y2="101"/>
    </g>
    <!-- entanglement arcs straddling the cut -->
    <g fill="none" stroke="var(--global-theme-color)" stroke-width="1.7" stroke-opacity="0.75" stroke-dasharray="4 3">
      <path d="M 202 93 Q 218 58 234 93"/>
      <path d="M 170 93 Q 218 38 266 93"/>
    </g>
    <!-- sites: A solid teal, B muted -->
    <g>
      <circle cx="42" cy="101" r="7" fill="var(--global-theme-color)"/>
      <circle cx="74" cy="101" r="7" fill="var(--global-theme-color)"/>
      <circle cx="106" cy="101" r="7" fill="var(--global-theme-color)"/>
      <circle cx="138" cy="101" r="7" fill="var(--global-theme-color)"/>
      <circle cx="170" cy="101" r="7" fill="var(--global-theme-color)"/>
      <circle cx="202" cy="101" r="7" fill="var(--global-theme-color)"/>
      <circle cx="234" cy="101" r="7" fill="currentColor" fill-opacity="0.28"/>
      <circle cx="266" cy="101" r="7" fill="currentColor" fill-opacity="0.28"/>
      <circle cx="298" cy="101" r="7" fill="currentColor" fill-opacity="0.28"/>
      <circle cx="330" cy="101" r="7" fill="currentColor" fill-opacity="0.28"/>
      <circle cx="362" cy="101" r="7" fill="currentColor" fill-opacity="0.28"/>
      <circle cx="394" cy="101" r="7" fill="currentColor" fill-opacity="0.28"/>
    </g>
    <!-- the cut -->
    <line x1="218" y1="60" x2="218" y2="140" stroke="#b3760a" stroke-width="1.6" stroke-dasharray="5 4"/>
    <!-- labels -->
    <g font-family="system-ui, sans-serif" text-anchor="middle">
      <text x="122" y="70" fill="var(--global-theme-color)" font-size="12" font-weight="600">subsystem A</text>
      <text x="324" y="70" fill="currentColor" font-size="12" fill-opacity="0.85">environment B</text>
      <text x="218" y="158" fill="#b3760a" font-size="11" font-style="italic">entanglement cut</text>
    </g>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:32rem;margin:0.5rem auto 0;">
    A tight-binding chain split into a subsystem A (teal) and its environment B. The
    entanglement entropy S<sub>A</sub> measures the quantum correlations that straddle the
    cut (arcs). We'll find that only modes near the boundary carry any — which is already
    the seed of the area law.
  </figcaption>
</figure>

Free fermions walk straight through the wall. "Free" means the Hamiltonian is
**quadratic** — at most two fermion operators in every term,

$$
H = \sum_{ij} h_{ij}\, c_i^\dagger c_j \quad (+\ \text{pairing, later}),
$$

the canonical example being the tight-binding chain
$$H = -t\sum_j\big(c_j^\dagger c_{j+1} + \text{h.c.}\big)$$ that will run through the whole
post. The ground state — and every thermal state — of such an $$H$$ is **Gaussian**, and
Gaussian states obey **Wick's theorem** {% cite peschel2009reduced --file refs_free_fermions %}:
every correlator, however many operators it contains, factorizes into sums of products of
the *two-point* function. For example,

$$
\langle c_i^\dagger c_j^\dagger c_k c_l \rangle
  = \langle c_i^\dagger c_l\rangle\langle c_j^\dagger c_k\rangle
  - \langle c_i^\dagger c_k\rangle\langle c_j^\dagger c_l\rangle .
$$

So everything you could ever measure is built from a single object — the **correlation
matrix**

$$
C_{ij} = \langle c_i^\dagger c_j \rangle ,
$$

an $$L\times L$$ Hermitian matrix. Not $$2^L$$ amplitudes: $$L^2$$ numbers. The state *is* the
matrix, and this post is a tour of that one sentence's consequences.

<p class="thread-note"><span class="thread-label">The through-line</span> A Gaussian state's exponentially large density matrix collapses onto one L×L correlation matrix. Every entanglement question below turns into a question about the eigenvalues of a matrix small enough to diagonalize on a laptop — and, we'll find, those eigenvalues literally count the orbitals caught straddling the cut. Watch for it.</p>

A word on what follows. This post lives entirely in the number-conserving world — pure
hopping — where $$C$$ alone carries the state. Sections 2 and 3 squeeze first the reduced
density matrix and then the full entanglement entropy out of $$C$$, and Section 4 collects
the corollaries that come along for the ride. If you want a gentle, pedagogical companion to
this whole program, Latorre and Riera's short review
{% cite latorre2009short --file refs_free_fermions %} covers entanglement in exactly these
free-fermion and spin systems. What we deliberately postpone is *pairing* — Hamiltonians
that create and destroy particles in pairs, superconductivity, the Kitaev chain. That story
needs one more matrix alongside $$C$$, and it gets its own post.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — From correlation matrix to reduced density matrix
                 (~600 words + collapsible box)
     - Key claim: ρ_A of a Gaussian state is itself Gaussian, with a
       QUADRATIC entanglement Hamiltonian.
     - Peschel: eigenvalues ζ_k of C restricted to region A give
       single-particle entanglement energies ε_k = ln[(1−ζ_k)/ζ_k], and
       S_A = −Σ_k [ζ_k ln ζ_k + (1−ζ_k) ln(1−ζ_k)].
     - COLLAPSIBLE BOX: derivation — why Wick forces ρ_A Gaussian
       (factorization argument) + diagonalization yielding the formula.
       Subtlest derivation of the post. Cite Peschel 2003, Peschel–Eisler 2009.
     - Framing: each ζ_k is a fractional occupation of a natural orbital;
       entropy = sum of independent two-level (occupied/empty) entropies.
     ===================================================================== -->

## 2 · From the correlation matrix to the reduced density matrix

Section 1 left us with a promise and a gap. The promise: the whole state lives in $$C$$. The
gap: entanglement is a property of $$\rho_A$$, that fearsome $$2^{L_A}\times 2^{L_A}$$ object,
and nothing yet connects it to $$C$$. This section builds the bridge, and it is the
load-bearing result of the entire post.

Here is the claim, due to Peschel {% cite peschel2003calculation --file refs_free_fermions %}.
**The reduced density matrix of a Gaussian state is itself Gaussian.** That is, $$\rho_A$$ can
be written as the exponential of a *quadratic* operator,

$$
\rho_A = \frac{1}{Z}\,e^{-H_A}, \qquad H_A = \sum_{i,j\,\in\,A} h_{ij}\, c_i^\dagger c_j ,
$$

where $$H_A$$ — the **entanglement Hamiltonian** — is built only from the modes inside $$A$$.
This is an enormous collapse. A general $$\rho_A$$ needs $$4^{L_A}$$ numbers; a Gaussian one
needs only the $$L_A\times L_A$$ matrix $$h$$. And $$h$$ is fixed by data we already hold: the
correlation matrix restricted to the region, which we write $$C|_A$$ — the submatrix of $$C$$
with both indices in $$A$$. (Why must it be Gaussian? Wick's theorem does the work, twice; the
argument is in the box.)

Everything now follows from one small eigenproblem. Diagonalize the $$L_A\times L_A$$ Hermitian
matrix $$C|_A$$; call its eigenvalues $$\zeta_k$$ and its eigenvectors the **natural orbitals**.
Because $$C|_A$$ is built from occupation data, every eigenvalue lands in the interval
$$\zeta_k \in [0,1]$$. Peschel's formulas then read the entanglement structure straight off that
spectrum. The single-particle **entanglement energies** are

$$
\varepsilon_k = \ln\frac{1-\zeta_k}{\zeta_k},
$$

and the entanglement entropy is

$$
S_A = -\sum_k \big[\, \zeta_k \ln \zeta_k + (1-\zeta_k)\ln(1-\zeta_k) \,\big].
$$

Sit with that entropy formula, because it is more than a formula — it is a picture. Each
natural orbital $$k$$ is an independent two-level system: *occupied* with probability
$$\zeta_k$$, *empty* with probability $$1-\zeta_k$$, contributing exactly the entropy of that
one biased coin. The reduced state factorizes into $$L_A$$ independent orbitals, and $$S_A$$ is
simply the sum of their individual binary entropies. The exponentially large $$\rho_A$$ was, all
along, a product of $$L_A$$ little qubits — and the eigenvalues of $$C|_A$$ tell you how loaded
each one's coin is.

<p class="thread-note"><span class="thread-label">The through-line</span> There it is again: the reduced density matrix — all 4<sup>L<sub>A</sub></sup> numbers of it — is reconstructed from the L<sub>A</sub>×L<sub>A</sub> eigenvalues of the restricted correlation matrix C|<sub>A</sub>. Diagonalize one small matrix and you hold the region's entire entanglement structure.</p>

This is why free-fermion entanglement is *computable*. To get the entanglement entropy of a
region you never touch $$\rho_A$$ at all: you restrict $$C$$ to $$A$$, diagonalize an
$$L_A\times L_A$$ matrix, and feed its eigenvalues to the binary-entropy sum. A cost that was
exponential in $$L_A$$ has become cubic in $$L_A$$ — one diagonalization. The next section
spends this result, because *where* the $$\zeta_k$$ sit — pinned at 0 and 1, or loitering near
$$\tfrac12$$ — turns out to be the whole story of how entangled a region is.

<div class="learn-more-box" markdown="0">
{% details Derivation: why the reduced state is Gaussian, and where Peschel's formulas come from %}
**1 · The reduced state is Gaussian.**
The global ground state $$\rho$$ is Gaussian, so by Wick's theorem every correlator — to all
orders — factorizes into products of two-point functions. Restrict attention to operators built
only from modes inside $$A$$. Their expectation values in $$\rho_A = \mathrm{Tr}_B\,\rho$$ equal
their expectation values in $$\rho$$, since tracing out $$B$$ changes nothing for an operator
that never touches $$B$$. So every $$A$$-correlator is still fixed, through Wick, by the
two-point function restricted to $$A$$ — that is, by $$C|_A$$.

Now play the card in reverse. Write down a *trial* Gaussian operator
$$\rho_A^{\text{G}} = e^{-H_A}/Z$$ with $$H_A = \sum_{ij\in A} h_{ij}\, c_i^\dagger c_j$$, and
choose $$h$$ so that this trial state reproduces the correct two-point function,
$$\langle c_i^\dagger c_j\rangle = (C|_A)_{ij}$$. (This is always possible — a quadratic
$$H_A$$ can realise any Hermitian correlation matrix, as step 2 makes explicit.) Being Gaussian,
the trial state's higher correlators *also* factorize by Wick — into the same two-point
function. Two states with identical correlators at every order agree on the expectation of every
operator supported on $$A$$, and so are the same operator:

$$
\rho_A = \frac{1}{Z}\exp\!\Big(-\!\!\sum_{ij\in A} h_{ij}\, c_i^\dagger c_j\Big).
$$

Wick's theorem, used once on $$\rho$$ and once on the trial state, is the entire reason the
reduced state is forced into quadratic form.

**2 · Diagonalize, and read off the spectrum.**
$$H_A$$ is a quadratic Hermitian form, so a unitary change of orbitals
$$f_k = \sum_i U_{ki}\, c_i$$ diagonalizes it, $$H_A = \sum_k \varepsilon_k\, f_k^\dagger f_k$$.
In these natural orbitals the reduced state factorizes into independent modes,

$$
\rho_A = \bigotimes_k \frac{e^{-\varepsilon_k f_k^\dagger f_k}}{1 + e^{-\varepsilon_k}},
$$

and each mode is a two-level system whose occupation is the Fermi–Dirac value
$$\langle f_k^\dagger f_k\rangle = (e^{\varepsilon_k}+1)^{-1} \equiv \zeta_k$$. But the *same*
unitary $$U$$ diagonalizes $$C|_A$$ too, because in the natural-orbital basis the correlation
matrix is $$\langle f_k^\dagger f_l\rangle = \delta_{kl}\,\zeta_k$$. So the $$\zeta_k$$ are
exactly the **eigenvalues of $$C|_A$$** — no separate calculation is needed. Inverting the
Fermi–Dirac relation gives the entanglement energies,

$$
\varepsilon_k = \ln\frac{1-\zeta_k}{\zeta_k},
$$

which run off to $$\pm\infty$$ as $$\zeta_k\to 0$$ or $$1$$ (an orbital that is certainly empty
or certainly full) and vanish at $$\zeta_k = \tfrac12$$.

**3 · The entropy.**
Since $$\rho_A$$ is a product over modes, its von Neumann entropy is a sum, and each two-level
factor with occupation $$\zeta_k$$ contributes a binary entropy:

$$
S_A = -\sum_k \big[\zeta_k \ln\zeta_k + (1-\zeta_k)\ln(1-\zeta_k)\big].
$$

This is Peschel's result {% cite peschel2003calculation --file refs_free_fermions %}; Peschel
and Eisler's review {% cite peschel2009reduced --file refs_free_fermions %} carries it through
in full, including the thermal and higher-dimensional cases.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — Reading entanglement off the spectrum (~500 words + WIDGET 1)
     - Payoff: ζ ≈ 0 or 1 → mode lives entirely outside/inside A → zero
       entanglement. ζ ≈ 1/2 → straddles the cut → maximally entangled bit.
     - Free consequences: area law (only near-boundary modes fractional) +
       critical log correction: at half filling S_A ≈ (1/3) ln L_A + const
       (c = 1; cite Calabrese–Cardy).
     - Anchor to WIDGET 1.
     ===================================================================== -->

## 3 · Reading entanglement off the spectrum

We closed §2 with a spectrum $$\{\zeta_k\}$$ and a claim that *where* those eigenvalues sit is
the whole story. Time to cash it in. Each orbital contributes the binary entropy

$$
h(\zeta) = -\zeta\ln\zeta - (1-\zeta)\ln(1-\zeta),
$$

a function pinned to zero at $$\zeta = 0$$ and $$\zeta = 1$$ and rising to its maximum $$\ln 2$$ —
one bit, one *ebit* — at $$\zeta = \tfrac12$$. So the eigenvalues sort themselves into three kinds:

- $$\zeta_k \approx 1$$ — an orbital that is *certainly occupied*. It lies entirely inside
  $$A$$ and contributes nothing: a mode $$A$$ owns outright.
- $$\zeta_k \approx 0$$ — *certainly empty*. Its weight is in $$B$$; it hardly registers in
  $$C\vert_A$$ and again contributes nothing.
- $$\zeta_k \approx \tfrac12$$ — a genuinely *shared* orbital, half its probability in $$A$$
  and half in $$B$$. This is a maximally entangled bit, worth a full $$\ln 2$$.

That middle case is a familiar idea in disguise. An orbital sits at $$\zeta_k \approx \tfrac12$$
precisely when its wavefunction *straddles the cut* — when it cannot decide which side of the
boundary it belongs to. Interior orbitals are full, far-exterior ones are absent; only the ones
caught crossing the boundary land at intermediate occupation. This is the corollary promised
back in §1, now made literal.

<p class="thread-note"><span class="thread-label">The through-line</span> Entanglement counts the orbitals straddling the cut. An eigenvalue of C|<sub>A</sub> drifts toward ½ exactly when its natural orbital cannot decide which side of the boundary it lives on — and those, and only those, carry entanglement.</p>

Two famous results now fall out almost for free.

**The area law.** In the ground state of a *gapped* Hamiltonian, correlations decay
exponentially over a correlation length $$\xi$$. So $$C\vert_A$$ looks like a clean
occupied/empty projector everywhere except within $$\xi$$ of the boundary — the only place an
orbital can straddle. In one dimension that is an $$O(1)$$ number of shared orbitals no matter
how long $$A$$ grows, so the entropy *saturates* to a constant. In higher dimensions the count
of boundary-straddling orbitals scales with the *area* of $$\partial A$$, and you have derived
the area law $$S_A \propto |\partial A|$$ from nothing but "which orbitals cross the cut."

**The critical logarithm.** The tight-binding chain at half filling is *gapless* — a $$c=1$$
conformal field theory. Its correlations decay only as a power law, so the boundary is soft: the
number of orbitals loitering near $$\zeta = \tfrac12$$ grows *logarithmically* with subsystem
size, and the entropy of a block of $$L_A$$ sites diverges the same way,

$$
S_A \simeq \frac{c}{3}\ln L_A + \text{const} = \frac{1}{3}\ln L_A + \text{const},
$$

the Calabrese–Cardy result {% cite calabrese2004entanglement --file refs_free_fermions %}, with
central charge $$c=1$$ and the factor $$c/3$$ for a block bounded by two cuts. (The same
logarithm, first spotted numerically in spin chains {% cite vidal2003entanglement --file refs_free_fermions %},
is where this whole subject began.)

None of this needs to be taken on faith. The widget below builds $$C$$ for a real tight-binding
chain, lets you drag a region $$A$$ along it, and shows four things at once: the decaying
correlation matrix, the region you have selected, its entanglement spectrum $$\{\zeta_k\}$$, and
the entropy $$S_A$$ riding along its curve as you resize. Watch the spectrum — almost every dot
is pinned to 0 or 1, and only a handful, the straddling orbitals, float in between.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="w1-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:center;margin-top:0.75rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      filling ν
      <input id="w1-nu" type="range" min="0.05" max="0.95" step="0.01" value="0.5">
      <span id="w1-nu-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">0.50</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">
      <input id="w1-guide" type="checkbox" checked> (1/3)·ln L<sub>A</sub> guide
    </label>
    <span style="opacity:0.7;">drag on the chain to move / resize region A</span>
  </div>
</div>

<script src="{{ '/assets/js/correlation-entanglement.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("w1-mount");
    if (!mount || typeof createCorrelationEntanglement !== "function") return;
    var nuVal = document.getElementById("w1-nu-val");
    var w1 = createCorrelationEntanglement(mount, { N: 80, filling: 0.5 });
    var nu = document.getElementById("w1-nu");
    nu.addEventListener("input", function () {
      w1.setFilling(nu.value);
      nuVal.textContent = (+nu.value).toFixed(2);
    });
    document.getElementById("w1-guide").addEventListener("change", function () {
      w1.setGuide(this.checked);
    });
  })();
</script>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — More from the same eigenvalues (~400 words + collapsible box)
     - The product structure of §2 keeps paying: Rényi entropies, mutual
       information, number fluctuations, thermal states — each a one-line
       functional of the same ζ_k.
     - Rényi: S_n = 1/(1−n) Σ_k ln[ζ_k^n + (1−ζ_k)^n]; n=2 = purity/swap tests.
     - Mutual information I(A:B): three restrictions of the same C; regions
       need not be contiguous.
     - Number fluctuations: ΔN_A² = Σ_k ζ_k(1−ζ_k) — only straddling orbitals
       fluctuate (Klich–Levitov "entanglement meter").
     - Thermal states: derivation never assumed purity; honest caveat that
       S_A then mixes thermal + quantum ignorance, MI is the better object.
     - COLLAPSIBLE BOX: Tr ρ_A^n product formula + the variance formula.
     ===================================================================== -->

## 4 · More from the same eigenvalues

The entropy formula was one payout, but the product structure behind it — $$\rho_A$$ as a
stack of independent orbital coins — keeps paying. Essentially every quantity you might want
about region $$A$$ is a one-line functional of the same eigenvalues $$\zeta_k$$.

**Rényi entropies.** Numerics and experiments often want
$$S_n = \tfrac{1}{1-n}\ln \mathrm{Tr}\,\rho_A^n$$ rather than the von Neumann entropy —
$$n=2$$ is the purity, the quantity swap tests actually measure. For a product of two-level
coins the trace factorizes (box below), giving

$$
S_n = \frac{1}{1-n}\sum_k \ln\!\big[\zeta_k^{\,n} + (1-\zeta_k)^n\big],
$$

which recovers the von Neumann formula as $$n \to 1$$.

**Mutual information.** For two *disjoint* regions $$A$$ and $$B$$, the mutual information
$$I(A{:}B) = S_A + S_B - S_{A\cup B}$$ needs three entropies — and they are three
restrictions of the *same* matrix $$C$$. Nothing requires the union to be contiguous: pick
whichever rows and columns you like. Unlike $$S_A$$ itself, $$I(A{:}B)$$ is a sensible
correlation measure even when the global state is mixed, which matters next.

**Number fluctuations.** How much does the particle number in $$A$$ fluctuate? In the
natural-orbital basis $$N_A$$ is a sum of independent coins, so

$$
\big\langle \Delta N_A^2 \big\rangle = \sum_k \zeta_k (1-\zeta_k) .
$$

Look at what this says: pinned orbitals ($$\zeta_k \approx 0,1$$) contribute nothing — *only
the straddling orbitals fluctuate*. Number fluctuations and entanglement entropy are fed by
exactly the same eigenvalues, which is why measuring charge noise across a boundary can
serve as an entanglement meter {% cite klich2009quantum --file refs_free_fermions %}.

**Temperature comes for free.** Nothing in §2's derivation assumed the global state was
pure — only that it was Gaussian. So the same formulas run for thermal states, with
$$C = \big(e^{\,\beta h}+1\big)^{-1}$$ the Fermi–Dirac matrix. One honest caveat: for a
mixed global state, $$S_A$$ is no longer an entanglement measure — it lumps quantum
correlation together with plain thermal ignorance. That is precisely when the mutual
information above becomes the better-behaved diagnostic.

<p class="thread-note"><span class="thread-label">The through-line</span> Rényi entropies, mutual information, charge fluctuations, thermal states — every one is a one-line functional of the same eigenvalues ζ<sub>k</sub>. You diagonalized one matrix; it just keeps answering questions.</p>

<div class="learn-more-box" markdown="0">
{% details Derivation: the Rényi product formula and the fluctuation formula %}
Both results are two lines once $$\rho_A$$ is written in natural orbitals,
$$\rho_A = \bigotimes_k \rho_k$$, where each factor has eigenvalues
$$\{\zeta_k,\, 1-\zeta_k\}$$ (§2).

**Rényi.** Traces factorize over tensor products, and each factor contributes the sum of its
eigenvalues raised to the $$n$$-th power:

$$
\mathrm{Tr}\,\rho_A^n = \prod_k \mathrm{Tr}\,\rho_k^n
  = \prod_k \big[\zeta_k^{\,n} + (1-\zeta_k)^n\big]
\;\;\Longrightarrow\;\;
S_n = \frac{1}{1-n}\sum_k \ln\!\big[\zeta_k^{\,n} + (1-\zeta_k)^n\big].
$$

Taking $$n\to 1$$ with l'Hôpital reproduces $$S_A = -\sum_k[\zeta_k\ln\zeta_k +
(1-\zeta_k)\ln(1-\zeta_k)]$$.

**Fluctuations.** The number operator restricted to $$A$$ is basis-independent:
$$N_A = \sum_{i\in A} c_i^\dagger c_i = \sum_k f_k^\dagger f_k$$ in the natural orbitals.
In $$\rho_A$$ the modes are independent, and each $$f_k^\dagger f_k$$ is a Bernoulli variable
with mean $$\zeta_k$$, hence variance $$\zeta_k(1-\zeta_k)$$. Independent variances add:

$$
\big\langle \Delta N_A^2 \big\rangle = \sum_k \zeta_k(1-\zeta_k)
  = \mathrm{Tr}\big[\,C|_A\,(1 - C|_A)\,\big].
$$

The trace form on the right is the practical one — you don't even need the eigenvalues.
Klich and Levitov {% cite klich2009quantum --file refs_free_fermions %} push this connection
further: at criticality the full counting statistics of charge across the cut reconstructs
the entanglement entropy itself.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — Where this goes (~250 words, no math)
     - Close by restating the through-line: one matrix, all the entanglement.
     - Per no-published-series-roadmaps: do NOT enumerate the arc. End on ONE
       open question as the hook: what happens when the Hamiltonian PAIRS
       fermions (superconductivity)? C alone no longer suffices — one more
       matrix is needed. That is the next post (A2: Majoranas/BdG/Kitaev).
     ===================================================================== -->

## References

{% bibliography --file refs_free_fermions --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }
