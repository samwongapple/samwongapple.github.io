---
layout: post
title: "Measuring Free Fermions: Gaussian In, Gaussian Out"
date: 2026-07-31 04:00:00-0700
description: Measurement collapses the wavefunction — and the covariance matrix absorbs even that, as a closed-form update. The payoff is modern - projected ensembles, deep thermalization, and the maximally random Gaussian states a matchgate circuit can reach.
tags: [matchgates, free-fermions, quantum-circuits, deep-thermalization]
categories: [matchgates]
related_posts: false
provides:
  [born-rule-gaussian, gaussian-measurement-update, matchgate-weak-simulation, projected-ensemble, deep-thermalization, gaussian-haar-ensemble]
requires:
  [
    gaussian-state,
    covariance-matrix,
    majorana-operators-qubit,
    jordan-wigner,
    wicks-theorem,
    matchgate-family,
    majorana-so2n-rotation,
    classical-simulability,
  ]
uses: [fermionic-linear-optics, brickwork-circuit, haar-measure]
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
     SERIES: "Matchgate Circuits" — Part 3 of 3 (a 4th may be added; its
     seed is this post's closing section).
     Prerequisites: Post 1 (dictionary, R-rotations, Γ simulation), Post 2
     (compilation, SO(2n)/U(n) manifold — its n=2 sphere is spent here),
     free-fermion post (ζ_k, Γ; §4 cite-forward).

     THROUGH-LINE completion: the covariance matrix is the whole state —
     gates rotate it (Post 1), circuits can be read off it (Post 2), and
     now EVEN MEASUREMENT is a closed-form update of Γ. The 2^n-dim
     Hilbert space is never touched — until the closing section, where the
     exponential returns (Post 4 seed: non-Gaussian gates, fermionic
     magic).

     TARGET PAPER (exit skill): Bejan, Béri & McGinley, "Matchgate
     circuits deeply thermalize", PRL 135, 020401 (2025).

     NOTATION: as Posts 1–2. Site k Majoranas γ_{2k−1}, γ_{2k};
     Γ_ab = (i/2)⟨[γ_a,γ_b]⟩; measuring Z_k ↔ pair a = 2k−1, b = 2k;
     ⟨Z_k⟩ = −Γ_ab; vacuum blocks −1.
     ALL FORMULAS (Born probability, Γ measurement update incl. signs,
     flat GHE distribution of ⟨iγ_1γ_2⟩ for a 2-mode subsystem, Haar
     contrast curve ¾(1−m²)) verified against exact statevector
     simulation, 2026-07-31.
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — The operation that should have broken it (~450 words,
     minimal math)
     - Ledger: Post 1 gave expectation values, Post 2 gave preparation —
       both unitary, both closed-form on Γ. A lab also LOOKS: projective
       measurement, random outcome, collapse.
     - Why collapse looks fatal for the one-matrix story: projection is
       not a rotation; it is nonlinear (renormalization by the outcome
       probability) and irreversible.
     - The claim, stated as this post's engine: measuring a qubit of a
       Gaussian state gives (i) outcome probabilities linear in Γ and
       (ii) a post-measurement state that is AGAIN Gaussian, with a
       closed-form Γ′. Gaussian in, Gaussian out.
     - Payoff preview: sampling (weak simulation) and the projected
       ensemble / deep thermalization literature (Bejan–Béri–McGinley).
     ===================================================================== -->

## 1 · The operation that should have broken it

Two posts of ledger so far, and every line is unitary.
[Post 1]({% post_url 2026-07-28-matchgates-free-fermions-wearing-qubit-clothing %}):
a matchgate circuit rotates the covariance matrix, $$\Gamma \mapsto R\Gamma
R^{\mathsf T}$$, and every expectation value follows from the matrix.
[Post 2]({% post_url 2026-07-31-building-gaussian-states-one-rotation-at-a-time %}):
the rotation can be run backwards — from $$\Gamma$$ alone a compiler writes the circuit
that builds the state, priced by its entanglement. Elegant, closed, reversible. And
incomplete, because a laboratory does one more thing to quantum states, and it is the
thing the formalism has no obvious right to survive: it _looks_.

A projective measurement is everything a rotation is not. Its outcome is random. It is
irreversible — no inverse gate un-clicks a detector. And on the wavefunction it acts by
brute _projection_: strike out every amplitude inconsistent with the outcome, then
rescale what survives by the outcome's probability. That rescaling makes the map
nonlinear in the state; the striking-out makes it violently non-unitary. If you wanted to
design an operation to shatter a delicate algebraic structure like Gaussianity — a
structure we have so far preserved only by moving along the gentle manifold of rotations
— collapse is what you would design. The state that so far lived happily inside one
$$2n \times 2n$$ matrix has every excuse to scatter into the $$2^n$$-dimensional
wilderness and never come back.

Here is the engine of this post: **it comes back.** Measure the occupation of one mode of
a Gaussian state — one qubit, in the computational basis — and two things are true. The
outcome probabilities are read _linearly_ off a single entry of $$\Gamma$$. And the
collapsed state of the remaining modes is _again Gaussian_, with a covariance matrix
$$\Gamma'$$ given in closed form by one rank-style update — no wavefunction ever
consulted. Gaussian in, Gaussian out. Measurement, the operation that should have broken
the one-matrix story, turns out to be one more thing the matrix absorbs.

The consequences run from the practical to the frontier. Practically (§3), the update
upgrades Post 1's simulation from expectation values to honest _samples_ — the classical
computer can now click detectors too. At the frontier (§4–5), it is the engine behind one
of the sharpest recent questions about quantum randomness: measure _most_ of a system and
ask how random the leftover states are. That question — the projected ensemble, and its
"deep thermalization" — has an exact and beautiful answer for matchgate circuits, worked
out by Bejan, Béri and McGinley
{% cite bejan2025matchgate --file refs_matchgates %}, and this post's job is to make
their paper readable. The widget in §5 runs their experiment in your browser.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — Collapse in closed form (~550 words + collapsible box)
     - Setup: measure Z_k ↔ Majorana pair (a,b) = (2k−1, 2k); outcome
       s = ±1 (s=+1 ↔ empty, since |0⟩ = vacuum).
     - Born: p_s = (1 − s Γ_ab)/2. Check vacuum.
     - KEY EQUATION (.key-eq): Γ′_cd = Γ_cd + (Γ_ca Γ_bd − Γ_cb Γ_ad)/
       (Γ_ab − s); measured block pins to Γ′_ab = −s and decouples.
     - Denominator = −2s·p_s: only impossible outcomes blow up —
       conditioning is safe exactly when the outcome can occur.
     - Interpretation: this is Gaussian CONDITIONING — the quantum twin of
       the Schur-complement update for conditioning a classical Gaussian
       distribution. Collapse = conditioning, for Gaussian states.
     - Cite Bravyi (FLO formalism, forward-referenced since Post 1).
     - Honesty note: signs verified against statevector simulation.
     - COLLAPSIBLE BOX: four-line Wick derivation via P_s = (1+sZ_k)/2,
       reduction of the 4-point function; equivalence of the two forms;
       pinning + decoupling check.
     ===================================================================== -->

## 2 · Collapse in closed form

Set it up in the language we own. Measuring qubit $$k$$ in the computational basis is
measuring $$Z_k$$, and $$Z_k = -i\gamma_a\gamma_b$$ with $$(a,b) = (2k-1,\,2k)$$ — the
site's own Majorana pair. Call the outcome $$s = \pm 1$$; with the series convention that
$$\lvert 0\rangle$$ is the empty mode, $$s = +1$$ means _empty_, $$s = -1$$ means
_occupied_. Since $$\langle Z_k\rangle = -\Gamma_{ab}$$ (Post 1's dictionary), Born's
rule is one matrix entry:

{: #result-born-rule-gaussian }

$$
p_s = \frac{1 - s\,\Gamma_{ab}}{2} .
$$

Sanity check on the vacuum: $$\Gamma_{ab} = -1$$ gives $$p_{+} = 1$$ — an empty mode is
certainly empty. So far, expectation values only; nothing Post 1 couldn't do. The new
content is what the click _does to the state_. Projecting onto the outcome and
renormalizing, the surviving $$n-1$$ modes are again Gaussian, and their covariance
matrix is:

<div class="key-eq" markdown="1" id="result-gaussian-measurement-update">

$$
\Gamma'_{cd}
= \Gamma_{cd}
+ \frac{\Gamma_{ca}\,\Gamma_{bd} - \Gamma_{cb}\,\Gamma_{ad}}{\Gamma_{ab} - s},
\qquad c, d \notin \{a, b\},
$$

</div>

while the measured pair itself pins to its outcome, $$\Gamma'_{ab} = -s$$, and decouples
from everything ($$\Gamma'_{ac} = \Gamma'_{bc} = 0$$). One matrix in, one matrix out; the
derivation is four lines of Wick's theorem and lives in the box. (I have also verified
it, signs and all, against brute-force statevector simulation — the sign of that
denominator is exactly the kind of thing one wants checked by a computer.)

Read the formula's anatomy, because each piece is physics. The _numerator_ is an
interference of correlations: mode $$c$$'s correlation with the measured pair, times the
pair's correlation with mode $$d$$. Distant modes that were both correlated with mode
$$k$$ become correlated _with each other_ by the measurement — entanglement swapping,
executed by a detector. The _denominator_ is $$\Gamma_{ab} - s = -2s\,p_s$$: the update
divides by the probability of what you saw. An outcome with $$p_s \to 0$$ makes the
formula blow up — as it should, since conditioning on the impossible is meaningless — and
_only_ then. And the nonlinearity that made collapse look so threatening in §1 is now
located precisely: it is all in that denominator, a scalar. The map is a rank-two
correction plus a rescaling — tame enough to iterate thousands of times per second.

If the structure looks familiar from a statistics course, it should. Conditioning a
classical multivariate Gaussian on one observed component updates the remaining
covariance by a Schur complement — correlation with the observed variable, divided by its
variance. The formula above is that update's quantum twin, with the outcome probability
standing in for the variance. **Collapse, for Gaussian states, is conditioning.** The
detector doesn't destroy the Gaussian structure for the same reason observing one
component of a Gaussian vector doesn't destroy Gaussianity: quadratic correlations are
all there ever was. This closed-form measurement calculus is the heart of Bravyi's
fermionic-linear-optics formalism
{% cite bravyi2005lagrangian --file refs_matchgates %}, promised way back in Post 1 and
finally cashed here.

<p class="thread-note"><span class="thread-label">The through-line</span> Gates rotate Γ. Circuits can be read off Γ. And now measurement — random, irreversible, nonlinear measurement — is a two-line update of Γ. The exponentially large Hilbert space still has not been touched.</p>

<div class="learn-more-box" markdown="0">
{% details Derivation: Born's rule and the update, by Wick's theorem %}
**1 · Setup.**
Write $$O = -i\gamma_a\gamma_b$$ (so $$O = Z_k$$, $$O^2 = 1$$) and the projector
$$P_s = \tfrac{1}{2}(1 + sO)$$. For a Gaussian state $$\rho$$ with covariance
$$\Gamma$$, recall $$\langle \gamma_x \gamma_y \rangle = -i\,\Gamma_{xy}$$ for
$$x \neq y$$. Born's rule is immediate:
$$p_s = \operatorname{tr}(\rho P_s) = \tfrac12\big(1 + s\langle O\rangle\big)
= \tfrac12\big(1 - s\,\Gamma_{ab}\big).$$

**2 · The conditional two-point function.**
For $$c, d \notin \{a,b\}$$, the operator $$\gamma_c\gamma_d$$ commutes with $$O$$ (two
transpositions, two sign flips), so $$P_s \gamma_c\gamma_d P_s = \gamma_c\gamma_d P_s$$
inside the trace and

$$
\langle \gamma_c \gamma_d \rangle'
= \frac{\operatorname{tr}\!\big(\rho\, \gamma_c\gamma_d P_s\big)}{p_s}
= \frac{\tfrac12 \langle \gamma_c\gamma_d\rangle
      + \tfrac{s}{2}\,\langle O\,\gamma_c\gamma_d\rangle}{p_s}.
$$

**3 · Wick once.**
The only nontrivial object is the four-point function inside
$$\langle O \gamma_c\gamma_d\rangle = -i\langle \gamma_a\gamma_b\gamma_c\gamma_d\rangle$$.
Wick's theorem for Majoranas gives the three pairings with alternating signs:

$$
\langle \gamma_a\gamma_b\gamma_c\gamma_d\rangle
= \langle \gamma_a\gamma_b\rangle\langle \gamma_c\gamma_d\rangle
- \langle \gamma_a\gamma_c\rangle\langle \gamma_b\gamma_d\rangle
+ \langle \gamma_a\gamma_d\rangle\langle \gamma_b\gamma_c\rangle
= -\big[\Gamma_{ab}\Gamma_{cd} - \Gamma_{ac}\Gamma_{bd} + \Gamma_{ad}\Gamma_{bc}\big].
$$

**4 · Assemble.**
Multiply through by $$i$$ to convert expectations back to $$\Gamma$$-entries:

$$
\Gamma'_{cd} = i\langle\gamma_c\gamma_d\rangle'
= \frac{p_s\,\Gamma_{cd} + \tfrac{s}{2}\big(\Gamma_{ac}\Gamma_{bd} - \Gamma_{ad}\Gamma_{bc}\big)}{p_s}
= \Gamma_{cd} + \frac{s\big(\Gamma_{ac}\Gamma_{bd} - \Gamma_{ad}\Gamma_{bc}\big)}{2p_s},
$$

which, using $$2p_s = s(s - \Gamma_{ab})\cdot s^{-1}\cdot\ldots$$ — more simply, using
$$\Gamma_{ab} - s = -2s\,p_s$$ and antisymmetry $$\Gamma_{ca} = -\Gamma_{ac}$$ — is
exactly the boxed form in the main text. For the measured pair: after the projection
$$\langle Z_k\rangle' = s$$ by construction, so $$\Gamma'_{ab} = -s$$; and any
cross-correlator $$\langle \gamma_a \gamma_c\rangle'$$ vanishes because $$\gamma_a$$
*anti*commutes with $$O$$, so
$$P_s \gamma_a = \gamma_a P_{-s}$$ and the two projectors annihilate:
$$P_s\gamma_a\gamma_c P_s = \gamma_a P_{-s} \gamma_c P_s$$, whose trace against
$$\rho$$ carries the factor $$P_{-s}P_s = 0$$ once $$\gamma_c$$ (which commutes with
$$O$$) is moved aside. The measured mode decouples entirely.
{% enddetails %}

</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — Samples, and the postselection superpower (~450 words)
     - Chain rule: measure qubit 1 (p from Γ), update, measure qubit 2,
       … → one exact sample of the full outcome distribution in O(n³).
       This upgrades Post 1's honest ledger (which promised only
       expectation values) to weak simulation: Terhal–DiVincenzo.
     - The imbalance this creates vs nature: an experiment gets ONE
       outcome per shot and cannot choose it. The classical simulator can
       CONDITION on any outcome directly — no rejection, no repetition.
       Postselection is exponentially costly in the lab, free in the
       formalism.
     - This asymmetry is exactly what makes the next section's object —
       an ensemble labeled by measurement outcomes — classically
       computable for matchgates while brutal to tomograph in a lab.
     ===================================================================== -->

## 3 · Samples, and the postselection superpower

{: #result-matchgate-weak-simulation }

First, collect the practical winnings. Post 1's cost accounting was careful to promise
only _expectation values_ — "samples need more machinery," it said, and this section is
the machinery. Measure qubit 1: an outcome $$s_1$$ drawn with probability
$$p_{s_1}$$ read off $$\Gamma$$. Update $$\Gamma \to \Gamma'$$ with §2's formula.
Measure qubit 2 _of the updated matrix_: the formula automatically delivers the
conditional probability $$p(s_2 \mid s_1)$$. Iterate down the chain, and after $$n$$
clicks you hold a bitstring $$(s_1, \ldots, s_n)$$ drawn from _exactly_ the joint Born
distribution — the chain rule of probability, executed matrix-side. Each step is a
rank-two update, the whole sample costs $$O(n^3)$$, and a laptop plays the part of the
quantum computer's readout line at thousands of shots per second. This is the classic
_weak simulation_ result for noninteracting-fermion circuits
{% cite terhal2002classical --file refs_matchgates %}, and with it, every column of
Post 1's honest ledger is filled: preparation (Post 2), evolution, expectation values,
and now full measurement statistics.

But notice the _asymmetry_ the update formula creates between the simulator and an
actual experiment — it is the quiet superpower of this whole formalism. Nature, per
shot, hands the lab **one** outcome, chosen by chance; the experimenter cannot ask for a
particular bitstring, only wait for it, and waiting for a specific $$n$$-bit outcome
takes $$\sim 2^n$$ shots. _Postselection is exponentially expensive in the lab._ The
simulator has no such problem. Want the state of the system _given_ that modes
$$3$$ through $$n$$ read $$0110\ldots$$? Feed exactly those outcomes into §2's update,
in order, and the conditional state — probability and collapsed $$\Gamma$$ both — pops
out in closed form, whether the outcome's probability is one half or
$$10^{-30}$$. Conditioning is free. No rejection sampling, no repetition, no luck.

Hold on to that imbalance. The modern physics of the next section is built around an
object that is _defined_ by postselection — an entire ensemble of states labeled by
measurement outcomes, one conditional state per bitstring. For a lab, characterizing
that object shot by shot is heroic, exponentially so. For a matchgate simulator, it is a
for-loop over §2. That is why free fermions are where this frontier question first
became exactly answerable {% cite bejan2025matchgate --file refs_matchgates %} — and why
your browser is about to compute it live.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — The projected ensemble, and how deep "random" goes
     (~650 words + collapsible box)
     - Define the projected ensemble: global pure state, small subsystem
       A, measure ALL of B in the computational basis: {p_b, |ψ_A(b)⟩}.
       Cite Cotler et al., Choi et al. (Nature experiment), Ho–Choi.
     - First moment = ρ_A: ordinary thermalization (deep circuit ⇒ ρ_A ∝ 1).
       Deep thermalization: the DISTRIBUTION over conditional states
       converges to the maximal-entropy ensemble. For chaotic qubit
       dynamics: Haar. (Ippoliti–Ho for subtleties/rates.)
     - Matchgates cannot Haar-thermalize: §2 forces every conditional
       state to be GAUSSIAN. The ensemble lives on the Gaussian manifold
       SO(2L_A)/U(L_A) (Post 2's manifold, now a sample space!). Maximal-
       entropy candidate: the GAUSSIAN HAAR ENSEMBLE — uniform (Haar-SO)
       measure on that manifold.
     - Bejan–Béri–McGinley: deep random matchgate circuits converge to the
       GHE (Wasserstein-1 distance; continuous manifold means moment-
       matching alone is not the right metric — light treatment).
     - L_A = 2 payoff: manifold = 2-sphere (Post 2 box!), and by
       Archimedes the GHE predicts m = ⟨iγ₁γ₂⟩ UNIFORM on [−1,1] — flat
       histogram. Haar on 2 qubits would give ¾(1−m²) — peaked. Flat vs
       parabola: Gaussian-random vs quantum-random, distinguishable by
       eye. (Both verified numerically.)
     - COLLAPSIBLE BOX: why conditional states are Gaussian; parity
       sectors; dim SO(4)/U(2) = 2 → sphere; Archimedes hat-box ⇒ flat m;
       Haar Beta(2,2) ⇒ parabola.
     ===================================================================== -->

## 4 · The projected ensemble, and how deep "random" goes

Now the frontier question. Take a big system, run a deep circuit on it, and keep only a
small window $$A$$ — a couple of qubits — while measuring _everything else_ ($$B$$, in
the computational basis). Each shot returns an outcome bitstring $$b$$ with probability
$$p_b$$, and leaves $$A$$ in a definite conditional pure state
$$\lvert \psi_A(b)\rangle$$. The collection

{: #model-projected-ensemble }

$$
\mathcal{E} = \big\{\, p_b,\; \lvert \psi_A(b) \rangle \,\big\}
$$

{: #result-deep-thermalization }

is called the **projected ensemble** — not one state but a cloud of states, one per
outcome, weighted by Born {% cite cotler2023emergent --file refs_matchgates %}. It is a
strictly finer object than anything in the thermalization story you already know.
Average the cloud and you get the reduced density matrix
$$\rho_A = \sum_b p_b \lvert\psi_A(b)\rangle\langle\psi_A(b)\rvert$$ — the _first
moment_ — and ordinary thermalization says a deep chaotic circuit drives
$$\rho_A$$ to featureless maximal mixedness. But the cloud has a shape beyond its mean:
second moments, third moments, the full distribution on state space. **Deep
thermalization** is the discovery that chaotic dynamics randomizes _all_ of it: the
projected ensemble converges to the maximal-entropy distribution on $$A$$'s state space
— for generic chaotic circuits, the _Haar_ (uniform) measure — moment by moment
{% cite cotler2023emergent ho2022exact --file refs_matchgates %}. This is not a thought
experiment: it has been observed shot-by-shot on a Rydberg quantum simulator
{% cite choi2023preparing --file refs_matchgates %}, and its rates and refinements are
an active subject {% cite ippoliti2023dynamical --file refs_matchgates %}. Randomness,
it turns out, comes in depths: a maximally mixed $$\rho_A$$ is the shallow end; a
Haar-random _ensemble_ of pure states is the deep end.

{: #result-gaussian-haar-ensemble }

So what does a _matchgate_ circuit do — dynamics that is structured, free, integrable in
the deepest sense, yet still scrambles? Here §2 pays off exactly. Measuring $$B$$
qubit by qubit is a sequence of Gaussian updates, so **every conditional state
$$\lvert\psi_A(b)\rangle$$ is Gaussian** — a cloud confined, outcome by outcome, to the
tiny Gaussian manifold $$\mathrm{SO}(2L_A)/\mathrm{U}(L_A)$$ inside $$A$$'s Hilbert
space (Post 2's coset manifold, moonlighting as a sample space). Haar randomness on the
full Hilbert space is _forbidden_ — free fermions cannot fake generic chaos. The sharp
question is whether they are as random as their manifold allows: does the projected
ensemble converge to the uniform — Haar-$$\mathrm{SO}$$ — measure on the Gaussian
manifold, the **Gaussian Haar ensemble**? Bejan, Béri and McGinley proved that it does:
deep random matchgate circuits deep-thermalize _within_ the Gaussian manifold, with
convergence quantified in Wasserstein-1 distance — the natural metric here, since on a
continuous manifold one asks how far mass must be transported, not just whether a few
moments match {% cite bejan2025matchgate --file refs_matchgates %}. Maximal randomness,
subject to the algebra: the ensemble forgets everything except that it is free.

For a window of $$L_A = 2$$ qubits, this abstraction becomes something you can plot.
Post 2's box computed $$\dim \mathrm{SO}(4)/\mathrm{U}(2) = 2$$: the even-parity pure
Gaussian states of two modes form a **2-sphere**, and the observable
$$m = \langle i\gamma_1\gamma_2 \rangle \in [-1,1]$$ is its polar coordinate. The GHE is
the uniform measure on the sphere — and by Archimedes' hat-box theorem, the projection
of the uniform sphere onto its axis is _flat_: the GHE predicts $$m$$ **uniform on
$$[-1,1]$$**. Full Haar on two qubits predicts something visibly different: a parabola
$$P(m) = \tfrac34(1 - m^2)$$, peaked at zero (box). Flat versus peaked — Gaussian-random
versus quantum-random — is a distinction you can see in a histogram. Which is exactly
what the widget below draws.

<div class="learn-more-box" markdown="0">
{% details Derivation: conditional Gaussianity, the sphere, and the two histogram curves %}
**1 · Conditional states are Gaussian.**
The pre-measurement state is Gaussian (Posts 1–2). Measuring qubit $$b_1$$ of region
$$B$$ maps $$\Gamma \to \Gamma'$$ by §2's update — a Gaussian state again. Induction
over the qubits of $$B$$: after the last click, the surviving state on $$A$$ is Gaussian
with covariance $$\Gamma_A(b)$$, the $$2L_A \times 2L_A$$ block that remains. The
ensemble is a distribution over the Gaussian manifold, never off it. (Parity: each
conditional state has definite fermion parity, even or odd according to the measured
bitstring; the manifold has one component per sector, and the ensemble populates both.)

**2 · Two modes = a sphere.**
A pure Gaussian $$\Gamma_A$$ is a $$4\times4$$ real antisymmetric orthogonal matrix:
six entries $$(m, u_1, u_2, u_3, u_4, w)$$ constrained by
$$\Gamma_A^2 = -\mathbb 1$$. Solving the constraints for the even-parity sector
($$\operatorname{Pf} = $$ that of the vacuum) leaves exactly two free parameters — e.g.
$$m = \Gamma*{12}$$ and one angle among the cross-correlations — and the resulting
manifold is $$S^2$$: concretely, $$(\Gamma*{12},\, \Gamma*{13},\, \Gamma*{14})$$ lies
on a unit sphere with the other entries determined by orthogonality
($$\Gamma_{34} = \Gamma_{12}$$-type relations up to signs). The observable
$$m = \langle i\gamma_1\gamma_2\rangle = \Gamma_{12}$$ is a coordinate axis.

**3 · Flat (GHE) versus parabola (Haar).**
_GHE:_ uniform measure on $$S^2$$. Archimedes: the area of a sphere between two
parallel planes depends only on their separation, so the marginal of any single
coordinate of a uniformly random point on $$S^2$$ is uniform on $$[-1,1]$$:
$$P_{\mathrm{GHE}}(m) = \tfrac12$$. _Haar:_ for a Haar-random pure state of two qubits,
the four squared amplitudes are Dirichlet-distributed, so the probability
$$p = p_{00}+p_{01}$$ of measuring qubit 1 empty is $$\mathrm{Beta}(2,2)$$:
$$P(p) = 6p(1-p)$$. With $$m = \langle Z_1 \rangle$$-type observables
$$= 2p - 1$$ (recall $$m = -\langle Z_1\rangle$$ merely reflects the axis),

$$
P_{\mathrm{Haar}}(m) = \tfrac{3}{4}\big(1 - m^2\big).
$$

I verified both numerically: the exact projected ensemble of a deep random matchgate
circuit on six qubits gives $$\operatorname{var}(m) = 0.345 \approx \tfrac13$$ with a
flat histogram (uniform predicts exactly $$\tfrac13$$), matching direct Haar-$$
\mathrm{SO}(4)$$ sampling and clearly excluding the Haar parabola's
$$\operatorname{var} = \tfrac15$$.
{% enddetails %}

</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — Watch it thermalize (~350 words + WIDGET)
     - Widget: 10 qubits, A = first two; random brickwork matchgate
       circuit, depth slider; chain-rule sampling of B outcomes; histogram
       of m = ⟨iγ₁γ₂⟩ accumulating live; flat GHE line + Haar parabola
       overlays; W₁ distance readout; new-circuit / run / reset.
     - Reading guide: shallow depth → spiky, deterministic-ish (A outside
       most of the light cone; m pinned near ±1); deepening → flattens
       toward GHE; never approaches the Haar parabola. The W₁ number
       falling = deep thermalization happening on screen.
     ===================================================================== -->

## 5 · Watch it thermalize

The experiment below is Bejan–Béri–McGinley's, miniaturized: ten qubits, a random
brickwork matchgate circuit of adjustable depth, and the window $$A$$ = the first two
qubits. Every "shot" measures the other eight qubits by §3's chain rule — real Born
statistics, real collapse, §2's update eight times — and drops the resulting conditional
$$m = \langle i\gamma_1\gamma_2\rangle$$ into a growing histogram. The two §4 curves are
overlaid: the flat line the Gaussian Haar ensemble predicts, and the parabola full Haar
would predict. A Wasserstein-1 readout tracks the distance between the accumulated
histogram and the GHE.

Two things to try. First, set the depth low: $$A$$ sits outside most of the circuit's
light cone, the conditional states barely move from their initial pole, and the
histogram piles up near $$m = \pm 1$$ — no thermalization, shallow or deep. Then crank
the depth and watch the histogram _flatten_, edge to edge, while the $$W_1$$ number
falls: the ensemble spreading uniformly over its sphere, in real time. What it never
does, at any depth, is bend toward the parabola — free fermions become exactly as random
as their manifold allows, and not one bit more.

One honesty note, worth a click of its own. By default each shot draws a _fresh_ random
circuit, because deep thermalization is a large-system statement: at ten qubits, a
single circuit's ensemble sits slightly off-centre — its mean is pinned to the
pre-measurement value of $$\Gamma_{12}$$, which fluctuates by
$$\sim 1/\sqrt{2n}$$ from circuit to circuit. Tick **freeze circuit** and you can see
that finite-size offset yourself: a flat-ish histogram, displaced from the flat line by
an amount that would shrink away as $$n$$ grows. The widget shows the deviation rather
than hiding it — at this scale, _that_ is what the theorem's large-$$n$$ limit looks
like from below.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="w3-mount"></div>
</div>

<script src="{{ '/assets/js/projected-ensemble.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("w3-mount");
    if (!mount || typeof createProjectedEnsemble !== "function") return;
    createProjectedEnsemble(mount, { n: 10, depth: 16 });
  })();
</script>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 6 — The exponential returns (~300 words, no math)
     - Through-line completion: the full ledger — evolution, readout,
       preparation, sampling, collapse, even ensembles of collapsed
       states — all closed-form on one 2n×2n matrix. 2^n never touched.
     - Post 4 SEED (per series plan, outlook paragraph only): dope the
       circuit with non-matchgates. One SWAP/T-like gate: Γ no longer
       closes; cost multiplies; k non-Gaussian gates ⇒ ~exp(k) —
       "fermionic magic" as a resource; boundary crossed gate by gate.
     - End on ONE open question (house continuation contract).
     ===================================================================== -->

## 6 · The exponential returns

Close the ledger the series opened. A matchgate circuit evolves a state: one rotation of
a $$2n \times 2n$$ matrix per gate. Every observable: read off the matrix. The circuit
that prepares a given state: compiled _from_ the matrix, at a gate count priced by its
entanglement. Samples, clicks, collapse: a two-line conditioning update of the matrix.
Even the exotic object of this post — an exponentially large _ensemble_ of
post-measurement states, the thing a laboratory would need heroic postselection to see —
is a for-loop over that update, its limiting shape a uniform measure on a sphere the
matrix's own symmetry group carved out. Three posts, one thesis, now fully cashed: **the
covariance matrix is the whole state**, and the $$2^n$$-dimensional Hilbert space it
stands in for was never touched. Not once.

So touch it. Take your favorite deep matchgate circuit and vandalize it with a single
gate from outside the family — one SWAP, as in Post 1's origin story, or one
$$T$$-flavored phase gate. Gaussianity breaks at that gate: the state becomes a
_superposition_ of Gaussian states, and the honest simulator must now carry a small
stack of covariance matrices with interfering amplitudes. Add a second bad gate and the
stack multiplies; $$k$$ of them and the cost grows roughly like $$e^{O(k)}$$. The
classical–quantum boundary, so stark in Post 1 — matchgates easy, matchgates-plus-SWAP
universal — is actually a _graded slope_, climbed gate by gate, and the modern name for
the altitude is **fermionic magic**: the resource that measures how far from free a
state has strayed. Everything this series built — the dictionary, the compiler, the
measurement calculus — becomes the launch camp for that climb, which is exactly where
the current literature is climbing now.

Which leaves the question the whole series has been backing into. Between one matrix and
$$2^n$$ amplitudes there is now a ladder — how many rungs of magic can a state hold
before the matrix description is truly, irreversibly dead?

## References

{% bibliography --file refs_matchgates --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
> {: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
