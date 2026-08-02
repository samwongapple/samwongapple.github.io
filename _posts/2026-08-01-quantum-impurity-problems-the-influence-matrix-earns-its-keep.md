---
layout: post
title: "Quantum Impurity Problems: The Influence Matrix Earns Its Keep"
date: 2026-08-01 03:00:00-0700
description: The series finale. A small interacting region coupled to free-fermion leads is the exact shape the influence matrix was built for — the leads collapse to kernels, the impurity's dynamics follows from a contour Dyson equation, and the whole thing is benchmarked against an exactly solvable model, in and out of equilibrium, with DMFT waiting at the end of the road.
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
     SERIES: "The Influence Matrix" — Part 5 of 5 (finale).
     Through-line stage: compressing the temporal state solves problems
     (impurities, transport) that resisted every spatial method.
     The ONE allowed process-tensor sentence lives in §5's outlook — keep
     it to exactly one sentence, per the series charter.
     All numbers = c5_rlm_solver.jl (cross-checked against numpy).
     Widget: assets/js/rlm-transport.js (exact transmission/Landauer,
     node-verified against an independent python integration).
     ===================================================================== -->

## 1 · The problem that resisted

Every tool eventually meets the problem it was secretly built for. For the influence
matrix, that problem is sixty years old and still the beating heart of correlated-electron
physics: the **quantum impurity problem**. A few interacting degrees of freedom — a
magnetic atom in a metal {% cite anderson1961localized --file refs_influence_matrix %}, a
quantum dot between electrodes, one lattice site promoted to special status — coupled to
effectively infinite reservoirs of free fermions. It sounds like it should be easy. Three
things make it brutal in combination: the impurity *interacts* (no Gaussian collapse
there), the leads are *infinite* and gapless (no cutting them off without consequences),
and the questions that matter are often *nonequilibrium* — a bias voltage across a dot, a
quench, a current that never stops flowing.

Spatial methods each pay one of those costs in full. Exact diagonalization truncates the
leads and pays in finite-size artifacts. Spatial MPS methods simulate the leads
honestly and pay in entanglement, which grows and grows in a driven system. Real-time
quantum Monte Carlo pays in the sign problem, which nonequilibrium makes vicious. And the
stakes are higher than any single impurity, because the impurity problem is the *engine*
of dynamical mean-field theory — the framework that treats a whole correlated lattice by
self-consistently solving one impurity in a bath
{% cite georges1996dynamical --file refs_influence_matrix %}. Whoever builds a better
impurity solver moves the entire field downstream of it.

Now look at that problem's anatomy with four parts of this series behind us. Small
interacting core; large *free-fermion* environment; long times. It is not merely
compatible with the influence-matrix method. It is the method's portrait.

## 2 · The division of labor

Here is the whole strategy of the temporal approach, in one sentence each for the two
halves of the problem.

**The leads collapse.** [Part 4]({% post_url 2026-07-31-gaussian-influence-matrices-free-fermions-in-the-time-direction %}) showed that a free-fermion bath's entire influence on
anything it touches is one Gaussian kernel $$\Delta$$ — $$2T \times 2T$$, built from the
lead's spectral function at single-particle cost, exact at any lead size including
infinite. Two leads at different chemical potentials? Two kernels, added. The
nonequilibrium drive that torments spatial methods costs the temporal method *nothing*:
a biased lead is just a lead whose occupation function moved
{% cite thoenniss2023nonequilibrium --file refs_influence_matrix %}.

**The impurity stays small.** Whatever the impurity does — interact, precess, get driven —
it does it in a Hilbert space of a handful of states, strung over $$T$$ time steps. In the
worst case that is a temporal MPS of modest dimension (Parts 2–3); for an interacting dot
it is the object the *IF-MPS impurity solvers* of Thoenniss, Sonner, Lerose and Abanin
compress {% cite thoenniss2023efficient --file refs_influence_matrix %}; and for the
benchmark of this post it is even less. Crucially, the temporal entanglement that governs
the cost is the *gentle* kind: the leads are integrable baths — the logarithmic column of
Part 3's table — and there is no sign problem anywhere, because nothing is being sampled.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 560 210" width="560" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The impurity setup and its temporal-language translation. Left: a dot level epsilon d between two semi-infinite leads with chemical potentials mu L and mu R, coupled with strength gamma on each side. An arrow labelled the space-time rotation points right. Right: the impurity's world-line over T time steps flanked by two kernels Delta L and Delta R, each a 2T by 2T matrix, with the note that the infinite leads have become finite matrices">
    <defs>
      <marker id="p5f1-a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--global-theme-color)"/></marker>
    </defs>
    <g font-family="system-ui, sans-serif">
      <!-- left: the spatial setup -->
      <text x="120" y="24" fill="currentColor" font-size="10.5" text-anchor="middle" font-weight="600">the impurity problem, in space</text>
      <g fill="currentColor" fill-opacity="0.45">
        <circle cx="34" cy="80" r="5"/><circle cx="56" cy="80" r="5"/><circle cx="78" cy="80" r="5"/>
        <circle cx="162" cy="80" r="5"/><circle cx="184" cy="80" r="5"/><circle cx="206" cy="80" r="5"/>
      </g>
      <g stroke="currentColor" stroke-opacity="0.45" stroke-width="1.3">
        <line x1="39" y1="80" x2="51" y2="80"/><line x1="61" y1="80" x2="73" y2="80"/>
        <line x1="167" y1="80" x2="179" y2="80"/><line x1="189" y1="80" x2="201" y2="80"/>
        <line x1="20" y1="80" x2="29" y2="80" stroke-dasharray="2 3"/>
        <line x1="211" y1="80" x2="220" y2="80" stroke-dasharray="2 3"/>
      </g>
      <circle cx="120" cy="80" r="9" fill="var(--global-theme-color)" fill-opacity="0.85"/>
      <g stroke="var(--global-theme-color)" stroke-width="1.6">
        <line x1="83" y1="80" x2="111" y2="80"/><line x1="129" y1="80" x2="157" y2="80"/>
      </g>
      <g fill="currentColor" font-size="9.5" text-anchor="middle">
        <text x="97" y="70">&#947;</text><text x="143" y="70">&#947;</text>
        <text x="120" y="104">&#949;<tspan baseline-shift="sub" font-size="7">d</tspan>, U?</text>
        <text x="56" y="110">lead L, &#956;<tspan baseline-shift="sub" font-size="7">L</tspan></text>
        <text x="184" y="110">lead R, &#956;<tspan baseline-shift="sub" font-size="7">R</tspan></text>
        <text x="56" y="126" fill-opacity="0.7">infinite &#8594;</text>
        <text x="184" y="126" fill-opacity="0.7">&#8592; infinite</text>
      </g>

      <!-- rotation arrow -->
      <line x1="240" y1="86" x2="288" y2="86" stroke="var(--global-theme-color)" stroke-width="1.8" marker-end="url(#p5f1-a)"/>
      <text x="264" y="70" fill="var(--global-theme-color)" font-size="9.5" text-anchor="middle">the space-time</text>
      <text x="264" y="82" fill="var(--global-theme-color)" font-size="9.5" text-anchor="middle">rotation</text>

      <!-- right: temporal language -->
      <text x="430" y="24" fill="currentColor" font-size="10.5" text-anchor="middle" font-weight="600">the same problem, in time</text>
      <rect x="316" y="46" width="64" height="88" rx="9" fill="var(--global-theme-color)" fill-opacity="0.18" stroke="var(--global-theme-color)" stroke-width="1.6"/>
      <text x="348" y="86" fill="currentColor" font-size="10.5" text-anchor="middle" font-weight="600">&#916;<tspan baseline-shift="sub" font-size="7.5">L</tspan></text>
      <text x="348" y="101" fill="currentColor" font-size="8.5" text-anchor="middle" fill-opacity="0.75">2T &#215; 2T</text>
      <rect x="480" y="46" width="64" height="88" rx="9" fill="var(--global-theme-color)" fill-opacity="0.18" stroke="var(--global-theme-color)" stroke-width="1.6"/>
      <text x="512" y="86" fill="currentColor" font-size="10.5" text-anchor="middle" font-weight="600">&#916;<tspan baseline-shift="sub" font-size="7.5">R</tspan></text>
      <text x="512" y="101" fill="currentColor" font-size="8.5" text-anchor="middle" fill-opacity="0.75">2T &#215; 2T</text>
      <!-- impurity world-line -->
      <g stroke="var(--global-theme-color)" stroke-width="1.4">
        <line x1="428.5" y1="50" x2="428.5" y2="130"/><line x1="431.5" y1="50" x2="431.5" y2="130" stroke-dasharray="3 3"/>
      </g>
      <g fill="currentColor" fill-opacity="0.4">
        <rect x="424" y="60" width="12" height="7" rx="2"/><rect x="424" y="82" width="12" height="7" rx="2"/><rect x="424" y="104" width="12" height="7" rx="2"/>
      </g>
      <g stroke="currentColor" stroke-opacity="0.5" stroke-width="1.1">
        <line x1="384" y1="63" x2="424" y2="63"/><line x1="384" y1="85" x2="424" y2="85"/><line x1="384" y1="107" x2="424" y2="107"/>
        <line x1="436" y1="63" x2="476" y2="63"/><line x1="436" y1="85" x2="476" y2="85"/><line x1="436" y1="107" x2="476" y2="107"/>
      </g>
      <text x="430" y="150" fill="currentColor" font-size="9.5" text-anchor="middle">impurity world-line, T steps</text>
      <text x="430" y="176" fill="currentColor" font-size="9.5" text-anchor="middle" fill-opacity="0.85">the infinite leads are now two finite matrices;</text>
      <text x="430" y="190" fill="var(--global-theme-color)" font-size="9.5" text-anchor="middle">only the small interacting core is left to solve</text>
    </g>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.82;max-width:34rem;margin:0.5rem auto 0;">
    The division of labor. In space: a small dot between two semi-infinite biased leads —
    three infinities (size, time, drive) and one interaction. After the rotation: the
    leads are two 2T × 2T kernels attached to the impurity's world-line, exactly, at any
    bias; everything hard has been concentrated into the one place that is small.
  </figcaption>
</figure>

## 3 · A solver you can grade

Claims about solvers deserve report cards, so the companion builds the smallest genuine
one and grades it against the one impurity problem with an exact answer: the **resonant
level model** — a single level $$\varepsilon_d$$, no interaction, coupled to tight-binding
leads. Nothing about the solver knows the model is solvable; it takes the kernel(s)
$$\Delta$$ and the impurity's bare contour propagator $$G_0$$, and solves the discrete
Dyson equation

$$
G \;=\; \left(1 + G_0 \Delta\right)^{-1} G_0 ,
\qquad
\langle n_d(t) \rangle = -\,G\big[t^{\rightarrow},\, t^{\leftarrow}\big]
$$

— a $$2T\times 2T$$ linear solve, full stop. The exact reference brute-forces the
impurity plus hundreds of lead sites. The report card, quench from an occupied level:

```text
dt = 0.40   max|n_IF − n_exact| = 0.2513
dt = 0.20   max|n_IF − n_exact| = 0.1345
dt = 0.10   max|n_IF − n_exact| = 0.0689
dt = 0.05   max|n_IF − n_exact| = 0.0348
```

First-order convergence in the Trotter step, exactly as the discretization predicts — the
kernel route reproduces the exact relaxation, with the *only* error being the time grid.
And the nonequilibrium version costs nothing extra: two leads at bias $$V = 1$$, two
kernels,

```text
t = 2.0   exact 0.6364   IF 0.6378
t = 5.0   exact 0.4217   IF 0.4217
t = 9.0   exact 0.4168   IF 0.4088
```

The dot relaxes into a genuine current-carrying steady state, computed without ever
simulating a lead. Note what is absent from that sentence: no lead truncation, no
entanglement growth, no sampling, no sign problem. The three costs of section 1, gone —
for this noninteracting toy — and the interacting case changes only the impurity-side
representation, not the lead-side collapse.

<div class="learn-more-box" markdown="0">
{% details The discrete contour Dyson equation, and a sign that earns its own box %}
The impurity's free contour Green's function, for an initially occupied level, is

$$
G_0(a, b) = e^{-i\varepsilon_d (t_a - t_b)} \times
\begin{cases} 1 - n_0 & a \succeq b \\ -n_0 & a \prec b \end{cases}
$$

on the $$2T$$-point contour — for $$n_0 = 1$$ a *strictly triangular* matrix, so the
textbook form $$G = (G_0^{-1} - \Delta)^{-1}$$ is unusable as written. Resumming the
Dyson series avoids inverting $$G_0$$ entirely, and doing the Grassmann Wick contraction
carefully — the crossed pairing in
$$\langle \psi_a \bar\psi_b\, \bar\psi_c \Delta_{cd} \psi_d \rangle$$ carries a fermionic
minus — gives

$$
G = G_0 - G_0 \Delta\, G_0 + G_0 \Delta\, G_0 \Delta\, G_0 - \cdots
  = \left(1 + G_0 \Delta\right)^{-1} G_0 .
$$

The occupation is read off the mixed-branch element: with $$a$$ the forward point at time
$$t$$ and $$b$$ its backward partner, contour ordering puts $$b$$ later, so
$$G(a,b) = -\langle \bar\psi(b) \psi(a)\rangle = -n_d(t)$$.

The sign in $$(1 + G_0\Delta)$$ is the box-worthy part. With the wrong sign nothing
crashes: the solve succeeds, the curve is smooth — and drifts to $$n_d \approx 10$$ on an
observable bounded by 1. A convention error in a Keldysh calculation fails *quietly and
catastrophically at once*, which is why this series' rule — no formula without an exact
referee — is not pedantry. (The companion's numbers were additionally cross-checked
against an independent numpy implementation before the Julia version existed.)
{% enddetails %}
</div>

## 4 · Transport: the exact answer to be beaten

The observable that impurity solvers ultimately owe the world is the **current**. For the
resonant level the exact answer is Landauer's
{% cite meir1992landauer --file refs_influence_matrix %}: at zero temperature,
$$I(V) = \frac{1}{2\pi}\int_{-V/2}^{V/2} T(\omega)\, d\omega$$, with the transmission a
resonance whose width is set by the hybridization. The widget computes it with the
*exact* energy-dependent hybridization of tight-binding leads —
$$\Gamma(\omega) \propto \gamma^2\sqrt{4-\omega^2}$$ plus the level shift
$$\Lambda(\omega)$$ — against the wide-band Lorentzian everyone writes first. Watch three
things: the current saturating once the bias window swallows the resonance; the band
edges, where the exact curve and the wide-band approximation part ways; and the level
shift dragging the resonance off $$\varepsilon_d$$ as the coupling grows.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="rlm-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:center;margin-top:0.85rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      level &#949;<sub>d</sub>
      <input id="rlm-e" type="range" min="-1.5" max="1.5" step="0.05" value="0.20">
      <span id="rlm-e-val" style="min-width:2.9em;font-variant-numeric:tabular-nums;">0.20</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      coupling &#947;
      <input id="rlm-g" type="range" min="0.15" max="0.9" step="0.05" value="0.40">
      <span id="rlm-g-val" style="min-width:2.9em;font-variant-numeric:tabular-nums;">0.40</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      bias V
      <input id="rlm-v" type="range" min="0" max="4.4" step="0.05" value="1.00">
      <span id="rlm-v-val" style="min-width:2.9em;font-variant-numeric:tabular-nums;">1.00</span>
    </label>
  </div>
  <p style="font-size:0.8rem;opacity:0.75;margin:0.7rem 0 0;text-align:center;">
    The exactly solvable benchmark every RLM solver must reproduce — including the
    companion's kernel-based one. Teal: exact (tight-binding leads); dashed: wide-band
    approximation.
  </p>
</div>

<script src="{{ '/assets/js/rlm-transport.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("rlm-mount");
    if (!mount || typeof createRlmTransport !== "function") return;
    var w = createRlmTransport(mount, { eps: 0.2, gamma: 0.4, V: 1.0 });
    var e = document.getElementById("rlm-e"), g = document.getElementById("rlm-g"), v = document.getElementById("rlm-v");
    var ev = document.getElementById("rlm-e-val"), gv = document.getElementById("rlm-g-val"), vv = document.getElementById("rlm-v-val");
    function upd() { w.setParams(e.value, g.value, v.value); }
    e.addEventListener("input", function () { ev.textContent = (+e.value).toFixed(2); });
    g.addEventListener("input", function () { gv.textContent = (+g.value).toFixed(2); });
    v.addEventListener("input", function () { vv.textContent = (+v.value).toFixed(2); });
    e.addEventListener("change", upd); g.addEventListener("change", upd); v.addEventListener("change", upd);
  })();
</script>

## 5 · The end of the ladder, and the road beyond it

The series' through-line, one last time, now carrying everything it earned. *A many-body
system, seen from inside, is a state in time.* Part 1: that state exists — the influence
matrix, exact and concrete. Part 2: its entanglement is the bath's memory, and a
maximally chaotic bath can have none. Part 3: its growth law is a phase diagnostic —
log, linear, tiny, zero. Part 4: for free fermions the state is Gaussian, one kernel.
Part 5: and that is precisely enough to attack the problem class the whole field cares
about, with the exact benchmark passed in and out of equilibrium.

<p class="thread-note"><span class="thread-label">The through-line</span> Compressing the
state in time solves problems that resisted every method that stayed in space. That was
the destination all along.</p>

What lies past the toy? Three roads, in ascending ambition. **The interacting dot**: keep
the Gaussian lead kernels, represent the impurity's world-line as a temporal MPS, and you
have the IF-MPS impurity solvers — the real research frontier this series has been
shadowing {% cite thoenniss2023efficient --file refs_influence_matrix %}. **DMFT**: wrap
any such solver in the self-consistency loop where the lattice problem *becomes* an
impurity problem {% cite georges1996dynamical --file refs_influence_matrix %}, and
improvements to the solver propagate to phase diagrams of real materials. **And sideways**:
the influence matrix of this series is, in the open-quantum-systems community's language,
a process tensor — one object, two literatures, and a bridge I may walk in some other
thread. (Regular readers of this site's noise-and-control posts may hear a familiar
rhyme; that is the one sentence I will spend on it.)

The capstone companion — the kernel-based RLM solver, both benchmarks, the sign lesson,
all runnable — is
[**A toy impurity solver, benchmarked**]({{ '/programming/influence-matrix-05-rlm-solver/' | relative_url }}).
The companion ladder that started with a dense $$4^T$$ vector ends, five rungs later, at
a working toy of a genuine research instrument.

One open question to carry out the door — the honest kind, since it is the one I am
carrying myself: the interacting dot's temporal state is *not* Gaussian, but it is
Gaussian-plus-a-little. How far does "a little" go before the linear barrier of Part 3
finds you again — and is the answer different at a Kondo fixed point, where the impurity
and the leads conspire to build something no finite bond dimension obviously contains?
The literature is actively fighting about exactly this, which is the best sign a question
is worth having.

## References

{% bibliography --file refs_influence_matrix --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }
