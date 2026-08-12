---
layout: post
title: "Matchgates: Free Fermions Wearing Qubit Clothing"
date: 2026-07-28 05:00:00-0700
description: A family of two-qubit gates that is classically simulable on a line — yet one SWAP gate away from universal quantum computation. The resolution is that matchgates are free fermions in disguise, and an entire circuit is nothing but a rotation of one covariance matrix.
tags: [matchgates, free-fermions, quantum-circuits, simulation]
categories: [matchgates]
related_posts: false
provides:
  [
    jordan-wigner,
    majorana-operators-qubit,
    jw-string-locality,
    matchgate-family,
    majorana-so2n-rotation,
    fermionic-linear-optics,
    classical-simulability,
    swap-universality,
  ]
requires: [pauli-algebra, second-quantization, majorana-operators-fermion, gaussian-state, covariance-matrix, wicks-theorem]
uses: [fock-space, entanglement-spectrum]
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

Start with a definition concrete enough to type into a simulator. A **matchgate** is a
two-qubit gate that is block-diagonal in the _parity_ basis: one $$2\times 2$$ unitary
$$A$$ acting on the even-parity states $$\{\lvert 00\rangle, \lvert 11\rangle\}$$,
another, $$B$$, on the odd-parity states $$\{\lvert 01\rangle, \lvert 10\rangle\}$$,

{: #model-matchgate-family }

$$
G(A, B) =
\begin{pmatrix}
A_{11} & 0 & 0 & A_{12} \\
0 & B_{11} & B_{12} & 0 \\
0 & B_{21} & B_{22} & 0 \\
A_{21} & 0 & 0 & A_{22}
\end{pmatrix},
\qquad
\det A = \det B .
$$

Parity conservation is easy to motivate. The determinant condition is not: it ties
together two blocks that live on disjoint subspaces and never talk to each other, for no
visible reason. Hold on to how _arbitrary_ it looks — decoding that one line is half of
this post.

The name comes from an odd corner of computer science. Valiant discovered these gates
while studying the counting of perfect matchings in graphs — a problem with a classic
polynomial algorithm via Pfaffians — and showed, essentially by making circuit amplitudes
into matchings, that circuits of such gates acting on _nearest neighbours on a line_ can
be simulated classically in polynomial time
{% cite valiant2002quantum --file refs_matchgates %}. No fermions anywhere in the
argument; the connection came only afterwards
{% cite knill2001fermionic terhal2002classical --file refs_matchgates %}. I won't
retell the matchings construction — for us the name is a historical fossil, and the
theorem is the thing.

Now the fact that gives this post its dramatic tension. Jozsa and Miyake sharpened
Valiant's result into a knife's edge {% cite jozsa2008matchgates --file refs_matchgates %}:
nearest-neighbour matchgate circuits on a line are efficiently classical — but allow the
same circuits one extra gate, **SWAP**, and they become capable of _universal quantum
computation_. Sit with that. SWAP does nothing but exchange the labels of two qubits. It
creates no entanglement from product states; classical intuition says it is the most
harmless gate imaginable. Yet: matchgates alone, classical; matchgates plus relabeling,
fully quantum. Whatever "classically simulable" means here, it is not a statement about
gates being individually tame — it is hanging by some thread that SWAP, of all things,
cuts.

The resolution, and the post's arc: matchgates are **free fermions wearing qubit
clothing**, and the thread is the _Jordan–Wigner string_ — a bookkeeping device that ties
the fermionic description to the ordering of the line. §2 builds the disguise, §3 shows
matchgates are quadratic — hence "free" — evolution, §4 turns that into a complete
simulation algorithm and lets SWAP cut the thread on screen. By the end, the strange
determinant condition and the SWAP paradox will be the same sentence, said two ways.

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

{: #model-jordan-wigner }

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
_every site to its left_. There are $$2n$$ of them, and a two-line computation (done fully
in the box below) shows they obey one strikingly rigid algebra:

$$
\gamma_a^\dagger = \gamma_a ,
\qquad
\{\gamma_a, \gamma_b\} \equiv \gamma_a \gamma_b + \gamma_b \gamma_a = 2\,\delta_{ab} .
$$

Hermitian, square to one, and — the crucial part — _anticommute_ in every distinct pair.
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
$$n_k = c_k^\dagger c_k = \tfrac{1}{2}(1 - Z_k)$$. So the computational basis _is_ a Fock
basis: qubit $$\lvert 0\rangle$$ is an empty fermionic mode, $$\lvert 1\rangle$$ an
occupied one, and $$\lvert 0\cdots 0\rangle$$ is the vacuum.

Why the string? It is tempting to read the $$Z_1\cdots Z_{k-1}$$ tail as an ugly technical
appendage, but the string is the entire point. Fermion operators on _different_ sites
anticommute — exchange statistics demands it — while qubit operators on different sites
commute; no strictly local identification could ever convert one algebra into the other.
The string repairs the statistics: when you slide the short operator
$$\gamma_{2k-1}$$ past the longer $$\gamma_{2l-1}$$ (say $$k < l$$), the $$X_k$$ of the
first must hop over the $$Z_k$$ in the second one's tail, and that costs exactly the minus
sign fermionic exchange requires. The Z-string is _exchange-statistics bookkeeping_, made
of qubit operators and stretched along the line.

{: #result-jw-string-locality }

Strings this long look expensive. The saving grace — and the single most important fact in
this post — is that for **nearest neighbours they cancel**. Multiply two adjacent
Majoranas and the two tails overlap on all but one site:

$$
X_k X_{k+1} = -\,i\,\gamma_{2k}\,\gamma_{2k+1} ,
$$

a _local_ product of just two Majoranas — a **bilinear** — with no string in sight. The
same happens for $$Y_k Y_{k+1}$$, $$Z_k$$, and their relatives (the box tabulates them
all). But pull the two qubits apart and the magic dies: a distant pair like
$$X_j X_k$$ with $$j < k-1$$ is _not_ a bilinear — the bilinear
$$-i\gamma_{2j}\gamma_{2k-1}$$ equals $$X_j Z_{j+1}\cdots Z_{k-1} X_k$$, string included,
and plain $$X_j X_k$$ needs a _quartic-or-worse_ pile of Majoranas to build. Quadratic
language is reserved for operators that respect the ordering of the line.

<p class="thread-note"><span class="thread-label">The thread</span> Fermionic statistics is nonlocal bookkeeping on qubits — every fermion operator drags a Z-string along the line. Nearest-neighbour operators are the ones whose strings cancel. Hold on to this: locality in the fermion ordering is the thread the whole post hangs by, and §4 is where it pays off.</p>

<div class="learn-more-box" markdown="0" id="derivation-majorana-operators-qubit">
{% details Derivation: the Majorana algebra, and the qubit–fermion dictionary table %}
**1 · The algebra.**
Each $$\gamma_a$$ is a product of Hermitian, mutually commuting-or-identical Pauli factors,
so $$\gamma_a^\dagger = \gamma_a$$ and $$\gamma_a^2 = 1$$ (every Pauli squares to one).
For distinct pairs, check the three cases:

_Same site._ $$\gamma_{2k-1}\gamma_{2k} = (Z_1\cdots Z_{k-1} X_k)(Z_1\cdots Z_{k-1} Y_k)
= X_k Y_k$$, since the identical tails square away and act on other sites. But
$$X_k Y_k = -Y_k X_k$$, so the pair anticommutes.

_Different sites, odd–odd._ Take $$k < l$$:
$$\gamma_{2k-1}\gamma_{2l-1} = (Z_1\cdots Z_{k-1}X_k)(Z_1\cdots Z_{l-1}X_l)$$. Every
factor of the first operator commutes with every factor of the second _except_ the single
collision at site $$k$$: the first has $$X_k$$, the second has $$Z_k$$ in its tail, and
$$X_k Z_k = -Z_k X_k$$. One collision, one minus sign: the pair anticommutes.

_Other cross-site pairs._ Identical argument — the shorter operator's $$X$$ or $$Y$$
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

| qubit operator  | Majorana bilinear                    |
| :-------------- | :----------------------------------- |
| $$Z_k$$         | $$-i\,\gamma_{2k-1}\,\gamma_{2k}$$   |
| $$X_k X_{k+1}$$ | $$-i\,\gamma_{2k}\,\gamma_{2k+1}$$   |
| $$Y_k Y_{k+1}$$ | $$+i\,\gamma_{2k-1}\,\gamma_{2k+2}$$ |
| $$X_k Y_{k+1}$$ | $$-i\,\gamma_{2k}\,\gamma_{2k+2}$$   |
| $$Y_k X_{k+1}$$ | $$+i\,\gamma_{2k-1}\,\gamma_{2k+1}$$ |

Sample derivation, first row: $$\gamma_{2k-1}\gamma_{2k} = X_k Y_k = i Z_k$$, so
$$Z_k = -i\gamma_{2k-1}\gamma_{2k}$$. Second row:

$$
\gamma_{2k}\gamma_{2k+1} = (Z_1\cdots Z_{k-1}Y_k)(Z_1\cdots Z_k X_{k+1})
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

Now aim the dictionary at the matchgates themselves. The first step is to know what a
matchgate's *generator* looks like. Up to single-qubit $$Z$$-rotations on either side and
an overall phase, any matchgate on qubits $$(k, k+1)$$ can be brought to the two-parameter
form


$$

G = \exp\!\big( i\alpha\, X*k X*{k+1} + i\beta\, Y*k Y*{k+1} \big)

$$

— a Kraus–Cirac-style normal form for two-qubit gates, specialized to the parity-preserving
family (I'll take this decomposition as given; Jozsa and Miyake spell it out
{% cite jozsa2008matchgates --file refs_matchgates %}). Now translate the exponent with
§2's table: $$X_kX_{k+1} = -i\gamma_{2k}\gamma_{2k+1}$$ and
$$Y_kY_{k+1} = i\gamma_{2k-1}\gamma_{2k+2}$$, so


$$

i\alpha X*k X*{k+1} + i\beta Y*k Y*{k+1}
= \alpha\,\gamma*{2k}\gamma*{2k+1} - \beta\,\gamma*{2k-1}\gamma*{2k+2} ,

$$

a **quadratic Majorana Hamiltonian** — two Majorana operators per term, nothing more. The
$$Z$$-rotation dressings are bilinears too ($$Z_k = -i\gamma_{2k-1}\gamma_{2k}$$). So every
matchgate is a slice of time evolution under a quadratic fermion Hamiltonian, and a
matchgate *circuit* is time evolution under a piecewise-constant, time-dependent quadratic
Hamiltonian. The converse holds as well: any quadratic evolution on a line can be
Trotterized into nearest-neighbour matchgates. Nearest-neighbour matchgate circuits and
free-fermion dynamics are the same set — the optics-flavoured name for it is **fermionic
linear optics** {% cite knill2001fermionic bravyi2005lagrangian --file refs_matchgates %}.
{: #result-fermionic-linear-optics }

Why does quadratic matter so much? Because of what it does in the Heisenberg picture.
Conjugating a single Majorana by a quadratic evolution can only produce a *linear
combination* of Majoranas — the commutator of a bilinear with a $$\gamma$$ is again a
single $$\gamma$$, so the flow never leaves the $$2n$$-dimensional space the
$$\gamma_a$$ span. Reality and the algebra force the coefficient matrix to be a rotation.
That is the central structural theorem of the subject:

<div class="key-eq" markdown="1" id="result-majorana-so2n-rotation">


$$

U^\dagger\, \gamma*a\, U \;=\; \sum*{b=1}^{2n} R\_{ab}\, \gamma_b ,
\qquad R \in \mathrm{SO}(2n),

$$

</div>

for every matchgate circuit $$U$$. One gate contributes an $$\mathrm{SO}(4)$$ rotation
acting on its four Majoranas — computed explicitly in the box, and it is nothing but two
independent $$2\times 2$$ rotations by $$2\alpha$$ and $$2\beta$$ in the right pairing of
planes — and a circuit contributes the product of its gates' rotations, in order. The
matchgate family is *exactly* the set of unitaries whose Majorana action closes on linear
combinations: $$4^n$$-dimensional operator dynamics collapsed onto a
$$2n$$-dimensional rotation.

This is also where §1's strange constraint stops being strange. A parity-preserving
two-qubit gate has one generator direction the normal form above leaves out:
$$Z_k Z_{k+1}$$, which sets the *relative phase* between the even and odd parity blocks —
precisely the freedom that $$\det A = \det B$$ removes. Translate it:
$$Z_k Z_{k+1} = (-i\gamma_{2k-1}\gamma_{2k})(-i\gamma_{2k+1}\gamma_{2k+2})
= -\,\gamma_{2k-1}\gamma_{2k}\gamma_{2k+1}\gamma_{2k+2}$$ — **quartic**, four Majoranas,
the one term that would break the Heisenberg closure. The determinant condition is not
numerology; it is the statement *"no quartic part in the generator,"* written in the only
variables Valiant had.

<p class="thread-note"><span class="thread-label">The thread</span> A matchgate never scrambles Majoranas into products — it rotates them into each other, one SO(4) block at a time. Everything a circuit does to the state is a rotation R ∈ SO(2n). Hold that: §4 turns this single fact into a complete classical simulation.</p>

<div class="learn-more-box" markdown="0">
{% details Derivation: the SO(4) rotation of a single matchgate, explicitly %}
Work on qubits $$(k,k+1)$$ and relabel their four Majoranas locally:
$$\mu_1 = \gamma_{2k-1},\ \mu_2 = \gamma_{2k},\ \mu_3 = \gamma_{2k+1},\
\mu_4 = \gamma_{2k+2}$$. The generator is
$$S = \alpha\,\mu_2\mu_3 - \beta\,\mu_1\mu_4$$, and the two bilinears commute with each
other (they share no Majorana), so the two rotations they generate can be treated
independently.

Take the $$\mu_2\mu_3$$ term. Using $$\{\mu_a,\mu_b\} = 2\delta_{ab}$$,


$$

[\mu_2\mu_3,\ \mu_2] = -2\mu_3, \qquad [\mu_2\mu_3,\ \mu_3] = +2\mu_2 ,

$$

so with $$\mu(t) = e^{-tS}\mu\, e^{tS}$$ the flow closes on the pair:
$$\dot\mu_2 = 2\alpha\,\mu_3$$, $$\dot\mu_3 = -2\alpha\,\mu_2$$, giving at $$t = 1$$


$$

\mu_2 \mapsto \cos(2\alpha)\,\mu_2 + \sin(2\alpha)\,\mu_3, \qquad
\mu_3 \mapsto \cos(2\alpha)\,\mu_3 - \sin(2\alpha)\,\mu_2 .

$$

The $$-\beta\,\mu_1\mu_4$$ term does the same to the other pair with angle $$-2\beta$$:
$$\mu_1 \mapsto \cos(2\beta)\,\mu_1 - \sin(2\beta)\,\mu_4$$,
$$\mu_4 \mapsto \cos(2\beta)\,\mu_4 + \sin(2\beta)\,\mu_1$$. In the reordered basis
$$(\mu_2, \mu_3\,|\,\mu_1, \mu_4)$$ the gate's $$R$$ is the direct sum of two plane
rotations,


$$

R \;=\;
\begin{pmatrix} \cos 2\alpha & \sin 2\alpha \\ -\sin 2\alpha & \cos 2\alpha \end{pmatrix}
\oplus
\begin{pmatrix} \cos 2\beta & -\sin 2\beta \\ \sin 2\beta & \cos 2\beta \end{pmatrix}
\;\in\; \mathrm{SO}(4),

$$

exactly the $$R'$$ block structure that appears in App. D of Langer et al.
{% cite langer2026matchgate --file refs_matchgates %}. Note the pairing: the
$$XX$$ angle rotates the *inner* pair $$(\mu_2,\mu_3)$$ — the plane shared between the
two sites — while the $$YY$$ angle rotates the *outer* pair $$(\mu_1,\mu_4)$$. The
$$Z$$-rotation dressings rotate the on-site planes $$(\mu_1,\mu_2)$$ and
$$(\mu_3,\mu_4)$$ by twice their angles. (I have checked these rotations, signs and all,
against exact statevector simulation.) Determinant $$+1$$, orthogonal, and — composing
gate after gate — the circuit's full $$R \in \mathrm{SO}(2n)$$ of the main text.
{% enddetails %}
</div>

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

Time to cash in [the free-fermion
post]({% post_url 2026-07-06-free-fermions-one-matrix %}). Its §4 introduces the object
this whole series orbits: for a Gaussian fermion state, the **covariance matrix**


$$

\Gamma\_{ab} = \tfrac{i}{2}\,\big\langle [\gamma_a, \gamma_b] \big\rangle

$$

— real, antisymmetric, $$2n \times 2n$$ — *is* the state: every observable follows from
it by Wick's theorem. I will not re-derive any of that here; it is the prerequisite, not
the point. The point is what §§2–3 add to it. Computational basis states are Gaussian —
they are Fock states of the Jordan–Wigner fermions, and the vacuum's covariance matrix is
just $$n$$ copies of a $$2\times 2$$ block,
$$\Gamma_0 = \bigoplus_k \big(\begin{smallmatrix} 0 & -1 \\ 1 & 0 \end{smallmatrix}\big)$$
(each site's own Majorana pair, occupation empty). And matchgates *preserve* Gaussianity:
by §3's theorem a matchgate rotates Majoranas linearly, so Wick factorization survives
every gate. Put together, the entire simulation of an $$n$$-qubit, $$L$$-gate matchgate
circuit is three lines:


$$

\textbf{init:}\quad \Gamma \leftarrow \Gamma*0
= \textstyle\bigoplus*{k=1}^{n} \big(\begin{smallmatrix} 0 & -1 \\ 1 & 0 \end{smallmatrix}\big),

$$


$$

\textbf{per gate:}\quad \Gamma \leftarrow R\,\Gamma R^{\mathsf T}
\quad (R \text{ acts on the gate's } 4\times 4 \text{ block}),

$$


$$

\textbf{read out:}\quad \langle Z*k \rangle = -\,\Gamma*{2k-1,\,2k},
\qquad \text{general observables by Wick / Pfaffians of } \Gamma .

$$

{: #result-classical-simulability }

That is the whole algorithm {% cite terhal2002classical --file refs_matchgates %}. The
cost accounting deserves to be stated honestly, because the honest version is what makes
it remarkable. The quantum state has $$2^n$$ amplitudes; we carry
$$n(2n-1)$$ real numbers. Each gate touches a $$4 \times 4$$ block, but updating it drags
the block's four *rows and columns* through the full matrix — $$O(n)$$ arithmetic per
gate, and $$O(n^3)$$-ish for a generic readout via diagonalization or Pfaffians. What you
get for that price: any quadratic observable, any Wick-computable correlator, the full
entanglement spectrum of any region (free-fermion post, §2). What you do *not* get for
free: measurement *samples* — those need one more piece of machinery, which is exactly
[Post 3]({% post_url 2026-07-31-measuring-free-fermions-gaussian-in-gaussian-out %})'s
opening move — and global phases or non-Gaussian observables, which cost genuinely more.
A pedagogical companion for all of this machinery is the Surace–Tagliacozzo lecture notes
{% cite surace2022fermionic --file refs_matchgates %}.

<p class="thread-note"><span class="thread-label">The through-line</span> The covariance matrix is the whole state. Initialize 2×2 blocks, rotate a 4×4 block per gate, read everything off the matrix — the 2<sup>n</sup>-dimensional Hilbert space is never touched. This is the claim the whole series escalates: circuits from Γ in Post 2, measurement on Γ in Post 3.</p>

{: #result-swap-universality }

And now §1's tension resolves in one paragraph. Write SWAP in the parity basis: it fixes
$$\lvert 00\rangle$$ and $$\lvert 11\rangle$$ and exchanges $$\lvert 01\rangle
\leftrightarrow \lvert 10\rangle$$ — block form $$G(\mathbb 1, X)$$, with
$$\det A = \det \mathbb 1 = +1$$ and $$\det B = \det X = -1$$. **SWAP fails the
constraint.** By §3's decoding, its generator carries the quartic
$$\gamma\gamma\gamma\gamma$$ term: conjugating a Majorana by SWAP does not return a
linear combination of Majoranas, the rotation picture dies, and $$\Gamma$$ stops being
the whole state. The innocuous-looking relabeling smuggles in exactly the term the
det-condition exists to forbid — because *relabeling qubits is not relabeling fermions*.
Site order enters the Jordan–Wigner strings; exchanging two qubits without paying the
string bookkeeping is a genuinely non-Gaussian operation. The same verdict falls on a
matchgate applied to *non-adjacent* qubits: the strings between no longer cancel (§2),
the generator picks up string-dressed — non-quadratic — terms, and simulability breaks.
Locality in the fermion ordering is the entire resource. "Classically simulable" was
never hanging by a thread of gate-set size or circuit depth; the thread is the
Jordan–Wigner string, and SWAP is simply the cheapest pair of scissors.

You can watch all of this happen. The sandbox below runs a random brickwork of
matchgates on fourteen qubits, live: the left panel is $$\lvert\Gamma\rvert$$, where
correlations spread outward from the diagonal as a **light cone**, one brickwork layer
per step; the right panel is the entanglement profile $$S(x)$$ across every cut,
computed from the Williamson eigenvalues of the reduced $$\Gamma$$ by the free-fermion
post's formula, growing as the circuit deepens. Then press the SWAP button. The
simulation does not fudge past it — it stops, because past that gate a covariance matrix
honestly cannot follow.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="w1-mount"></div>
</div>

<script src="{{ '/assets/js/matchgate-sandbox.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("w1-mount");
    if (!mount || typeof createMatchgateSandbox !== "function") return;
    createMatchgateSandbox(mount, { n: 14 });
  })();
</script>

Since the whole state is $$\Gamma$$, two questions become irresistible, and they are the
rest of this series. If the state is a matrix, can I read a *circuit* off a given
$$\Gamma$$ — compile the state, optimally?
([Post 2]({% post_url 2026-07-31-building-gaussian-states-one-rotation-at-a-time %}).)
And what does *measurement* — collapse itself — do to $$\Gamma$$?
([Post 3]({% post_url 2026-07-31-measuring-free-fermions-gaussian-in-gaussian-out %}).)

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

The dictionary is built, the theorem proved, the simulator running. What it opens is a
short research program, and the next two posts walk it.

[Post 2, *Building Gaussian States, One Rotation at a
Time*]({% post_url 2026-07-31-building-gaussian-states-one-rotation-at-a-time %}),
inverts this post's arrow: instead of a circuit acting on $$\Gamma$$, start from a target
$$\Gamma$$ and *compile* the circuit that prepares it — Givens rotations as gates,
elimination as compilation, and a lower bound on the gate count set by the entanglement
spectrum, following Langer et al.
{% cite langer2026matchgate --file refs_matchgates %}. It ends at the hierarchical,
renormalization-group version of the same question, which is where my own work with
Andrew Potter on Gaussian MERA circuits lives
{% cite wong2025entanglement --file refs_matchgates %}.

[Post 3, *Measuring Free Fermions: Gaussian In, Gaussian
Out*]({% post_url 2026-07-31-measuring-free-fermions-gaussian-in-gaussian-out %}), adds
the one operation this post left out — measurement — as a closed-form update of
$$\Gamma$$, and spends it on the modern question of how *random* the leftover states of a
measured free-fermion system can be, following Bejan, Béri and McGinley
{% cite bejan2025matchgate --file refs_matchgates %}.

And one teaser beyond both: sprinkle a few *non*-matchgates into a circuit and the
simulation cost grows exponentially in their number — the classical–quantum boundary of
this post is not a wall but a slope, crossable gate by gate. Whether that becomes a
fourth post depends on where the series' appetite lands.

The scoreboard so far, though, belongs to the through-line. One
$$2n \times 2n$$ matrix. It has absorbed every gate we have thrown at it — and so far,
nothing we can throw has forced us to touch the $$2^n$$ amplitudes it stands in for.

## References

{% bibliography --file refs_matchgates --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
$$
