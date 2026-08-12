---
layout: post
title: "Poles, Residues, and Everything Else: What a Green's Function Knows"
date: 2026-08-08 04:00:00-0700
description: "The first object of this tradition is not the state — it is the resolvent (z − H)⁻¹, whose poles are energies, whose residues are overlaps, and whose exact moments are the certificates every later approximation will be held to. What it knows, how it knows it, and why one carrier in an empty band makes the whole real-frequency program exact."
tags: [greens-functions, spectral-functions, condensed-matter]
categories: [dressed-particles]
related_posts: false
provides_planned: [resolvent, lehmann-representation, spectral-function, retarded-greens-function, spectral-sum-rules, self-energy]
requires: [second-quantization]
uses: [matrix-product-states]
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
     THREAD: "Dressed particles" — Post P1 of 7 (arc internal, never
     published as a roadmap; each post ends on ONE open question).
     P1 (this) → P2 continued fractions → P3 polaron/Lang–Firsov →
     P4 momentum average → P5 few-particle GFs → P6 matrix Σ → P7 2eARPES.
     Planning doc (unpublished, docs/ is build-excluded):
     docs/berciu-series-roadmap.md v3.

     ROLE: the thread's formalism foundation. Owns the resolvent, Lehmann,
     the spectral function, time orderings, sum rules, and Σ-via-Dyson.
     Everything downstream links here instead of re-deriving.

     THROUGH-LINE (thread-note near top): EVERY QUESTION YOU CAN ASK IS A
     MATRIX ELEMENT OF ONE OPERATOR — AND AN APPROXIMATION IS A CHOICE OF
     WHICH CONFIGURATIONS THAT OPERATOR IS INVERTED OVER.

     SPINE REFERENCES: Economou ch. 1–3 [economou2006greens]; Mahan ch. 3
     for time orderings [mahan2000many]; Goodvin–Berciu–Sawatzky
     [goodvin2006greens] for the sum-rule program (cited forward from S5).

     TARGET: ~2800–3600 words + collapsible derivation boxes.
     Anchors to place when prose lands:
       model-resolvent            (S2, .key-eq on the definition)
       result-lehmann-representation + derivation-lehmann-representation (S2)
       result-spectral-function   (S2/S3 boundary, .key-eq)
       result-retarded-greens-function (S4)
       result-spectral-sum-rules + derivation-spectral-sum-rules (S5, .key-eq)
       result-self-energy         (S6, .key-eq on Dyson-as-definition)

     NOTATION (CONTRIBUTING §4 + roadmap §2 — checked at scaffold time):
       - z is the COMPLEX ENERGY. Scope in prose at first use (geometric-
         control uses lowercase z as a control amplitude; no shared context,
         but say "complex energy" the first time and move on).
       - k is a MOMENTUM index here, same family as the free-fermion
         thread — no scoping needed, but A(k,ω) is a new canonical glyph.
       - η spectral broadening; always state its value in examples/widget.
       - NEVER U for a unitary anywhere in this thread (W if needed;
         V reserved for the P2 impurity potential).
       - Σ self-energy (dyson-equation id folded into self-energy —
         decision recorded in concepts.yml comment).
       - Kronecker delta always with explicit indices δ_{αβ}.
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — Why invert what you cannot diagonalize (~400 words,
     minimal math; APPROVED 2026-08-08, sandwich equation made explicit
     after review)
     - Open on the physical question: inject one electron at site j into
       an empty band, ask for the amplitude at site i and energy ω. Note
       what the question does NOT ask for (the spectrum).
     - Diagonalization is global, the question is local. The resolvent's
       defining identity turns local questions into closable linear
       relations — the promise P2 cashes.
     - The empty-band setting: one carrier, T = 0 ⇒ no Fermi sea, no
       thermal average. The heavy field-theory machinery exists to handle
       a filled sea; this program's setting never has one. Photoemission
       makes ONE hole — the object is what the experiment reports.
     - Thread-note: the through-line, stated once.
     ===================================================================== -->

## 1 · Why invert what you cannot diagonalize

Take a single electron, put it in an empty band on a lattice that goes on forever, and ask
the most physical question available: if I inject it at site $$j$$, with what amplitude do I
find it at site $$i$$, at energy $$\omega$$?

Notice what the question does _not_ ask for. It does not ask for the eigenvalues of the
Hamiltonian, and it does not ask for the eigenvectors. Diagonalization is a _global_
operation — it wants every eigenpair of an infinite matrix at once, almost all of which you
will never use. The question above is _local_: one number, indexed by two sites and an
energy. The whole strategy of this thread is to compute such numbers directly, and the
operator whose matrix elements they are is the **resolvent**,

$$
\hat{G}(z) = (z - H)^{-1},
$$

where $$z$$ is a complex energy — throughout this thread $$z$$ always means the resolvent's
argument, and its imaginary part turns out to do real physics (§3). You cannot diagonalize
an infinite matrix. But you do not need to invert one either, not all of it. Take the
defining identity $$(z - H)\hat{G}(z) = \hat{1}$$ and evaluate its matrix elements between
site states, $$\langle i \rvert \cdots \lvert j \rangle$$:

$$
z\, G_{ij}(z) \;-\; \sum_{l} H_{il}\, G_{lj}(z) \;=\; \delta_{ij}.
$$

When $$H$$ only connects neighbouring sites, this is a linear relation between
$$G_{ij}$$ and the matrix elements one hop away — nothing else enters. Local questions
obey local equations, and local equations can be closed and solved. That is the entire
method; the next post is the machinery that does the closing.

<div class="thread-note">
<span class="thread-label">Through-line</span> Every question you can ask — where the
particle went, what it weighs, what it bound to — is a matrix element of one operator,
$$\hat{G}(z)$$. And every approximation in this thread will be a choice of <em>which
configurations that operator is inverted over</em>.
</div>

One more thing makes this setting special, and it deserves to be said out loud because it
is the reason this thread will need none of the field-theory apparatus that usually
surrounds the words "Green's function." The problems this program cares about have _one
carrier_ (later: two) in an _empty_ band at $$T = 0$$. There is no Fermi sea to integrate
over, no thermal ensemble to average, no filled vacuum to normal-order against. Matsubara
frequencies, imaginary time, analytic continuation — that machinery exists to manage a
macroscopically occupied ground state, and in this setting there isn't one. The resolvent
of the few-body Hamiltonian is not an approximation to the many-body physics; it _is_ the
physics, exactly.

And it is what experiments report. Photoemission removes _one_ electron from a band and
records the energy and momentum it left with — the measured intensity is, up to matrix
elements we will meet much later in the thread, precisely the object this post builds. The
formal machinery and the laboratory observable coincide here to an extent that is rare in
many-body physics, and the whole ARPES half of this series rests on that coincidence.

So: one operator, holding everything. The next section opens it up and inventories what it
knows.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — The resolvent and the Lehmann representation (~550 words
     + box; DRAFTED — awaiting review)
     - Define Ĝ(z) formally; ANCHOR model-resolvent (.key-eq).
     - Insert an eigenbasis resolution: G_{ij}(z) = Σ_n ⟨i|n⟩⟨n|j⟩/(z−E_n).
       Poles = eigenvalues; residues = overlaps. ANCHOR
       result-lehmann-representation.
     - Instantiate IMMEDIATELY on a two-site chain (concrete before
       abstract): 2×2 inversion by hand, two poles, residues as bonding/
       antibonding weights.
     - Define A(k,ω) = −(1/π) Im G(k, ω+iη); ANCHOR result-spectral-function
       (.key-eq). Interpretation: where the particle can go, at what
       energy, with what weight.
     - COLLAPSIBLE BOX (derivation-lehmann-representation): the full
       derivation including the continuum case, and the δ-function limit
       of the Lorentzian as η → 0⁺.
     ===================================================================== -->

## 2 · The resolvent and the Lehmann representation

Time to define the object properly and inventory what it holds. For a Hamiltonian $$H$$
and any complex energy $$z$$ away from the spectrum,

<div id="model-resolvent" class="key-eq" markdown="1">

$$
\hat{G}(z) \;=\; (z - H)^{-1},
\qquad z \in \mathbb{C} \setminus \mathrm{spec}(H).
$$

</div>

Be clear about the geometry, because the phrase "complex energy" invites a misreading:
$$H$$ is Hermitian, so its spectrum is real — nothing complex ever happens to the
eigenvalues. Excluding the spectrum from $$\mathbb{C}$$ therefore deletes only a piece of
the _real axis_; everywhere else, and in particular everywhere off the axis, $$z - H$$ has
no zero eigenvalue and the inverse exists. So $$z$$ is not an energy the system can have —
it is the vantage point we read the function from. All the physics sits on the real axis,
and the whole game is played just above it: what happens as $$z$$ _approaches_ the
spectrum is where the information sits. To see that, let
$$H\lvert n \rangle = E_n \lvert n \rangle$$. The resolvent is a function of
$$H$$, so it has the same eigenvectors, with eigenvalues $$1/(z - E_n)$$ — and any matrix
element expands as

<div id="result-lehmann-representation" class="key-eq" markdown="1">

$$
G_{\alpha\beta}(z) \;=\; \langle \alpha \rvert \hat{G}(z) \lvert \beta \rangle
\;=\; \sum_n \frac{\langle \alpha \vert n \rangle \langle n \vert \beta \rangle}{z - E_n}.
$$

</div>

This is the **Lehmann representation**, and it is worth reading aloud. $$G_{\alpha\beta}$$
is a function of one complex variable with a _pole at every eigenvalue_ and a _residue
equal to the wavefunction overlaps at that eigenvalue_. Energies sit in the pole
positions; eigenvector data sits in the residues. The resolvent is not a summary of the
spectral problem — it is the spectral problem, repackaged as an analytic function. That is
the "everything else" of this post's title.

Notice also what each matrix element _doesn't_ see: an eigenstate with
$$\langle \alpha \vert n \rangle = 0$$ contributes nothing. Probe the lattice through a
state and you see only the part of the spectrum that state touches — which is not a
defect, it is the mechanism by which local questions get answers of local size.

Concrete before abstract. Two sites, one hopping: $$H = -t\,(\lvert 1 \rangle\langle 2
\rvert + \lvert 2 \rangle\langle 1 \rvert)$$. Then $$z - H$$ is a $$2 \times 2$$ matrix
you invert by hand:

$$
\hat{G}(z) = \frac{1}{z^2 - t^2}
\begin{pmatrix} z & -t \\ -t & z \end{pmatrix}
\quad\Longrightarrow\quad
G_{11}(z) = \frac{1/2}{z + t} + \frac{1/2}{z - t},
\qquad
G_{12}(z) = \frac{1/2}{z + t} - \frac{1/2}{z - t}.
$$

Two poles, at $$\mp t$$: the bonding and antibonding energies, found without ever writing
an eigenvector. The residues of $$G_{11}$$ are $$\tfrac12 = \lvert \langle 1 \vert \pm
\rangle \rvert^2$$ — site 1 holds half of each eigenstate — and they sum to one, because
the particle has to be _somewhere_ in energy (that innocent-looking remark becomes §5's
first sum rule). The off-diagonal element carries the same poles with residues
$$\pm\tfrac12$$: diagonal residues are probabilities, off-diagonal residues keep the
relative phases.

One step remains: experiments live at real energies $$\omega$$, where the poles sit.
Approach the axis from above, $$z = \omega + i\eta$$ with small $$\eta > 0$$, and take
the imaginary part. Each pole contributes
$$-\tfrac{1}{\pi}\,\mathrm{Im}\,\frac{1}{\omega + i\eta - E_n} =
\tfrac{1}{\pi}\,\frac{\eta}{(\omega - E_n)^2 + \eta^2}$$ — a Lorentzian spike of width
$$\eta$$ at the eigenvalue. Weighting each spike by its residue defines the **spectral
function**. In the basis experiments care about — momentum states $$\lvert k \rangle$$ of
a translation-invariant lattice —

<div id="result-spectral-function" class="key-eq" markdown="1">

$$
A(k, \omega) \;=\; -\frac{1}{\pi}\,\mathrm{Im}\, G(k, \omega + i\eta)
\;\xrightarrow{\;\eta \to 0^+\;}\;
\sum_n \big\lvert \langle k \vert n \rangle \big\rvert^2\, \delta(\omega - E_n).
$$

</div>

Read it as a distribution over energy: prepare the particle in $$\lvert k \rangle$$, and
$$A(k,\omega)$$ is where it can go, at what energy, with what weight — non-negative,
normalized, and concentrated on the spectrum. This one function is the thread's main
character: every approximation to come will be judged by the $$A(k,\omega)$$ it produces.

<div class="learn-more-box" markdown="0" id="derivation-lehmann-representation">
{% details Derivation: the Lehmann form, continua, and the η → 0⁺ limit %}

**1 · Discrete spectrum.** For any function $$f$$ defined on the spectrum, the spectral
theorem gives $$f(H) = \sum_n f(E_n)\, \lvert n \rangle\langle n \rvert$$. Apply it to
$$f(x) = (z - x)^{-1}$$, legitimate for any $$z$$ off the spectrum since $$f$$ is then
bounded on it:

$$
\hat{G}(z) = \sum_n \frac{\lvert n \rangle\langle n \rvert}{z - E_n}
\qquad\Longrightarrow\qquad
G_{\alpha\beta}(z) = \sum_n \frac{\langle \alpha \vert n \rangle\langle n \vert \beta \rangle}{z - E_n}.
$$

Near an isolated eigenvalue, $$G_{\alpha\beta}(z) \approx R_n/(z - E_n)$$ with residue
$$R_n = \langle \alpha \vert n \rangle\langle n \vert \beta \rangle$$ — extract it by a
contour integral or by $$R_n = \lim_{z \to E_n}(z - E_n)\,G_{\alpha\beta}(z)$$.

**2 · Continuous spectrum.** On an infinite lattice most of the spectrum is a continuum,
and the sum becomes an integral over it. Collecting the overlap density into
$$\rho_{\alpha\beta}(E) = \sum_\nu \langle \alpha \vert E,\nu \rangle\langle E,\nu \vert
\beta \rangle$$ (with $$\nu$$ labelling degeneracies),

$$
G_{\alpha\beta}(z) = \sum_{n \,\in\, \text{discrete}}
\frac{\langle \alpha \vert n \rangle\langle n \vert \beta \rangle}{z - E_n}
\;+\; \int dE\; \frac{\rho_{\alpha\beta}(E)}{z - E}.
$$

The integral is analytic in $$z$$ everywhere _except_ on the support of
$$\rho_{\alpha\beta}$$, where the two limits $$z \to E \pm i0^+$$ disagree: isolated
eigenvalues give poles, continua give **branch cuts**, and the discontinuity across the
cut is $$G(E + i0^+) - G(E - i0^+) = -2\pi i\, \rho_{\alpha\beta}(E)$$. §3 turns this
distinction into pictures.

**3 · The Lorentzian limit.** For $$z = \omega + i\eta$$,

$$
-\frac{1}{\pi}\,\mathrm{Im}\,\frac{1}{\omega + i\eta - E}
= \frac{1}{\pi}\, \frac{\eta}{(\omega - E)^2 + \eta^2},
$$

a normalized Lorentzian in $$\omega$$: unit area for every $$\eta$$, width $$\eta$$,
height $$1/\pi\eta$$. As $$\eta \to 0^+$$ it concentrates onto $$\delta(\omega - E)$$,
so the diagonal spectral function converges to
$$A_{\alpha}(\omega) = \sum_n \lvert \langle \alpha \vert n \rangle \rvert^2\,
\delta(\omega - E_n) + \rho_{\alpha\alpha}(\omega)$$ — manifestly non-negative, as a
weighted sum of probabilities must be. At finite $$\eta$$ every plot in this thread shows
these Lorentzians, which is why each figure states its $$\eta$$. Standard references:
{% cite economou2006greens %} ch. 1.

{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — Analytic structure: poles, cuts, and what η means
     (~500 words, worked toy)
     - Two-site + continuum toy: a discrete level coupled to a band.
       Isolated pole vs. branch cut in the SAME G; what each looks like
       in A(ω).
     - η as resolution / inverse propagation time; Lorentzian broadening;
       why every numerical plot in this thread states its η.
     - The band edge: square-root singularities as the 1D signature
       (foreshadows P2's closed form, one sentence, no more).
     ===================================================================== -->

## 3 · Poles, cuts, and what η means

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — Time orderings, and the machinery this program skips
     (~600 words — the "Mona's perspective" section, earns its length)
     - Retarded / advanced / time-ordered G defined side by side; G^R as
       response-after-a-kick. ANCHOR result-retarded-greens-function.
     - Why retarded + real frequency + T = 0 is the natural home for the
       few-carrier problem; what a field-theory course builds (Matsubara,
       imaginary time, continuation) and exactly why none of it is needed
       when the band is empty. State the correspondence: for one carrier
       in vacuum, G^R and the time-ordered G coincide for t > 0.
     - Honest boundary: when a Fermi sea IS present (P6–P7 territory),
       which statements survive and which need care.
     ===================================================================== -->

## 4 · Time orderings, and the machinery this program skips

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — Spectral sum rules (~500 words + box)
     - Moments ∫ ωⁿ A(k,ω) dω = ⟨k|Hⁿ|k⟩; derive n = 0 (normalization),
       n = 1 (band center), n = 2 in the body/box split. ANCHOR
       result-spectral-sum-rules (.key-eq) +
       derivation-spectral-sum-rules (box, commutator bookkeeping).
     - The point, stated plainly: these are EXACT identities about an
       object we will spend the whole thread approximating — certificates,
       not curiosities. Flag forward: P3 checks them on an exact spectrum;
       P4 certifies the momentum-average approximation with them.
     - Instantiate n = 0, 1 on the two-site example from S2 (numbers, not
       symbols).
     ===================================================================== -->

## 5 · Sum rules: exact statements about an unknown function

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 6 — Dyson's equation as a definition (~450 words)
     - Split H = H₀ + V; the exact operator identity G = G₀ + G₀ V G.
       Iterate once to show where the series COMES from — then close it:
       Σ defined by G = G₀ + G₀ Σ G, i.e. G⁻¹ = G₀⁻¹ − Σ.
       ANCHOR result-self-energy (.key-eq).
     - "Everything G₀ doesn't know": Σ as the object that upgrades a free
       propagator to the true one. The diagram series is ONE way to
       evaluate Σ, not its meaning — this framing is what makes MA (P4)
       a definition-respecting approximation rather than a truncated
       series.
     ===================================================================== -->

## 6 · Dyson's equation as a definition

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 7 — The variational-space philosophy + truncation callout
     (~350 words + the series' recurring box; QI-reader box lives here)
     - The philosophy, stated once for the whole thread: an approximation
       is a restriction of the Hilbert space in which (z − H) is inverted.
       The error is controlled by which physical configurations were
       excluded — physics, not coupling strength.
     - TRUNCATION CALLOUT BOX (recurring, roadmap §0): compare to bond-
       dimension truncation in MPS — one paragraph, no more. The
       quantitative version of "cheaper when strongly bound" waits for P2.
     - QI-READER BOX: the resolvent vs. the state as the primary object —
       contrast with the correlation-matrix / MPS habit of holding the
       state; here nothing is ever stored but answers.
     - CLOSE on one open question (house rule, no roadmap): the sum rules
       pin every moment of A(k,ω), and moments determine a bounded
       function — so why doesn't knowing all ⟨k|Hⁿ|k⟩ amount to having
       solved the model? (Answer unfolds across P3–P4; here it hangs.)
     ===================================================================== -->

## 7 · What are you truncating?

<!-- (to be written; widget W1 built last, after all prose sections are approved) -->

## References

{% bibliography --file refs_dressed --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
> {: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
