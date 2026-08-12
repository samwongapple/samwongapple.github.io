---
layout: post
title: "Building Gaussian States, One Rotation at a Time"
date: 2026-07-31 03:00:00-0700
description: Simulation run backwards — given a covariance matrix, read off a matchgate circuit that prepares the state. The compiler is Gaussian elimination with rotations, and the gate count it cannot go below is set by the entanglement.
tags: [matchgates, free-fermions, quantum-circuits, entanglement]
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
     SERIES: "Matchgate Circuits" — Part 2 of 3 (a 4th may be added).
     Prerequisites: Post 1 (JW dictionary, U†γU = Rγ, Γ-update simulation)
     and the free-fermion post (C, ζ_k, Γ, straddling-orbital intuition —
     its §4 is cite-forward, conventions fixed).

     THROUGH-LINE escalation for this post: the covariance matrix is the
     whole state — and now THE CIRCUIT ITSELF CAN BE READ OFF FROM Γ.

     TARGET PAPER (exit skill): Langer, Morral-Yepes, Gammon-Smith,
     Pollmann & Kraus, "Matchgate circuit representation of fermionic
     Gaussian states: optimal preparation, approximation, and classical
     simulation", arXiv:2603.05675.

     POST-LEVEL dramatic thread: compilation is simulation run backwards.
     The same Givens rotations that diagonalize matrices ARE gates; zeroing
     out Γ column by column writes the preparation circuit for you, and the
     gate count you cannot go below is dictated by the entanglement
     spectrum. Entanglement = circuit complexity, made literal.

     Audience: curious undergrads AND PhD peers. Intuition in main text,
     derivations in collapsible boxes.

     NOTATION: as Post 1. Site k Majoranas: γ_{2k−1} (X-type), γ_{2k}
     (Y-type); Γ_ab = (i/2)⟨[γ_a,γ_b]⟩; vacuum blocks Γ_{2k−1,2k} = −1.
     ALL FORMULAS in this post (plane-rotation ↔ gate table, elimination
     algorithm, parity fix, gate/depth counts, truncation errors) verified
     numerically against exact statevector simulation, 2026-07-31.
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — The inverse problem (~450 words, minimal math)
     - Post 1's closing question, taken seriously: simulation maps circuit
       → Γ. Compilation is the arrow reversed: given Γ (say, the ground
       state of a quadratic H you actually care about), find a matchgate
       circuit — ideally the SHORTEST one — that builds the state from
       |0…0⟩.
     - Why care: state preparation is the entry fee for quantum simulation
       of fermions; benchmarking; and the conceptual prize — the cost of a
       state is a property of its entanglement.
     - Name the target paper (Langer et al.) as the post's study guide.
     - Tension to resolve: generic states need O(n²) gates. What lets a
       specific state cost less? Answer to be earned: its entanglement
       spectrum.
     ===================================================================== -->

## 1 · The inverse problem

[Post 1]({% post_url 2026-07-28-matchgates-free-fermions-wearing-qubit-clothing %}) ended
with a machine and a question. The machine: any matchgate circuit acts on the covariance
matrix as $$\Gamma \mapsto R\,\Gamma R^{\mathsf T}$$, one small rotation per gate, so
simulating the circuit means composing rotations of a $$2n \times 2n$$ matrix. The
question: can the arrow be reversed? Suppose someone *hands* you a covariance matrix — say
the ground state of a quadratic Hamiltonian you care about, delivered as nothing but its
$$\Gamma$$, the way [the free-fermion
post]({% post_url 2026-07-06-free-fermions-one-matrix %}) taught us ground states are
delivered. Can you read off a sequence of matchgates that *builds* that state from
$$\lvert 0\cdots 0\rangle$$? And if so — how short can the sequence be?

This is a compiler's question, and it has a compiler's payoff. State preparation is the
entry fee for quantum simulation of fermionic matter: before your quantum computer can
tell you anything about a superconductor's excitations, it must first stand the ground
state up on hardware, gate by gate, and every gate costs coherence time. Gaussian states
are the natural warm-up — rich enough to be genuinely entangled, structured enough that we
might hope for an *optimal* answer rather than a heuristic one. That hope is what this
post chases, and its study guide is the paper that settles it: Langer, Morral-Yepes,
Gammon-Smith, Pollmann and Kraus, who derive lower bounds on the gates required to prepare
an arbitrary pure Gaussian state and give explicit algorithms that saturate them
{% cite langer2026matchgate --file refs_matchgates %}. By the end you should be equipped
to read it.

But there is a conceptual prize hiding behind the engineering one, and it is the reason
this post exists. A counting argument (§2) will show that a *generic* Gaussian state on
$$n$$ modes costs $$O(n^2)$$ gates — no way around it. Yet the states physics actually
produces are not generic: ground states of gapped, local Hamiltonians obey area laws,
their correlations die off over a few sites, and their $$\Gamma$$ matrices are nearly
*banded*. Those states, it will turn out, compile to dramatically shorter circuits — and
the quantity that decides how short is precisely the entanglement spectrum
$$\{\zeta_k\}$$ we learned to read off $$C\vert_A$$ in the free-fermion post. The number
of gates a state costs *is* a statement about its entanglement. Circuit complexity is not
a metaphor for entanglement here; the two are the same number, counted two ways.

So the plan: first understand the gate set as a set of *rotations* (§2), then run
elimination backwards into a compiler (§3), then prove the entanglement lower bound (§4),
and finally let the compiler loose on real ground states — critical and gapped — and watch
the gate count track the physics (§5, with the widget).

<p class="thread-note"><span class="thread-label">The through-line</span> Post 1 said: the covariance matrix is the whole state, and gates rotate it. This post escalates the claim — the circuit itself can be read off from Γ. Compilation is simulation run backwards.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — A gate set made of plane rotations (~500 words + box)
     - Recast Post 1's dictionary as a rotation inventory: Z-rotation on
       qubit k = rotation in Majorana plane (2k−1, 2k) by 2θ; XX-rotation
       on (k,k+1) = plane (2k, 2k+1) by 2α. Together: rotations in ALL
       adjacent planes (a, a+1).
     - Adjacent transpositions generate S_n; adjacent plane rotations
       generate SO(2n). Givens rotations — the numerical linear algebra
       workhorse — ARE gates.
     - Counting: dim SO(2n) = n(2n−1) ⇒ generic state needs ~n(2n−1)/? …
       state manifold is SO(2n)/U(n), dim n(n−1)+…; headline: O(n²)
       parameters ⇒ O(n²) one-parameter gates, and depth O(n) with
       brickwork parallelism (Kivlichan et al.).
     - COLLAPSIBLE BOX: e^{θγpγq} rotates plane (p,q) by 2θ (2-line
       rederivation via the algebra); why {(a,a+1)} planes generate all of
       SO(2n); dimension count of the pure-state manifold SO(2n)/U(n).
     ===================================================================== -->

## 2 · A gate set made of plane rotations

Post 1's dictionary table was built for translation; read it now as an *inventory of
rotations*. A single-qubit $$Z$$-rotation, $$e^{i\theta Z_k}$$, has generator
$$Z_k = -i\gamma_{2k-1}\gamma_{2k}$$ — one Majorana bilinear — and a bilinear generator
does exactly one thing to the Majorana basis: it rotates the plane spanned by its two
Majoranas, leaving the other $$2n-2$$ directions alone. Concretely (two-line derivation in
the box),

$$
e^{-\theta \gamma_p \gamma_q}\, \gamma_p\, e^{\theta \gamma_p \gamma_q}
= \cos(2\theta)\,\gamma_p + \sin(2\theta)\,\gamma_q ,
$$

a **Givens rotation** by angle $$2\theta$$ in the $$(p,q)$$ plane. So the $$Z$$-rotation
on qubit $$k$$ rotates the plane $$(2k-1,\,2k)$$, and the two-qubit $$XX$$-rotation
$$e^{i\alpha X_k X_{k+1}}$$ — generator $$-i\gamma_{2k}\gamma_{2k+1}$$ — rotates the plane
$$(2k,\,2k+1)$$. Put the two families side by side and notice what they cover: planes
$$(1,2), (2,3), (3,4), (4,5), \ldots$$ — **every adjacent pair** of Majorana indices,
alternating $$Z$$-type and $$XX$$-type as the index parity alternates. Nothing else is
needed. Just as adjacent transpositions generate every permutation, adjacent plane
rotations generate every rotation: any $$R \in \mathrm{SO}(2n)$$ is a product of Givens
rotations in adjacent planes (box). Two humble gate families — phase shifts and
nearest-neighbour $$XX$$ — exhaust fermionic linear optics.

If the name Givens rings a bell from numerical linear algebra, that is the whole point.
Givens rotations are the workhorse that QR-decomposes matrices by zeroing out one entry at
a time — and here each one *is a gate you can apply on hardware*. The identification
matters in both directions: matrix algorithms become circuits, and circuit-design
questions become matrix-factorization questions with fifty years of numerical answers.

How many rotations must a circuit spend? Count parameters. The rotation group
$$\mathrm{SO}(2n)$$ has dimension $$n(2n-1)$$, and the manifold of pure Gaussian states —
rotations modulo the ones that merely rephase the vacuum — is
$$\mathrm{SO}(2n)/\mathrm{U}(n)$$, of dimension $$n(n-1)$$ (box). Each gate contributes
*one* real parameter. So a generic pure Gaussian state cannot be prepared with fewer than
$$n(n-1)$$ one-parameter gates: the $$O(n^2)$$ scaling promised in §1 is a dimension
count, not a pessimism. The same count comes with a consolation: gates acting on disjoint
sites run in parallel, and a brickwork schedule packs the $$O(n^2)$$ rotations into depth
$$O(n)$$ {% cite kivlichan2018quantum --file refs_matchgates %} — linear depth on a line
with nearest-neighbour gates only, which is as good as a light cone allows.

That is the generic worst case. The interesting physics — and the next two sections — is
about beating it.

<div class="learn-more-box" markdown="0">
{% details Derivation: bilinears rotate planes, adjacent planes generate, and the dimension count %}
**1 · One bilinear, one plane.**
Let $$S = \theta\,\gamma_p\gamma_q$$ with $$p \neq q$$. The algebra
$$\{\gamma_a,\gamma_b\} = 2\delta_{ab}$$ gives
$$[\gamma_p\gamma_q,\, \gamma_p] = -2\gamma_q$$ and
$$[\gamma_p\gamma_q,\, \gamma_q] = +2\gamma_p$$, while $$\gamma_r$$ for
$$r \notin \{p,q\}$$ commutes with $$S$$ outright. Writing
$$\gamma(t) = e^{-tS}\gamma\, e^{tS}$$ and differentiating,

$$
\dot\gamma_p = 2\theta\,\gamma_q, \qquad \dot\gamma_q = -2\theta\,\gamma_p ,
$$

whose solution at $$t=1$$ is the rotation by $$2\theta$$ in the $$(p,q)$$ plane quoted in
the main text. Every other Majorana is untouched. (This is Post 1's
$$\mathrm{SO}(4)$$ box, specialized to a single plane.)

**2 · Adjacent planes suffice.**
A rotation in a *distant* plane $$(p,q)$$ can be assembled from adjacent ones exactly the
way a distant transposition is assembled from neighbours: conjugate. If $$G_{p}(\theta)$$
denotes the rotation by $$\theta$$ in plane $$(p,p+1)$$, then
$$G_p(\tfrac{\pi}{2})$$ maps $$\gamma_p \to \gamma_{p+1}$$ (up to sign), so conjugating a
rotation in plane $$(p+1,q)$$ by it produces the rotation in $$(p,q)$$. Induction walks
any plane to any other. Since the plane rotations $$(p,q)$$ for all $$p<q$$ generate
$$\mathrm{SO}(2n)$$ (their generators $$\gamma_p\gamma_q$$ span the Lie algebra
$$\mathfrak{so}(2n)$$ of antisymmetric matrices), the adjacent ones alone generate the
whole group.

**3 · The state manifold.**
Not every rotation changes the state: rotations with
$$R\,\Gamma_0 R^{\mathsf T} = \Gamma_0$$ stabilize the vacuum. The stabilizer of
$$\Gamma_0$$ inside $$\mathrm{SO}(2n)$$ is (a copy of) $$\mathrm{U}(n)$$ — these are
exactly the number-conserving rotations, mixing the $$n$$ modes among themselves without
creating pairs. Hence pure Gaussian states of fixed parity form the coset manifold

$$
\mathcal{M} = \mathrm{SO}(2n)/\mathrm{U}(n),
\qquad
\dim \mathcal{M} = n(2n-1) - n^2 = n(n-1),
$$

and $$n(n-1)$$ is the generic gate count. For $$n=2$$: $$\dim \mathcal M = 2$$ — the pure
two-mode Gaussian states of even parity form a *2-sphere*, a fact Post 3 will spend
lavishly.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — The compiler: Givens elimination on Γ (~600 words + box)
     - The algorithm, stated as Gaussian elimination with rotations:
       process Majorana rows pairwise; zero out row a from the far end
       inward with rotations in planes (b−1, b), θ = atan2(Γ_ab, Γ_{a,b−1});
       when the row is spent the block pins to ±1; parity fix (π-rotation
       in the next plane) if +1; recurse on the rest.
     - Purity does the bookkeeping: rows of a pure Γ are unit vectors
       (Γ orthogonal), so zeroing all but one entry forces ±1.
     - The circuit = the rotation list, reversed and negated. Gate count
       n(n−1) + O(n) fixes; depth O(n) by brickwork. This is exactly the
       structure of Langer et al.'s exact-preparation algorithm (their
       Fig. 2a); Kivlichan et al. is the Slater-determinant ancestor.
     - Parity: Pf(Γ) invariant under SO ⇒ +1 blocks come in pairs ⇒ fix
       always available. Matchgates conserve parity — the compiler proves
       it by construction.
     - COLLAPSIBLE BOX: worked elimination of one row; why the residual
       entry is ±1; the Pfaffian/parity argument; layering into brickwork.
     ===================================================================== -->

## 3 · The compiler: Givens elimination on Γ

Here is the algorithm, and it earns the name *compiler*: input a pure covariance matrix,
output a gate list. The strategy is pure numerical linear algebra — zero out entries one
rotation at a time — except that every rotation we apply is, by §2, a gate we know how to
undo on hardware.

Take the target $$\Gamma$$ and look at its first row: entries
$$\Gamma_{1,2}, \Gamma_{1,3}, \ldots, \Gamma_{1,2n}$$. The vacuum's first row is
$$(0, -1, 0, \ldots, 0)$$: everything dead except the partner entry. So kill the entries
that should be dead, from the far end inward. A rotation in the adjacent plane
$$(b-1,\,b)$$ replaces $$\Gamma_{1,b}$$ with
$$-\sin\theta\,\Gamma_{1,b-1} + \cos\theta\,\Gamma_{1,b}$$; choosing
$$\theta = \operatorname{atan2}(\Gamma_{1,b},\, \Gamma_{1,b-1})$$ zeroes it exactly, at
the cost of stirring column $$b-1$$ — which the next rotation inward will deal with. March
$$b$$ from $$2n$$ down to $$3$$ and the first row is spent: one entry left,
$$\Gamma_{1,2}$$, and *purity fixes its value*. A pure state's $$\Gamma$$ is an orthogonal
matrix, its rows unit vectors, so the lone survivor must be $$\pm 1$$. If it is $$-1$$,
mode 1 is now an empty mode, disentangled from everything — exactly like the vacuum. If it
is $$+1$$, the mode came out *occupied*; a single rotation by $$\pi$$ in the next plane
flips it to $$-1$$ (and parity guarantees this repair is always available — see the box).
Either way, two Majorana rows are done. Recurse on the remaining
$$(2n-2)\times(2n-2)$$ block. When nothing is left, you have rotated $$\Gamma$$ into
$$\Gamma_0$$:

<div class="key-eq" markdown="1">

$$
G_L \cdots G_2\, G_1\, \Gamma\, G_1^{\mathsf T} G_2^{\mathsf T} \cdots G_L^{\mathsf T}
= \Gamma_0
\qquad\Longleftrightarrow\qquad
\Gamma = \big(G_1^{-1} \cdots G_L^{-1}\big)\, \Gamma_0\, \big(\cdots\big)^{\mathsf T},
$$

</div>

and the right-hand form is the punchline: **the inverse rotations, applied to the vacuum
in reverse order, prepare the state.** The compiler's output is just its own work log,
read backwards with the angles negated — every entry a $$Z$$-rotation or an
$$XX$$-rotation on named qubits. Cost: $$2n-2$$ rotations for the first row,
$$2n-4$$ for the next, so $$n(n-1)$$ in all plus $$O(n)$$ parity fixes — saturating §2's
dimension count — and a brickwork schedule packs them into depth $$O(n)$$. This
elimination-and-reverse structure is exactly the exact-preparation algorithm of Langer et
al. {% cite langer2026matchgate --file refs_matchgates %}, whose Fig. 2a is worth having
open beside this section; its number-conserving ancestor is the Givens-network
construction of Kivlichan et al. {% cite kivlichan2018quantum --file refs_matchgates %},
and the widget in §5 runs it live.

One more thing the compiler quietly proves: **matchgate circuits conserve fermion
parity.** The Pfaffian of $$\Gamma$$ — the state's parity — is invariant under every
$$\mathrm{SO}$$ rotation, so a state reachable from the (even-parity) vacuum must be
even, and the elimination's stray $$+1$$ blocks must come in pairs. The repair step is not
a hack; it is parity conservation showing up as bookkeeping.

<div class="learn-more-box" markdown="0">
{% details Derivation: one elimination step, the ±1 residual, and the parity argument %}
**1 · One rotation, one zero.**
Conjugating $$\Gamma \to R\,\Gamma R^{\mathsf T}$$ by the plane rotation in
$$(b-1,\,b)$$ updates rows and columns $$b-1, b$$. For a row index
$$a \notin \{b-1,b\}$$,

$$
\Gamma'_{a,\,b-1} = \cos\theta\,\Gamma_{a,b-1} + \sin\theta\,\Gamma_{a,b},
\qquad
\Gamma'_{a,\,b} = -\sin\theta\,\Gamma_{a,b-1} + \cos\theta\,\Gamma_{a,b} ,
$$

so $$\theta = \operatorname{atan2}(\Gamma_{a,b},\,\Gamma_{a,b-1})$$ gives
$$\Gamma'_{a,b} = 0$$ while
$$\Gamma'_{a,b-1} = \sqrt{\Gamma_{a,b-1}^2 + \Gamma_{a,b}^2}$$ — the two entries'
weight consolidates one step inward, ready for the next rotation. Entries in rows the
rotation doesn't touch are unchanged; the elimination never un-zeroes what it has zeroed
in the active row.

**2 · Why the survivor is ±1.**
For a pure Gaussian state $$\Gamma^{\mathsf T}\Gamma = \mathbb 1$$ (equivalently
$$\Gamma^2 = -\mathbb 1$$): the covariance matrix is orthogonal. Orthogonality survives
conjugation by rotations. So when row $$1$$ has been reduced to a single nonzero entry
$$\Gamma_{1,2}$$, unit row norm forces $$\Gamma_{1,2} = \pm 1$$, and orthogonality of
column 2 then forces the *rest of column 2* to vanish as well: the $$(1,2)$$ block
decouples from the remainder automatically. Purity does the cleanup.

**3 · The parity fix and why it never strands you.**
$$\operatorname{Pf}(R\,\Gamma R^{\mathsf T}) = \det(R)\operatorname{Pf}(\Gamma)
= \operatorname{Pf}(\Gamma)$$ for $$R \in \mathrm{SO}(2n)$$, and flipping the sign of one
$$2\times 2$$ block flips the Pfaffian's sign. The vacuum's Pfaffian is fixed, so a
circuit-reachable $$\Gamma$$ eliminates to a block form whose number of $$+1$$ blocks is
*even* — each can be repaired. The repair itself: with the finished block at
$$(a, a+1)$$ and residual $$+1$$, rotate plane $$(a+1,\,a+2)$$ by $$\pi$$. That maps
$$\gamma_{a+1} \to -\gamma_{a+1}$$, $$\gamma_{a+2} \to -\gamma_{a+2}$$, hence
$$\Gamma_{a,a+1} \to -\Gamma_{a,a+1} = -1$$, and (since $$\Gamma_{a,a+2}$$ is already
zero) disturbs nothing already finished. In gate language the fix is
$$e^{i(\pi/2) X X}$$ — a perfectly ordinary matchgate.

**4 · Brickwork depth.**
Each rotation occupies two adjacent Majorana indices; rotations on disjoint index pairs
commute as *scheduling* objects (they act on different wires even when they don't commute
as operators with everything between them — the schedule respects the sequence). Greedy
layering of the reversed gate list — place each gate in the earliest layer where its two
indices are free — yields depth $$\leq 2n + O(1)$$ for the full $$n(n-1)$$-gate
elimination, the linear-depth result of
{% cite kivlichan2018quantum --file refs_matchgates %}.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — Entanglement is the price floor (~550 words + box)
     - Question: when can a state beat n(n−1)? Lower bounds come from
       entanglement across cuts.
     - Botero–Reznik modewise decomposition: any pure Gaussian state,
       bipartitioned, factorizes into independent mode PAIRS straddling
       the cut (angles set by ζ_k) + locally-owned modes. Each fractional
       ζ_k = one Bell-like pair; Schmidt rank = 2^{#pairs}.
     - The free-fermion post's "straddling orbitals" intuition is now a
       THEOREM about circuits: every straddling pair needs at least one
       gate crossing the cut; counting fractional ζ across all cuts gives
       Langer et al.'s lower bound on total gates. Entanglement = circuit
       complexity, literally.
     - Banded Γ (gapped ground states): O(1) straddling orbitals per cut
       ⇒ O(n) gates, O(1)-ish depth… honest: depth O(ξ). Critical states:
       log-many per cut ⇒ genuinely deeper circuits.
     - COLLAPSIBLE BOX: modewise decomposition statement; ζ ↔ pair angle;
       crossing-gate counting argument for the lower bound.
     ===================================================================== -->

## 4 · Entanglement is the price floor

The compiler of §3 spends $$n(n-1)$$ gates on *any* state. When is that wasteful? When can
a state be had for less — and what sets the floor under its price? The answer is the
free-fermion post's entanglement spectrum, returning with a new job title.

The structural fact underneath everything is the **modewise decomposition** of Botero and
Reznik {% cite botero2004bcs --file refs_matchgates %}. Bipartition the chain at any cut
into $$A$$ and $$B$$, and take the eigenvalues $$\zeta_k$$ of the restricted correlation
matrix $$C\vert_A$$ — the same $$\zeta_k$$ that
[the free-fermion post]({% post_url 2026-07-06-free-fermions-one-matrix %}) taught us to
sort into *pinned* ($$\zeta \approx 0$$ or $$1$$: modes owned outright by one side) and
*fractional* ($$\zeta$$ strictly between: orbitals straddling the cut). Botero and Reznik
proved that this sorting is not just a picture but a factorization: there exist Gaussian
changes of basis, *separately* inside $$A$$ and inside $$B$$, after which the state is
exactly a product — locally-owned modes in definite occupation, times one independent
**two-mode entangled pair** for each fractional $$\zeta_k$$, a BCS-like superposition
$$\sqrt{1-\zeta_k}\,\lvert 0_A 0_B\rangle + \sqrt{\zeta_k}\,\lvert 1_A 1_B\rangle$$
stretched across the cut. Every fractional eigenvalue is one Bell-like pair, no more and
no less; the Schmidt rank is exactly $$2^{\#\text{pairs}}$$. The straddling-orbital
intuition was, all along, the literal normal form of the state.

Now count gates. A circuit that prepares the state from the (product) vacuum must
*create* each of those pairs, and entanglement across a cut can only be created by gates
that **cross** the cut. One two-qubit gate crossing the cut can entangle at most one fresh
mode pair — its Majorana rotation touches a single pair of sites — so a state with
$$s$$ fractional eigenvalues at some cut needs at least $$s$$ crossing gates *at that
cut*. Run the argument at every cut of the line at once and the per-cut counts assemble
into a global lower bound on the total gate count — this is precisely the entanglement
bound of Langer et al. {% cite langer2026matchgate --file refs_matchgates %}, and their
preparation algorithms meet it. The price floor of a Gaussian state is its entanglement
spectrum, tallied cut by cut.

<div class="key-eq" markdown="1">

$$
\#\text{gates crossing a cut} \;\geq\; \#\{\,k : \zeta_k \text{ fractional at that cut}\,\}
$$

</div>

The physics follows immediately. Ground states of *gapped* local Hamiltonians obey an
area law: at any cut, only the $$O(1)$$ orbitals within a correlation length $$\xi$$ of
the boundary are fractional. Their $$\Gamma$$ is banded, their price floor is $$O(n)$$
total gates in depth $$O(\xi)$$ — *constant* depth in the system size. Critical states
are the expensive ones: the $$\tfrac{1}{3}\ln L$$ entanglement growth of the free-fermion
post means logarithmically many straddling orbitals at every cut, and no shallow circuit
can fake that. Cheap states and boring states are not the same thing — but cheap states
and *short-range-entangled* states are.

<p class="thread-note"><span class="thread-label">The through-line</span> The covariance matrix knows its own circuit. Count the fractional eigenvalues of C|<sub>A</sub> at each cut — the straddling orbitals of the free-fermion post — and you have counted the gates any preparation circuit must spend there. Entanglement and circuit complexity are one number, read two ways.</p>

<div class="learn-more-box" markdown="0">
{% details Derivation: the modewise normal form and the crossing-gate bound %}
**1 · Modewise decomposition.**
Take a pure Gaussian $$\lvert\psi\rangle$$ on $$A \cup B$$ and diagonalize
$$C\vert_A = \sum_k \zeta_k\, \lvert v_k\rangle\langle v_k\rvert$$ — the natural orbitals
of $$A$$. Botero–Reznik's observation: because the *global* state is Gaussian and pure,
each fractional orbital $$v_k$$ in $$A$$ has a unique partner orbital $$w_k$$ in $$B$$
(essentially: apply the global $$\Gamma$$ to $$v_k$$ and project into $$B$$), and the
Gaussian unitary that rotates $$A$$'s modes into $$\{v_k\}$$ and $$B$$'s into
$$\{w_k\}$$ — a *local* operation on each side — brings the state to

$$
\lvert\psi\rangle \;\cong\;
\bigotimes_{k\,\text{fractional}}
\Big( \sqrt{1-\zeta_k}\,\lvert 0_{v_k} 0_{w_k}\rangle
    + \sqrt{\zeta_k}\,\lvert 1_{v_k} 1_{w_k}\rangle \Big)
\;\otimes\; \big(\text{pinned modes, definite occupation}\big).
$$

Tracing out $$B$$ reproduces Peschel's product-of-binary-modes form of $$\rho_A$$ from
the free-fermion post — the decomposition is its purification. The Schmidt vector across
the cut is the product of the pair Schmidt vectors:
rank $$= 2^{\#\text{pairs}}$$, and
$$S_A = \sum_k h(\zeta_k)$$ falls out as the sum of pair entropies, as it must.

**2 · Crossing gates.**
Order the gates of any preparation circuit; track the Schmidt rank across a fixed cut.
Gates entirely inside $$A$$ or inside $$B$$ are local unitaries: Schmidt rank invariant.
A gate crossing the cut is a two-qubit matchgate: its Majorana action mixes
$$\leq 2$$ modes of $$A$$ with $$\leq 2$$ of $$B$$, and (being Gaussian) can raise the
number of fractional pairs by at most one. Starting rank: $$1$$ (product vacuum). Final
count of fractional pairs: $$s$$. Hence $$\geq s$$ crossing gates. Summing the bound over
a family of nested cuts — each gate crosses only the cuts inside its two-site span —
yields the global count; saturating it is the content of Langer et al.'s optimal
constructions {% cite langer2026matchgate --file refs_matchgates %}.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — Approximation, and the compiler as a microscope (~450
     words + WIDGET)
     - Truncation: skip rotations whose target entries are already tiny.
       Error is controllable (each skipped rotation perturbs Γ by ~ the
       skipped weight); Langer et al. treat approximate preparation
       properly.
     - Concrete numbers from the verification runs (n=16 dimerized chain):
       critical δ=0: ~230–255 gates, depth 31 no matter the tolerance;
       gapped δ=0.9 at 3% tolerance: 28 gates, depth 3.
     - WIDGET: createGivensElimination — dimerization δ, tolerance ε,
       animated elimination (heatmap sheds weight, circuit assembles),
       gates/depth/error readouts. Honest: error computed by actually
       reconstructing.
     - Renormalization outlook: hierarchy/MERA as the structured way to
       exploit scale-separated entanglement — Wong & Potter (2d Gaussian
       fermion MERA, exponential depth reduction) as variational
       counterpart to the exact compiler.
     ===================================================================== -->

## 5 · Approximation, and the compiler as a microscope

Exact preparation is a floor-matching exercise; the fun starts when you allow *error*.
The compiler's inner loop rotates weight inward along a row before killing it — but if an
entry is already $$10^{-8}$$, why spend a gate on it? Skip every rotation whose target
entry is below a tolerance $$\varepsilon$$ and the gate list shrinks; each skipped
rotation perturbs the prepared $$\Gamma$$ by roughly the weight it declined to move, so
the error is controlled and, better, *checkable* — run the shortened circuit on the
vacuum (classically, in milliseconds) and compare. Approximate preparation with certified
error is a first-class citizen of Langer et al.'s analysis
{% cite langer2026matchgate --file refs_matchgates %}; here it turns the compiler into a
*microscope* for the previous section's claim.

Point it at the ground state of a dimerized hopping chain,
$$t_j = 1 + \delta(-1)^j$$ on $$n = 16$$ sites at half filling. At $$\delta = 0$$ the
chain is critical; at large $$\delta$$ it is gapped with a correlation length under a
site. Compile both at a few-percent tolerance and the gate counts *are* §4's physics: the
critical state refuses to compress — about $$230$$ gates in depth $$31$$, essentially the
generic cost — while at $$\delta = 0.9$$ the same algorithm exits after **28 gates in
depth 3**, at $$2.6\%$$ reconstruction error. Nothing about the algorithm changed; the
entanglement did. The widget below runs this exact experiment live: watch the heatmap
shed its off-diagonal weight rotation by rotation while the circuit assembles alongside,
then drag $$\delta$$ and $$\varepsilon$$ and watch the price of the state move with its
entanglement.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="w2-mount"></div>
</div>

<script src="{{ '/assets/js/givens-elimination.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("w2-mount");
    if (!mount || typeof createGivensElimination !== "function") return;
    createGivensElimination(mount, { n: 16 });
  })();
</script>

One more turn of the crank, because it points at current research. Row-by-row elimination
is a *flat* strategy: it treats all scales at once. But short-range entanglement lives at
the lattice scale and critical entanglement is organized scale by scale — which suggests
compiling *hierarchically*: disentangle the finest scale with a shallow layer, coarsen,
repeat. That is entanglement renormalization run as a circuit compiler, and it is the
subject of my own work with Andrew Potter on MERA circuits for two-dimensional Gaussian
fermion states {% cite wong2025entanglement --file refs_matchgates %}, where the
hierarchy buys an exponential reduction in depth for states the flat compiler finds
expensive. The variational cousin of this post, in other words — same question, same
currency, structured ansatz.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 6 — Where this goes (~250 words, no math)
     - Ledger recap: expectation values (Post 1), state preparation
       (Post 2) — both closed-form operations on Γ.
     - The gap: everything so far is UNITARY. A lab is not. The one
       operation still missing: measurement — random outcomes, collapse.
     - Continuation contract: end on the open question Post 3 opens with.
       Does Gaussianity survive projective measurement?
     ===================================================================== -->

## 6 · Where this goes

Tally the ledger. Post 1: a matchgate circuit's entire action on a state is a rotation of
one $$2n \times 2n$$ matrix, and every expectation value can be read out of it. This
post: the rotation can be *inverted* — from the matrix alone, a compiler writes down an
optimal circuit that builds the state, and the length of that circuit is set by the
entanglement spectrum. The covariance matrix does not just carry the state; it carries
the state's construction manual, priced in gates.

But notice what every operation so far has in common: it is unitary. Rotations in,
rotations out — a closed, reversible, exponentially-large-Hilbert-space-avoiding world.
An actual laboratory is not closed. At some point you *look*: a detector clicks, one
outcome out of many happens, and the state you so carefully compiled collapses onto
something new. Measurement is not a rotation. It is random, irreversible, and it acts on
the wavefunction by brute projection — the kind of operation that has every right to
shatter a fragile structure like Gaussianity and scatter the state into the
$$2^n$$-dimensional wilderness where no single matrix can follow.

Does it? If I measure one qubit of a Gaussian state — one detector, one click — what is
the state of the other $$n-1$$ modes now, and is there any matrix that still holds it?

## References

{% bibliography --file refs_matchgates --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
