---
layout: post
title: "Setting the Matrix in Motion: Quenches, Light Cones, and Entanglement Growth"
date: 2026-07-26 09:00:00-0700
description: Time evolution of a Gaussian state is a rotation of one small matrix. Entanglement grows linearly and without bound — and the correlation matrix tracks it without growing at all.
tags: [condensed-matter, free-fermions, entanglement, quantum-quench]
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
     FREE-FERMION ARC, post A3 (internal label only — never printed).
     Opens on A2's closing contradiction: entanglement after a quench grows
     without bound, yet the correlation matrix never grows.

     THROUGH-LINE: the collapse survives motion too. C(t) = U C(0) U† is a
     rotation of one small matrix; cost is L³ per time step, independent of
     how entangled the state becomes. The resolution of the paradox: a
     Gaussian state is not compressed by a *low-entanglement* ansatz, it is
     compressed by a *quadratic* one. Entanglement is free to grow.

     VERIFIED IN NODE before writing (assets/js/quench-dynamics.js):
      - t=0 CDW product state: S_A = 0 exactly; density 1,0,1,0,...
      - C(t) exactly Hermitian; <N> conserved to 1e-15; all ζ ∈ [0,1]
      - S_A(t) linear early (dS/dt ≈ 1.78 for L_A=12), then saturates
      - light cone: |C| front reaches d/t → ≈4 = 2·v_max with v_max = 2t ✓
      - N=60 reflections revive S_A after t≈12 → widget window capped at 12
     Per no-published-series-roadmaps: end on ONE open question (why convert
     a Gaussian state to an MPS at all → the Gaussian-tensor-network thread).
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — Evolution is a rotation (~500 words + box)
     ===================================================================== -->

## 1 · Evolution is a rotation of the matrix

The last two posts pinned a Gaussian state to a small matrix and then left it sitting there.
Every state we examined was in equilibrium — a ground state, or a thermal state. Now let us
break that.

The standard way to put a many-body system out of equilibrium is a **quantum quench**:
prepare the system in the ground state of one Hamiltonian, then abruptly change the
Hamiltonian and let the state evolve under the new one. The state is now an excited,
non-equilibrium superposition, and the question is what it does.

For a generic interacting system this is close to hopeless: the state explores its
exponentially large Hilbert space, and even storing it becomes impossible after a short time.
For free fermions it costs almost nothing, and the reason is the following observation.

Under a quadratic Hamiltonian $$H = \sum_{ij} h_{ij} c_i^\dagger c_j$$, the Heisenberg
equation for a single fermion operator closes on itself — the commutator of $$c_i$$ with a
quadratic form is *linear* in the $$c$$'s, so no higher-order operators are ever generated.
Modes rotate into modes. Propagating that statement into the correlation matrix gives the
central result of this post:

<div class="key-eq" markdown="1">

$$
C(t) \;=\; U(t)\; C(0)\; U(t)^\dagger,
\qquad
U(t) \;=\; e^{-i h t}.
$$

</div>

Read the sizes carefully, because that is where the content is. $$h$$ is the
**single-particle** Hamiltonian — the $$L \times L$$ matrix of hopping amplitudes, not the
$$2^L \times 2^L$$ many-body operator. $$U(t)$$ is an $$L\times L$$ unitary. The entire
many-body time evolution, in the full $$2^L$$-dimensional Hilbert space, is implemented by
conjugating one small matrix with another. Diagonalize $$h$$ once — that is $$O(L^3)$$ — and
from then on you can jump to *any* time $$t$$ directly, with no time stepping, no Trotter
error, no accumulation of approximation.

<p class="thread-note"><span class="thread-label">The through-line</span> The collapse survives motion. A state of 2<sup>L</sup> amplitudes evolves by rotating an L×L matrix — and the cost per time is fixed, no matter how complicated the state becomes.</p>

<div class="learn-more-box" markdown="0">
{% details Derivation: why the correlation matrix obeys a closed equation %}
Work in the Heisenberg picture. For $$H = \sum_{ij} h_{ij} c_i^\dagger c_j$$, use the
identity $$[c_a,\, c_i^\dagger c_j] = \delta_{ai} c_j$$ (which follows from
$$\{c_a, c_i^\dagger\} = \delta_{ai}$$) to get

$$
\frac{d c_a}{dt} = i\,[H, c_a] = -i \sum_j h_{aj}\, c_j .
$$

This is the crucial structural fact: the right-hand side contains only single fermion
operators. The equation of motion **closes** — it never generates $$c^\dagger c c$$ terms the
way an interacting Hamiltonian would. It is an ordinary linear ODE with solution

$$
c_a(t) = \sum_j \big(e^{-i h t}\big)_{aj}\, c_j(0) \;\equiv\; \sum_j U_{aj}(t)\, c_j(0).
$$

Substituting into the definition of the correlation matrix,

$$
C_{ij}(t) = \big\langle c_i^\dagger(t)\, c_j(t) \big\rangle
= \sum_{kl} U^{*}_{ik} U_{jl} \big\langle c_k^\dagger c_l \big\rangle
= \big(U^{*} C(0)\, U^{\mathsf T}\big)_{ij},
$$

which is the stated result up to transposition conventions. Two corollaries worth noting.
First, unitarity of $$U$$ means the eigenvalues of the *full* matrix $$C(t)$$ never change —
the occupations of the eigenmodes of the initial state are constants of the motion. (Only the
eigenvalues of the *restricted* matrix $$C\vert_A$$ move, which is why entanglement can grow
at all.) Second, Gaussianity is preserved exactly: a quadratic Hamiltonian maps Gaussian
states to Gaussian states, so the state never leaves the family we can describe.

For paired systems the same argument runs in the Majorana language of the previous post, with
$$\Gamma(t) = O(t)\,\Gamma(0)\,O(t)^{\mathsf T}$$ for a real orthogonal $$O(t)$$ generated by
the Majorana coupling matrix. Nothing structural changes.
{% enddetails %}

</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — Quasiparticle picture + light cone (~550 words + figure)
     ===================================================================== -->

## 2 · What actually spreads: quasiparticle pairs

Knowing that $$C(t)$$ is computable is not the same as understanding what it does. For that
there is a picture, due to Calabrese and Cardy {% cite calabrese2005evolution --file refs_free_fermions %},
which is simple enough to draw and accurate enough to predict numbers.

Immediately after the quench, the initial state is not an eigenstate of the new Hamiltonian:
it is loaded with energy, which it carries in the form of excitations. Because the
Hamiltonian is quadratic, those excitations are non-interacting quasiparticles with a
definite dispersion $$\varepsilon(k)$$ and group velocity
$$v(k) = \mathrm{d}\varepsilon/\mathrm{d}k$$. The quench creates them in **entangled pairs**
of opposite momentum, $$(k, -k)$$, at essentially every point in space — pair production, all
at once, everywhere.

Then they fly apart ballistically. And here is the point: the two members of a pair are
entangled with each other, so a region $$A$$ becomes entangled with its surroundings exactly
when it ends up containing *one* member of a pair while the other has escaped. Entanglement
is not something that diffuses through the system; it is carried, at finite speed, by
counter-propagating partners.

Two consequences follow immediately, and both are visible in the widget below.

**A light cone.** Since the fastest quasiparticle moves at
$$v_{\max} = \max_k |v(k)|$$, correlations between two points cannot appear until a pair
emitted between them has had time to reach both. For the tight-binding chain
$$\varepsilon(k) = -2t\cos k$$, so $$v(k) = 2t \sin k$$ and $$v_{\max} = 2t$$; the correlation
front in $$|C_{ij}(t)|$$ therefore opens at relative speed $$2 v_{\max} = 4t$$ — a value I
measured directly in the simulation before writing this, and one you can read off the
spreading edge in the heatmap. This is the lattice cousin of the rigorous Lieb–Robinson bound
{% cite lieb1972finite --file refs_free_fermions %}, which guarantees such a cone exists for
any local Hamiltonian, interacting or not — and it has been watched directly in cold-atom
experiments {% cite cheneau2012light --file refs_free_fermions %}.

**Linear entanglement growth, then saturation.** Count the pairs that straddle the boundary
of a block of length $$L_A$$. At early times the number grows linearly with $$t$$, because
every pair produced within a distance $$v t$$ of a boundary has had time to split across it.
Once $$t$$ exceeds $$L_A / 2v_{\max}$$, though, the block has been fully traversed: the supply
of pairs that can still contribute is exhausted, and the entropy levels off at a value
proportional to $$L_A$$. So

$$
S_A(t) \;\sim\;
\begin{cases}
\; \alpha\, t, & t \lesssim L_A / 2 v_{\max}, \\[2pt]
\; s_{\text{eq}}\, L_A, & t \gtrsim L_A / 2 v_{\max}.
\end{cases}
$$

Linear growth followed by a volume law. Note how thoroughly this breaks the area law of the
first post: in equilibrium the entropy of a block was $$O(1)$$ or $$O(\ln L_A)$$, and here it
ends up proportional to the block's *volume*. Ground states are very special; generic states
are not.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 460 208" width="460" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Space-time diagram of entangled quasiparticle pairs spreading from a quench, forming a light cone across the boundary of region A">
    <!-- axes -->
    <line x1="40" y1="176" x2="440" y2="176" stroke="currentColor" stroke-opacity="0.5" stroke-width="1"/>
    <line x1="40" y1="176" x2="40" y2="18" stroke="currentColor" stroke-opacity="0.5" stroke-width="1"/>
    <text x="447" y="180" font-size="11" fill="currentColor" text-anchor="end" font-family="system-ui, sans-serif">x</text>
    <text x="34" y="20" font-size="11" fill="currentColor" text-anchor="end" font-family="system-ui, sans-serif">t</text>

    <!-- region A shading -->
    <rect x="170" y="18" width="120" height="158" fill="var(--global-theme-color)" fill-opacity="0.10"/>
    <line x1="170" y1="18" x2="170" y2="176" stroke="#b3760a" stroke-width="1.4" stroke-dasharray="5 4"/>
    <line x1="290" y1="18" x2="290" y2="176" stroke="#b3760a" stroke-width="1.4" stroke-dasharray="5 4"/>
    <text x="230" y="192" font-size="11" fill="var(--global-theme-color)" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600">region A</text>

    <!-- quasiparticle pair trajectories: emitted at t=0, flying apart -->
    <g stroke="var(--global-theme-color)" stroke-width="1.5" stroke-opacity="0.85" fill="none">
      <!-- pair emitted inside A near left edge: one escapes, one stays -->
      <line x1="200" y1="176" x2="128" y2="60"/>
      <line x1="200" y1="176" x2="272" y2="60"/>
      <!-- pair emitted near right edge -->
      <line x1="266" y1="176" x2="212" y2="90"/>
      <line x1="266" y1="176" x2="320" y2="90"/>
      <!-- pair emitted outside A on the left -->
      <line x1="110" y1="176" x2="56" y2="90"/>
      <line x1="110" y1="176" x2="164" y2="90"/>
    </g>
    <!-- emission points -->
    <g fill="var(--global-theme-color)">
      <circle cx="200" cy="176" r="3.2"/><circle cx="266" cy="176" r="3.2"/><circle cx="110" cy="176" r="3.2"/>
    </g>
    <!-- highlight the split pairs (one partner each side of a boundary) -->
    <g fill="#e0a63a">
      <circle cx="128" cy="60" r="4"/><circle cx="272" cy="60" r="4"/>
      <circle cx="320" cy="90" r="4"/><circle cx="212" cy="90" r="4"/>
      <circle cx="164" cy="90" r="4"/><circle cx="56" cy="90" r="4"/>
    </g>
    <text x="352" y="52" font-size="10.5" fill="currentColor" fill-opacity="0.8" font-family="system-ui, sans-serif">pairs split across a</text>
    <text x="352" y="66" font-size="10.5" fill="currentColor" fill-opacity="0.8" font-family="system-ui, sans-serif">boundary carry the</text>
    <text x="352" y="80" font-size="10.5" fill="currentColor" fill-opacity="0.8" font-family="system-ui, sans-serif">entanglement</text>
    <text x="66" y="36" font-size="10.5" fill="currentColor" fill-opacity="0.7" font-family="system-ui, sans-serif" font-style="italic">slope = 1/v<tspan baseline-shift="sub" font-size="8">max</tspan></text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:33rem;margin:0.5rem auto 0;">
    The quasiparticle picture as a space–time diagram. The quench creates entangled pairs of
    opposite momentum everywhere at t = 0; they fly apart ballistically. A pair contributes to
    S<sub>A</sub> only once its two members sit on opposite sides of a boundary — which is why
    the entropy first grows linearly and then saturates when the block runs out of pairs to
    split.
  </figcaption>
</figure>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — Widget + what it shows (~500 words)
     ===================================================================== -->

## 3 · Watching it happen

The widget below runs the real computation live in your browser. It prepares a
charge-density wave — the product state $$\lvert 1010\ldots\rangle$$, every other site
occupied, which has *zero* entanglement to begin with — and quenches it with uniform hopping.
Then it evolves $$C(t) = U(t) C(0) U(t)^\dagger$$ exactly, restricts to a centred block, and
computes $$S_A(t)$$ from the eigenvalues of $$C(t)\vert_A$$ with the same binary-entropy sum
we derived two posts ago.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="qd1-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:center;margin-top:0.75rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      block size L<sub>A</sub>
      <input id="qd1-la" type="range" min="4" max="30" step="2" value="16">
      <span id="qd1-la-val" style="min-width:2em;font-variant-numeric:tabular-nums;">16</span>
    </label>
    <span style="display:flex;gap:0.5rem;">
      <button id="qd1-toggle" type="button" style="cursor:pointer;padding:0.25rem 0.75rem;border-radius:6px;border:1px solid var(--global-divider-color);background:transparent;color:var(--global-text-color);">Pause</button>
      <button id="qd1-reset" type="button" style="cursor:pointer;padding:0.25rem 0.75rem;border-radius:6px;border:1px solid var(--global-divider-color);background:transparent;color:var(--global-text-color);">Replay</button>
    </span>
  </div>
</div>

<script src="{{ '/assets/js/quench-dynamics.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("qd1-mount");
    if (!mount || typeof createQuenchDynamics !== "function") return;
    var q = createQuenchDynamics(mount, { N: 60, LA: 16, tMax: 12 });
    var la = document.getElementById("qd1-la"), laV = document.getElementById("qd1-la-val");
    la.addEventListener("input", function () { q.setLA(la.value); laV.textContent = la.value; });
    var tg = document.getElementById("qd1-toggle");
    tg.addEventListener("click", function () { tg.textContent = q.toggle() ? "Pause" : "Play"; });
    document.getElementById("qd1-reset").addEventListener("click", function () { q.reset(); tg.textContent = "Play"; });
  })();
</script>

<figcaption style="font-size:0.85rem;opacity:0.8;max-width:34rem;margin:-0.5rem auto 1.5rem;text-align:center;">
  Everything is computed from the model in the browser — no canned curves. Left: |C<sub>ij</sub>(t)|,
  starting as a bare diagonal (a product state has no correlations) and opening into a light
  cone. Middle: the density wave melting toward uniform half filling. Right: S<sub>A</sub>(t),
  linear then bending over. The run stops at t = 12, just before quasiparticles reflecting off
  the open ends of the 60-site chain come back and cause revivals.
</figcaption>

Three things to watch, each an item from the previous section made visible.

**The heatmap starts empty.** At $$t=0$$ the correlation matrix is diagonal — a product state
has no correlations at all — and then a front opens away from the diagonal at constant speed.
That opening angle *is* the light cone; the correlations outside it are not merely small, they
are exponentially suppressed.

**The density wave melts.** The initial $$1,0,1,0,\ldots$$ pattern washes out to a flat
$$\tfrac12$$ almost immediately. Local observables relax fast, and if you only measured
densities you would conclude the system had thermalized.

**The entropy tells a different story.** $$S_A(t)$$ climbs in a clean straight line and then
bends over into saturation at a value proportional to $$L_A$$ — drag the block-size slider and
watch the kink move: bigger blocks stay in the linear regime longer, exactly as
$$t^{*} \sim L_A/2v_{\max}$$ predicts. And note what the saturation value is *not*: it is not
the maximal $$L_A \ln 2$$. The state does not become as random as it possibly could.

That last point is worth a paragraph, because it is the deepest thing on the screen. The
system looks thermalized locally, but it cannot truly thermalize: as noted in the derivation
box, the occupations of the eigenmodes are constants of the motion, so the state carries a
memory of its initial conditions forever, in an extensive number of conserved quantities. What
free fermions relax to is not a thermal Gibbs state but a **generalized Gibbs ensemble**, with
one Lagrange multiplier per conserved mode occupation — the standard reference for this
circle of ideas is Essler and Fagotti's review {% cite essler2016quench --file refs_free_fermions %},
and the exact free-fermion entanglement asymptotics were worked out by Fagotti and Calabrese
{% cite fagotti2008evolution --file refs_free_fermions %}. Integrability leaves fingerprints
that no amount of waiting erases.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — Resolving the paradox (~450 words)
     ===================================================================== -->

## 4 · The paradox, and what it teaches

Now we can settle the contradiction that ended the last post.

Here is the tension, stated sharply. The entanglement entropy of a block grows linearly in
time, without bound, until it reaches a volume law. Meanwhile $$C(t)$$ has $$L^2$$ entries at
$$t = 0$$ and $$L^2$$ entries at every later time. Nothing about the correlation matrix
notices that the state has become vastly more entangled. How can a fixed-size object track an
unboundedly growing quantity?

Because **the correlation matrix was never compressing the state by its entanglement.**

That is the whole resolution, and it is worth saying slowly, because the assumption to the
contrary is easy to absorb without noticing. The dominant intuition in modern many-body
physics — the one that powers matrix product states and DMRG — is that a state is compressible
when it is *lightly entangled*. An MPS with bond dimension $$\chi$$ can represent entanglement
up to $$\ln \chi$$ across any cut, so a state whose entropy grows linearly needs $$\chi$$
growing *exponentially* in time. That is precisely why real-time simulation with tensor
networks hits a wall after a short time, and no amount of cleverness in the algorithm removes
the wall — it is a statement about the state, not the method.

The Gaussian representation makes a completely different bargain. It does not assume the state
is lightly entangled; it assumes the state is **quadratic** — that all correlations are
generated by two-point functions via Wick's theorem. Those are independent conditions. A
Gaussian state can be as entangled as you like and still be described by $$L^2$$ numbers,
because the compression is exploiting a structural property of the *correlations*, not a
smallness of the *entropy*.

<p class="thread-note"><span class="thread-label">The through-line</span> The collapse is not about small entanglement — it is about Gaussianity. That is why the correlation matrix can follow a state straight through the volume-law regime that stops a tensor network cold.</p>

So free fermions occupy a genuinely privileged position: they are the one corner of many-body
physics where highly entangled, far-from-equilibrium dynamics is exactly and cheaply solvable.
It is a narrow corner — turn on an interaction and Wick's theorem fails immediately, the
equations of motion stop closing, and everything above evaporates. But within it, we can
compute things nobody can compute otherwise, which is exactly what makes free fermions such a
useful laboratory and such a useful *starting point*.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — Closing hook → Gaussian tensor networks (ONE question)
     ===================================================================== -->

## 5 · A question that should not make sense

Three posts have made the same argument in three settings. A Gaussian state in equilibrium
collapses to $$C$$; a paired one collapses to $$\Gamma$$; a state driven far from equilibrium
collapses to $$C(t)$$, which we can jump to at any time we like. The correlation matrix has
answered every question we have put to it, and it has done so while the tensor-network
description of the same physics was busy failing.

Which makes the following question sound, at first, like a mistake:

*How do you convert a Gaussian state into a matrix product state?*

It reads like a step backwards — trading a complete, cheap, exact description for an
approximate one that struggles with exactly the states we just showed are easy. Why would
anyone deliberately give up the representation that works?

There is an answer, and it is not a small one. It is the reason a family of methods exists
that starts with a free-fermion state and ends up solving problems that are not free at all.
That is where this goes next.

<div class="sec-divider" aria-hidden="true">•••</div>

## References

{% bibliography --file refs_free_fermions --cited --group_by none %}

---

> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
