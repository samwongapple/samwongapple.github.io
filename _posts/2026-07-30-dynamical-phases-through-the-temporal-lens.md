---
layout: post
title: "Dynamical Phases Through the Temporal Lens"
date: 2026-07-30 03:00:00-0700
description: Break the kicked Ising chain's hidden integrability, disorder it, or tune it to self-duality, and watch one number — the temporal entanglement of the influence matrix — split the dynamical phases apart. Integrable baths remember gently, localized baths barely at all, genuinely chaotic baths build a linearly growing memory barrier, and dual-unitary chaos remembers nothing.
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
     SERIES: "The Influence Matrix" — Part 3 of 5.
     Through-line stage: dynamical phases are visible in the temporal state.
     All numbers = c3_te_regimes.jl output (temporal MPS, χ up to 256,
     bath depth T+4, ∞-temperature bath, disorder-averaged for MBL).
     Model generalized with longitudinal fields:
       U_F = e^{-ib ΣX} e^{-i(J ΣZZ + Σ g_j Z_j)}
     Widget: assets/js/te-regimes.js (curves = Julia data; live dots
     verified vs Julia in node to ~3e-4).
     ===================================================================== -->

## 1 · An experiment on one vector

Part 2 ended with a confession and a dangling number. The confession: the "generic" bath
whose temporal entanglement we measured — the clean kicked Ising chain — is secretly a
free-fermion model in a spin costume, a Jordan–Wigner transformation away from quadratic.
Integrable, not chaotic. The dangling number: its temporal entanglement saturated near *one
bit*, and nothing explained why. This post runs the experiment that untangles both: take
the same chain, add one term,

$$
U_F \;=\; e^{-i b \sum_j X_j}\;
e^{-i\left(J \sum_j Z_j Z_{j+1} \,+\, \sum_j g_j Z_j\right)},
$$

and use the longitudinal fields $$g_j$$ as a *dynamical-phase dial*. Everything else —
the influence matrix, the temporal MPS machinery of Part 2, the infinite-temperature bath —
stays fixed, so whatever changes in the temporal state is attributable to one thing: the
kind of many-body dynamics the bath is having.

The claim to be tested is the strongest one the series has made yet: that the
**entanglement of the influence matrix is a diagnostic of the bath's dynamical phase**
{% cite lerose2021scaling sonner2022characterizing --file refs_influence_matrix %}. Not a
numerical overhead to be minimized — a *measurement*, performed on a single vector in
time, that can tell you whether the many-body system it summarizes thermalizes, fails to,
or refuses to even try.

## 2 · The contenders

Four settings of the dial, four kinds of many-body dynamics.

**Integrable** ($$g_j = 0$$). The clean chain. Quadratic in disguise, hence solvable:
stable quasiparticles propagate ballistically and never scatter. Such a system famously
fails to thermalize in the ordinary sense — it remembers too much, forever, in its
extensive set of conserved quantities.

**Chaotic** ($$g_j = g = 0.4$$). The longitudinal field breaks the hidden integrability.
No quasiparticles survive; the model thermalizes, spectral statistics go random-matrix,
and operators scramble. This — not the clean chain — is the generic many-body bath.

**Dual-unitary chaotic** ($$b = J = \pi/4$$, $$g$$ arbitrary). Part 2's special point,
*with the field on*. The longitudinal term commutes with the space-time swap of the
diagonal gates, so dual-unitarity survives — this member of the family is genuinely,
provably chaotic {% cite bertini2019exact --file refs_influence_matrix %} *and* sits at
the perfect-dephaser point. Chaos with a hidden protection.

**Localized** ($$J = 0.25$$, $$b = 0.2$$, $$g_j$$ random and strong). Strong disorder in
a weakly-kicked chain: the many-body localized regime
{% cite abanin2019colloquium --file refs_influence_matrix %}. Transport stops; the system
retains local memory of its initial state forever; thermalization simply does not happen.
The bath that *cannot* forget, by construction — with the interesting question being what
kind of memory that implies for an outside observer.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 560 218" width="560" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Four space-time cartoons of how information injected at a bath's boundary spreads. Integrable: straight quasiparticle rays leave the boundary and never return. Chaotic: a filled light cone keeps washing back over the boundary. Dual-unitary: information moves strictly on the light cone edge and never revisits. Localized: information stays in small puddles near where it started">
    <defs>
      <marker id="p3f1-a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor" fill-opacity="0.6"/></marker>
    </defs>
    <!-- shared: each panel is a space(x)-time(y) quadrant, boundary at left edge -->
    <!-- panel 1: integrable -->
    <g>
      <text x="76" y="20" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">integrable</text>
      <line x1="30" y1="160" x2="30" y2="34" stroke="var(--global-theme-color)" stroke-width="2"/>
      <line x1="30" y1="160" x2="128" y2="160" stroke="currentColor" stroke-opacity="0.4" stroke-width="1"/>
      <g stroke="currentColor" stroke-opacity="0.65" stroke-width="1.3">
        <line x1="30" y1="150" x2="122" y2="98"/>
        <line x1="30" y1="126" x2="122" y2="74"/>
        <line x1="30" y1="102" x2="122" y2="50"/>
      </g>
      <text x="76" y="182" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">quasiparticles leave,</text>
      <text x="76" y="194" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">never scatter back</text>
    </g>
    <!-- panel 2: chaotic -->
    <g>
      <text x="216" y="20" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">chaotic</text>
      <line x1="170" y1="160" x2="170" y2="34" stroke="var(--global-theme-color)" stroke-width="2"/>
      <line x1="170" y1="160" x2="268" y2="160" stroke="currentColor" stroke-opacity="0.4" stroke-width="1"/>
      <path d="M 170 150 L 262 46 L 262 46 L 170 46 Z" fill="currentColor" fill-opacity="0.14"/>
      <g stroke="currentColor" stroke-opacity="0.5" stroke-width="1" stroke-dasharray="3 3">
        <path d="M 170 140 C 200 120, 200 100, 170 88" fill="none"/>
        <path d="M 170 118 C 210 100, 210 74, 170 62" fill="none"/>
      </g>
      <text x="216" y="182" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">the filled cone keeps</text>
      <text x="216" y="194" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">washing back over the edge</text>
    </g>
    <!-- panel 3: dual-unitary -->
    <g>
      <text x="356" y="20" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">dual-unitary</text>
      <line x1="310" y1="160" x2="310" y2="34" stroke="var(--global-theme-color)" stroke-width="2"/>
      <line x1="310" y1="160" x2="408" y2="160" stroke="currentColor" stroke-opacity="0.4" stroke-width="1"/>
      <line x1="310" y1="150" x2="402" y2="46" stroke="currentColor" stroke-opacity="0.8" stroke-width="1.8"/>
      <text x="356" y="182" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">everything rides the cone&#8217;s</text>
      <text x="356" y="194" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">edge exactly &#8212; no return</text>
    </g>
    <!-- panel 4: localized -->
    <g>
      <text x="496" y="20" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">localized</text>
      <line x1="450" y1="160" x2="450" y2="34" stroke="var(--global-theme-color)" stroke-width="2"/>
      <line x1="450" y1="160" x2="548" y2="160" stroke="currentColor" stroke-opacity="0.4" stroke-width="1"/>
      <g fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-opacity="0.5">
        <ellipse cx="462" cy="120" rx="9" ry="34"/>
        <ellipse cx="486" cy="96" rx="7" ry="26"/>
        <ellipse cx="508" cy="128" rx="6" ry="20"/>
      </g>
      <text x="496" y="182" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">information stays in</text>
      <text x="496" y="194" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">puddles where it started</text>
    </g>
    <!-- axes legend -->
    <line x1="30" y1="212" x2="70" y2="212" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.1" marker-end="url(#p3f1-a)"/>
    <text x="78" y="215" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="start" fill-opacity="0.75">into the bath</text>
    <text x="200" y="215" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="start" fill-opacity="0.75">&#8593; time&#8195;&#8195;teal line = the boundary the system talks to</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.82;max-width:34rem;margin:0.5rem auto 0;">
    The same question asked of four baths: when the system imprints something on the
    boundary spin, where does the imprint go? Whatever comes back to the boundary later is
    memory, and memory is temporal entanglement. The four transport cartoons predict four
    different answers — which the measurement below turns into growth laws.
  </figcaption>
</figure>

## 3 · The measurement

For each regime the companion script builds the influence matrix as a temporal MPS
(Part 2's engine, generalized with the longitudinal fields), pushes the bath depth past
the light cone at $$T+4$$ sites, and reads off the half-cut temporal entanglement
$$S(T/2)$$ as $$T$$ grows. Bond dimensions up to $$\chi = 256$$ for the hardest points;
the localized row is averaged over disorder realizations. The results:

| $$T$$ | 4 | 8 | 12 | 16 | 20 |
| --- | --- | --- | --- | --- | --- |
| integrable | 0.526 | 0.814 | 0.974 | 1.054 | 1.099 |
| chaotic | 0.529 | 1.090 | 1.722 | 2.335 | ≈2.82 |
| dual-unitary chaotic | 0 | 0 | 0 | 0 | 0 |
| localized (avg) | 0.190 | 0.387 | 0.555 | 0.668 | 0.741 |

At $$T=4$$ the integrable and chaotic rows are indistinguishable — 0.526 vs 0.529: the
longitudinal field has barely had time to matter. By $$T=20$$ they differ by a factor
approaching three and, more importantly, by *shape*. The integrable bath's memory grows
ever more slowly — increments of 0.29, 0.16, 0.08, 0.05 — consistent with the logarithmic
growth expected at free points {% cite lerose2021scaling --file refs_influence_matrix %}.
The chaotic bath's memory grows **linearly**: increments of 0.56, 0.63, 0.61, ~0.48 per
four steps, a steady $$\approx 0.15$$ per Floquet step with no sign of stopping. The
localized bath's memory is the *smallest of all* at every $$T$$, creeping up
logarithmically. And the dual-unitary bath's is identically zero, longitudinal field and
all — chaotic dynamics with a perfectly memoryless boundary.

(Numerical honesty: the chaotic row is $$\chi$$-converged to all digits shown through
$$T=16$$; at $$T=20$$ the value still drifts by $$\sim 1\%$$ between $$\chi=192$$ and
$$256$$, which is itself data — a linearly growing $$S$$ *means* exponentially growing
$$\chi$$, and the barrier bites the very method measuring it.)

The same data, live — curves from the companion's temporal-MPS runs, and open circles
computed in your browser by exact dense contraction as an independent check of the small-$$T$$
ends:

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="ter-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.1rem;align-items:center;justify-content:center;margin-top:0.75rem;font-size:0.88rem;">
    <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;"><input type="checkbox" id="ter-int" checked> integrable</label>
    <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;"><input type="checkbox" id="ter-cha" checked> chaotic</label>
    <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;"><input type="checkbox" id="ter-dua" checked> dual-unitary</label>
    <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;"><input type="checkbox" id="ter-mbl" checked> localized</label>
  </div>
</div>

<script src="{{ '/assets/js/te-regimes.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("ter-mount");
    if (!mount || typeof createTeRegimes !== "function") return;
    var w = createTeRegimes(mount, {});
    [["ter-int", "integrable"], ["ter-cha", "chaotic"], ["ter-dua", "dualunitary"], ["ter-mbl", "mbl"]].forEach(function (p) {
      document.getElementById(p[0]).addEventListener("change", function () { w.toggle(p[1], this.checked); });
    });
  })();
</script>

## 4 · Reading the phases

Figure 1's transport cartoons now earn their keep, because each growth law is the
entanglement shadow of a transport statement.

**Integrable — slow growth.** Quasiparticles carry the system's imprint into the bath
ballistically and, crucially, *without backscattering*. What leaves does not return; the
memory that remains comes from the slow, soft parts of the free spectrum, and it
accumulates only logarithmically {% cite lerose2021scaling --file refs_influence_matrix %}.
Gentle, but never quite done growing — an integrable bath is a mediocre forgetter that
never finishes forgetting.

**Chaotic — the linear barrier.** The naive slogan from Part 2 said chaos forgets. The
measurement says the opposite, and the cartoon says why: a chaotic bath's filled light
cone keeps *washing back over the boundary*. The system's imprint doesn't leave cleanly —
it diffuses, mixes, and recrosses the contact point over and over, correlating ever more
separated times. The result is a temporal entanglement **barrier** growing linearly in
$$T$$ {% cite lerose2021scaling sonner2021influence --file refs_influence_matrix %}, with
a slope that switches on with the integrability-breaking perturbation. The irony is sharp:
the bath that *thermalizes* best is, for the influence-matrix method, the *hardest* —
because thermalization as seen by a local probe is a process, and the process has a long
memory even when its endpoint has none.

**Dual-unitary — the escape hatch.** Unless something forbids the return. At the
self-dual point *everything* propagates exactly on the light cone's edge — no interior,
no wash-back, by algebra rather than by accident. The imprint leaves at speed one and
never revisits, longitudinal field or not, and the temporal state stays a product forever.
This is why Part 2 called the perfect dephaser a protected structure: it is chaos *plus* a
kinematic guarantee that scrambled information cannot return.

**Localized — small but stubborn.** Here the cartoon almost over-predicts. An MBL bath
retains its initial-state information forever — but retains it *locally*, frozen into
puddles (the emergent local integrals of motion), which barely communicate with the
boundary. What the outside observer experiences is feeble: the smallest temporal
entanglement of all four regimes, growing logarithmically through slow dephasing between
the puddles {% cite sonner2022characterizing abanin2019colloquium --file refs_influence_matrix %}.
The bath that never forgets *itself* is nearly memoryless *about you* — memory of self and
memory of the visitor are different quantities, and the influence matrix only cares about
the second.

<p class="thread-note"><span class="thread-label">The through-line</span> A many-body
system, seen from inside, is a state in time — and the state's entanglement growth is a
phase diagnostic. Log means integrable, linear means thermalizing, tiny means localized,
zero means dual-unitary. One vector, and you can read the phase diagram off it.</p>

<div class="learn-more-box" markdown="0">
{% details Fine print: what exactly was computed, and how much to trust each digit %}
**The object.** For each $$(J, b, \{g_j\})$$ the bath's influence matrix at $$T$$ Floquet
steps, bath depth $$T+4$$ (checked: past the light cone, the depth stops mattering — cf.
Companion 2's depth-convergence table), bath initial state at infinite temperature. The
quantity plotted is the von Neumann entropy of the Schmidt spectrum across the middle time
cut, from the temporal-MPS singular values.

**Convergence.** Truncation at bond dimension $$\chi$$ with discarded-weight cutoff
$$10^{-12}$$. Integrable, dual-unitary and localized rows: converged at $$\chi = 64$$ (the
kept spectra decay fast). Chaotic row: $$\chi$$-converged through $$T = 16$$
($$\chi = 192$$ and $$256$$ agree to $$3\times10^{-3}$$); at $$T = 20$$,
$$\chi = 192 \to 256$$ still moves the value $$2.79 \to 2.82$$, so the quoted $$\approx
2.82$$ is a slight underestimate. The trend this row establishes — linear growth — is
exactly the reason it is expensive: $$S \sim \alpha T$$ needs $$\chi \sim e^{\alpha T}$$.

**Disorder.** The localized row averages 6 realizations of $$g_j$$ uniform on
$$[0, 2\pi)$$ at $$J = 0.25$$, $$b = 0.2$$. Realization-to-realization spread is modest
(the profile is already self-averaging at these sizes), but 6 is a study, not a survey —
Companion 3 prints per-realization numbers.

**The dual-unitary row** is not "converged to zero," it *is* zero: every Schmidt spectrum
across every cut has exactly one nonzero value, to machine precision, at every $$T$$ and
every $$\chi$$ — the PD structure of Part 2, surviving the longitudinal field.

**What is deliberately not claimed.** No critical exponents, no localization transition,
no thermodynamic-limit extrapolations: five points per curve at one parameter choice per
regime. The claim is the *qualitative separation of growth laws*, which is robust across
everything we varied — and matches the literature's findings for each regime
{% cite lerose2021scaling sonner2022characterizing --file refs_influence_matrix %}.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## 5 · Where this goes

An uncomfortable conclusion sits in that table. The influence-matrix program was sold —
by me, two posts ago — on the promise that temporal states are cheap. Now we find that
for the most physically generic case, a thermalizing bath, the temporal state is
*expensive*: a linearly growing barrier, exponential bond dimension, the same wall spatial
methods hit, relocated. Was the space-time rotation a trade of one wall for another?

Sometimes — and this honest answer is what makes the *next* two parts the payoff rather
than a coda. The rotation wins decisively exactly where its flagship applications live:
baths of **free fermions**. A quadratic bath is integrable by construction — the gentle,
logarithmic column of our table — and, better, its influence matrix collapses from an MPS
to something radically smaller: a *Gaussian state in time*, fully specified by one
temporal correlation matrix, with all the machinery of my
[free-fermion post]({% post_url 2026-07-06-free-fermions-one-matrix %}) transplanted onto
the time axis. That is [Part 4]({% post_url 2026-07-31-gaussian-influence-matrices-free-fermions-in-the-time-direction %}). And [Part 5]({% post_url 2026-08-01-quantum-impurity-problems-the-influence-matrix-earns-its-keep %}) puts an interacting impurity *inside* such a
Gaussian environment — the quantum impurity problem, where the leads are exactly the kind
of bath the temporal lens loves, and where this series' machinery finally gets to solve a
problem that resists everything else.

The full study behind this post — engine, disorder averaging, convergence tables, all
runnable — is the programming companion:
[**Reading a phase diagram off one vector**]({{ '/programming/influence-matrix-03-te-regimes/' | relative_url }}).

One open question to carry out the door: the chaotic barrier grows with slope
$$\approx 0.15$$ per step at $$g = 0.4$$ — and the slope must vanish as $$g \to 0$$
(integrable) *and* at the self-dual point (PD). So the slope is a function on the phase
diagram that interpolates between exact zeros. What is that function? Nothing in this post
says — and a bath whose slope is *small but finite* might be compressible far beyond what
the worst case suggests.

## References

{% bibliography --file refs_influence_matrix --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }
