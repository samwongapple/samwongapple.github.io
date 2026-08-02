---
layout: post
title: "Four Metrics, One Ramp"
date: 2026-07-31 02:00:00-0700
description: Four papers propose geometric ways to design adiabatic protocols, written by two groups that barely read each other. Put in one notation they turn out to be one variational principle with four different metrics — and the differences between those metrics decide whether the framework can choose a route at all, or only a speed.
tags: [geometric-control, quantum-geometric-tensor, adiabatic-protocols, faquad, landau-zener, optimal-control]
categories: [geometric-control]
related_posts: false
toc:
  sidebar: left
provides:
  [
    adiabatic-gauge-potential,
    quantum-geometric-tensor,
    fubini-study-metric,
    geodesic-protocol,
    path-versus-schedule,
    local-adiabaticity,
    adiabatic-brachistochrone,
    alpha-beta-hypergeometry,
    projected-metric-degeneracy,
    landau-zener-arc-length,
  ]
requires: [adiabatic-theorem, instantaneous-eigenstates, landau-zener, spectral-gap, bloch-sphere]
uses: [tfim, quantum-phase-transition, quench-ramp, response-time, double-dot-detuning, pauli-spin-blockade, sweet-spot]
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
  .wide-table {
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  .wide-table table {
    font-size: 0.82rem;
    min-width: 52rem;
  }
  .wide-table td,
  .wide-table th {
    padding: 0.35rem 0.5rem;
    vertical-align: top;
  }
  .verdict {
    border-left: 4px solid var(--global-theme-color);
    background: color-mix(in srgb, var(--global-theme-color) 7%, transparent);
    border-radius: 0 6px 6px 0;
    padding: 0.7rem 1rem;
    margin: 1.3rem 0;
  }
  .verdict .verdict-label {
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.09em;
    font-weight: 700;
    color: var(--global-theme-color);
    margin-right: 0.5rem;
  }
</style>

<!-- =====================================================================
     STANDALONE post opening the `geometric-control` thread.

     THROUGH-LINE: four "geometric" adiabatic frameworks are one variational
     principle with four metrics; the metric decides whether the framework
     can choose a ROUTE or only a SPEED, and the ground-state-projected
     metrics — the ones with the best physical pedigree — are exactly the
     ones that cannot choose a route.

     NOTATION FIXED HERE (also recorded in CONTRIBUTING-posts.md §4):
       u^μ   control parameters (NOT λ: owned by the Kibble–Zurek ramp)
       δ     adiabaticity tolerance (leaves ε to the spin-qubit thread)
       Δ_n   = E_n − E_0 ;  Δ ≡ Δ_1
       z, x  toy-model control amplitudes against capital Paulis Z, X
       G     a generic control metric;  g  the Fubini–Study one specifically

     Per the house rule: end on ONE open question, print no roadmap.
     ===================================================================== -->

Two groups have spent fifteen years proposing that adiabatic quantum protocols should be
designed **geometrically**: put a metric on the space of control knobs, and the best
protocol is a geodesic. The idea is genuinely attractive. It replaces a search over
functions with a boundary-value problem, it needs only the Hamiltonian rather than the
full propagator, and it comes with the promise that a hard optimization has been reduced
to something a differential geometer already solved.

There are four papers I want to put side by side. The **quantum adiabatic brachistochrone**
of Rezakhani, Kuo, Hamma, Lidar and Zanardi {% cite rezakhani2009 --file refs_geometric_control %},
from 2009. The **geodesic paths** of Tomka, Souza, Rosenberg and Polkovnikov
{% cite tomka2016 --file refs_geometric_control %}, from 2016 — still, a decade later, an
unpublished preprint. The **geometric fast-QUAD** of Ventura-Meinersen, Bosco and
Rimbach-Russ {% cite venturameinersen2025geom --file refs_geometric_control %}, and the
**(α, β)-hypergeometries** of Ventura Meinersen, Fernandez-Fernandez, Platero and
Rimbach-Russ {% cite venturameinersen2025hyper --file refs_geometric_control %}, both from
the last two years. I will call them QAB, TOMKA, GEOM and HYPER.

They are solving overlapping problems and they barely acknowledge each other. GEOM cites
TOMKA and — in the published version only — QAB, once, in an outlook sentence about noise.
HYPER lists QAB in a bundled citation about Pontryagin's maximum principle and never
engages with it, and does not cite TOMKA at all. Only TOMKA reads QAB carefully enough to
criticize it. As far as I can find, nobody has written down what the four frameworks
actually say in one notation, and that is what this post does.

<p class="thread-note"><span class="thread-label">The through-line</span> All four compute
the same object: a length in some metric on control space. They differ only in the metric,
and the differences are not cosmetic. They decide whether the framework can choose a
<em>route</em> through parameter space at all, or only a <em>speed</em> along a route you
already picked — and the metrics with the best physical pedigree turn out to be exactly the
ones that cannot choose a route.</p>

**The plan.** §1 draws the one distinction the whole subject turns on. §2 builds the single
object all four metrics are assembled from. §3 writes the four metrics in one notation, and
§4 tabulates every worked example in all four papers, which is the least flattering thing
here and possibly the most useful. §5 shows the four are one variational principle and
places QAB inside HYPER's own classification — in a row HYPER did not know it belonged in.
§6 computes an arc length that ought to worry anyone using an unweighted metric. §7 runs
all four on a toy problem and lets the Schrödinger equation referee. §8 separates what is
proved from what is asserted, and §9 says which one I would actually use.

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · A schedule is not a path

A protocol is a curve in the space of control parameters. Write the controls as
$$u^\mu = (u^1, \dots, u^M)$$ — gate voltages, field strengths, couplings — so that the
Hamiltonian is $$H[u]$$ and driving the system means moving along a curve $$u^\mu(t)$$
from $$u_i$$ to $$u_f$$ in a total time $$t_f$$.

That curve carries two independent pieces of information:

- its **route** $$\gamma$$ — the set of points it passes through, the track on the map;
- its **schedule** — how the time coordinate is distributed along that track, where you
  hurry and where you dawdle.

<div class="key-eq" markdown="1">

Any length functional $$L_G[\gamma] = \int \sqrt{G_{\mu\nu}\, du^\mu du^\nu}$$ is
**invariant under reparametrization**. It is therefore a statement about the route and
_carries no information whatsoever about the schedule_.

</div>

{: #result-path-versus-schedule }

This is not a technicality; it is the fault line the rest of the post runs along. Given a
metric $$G$$, there are two entirely separate things you can do with it:

**Fix the schedule.** Along a route you have already chosen, demand that you move at
constant speed in $$G$$,

$$
G_{\mu\nu}(u)\, \dot u^\mu \dot u^\nu = \delta^2 ,
$$

with $$\delta$$ an adiabaticity tolerance. This is a first-order ODE. It has a solution
along _any_ route, and it is what a physicist means by "pulse shaping". It is also what
falls out of the Beltrami identity for the energy functional $$\int G_{\mu\nu}\dot u^\mu
\dot u^\nu dt$$ — an affine-parametrization statement, nothing more.

**Fix the route.** Solve the geodesic equation
$$\ddot u^k + \Gamma^k{}_{\mu\nu}\dot u^\mu \dot u^\nu = 0$$ as a _boundary-value_ problem
with both endpoints held. This needs at least two control parameters to be non-trivial
(with one control there is only one route), and it needs the metric to be non-degenerate in
the directions you propose to move.

All four papers state both. GEOM's equation (4) and HYPER's equation (11) are the first;
QAB's equation (4) and TOMKA's equation (4) are the second. But **only two of the four ever
solve the second one**, and the word "geodesic" is used for the first throughout the
literature in a way that quietly borrows the authority of the second.

<p class="thread-note"><span class="thread-label">Why it matters</span> If the only thing
your framework does is fix a schedule, then it is a pulse shape, and it should be compared
against other pulse shapes. Calling it a geodesic implies you have solved a harder problem
— which route to take — and that implication is doing rhetorical work in at least two of
these papers.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 2 · One object, four ways to square it

Every metric below is built out of exactly one thing, so it is worth constructing that
thing once and carefully.

Take the instantaneous eigenbasis $$H[u]\lvert n(u)\rangle = E_n(u)\lvert n(u)\rangle$$,
non-degenerate, and differentiate the eigenvalue equation with respect to a control. The
standard manipulation — the same one behind the adiabatic criterion in
[the Kibble–Zurek post]({% post_url 2026-07-28-kibble-zurek-1-adiabaticity %}) — gives, for
$$m \neq n$$,

<div class="key-eq" markdown="1">

$$
\langle m \vert \partial_\mu n \rangle
= \frac{\langle m \rvert\, \partial_\mu H \,\lvert n \rangle}{E_n - E_m} ,
\qquad
\mathcal{A}_\mu \equiv i\,\langle m \vert \partial_\mu n \rangle .
$$

</div>

{: #result-adiabatic-gauge-potential }

$$\mathcal{A}_\mu$$ is the **adiabatic gauge potential**: the generator that translates you
in parameter space while keeping you in the moving eigenbasis
{% cite kolodrubetz2017 --file refs_geometric_control %}. Its physical content is a ratio —
how strongly the drive stirs the transition $$0 \to n$$, divided by how far apart those
levels are. It has one leg in the numerator (a matrix element) and one in the denominator
(a gap), and **the entire disagreement between the four frameworks is about what power to
raise each leg to.**

Fix notation for the rest of the post:

$$
M^n_\mu \equiv \langle n \rvert \partial_\mu H \lvert 0 \rangle ,
\qquad
\Delta_n \equiv E_n - E_0 ,
\qquad
\Delta \equiv \Delta_1 ,
$$

so $$M$$ is the drive's matrix element out of the ground state and $$\Delta$$ is the gap
that appears in every textbook adiabatic criterion. The ground state is the target
throughout; nothing below needs it to be the ground state rather than any isolated level.

### The quantum geometric tensor

The oldest and best-motivated combination is the one you get by asking a purely
kinematic question: how distinguishable are two neighbouring ground states? Expand the
overlap and you find {% cite provost1980 --file refs_geometric_control %}

$$
1 - \lvert \langle \psi_0(u) \vert \psi_0(u + du) \rangle \rvert^2
\;\approx\; g_{\mu\nu}(u)\, du^\mu du^\nu ,
$$

with $$g_{\mu\nu} = \mathrm{Re}\,Q_{\mu\nu}$$ the real part of the **quantum geometric
tensor**

<div class="key-eq" markdown="1">

$$
Q_{\mu\nu} = \sum_{n \neq 0} \frac{\overline{M^n_\mu}\, M^n_\nu}{\Delta_n^2} ,
\qquad
g_{\mu\nu} = \mathrm{Re}\,Q_{\mu\nu},
\qquad
\mathcal{F}_{\mu\nu} = -2\,\mathrm{Im}\,Q_{\mu\nu} .
$$

</div>

{: #result-quantum-geometric-tensor }

The real part $$g_{\mu\nu}$$ is the **Fubini–Study metric** pulled back to control space;
the imaginary part is the Berry curvature. Two facts about $$g$$ earn it its status. It is
the second-order local infidelity, by construction. And, less obviously, it is the leading
non-adiabatic energy variance: at first order in the driving velocity,
$$\delta E^2 \approx g_{\mu\nu}\dot u^\mu \dot u^\nu$$
{% cite kolodrubetz2013 --file refs_geometric_control %}. TOMKA and GEOM both lean on
this, and they are entitled to.

{: #result-fubini-study-metric }

Notice what $$g$$ is _not_. The gap appears squared, once per level, **inside** the sum.
The numerator is projected onto the ground state. Both of those choices will turn out to
matter more than the overall power.

<div class="sec-divider" aria-hidden="true">•••</div>

## 3 · The four metrics, in one notation

Here is the whole disagreement on one page.

<div class="wide-table" markdown="1">

| framework                    | metric $$G_{\mu\nu}$$                                                                                            | numerator                             | gap power | gap inside the sum? | which gap    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------- | --------- | ------------------- | ------------ |
| **TOMKA**, **GEOM**          | $$\mathrm{Re}\sum_{n\neq0} \overline{M^n_\mu} M^n_\nu / \Delta_n^{2}$$                                           | projected matrix element, squared     | 2         | yes                 | per level    |
| **HYPER** $$(\alpha,\beta)$$ | $$\mathrm{Re}\sum_{n\neq0} \big(\overline{M^n_\mu}\big)^{\beta/2}\big(M^n_\nu\big)^{\beta/2}/\Delta_n^{\alpha}$$ | projected matrix element, power β     | α         | yes                 | per level    |
| **HYPER**, FAQUAD row        | $$\mathrm{Re}\sum_{n\neq0} \overline{M^n_\mu} M^n_\nu / \Delta_n^{4}$$                                           | projected matrix element, squared     | 4         | yes                 | per level    |
| **QAB**                      | $$\mathrm{Tr}\big[\partial_\mu H\, \partial_\nu H\big] / \Delta^{4}$$                                            | **full trace** — no projection at all | 4         | **no**              | smallest gap |

</div>

HYPER's $$(\alpha,\beta)$$ row is the organizing one, so it is worth stating separately what
it does and does not buy:

<div class="key-eq" markdown="1">

The **$$(\alpha,\beta)$$-hypergeometries** put the gap power $$\alpha$$ and the
matrix-element power $$\beta$$ on independent axes. But for a **single** control the
constant-speed condition $$\sqrt{G}\,\dot u = \delta$$ absorbs everything except the
combination

$$
n_+ = \tfrac{1}{2}(\alpha + \beta) ,
$$

so the two-parameter family collapses to a **one-parameter family of pulse shapes**. This
is HYPER's own result and it is the sharp one.

</div>

{: #result-alpha-beta-hypergeometry }

The GEOM/TOMKA row is $$(\alpha,\beta) = (2,2)$$ in HYPER's labels, with $$n_+ = 2$$; FAQUAD
is $$(4,2)$$, $$n_+ = 3$$; a linear ramp is $$(0,0)$$. HYPER's table also has a row it calls
"local adiabaticity",
$$(2\alpha_{\mathrm{LA}}, 0)$$ — a constant numerator over a power of the gap, which is
Roland and Cerf's original condition for the adiabatic Grover algorithm
{% cite roland2002 --file refs_geometric_control %}. Remember that row; §5 puts QAB in it.

For a **two-level system** — which, as §4 will show, is where nearly all the analytic
content of all four papers lives — there is only one excited state, the sums collapse, and
the line elements become

$$
ds_{(2,2)} = \frac{\lvert \langle 1 \rvert dH \lvert 0 \rangle \rvert}{\Delta},
\qquad
ds_{(4,2)} = \frac{\lvert \langle 1 \rvert dH \lvert 0 \rangle \rvert}{\Delta^{2}},
\qquad
ds_{\mathrm{QAB}} = \frac{\lVert dH \rVert_{\mathrm{HS}}}{\Delta^{2}} .
$$

Comparing the first two gives an identity worth boxing, because it is exact and it explains
most of what follows:

<div class="key-eq" markdown="1">

$$
ds_{(4,2)} \;=\; \frac{ds_{\mathrm{FS}}}{\Delta} .
$$

**The FAQUAD length is the Fubini–Study length weighted by the inverse gap.** The two
functionals agree — and therefore select the same routes — if and only if the gap is
constant along the route.

</div>

That is the cleanest statement of the difference between the two literatures, and neither
literature contains it. It also tells you immediately what an unweighted Fubini–Study
geodesic is blind to, which §6 makes quantitative.

<div class="learn-more-box" markdown="0">
{% details Where FAQUAD comes from, and why it is $(4,2)$ and not something else %}
The practical adiabatic criterion says the drive is safe when

$$
\frac{\lvert \langle 1 \rvert \partial_t H \lvert 0 \rangle \rvert}{\Delta^2} \ll 1 .
$$

The **local adiabaticity** idea — Roland and Cerf's
{% cite roland2002 --file refs_geometric_control %}, later generalized as _fast
quasi-adiabatic dynamics_, FAQUAD, by Martínez-Garaot and co-workers
{% cite martinezgaraot2015 --file refs_geometric_control %} — is to stop asking for this
quantity to be small _somewhere_ and instead hold it **constant everywhere**:

$$
\frac{\lvert \langle 1 \rvert \partial_u H \lvert 0 \rangle \rvert}{\Delta^2}\, \dot u
= \text{const} .
$$

{: #result-local-adiabaticity }

The reasoning is a budget argument. You have a fixed total time; the adiabaticity parameter
is your local risk of excitation; you should spread the risk evenly rather than let one
region dominate. Squaring the left-hand side identifies the implied metric as
$$\lvert M \rvert^2/\Delta^4$$, which is $$(\alpha,\beta) = (4,2)$$.

Note that this is a _heuristic_, and an honest one — nothing says the excitation amplitude
budget is best spent uniformly, and §7 shows a regime where it is not.
{% enddetails %}

</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## 4 · What these papers actually study

The formalisms above are stated covariantly, for arbitrary Hilbert-space dimension and
arbitrary numbers of controls. The question this section asks is what they have been
_exercised_ on. Every worked example in all four papers is below: the Hilbert-space
dimension actually retained, whether more than one control is genuinely varied, and whether
what gets optimized is a path or a schedule.

<div class="wide-table" markdown="1">

| #   | paper | system                                                                               | levels retained                                                                                                           | interacting / extended?                                         | controls              | >1 varied?                                                                        | path or schedule                                                                                                      | analytic?                           |
| --- | ----- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 1   | QAB   | adiabatic Grover search, $$H = u^1 P_a^\perp + u^2 P_b^\perp$$                       | Hilbert space $$N=2^n$$, $$n \le 6$$; **dynamics in a 2-d subspace** $$\mathrm{span}\{\lvert a\rangle,\lvert m\rangle\}$$ | no interactions; an oracle model, not a many-body one           | 2                     | **yes**                                                                           | **path**                                                                                                              | yes, under a 1-d constraint         |
| 2   | QAB   | same, 4-parameter $$H \propto u^1\mathbb{1}+u^2X+u^3Y+u^4Z$$                         | $$n=1$$: literally 2                                                                                                      | no                                                              | 4                     | **yes**                                                                           | **path**                                                                                                              | numerical                           |
| 3   | QAB   | linear systems $$Ay=a$$, Toeplitz $$A$$                                              | reduces to the same 2-d subspace                                                                                          | no                                                              | 2, 4                  | **yes**                                                                           | **path**, claimed by analogy                                                                                          | by analogy only; no numerics        |
| 4   | TOMKA | Landau–Zener, drive $$x$$ at fixed detuning                                          | 2                                                                                                                         | no                                                              | 2                     | no — one held fixed                                                               | **schedule**                                                                                                          | yes                                 |
| 5   | TOMKA | Landau–Zener, drive $$(x,\epsilon) \to (\Omega,\theta)$$                             | 2                                                                                                                         | no                                                              | 2                     | **yes**                                                                           | **path** — but the metric is degenerate, and TOMKA says so                                                            | yes                                 |
| 6   | TOMKA | anisotropic XY chain, $$N=900$$, drive $$\gamma$$ through the anisotropic transition | full many-body; free-fermion solvable after Jordan–Wigner                                                                 | **extended and critical**; quadratic in fermions                | 3 ($$\gamma,h,\phi$$) | no — $$h,\phi$$ held fixed                                                        | **schedule**                                                                                                          | metric analytic, dynamics numerical |
| 7   | TOMKA | same chain, drive $$(\gamma,\phi)$$ around the critical point                        | as above                                                                                                                  | as above                                                        | 3                     | **yes** (2 of 3)                                                                  | **path** — great circle on a sphere                                                                                   | yes, geodesic analytic              |
| 8   | GEOM  | generic qubit $$H_{\text{Pauli}}$$ in $$(\rho,\phi,z)$$                              | 2                                                                                                                         | no                                                              | 3 nominal             | no — conformal invariance and $$\phi$$-independence reduce it to $$\theta$$ alone | **schedule**                                                                                                          | yes: $$\theta$$ linear in $$t$$     |
| 9   | GEOM  | double quantum dot, truncated 2-level model of a $$6\times6$$                        | 2                                                                                                                         | microscopically Fermi–Hubbard, then truncated; **not extended** | 1 ($$\varepsilon$$)   | no                                                                                | **schedule**                                                                                                          | numerical                           |
| 10  | GEOM  | same DQD, three-level model $$\{S(2,0),S(1,1),T_0(1,1)\}$$                           | 3                                                                                                                         | as above                                                        | 1                     | no                                                                                | **schedule**                                                                                                          | numerical                           |
| 11  | GEOM  | same DQD, Schrieffer–Wolff effective $$2\times2$$                                    | 2                                                                                                                         | as above                                                        | 1                     | no                                                                                | **schedule**                                                                                                          | yes, closed-form ODE                |
| 12  | GEOM  | full $$6\times6$$ DQD                                                                | 6, for spectra and final fidelities                                                                                       | as above                                                        | 1                     | no                                                                                | **schedule**                                                                                                          | numerical                           |
| 13  | HYPER | generic qubit on the "hyper-Bloch sphere" $$(\theta,\phi)$$                          | 2                                                                                                                         | no                                                              | 2                     | lengths and volumes only                                                          | neither — no endpoint problem is posed                                                                                | yes                                 |
| 14  | HYPER | Landau–Zener, $$H = z(t)\,Z + x\,X$$                                                 | 2                                                                                                                         | no                                                              | 1                     | no                                                                                | **schedule**                                                                                                          | yes, ${}_2F_1$ closed form          |
| 15  | HYPER | Λ-system, three levels                                                               | 3                                                                                                                         | no                                                              | 1                     | no                                                                                | **schedule**, and the pulse is _reconstructed_ from two-level pulses rather than computed from the three-level metric | numerical                           |
| 16  | HYPER | tight-binding chain $$\sum_j t_j(c_j^\dagger c_{j+1}+\text{h.c.})$$                  | number conservation splits it into 2-level blocks                                                                         | free fermions                                                   | $$\{t_j\}$$           | no                                                                                | **schedule**                                                                                                          | analytic within each block          |
| 17  | HYPER | anisotropic transverse-field Ising model                                             | quoted as decomposing into Bloch-sphere product states                                                                    | extended, free-fermion solvable                                 | —                     | —                                                                                 | **no protocol is computed**                                                                                           | illustrative remark only            |
| 18  | HYPER | spin shuttling with valley splitting                                                 | 4 (orbital ⊗ valley)                                                                                                      | no                                                              | 1 ($$\varepsilon$$)   | no                                                                                | **schedule**                                                                                                          | numerical                           |
| 19  | HYPER | periodic-LZ and all-to-all $$N$$-level models                                        | up to large $$N$$                                                                                                         | no                                                              | 1                     | no                                                                                | run-time benchmarking only                                                                                            | numerical                           |

</div>

Four things fall out of that table, and I want to state them without decoration.

**Every analytic result in GEOM and HYPER is two-level.** Rows 8, 11, 13 and 14 are the
analytic content of those two papers, and all four are qubits. Everything above two levels
in either paper is numerics — rows 9, 10, 12, 15, 18 — and in row 15 the multi-level pulse
is not even computed from the multi-level metric; it is a least-squares reconstruction out
of two-level pulses.

**Only one example in all four papers is a genuinely extended many-body system**, and it is
TOMKA's XY chain (rows 6 and 7), which is free-fermion solvable. There is no interacting,
thermodynamic-limit example anywhere in the four papers. "Generalizes to any multi-level
Hamiltonian" is a statement about the formula, not about anything demonstrated.

**Only QAB and TOMKA ever optimize a route.** Rows 1, 2, 3, 5 and 7. GEOM and HYPER never
do — not once, in either the arXiv or the published version of GEOM, and HYPER says so
explicitly at the head of its Section III: _"In experimental settings, the ability to
control multiple parameters simultaneously requires a lot of fine-tuning. Therefore, we aim
to study in-depth the optimal control of a single parameter."_ Which is a perfectly
reasonable engineering decision, and is also the whole of the geometry quietly leaving the
building.

**And nowhere in the four papers is a route optimized in a system with more than two levels
participating.** Even QAB's Grover example, which is the most genuinely multi-parameter
piece of work here, is dynamically a two-level problem in a $$2^n$$-dimensional dress —
QAB says so itself.

<p class="thread-note"><span class="thread-label">Reading this fairly</span> None of the
above says the frameworks are wrong. It says the demonstrated reach is two-level, one
control, plus two exceptions. The gap between the covariant formalism and the exercised
formalism is roughly the whole subject.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 5 · One principle, and where QAB really sits

Strip the four papers to their variational content and the same three lines appear each
time. Fix a tolerance $$\delta$$. Demand constant speed, $$G_{\mu\nu}\dot u^\mu \dot u^\nu
= \delta^2$$. Then the total time is

<div class="key-eq" markdown="1">

$$
t_f \;=\; \frac{L_G[\gamma]}{\delta},
\qquad
L_G[\gamma] = \int_\gamma \sqrt{G_{\mu\nu}\, du^\mu du^\nu} ,
$$

and the fastest protocol at fixed tolerance is the **shortest route in $$G$$** — a
geodesic.

</div>

{: #result-geodesic-protocol }

QAB writes it as $$T = \int ds/v_{\mathrm{ad}}$$ with $$v_{\mathrm{ad}} = \delta \Delta^2 /
\lVert \partial_s H\rVert$$; GEOM writes $$\delta = L[\varepsilon]/t_f$$ in its equation
(6); HYPER writes the same in its equation (11); TOMKA maximizes fidelity at fixed $$t_f$$,
which is the same statement read backwards. So the first claim I want to test is confirmed:

<div class="verdict" markdown="1">
<span class="verdict-label">Verified</span> **All four are one variational principle applied
to different metrics.** Fix a tolerance, and protocol time is a path length divided by that
tolerance, with the optimal route the geodesic. The frameworks differ only in $$G$$.

</div>

The interesting question is then just: which $$G$$, and how do they relate?

### QAB is two relaxations of FAQUAD — and that changes its class

QAB's metric has two structural differences from the projected family. Both are
_upper bounds_, and they can be taken one at a time.

**Relax the gaps.** Every $$\Delta_n \ge \Delta_1 = \Delta$$, so replacing each per-level
gap by the smallest one can only increase the metric:

$$
\sum_{n\neq0} \frac{\lvert M^n \rvert^2}{\Delta_n^4}
\;\le\;
\frac{1}{\Delta^4}\sum_{n\neq0} \lvert M^n \rvert^2 .
$$

**Relax the projection.** For any Hermitian $$A = a^\mu \partial_\mu H$$,

$$
\sum_{n\neq0} \lvert \langle n \rvert A \lvert 0 \rangle \rvert^2
= \langle 0 \rvert A^2 \lvert 0 \rangle - \langle 0 \rvert A \lvert 0 \rangle^2
\;\le\; \langle 0 \rvert A^2 \lvert 0 \rangle
\;\le\; \mathrm{Tr}\,[A^2] ,
$$

the last step because $$A^2$$ is positive semi-definite so every diagonal element it
contributes is non-negative. So as quadratic forms,
$$G^{\mathrm{QAB}} \ge G^{(4,2)}$$, and QAB minimizes a looser bound on the same quantity.
(I checked this numerically on random five-level affine models; the margin never goes
negative.)

<div class="verdict" markdown="1">
<span class="verdict-label">Verified as an ordering, misleading as a picture</span>
**QAB is the projected $$(4,2)$$ tensor after two relaxations, and both are upper bounds.**
So the two are not rival theories; they are ordered. But calling them "two rungs of one
ladder" undersells what the second relaxation does — it does not merely loosen the bound, it
moves QAB into a different protocol class, as the next paragraph shows.

</div>

The second relaxation does something the bound language hides. **It deletes the gap
dependence hiding in the numerator.** For a two-level system,
$$\lvert \langle 1 \rvert \partial_z H \lvert 0 \rangle \rvert$$ is not a constant — it
carries its own factor of $$1/\Delta$$ — whereas $$\mathrm{Tr}[\partial_z H\,\partial_z H]$$
is a number. Concretely, for $$H = \tfrac12 (zZ + xX)$$ with gap $$\Delta =
\sqrt{z^2+x^2}$$,

$$
G^{(4,2)}_{zz} = \frac{x^2}{16\,\Delta^6},
\qquad
G^{\mathrm{QAB}}_{zz} = \frac{1}{8\,\Delta^4},
\qquad
g^{\mathrm{FS}}_{zz} = \frac{x^2}{4\,\Delta^4} .
$$

Read the powers. QAB and Fubini–Study both scale as $$\Delta^{-4}$$ and differ by a
constant; FAQUAD scales as $$\Delta^{-6}$$. So:

<div class="verdict" markdown="1">
<span class="verdict-label">Refuted</span> **QAB's $$\Delta^{-4}$$ is not the same gap weight
as FAQUAD's $$(4,2)$$.** Formally the two share $$\alpha = 4$$, and the only difference is
trace-versus-projection in the numerator — but the projected matrix element is not a
constant, it supplies two further powers of $$1/\Delta$$, and the trace throws them away.
Along a one-parameter ramp the two prescribe visibly different pulses.

</div>

Where QAB _does_ land is HYPER's other row. In HYPER's own bookkeeping, the pulse shape for
a single control depends only on $$n_+ = (\alpha+\beta)/2$$, because
$$\sqrt{G}\,\dot u = \delta$$ absorbs everything else. With $$\beta = 0$$ — a constant
numerator — and $$\alpha = 4$$:

<div class="key-eq" markdown="1">

**QAB with affine controls is $$(\alpha,\beta) = (4,0)$$**: HYPER's "local adiabaticity"
row, Roland–Cerf with $$\alpha_{\mathrm{LA}} = 2$$. Its $$n_+ = 2$$ is the _same_ as the
geometric fast-QUAD's $$(2,2)$$, and different from FAQUAD's $$(4,2)$$, which has
$$n_+ = 3$$.

</div>

{: #result-adiabatic-brachistochrone }

This is not a coincidence and QAB half-knew it: its Grover example was built to reproduce
Roland and Cerf's $$O(\sqrt{N})$$ scaling, and it does. The point is that HYPER's unifying
table already contains QAB, under a different name, while its bibliography files QAB under
Pontryagin's maximum principle. §7 confirms the coincidence numerically: on the
Landau–Zener model, QAB's pulse and the geometric fast-QUAD's pulse agree to twelve decimal
places.

### The QAB metric does not know what the eigenvectors are

Suppose the controls enter affinely — $$H = H_\star + u^\mu D_\mu$$ with fixed $$D_\mu$$,
which is the case for every Hamiltonian in all four papers, and for essentially every
laboratory control knob. Then $$\partial_\mu H = D_\mu$$, so

$$
\mathrm{Tr}\big[\partial_\mu H\, \partial_\nu H\big] = \mathrm{Tr}\big[D_\mu D_\nu\big]
\equiv C_{\mu\nu} = \text{constant},
\qquad
G^{\mathrm{QAB}}_{\mu\nu} = \frac{C_{\mu\nu}}{\Delta^4(u)} .
$$

QAB states exactly this — "in interaction coordinates, for example, $$g(u) = C/\Delta^4(u)$$"
— and its Christoffel symbols (its equation 5) contain nothing but $$C$$ and derivatives of
$$\Delta$$.

<div class="verdict" markdown="1">
<span class="verdict-label">Verified, with one word withdrawn</span> **For affine controls
the QAB metric is a constant matrix over $$\Delta^4$$, so QAB path selection is geodesy on
the gap landscape.** It holds in QAB's own examples: for Grover, $$C$$ is built from
$$\mathrm{Tr}[P_a^\perp P_b^\perp]$$-type constants; for the 4-parameter case
$$C \propto \delta_{\mu\nu}$$ exactly. The word I would withdraw is "carries no information
about the quantum state at all" — the gap _is_ state information. The precise statement is
that **the eigenvectors drop out entirely**: QAB sees the spectrum and nothing else, and the
metric is conformally flat with conformal factor $$\Delta^{-4}$$.

</div>

That conformal flatness is not a curiosity. It is exactly why QAB can pick a route when the
others cannot, as §7 shows, and it has a pretty consequence: in the two-parameter toy model
the QAB geodesics are computable in closed form by an inversion.

<div class="sec-divider" aria-hidden="true">•••</div>

## 6 · The π/2 problem

Here is the calculation that should give any user of an unweighted metric pause.

Take the archetypal avoided crossing, $$H(z) = \tfrac{1}{2}(zZ + xX)$$ with $$x$$ fixed,
sweeping the detuning $$z$$ from $$-\infty$$ to $$+\infty$$. Writing
$$\Delta = \sqrt{z^2+x^2}$$ and $$\theta = \arctan(x/z)$$ for the Bloch angle, the
Fubini–Study line element is $$ds_{\mathrm{FS}} = \lvert d\theta \rvert /2$$, so

$$
g^{\mathrm{FS}}_{zz} = \frac{x^2}{4(z^2+x^2)^2}
\qquad\Longrightarrow\qquad
L_{\mathrm{FS}} = \int_{-\infty}^{\infty} \frac{x\, dz}{2(z^2+x^2)} = \frac{\pi}{2} .
$$

<div class="key-eq" markdown="1">

$$
L_{\mathrm{FS}}\big[\text{full Landau–Zener sweep}\big] = \frac{\pi}{2},
\qquad \text{for every } x .
$$

</div>

{: #result-landau-zener-arc-length }

The minimum gap cancels. A crossing with a comfortable gap and a crossing that is
nearly a level touching have **identical Fubini–Study length**. The metric diverges like
$$x^{-2}$$ over a region of width $$x$$, and the two effects cancel exactly.

This is not a pathology of the two-level model; it is the boxed identity of §3 doing its
work. $$ds_{(4,2)} = ds_{\mathrm{FS}}/\Delta$$, so the FAQUAD length of the same sweep is
$$\int \lvert d\theta\rvert/(2\Delta) \sim \ln(1/x)$$-ish and diverges as the gap closes,
exactly as it should. Unweighted arc length is the gap-weighted cost with the gap taken out.

### So what does TOMKA's claim mean?

TOMKA reports that geodesic protocols work well "even if one crosses a critical point".
Both statements cannot be generally true — and the resolution is the §1 distinction.

TOMKA's XY-chain result (table row 6) is a **schedule** claim. Along a fixed one-parameter
route, constant Fubini–Study speed _does_ slow you down near the closing gap, because
$$g_{\gamma\gamma} = 1/(16\lvert\gamma\rvert(1+\lvert\gamma\rvert)^2)$$ diverges as
$$\gamma \to 0$$. It beats a linear ramp comfortably, and it beats the optimized power-law
ramp of Barankov and Polkovnikov {% cite barankov2008 --file refs_geometric_control %} too.
None of that is in tension with the $$\pi/2$$: a diverging metric is enough to fix a
schedule even when its _integral_ is finite.

The gap-blindness only bites when you ask the metric to choose between routes — and TOMKA
runs straight into it, and says so. Their two-parameter Landau–Zener example (row 5) has
metric $$(g_{\mu\nu}) = \mathrm{diag}(0,1/4)$$ in $$(\Omega,\theta)$$: **the radial
direction costs nothing**. The route that dives into the small-gap region and the "circular"
route that holds the gap fixed have exactly the same length, and TOMKA writes that they are
"formally equivalent" while noting, correctly, that they are physically nothing alike. That
is the $$\pi/2$$ showing up as a degeneracy of the variational problem rather than as a
number.

<div class="verdict" markdown="1">
<span class="verdict-label">Verified — with a different mechanism than the obvious one</span>
**The structural argument is right and the $$\pi/2$$ is exact.** The contradiction resolves
as schedule-versus-path, not as a hidden condition on the model. One tempting condition —
that the dimensionless field $$\Pi = g\Delta^2$$ is roughly constant in free-fermion critical
models, so that the metric divergence is locked to the vanishing gap — does not hold: for the
XY chain at $$h=0.5$$ the gap closes linearly, $$\Delta \propto \gamma$$, while
$$g_{\gamma\gamma}\sim 1/(16\gamma)$$, so $$\Pi \propto \gamma \to 0$$ at the transition. It
is not constant; it vanishes. And it vanishes in the Landau–Zener model too, where
$$g_{zz}\Delta^2 = x^2/(z^2+x^2)$$ is peaked at the crossing with width $$x$$.

</div>

The honest reading of TOMKA's many-body claim is narrower than the sentence suggests, and
the narrowing is TOMKA's own fault rather than the reader's: the comparison in their Figure 2
is geodesic-versus-linear and geodesic-versus-power-law. A gap-weighted geodesic — their own
metric with one more factor of $$1/\Delta$$ — is never tried.

### And the degeneracy is not an accident of that example

The two-level case is worse than "sometimes degenerate". Write the projected metric as
$$g_{\mu\nu} = \mathrm{Re}\,\overline{M_\mu} M_\nu / \Delta^2$$, where $$M_\mu$$ is now a
single complex vector indexed by the controls. As a real quadratic form on an $$M$$-dimensional
control space, $$\mathrm{Re}\,\overline{M_\mu}M_\nu$$ is built from two real vectors
($$\mathrm{Re}\,M$$ and $$\mathrm{Im}\,M$$) and therefore has **rank at most 2** — and rank
exactly **1** if the controls are real coefficients of Hermitian operators with a real
Hamiltonian, which is the generic laboratory case.

<div class="key-eq" markdown="1">

In a two-level system, every ground-state-projected control metric — $$(2,2)$$, $$(4,2)$$,
every $$(\alpha,\beta)$$ — has rank $$\le 2$$, and rank 1 for real controls. Path selection
in more than one real parameter is **not a hard problem in these frameworks; it is an
ill-posed one.**

</div>

{: #result-projected-metric-degeneracy }

For $$(2,2)$$ the consequence is an infinite tie: every route with the same total
$$\lvert\Delta\theta\rvert$$ is a minimizer. For $$(4,2)$$ it is worse — radial motion is
free, so you can run to infinite gap at zero cost and then sweep, and the infimum of the
length is zero and is not attained. QAB escapes both only because its trace numerator is
full rank. That is the substantive price of the "relaxation" in §5, and it is a price paid
in the right direction.

<div class="sec-divider" aria-hidden="true">•••</div>

## 7 · Letting the Schrödinger equation referee

Everything above is a claim about functionals. The only thing that settles which functional
is _right_ is integrating the actual dynamics. So: one model, two experiments, and no
geometric argument gets to win by assertion.

The model is the smallest one that can discriminate,

<div class="key-eq" markdown="1">

$$
H(z, x) \;=\; \tfrac{1}{2}\big(z\,Z + x\,X\big) ,
\qquad
\Delta = \sqrt{z^2 + x^2} ,
$$

with lowercase $$z$$ the detuning amplitude and lowercase $$x$$ the coupling amplitude,
multiplying the capital Paulis. The gap landscape over the $$(z,x)$$ plane is a cone with
its point at the origin.

</div>

{: #model-two-parameter-landau-zener }

### (a) One control: everyone agrees more than they think

Fix $$x$$, drive $$z$$. Every framework reduces to $$\dot z \propto \Delta^{n_+}$$, and the
schedules are: linear ($$n_+=0$$), Fubini–Study / geometric fast-QUAD ($$n_+=2$$), FAQUAD
($$n_+=3$$) — and QAB, computed independently from
$$\mathrm{Tr}[\partial_z H\,\partial_z H]/\Delta^4$$ with no shortcuts, which lands on
$$n_+=2$$.

{% include figure.liquid path="assets/img/geometric-control/schedules-lz.png" class="img-fluid" alt="Two panels. Left: pulse shapes z(t)/x against t/t_f for three protocols. The linear protocol is a straight line; the Fubini-Study protocol rises steeply at first, flattens through the middle of the sweep, then rises steeply again; the FAQUAD protocol does the same but more extremely. Right: log-log plot of infidelity against total pulse time. The linear protocol decays smoothly and slowly. The Fubini-Study and FAQUAD curves drop far faster and oscillate. A dotted black line computed from the QAB metric lies exactly on top of the Fubini-Study curve everywhere." caption="<strong>(a)</strong> The three distinct pulse shapes; all of them spend most of their time in the small-gap region and hurry through the tails. <strong>(b)</strong> The referee. Between \(t_f \approx 3\) and \(t_f \approx 150\) the geometric protocols beat the linear ramp by three to four orders of magnitude. The dotted black line is QAB, computed from its own Hilbert–Schmidt metric with no shortcuts, and it lies on the Fubini–Study curve to within \(10^{-12}\) in the pulse shape — the \((4,0) \equiv (2,2)\) coincidence of §5, confirmed." %}

Three things in that figure are worth saying out loud.

**QAB and the geometric fast-QUAD are the same protocol here.** Not similar — identical, to
numerical precision. A 2009 paper and a 2025 paper that do not cite each other prescribe the
same pulse for the canonical problem of the field.

**FAQUAD is not uniformly better despite its stronger weighting.** Over most of the range
$$n_+ = 3$$ sits _above_ $$n_+ = 2$$. HYPER finds the same thing — its own scan reports a
minimum infidelity "around $$n_+ \approx 2$$" — which is a small but real embarrassment for
the local-adiabaticity budget argument, and to HYPER's credit it reports it.

**In the deep adiabatic limit the linear ramp wins.** Past $$t_f \sim 200$$ the linear curve
drops below both. This is not a subtlety about metrics; it is the endpoints. The geometric
pulses have near-vertical $$\dot z$$ at $$t=0$$ and $$t=t_f$$, and that switch-on transient
eventually dominates everything the protocol saved in the middle. TOMKA smooth their
protocols for exactly this reason and say so in a footnote; neither GEOM nor HYPER
discusses it. **No geometric length functional in any of the four papers knows anything
about the boundary conditions of its own pulse.**

### (b) Two controls: now the route is an object

Now let both $$z$$ and $$x$$ move. Fix the endpoints at $$(\mp 10, 1)$$ and consider a
family of routes that bow away from the small gap by different amounts — parabolas with
apex coupling $$x$$ at $$z = 0$$. To isolate path selection from schedule selection I hold
the **schedule fixed** across the whole family (constant Fubini–Study speed) and vary only
the route.

{% include figure.liquid path="assets/img/geometric-control/paths-two-parameter.png" class="img-fluid" alt="Two panels. Left: a filled contour map of the gap over the detuning-coupling plane, dark at the origin where the gap closes and bright at the edges, with four parabolic routes drawn across it at different heights, each labelled with an identical Fubini-Study length of 1.4711. A white annotation notes that the exact QAB geodesic runs off the top of the plot to a coupling of 101. Right: log-log plot against apex coupling. A grey curve and a black curve show the true infidelity from the Schrodinger equation with a hard and a smoothed switch-on; both fall steeply and then flatten onto a floor, the smoothed one five orders of magnitude lower. Three coloured curves show predicted lengths: the Fubini-Study length is exactly flat, while the FAQUAD and QAB lengths fall steadily and never flatten." caption="<strong>(a)</strong> Four routes across the gap landscape. Their Fubini–Study lengths are identical to every digit printed — 1.4711, the finite-endpoint version of §6's \(\pi/2\) — while the mid-path gap varies by a factor of twenty. <strong>(b)</strong> What each functional predicts against what the Schrödinger equation does, at fixed \(t_f\) and fixed schedule. Infidelities are averaged over a window of \(t_f\) to smooth the interference fringes; the grey curve uses the constant-speed schedule every one of the four papers prescribes, the black one puts the same arclength profile through a raised cosine so the switch-on transient is removed." %}

Over the range where the anticrossing is the bottleneck, the verdict is unambiguous. **The
Fubini–Study length is exactly constant across the family — spread zero to machine
precision — while the true infidelity falls by a factor of $$2.6 \times 10^5$$.** The
$$(2,2)$$ metric does not merely rank the routes badly; it declines to rank them at all,
exactly as §6's rank argument says it must. FAQUAD and QAB both rank them correctly, and
QAB tracks the true curve slightly the better of the two.

But the figure also catches QAB and FAQUAD failing, in the other direction. The exact QAB
geodesic — which, because the metric is conformally flat with factor $$\Delta^{-4}$$, is a
straight line in the inverted coordinate $$w = 1/(z+ix)$$, and hence an arc of a circle
through the origin — runs out to a coupling of $$101$$, a hundred times the endpoint value.
Unconstrained, "minimize $$\int dl/\Delta^2$$" always says _go where the gap is enormous_,
and there is no term in the functional that knows your amplifier saturates. QAB acknowledges
this and suggests Lagrange multipliers; GEOM's published version repeats the suggestion;
neither carries it out.

And past the point where the detour has raised the mid-path gap comfortably above the
_endpoint_ gap, the true infidelity flattens onto a floor. The bottleneck has moved from the
anticrossing to the switch-on transient, which is route-independent — which is why the floor
sits three orders of magnitude higher for the hard switch-on (grey) than for the smoothed one
(black), and why its position depends on the schedule rather than on the route. QAB and
FAQUAD keep promising improvement that does not arrive. In that regime the Fubini–Study
metric, by predicting nothing, is accidentally right.

<div class="learn-more-box" markdown="0">
{% details The code %}
The full script is at
[`assets/py/geometric-adiabatic-protocols.py`](/assets/py/geometric-adiabatic-protocols.py).
The load-bearing parts:

```python
SX = np.array([[0, 1], [1, 0]], dtype=complex)
SZ = np.array([[1, 0], [0, -1]], dtype=complex)

def hamiltonian(z, x):
    return 0.5 * (z * SZ + x * SX)

def evolve(z_of_t, x_of_t, tf, rtol=1e-10, atol=1e-12):
    """Integrate i psi' = H psi from the initial ground state; return infidelity."""
    psi0, _ = ground_state(z_of_t(0.0), x_of_t(0.0))

    def rhs(t, y):
        psi = y[:2] + 1j * y[2:]
        d = -1j * hamiltonian(z_of_t(t), x_of_t(t)) @ psi
        return np.concatenate([d.real, d.imag])

    y0 = np.concatenate([psi0.real, psi0.imag])
    sol = solve_ivp(rhs, (0.0, tf), y0, rtol=rtol, atol=atol, method="DOP853")
    psi = sol.y[:2, -1] + 1j * sol.y[2:, -1]
    target, _ = ground_state(z_of_t(tf), x_of_t(tf))
    return 1.0 - abs(np.vdot(target, psi)) ** 2
```

The schedules come from inverting $$t(z) = (t_f/I)\int_{-Z}^{z} \Delta^{-n_+} dz'$$, and
QAB's is built from its own metric rather than from $$n_+$$, so that the coincidence in
Figure 1(b) is a result and not an assumption:

```python
def qab_schedule_1d(x, Z, tf, n_grid=20001):
    """QAB schedule built from g_zz = Tr[(dH/dz)^2]/Delta^4, with no shortcuts."""
    z = np.linspace(-Z, Z, n_grid)
    dHdz = 0.5 * SZ
    g = np.trace(dHdz @ dHdz).real / np.hypot(z, x) ** 4
    integrand = np.sqrt(g)                       # ds = sqrt(g_zz) dz ; sqrt(g) zdot = const
    cum = np.concatenate([[0.0], np.cumsum(0.5 * (integrand[1:] + integrand[:-1]) * np.diff(z))])
    return lambda tt: np.interp(tt, tf * cum / cum[-1], z)
```

The three lengths of a discretised route, and the exact QAB geodesic by inversion:

```python
def lengths(z, x):
    d = np.hypot(z, x)
    dtheta = np.abs(np.diff(np.unwrap(np.arctan2(x, z))))
    dmid = 0.5 * (d[1:] + d[:-1])
    dl = np.hypot(np.diff(z), np.diff(x))
    L_fs = np.sum(0.5 * dtheta)                       # |dtheta| / 2
    L_42 = np.sum(0.5 * dtheta / dmid)                # |dtheta| / (2 Delta)
    L_qab = np.sum(dl / (np.sqrt(2.0) * dmid ** 2))   # dl / (sqrt2 Delta^2)
    return L_fs, L_42, L_qab

def qab_geodesic(Z, x0, n=4001):
    zi, zf = -Z + 1j * x0, Z + 1j * x0
    w = 1 / zi + np.linspace(0, 1, n) * (1 / zf - 1 / zi)   # straight line in w = 1/zeta
    zeta = 1 / w
    return zeta.real, zeta.imag
```

The bound chain of §5 is checked as a matrix inequality on random five-level affine models
rather than argued, and the minimum of $$G^{\mathrm{QAB}} - G^{(4,2)}$$ over 300 draws never
goes negative.
{% enddetails %}

</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## 8 · Proved, two-level, heuristic, conjectured

Sorting the content of the four papers into four bins, because the bins are not the same
size and the papers do not always say which one they are writing in.

**Exact.** The quantum geometric tensor is the second-order local infidelity — that is a
definition plus a Taylor expansion, and it is exact
{% cite provost1980 --file refs_geometric_control %}. The identification $$\delta E^2 \approx
g_{\mu\nu}\dot u^\mu\dot u^\nu$$ as the _leading non-adiabatic_ energy variance is a genuine
result of adiabatic perturbation theory {% cite kolodrubetz2013 --file refs_geometric_control %},
and TOMKA states it with the right qualifier. The QAB bound chain of §5 is exact. HYPER's
${}_2F_1$ closed forms for the Landau–Zener pulses, its resonance positions and its
adiabatic-limit infidelity bound are exact — for a two-level system.

**Valid for two levels only.** Everything analytic in GEOM and HYPER, per §4. The
identity $$ds_{(4,2)} = ds_{\mathrm{FS}}/\Delta$$, which is what makes the two literatures
comparable at all, holds only when one excited state dominates; with several levels the
$$(2,2)$$ and $$(4,2)$$ tensors are genuinely different objects and not a scalar reweighting
of each other. HYPER's reduction of everything to $$n_+ = (\alpha+\beta)/2$$ is a
single-control statement.

**Heuristic presented as principle.** QAB is the most honest of the four here: it says
outright that its adiabatic condition is "a heuristic for finding optimal trajectories", that
the ansatz is "by no means unique", and that the real evolution time is not the time
functional and must be computed separately. TOMKA is honest in a different way — it flags
QAB's heuristic status and then makes a fair claim about its own metric's fidelity meaning.
GEOM is where I would push back. Its Appendix A derives the constant-speed condition from
Beltrami's identity and then justifies the conserved quantity by writing that "as we are
considering unitary systems, we have time-reversal symmetry and hence energy conservation".
The Beltrami constant of the geodesic Lagrangian $$G_{\mu\nu}\dot u^\mu \dot u^\nu$$ is an
affine-parametrization invariant; a system with a time-dependent $$H$$ does not conserve
energy, which is precisely why the protocol does work on it. The conclusion — constant speed
— is correct and standard; the stated reason is not the reason.

**Conjecture.** HYPER's minimal-time bound $$T^{(\alpha,\beta)}_{\mathrm{qsl}}$$ is
explicitly labelled a conjecture, and the volume normalization it uses to compare lengths on
manifolds of different geometry is, as far as I can tell, a choice rather than a derivation.
Separately, the $$(\alpha,\beta)$$ object is a well-defined _tensor_ only at $$\alpha=\beta$$
— HYPER says so, noting the conformal weight $$\Omega^{\beta-\alpha}$$ — and
$$\langle m\vert\partial_\mu H\vert n\rangle^{\beta/2}$$ for non-even $$\beta$$ raises a
complex number to a fractional power. The family is best read as what its own analysis shows
it to be: a one-parameter, well-behaved family of _pulse shapes_ indexed by $$n_+$$, wearing
a two-parameter geometric costume.

<div class="sec-divider" aria-hidden="true">•••</div>

## 9 · Which one I would use

<div class="verdict" markdown="1">
<span class="verdict-label">Choosing a schedule along a fixed route</span> Use the
**Fubini–Study metric**, $$(2,2)$$. It is the only one of the four with a derivation rather
than an ansatz behind it, it is the cheapest to evaluate in a multi-level system, and in the
two-level test it beat the more aggressively gap-weighted FAQUAD over most of the useful
range. If your bottleneck is one anticrossing and you have a single knob, this is a solved
problem, and the remaining decisions — smoothing the endpoints, respecting your slew rate —
matter more than the choice of $$\alpha$$ and $$\beta$$.

</div>

<div class="verdict" markdown="1">
<span class="verdict-label">Choosing a route through more than one knob</span> Use **QAB**,
and add the amplitude constraint yourself. It is the only one of the four whose metric is
non-degenerate in a two-level system with real controls, which means it is the only one for
which the question is even well posed. Its cost is that it sees only the spectrum: the
eigenvectors cancel out of an affine model entirely, so it will happily route you through a
region where the gap is large but the drive is stirring exactly the wrong transition. If you
have a system where that can happen — where the matrix-element structure varies independently
of the gap — QAB is the wrong tool, and you should be building the $$(4,2)$$ tensor and
regularizing its radial degeneracy by hand.

</div>

<div class="verdict" markdown="1">
<span class="verdict-label">Where the distinction does not matter</span> Three cases, and
they cover a lot of practice. **One control knob:** there is only one route, everything
reduces to $$n_+$$, and QAB and the geometric fast-QUAD are literally the same protocol.
**Constant gap along the route:** then $$ds_{(4,2)} = ds_{\mathrm{FS}}/\Delta$$ makes the two
proportional, and the Fubini–Study geodesic is exactly right — this is why TOMKA's "circular"
protocol works, and it is a good argument for designing constant-gap routes when the hardware
allows. **Deep adiabatic limit:** once the pulse is long enough that the endpoint transients
dominate, all of the interior shaping is invisible and a linear ramp is as good as anything,
as Figure 1(b) shows past $$t_f \sim 200$$.

</div>

And one thing all four get wrong together. Every metric here is built from the _instantaneous_
spectrum at a point. None of them contains the accumulated dynamical phase
$$\int(E_n - E_0)\,dt$$. But look again at Figure 1(b): the infidelity of the geometric
protocols is not a smooth curve, it is a fringe pattern spanning two orders of magnitude at
fixed $$t_f$$, and those fringes are pure interference between excitation amplitudes picked up
at different times. HYPER computes where the fringes are and treats them as a feature to be
tuned; nobody derives a _length functional_ that sees them. Which leaves the question I would
most like answered: **is there a geometry on control space whose geodesics know about
interference between crossings — or is the whole geometric programme structurally confined to
the envelope, with the factor of a hundred that actually decides your fidelity living
somewhere it cannot reach?**

<div class="sec-divider" aria-hidden="true">•••</div>

## References

The four papers under comparison:

- {% reference rezakhani2009 --file refs_geometric_control %} — QAB. Four pages, and the most
  self-aware of the four about what its own ansatz is worth. Read remarks (i)–(vii) after its
  equation (3); they anticipate most of the objections above.
- {% reference tomka2016 --file refs_geometric_control %} — TOMKA. The one with the cleanest
  physical motivation and the only genuinely many-body example. Still unpublished, which is
  probably why the 2024–25 papers could get away with not engaging with it.
- {% reference venturameinersen2025geom --file refs_geometric_control %} — GEOM. The clearest
  exposition of the constant-speed condition and the most concrete device application. Read
  the published EPJQT version, not the arXiv v1; §3.2 on constraints is new.
- {% reference venturameinersen2025hyper --file refs_geometric_control %} — HYPER. Read
  Table I and Section III first. The $$n_+$$ collapse is the real result and it is a good one.

Background, roughly in the order I would read it:

- {% reference provost1980 --file refs_geometric_control %} — where the quantum geometric
  tensor comes from, in six pages, before anyone wanted to control anything with it.
- {% reference kolodrubetz2017 --file refs_geometric_control %} — the review that makes the
  adiabatic gauge potential the central object. If you read one thing on this list, this.
- {% reference kolodrubetz2013 --file refs_geometric_control %} — the metric-as-energy-variance
  result that TOMKA and GEOM both rely on.
- {% reference roland2002 --file refs_geometric_control %} and
  {% reference martinezgaraot2015 --file refs_geometric_control %} — local adiabaticity and
  FAQUAD, the ancestors of HYPER's $$(4,2)$$ and $$(2\alpha_{\mathrm{LA}},0)$$ rows.
- {% reference bason2012 --file refs_geometric_control %} — local-adiabatic driving actually
  measured, in a BEC in an optical lattice.
- {% reference zanardi2007 --file refs_geometric_control %} — the XY-chain metric TOMKA quotes.
- {% reference nielsen2006 --file refs_geometric_control %} and
  {% reference carlini2006 --file refs_geometric_control %} — the two geometrizations QAB was
  written in response to: circuit complexity as geodesic length, and the non-adiabatic
  quantum brachistochrone.
- {% reference sivak2012 --file refs_geometric_control %} — the classical thermodynamic
  ancestor TOMKA generalizes.
- {% reference jansen2007 --file refs_geometric_control %} — rigorous adiabatic bounds, for
  when you want to know what the heuristic criterion is standing in for.
- {% reference rezakhani2010 --file refs_geometric_control %} — the QAB group's own follow-up
  on the geometry of adiabatic evolution near a critical point.
- {% reference barankov2008 --file refs_geometric_control %} — the optimized power-law ramp
  TOMKA benchmarks against.
- {% reference bukov2019 --file refs_geometric_control %} and
  {% reference chen2022 --file refs_geometric_control %} — geometric speed limits, and the
  paper GEOM points to for the extra power of the gap.
- {% reference gueryodelin2019 --file refs_geometric_control %} — the shortcuts-to-adiabaticity
  review, for the counterdiabatic alternative none of these four take.
  </content>
