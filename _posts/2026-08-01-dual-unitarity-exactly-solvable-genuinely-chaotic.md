---
layout: post
title: "Dual Unitarity: Exactly Solvable, Genuinely Chaotic"
date: 2026-08-01 09:00:00-0700
description: Demand that a brickwork gate stay unitary when read sideways — one algebraic condition — and every infinite-temperature two-point function of the circuit becomes exactly computable, at any time, in a model that is chaotic by every spectral test. The correlations collapse onto the light rays, where a single-site quantum channel generates them forever. This post derives the collapse diagram by diagram and lets you break it with a slider.
tags: [dual-unitary, quantum-circuits, tensor-networks, many-body-dynamics]
categories: [solvable-circuits]
related_posts: false
provides: [dual-unitary-circuits, gate-reshuffling, du-correlation-collapse, lightray-channel, du-ergodicity-classification]
requires: [brickwork-circuit, tensor-network-diagrams, operator-vectorization, lightcone-causality, pauli-algebra]
uses: [folded-circuit, space-time-rotation, kicked-ising-floquet, temporal-entanglement]
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
    --thread-color: #b3760a;
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
    --ledger-color: #a34732;
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
     SERIES: "Solvable Circuits" — Part 2 of 7. Published together with
     Part 1 (brickwork/TN calculus); this is the payoff post. Internal map
     and pinned conventions live in Part 1's top scaffold comment.

     CONVENTIONS USED HERE (inherited from P1, plus):
       Ũ            reshuffled gate — NOT the partial transpose (§1 says so)
       M±           one-site light-ray channels. OUR convention (pinned by
                    numerics with ASYMMETRIC kicks, see p2_ref.py):
                    right-moving ray (even source site) ← M+ with
                    M+(a) = (1/q) Tr_2[U† (1⊗a) U], applied once per LAYER
                    (2t applications at time t). Left ray (odd source) ←
                    M− = (1/q) Tr_1[U†(a⊗1)U]. Papers order layers
                    differently and swap these labels freely — flagged in
                    the text. With site-symmetric gates M+ = M−.
       q=2 family   U(J,b) = (e^{ibX}⊗e^{ibX})·V[J],
                    V[J] = exp[i(π/4·XX + π/4·YY + J·ZZ)]. DU for ALL J, b;
                    ε detunes the XX angle to π/4−ε and breaks DU.
                    NOTE the roadmap's "J_z=π/4 with J_x,J_y free" was
                    WRONG — verified: q=2 DU ⟺ TWO Cartan angles pinned at
                    π/4 (one free), locals arbitrary. SWAP and iSWAP are
                    both DU; bare V[J] has a Z soliton (rayZ ≡ 1), kicks
                    restore mixing.
     Numbers quoted below are all reproduced by scratchpad du_reference.py
     + p2_ref.py and mirrored in the widget's node harness (p2_refs.json).
     Brute-force window: L=10, validated t ≤ 2 (support wraps at t=3).
     Widget: assets/js/correlation-collapse.js.
     ===================================================================== -->

[Part 1]({% post_url 2026-08-01-brickwork-circuits-locality-and-unitarity-nothing-else %})
ended with the brickwork circuit's two rules proving strict causality and then hitting a
wall: inside the light cone, the folded network is exponentially expensive, and for a
fixed chaotic gate nothing could compute a correlation function there. It also noticed
the loophole. The diagram is symmetric under a quarter turn; the algebra is not. Unitary
means unitary *in time*.

This post closes the loophole. Impose the missing symmetry — demand that the same brick
be unitary read sideways — and the infinite-temperature two-point functions of the
circuit stop being merely bounded by the light cone and *collapse onto it*: exactly zero
everywhere in the interior, and on the two rays themselves generated forever by a single
$$q^2 \times q^2$$ matrix you can diagonalize by hand. No ensemble average, no
integrability, no small parameter — and the models this works for pass every spectral
test of quantum chaos we can throw at them. That combination — exactly solvable *and*
genuinely chaotic — is why dual-unitary circuits went from a curiosity to the reference
model of many-body dynamics in half a decade
{% cite bertini2025exactly --file refs_dual_unitary %}, and why this series exists.

## 1 · The condition: unitary, twice

Take the brick $$U$$, matrix elements $$\langle ab \rvert U \lvert cd \rangle$$ — legs
$$c, d$$ in from below, $$a, b$$ out above. Reading the same tensor left-to-right means
regrouping the legs: the left pair $$(c, a)$$ becomes the input, the right pair
$$(d, b)$$ the output. Call the regrouped matrix the **reshuffled gate**,

$$
\tilde U_{(db),(ca)} \;=\; U_{(ab),(cd)}.
$$

One warning before anything else: $$\tilde U$$ is a *reshuffling* — a transposition of
tensor legs across the diagram — and **not** the partial transpose, with which it is
routinely confused. The partial transpose swaps a bra with a ket on one site;
reshuffling swaps a *space* pairing for a *time* pairing.

For a generic unitary $$U$$, the reshuffled $$\tilde U$$ is just some linear map — it
contracts some vectors, stretches others. The definition of this whole field is one
line {% cite bertini2019exact --file refs_dual_unitary %}:

$$
U \text{ is \textbf{dual-unitary}} \quad\Longleftrightarrow\quad
U^\dagger U = \mathbb 1 \;\;\text{and}\;\; \tilde U^\dagger \tilde U = \mathbb 1 .
$$

Diagrammatically: the brick annihilates with its dagger when contracted *vertically* —
Part 1's Rule 1 — and *also* when contracted *horizontally*. The folded version reads
the same way: the folded brick $$\mathcal U = U \otimes U^*$$ maps cups on its bottom
legs to cups on its top legs (unitarity), *and* cups on its left legs to cups on its
right legs (dual unitarity). One extra cancellation direction. That is the entire
input; everything below is output.

A quarter-turn symmetry of the dynamics itself would be too much to ask — it would make
space and time literally interchangeable. Dual unitarity asks for less: not that the
sideways *model* equal the upright one, only that the sideways reading be *some* legal
unitary evolution. The sideways model is generally a different circuit — but a unitary
one, and that is all the diagrams need.

## 2 · Which gates qualify

The condition looks so tight you might suspect the solution set is empty, or trivial.
It is neither — and for qubits it is completely understood
{% cite bertini2019exact --file refs_dual_unitary %}. Write any two-qubit gate in its
Cartan form, locals times $$V[J_x, J_y, J_z] = \exp[i(J_x XX + J_y YY + J_z ZZ)]$$
times locals. Then (checked numerically to $$10^{-10}$$ over a scan of the Cartan cell,
alongside every other number in this post):

$$
U \text{ dual-unitary at } q=2
\quad\Longleftrightarrow\quad
U = (u_+ \otimes u_-)\, V[\tfrac{\pi}{4}, \tfrac{\pi}{4}, J]\, (v_+ \otimes v_-),
$$

with $$u_\pm, v_\pm$$ arbitrary one-qubit unitaries and one free interaction angle
$$J$$: **two** of the three Cartan angles pinned to $$\pi/4$$, maximal in two of the
three directions. The family contains familiar faces — $$J = \pi/4$$ is SWAP up to
phase, $$J = 0$$ is iSWAP-like — and, less obviously, the self-dual kicked Ising chain,
of which more in §5. What it does not contain is anything close to the identity:
dual-unitary gates are unavoidably strongly entangling, which is the first hint that
this is a solvable theory *of chaos* rather than a solvable theory of almost-free
particles. (How much of this survives at $$q > 2$$, where no complete classification
exists, is Part 3's story.)

The demos below use the one-parameter-plus-kick family

$$
U(J, b) \;=\; \big(e^{\,i b X} \otimes e^{\,i b X}\big)\,
V[\tfrac{\pi}{4}, \tfrac{\pi}{4}, J],
$$

dual-unitary for *every* $$(J, b)$$ — the kicks are locals — with a third knob
$$\varepsilon$$ that detunes the first Cartan angle to $$\pi/4 - \varepsilon$$ and
thereby breaks dual unitarity by a controlled amount.

## 3 · The theorem: correlations collapse onto the light rays

Here is the claim, and it is exact
{% cite bertini2019exact --file refs_dual_unitary %}. For traceless
Hilbert–Schmidt-normalised one-site operators $$\sigma_\alpha, \sigma_\beta$$, the
infinite-temperature correlator of Part 1 satisfies, for a dual-unitary brick and any
$$t > 0$$,

$$
C^{\alpha\beta}(x, t) \;=\;
\begin{cases}
\dfrac{1}{q}\,\mathrm{tr}\!\left[\sigma_\alpha\, \mathcal M_\pm^{\,2t}(\sigma_\beta)\right]
& x = \pm 2t \quad\text{(the light rays)}\\[1.2em]
0 & \text{everywhere else — including the entire interior.}
\end{cases}
$$

Part 1 proved the *outside* of the cone vanishes for any unitary brick. The new
statement is the *inside*: every point strictly between the rays gives exactly zero,
and the rays carry a closed-form answer. (In our conventions a one-site operator emits
one ray, not two — a source on an even site radiates rightward, on an odd site
leftward. It is a sublattice bookkeeping fact, visible in the widget, and it disappears
if you group sites in two-site cells.)

The proof is the picture, and after Part 1 it takes three moves. Start from the folded
network for $$C^{\alpha\beta}(x,t)$$, already reduced by ordinary unitarity to the
causal diamond between $$(0,0)$$ and $$(x,t)$$.

**Move 1 — attack the diamond sideways.** The diamond's left edge is a staircase of
folded bricks whose *left* legs terminate in cups and caps (the infinite-temperature
state below, the trace above). Dual unitarity says a folded brick eats cups from the
left and excretes cups to the right: the entire left staircase peels off, column by
column. The same happens from the right edge. The interior of the diamond — the part
that made §5 of Part 1 hopeless — evaporates.

**Move 2 — see what survives.** If $$(x, t)$$ is strictly inside the cone, the peeling
from both sides meets in the middle and consumes everything; the network collapses to
$$\tfrac1q\mathrm{tr}[\sigma_\alpha] \cdot \tfrac1q \mathrm{tr}[\sigma_\beta] = 0$$.
Zero, identically, at every interior point — for a strongly chaotic model whose
brute-force correlator at these points is a sum of $$\sim q^{4t}$$ amplitudes that a
generic gate leaves as incomputable noise.

**Move 3 — walk the ray.** If $$(x,t)$$ sits exactly on the ray, the two peelings
consume everything *except* a single staircase of $$2t$$ folded bricks connecting the
two operators — one brick per layer. Each brick, with its off-ray legs closed by cups
and caps, acts on the operator riding the ray as the one-site map

$$
\mathcal M_+(a) \;=\; \tfrac{1}{q}\,\mathrm{Tr}_2\!\left[\,U^\dagger (\mathbb 1 \otimes a)\, U\,\right],
\qquad
\mathcal M_-(a) \;=\; \tfrac{1}{q}\,\mathrm{Tr}_1\!\left[\,U^\dagger (a \otimes \mathbb 1)\, U\,\right],
$$

for the right- and left-moving ray respectively (which trace goes with which ray is
fixed by our even-layer-first convention; the literature permutes the labels). Chain
the $$2t$$ bricks and close with $$\sigma_\alpha$$: that is the formula. We verified it
brick by brick against dense brute force on ten sites: agreement to $$10^{-14}$$ at
every checkable time, for symmetric *and* asymmetric gates — the asymmetric check is
what pins which channel feeds which ray.

<div class="learn-more-box" markdown="0">
{% details The three moves with all the indices %}
<p><strong>Setup.</strong> Everything happens in the folded picture of Part 1: gates are
𝒰 = U ⊗ U*, the infinite-temperature bottom boundary is a row of cups |1/√q⟩⟩, the trace
top boundary a row of caps, and the two operators are inserted at (0,0) and (x,t).
Ordinary (time) unitarity of every brick has already reduced the network to the causal
diamond.</p>
<p><strong>Move 1.</strong> Take the bottom-left brick of the diamond. Its left input leg
carries a cup and its bottom input leg carries a cup (both boundaries), so by folded
dual unitarity — 𝒰 maps left cups to right cups — the brick is replaced by cups on its
right legs. This exposes the next brick of the staircase to the same argument;
induction peels the whole left flank. Mirror-image for the right flank using
𝒰's other duality direction (cap version). At each step you are using ONLY
tr U†U-type identities regrouped sideways: nothing about the state, nothing about the
spectrum.</p>
<p><strong>Move 2.</strong> Interior point: the flanks overlap; after peeling, the two
operator insertions sit attached to bare cups/caps, and ⟨⟨1|σ⟩⟩ = tr σ = 0 kills the
diagram. This is where tracelessness enters — the identity component of any operator
does propagate (it is the conserved "nothing" that thermalisation leaves behind).</p>
<p><strong>Move 3.</strong> Ray point: peeling halts at the staircase whose bricks each
have exactly one leg pair on the ray. A single brick with its off-ray output legs capped
and off-ray input legs cupped is precisely the map a ↦ (1/q)Tr[U†(1⊗a)U] on the
surviving leg — a completely positive, unital, trace-preserving map: a quantum channel.
2t bricks, 2t applications; the final pairing with σ<sub>α</sub> gives
C = (1/q)tr[σ<sub>α</sub> M<sup>2t</sup>(σ<sub>β</sub>)]. For site-symmetric gates
M<sub>+</sub> = M<sub>−</sub>; our asymmetric-kick check (different X-kick on each leg)
confirms the labels above are the ones consistent with our layer ordering.</p>
{% enddetails %}
</div>

<p class="thread-note"><span class="thread-label">The through-line</span>
Nothing about the gate got simpler — it is as entangling and as chaotic as they come.
What changed is the <em>geometry of cancellation</em>: with two unitary directions, the
diagram can be eaten from four sides instead of two, and the exponential interior is
exactly the part that gets eaten. Solvability as geometry, instalment one.</p>

## 4 · The channel is the physics

Everything dynamical now lives in one object: $$\mathcal M_\pm$$, a unital quantum
channel on a *single site* — the same gate-to-channel move that lets a whole family of
circuits be solved as "unitary circuits from quantum channels"
{% cite gopalakrishnan2019unitary --file refs_dual_unitary %}. Its $$q^2$$ eigenvalues
classify the late-time fate of every two-point function in the model
{% cite bertini2019exact --file refs_dual_unitary %}:

- **The trivial eigenvalue.** $$\mathcal M(\mathbb 1) = \mathbb 1$$ always: the
  identity rides the ray untouched. This is not physics, it is normalisation.
- **Ergodic and mixing.** Every *other* eigenvalue has $$\lvert\lambda\rvert < 1$$:
  all traceless correlations decay exponentially along the ray,
  $$C \sim \lambda_{\max}^{2t}$$, possibly with a spiral (complex $$\lambda$$ —
  the widget's default sits at $$\lvert\lambda\rvert = 0.82\,e^{\pm i\,1.19}$$, a
  damped oscillation you can see in the decay curve).
- **Nonergodic: solitons.** Some nontrivial eigenvalue has $$\lvert\lambda\rvert = 1$$:
  an operator that the channel merely rotates. The correlator on the ray then *never*
  decays — a soliton glides along the light cone forever, and Gibbs is replaced by a
  generalised ensemble. You do not have to hunt for this case: the bare core
  $$V[\pi/4,\pi/4,J]$$ has it built in. $$ZZ$$ commutes with the propagating $$Z$$, the
  channel spectrum is $$\{1, 1, 0.67, 0.67\}$$ at $$J = 0.37$$, and the measured
  $$C^{ZZ}$$ on the ray is $$1.000000$$ at every time — a perfectly chaotic-looking
  circuit with a perfectly undamped signal on its light cone. Switch on any kick
  $$b \neq 0$$ and the spectrum drops into the unit disk: ergodic and mixing.

That a *chaotic* many-body model hands you its exact dynamical classification as the
spectrum of a $$4\times 4$$ matrix is the sort of thing that, before 2019, would have
sounded like a category error.

<p class="ledger-note"><span class="ledger-label">Assumptions ledger</span>
Everything exact above is exact for: infinite temperature, one-site operators, the
Floquet brickwork of Part 1, and an infinite chain. Multi-site operators acquire
richer (but still computable) structure; finite temperature breaks the cup/cap
boundary and with it the collapse — only special "solvable" states survive, which is
Part 4 territory. And the numerical validation below is honest about its own horizon:
on ten sites the operator support wraps the ring after t = 2, so brute force certifies
t ≤ 2 and the channel formula carries the rest alone. That asymmetry — the exact result
outliving the numerics — is the point of the exercise.</p>

## 5 · Break it with a slider

Everything in §3–§4, live. The left panel is the spacetime map of
$$C^{\alpha\alpha}(x,t)$$: with dual unitarity ON, the interior is *exactly* zero and
the ray values come from powers of $$\mathcal M_+$$ (the bottom rows are re-derived by
dense brute force in your browser and agree to machine precision — watch the readout);
drag $$\varepsilon$$ away from zero and watch the interior flood back, at which point
the analytic rows are honestly replaced by question marks, because for a generic gate
nothing exact is known there and the exponential wall of Part 1 stands. The right panel
is the channel's nontrivial spectrum in the unit disk, with the ray decay curve it
predicts and the brute-force points riding on top of it.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="cc-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.1rem;align-items:center;justify-content:center;margin-top:0.85rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      J
      <input id="cc-J" type="range" min="0" max="0.785" step="0.005" value="0.37">
      <span id="cc-J-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">0.37</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      kick b
      <input id="cc-b" type="range" min="0" max="1.55" step="0.005" value="0.60">
      <span id="cc-b-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">0.60</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      &#949; (breaks duality)
      <input id="cc-eps" type="range" min="0" max="0.35" step="0.005" value="0">
      <span id="cc-eps-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">0.00</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">
      <input id="cc-op" type="checkbox"> probe with X instead of Z
    </label>
    <button id="cc-restore" style="font-size:0.8rem;padding:0.3rem 0.7rem;border-radius:6px;border:1px solid var(--global-theme-color);background:transparent;color:inherit;cursor:pointer;">restore dual unitarity</button>
  </div>
  <p id="cc-status" style="font-size:0.85rem;margin:0.7rem 0 0;text-align:center;font-variant-numeric:tabular-nums;"></p>
  <p style="font-size:0.8rem;opacity:0.75;margin:0.5rem 0 0;text-align:center;">
    Gate: (e<sup>ibX</sup> &#8855; e<sup>ibX</sup>) &#183; exp[i((&#960;/4&#8722;&#949;)XX + (&#960;/4)YY + J&#183;ZZ)].
    Brute force: dense Heisenberg evolution on a 10-site ring, exact and wrap-free for
    t &#8804; 2; analytic rows: powers of the 4&#215;4 channel. All computed in your browser.
  </p>
</div>

<script src="{{ '/assets/js/correlation-collapse.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("cc-mount");
    if (!mount || typeof createCorrelationCollapse !== "function") return;
    var w = createCorrelationCollapse(mount, {});
    function val(id) { return +document.getElementById(id).value; }
    function show(id, v, d) { document.getElementById(id).textContent = v.toFixed(d); }
    ["cc-J", "cc-b", "cc-eps"].forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener("input", function () { show(id + "-val", +el.value, 2); });
      el.addEventListener("change", function () { w.setParams(val("cc-J"), val("cc-b"), val("cc-eps")); });
    });
    document.getElementById("cc-op").addEventListener("change", function () {
      w.setOperator(this.checked ? "X" : "Z");
    });
    document.getElementById("cc-restore").addEventListener("click", function () {
      var el = document.getElementById("cc-eps");
      el.value = 0; show("cc-eps-val", 0, 2);
      w.setParams(val("cc-J"), val("cc-b"), 0);
    });
    w.onStatus(function (msg) { document.getElementById("cc-status").innerHTML = msg; });
  })();
</script>

**The kicked Ising connection.** The oldest member of the family predates the field: the
kicked Ising chain at its *self-dual point* — couplings and kick both at their maximal
$$\pi/4$$-like values — was recognised as space-time self-dual in the spectral-statistics
literature {% cite akila2016particle --file refs_dual_unitary %} before dual unitarity
was named, and it is the model for which exact chaos results were first proven
{% cite bertini2018exact --file refs_dual_unitary %}. Two asides for regular readers,
one line each as is this blog's cross-thread custom. The
[influence-matrix thread]({% post_url 2026-07-29-temporal-entanglement-when-a-chaotic-system-is-a-perfect-bath %})
met the same self-dual point from the side: its "perfect dephaser" — the bath whose
temporal entanglement vanishes identically — *is* dual unitarity read as a statement
about the sideways state rather than the sideways gate. And the clean kicked Ising chain
is *also* [free-fermion solvable]({% post_url 2026-07-06-free-fermions-one-matrix %})
via Jordan–Wigner — one model carrying two logically independent solvability
mechanisms, an accident worth remembering whenever "solvable" is treated as a single
property.

## 6 · Solvable, yet chaotic

It is worth pausing on how strange the result is. "Exactly solvable" has always come
with an asterisk: free theories (correlations computable because nothing really
interacts), or integrable ones (an extensive tower of conservation laws pins the
dynamics). Dual-unitary circuits carry neither excuse. At generic parameters they have
no local conserved quantities at all; their spectral form factor follows the
random-matrix prediction — for the self-dual kicked Ising chain this is a *theorem*
{% cite bertini2018exact --file refs_dual_unitary %}; their operators entangle
maximally fast, as Part 4 will make precise. Every diagnostic that usually files a
model under "hopeless" comes back positive, and yet §3 wrote down every two-point
function for all times on the back of an envelope.

The resolution is that solvability here was never a statement about the physics being
tame. It is a statement about the *diagram* — a second unitary direction reorganises
the same chaotic dynamics so that what is computable (light-ray channels) separates
cleanly from what is chaotic (everything the interior used to hide). Chaos is not
defeated; it is *quarantined* on the rays, where it shows up as an honest quantum
channel contracting toward equilibrium.

The maximally chaotic and the exactly solvable turn out not to be opposite ends of a
spectrum. They can be the same model, viewed along different axes of its own spacetime.

## 7 · One question

The whole construction stood on one leg: for qubits, §2's family — two Cartan angles
frozen at $$\pi/4$$, locals, one free $$J$$ — is *everything*. One parameter's worth of
models, however dressed. For $$q \ge 3$$ no such classification exists, and the known
examples stop looking like a single family and start looking like a bestiary:
constructions from complex Hadamard matrices, from quantum Latin squares, gates whose
ergodicity you can *tune* at will. So the question Part 3 opens with: **when the
complete map is gone, how do you actually build a dual-unitary gate — and how much of
the zoo have we even seen?**

<div class="sec-divider" aria-hidden="true">•••</div>

{% bibliography --file refs_dual_unitary --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
