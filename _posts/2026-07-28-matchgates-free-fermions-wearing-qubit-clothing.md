---
layout: post
title: "Matchgates: Free Fermions Wearing Qubit Clothing"
date: 2026-07-28 05:00:00-0700
description: A family of two-qubit gates that is classically simulable on a line — yet one SWAP gate away from universal quantum computation. The resolution is that matchgates are free fermions in disguise, and an entire circuit is nothing but a rotation of one covariance matrix.
tags: [matchgates, free-fermions, quantum-circuits, simulation]
categories: [matchgates]
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
    --thread-color: #b3760a; /* amber — the series' 'narrative thread' colour, not the teal accent */
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
     SERIES: "Matchgate Circuits" — Part 1 of 3 (a 4th may be added).
     Part of the "tools from my research" arc; sequel to the free-fermion
     post, which is the hard prerequisite (Γ, ζ_k, Wick, entropy formulas
     are CITED from there, never re-derived — note: its §4, the Majorana/Γ
     section, is cite-forward: written prose pending, conventions fixed).

     THROUGH-LINE (recurs in .thread-note callouts, escalating across the
     series): THE COVARIANCE MATRIX IS THE WHOLE STATE.
       Post 1: gates are rotations of Γ.
       Post 2: circuits themselves can be read off from Γ.
       Post 3: even measurement is a closed-form update of Γ.
     The exponential Hilbert space never has to be touched — until the
     moment it does (Post 3/4 outlook).

     POST-LEVEL dramatic thread: nearest-neighbour matchgates on a line are
     classically simulable; add SWAP — a mere relabeling! — and you get
     universality (Jozsa–Miyake). "Classical" hangs by a thread, and the
     thread is the Jordan–Wigner string. Locality in the FERMION ordering
     is the entire resource.

     Audience: curious undergrads AND PhD peers simultaneously. Physical
     intuition in the main text; derivations in collapsible .learn-more-box.

     NOTATION (inherited from the free-fermion post): correlation matrix
     C_ij = <c_i† c_j>; occupation eigenvalues ζ_k; Majoranas γ_a with
     {γ_a, γ_b} = 2δ_ab; covariance matrix Γ_ab = (i/2)<[γ_a, γ_b]>.
     Fermion↔qubit sign convention fixed in §2: c_k = (γ_{2k−1} + iγ_{2k})/2,
     so n_k = (1 − Z_k)/2 and qubit |0⟩ = empty mode.
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — A two-qubit gate with a secret (~450 words, minimal math;
     WRITE AFTER sections 2–4 exist — the hook reads better then).
     - Open concretely: define G(A,B), block-diagonal in the parity basis
       (A on span{|00⟩,|11⟩}, B on span{|01⟩,|10⟩}), with the
       strange-looking constraint det A = det B.
     - One paragraph of history: Valiant found these via counting perfect
       matchings (hence the name); circuits on a line classically
       simulable BEFORE the fermion connection was understood. Cite, don't
       explain the matchings construction.
     - The hook, up front as the post's dramatic tension: n.n. matchgates
       on a line are efficiently classical; add SWAP — which merely
       relabels qubits! — and you get universal QC (Jozsa–Miyake).
       Whatever "classical" means here, it hangs by a thread. The post's
       job is to find the thread.
     - Set expectations: matchgates are free fermions in disguise; the
       thread is the Jordan–Wigner string.
     ===================================================================== -->

## 1 · A two-qubit gate with a secret

<!-- (to be written after §§2–4 — see scaffold comment above) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — The Jordan–Wigner dictionary (~550 words + collapsible)
     - Define Majoranas on qubits: γ_{2k−1} = Z_1⋯Z_{k−1} X_k,
       γ_{2k} = Z_1⋯Z_{k−1} Y_k. Algebra {γ_a,γ_b} = 2δ_ab verified in one
       displayed line; full check in the box.
     - The Z-string is the point, not a nuisance: fermion operators on
       different sites anticommute, qubit operators commute — the string
       is the exchange-statistics bookkeeping.
     - Identify c_k = (γ_{2k−1} + iγ_{2k})/2, n_k = (1−Z_k)/2, |0⟩ = empty:
       computational basis states are Fock states. These γ's ARE the
       free-fermion post's Majoranas (cite-forward to its §4).
     - Key consequence: NEAREST-NEIGHBOUR two-qubit operators like
       X_k X_{k+1} map to LOCAL Majorana bilinears (strings cancel);
       distant pairs drag a full string. This single fact is the thread
       from §1 — locality on the line keeps the fermion description
       quadratic. (Payoff completed in §4.)
     - COLLAPSIBLE BOX: full verification of the Majorana algebra + the
       dictionary table (Z_k, X_kX_{k+1}, Y_kY_{k+1}, X_kY_{k+1},
       Y_kX_{k+1} as iγγ bilinears). Table is load-bearing for §3.
     ===================================================================== -->

## 2 · The Jordan–Wigner dictionary

Section 1 left us with a claim: the matchgate family is a fermion system in disguise, and
the disguise is a change of variables nearly a century old — the **Jordan–Wigner
transformation** {% cite jordan1928uber --file refs_matchgates %}. Here is the dictionary.
On a line of $$n$$ qubits, build two operators for each site $$k$$:

$$
\gamma_{2k-1} = Z_1 Z_2 \cdots Z_{k-1}\, X_k ,
\qquad
\gamma_{2k} = Z_1 Z_2 \cdots Z_{k-1}\, Y_k .
$$

Each is a Pauli string — a single $$X$$ or $$Y$$ at site $$k$$, dressed with a $$Z$$ on
*every site to its left*. There are $$2n$$ of them, and a two-line computation (done fully
in the box below) shows they obey one strikingly rigid algebra:

$$
\gamma_a^\dagger = \gamma_a ,
\qquad
\{\gamma_a, \gamma_b\} \equiv \gamma_a \gamma_b + \gamma_b \gamma_a = 2\,\delta_{ab} .
$$

Hermitian, square to one, and — the crucial part — *anticommute* in every distinct pair.
That is precisely the algebra of **Majorana fermion operators**: these strings of qubit
operators are, operator-for-operator, the Majoranas
$$\gamma_{2k-1} = c_k + c_k^\dagger$$ of
[the free-fermion post]({% post_url 2026-07-06-free-fermions-one-matrix %}). Running the
identification backwards,

$$
c_k = \tfrac{1}{2}\left(\gamma_{2k-1} + i\,\gamma_{2k}\right)
$$

defines bona fide fermion modes on the qubit chain — the box checks
$$\{c_j, c_k^\dagger\} = \delta_{jk}$$ — with occupation number
$$n_k = c_k^\dagger c_k = \tfrac{1}{2}(1 - Z_k)$$. So the computational basis *is* a Fock
basis: qubit $$\lvert 0\rangle$$ is an empty fermionic mode, $$\lvert 1\rangle$$ an
occupied one, and $$\lvert 0\cdots 0\rangle$$ is the vacuum.

Why the string? It is tempting to read the $$Z_1\cdots Z_{k-1}$$ tail as an ugly technical
appendage, but the string is the entire point. Fermion operators on *different* sites
anticommute — exchange statistics demands it — while qubit operators on different sites
commute; no strictly local identification could ever convert one algebra into the other.
The string repairs the statistics: when you slide the short operator
$$\gamma_{2k-1}$$ past the longer $$\gamma_{2l-1}$$ (say $$k < l$$), the $$X_k$$ of the
first must hop over the $$Z_k$$ in the second one's tail, and that costs exactly the minus
sign fermionic exchange requires. The Z-string is *exchange-statistics bookkeeping*, made
of qubit operators and stretched along the line.

Strings this long look expensive. The saving grace — and the single most important fact in
this post — is that for **nearest neighbours they cancel**. Multiply two adjacent
Majoranas and the two tails overlap on all but one site:

$$
X_k X_{k+1} = -\,i\,\gamma_{2k}\,\gamma_{2k+1} ,
$$

a *local* product of just two Majoranas — a **bilinear** — with no string in sight. The
same happens for $$Y_k Y_{k+1}$$, $$Z_k$$, and their relatives (the box tabulates them
all). But pull the two qubits apart and the magic dies: a distant pair like
$$X_j X_k$$ with $$j < k-1$$ is *not* a bilinear — the bilinear
$$-i\gamma_{2j}\gamma_{2k-1}$$ equals $$X_j Z_{j+1}\cdots Z_{k-1} X_k$$, string included,
and plain $$X_j X_k$$ needs a *quartic-or-worse* pile of Majoranas to build. Quadratic
language is reserved for operators that respect the ordering of the line.

<p class="thread-note"><span class="thread-label">The thread</span> Fermionic statistics is nonlocal bookkeeping on qubits — every fermion operator drags a Z-string along the line. Nearest-neighbour operators are the ones whose strings cancel. Hold on to this: locality in the fermion ordering is the thread the whole post hangs by, and §4 is where it pays off.</p>

<div class="learn-more-box" markdown="0">
{% details Derivation: the Majorana algebra, and the qubit–fermion dictionary table %}
**1 · The algebra.**
Each $$\gamma_a$$ is a product of Hermitian, mutually commuting-or-identical Pauli factors,
so $$\gamma_a^\dagger = \gamma_a$$ and $$\gamma_a^2 = 1$$ (every Pauli squares to one).
For distinct pairs, check the three cases:

*Same site.* $$\gamma_{2k-1}\gamma_{2k} = (Z_1\cdots Z_{k-1} X_k)(Z_1\cdots Z_{k-1} Y_k)
= X_k Y_k$$, since the identical tails square away and act on other sites. But
$$X_k Y_k = -Y_k X_k$$, so the pair anticommutes.

*Different sites, odd–odd.* Take $$k < l$$:
$$\gamma_{2k-1}\gamma_{2l-1} = (Z_1\cdots Z_{k-1}X_k)(Z_1\cdots Z_{l-1}X_l)$$. Every
factor of the first operator commutes with every factor of the second *except* the single
collision at site $$k$$: the first has $$X_k$$, the second has $$Z_k$$ in its tail, and
$$X_k Z_k = -Z_k X_k$$. One collision, one minus sign: the pair anticommutes.

*Other cross-site pairs.* Identical argument — the shorter operator's $$X$$ or $$Y$$
always meets exactly one $$Z$$ from the longer operator's tail, and $$YZ = -ZY$$ too.
Hence $$\{\gamma_a,\gamma_b\} = 2\delta_{ab}$$ for all $$a, b$$.

**2 · The fermion modes.**
With $$c_k = (\gamma_{2k-1} + i\gamma_{2k})/2$$, expand anticommutators using bilinearity
and $$\{\gamma_a,\gamma_b\} = 2\delta_{ab}$$:

$$
\{c_j, c_k^\dagger\}
= \tfrac{1}{4}\Big( \{\gamma_{2j-1},\gamma_{2k-1}\} + \{\gamma_{2j},\gamma_{2k}\} \Big)
= \delta_{jk} ,
\qquad
\{c_j, c_k\} = \tfrac{1}{4}\Big( 2\delta_{jk} - 2\delta_{jk} \Big) = 0 ,
$$

the canonical fermion algebra. The number operator comes out as

$$
n_k = c_k^\dagger c_k
= \tfrac{1}{4}\big(\gamma_{2k-1} - i\gamma_{2k}\big)\big(\gamma_{2k-1} + i\gamma_{2k}\big)
= \tfrac{1}{2}\big(1 + i\,\gamma_{2k-1}\gamma_{2k}\big)
= \tfrac{1}{2}\big(1 - Z_k\big),
$$

using $$\gamma_{2k-1}\gamma_{2k} = X_k Y_k = iZ_k$$ in the last step. So
$$\lvert 0 \rangle$$ has $$n_k = 0$$: the computational vacuum is the Fock vacuum.

**3 · The dictionary table.**
Multiply pairs of Majoranas and let the tails cancel. For one site and for adjacent sites
(the tails overlap everywhere except site $$k$$, leaving a single $$Z_k$$ to absorb):

| qubit operator | Majorana bilinear |
| :--- | :--- |
| $$Z_k$$ | $$-i\,\gamma_{2k-1}\,\gamma_{2k}$$ |
| $$X_k X_{k+1}$$ | $$-i\,\gamma_{2k}\,\gamma_{2k+1}$$ |
| $$Y_k Y_{k+1}$$ | $$+i\,\gamma_{2k-1}\,\gamma_{2k+2}$$ |
| $$X_k Y_{k+1}$$ | $$-i\,\gamma_{2k}\,\gamma_{2k+2}$$ |
| $$Y_k X_{k+1}$$ | $$+i\,\gamma_{2k-1}\,\gamma_{2k+1}$$ |

Sample derivation, first row: $$\gamma_{2k-1}\gamma_{2k} = X_k Y_k = i Z_k$$, so
$$Z_k = -i\gamma_{2k-1}\gamma_{2k}$$. Second row:
$$\gamma_{2k}\gamma_{2k+1} = (Z_1\cdots Z_{k-1}Y_k)(Z_1\cdots Z_k X_{k+1})
= Y_k Z_k X_{k+1} = i\,X_k X_{k+1}$$, using $$Y_k Z_k = iX_k$$. The rest follow the same
two moves: cancel the common tail, then contract the leftover pair of Paulis at site
$$k$$ with $$XY = iZ$$, $$YZ = iX$$, $$ZX = iY$$.

For *non-adjacent* sites the tails no longer cancel:
$$-i\,\gamma_{2j}\,\gamma_{2k-1} = X_j\, Z_{j+1}\cdots Z_{k-1}\, X_k$$ for $$j < k-1$$ —
the bilinear is the *stringed* operator, and the bare $$X_j X_k$$ is not quadratic at all.
This table is load-bearing for §3: matchgate generators are built from rows 1–5.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — Matchgates are quadratic evolution (~550 words + box)
     - Generator view: up to local Z-phases, any matchgate is
       G = exp(iα X⊗X + iβ Y⊗Y) dressed with single-qubit Z-rotations
       (Kraus–Cirac-style decomposition; derivation pointer, not proof).
       Via §2's table, the exponent is a quadratic Majorana Hamiltonian.
     - Therefore: matchgate circuit = time evolution under piecewise
       quadratic fermion Hamiltonian; conversely quadratic evolution on a
       line Trotterizes into matchgates. N.n. matchgate circuits =
       fermionic linear optics (cite Knill, Bravyi).
     - CENTRAL THEOREM, displayed prominently (.key-eq):
       U† γ_a U = Σ_b R_ab γ_b, R ∈ SO(2n). One gate → SO(4) rotation on
       its four Majoranas; circuit → product of rotations. Heisenberg
       picture: the gate set is exactly the unitaries whose Majorana
       action closes on LINEAR combinations.
     - det A = det B decoded: precisely the condition killing the
       non-quadratic part — connect back to §1's "strange constraint."
     - COLLAPSIBLE BOX: compute R ∈ SO(4) for G = exp(iα XX + iβ YY)
       explicitly — direct sum of two 2×2 rotations by 2α, 2β in the right
       Majorana pairing (cf. R′ structure in Langer et al. App. D).
     ===================================================================== -->

## 3 · Matchgates are quadratic evolution

<!-- (next section to write — after §2 is approved) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — Why this means "classically simulable" (~600 words + WIDGET)
     - Cash in the free-fermion post: Gaussian state ↔ covariance matrix
       Γ_ab = (i/2)<[γ_a,γ_b]> (cite; don't re-derive). Computational
       basis states are Gaussian; matchgates preserve Gaussianity.
     - The complete simulation algorithm in three displayed lines:
       (1) init Γ of |0…0⟩ (direct sum of 2×2 antisymmetric blocks);
       (2) per gate Γ → RΓRᵀ on the touched 4×4 block;
       (3) read out observables via Wick/Pfaffian from Γ (cite ff post).
     - Cost accounting, honest: 2^n amplitudes vs 2n×2n antisymmetric
       matrix; O(1) per gate on the local block, O(n³)-ish generic
       readout. What's included: expectation values (+ samples with more
       machinery → Post 3); global phases & non-Gaussian observables cost
       extra.
     - Resolve §1's tension: SWAP = G(1, X): det A = 1, det B = −1 —
       fails the constraint. In Majorana language SWAP's action is not
       linear on γ's — generates quartic terms; Z-string bookkeeping
       breaks. Locality in the FERMION ordering is the entire resource;
       non-adjacent matchgates fail the same way. One paragraph, no
       belaboring.
     - Close on the forward pointer: the whole state is Γ, so — can I read
       a CIRCUIT off a given Γ? (Post 2.) What does MEASUREMENT do to Γ?
       (Post 3.)
     - WIDGET: matchgate-sandbox.js — brickwork circuit on N=12–16 qubits,
       live |Γ_ab| heatmap (light cone from the diagonal), entanglement
       profile S(x) vs cut, "insert a SWAP layer" toggle that HONESTLY
       halts the simulation with an overlay (no faked data).
     ===================================================================== -->

## 4 · Why this means "classically simulable"

<!-- (to be written after §3) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — Where this goes (~250 words, no math)
     - One paragraph per future post: Post 2 (circuits from covariance
       matrices, optimal preparation, entanglement = circuit complexity —
       Langer et al. + GMERA/Wong–Potter connection), Post 3 (measurement
       updates, projected ensembles, deep thermalization — Bejan, Béri &
       McGinley).
     - One-sentence teaser for possible Post 4: sprinkle in a few
       non-matchgates and the simulation cost grows exponentially in their
       number — the classical/quantum boundary can be crossed gate by
       gate.
     - Restate the through-line: one matrix, and so far it has absorbed
       every gate we've thrown at it.
     ===================================================================== -->

## 5 · Where this goes

<!-- (to be written last, with references) -->

## References

{% bibliography --file refs_matchgates --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
