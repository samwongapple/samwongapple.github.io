---
layout: post
title: "Trading One Matrix for a Train of Tensors"
date: 2026-07-28 20:00:00-0700
description: Converting a free-fermion state into a matrix product state sounds like a step backwards — until you see what the exchange buys. The eigenvalues that measured entanglement turn out to be a price list.
tags: [tensor-networks, free-fermions, condensed-matter]
categories: [gaussian-tensor-networks]
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
     GAUSSIAN TENSOR-NETWORK THREAD, post C1 (internal label — never printed).
     New category `gaussian-tensor-networks` (registered in blog_threads.yml +
     display_categories). Opens on the free-fermion thread A3's closing hook:
     "why would you convert a Gaussian state into an MPS?"

     THREAD THROUGH-LINE: translation, not surrender — the correlation matrix
     is traded for tensors precisely to buy back what Gaussianity walls off
     (interactions). Recurring corollary: the ζ spectrum is a PRICE LIST —
     pinned modes compress for free, straddling modes cost a factor of 2 each.

     VERIFIED IN NODE before writing (assets/js/mps-compression.js):
      - Schmidt weights from products of (ζ,1−ζ): Σw = 1.0000000000, and
        −Σ w ln w matches Σ binary entropies to 2.6e-12
      - χ(centre, ε=1e-6) vs L: critical δ=0 → 10,12,16,20,21,23,24,26
        (grows); gapped δ=0.4 → 6,6,6,6,6,6,6,6 (saturates)
      - full recompute (N=48 profile + curve) 27 ms → live sliders OK
     FACTS about Liu–Wu–Tu–Xiang 2025 taken from the paper's abstract/page
     (fetched 2026-07-28): mode decimation, ~log2(D) active modes among D
     virtual states, O((log2 D)^3) per tensor, U(1)-FGS focus w/ pairing
     extension, applications = DMRG initialization + anyon eigenbasis /
     entanglement spectra / modular matrices.
     Per no-published-series-roadmaps: end on ONE open question — what
     network geometry fits a scale-invariant state? (→ C2: zipper ER/MERA.)
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — Why leave a perfect description? (~450 words)
     ===================================================================== -->

## 1 · Why leave a perfect description?

The free-fermion thread on this blog ended on a question that sounds like a mistake:
*how do you convert a Gaussian state into a matrix product state?* By the end of
[that thread]({% post_url 2026-07-26-setting-the-matrix-in-motion %}), the correlation
matrix had earned an unbeatable record — entanglement, topology, even volume-law dynamics,
all exact, all cheap. A matrix product state is, by comparison, an approximate,
truncation-managed object that fails at precisely the highly entangled states the
correlation matrix handles without noticing. The trade looks absurd.

Here is why you make it anyway: **the Gaussian world is sealed.** Its power comes from
Wick's theorem, and Wick's theorem comes from the Hamiltonian being quadratic. Add one
interaction term — one $$c^\dagger c^\dagger c\, c$$, a Hubbard $$U$$, anything — and the
whole apparatus fails instantly and completely. There is no "slightly interacting"
correction to bolt on; the state simply stops being determined by its two-point function.
Free fermions are a solvable island, and the interesting problems — the ones a condensed
matter theorist actually loses sleep over — are on the mainland.

The mainland has its own infrastructure. For one-dimensional interacting systems, the
dominant numerical method for over three decades has been the density-matrix
renormalization group {% cite white1992density --file refs_gaussian_tn %}, understood in
modern language as a variational search over **matrix product states**
{% cite schollwock2011density --file refs_gaussian_tn %}. MPSs are the common tongue of
one-dimensional many-body numerics: if your state is an MPS, you can feed it to DMRG as a
starting point, evolve it under an interacting Hamiltonian, measure anything, project it,
perturb it. None of those verbs require Gaussianity.

So the conversion is not a downgrade; it is a **translation across the border**. On the
Gaussian side you compute the state exactly, in the language of one small matrix. Then you
translate it into the interacting world's language — tensors — and *keep going where the
correlation matrix cannot follow*. A mean-field superconductor as the seed for an
interacting calculation; an exactly solvable point as the launchpad for exploring the
solvable-nothing around it. The free-fermion state stops being the answer and becomes the
starting point.

That is the strategic picture. The rest of this post is the mechanics: what the conversion
costs (Section 2 — and we already own the numbers that answer this), how the classic
algorithm works (Section 3), what the state of the art looks like (Section 5), and a live
calculation to build intuition on (Section 4).

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — The price list (~550 words + MPS SVG + box)
     ===================================================================== -->

## 2 · The price tag, in a currency we already own

A matrix product state stores a many-body wavefunction as a train of small tensors, one
per site, each connected to its neighbours by a **bond**:

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 460 150" width="460" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A matrix product state drawn as a train of tensors joined by bonds, with an entanglement cut through one bond">
    <!-- bonds -->
    <g stroke="currentColor" stroke-width="1.6" stroke-opacity="0.6">
      <line x1="66" y1="62" x2="106" y2="62"/>
      <line x1="126" y1="62" x2="166" y2="62"/>
      <line x1="186" y1="62" x2="226" y2="62"/>
      <line x1="246" y1="62" x2="286" y2="62"/>
      <line x1="306" y1="62" x2="346" y2="62"/>
      <line x1="366" y1="62" x2="406" y2="62"/>
    </g>
    <!-- physical legs -->
    <g stroke="currentColor" stroke-width="1.4" stroke-opacity="0.5">
      <line x1="56" y1="72" x2="56" y2="96"/>
      <line x1="116" y1="72" x2="116" y2="96"/>
      <line x1="176" y1="72" x2="176" y2="96"/>
      <line x1="236" y1="72" x2="236" y2="96"/>
      <line x1="296" y1="72" x2="296" y2="96"/>
      <line x1="356" y1="72" x2="356" y2="96"/>
      <line x1="416" y1="72" x2="416" y2="96"/>
    </g>
    <!-- tensors -->
    <g fill="var(--global-theme-color)" fill-opacity="0.18" stroke="var(--global-theme-color)" stroke-width="1.5">
      <rect x="46" y="52" width="20" height="20" rx="5"/>
      <rect x="106" y="52" width="20" height="20" rx="5"/>
      <rect x="166" y="52" width="20" height="20" rx="5"/>
      <rect x="226" y="52" width="20" height="20" rx="5"/>
      <rect x="286" y="52" width="20" height="20" rx="5"/>
      <rect x="346" y="52" width="20" height="20" rx="5"/>
      <rect x="406" y="52" width="20" height="20" rx="5"/>
    </g>
    <!-- the cut -->
    <line x1="206" y1="24" x2="206" y2="104" stroke="#b3760a" stroke-width="1.6" stroke-dasharray="5 4"/>
    <!-- labels -->
    <g font-family="system-ui, sans-serif" fill="currentColor">
      <text x="206" y="16" font-size="11" text-anchor="middle" fill="#b3760a">cut</text>
      <text x="206" y="122" font-size="10.5" text-anchor="middle" fill-opacity="0.8">the bond crossing the cut carries χ Schmidt values —</text>
      <text x="206" y="136" font-size="10.5" text-anchor="middle" fill-opacity="0.8">all the entanglement across this cut must fit through it</text>
      <text x="236" y="46" font-size="10" text-anchor="middle" fill-opacity="0.6">tensor</text>
      <text x="266" y="58" font-size="10" text-anchor="middle" fill="var(--global-theme-color)" fill-opacity="0.9">χ</text>
      <text x="435" y="90" font-size="10" text-anchor="middle" fill-opacity="0.6">site</text>
    </g>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:32rem;margin:0.4rem auto 0;">
    An MPS is a train of tensors: one vertical "physical" leg per site, horizontal bonds of
    dimension χ between neighbours. Cutting the train severs exactly one bond, and that bond
    is the bottleneck all the entanglement across the cut must squeeze through.
  </figcaption>
</figure>

The bond dimension $$\chi$$ is the whole economics of the format. Cut the train anywhere:
the Schmidt decomposition of the state across that cut,

$$
\lvert\psi\rangle = \sum_{\alpha=1}^{\chi} \lambda_\alpha\,
\lvert \phi_\alpha^A \rangle \otimes \lvert \phi_\alpha^B \rangle ,
$$

can keep at most $$\chi$$ terms — the bond crossing the cut is a literal bottleneck for
Schmidt values. A state is cheap as an MPS when its Schmidt spectrum decays fast, expensive
when it does not, and the *discarded weight* — the summed $$\lambda_\alpha^2$$ of the terms
you drop — is the error you accept.

Here is where this thread gets to cash in everything the free-fermion thread built. For a
Gaussian state, [the reduced density matrix factorizes into independent natural-orbital
modes]({% post_url 2026-07-06-free-fermions-one-matrix %}), each occupied with probability
$$\zeta_k$$ — an eigenvalue of the correlation matrix restricted to one side of the cut. But
the eigenvalues of $$\rho_A$$ *are* the squared Schmidt values. So for a Gaussian state the
Schmidt spectrum is not something new to compute; it is a rearrangement of numbers we
already have:

<div class="key-eq" markdown="1">

$$
\lambda_\alpha^2 \;=\; \prod_{k} \big(\text{either } \zeta_k \text{ or } 1-\zeta_k\big),
$$

</div>

one factor per mode, one Schmidt value per way of making the choices. And now look at the
structure of that product. A **pinned** mode, $$\zeta_k \approx 0$$ or $$1$$, offers one
branch with weight $$\approx 1$$ and one with weight $$\approx 0$$: it multiplies the
number of relevant Schmidt values by one. It is *free*. A **straddling** mode,
$$\zeta_k \approx \tfrac12$$, offers two comparably weighted branches: it *doubles* the
count. With $$m$$ straddling modes at a cut, the bond dimension there is

$$
\chi \;\sim\; 2^{\,m} .
$$

<p class="thread-note"><span class="thread-label">The through-line</span> The ζ spectrum is a price list. The same eigenvalues that measured entanglement in the free-fermion thread now price its compression: pinned modes cost nothing, and every orbital caught straddling the cut doubles the bond dimension.</p>

This is why the conversion is possible at all. In a gapped ground state the straddling
modes are a handful of boundary orbitals no matter how long the chain — so a *fixed,
modest* $$\chi$$ captures the state to any practical accuracy, forever. The area law of the
first free-fermion post was, all along, a statement about MPS-compressibility.

<div class="learn-more-box" markdown="0">
{% details Why the Schmidt values are products — and what "keeping χ of them" discards %}
Across a cut, the reduced density matrix of a Gaussian state factorizes into modes
(derived in the free-fermion thread's first post):

$$
\rho_A = \bigotimes_k \rho_k,
\qquad
\rho_k = \zeta_k\,\lvert 1\rangle\langle 1\rvert + (1-\zeta_k)\,\lvert 0\rangle\langle 0\rvert
$$

in its natural-orbital basis. Eigenvalues of a tensor product are products of eigenvalues,
so every eigenvalue of $$\rho_A$$ — every squared Schmidt value — is a product of one choice
of $$\zeta_k$$ or $$1-\zeta_k$$ per mode, and every such product occurs exactly once. (The
associated Schmidt vectors are the occupation states of the natural orbitals, which is why
the construction in the next section builds the MPS out of orbital rotations.)

Truncating to bond dimension $$\chi$$ means keeping the $$\chi$$ largest products and
discarding weight

$$
\epsilon \;=\; 1 - \sum_{\alpha=1}^{\chi} \lambda_\alpha^2 .
$$

The widget in Section 4 does exactly this, by brute force: it enumerates every product above
a floor, sorts them, and counts how many are needed before the discarded weight falls below
your chosen $$\epsilon$$. As a consistency check (run before publishing), the enumerated
weights sum to $$1$$ to ten digits, and $$-\sum_\alpha \lambda_\alpha^2 \ln \lambda_\alpha^2$$
reproduces the binary-entropy formula for $$S_A$$ to $$\sim 10^{-12}$$ — the Schmidt
spectrum and the $$\zeta$$ spectrum really are the same information twice.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — The Fishman–White sweep (~600 words + SVG + box)
     ===================================================================== -->

## 3 · The classic construction: disentangle, don't transcribe

Knowing the price is not the same as writing down the tensors. The obvious route — compute
Schmidt vectors cut by cut and assemble tensors from them — works, but the elegant route,
due to Fishman and White {% cite fishman2015compression --file refs_gaussian_tn %}, inverts
the problem: **instead of describing the entangled state, find the circuit that
disentangles it.**

The algorithm is a sweep. Sit at the left end of the chain and look at the correlation
matrix restricted to a small window of $$B$$ contiguous sites. Diagonalize that block and
inspect its eigenvalues. Because the state is gapped (or the window generous), at least one
eigenvalue sits very close to $$0$$ or $$1$$ — a natural orbital, supported inside the
window, that is almost perfectly empty or perfectly full. That orbital is *boring*, and
boring is exploitable: rotate the window's basis so this orbital lives on a single site.
That site is now, to excellent approximation, a frozen $$\lvert 0\rangle$$ or
$$\lvert 1\rangle$$, product-decoupled from everything else. Set it aside, slide the window
one step right, and repeat.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 460 168" width="460" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The Fishman-White sweep: a window slides along the chain, rotating the most pinned orbital onto a single site which is then frozen out">
    <!-- frozen, already-processed sites -->
    <g>
      <circle cx="40" cy="96" r="6" fill="currentColor" opacity="0.25"/>
      <circle cx="76" cy="96" r="6" fill="currentColor" opacity="0.25"/>
      <text x="58" y="126" font-size="10" fill="currentColor" fill-opacity="0.6" text-anchor="middle" font-family="system-ui, sans-serif">frozen</text>
    </g>
    <!-- window -->
    <rect x="100" y="66" width="188" height="60" rx="9" fill="var(--global-theme-color)" fill-opacity="0.10" stroke="var(--global-theme-color)" stroke-width="1.5" stroke-dasharray="6 4"/>
    <text x="194" y="58" font-size="11" font-weight="600" fill="var(--global-theme-color)" text-anchor="middle" font-family="system-ui, sans-serif">window (B sites)</text>
    <!-- window sites -->
    <g fill="var(--global-theme-color)">
      <circle cx="124" cy="96" r="6"/>
      <circle cx="160" cy="96" r="6"/>
      <circle cx="196" cy="96" r="6"/>
      <circle cx="232" cy="96" r="6"/>
      <circle cx="268" cy="96" r="6"/>
    </g>
    <!-- rotation arcs inside window -->
    <g fill="none" stroke="var(--global-theme-color)" stroke-width="1.3" stroke-opacity="0.65">
      <path d="M 124 88 Q 142 70 160 88"/>
      <path d="M 160 88 Q 178 70 196 88"/>
      <path d="M 196 88 Q 214 70 232 88"/>
      <path d="M 232 88 Q 250 70 268 88"/>
    </g>
    <!-- extracted orbital -->
    <circle cx="124" cy="28" r="7" fill="#e0a63a"/>
    <path d="M 124 84 C 118 62 118 48 122 37" fill="none" stroke="#e0a63a" stroke-width="1.5" marker-end="none" stroke-dasharray="3 3"/>
    <text x="140" y="24" font-size="10.5" fill="#b3760a" text-anchor="start" font-family="system-ui, sans-serif">most-pinned orbital, ζ = 0.9997</text>
    <text x="140" y="38" font-size="10.5" fill="#b3760a" text-anchor="start" font-family="system-ui, sans-serif">rotated onto one site → frozen</text>
    <!-- remaining chain -->
    <g fill="currentColor" opacity="0.75">
      <circle cx="316" cy="96" r="6"/>
      <circle cx="352" cy="96" r="6"/>
      <circle cx="388" cy="96" r="6"/>
      <circle cx="424" cy="96" r="6"/>
    </g>
    <!-- sweep arrow -->
    <g stroke="currentColor" stroke-opacity="0.7" fill="currentColor">
      <line x1="300" y1="146" x2="380" y2="146" stroke-width="1.4"/>
      <path d="M 380 141 L 390 146 L 380 151 z" stroke="none" fill-opacity="0.7"/>
      <text x="345" y="162" font-size="10" text-anchor="middle" fill-opacity="0.7" stroke="none" font-family="system-ui, sans-serif">sweep</text>
    </g>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:33rem;margin:0.4rem auto 0;">
    One step of the Fishman–White sweep. Diagonalize the correlation matrix inside the
    window, find the eigenvalue closest to 0 or 1, and rotate that orbital onto a single
    site with a ladder of two-site rotations (arcs). The site decouples; the window slides on.
  </figcaption>
</figure>

Each "rotate onto a single site" is a ladder of **two-site rotations** — Givens rotations,
in numerical-linear-algebra language. By the time the sweep reaches the right end, the
accumulated rotations form a circuit $$U$$ of local gates such that
$$U\lvert\psi\rangle \approx \lvert 0110\cdots\rangle$$: the state has been unwound into a
product state. Now read the equation backwards:

<div class="key-eq" markdown="1">

$$
\lvert\psi\rangle \;\approx\; U^\dagger \,\lvert 0110\cdots\rangle ,
$$

</div>

a product state dressed by a staircase of local unitaries — and a circuit of local gates
applied to a product state *is* a matrix product state, with bond dimension controlled by
the gate pattern. The construction hands you the tensors, the approximation error is the
accumulated distance of each frozen eigenvalue from $$0$$ or $$1$$ (a quantity you monitor
as you go), and the whole thing costs polynomial time. (Readers of this blog's matchgate
thread will recognise the disentangling circuit: every gate in it is Gaussian, so $$U$$ is
precisely a matchgate circuit, run in reverse.)

The subtlety — and the reason this is an algorithm rather than a formula — is the window.
Too small, and no eigenvalue in the block is pinned hard enough; freezing the best
available one injects error. Too large, and the block diagonalizations dominate the cost.
The correlation length sets the natural scale: gapped states have exponentially localized
orbitals, so a window of a few correlation lengths makes the errors negligible. At a
critical point there is no such scale — and you can feel the method starting to strain.

<div class="learn-more-box" markdown="0">
{% details What "rotating an orbital onto a site" means concretely %}
Inside the window, the block of the correlation matrix is a $$B \times B$$ Hermitian
matrix. Its top eigenvector $$v$$ (occupation $$\zeta \approx 1$$, say) is a single-particle
orbital spread over the $$B$$ sites. A Givens rotation $$G(i, i{+}1, \theta)$$ acts on the
pair of sites $$(i, i{+}1)$$ and can zero out one component of $$v$$; applying $$B-1$$ of
them in a ladder concentrates $$v$$ entirely onto one chosen site. Each Givens rotation on
modes lifts to a two-site Gaussian gate on the many-body state — that is the sense in which
the mode-level linear algebra *is* the circuit.

Updating the state is just conjugation of the correlation matrix,
$$C \to G\, C\, G^\dagger$$ — an $$O(B)$$ update touching two rows and columns. After the
ladder, site $$i$$ has $$C_{ii} = \zeta \approx 1$$ and (to error $$1-\zeta$$) no
correlations with anything else; it is dropped from the active problem. The total error of
the final MPS is bounded by the sum of the $$\min(\zeta, 1-\zeta)$$ values frozen along the
sweep, so the algorithm reports its own accuracy. Fishman and White
{% cite fishman2015compression --file refs_gaussian_tn %} give the careful version,
including how the window size trades against the error and how to convert the resulting
circuit into standard MPS tensors.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — Widget (~400 words)
     ===================================================================== -->

## 4 · The price list, live

The widget below makes the economics of Section 2 concrete. It builds the ground state of a
dimerized hopping chain — bond strengths alternating $$1 \pm \delta$$, so $$\delta = 0$$ is
the critical uniform chain and $$\delta > 0$$ is gapped — and computes, for every cut, the
**exact** bond dimension an MPS needs at your chosen truncation error: eigenvalues of the
restricted correlation matrix, Schmidt weights as products of $$(\zeta_k, 1-\zeta_k)$$,
sorted, counted. No entropy heuristics; the actual Schmidt count.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="mps1-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:center;margin-top:0.75rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      dimerization δ
      <input id="mps1-delta" type="range" min="0" max="0.6" step="0.05" value="0">
      <span id="mps1-delta-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">0.00</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      truncation error 10<sup><span id="mps1-eps-val">−6</span></sup>
      <input id="mps1-eps" type="range" min="-8" max="-2" step="1" value="-6">
    </label>
  </div>
</div>

<script src="{{ '/assets/js/mps-compression.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("mps1-mount");
    if (!mount || typeof createMpsCompression !== "function") return;
    var m = createMpsCompression(mount, { N: 48, delta: 0, epsExp: -6 });
    var d = document.getElementById("mps1-delta"), dV = document.getElementById("mps1-delta-val");
    var e = document.getElementById("mps1-eps"), eV = document.getElementById("mps1-eps-val");
    d.addEventListener("input", function () { m.setDelta(d.value); dV.textContent = (+d.value).toFixed(2); });
    e.addEventListener("input", function () { m.setEpsExp(e.value); eV.textContent = "−" + Math.abs(+e.value); });
  })();
</script>

<figcaption style="font-size:0.85rem;opacity:0.8;max-width:34rem;margin:-0.5rem auto 1.5rem;text-align:center;">
  All quantities are computed in the browser from the model. Top: the bond dimension χ
  required at every cut (log scale; amber bar = centre cut). Bottom left: χ at the centre
  cut as the chain grows. Bottom right: the ζ spectrum at the centre cut — the straddling
  (amber) eigenvalues are what you are paying for.
</figcaption>

Play with it in this order. **Start gapped** ($$\delta \approx 0.4$$): the χ profile is
dead flat at a small value, and — the important panel — χ versus chain length is a
horizontal line. You could make this chain a mile long and the MPS would not get one bond
wider. That flat line is the area law wearing its tensor-network costume, and it is why the
conversion of a gapped Gaussian state is essentially free. **Then slide to critical**
($$\delta = 0$$): the profile bulges, the ζ strip fills with amber straddlers, and the
χ-versus-$$L$$ curve starts climbing and does not stop. Tighten the truncation error and the
climb steepens. Nothing diverges violently — the growth is polynomial, this is only a
$$c = 1$$ critical point — but it is *unbounded*, and that is the structural fact to take
away.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — State of the art (~350 words)
     ===================================================================== -->

## 5 · The modern toolchain

The sweep of Section 3 is from 2015, and the intervening decade has industrialised the
border crossing. Two papers are worth understanding in some detail — not as a literature
survey, but because between them they define the strategy this whole thread is building
toward: *stay Gaussian as long as possible, make the border crossing cheap, and cross it
precisely where the interacting physics you want lives.*

**Staying Gaussian longer: Gaussian fermionic MPS.** Schuch and Bauer
{% cite schuch2019matrix --file refs_gaussian_tn %} begin from an observation about where
free-fermion solvers actually live. They are not only used for genuinely free systems —
they sit *inside* the workhorses of interacting physics: every Hartree–Fock iteration,
every mean-field loop, every DFT-like scheme repeatedly solves a quadratic problem, often
with many thousands of modes. At that size even the "cheap" $$O(L^3)$$ dense linear algebra
of the correlation matrix becomes the bottleneck. Their move is to make the MPS idea
operate *natively inside* the Gaussian world: a **Gaussian fermionic MPS**, a train of
tensors in which each tensor is not a generic array of numbers but is itself a small
Gaussian object — described, like everything in this arc, by a correlation matrix. The
state is then compressed twice over, by two *independent* mechanisms: Gaussianity collapses
$$2^L$$ amplitudes to quadratically many correlations, and locality collapses those
quadratically many correlations into a chain of small blocks whose size tracks the
entanglement rather than the system. All the standard MPS operations — canonical forms,
truncation, variational ground-state sweeps — have exact Gaussian counterparts, executed on
correlation matrices instead of tensors. For this thread, that is the crucial conceptual
step: it establishes that "Gaussian state" and "MPS" are not two foreign formats needing a
lossy converter, but two compressions that *compose* — and a Gaussian MPS can be expanded
into an ordinary MPS tensor-by-tensor, whenever you decide to leave.

**Making the crossing cheap — and aiming it.** Liu, Wu, Tu and Xiang
{% cite liu2025efficient --file refs_gaussian_tn %} redesign the conversion itself around
the correlation matrix. In their construction the virtual bond spaces of the MPS are built
from fermionic *modes*, and the key observation is that most of the virtual space is
inert: among $$D$$ virtual basis states, only about $$\log_2 D$$ modes are genuinely
active at any bond — precisely because the underlying state is Gaussian, so its virtual
structure is generated by few-mode data, just as its Schmidt spectrum was generated by a
few $$\zeta_k$$ in Section 2. **Mode decimation** — truncating to the active modes —
collapses the cost per tensor to polynomial in $$\log_2 D$$ rather than in the system
size. Two features matter beyond raw speed. First, the algorithm does not need
translation invariance, but it becomes most powerful for translation-invariant *infinite*
systems, where it produces the tensors of an infinite MPS directly — the thermodynamic
limit, not a finite chain pretending to be one. Second, on an infinite cylinder the
transfer matrix of that iMPS can be diagonalized, and its fixed points used to filter out
the **anyon eigenbasis** — the minimally entangled states of a topologically ordered
phase, from which entanglement spectra and modular data follow. Their benchmark systems
are two chiral spin liquids carrying the topological orders of the bosonic Laughlin and
Moore–Read states.

Read that last sentence again, because it quietly contains the destination. A chiral spin
liquid is not a free-fermion state — it is a strongly interacting, topologically ordered
state of *spins*. The way it enters this story is through a construction we will meet
properly later in this thread: write the spin state as a fermionic mean-field (Gaussian!)
wavefunction, then apply a **Gutzwiller projector** — an on-site projection enforcing one
fermion per site — to land in the physical spin Hilbert space. The projector is the
single non-Gaussian ingredient, and in the correlation-matrix language it is fatal: the
projected state satisfies no Wick theorem, and no correlation matrix describes it. But
look at what it is in the tensor language:

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 470 176" width="470" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pipeline: a quadratic Hamiltonian gives a correlation matrix, converted to an MPS train, then an on-site projector is applied to reach an interacting wavefunction">
    <!-- Gaussian world region -->
    <rect x="8" y="14" width="196" height="118" rx="10" fill="var(--global-theme-color)" fill-opacity="0.07" stroke="var(--global-theme-color)" stroke-opacity="0.4" stroke-width="1"/>
    <text x="106" y="30" font-size="10.5" font-weight="600" fill="var(--global-theme-color)" text-anchor="middle" font-family="system-ui, sans-serif">GAUSSIAN WORLD · exact</text>
    <!-- interacting world region -->
    <rect x="266" y="14" width="196" height="118" rx="10" fill="currentColor" fill-opacity="0.045" stroke="currentColor" stroke-opacity="0.3" stroke-width="1"/>
    <text x="364" y="30" font-size="10.5" font-weight="600" fill="currentColor" fill-opacity="0.75" text-anchor="middle" font-family="system-ui, sans-serif">INTERACTING WORLD</text>

    <!-- Gaussian side contents -->
    <g font-family="system-ui, sans-serif" fill="currentColor">
      <rect x="26" y="44" width="160" height="26" rx="6" fill="var(--global-theme-color)" fill-opacity="0.14" stroke="var(--global-theme-color)" stroke-width="1.2"/>
      <text x="106" y="61" font-size="11" text-anchor="middle">mean-field H → C (or Γ)</text>
      <rect x="26" y="90" width="160" height="26" rx="6" fill="var(--global-theme-color)" fill-opacity="0.14" stroke="var(--global-theme-color)" stroke-width="1.2"/>
      <text x="106" y="107" font-size="11" text-anchor="middle">Gaussian MPS (native ops)</text>
      <line x1="106" y1="70" x2="106" y2="90" stroke="var(--global-theme-color)" stroke-width="1.3" stroke-opacity="0.7"/>
    </g>

    <!-- the border crossing -->
    <g font-family="system-ui, sans-serif">
      <line x1="204" y1="103" x2="266" y2="103" stroke="#e0a63a" stroke-width="2"/>
      <path d="M 266 98 L 276 103 L 266 108 z" fill="#e0a63a"/>
      <text x="237" y="93" font-size="10" fill="#b3760a" text-anchor="middle">convert</text>
      <text x="237" y="122" font-size="9.5" fill="#b3760a" text-anchor="middle" font-style="italic">(this post)</text>
    </g>

    <!-- interacting side contents -->
    <g font-family="system-ui, sans-serif" fill="currentColor">
      <rect x="284" y="44" width="160" height="26" rx="6" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.2"/>
      <text x="364" y="61" font-size="11" text-anchor="middle">apply projector P (χ=1 MPO)</text>
      <rect x="284" y="90" width="160" height="26" rx="6" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.2"/>
      <text x="364" y="107" font-size="11" text-anchor="middle">P|ψ⟩: spin liquid as MPS</text>
      <line x1="364" y1="70" x2="364" y2="90" stroke="currentColor" stroke-width="1.3" stroke-opacity="0.5"/>
    </g>

    <!-- downstream -->
    <g font-family="system-ui, sans-serif" fill="currentColor" fill-opacity="0.8">
      <line x1="364" y1="116" x2="364" y2="140" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.5"/>
      <text x="364" y="156" font-size="10.5" text-anchor="middle">DMRG seeds · entanglement spectra · anyon basis</text>
    </g>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:34rem;margin:0.4rem auto 0;">
    The strategy the modern toolchain enables. Everything on the left is exact and cheap;
    the amber arrow is the conversion this post is about; and the first thing waiting on the
    other side is an operation that is impossible in the Gaussian language and nearly free
    in the tensor one.
  </figcaption>
</figure>

The Gutzwiller projector is a product of strictly on-site operators,
$$P = \prod_j p_j$$ — which makes it a matrix product operator of **bond dimension one**.
Applying it to an MPS costs one local multiplication per tensor and does not increase
$$\chi$$ at all. The operation that is *impossible* on one side of the border is the
*cheapest possible operation* on the other side. That single asymmetry is the reason the
conversion problem carries so much weight: the expensive, clever step is getting the
Gaussian state into tensor form, and everything the strategy exists for happens one line
after the crossing. Why one would want a projected fermionic wavefunction in the first
place — partons, spin liquids, and what the projector does to them — deserves its own
telling, and this thread will get there.

<div class="learn-more-box" markdown="0">
{% details Why the projector is fatal for C but free for an MPS %}
**Fatal for the correlation matrix.** The projected state $$P\lvert\psi\rangle$$ of a
Gaussian $$\lvert\psi\rangle$$ is not Gaussian: $$P$$ is a sum of products of number
operators — quartic and higher in fermion operators, not quadratic — so conjugating by it
does not map the family of Gaussian states to itself. Concretely, Wick's theorem fails in
the projected state, so no correlation matrix, of any size, determines its higher
correlators. It is not that $$C$$ becomes a bad approximation; the *format* ceases to
apply.

**Free for the MPS.** An operator of the form $$P = \bigotimes_j p_j$$, with each $$p_j$$
acting on one site, is an MPO of bond dimension $$1$$. Applying it to an MPS with tensors
$$A^{(j)}$$ replaces each tensor by $$p_j A^{(j)}$$ — a multiplication on the physical leg
only. The virtual bonds are untouched: $$\chi$$ before equals $$\chi$$ after, exactly.
(For parton constructions of spin systems there is one wrinkle: each physical spin is
built from *two* fermion species, and $$p_j$$ projects the four-dimensional fermionic site
onto the two-dimensional single-occupancy subspace — so the physical leg shrinks, and the
resulting MPS lives honestly in the spin Hilbert space.)

Two honest caveats. First, cheap to *apply* is not the same as optimal to *keep*: after
projection one typically recompresses the MPS variationally, and the final bond dimension
is whatever the projected state genuinely requires — the empirical miracle, on which the
whole program rests, is that for states like Gutzwiller-projected Fermi seas and chiral
spin liquids this stays manageable. Second, the projected MPS is no longer exact once you
truncate; the Gaussian precision is traded for interacting expressiveness at the border,
which is the entire point of crossing it.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 6 — Closing hook → C2 (ONE open question)
     ===================================================================== -->

## 6 · The wrong shape for a scale-free state

Step back and look at what the widget showed. For gapped states the translation is a solved
problem: fixed χ, controlled error, efficient algorithms — a clean win. The one place the
machinery visibly strains is the critical point, where the bond dimension climbs without
bound as the system grows. It is worth being precise about *why* it strains, because the
reason is not numerical.

A critical ground state is **scale-invariant**: it looks the same at every magnification,
with correlations and entanglement contributed by every length scale from the lattice
spacing up to the system size. An MPS is a train — a strictly one-dimensional arrangement
whose every bond lives at the *same* scale, the lattice scale. Forcing a scale-free state
into a scale-less network means every bond must personally carry the correlations of all
scales at once; the climbing χ in the widget is that mismatch, measured. The failure is
geometric, not algorithmic — no cleverer sweep will flatten that curve.

But geometry can be changed. Nothing says a tensor network must be a train. If the state
has structure at every scale, the natural network would have *layers* — a direction in
which you zoom out, coarse-graining the state scale by scale, with each layer only
responsible for the physics at its own magnification. What does entanglement
renormalization look like when the state being renormalized is a free-fermion state — when
every layer of the zoom is, once again, just a rotation of one matrix? That is the next
post.

<div class="sec-divider" aria-hidden="true">•••</div>

## References

{% bibliography --file refs_gaussian_tn --cited --group_by none %}

---

> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
