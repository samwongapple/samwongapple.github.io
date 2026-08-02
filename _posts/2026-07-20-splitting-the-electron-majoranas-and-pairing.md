---
layout: post
title: "Splitting the Electron: Majoranas, Pairing, and the Kitaev Chain"
date: 2026-07-20 09:00:00-0700
description: Superconductors break particle-number conservation, and the correlation matrix stops being the whole state. Cutting each fermion into two Hermitian halves repairs it — and makes topology visible in the entanglement spectrum.
tags: [condensed-matter, free-fermions, entanglement, majorana]
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
  .key-eq {
    border: 1.5px solid var(--global-theme-color);
    border-radius: 10px;
    background: color-mix(in srgb, var(--global-theme-color) 6%, transparent);
    padding: 0.4rem 1rem;
    margin: 1.5rem 0;
  }
</style>

<!-- =====================================================================
     FREE-FERMION ARC, post A2 (internal label only — never printed).
     Opens on A1's closing hook: pairing breaks number conservation, so
     C = <c†c> is no longer the whole state.

     THROUGH-LINE (recurs in .thread-note callouts): the collapse survives —
     it just needs the right variables. Γ replaces C, and the corollary
     sharpens: entanglement counts UNPAIRED MAJORANAS straddling the cut.

     SIGN CONVENTION (must match the matchgates post):
       c_j = (γ_{2j-1} + i γ_{2j}) / 2
       γ_{2j-1} = c_j + c†_j ,  γ_{2j} = i(c†_j − c_j)
     Kitaev-chain Majorana couplings that follow (verified numerically):
       M_{2j-1,2j} = −μ ,  M_{2j,2j+1} = t + Δ ,  M_{2j-1,2j+2} = Δ − t
     Ground state: Γ = −M (MᵀM)^{−1/2} (pseudo-inverse on the kernel).

     VERIFIED IN NODE before writing (assets/js/kitaev-entanglement.js):
      - sweet spot μ=0,t=Δ: Γ_{2j,2j+1}=±1 exactly, edge Majoranas exactly 0,
        S_A = 1.0000 × ln2
      - trivial t=Δ=0: intra-site bonds, S_A = 0
      - Δ=0 (number-conserving): S from Γ equals S from A1's C route to 1e-13
      - even-even and odd-odd blocks of Γ vanish identically for real H
     Per no-published-series-roadmaps: end on ONE open question (dynamics).
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — Where the correlation matrix runs out (~450 words)
     ===================================================================== -->

## 1 · Where the correlation matrix runs out

The previous post built a machine. For a Gaussian state of $$L$$ fermionic modes, the
correlation matrix $$C_{ij} = \langle c_i^\dagger c_j\rangle$$ holds everything: restrict it
to a region, diagonalize, and its eigenvalues $$\zeta_k$$ hand you the entanglement
Hamiltonian, the entropy, the Rényi entropies, the charge fluctuations. One small matrix,
all the entanglement.

That machine has a hidden bolt, and it is time to look at it. Every step assumed that
$$C$$ was the *only* two-point function worth writing down — that $$\langle c_i c_j\rangle$$
is zero and always will be. For a Hamiltonian built from $$c_i^\dagger c_j$$ that is
automatic: such a Hamiltonian commutes with the total number operator
$$N = \sum_i c_i^\dagger c_i$$, its eigenstates have definite particle number, and an
expectation value like $$\langle c_i c_j \rangle$$ — which removes two particles — connects
states of different $$N$$ and must vanish.

Superconductors do not play by this rule. In the mean-field (Bardeen–Cooper–Schrieffer)
description, a pair condensate acts as a reservoir that can donate or absorb two electrons
at a time, and the effective Hamiltonian picks up **pairing terms**:

$$
H = \sum_{ij} h_{ij}\, c_i^\dagger c_j
  \;+\; \frac{1}{2}\sum_{ij}\Big(\Delta_{ij}\, c_i^\dagger c_j^\dagger + \Delta_{ij}^{*}\, c_j c_i\Big).
$$

This is a **Bogoliubov–de Gennes (BdG)** Hamiltonian. It is still quadratic — still "free",
still exactly solvable, still Gaussian — but it no longer commutes with $$N$$. Its ground
state is a superposition of sectors with different particle numbers, and the amplitude that
was forbidden a moment ago,

$$
F_{ij} = \langle c_i c_j \rangle ,
$$

is now generically nonzero. ($$F$$ is antisymmetric, $$F_{ij} = -F_{ji}$$, since the
operators anticommute.) It is the **anomalous** correlator, and it is precisely the order
parameter that says "this is a superconductor."

So the state is no longer $$C$$. It is the pair $$(C, F)$$. We could grind forward with two
matrices and a growing thicket of special cases — but there is a much better move available,
and it is the kind of move that tells you the variables were wrong all along.

Notice what has actually happened. Number conservation was never a law of nature here; it was
a *symmetry of the particular Hamiltonians we happened to write down first*. What survives
when it breaks is something weaker but more fundamental: the Hamiltonian still conserves
**fermion parity** — whether the number of particles is even or odd — because pairing terms
change $$N$$ by two. The natural objects for a problem with parity but not number symmetry
are not electrons. They are their halves.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — Majoranas: splitting the electron (~550 words + box)
     ===================================================================== -->

## 2 · Splitting the electron

A fermionic operator $$c_j$$ is not Hermitian, so it is not an observable; it is a
complex-valued bookkeeping device with a real and an imaginary part. Take those parts
seriously and give them names:

<div class="key-eq" markdown="1">

$$
\gamma_{2j-1} = c_j + c_j^\dagger,
\qquad
\gamma_{2j} = i\big(c_j^\dagger - c_j\big).
$$

</div>

These are **Majorana operators**. Each is manifestly Hermitian,
$$\gamma_a^\dagger = \gamma_a$$ — each is, in principle, an observable. Inverting,

$$
c_j = \tfrac{1}{2}\big(\gamma_{2j-1} + i\,\gamma_{2j}\big),
$$

so each fermion mode has been cut cleanly into two Majorana halves. A chain of $$N$$ sites
carries $$2N$$ of them. Their algebra follows from the usual anticommutators and is as simple
as it could be:

$$
\{\gamma_a, \gamma_b\} = 2\,\delta_{ab},
\qquad\text{in particular}\qquad
\gamma_a^2 = 1 .
$$

A Majorana squares to the identity, like a Pauli matrix, and distinct Majoranas anticommute.
Note what has been given up: there is no "Majorana number operator," no notion of a Majorana
being occupied or empty. Occupation is a property of a *pair* of them. That is exactly the
right amount of structure for a problem that knows about parity but not number.

Now redo the bookkeeping of the state. In place of $$C$$ and $$F$$, define the **covariance
matrix**

<div class="key-eq" markdown="1">

$$
\Gamma_{ab} \;=\; \frac{i}{2}\,\big\langle\, [\gamma_a, \gamma_b]\, \big\rangle ,
$$

</div>

a $$2N \times 2N$$ matrix that is **real and antisymmetric** — two facts worth pausing on.
It is real because each $$\gamma_a$$ is Hermitian, so $$\langle \gamma_a\gamma_b\rangle$$ and
$$\langle\gamma_b\gamma_a\rangle$$ are complex conjugates and the combination above is
manifestly real. It is antisymmetric because the commutator is. And it is *one* matrix, not
two: the information that was split awkwardly between $$C$$ and $$F$$ is repacked into a
single real object, with the dictionary between them worked out in the box below.

For a pure Gaussian state $$\Gamma^{\mathsf T}\Gamma = \mathbb{1}$$; more generally
$$\Gamma^{\mathsf T}\Gamma \preceq \mathbb{1}$$, with directions where it falls short
corresponding to mixedness. Everything the state can tell you is in there. Wick's theorem
works verbatim in this language — higher correlators of $$\gamma$$'s factorize into products
of $$\Gamma$$ entries — which means the whole argument of the previous post is about to run
again, unchanged.

<p class="thread-note"><span class="thread-label">The through-line</span> The collapse survives; it just needed better variables. For a paired state the exponentially large density matrix still reduces to one small matrix — no longer C, but the 2N×2N real antisymmetric covariance matrix Γ.</p>

<div class="learn-more-box" markdown="0">
{% details The dictionary: how Γ encodes both C and F %}
Substitute $$\gamma_{2j-1} = c_j + c_j^\dagger$$ and $$\gamma_{2j} = i(c_j^\dagger - c_j)$$
into the definition of $$\Gamma$$ and expand, using
$$\langle c_i c_j^\dagger\rangle = \delta_{ij} - C_{ji}$$ and
$$\langle c_i^\dagger c_j^\dagger\rangle = -F_{ij}^{*}$$. Grouping by which half of which
site is involved gives, for $$i \neq j$$,

$$
\begin{aligned}
\Gamma_{2i-1,\,2j-1} &= -2\,\mathrm{Im}\,(C_{ij} + F_{ij}), \\
\Gamma_{2i,\,2j}     &= \;\;\,2\,\mathrm{Im}\,(F_{ij} - C_{ij}), \\
\Gamma_{2i-1,\,2j}   &= -\delta_{ij} + 2\,\mathrm{Re}\,(C_{ij} + F_{ij}).
\end{aligned}
$$

Count the information: $$C$$ is Hermitian and $$F$$ antisymmetric, and between them they
supply exactly the $$\binom{2N}{2}$$ independent entries of a real antisymmetric
$$2N\times 2N$$ matrix. Nothing is lost and nothing is double-counted — this is a change of
variables, not an approximation.

**The real case.** When $$h$$ and $$\Delta$$ are real — true for the Kitaev chain below, and
for most lattice models one writes down — the ground state has real $$C$$ and real $$F$$, so
the imaginary parts vanish and the first two families collapse to zero. Only the
odd–even blocks survive:

$$
\Gamma_{2i-1,\,2j} = 2\,(C_{ij} + F_{ij}) - \delta_{ij},
\qquad
\Gamma_{2i-1,\,2j-1} = \Gamma_{2i,\,2j} = 0 .
$$

A useful sanity check: the empty vacuum has $$C = F = 0$$, giving
$$\Gamma_{2j-1,2j} = -1$$ and everything else zero — each site's two Majorana halves are
bonded to each other and to nothing else. Hold onto that picture; it is the trivial phase of
Section 4. (I checked the vanishing of the odd–odd and even–even blocks numerically on the
model of Section 4 before writing this: both are zero to machine precision.)
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — Entanglement from Γ (~450 words + box)
     ===================================================================== -->

## 3 · Entanglement, again — with one change of spelling

Here is the payoff for the change of variables: the entire entanglement machine from the
previous post transfers, with one substitution.

Recall the shape of the old argument. Restrict $$C$$ to region $$A$$; diagonalize; get
occupations $$\zeta_k$$; feed them to a binary-entropy sum. The new argument has exactly the
same shape. Restrict $$\Gamma$$ to the Majorana indices belonging to $$A$$ — for a block of
$$L_A$$ sites that is a $$2L_A \times 2L_A$$ submatrix $$\Gamma\vert_A$$ — and bring it to
canonical form.

A real antisymmetric matrix cannot be diagonalized by a real orthogonal transformation, but
it can always be brought to a canonical **block** form: there is a real orthogonal $$O$$ with

$$
O\,\Gamma\vert_A\,O^{\mathsf T} \;=\; \bigoplus_{k=1}^{L_A}
\begin{pmatrix} 0 & \lambda_k \\ -\lambda_k & 0 \end{pmatrix},
\qquad \lambda_k \in [0,1].
$$

This is the real Schur (or Youla) form, and it is the antisymmetric analogue of
diagonalization: instead of $$2L_A$$ eigenvalues you get $$L_A$$ numbers $$\lambda_k$$, each
describing one $$2\times 2$$ block — that is, **one pair of Majoranas**, which is to say one
fermionic mode. The $$\lambda_k$$ are exactly the occupations in disguise:

<div class="key-eq" markdown="1">

$$
\zeta_k = \frac{1 \pm \lambda_k}{2},
\qquad
S_A = -\sum_{k}\Big[\zeta_k \ln \zeta_k + (1-\zeta_k)\ln(1-\zeta_k)\Big].
$$

</div>

Same entropy formula. Same physics. The only thing that changed is how you extract the
numbers from the state.

And the extremes now have an even sharper reading than before. $$\lambda_k = 1$$ means
$$\zeta_k \in \{0, 1\}$$: a mode entirely inside or outside $$A$$, contributing nothing —
in Majorana language, *both halves of that mode live in $$A$$, bonded to each other*.
$$\lambda_k = 0$$ means $$\zeta_k = \tfrac12$$: a maximally entangled bit, worth $$\ln 2$$ —
and in Majorana language it means a Majorana in $$A$$ whose partner is **outside** $$A$$.

<p class="thread-note"><span class="thread-label">The through-line</span> Last post: entanglement counts the orbitals straddling the cut. Now sharper — entanglement counts the <em>unpaired Majoranas</em> in A. Two dangling halves make one maximally mixed mode, worth exactly ln 2.</p>

That is the counting rule for the rest of this post, and it is worth stating plainly: in the
dimerized limits we are about to meet, where every Majorana is cleanly bonded to exactly one
partner,

$$
S_A = \frac{(\text{number of Majoranas in } A \text{ whose partner lies in } B)}{2}\,\ln 2 .
$$

Two dangling halves make one whole maximally mixed mode.

<div class="learn-more-box" markdown="0">
{% details Why the Schur values map to occupations — and a numerical check that it agrees with the old machinery %}
The logic mirrors the previous post exactly. Wick's theorem holds for $$\gamma$$ correlators,
so $$\rho_A$$ is again Gaussian, and the canonical transformation $$O$$ that brings
$$\Gamma\vert_A$$ to block form is a legitimate change of Majorana basis (real orthogonal
transformations preserve the Majorana algebra). In the new basis the state factorizes into
$$L_A$$ independent modes, the $$k$$-th built from the Majorana pair
$$(\tilde\gamma_{2k-1}, \tilde\gamma_{2k})$$ with

$$
\rho_k = \frac{1}{2}\big(\mathbb{1} + i\,\lambda_k\,\tilde\gamma_{2k-1}\tilde\gamma_{2k}\big).
$$

Recombining that pair into a fermion $$f_k = (\tilde\gamma_{2k-1} + i\tilde\gamma_{2k})/2$$
gives occupation $$\langle f_k^\dagger f_k\rangle = (1-\lambda_k)/2$$, and $$\rho_k$$ has
eigenvalues $$(1\pm\lambda_k)/2$$. Each block is one two-level system; sum their binary
entropies and you have $$S_A$$. The entanglement energies of the previous post are
$$\varepsilon_k = \ln\frac{1-\zeta_k}{\zeta_k} = \ln\frac{1-\lambda_k}{1+\lambda_k}$$ up to a
sign convention.

**Numerically obtaining $$\Gamma$$.** For a quadratic Hamiltonian written in Majorana form as
$$H = \frac{i}{4}\sum_{ab} M_{ab}\gamma_a\gamma_b$$ with $$M$$ real antisymmetric, the ground
state minimises $$\langle H\rangle = \frac14 \sum_{ab} M_{ab}\Gamma_{ab}$$, and the minimiser
is minus the orthogonal polar factor of $$M$$:

$$
\Gamma = -\,M\,\big(M^{\mathsf T} M\big)^{-1/2},
$$

with the inverse square root understood as a pseudo-inverse, so that the kernel of $$M$$ maps
to $$\Gamma = 0$$ — i.e. exactly-zero-energy Majoranas come out maximally mixed, which is the
physically correct answer. Since $$M^{\mathsf T}M$$ is real symmetric, one ordinary
eigensolver does the whole job; the widget below runs this in your browser.

**The consistency check.** Turning pairing off ($$\Delta = 0$$) should reduce all of this to
the previous post's number-conserving machinery. It does: for the chain of Section 4 at
$$\Delta = 0$$ I computed $$S_A$$ both ways — through $$\Gamma$$ and its Schur values, and
through $$C\vert_A$$ and its eigenvalues — and the two agree to $$\sim 10^{-13}$$ across a
range of chemical potentials. The change of variables is genuinely just a change of
variables.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — The Kitaev chain + static SVG of the two dimerizations
     ===================================================================== -->

## 4 · The Kitaev chain, and two ways to pair up

Time to spend the formalism on the model it was invented for. Kitaev's chain of spinless
fermions {% cite kitaev2001unpaired --file refs_free_fermions %} is the minimal model of a
one-dimensional $$p$$-wave superconductor:

$$
H = -\mu \sum_j c_j^\dagger c_j
    \;-\; t \sum_j \big(c_j^\dagger c_{j+1} + \mathrm{h.c.}\big)
    \;+\; \Delta \sum_j \big(c_j c_{j+1} + \mathrm{h.c.}\big).
$$

Three terms: an on-site energy, nearest-neighbour hopping, and nearest-neighbour pairing.
Rewriting it in Majoranas is a short computation with a memorable result — the couplings
organise into exactly three families,

$$
M_{2j-1,\,2j} = -\mu,
\qquad
M_{2j,\,2j+1} = t + \Delta,
\qquad
M_{2j-1,\,2j+2} = \Delta - t,
$$

in the convention $$H = \frac{i}{4}\sum_{ab}M_{ab}\gamma_a\gamma_b$$. The first couples the
two halves of the *same* site. The second couples the second half of site $$j$$ to the first
half of site $$j+1$$ — *across* a bond. Now look at what happens at two special points.

**The trivial limit** $$t = \Delta = 0$$, $$\mu \neq 0$$. Only the first family survives:
each site's two Majoranas are bonded to each other, and the chain is a row of independent
sites. Nothing is shared with anybody.

**Kitaev's sweet spot** $$\mu = 0$$, $$t = \Delta$$. Now the first and third families vanish
and only $$M_{2j,2j+1} = 2t$$ remains:

$$
H = i\,t \sum_{j=1}^{N-1} \gamma_{2j}\,\gamma_{2j+1}.
$$

Every Majorana is bonded to one on the *neighbouring* site — and two operators are missing
from that sum entirely. $$\gamma_1$$, the first half of the first site, and $$\gamma_{2N}$$,
the second half of the last, appear nowhere in $$H$$. They cost no energy. They are the
famous **unpaired Majorana edge modes**, and because they can be combined into a single
ordinary fermion $$f = (\gamma_1 + i\gamma_{2N})/2$$ that costs nothing to occupy, the ground
state is two-fold degenerate — with the two states differing in *fermion parity*, and the
fermion in question spread across the entire length of the chain.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 470 226" width="470" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Two dimerization patterns of Majoranas in the Kitaev chain: trivial intra-site pairing versus topological inter-site pairing leaving unpaired edge Majoranas">
    <defs>
      <style>
        .mjd { fill: currentColor; }
        .lbl { font: 11px system-ui, sans-serif; fill: currentColor; }
        .ttl { font: 600 11.5px system-ui, sans-serif; }
      </style>
    </defs>

    <!-- ============ TRIVIAL ============ -->
    <text x="12" y="20" class="ttl" fill="currentColor" opacity="0.9">trivial &#183; t = &#916; = 0</text>
    <!-- site boxes -->
    <g fill="currentColor" opacity="0.07">
      <rect x="30" y="34" width="72" height="38" rx="6"/>
      <rect x="118" y="34" width="72" height="38" rx="6"/>
      <rect x="206" y="34" width="72" height="38" rx="6"/>
      <rect x="294" y="34" width="72" height="38" rx="6"/>
      <rect x="382" y="34" width="72" height="38" rx="6"/>
    </g>
    <!-- intra-site bonds -->
    <g fill="none" stroke="currentColor" stroke-width="2.4" opacity="0.75">
      <path d="M 50 53 Q 66 71 82 53"/>
      <path d="M 138 53 Q 154 71 170 53"/>
      <path d="M 226 53 Q 242 71 258 53"/>
      <path d="M 314 53 Q 330 71 346 53"/>
      <path d="M 402 53 Q 418 71 434 53"/>
    </g>
    <!-- majorana dots -->
    <g class="mjd">
      <circle cx="50" cy="53" r="4"/><circle cx="82" cy="53" r="4"/>
      <circle cx="138" cy="53" r="4"/><circle cx="170" cy="53" r="4"/>
      <circle cx="226" cy="53" r="4"/><circle cx="258" cy="53" r="4"/>
      <circle cx="314" cy="53" r="4"/><circle cx="346" cy="53" r="4"/>
      <circle cx="402" cy="53" r="4"/><circle cx="434" cy="53" r="4"/>
    </g>
    <text x="235" y="90" class="lbl" text-anchor="middle" opacity="0.75">every Majorana bonded inside its own site &#183; nothing crosses a bond</text>

    <!-- ============ TOPOLOGICAL ============ -->
    <text x="12" y="132" class="ttl" fill="var(--global-theme-color)">topological &#183; &#956; = 0, t = &#916;</text>
    <g fill="currentColor" opacity="0.07">
      <rect x="30" y="146" width="72" height="38" rx="6"/>
      <rect x="118" y="146" width="72" height="38" rx="6"/>
      <rect x="206" y="146" width="72" height="38" rx="6"/>
      <rect x="294" y="146" width="72" height="38" rx="6"/>
      <rect x="382" y="146" width="72" height="38" rx="6"/>
    </g>
    <!-- inter-site bonds -->
    <g fill="none" stroke="var(--global-theme-color)" stroke-width="2.4" opacity="0.95">
      <path d="M 82 165 Q 110 143 138 165"/>
      <path d="M 170 165 Q 198 143 226 165"/>
      <path d="M 258 165 Q 286 143 314 165"/>
      <path d="M 346 165 Q 374 143 402 165"/>
    </g>
    <!-- unpaired edge majoranas, amber haloes -->
    <g>
      <circle cx="50" cy="165" r="9.5" fill="#e0a63a" opacity="0.3"/>
      <circle cx="434" cy="165" r="9.5" fill="#e0a63a" opacity="0.3"/>
      <circle cx="50" cy="165" r="4.4" fill="#e0a63a"/>
      <circle cx="434" cy="165" r="4.4" fill="#e0a63a"/>
    </g>
    <g class="mjd">
      <circle cx="82" cy="165" r="4"/>
      <circle cx="138" cy="165" r="4"/><circle cx="170" cy="165" r="4"/>
      <circle cx="226" cy="165" r="4"/><circle cx="258" cy="165" r="4"/>
      <circle cx="314" cy="165" r="4"/><circle cx="346" cy="165" r="4"/>
      <circle cx="402" cy="165" r="4"/>
    </g>
    <text x="50" y="196" class="lbl" text-anchor="middle" fill="#b3760a">&#947;&#8321;</text>
    <text x="434" y="196" class="lbl" text-anchor="middle" fill="#b3760a">&#947;&#8322;&#8345;</text>
    <text x="242" y="213" class="lbl" text-anchor="middle" opacity="0.75">bonds cross sites &#183; one Majorana left over at each end, costing zero energy</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:34rem;margin:0.6rem auto 0;">
    The two dimerizations. Each box is a site holding two Majorana halves. In the trivial
    phase the halves pair up <em>within</em> each site; in the topological phase they pair
    <em>across</em> bonds, and the two Majoranas at the ends of the chain are left with no
    partner — zero-energy edge modes.
  </figcaption>
</figure>

The picture is the argument. Both patterns are perfectly good ways of pairing up $$2N$$
Majoranas, and neither can be deformed into the other without, at some point, closing the
gap and breaking bonds — which is precisely what makes the distinction *topological* rather
than a matter of degree. For the full model the transition sits at $$|\mu| = 2t$$: inside,
the chain is in the topological phase with its edge modes; outside, it is trivial. Alicea's
review {% cite alicea2012new --file refs_free_fermions %} is the place to go for how this
idealisation connects to real semiconductor-superconductor wires.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — Topology in the entanglement spectrum + WIDGET
     ===================================================================== -->

## 5 · Topology, visible in the entanglement spectrum

Now put the two halves of this post together — the counting rule from Section 3, and the
bond pictures from Section 4 — and something rather remarkable falls out.

Cut the chain in the middle and ask for the entanglement of the left half. In the **trivial**
phase every Majorana is bonded inside its own site, so no bond crosses the cut. Every mode in
$$A$$ has both of its halves in $$A$$; nothing dangles; $$S_A = 0$$.

In the **topological** phase the bonds cross sites, so the cut necessarily severs one. That
leaves a dangling Majorana just left of the cut. And there is a second dangling Majorana
already waiting: $$\gamma_1$$, the unpaired mode at the far end of the chain, which sits
inside $$A$$ and has no partner anywhere. Two dangling halves, which by Section 3's rule
combine into exactly one maximally mixed mode:

<div class="key-eq" markdown="1">

$$
S_A = \ln 2,
\qquad\text{with one eigenvalue pinned at } \zeta = \tfrac12 .
$$

</div>

This is the punchline of the post. A property that sounds abstract and global — a topological
phase, distinguished by an edge mode you would have to go to the end of the chain to find —
shows up as a **number sitting in the middle of a spectrum**, in a matrix small enough to
diagonalize instantly. You do not need to find the edge, measure a Chern number, or examine
the excitation spectrum. Restrict the covariance matrix to half the chain, take its Schur
values, and look for an eigenvalue at $$\tfrac12$$.

That the entanglement spectrum knows about topology is a general story, not an accident of
this model: the entanglement spectrum of a topological insulator or superconductor inherits
protected structure from the physical edge spectrum, a correspondence made precise by
Fidkowski {% cite fidkowski2010entanglement --file refs_free_fermions %} and, for
symmetry-protected phases more broadly, by Turner, Zhang and Vishwanath
{% cite turner2010entanglement --file refs_free_fermions %}. Kitaev's chain is where you can
watch it happen with the fewest moving parts.

The widget below runs the real calculation live — building $$M$$, forming
$$\Gamma = -M(M^{\mathsf T}M)^{-1/2}$$, restricting to the left half, and extracting Schur
values — for a 20-site chain with open ends. Drag $$\mu/t$$ across the transitions at
$$\pm 2$$ and watch two things at once: the bonds in the top panel switching from inside-site
to across-bond, and an eigenvalue in the lower panel diving to $$\tfrac12$$ and locking there
for the whole topological phase.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="kit1-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:center;margin-top:0.75rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      μ/t
      <input id="kit1-mu" type="range" min="-4" max="4" step="0.05" value="0">
      <span id="kit1-mu-val" style="min-width:3.2em;font-variant-numeric:tabular-nums;">0.00</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      Δ/t
      <input id="kit1-delta" type="range" min="0" max="2" step="0.05" value="1">
      <span id="kit1-delta-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">1.00</span>
    </label>
    <span style="opacity:0.7;">grey bonds = intra-site · teal = inter-site · amber halo = unpaired</span>
  </div>
</div>

<script src="{{ '/assets/js/kitaev-entanglement.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("kit1-mount");
    if (!mount || typeof createKitaevEntanglement !== "function") return;
    var k = createKitaevEntanglement(mount, { N: 20, mu: 0, delta: 1 });
    var mu = document.getElementById("kit1-mu"), muV = document.getElementById("kit1-mu-val");
    var dl = document.getElementById("kit1-delta"), dlV = document.getElementById("kit1-delta-val");
    mu.addEventListener("input", function () { k.setMu(mu.value); muV.textContent = (+mu.value).toFixed(2); });
    dl.addEventListener("input", function () { k.setDelta(dl.value); dlV.textContent = (+dl.value).toFixed(2); });
  })();
</script>

<figcaption style="font-size:0.85rem;opacity:0.8;max-width:34rem;margin:-0.5rem auto 1.5rem;text-align:center;">
  Everything here is computed in the browser from the model — no fitted or canned curves. The
  faint dots trace the entanglement spectrum across the whole μ/t sweep; the bright dots are
  the current spectrum. Near the transitions the pinning is only approximate, because the two
  dangling Majoranas overlap once the correlation length becomes comparable to the chain —
  honest finite-size physics, visible as the eigenvalue drifting off ½ near |μ| = 2.
</figcaption>

Two details in that widget repay attention. First, $$S_A / \ln 2$$ reads essentially exactly
$$1.000$$ across the entire topological phase and then falls away outside it — the quantity
is quantized in the phase, not merely large. Second, the pinning degrades near $$|\mu| = 2$$:
the correlation length diverges at the transition, the two dangling Majoranas start to notice
each other across a finite chain, and their exact zero mode splits. That is not a numerical
defect; it is what finite size does to a topological invariant, and it is the reason
topological quantization is a statement about the thermodynamic limit.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 6 — Closing hook → dynamics (A3). ONE open question only.
     ===================================================================== -->

## 6 · What the matrix still hasn't been asked

Two posts in, the accounting is looking good. A number-conserving Gaussian state collapses
into $$C$$; a paired one collapses into $$\Gamma$$; entanglement, in both cases, is a
question about the spectrum of a small matrix restricted to a region — and in the paired
case, that spectrum can detect a topological phase.

But every state we have looked at has been sitting still. Ground states, thermal states —
equilibrium, all of it. The obvious question is what happens when you stop the system from
resting: prepare a state, change the Hamiltonian abruptly, and let it run.

There is a reason to expect trouble. Entanglement in a quenched system does not politely
stay put — it *grows*, typically linearly in time, until the subsystem is as entangled as it
can be. That growth is exactly what makes real-time simulation of quantum many-body systems
hard, and it is why the tensor-network methods that dominate ground-state physics struggle
after a quench. A matrix with $$L^2$$ entries cannot possibly track an amount of entanglement
that is growing without bound…

…and yet the correlation matrix does not appear to care. It has $$L^2$$ entries at $$t=0$$
and $$L^2$$ entries forever after. Something has to give — either the entanglement does not
really grow, or a small matrix can somehow encode a state that no small tensor network can.
The next post takes up that contradiction.

<div class="sec-divider" aria-hidden="true">•••</div>

## References

{% bibliography --file refs_free_fermions --cited --group_by none %}

---

> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
