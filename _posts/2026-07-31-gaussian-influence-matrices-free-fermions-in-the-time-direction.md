---
layout: post
title: "Gaussian Influence Matrices: Free Fermions in the Time Direction"
date: 2026-07-31 03:00:00-0700
description: For a bath of free fermions the influence matrix collapses one step further — from a temporal MPS to a Gaussian state in time, fully specified by a single correlation kernel built from the bath's spectral function. Every formula from the free-fermion post transplants onto the time axis, and objects that would need 10²⁴ amplitudes fit in a 96×96 matrix.
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
     SERIES: "The Influence Matrix" — Part 4 of 5.
     Through-line stage: for free fermions the temporal state is Gaussian —
     one temporal correlation kernel holds everything.
     NOTATION DECISION (flagged to author): the free-fermion post reserves
     Γ for the SPATIAL Majorana covariance matrix. Here the temporal
     Majorana covariance is written Λ, and the hybridization kernel Δ.
     (The free-fermion post's own Majorana section is still a scaffold —
     when it is written, keep Γ there and Λ here.)
     All numbers = c4_gaussian_im.jl (machinery validated to 1e-16 against
     explicit Fock-space construction; independently cross-checked against
     a numpy implementation). Widget: assets/js/gaussian-im.js (node-verified
     against the Julia numbers to all printed digits).
     Deferred honestly: the kernel→dynamics benchmark (⟨n_d(t)⟩ from Δ vs
     exact evolution) lives in Part 5's companion, where the impurity
     solver needs it anyway.
     ===================================================================== -->

## 1 · The collapse, again

This series keeps promising that structure makes exponential objects small, and [Part 3]({% post_url 2026-07-30-dynamical-phases-through-the-temporal-lens %})
ended by betting everything on one structure in particular. The generic thermalizing bath
builds a linearly growing temporal barrier; the baths that matter for this part — **free
fermions** — sit in the gentle, logarithmic column of Part 3's table. But "gentle for an
MPS" undersells what actually happens, because for a quadratic bath the influence matrix
does not merely compress well. It *collapses*.

My [free-fermion post]({% post_url 2026-07-06-free-fermions-one-matrix %}) was built on
one slogan: for a Gaussian state of $$L$$ modes, the exponentially large density matrix
collapses to an $$L\times L$$ correlation matrix — the state *is* the matrix, and every
entanglement question becomes an eigenvalue question. This post is that slogan, rotated
ninety degrees. For a bath of free fermions, the influence matrix — a state on the
*temporal* lattice, as Parts 1–3 established — is a **Gaussian state in time**, fully
specified by one correlation kernel with one leg per time step
{% cite thoenniss2023nonequilibrium --file refs_influence_matrix %}. Not $$4^T$$
components. Not even an MPS. A $$2T \times 2T$$ matrix.

(One notational note before diving in, to keep the two posts compatible: the free-fermion
post writes $$\Gamma$$ for the *spatial* Majorana covariance matrix. I will keep
$$\Gamma$$ reserved for that, and write $$\Delta$$ for the temporal kernel and
$$\Lambda$$ for the temporal Majorana covariance built from it.)

## 2 · Trajectories made of Grassmann numbers

Why did the spin chain give us an MPS while fermions give us a matrix? Because of what a
"trajectory" is in each language. In Parts 1–3 the system's trajectory was a sequence of
spin values $$\sigma_1 \dots \sigma_T$$, and the influence matrix was some *arbitrary*
function of them — $$4^T$$ independent numbers unless entanglement said otherwise. For
fermions, the natural trajectory variables in the path integral are **Grassmann numbers**
$$\xi_t, \bar\xi_t$$ — anticommuting placeholders, one pair per time step per contour
branch. And Grassmann variables square to zero, so *any* function of them is a finite
polynomial; a Gaussian one is determined entirely by its quadratic kernel.

That is exactly what integrating out a quadratic bath produces. The influence functional
of a free-fermion environment coupled linearly to the impurity is
{% cite feynman1963theory thoenniss2023nonequilibrium --file refs_influence_matrix %}

$$
\mathrm{IF}\left[\bar\xi, \xi\right]
\;=\; \exp\!\Big( \sum_{a,b} \bar\xi_a \, \Delta_{ab}\, \xi_b \Big),
$$

where $$a, b$$ run over the $$2T$$ points of the Keldysh contour (forward branch up,
backward branch down — the folded picture of Part 1, in fermionic dress), and
$$\Delta_{ab}$$ is the discretized **hybridization**: the contour-ordered two-time
correlation function of the one bath operator the impurity touches, times the coupling
squared. Everything Part 1 said about the influence matrix generating the bath's
multi-time correlators is still true — but for a quadratic bath the *two-time* correlator
is the whole story, by Wick's theorem, exactly as the spatial correlation matrix was the
whole story for a Gaussian state. All the higher structure the spin IM had to store
explicitly is now generated, for free, from one kernel.

$$\Delta$$ is computable directly from the bath's **spectral function** — no many-body
work at all. For the running example of this post, a semi-infinite tight-binding lead at
half filling coupled with strength $$\gamma$$: the lead's surface correlators
$$g^{\gtrless}(t)$$ come from its single-particle eigenbasis (which is analytic), and

$$
\Delta_{ab} \;=\; s_a s_b\, \gamma^2 \delta t^2 \;
G_c(t_a, t_b), \qquad
G_c = \begin{cases} g^>(t_a - t_b) & a \succeq b \text{ on the contour} \\
-\,g^<(t_a - t_b) & \text{otherwise,} \end{cases}
$$

with $$s_a = \pm 1$$ the branch signs. (Those signs, and kindred convention choices, are
a diagonal $$\pm1$$ congruence of the kernel — they change nothing measurable about the
temporal state, its entanglement least of all.)

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 560 180" width="560" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The Gaussian pipeline as five boxes connected by arrows: the bath's spectral function, leading to the two-time surface correlators g greater and g lesser of t, leading to the contour kernel Delta, a 2T by 2T matrix, leading to the temporal Majorana covariance Lambda, leading to the zeta spectrum and the temporal entanglement. Underneath, a bracket notes that in the spin language the same journey required contracting an exponentially large network">
    <defs>
      <marker id="p4f1-a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--global-theme-color)"/></marker>
    </defs>
    <g font-family="system-ui, sans-serif">
      <rect x="16" y="52" width="92" height="44" rx="8" fill="currentColor" fill-opacity="0.09" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.4"/>
      <text x="62" y="71" fill="currentColor" font-size="10" text-anchor="middle">spectral</text>
      <text x="62" y="84" fill="currentColor" font-size="10" text-anchor="middle">function A(&#969;)</text>

      <line x1="112" y1="74" x2="132" y2="74" stroke="var(--global-theme-color)" stroke-width="1.5" marker-end="url(#p4f1-a)"/>

      <rect x="136" y="52" width="92" height="44" rx="8" fill="currentColor" fill-opacity="0.09" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.4"/>
      <text x="182" y="71" fill="currentColor" font-size="10" text-anchor="middle">two-time</text>
      <text x="182" y="84" fill="currentColor" font-size="10" text-anchor="middle">correlators g&#8823;(t)</text>

      <line x1="232" y1="74" x2="252" y2="74" stroke="var(--global-theme-color)" stroke-width="1.5" marker-end="url(#p4f1-a)"/>

      <rect x="256" y="46" width="96" height="56" rx="8" fill="var(--global-theme-color)" fill-opacity="0.2" stroke="var(--global-theme-color)" stroke-width="1.7"/>
      <text x="304" y="67" fill="currentColor" font-size="11" text-anchor="middle" font-weight="600">the kernel &#916;</text>
      <text x="304" y="82" fill="currentColor" font-size="9.5" text-anchor="middle" fill-opacity="0.8">2T &#215; 2T &#8212; the whole IM</text>

      <line x1="356" y1="74" x2="376" y2="74" stroke="var(--global-theme-color)" stroke-width="1.5" marker-end="url(#p4f1-a)"/>

      <rect x="380" y="52" width="76" height="44" rx="8" fill="currentColor" fill-opacity="0.09" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.4"/>
      <text x="418" y="71" fill="currentColor" font-size="10" text-anchor="middle">covariance &#923;</text>
      <text x="418" y="84" fill="currentColor" font-size="10" text-anchor="middle">(Majorana)</text>

      <line x1="460" y1="74" x2="480" y2="74" stroke="var(--global-theme-color)" stroke-width="1.5" marker-end="url(#p4f1-a)"/>

      <rect x="484" y="52" width="62" height="44" rx="8" fill="currentColor" fill-opacity="0.09" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.4"/>
      <text x="515" y="71" fill="currentColor" font-size="10" text-anchor="middle">&#950;-spectrum</text>
      <text x="515" y="84" fill="currentColor" font-size="10" text-anchor="middle">&#8594; TE</text>

      <text x="281" y="26" fill="currentColor" font-size="10" text-anchor="middle" fill-opacity="0.8">single-particle linear algebra, end to end</text>

      <path d="M 20 118 C 20 130, 540 130, 540 118" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.2"/>
      <text x="280" y="150" fill="currentColor" font-size="10" text-anchor="middle" fill-opacity="0.8">the same journey in the spin language: contract a 4&#8309;&#8305; &#8230; no &#8212; a 4&#7511;-component folded network</text>
      <text x="280" y="166" fill="var(--global-theme-color)" font-size="10" text-anchor="middle">this is the free-fermion post&#8217;s collapse, transplanted onto the time axis</text>
    </g>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.82;max-width:34rem;margin:0.5rem auto 0;">
    The whole part in one pipeline. A quadratic bath's spectral function determines its
    two-time correlators; those fill one 2T × 2T contour kernel Δ; and Δ — because the
    influence functional is Gaussian — <em>is</em> the influence matrix, with the temporal
    covariance Λ and every entanglement question following by the same eigenvalue formulas
    the free-fermion post derived in space.
  </figcaption>
</figure>

<div class="learn-more-box" markdown="0">
{% details Where the Gaussian influence functional comes from (sketch) %}
Write the impurity–bath evolution as a fermionic coherent-state path integral on the
Keldysh contour. The bath enters through terms quadratic in bath Grassmanns with a linear
coupling to the impurity's $$\bar\xi_a, \xi_a$$; integrating the bath out is then a
Gaussian integral done exactly, and its result exponentiates the *second cumulant only*:

$$
\mathrm{IF}[\bar\xi, \xi]
= \exp\Big( \gamma^2 \!\! \sum_{a,b}\, \bar\xi_a\, \big\langle \mathcal{T}_c\,
c^{\vphantom{\dagger}}_1(t_a)\, c^\dagger_1(t_b) \big\rangle_{\mathrm{bath}} \,\xi_b \Big)
\quad\text{(discretized: } \Delta_{ab}\text{)}.
$$

No higher cumulants appear — not as an approximation but because a Gaussian bath has
none; this is the Grassmann avatar of Part 1's observation that the IM generates the
bath's multi-time correlators, specialized to the case where Wick's theorem reduces them
all to the two-time function. The careful discrete-time construction (what exactly
$$\Delta$$'s time arguments are, how the measure splits, the boundary terms) is in
Thoenniss, Lerose & Abanin {% cite thoenniss2023nonequilibrium --file refs_influence_matrix %};
this series inherits their result, checks its *state-level* machinery to machine
precision below, and defers the kernel→dynamics benchmark to Part 5's companion — where
the impurity solver needs it anyway, against the exactly solvable resonant level model.
{% enddetails %}
</div>

## 3 · The influence matrix as a BCS state in time

To use the free-fermion post's machinery we need the IF *as a state*, not a functional.
The dictionary is direct: promote each contour point's Grassmann pair to a pair of
temporal fermion modes. The influence functional then reads as a **BCS-like paired
state** over $$4T$$ temporal modes,

$$
\lvert \mathrm{IM} \rangle \;\propto\;
\exp\!\Big( \tfrac{1}{2} \sum_{ij} A_{ij}\, \hat c^\dagger_i \hat c^\dagger_j \Big)
\lvert 0 \rangle,
\qquad
A = \begin{pmatrix} 0 & \Delta \\ -\Delta^{\!\top} & 0 \end{pmatrix},
$$

pairing the "out" family against the "in" family with the kernel as the pairing
amplitude. A state of this form is Gaussian, and its correlation matrices have closed
forms in $$A$$:

$$
\langle \hat c^\dagger \hat c \rangle = A^\dagger (1 + A A^\dagger)^{-1} A,
\qquad
\langle \hat c \hat c \rangle = -(1 + A A^\dagger)^{-1} A .
$$

Assemble these into the temporal Majorana covariance $$\Lambda$$, restrict $$\Lambda$$ to
the modes before a time cut, take eigenvalues $$\pm i\lambda_k$$, set
$$\zeta_k = (1+\lambda_k)/2$$ — and the temporal entanglement is
$$S = \sum_k H(\zeta_k)$$ with $$H$$ the binary entropy. If that recipe sounds familiar,
it should: it is *verbatim* the
[free-fermion post's]({% post_url 2026-07-06-free-fermions-one-matrix %}) restrict-and-
diagonalize procedure for spatial entanglement, with the cut moved from a place to a
moment. One formalism, two axes.

None of this is taken on faith. The companion validates every joint of the chain at small
size against an explicit many-body construction — building
$$\lvert\mathrm{IM}\rangle$$'s $$2^{n}$$ Fock amplitudes from Pfaffians and comparing:

```text
covariance closed forms:  max|ΔC| = 1.1e-16   max|ΔF| = 1.5e-16
entanglement, modes 1–3:  RDM S = 1.3108701637   Λ-formula S = 1.3108701637
```

Machine precision, formula by formula — and independently cross-checked against a second
implementation in numpy.

## 4 · What the one matrix shows

Now point the validated pipeline at the physical lead and look. Two views, both live in
the widget below.

**The kernel is the memory, visibly.** The heatmap is $$\lvert\Delta(t, t')\rvert$$: a
bright diagonal ridge — the bath responds most strongly to what just happened — with
off-diagonal tails falling as $$\lvert t - t'\rvert^{-3/2}$$, the semicircle band's
signature (measured: $$t^{3/2}\lvert g\rvert$$ flat to within the band-edge
oscillations). Compare Part 1, where "the IM stores the bath's multi-time correlations"
was a theorem about an opaque $$4^T$$ object; here the memory content is one picture you
can read directly.

**The temporal entanglement grows logarithmically — measured.** Mid-cut TE from the
$$\zeta$$-spectrum, at $$\gamma = 0.6$$, $$\delta t = 0.4$$:

```text
T =  8    16     24     32     40     48
S = 0.245  0.307  0.338  0.359  0.375  0.387      S / ln T → 0.100
```

$$S/\ln T$$ settling to a constant is the log law on the nose — the gentle column of
Part 3's table, now with its coefficient. An MPS in time for this bath would need only a
slowly growing $$\chi$$; but the deeper point is that *we never needed the MPS*: at
$$T = 48$$ the full influence matrix of this bath is a $$96\times 96$$ kernel — 9216
complex numbers standing in for $$4^{48} \approx 8\times 10^{28}$$.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="gim-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:center;margin-top:0.85rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      coupling &#947;
      <input id="gim-g" type="range" min="0.2" max="1.2" step="0.05" value="0.60">
      <span id="gim-g-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">0.60</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      time step &#948;t
      <input id="gim-dt" type="range" min="0.2" max="0.6" step="0.05" value="0.40">
      <span id="gim-dt-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">0.40</span>
    </label>
  </div>
  <p style="font-size:0.8rem;opacity:0.75;margin:0.7rem 0 0;text-align:center;">
    Semi-infinite tight-binding lead, half filled. Stronger coupling deepens the memory
    (watch the TE curve rise, still logarithmic); the kernel heatmap shows where that
    memory lives in the (t, t&#8242;) plane.
  </p>
</div>

<script src="{{ '/assets/js/gaussian-im.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("gim-mount");
    if (!mount || typeof createGaussianIM !== "function") return;
    var w = createGaussianIM(mount, { gamma: 0.6, dt: 0.4 });
    var g = document.getElementById("gim-g"), d = document.getElementById("gim-dt");
    var gv = document.getElementById("gim-g-val"), dv = document.getElementById("gim-dt-val");
    g.addEventListener("input", function () { gv.textContent = (+g.value).toFixed(2); });
    d.addEventListener("input", function () { dv.textContent = (+d.value).toFixed(2); });
    g.addEventListener("change", function () { w.setParams(g.value, d.value); });
    d.addEventListener("change", function () { w.setParams(g.value, d.value); });
  })();
</script>

<p class="thread-note"><span class="thread-label">The through-line</span> A many-body
system, seen from inside, is a state in time. For a free-fermion bath that state is
Gaussian: one temporal correlation kernel holds every memory the bath has, and the
free-fermion post's entire toolbox — restrict, diagonalize, read entropies off
eigenvalues — works unchanged with "region" replaced by "era."</p>

## 5 · Where this goes

Take stock of what is now assembled, because Part 5 uses every piece. From Parts 1–3: the
influence matrix as a temporal state, an MPS machinery for generic baths, and the
knowledge of which baths are gentle. From this part: for *free-fermion* baths, the IM is
one kernel built from a spectral function — arbitrary bath sizes, arbitrary times, at
single-particle cost, machine-precision-validated machinery from kernel to entanglement.

Here is why that combination is a weapon and not just an elegance. The hardest chronic
problems in correlated-electron physics — **quantum impurity problems** — have exactly
the shape this series has been building toward: a *small interacting region* (where
nothing is Gaussian and nothing is cheap) coupled to *large free-fermion leads* (which
are precisely the baths of this post). The leads are where every spatial method pays an
unbounded price: they are big, they are entangling, and in a transport setup they never
settle down. In the temporal language the leads collapse to a kernel each — and only the
small interacting core remains to be handled honestly. That division of labor — Gaussian
environments compressed exactly, interactions confined to a few temporal modes — is the
influence-matrix method's flagship application
{% cite thoenniss2023efficient --file refs_influence_matrix %}, and it is [Part 5]({% post_url 2026-08-01-quantum-impurity-problems-the-influence-matrix-earns-its-keep %}).

The full pipeline — Pfaffian-level validation, the lead kernel, the TE measurements, all
runnable — is the programming companion:
[**One matrix in time**]({{ '/programming/influence-matrix-04-gaussian-im/' | relative_url }}).

One open question to carry out the door: everything here was one lead in equilibrium at
one filling. The kernel construction never asked for equilibrium — two leads at
*different* chemical potentials just give two kernels. What physics lives in the temporal
state of a bath that is permanently out of equilibrium, with a current trying to flow
through the impurity? That is not a rhetorical question either; it is the setting of the
finale.

## References

{% bibliography --file refs_influence_matrix --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }
