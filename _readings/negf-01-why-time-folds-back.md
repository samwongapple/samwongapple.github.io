---
layout: post
title: "Why time folds back"
date: 2026-08-08 09:00:00-0700
description: First note of the non-equilibrium field theory thread — the closed time contour derived rather than postulated. From ⟨U†ÔU⟩ to Stefanucci–van Leeuwen's contour idea, Kita's S-matrix version of the same fold, the three contours that answer "where did the initial state come from," and why this doubling is exactly the fold the influence-matrix series drew in tensors.
tags: [negf, keldysh-contour]
categories: [negf]
related_posts: false
provides: []
requires: [density-matrix]
uses: [folded-circuit, influence-matrix, feynman-vernon-functional, factorized-initial-state]
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
    --thread-color: #b3760a; /* amber — a 'narrative thread' colour, distinct from the teal accent */
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
  .source-note {
    --source-color: #4a6fa5; /* slate blue — the 'what was read' colour, distinct from amber and teal */
    border-left: 4px solid var(--source-color);
    background: color-mix(in srgb, var(--source-color) 8%, transparent);
    border-radius: 0 6px 6px 0;
    padding: 0.6rem 0.9rem;
    margin: 1.4rem 0;
    font-size: 0.95rem;
  }
  html[data-theme="dark"] .source-note {
    --source-color: #7da3d8;
  }
  .source-note .source-label {
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.09em;
    font-weight: 700;
    color: var(--source-color);
    margin-right: 0.5rem;
  }
</style>

Every treatment of nonequilibrium many-body theory opens with the same strange move: the
time axis gets doubled. A forward copy, a backward copy, and a promise that the bookkeeping
will pay off later. The blog has already met this doubling twice — as the folded circuit in
the [influence-matrix series]({% post_url 2026-07-28-influence-matrix-integrating-out-everything-but-the-question %}),
where it was introduced as a tensor-network device, and implicitly in every density-matrix
evolution. This first note is the prequel those posts skipped: the doubling is not a device
at all. It falls out of the algebra of a single expectation value, before any interaction,
any diagram, or any approximation has been mentioned.

<p class="source-note"><span class="source-label">Read for this note</span> Stefanucci &amp; van Leeuwen (SvL), <em>Nonequilibrium Many-Body Theory of Quantum Systems</em>, 2nd ed., Ch. 3–4 (pp. 79–122) — §3.4–3.5 (currents, Lorentz force) skimmed; §4.5 read for the two-operator case, the full n-point sign machinery deferred to the next note. Kita, <em>Prog. Theor. Phys.</em> <strong>123</strong>, 581 (2010), §2 and the §3 preamble (pp. 585–591) as the interaction-picture mirror of the same derivation.</p>

<p class="thread-note"><span class="thread-label">The through-line</span> An expectation value evolves the ket forward <em>and</em> the bra forward. Read as one trip, that is out-and-back: a contour. Everything in this note — branches, contour ordering, the vertical track — is bookkeeping for that single round trip.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · The contour is derived, not postulated

Start where SvL start {% cite stefanucci2025nonequilibrium --file refs_negf %}: with the
evolution operator for a time-dependent Hamiltonian. Slicing
time and merging exponentials of effectively-commuting operators under the ordering symbol
gives the boxed summary of their Chapter 3 (SvL 3.16):

$$
\hat U(t_2,t_1) \;=\;
\begin{cases}
\; T\!\left\{ e^{-\mathrm{i}\int_{t_1}^{t_2} d\bar t\, \hat H(\bar t)} \right\} & t_2 > t_1 ,\\[6pt]
\; \bar T\!\left\{ e^{+\mathrm{i}\int_{t_2}^{t_1} d\bar t\, \hat H(\bar t)} \right\} & t_2 < t_1 ,
\end{cases}
$$

where $$T$$ is chronological ordering — SvL's "two ls rule": *later goes to the left* — and
$$\bar T$$ is its reverse. Two details worth keeping (SvL flag both explicitly): the ordering
symbols wear no hats because they are rearrangement rules, not operators; and underneath an
ordering symbol, Hamiltonians at different times may be shuffled as if they commuted — that is
the entire point of the symbol.

Now write down the only object we actually care about, the expectation value of an observable
in an evolving pure state, and refuse to hide the bra:

$$
O(t) \;=\; \langle \Psi_0 |\, \hat U(t_0,t)\, \hat O(t)\, \hat U(t,t_0)\, | \Psi_0 \rangle
\;=\; \langle \Psi_0 |\, \bar T\!\left\{ e^{-\mathrm{i}\int_{t}^{t_0} d\bar t\, \hat H} \right\}
\hat O(t)\,
T\!\left\{ e^{-\mathrm{i}\int_{t_0}^{t} d\bar t\, \hat H} \right\} | \Psi_0 \rangle .
$$

This is SvL (4.1), and reading it right to left is the whole story: evolve forward from
$$t_0$$ to $$t$$ under $$T$$, insert the operator, come back under $$\bar T$$. The expectation
value *already is* a round trip. SvL's move is simply to give the trip a name (their 4.3):

$$
\gamma \;=\; (t_0, t) \oplus (t, t_0) \;=\; \gamma_- \oplus \gamma_+ ,
$$

the **forward branch** $$\gamma_-$$ and the **backward branch** $$\gamma_+$$, with contour
points written $$z = t_\mp$$ for "real time $$t$$, sitting on branch $$\gamma_\mp$$." A single
**contour ordering** $$\mathcal T$$ replaces the $$T/\bar T$$ pair: *later on the contour*
means *closer to the endpoint*, so $$\mathcal T$$ acts chronologically on $$\gamma_-$$,
anti-chronologically on $$\gamma_+$$, and puts everything on $$\gamma_+$$ after everything on
$$\gamma_-$$. With that one symbol the expectation value collapses into the master formula for
pure states (SvL 4.10, boxed):

$$
O(z) \;=\; \langle \Psi_0 |\, \mathcal T\!\left\{ e^{-\mathrm{i}\int_\gamma d\bar z\, \hat H(\bar z)}\, \hat O(z) \right\} | \Psi_0 \rangle .
$$

Nothing physical happened between (4.1) and (4.10) — and that is the point. The contour is
the shape the algebra had all along; SvL merely stopped pretending time was a line.

Two immediate consequences, both cheap and both load-bearing later:

**The contour extends to $$+\infty$$ for free.** Stretch both branches past $$t$$ to
$$+\infty$$: the added pieces contribute $$\hat U(t,\infty)\hat U(\infty,t) = \mathbb 1$$ and
nothing changes. This is the placement-freedom micro-check, worth doing once by hand. Put
$$\hat O$$ on the forward branch of the extended contour and unpack $$\mathcal T$$:

$$
\mathcal T\!\left\{ e^{-\mathrm{i}\int_\gamma d\bar z\, \hat H}\, \hat O(t_-) \right\}
= \hat U(t_0,\infty)\, \hat U(\infty,t)\, \hat O(t)\, \hat U(t,t_0)
= \hat U(t_0,t)\, \hat O(t)\, \hat U(t,t_0) ,
$$

and the same collapse happens for $$\hat O(t_+)$$. So $$O(t_-) = O(t_+) = O(t)$$: **the
observable may sit on either branch**, and the extended contour — this is the *Keldysh
contour* — computes the same physics as the minimal one.

**Everything under $$\mathcal T$$ must carry a contour argument.** Even a time-independent
operator needs to know *which branch it sits on*, or $$\mathcal T$$ is ambiguous. SvL press
this twice (their pp. 98, 103), and it is exactly the discipline the folded tensor network
enforces automatically: a leg is either a ket leg or a bra leg, never just "at time $$t$$."

### Kita's version: the same fold in the interaction picture

Kita {% cite kita2010introduction --file refs_negf %} runs the identical argument one
picture over, and it is worth seeing once because his is the form older literature quotes. Split $$\hat H = \hat H_0 + \hat H'$$, define the S-matrix
$$\hat S(t,t_0) = \hat U_0(t_0,t)\hat U(t,t_0)$$ (his 2·10), set $$t_0 = -\infty$$, and
transform the expectation value by inserting $$1 = \hat S^\dagger(\infty,t)\hat S(\infty,t)$$
(his 2·16):

$$
\langle \hat O(t) \rangle
= \langle \Psi(-\infty) |\, \hat S^\dagger(\infty,-\infty)\, \hat S(\infty,t)\, \hat O_I(t)\, \hat S(t,-\infty)\, | \Psi(-\infty) \rangle .
$$

The backward branch enters as $$\hat S^\dagger(\infty,-\infty)$$ — the return leg of the trip
— and the contour-ordered result (his 2·19) is

$$
\langle \hat O(t) \rangle
= \frac{\big\langle \mathcal T\, \hat S_\gamma\, \hat O_I(t) \big\rangle}{\big\langle \hat S_\gamma \big\rangle} ,
\qquad
\hat S_\gamma = \mathcal T \exp\!\Big[ -\mathrm{i} \int_\gamma d\bar z\, \hat H'_I(\bar z) \Big] .
$$

At the pure-state level the denominator is cosmetic — a full round trip satisfies
$$\langle \hat S_\gamma \rangle = 1$$ exactly. It becomes load-bearing one step later (his
3·7), after averaging over an initial density matrix: there the denominator is what cancels
the disconnected diagrams. That cancellation — automatic here, famously delicate in the
zero-temperature formalism — is the first structural payoff of the fold, and Kita's stated
reason for building everything on one contour: one Green's function, defined once, "in exactly
the same way as … the imaginary-time Matsubara contour," rather than a zoo of real-time
functions postulated up front.

## 2 · Conventions: the dictionary

This thread's canonical conventions are SvL's (roadmap §B.2). Kita translates as follows —
fixed here once, used silently afterwards.

| Kita writes | Thread (SvL) convention | Watch out for |
| --- | --- | --- |
| contour $$C$$, branches $$C_1$$ (forward), $$C_2$$ (backward) | $$\gamma = \gamma_- \oplus \gamma_+$$ | Kita's branch labels 1, 2 become superscripts on Green's functions later: $$G^{12} = G^<$$, $$G^{21} = G^>$$ |
| contour time $$t^C$$, point $$1^C = \mathbf r_1 t_1^C$$ | $$z$$, collective $$1 = \mathbf x_1, z_1$$ | SvL's $$\bar z$$ is a dummy integration variable, *not* a complex conjugate (that is $$z^*$$) |
| $$T_C$$, $$\hat S_C$$ | $$\mathcal T$$, $$\hat S_\gamma$$ | both order "later to the left" along the contour |
| $$\hbar$$ explicit, $$-\mathrm i/\hbar$$ prefactors | $$\hbar = 1$$ | silently normalized when quoting Kita here |
| $$t_0 = -\infty$$ always, no vertical track | $$t_0$$ finite; vertical track $$\gamma^{\mathrm M}$$ optional | a physics disagreement, not notation — §3 below |

One in-house rule: this note writes the thermal normalization as
$$\operatorname{Tr} e^{-\beta \hat H^{\mathrm M}}$$ rather than introducing a symbol for the
partition function, since the site reserves that letter elsewhere.

## 3 · Three answers to "where did the state come from"

Everything above assumed a pure state handed to us at $$t_0$$. The real question that splits
the formalisms — and the real content of SvL §4.2–4.3 — is what to do when the initial
condition is a *mixed* state, prepared by physics we did not simulate.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 640 480" width="640" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Three panels. Panel a: a single timeline from t-zero to t with the evolution operator U acting on the ket. Panel b: the timeline folded into a contour, a solid forward branch gamma-minus above carrying the ket and a dashed backward branch gamma-plus below carrying the bra, joined by a turn at time t where the observable sits; the branches extend to plus infinity for free. Panel c: the same contour with a vertical track gamma-M appended at t-zero, descending to t-zero minus i beta and carrying the exponential of minus beta H-M — the Konstantinov-Perel contour.">
    <defs>
      <marker id="ct-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--global-text-color)"/></marker>
      <marker id="ct-arrow-acc" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--global-theme-color)"/></marker>
    </defs>

    <!-- ================= panel (a) ================= -->
    <text x="24" y="34" fill="currentColor" font-size="12" font-family="system-ui, sans-serif" font-weight="600" fill-opacity="0.85">(a) one timeline — the ket&#8217;s story</text>
    <line x1="90" y1="76" x2="470" y2="76" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5" marker-end="url(#ct-arrow)"/>
    <line x1="100" y1="70" x2="100" y2="82" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5"/>
    <text x="100" y="98" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">t&#8320;</text>
    <text x="62" y="80" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">|&#936;&#8320;&#10217;</text>
    <text x="265" y="64" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic" fill-opacity="0.85">U(t, t&#8320;)</text>
    <circle cx="430" cy="76" r="5" fill="var(--global-theme-color)"/>
    <text x="430" y="98" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">t</text>
    <text x="452" y="60" fill="var(--global-theme-color)" font-size="11" font-family="system-ui, sans-serif" font-style="italic">&#212;(t)</text>

    <!-- ================= panel (b) ================= -->
    <text x="24" y="150" fill="currentColor" font-size="12" font-family="system-ui, sans-serif" font-weight="600" fill-opacity="0.85">(b) fold it — the bra evolves too</text>
    <!-- forward branch (ket, solid) -->
    <line x1="100" y1="196" x2="424" y2="196" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.6" marker-end="url(#ct-arrow)"/>
    <text x="250" y="184" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">&#947;&#8331; &#8201;(ket, forward)</text>
    <!-- the turn -->
    <path d="M 430 196 A 14 14 0 0 1 430 224" fill="none" stroke="var(--global-theme-color)" stroke-width="1.8"/>
    <circle cx="444" cy="210" r="5" fill="var(--global-theme-color)"/>
    <text x="456" y="200" fill="var(--global-theme-color)" font-size="11" font-family="system-ui, sans-serif" font-style="italic">&#212;(t) — either branch works</text>
    <!-- backward branch (bra, dashed) -->
    <line x1="430" y1="224" x2="112" y2="224" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#ct-arrow)"/>
    <text x="250" y="244" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">&#947;&#8330; &#8201;(bra, backward)</text>
    <!-- endpoints -->
    <text x="86" y="200" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="end" fill-opacity="0.8">t&#8320;&#8331;</text>
    <text x="86" y="228" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="end" fill-opacity="0.8">t&#8320;&#8330;</text>
    <!-- free extension -->
    <line x1="470" y1="210" x2="560" y2="210" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.2" stroke-dasharray="2 4"/>
    <text x="562" y="214" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" fill-opacity="0.6">&#8594; +&#8734; for free</text>

    <!-- ================= panel (c) ================= -->
    <text x="24" y="300" fill="currentColor" font-size="12" font-family="system-ui, sans-serif" font-weight="600" fill-opacity="0.85">(c) a mixed initial state — append the vertical track</text>
    <!-- forward branch -->
    <line x1="100" y1="344" x2="424" y2="344" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.6" marker-end="url(#ct-arrow)"/>
    <text x="250" y="332" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">&#947;&#8331;</text>
    <!-- turn -->
    <path d="M 430 344 A 14 14 0 0 1 430 372" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.6"/>
    <!-- backward branch -->
    <line x1="430" y1="372" x2="112" y2="372" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#ct-arrow)"/>
    <text x="250" y="392" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">&#947;&#8330;</text>
    <!-- vertical track -->
    <line x1="100" y1="372" x2="100" y2="448" stroke="var(--global-theme-color)" stroke-width="1.8" marker-end="url(#ct-arrow-acc)"/>
    <text x="112" y="416" fill="var(--global-theme-color)" font-size="11" font-family="system-ui, sans-serif">&#947;&#7481; carries &#292;&#7481;: e^(&#8722;&#946;&#292;&#7481;) as evolution</text>
    <text x="100" y="466" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">t&#8320; &#8722; i&#946;</text>
    <text x="470" y="416" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" fill-opacity="0.6">Konstantinov&#8211;Perel&#8217; contour</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:36rem;margin:0.5rem auto 0;">
    The fold, derived in three steps. (a) The expectation value evolves the ket forward.
    (b) The bra evolves too; naming the round trip gives the contour γ = γ₋ ⊕ γ₊, with the
    observable free to sit on either branch and the extension to +∞ free. Solid is the ket
    branch and dashed the bra branch, matching the folded-network convention of the
    influence-matrix series. (c) A mixed initial state written as e^(−βĤᴹ) becomes one more
    stretch of contour evolution: the vertical track γᴹ, hanging from t₀.
  </figcaption>
</figure>

**Answer 1 — the exact one: make the state part of the contour.** Any density matrix can be
*parametrized* thermally (SvL 4.14): pick $$\hat\rho = e^{-\beta \hat H^{\mathrm M}} / \operatorname{Tr} e^{-\beta \hat H^{\mathrm M}}$$,
where $$\hat H^{\mathrm M}$$ is defined by the eigendecomposition of $$\hat\rho$$ — thermal
equilibrium, $$\hat H^{\mathrm M} = \hat H - \mu \hat N$$, is just the special case. Then two
observations do all the work. First, a full round trip is the identity (SvL 4.19),

$$
\mathcal T\!\left\{ e^{-\mathrm{i}\int_\gamma d\bar z\, \hat H(\bar z)} \right\}
= \hat U(t_0,\infty)\, \hat U(\infty,t_0) = \mathbb 1 ,
$$

so it can be inserted into a denominator at no cost. Second,
$$e^{-\beta \hat H^{\mathrm M}}$$ *is an evolution operator* — along any path in the complex
time plane whose endpoints satisfy $$z_b - z_a = -\mathrm i\beta$$. Hang that path off the
end of the backward branch and the ensemble average becomes pure contour bookkeeping
(SvL 4.21, the boxed main result of the chapter):

$$
O(z) \;=\;
\frac{\operatorname{Tr}\big[ \mathcal T\big\{ e^{-\mathrm{i}\int_\gamma d\bar z\, \hat H(\bar z)}\, \hat O(z) \big\} \big]}
     {\operatorname{Tr}\big[ \mathcal T\big\{ e^{-\mathrm{i}\int_\gamma d\bar z\, \hat H(\bar z)} \big\} \big]} ,
\qquad
\gamma = \gamma_- \oplus \gamma_+ \oplus \gamma^{\mathrm M} .
$$

This is the **Konstantinov–Perel' contour** (1960 — four years before Keldysh), and it is
*exact*: initial correlations, interactions in the initial state, everything rides along on
$$\gamma^{\mathrm M}$$. SvL's honesty about it is disarming — a footnote admits that joining
the vertical track to the horizontal branches is "an aesthetically appealing choice" whose
real motivation is deferred to their §5.1, i.e., to Wick's theorem.

**Answer 2 — the traditional one: adiabatic switching.** Assume instead (SvL 4.25) that the
correlated state can be *grown*: start from a noninteracting $$\hat\rho_0$$ at $$t = -\infty$$
and switch the interaction on adiabatically,
$$\hat H_\eta(t) = \hat H_0 + e^{-\eta|t - t_0|}\hat H_{\mathrm{int}}$$. Then the vertical
track carries only $$\hat H_0^{\mathrm M}$$ and the contour is the familiar two-branch
**Keldysh contour** — SvL note that the resulting formula (their 4.27) "is exactly the
formula used by Keldysh in his original paper." The Gell-Mann–Low theorem backs the
assumption, but with teeth showing: it requires $$\beta \to \infty$$ and a nondegenerate
ground state, it delivers an eigenstate that is *not guaranteed to be the ground state*, and
level crossings can break the return trip entirely (their footnote 9 has a two-level
counterexample; Exercise 4.2 shows adiabatic switching can never reach the polarized ground
state of a Hubbard model in a field). "In general the validity of the adiabatic assumption
should be checked case by case."

**Answer 3 — the zero-temperature limit.** Add the assumptions that $$\hat H$$ is
time-independent and $$\beta \to \infty$$, and the contour degenerates further: only a forward
branch survives (SvL's $$\gamma_0$$), which is why the ground-state formalism the blog's
equilibrium posts rely on gets away with a single time axis at the price of denominators and
Gell-Mann–Low caveats. Out of equilibrium there is no such luck: "there is no reason to expect
that by switching on and off the interaction the system goes back to the same state in the
presence of external driving fields."

Kita plants his flag on Answer 2, and his §3 preamble states why with unusual directness: the
vertical-track approach as commonly practiced neglects the initial correlations anyway, while
Keldysh's route "is free from any approximations and, hence, transparent" — initial
correlations can be recovered "by waiting thermalization due to interaction before applying
external fields." He pushes the point further into physics: thermalization happens
*mechanically*, through second-order collision terms, for "the overwhelming majority of
initial conditions" — Boltzmann's answer to the arrow-of-time question, with temperature
emerging rather than being assumed. The disagreement between his contour and SvL's is
therefore not aesthetic. It is a bet on whether pre-thermalization or explicit
initial-correlation bookkeeping is the cleaner path to the same physics — and this thread,
following SvL, keeps the vertical track precisely so that the choice stays visible instead of
being made silently.

One caveat SvL attach to the whole construction, worth carrying forward: the contour
describes a system that was *disconnected from its environment* at $$t_0$$ and evolves in
isolation afterwards. Injected energy has nowhere to dissipate, so results hold for times
short compared to the system–environment relaxation time. The dissipative completion is
exactly the Lindblad ladder waiting at the far end of this thread.

### The fold gets its own Heisenberg picture

The last structural piece of the chapter: define contour evolution
$$\hat U(z_2,z_1)$$ between any two contour points (SvL 4.32) — unitary on the horizontal
branches, *not* unitary on $$\gamma^{\mathrm M}$$, where it becomes
$$e^{-\beta\hat H^{\mathrm M}}$$ itself — and with it a contour Heisenberg picture (SvL 4.38),
$$\hat O_H(z) = \hat U(z_i,z)\, \hat O(z)\, \hat U(z,z_i)$$, whose equation of motion
(SvL 4.39) has *exactly* the same structure as the real-time one. Two traps flagged by SvL and
worth engraving now: on the vertical track, $$\hat\psi_H^\dagger(\mathbf x,z)$$ is **not** the
adjoint of $$\hat\psi_H(\mathbf x,z)$$; and field operators, though "the same" on both
branches (their 4.7), must always carry their contour argument. The reward for this care
arrives at the chapter's end, where cranking the equations of motion through contour-ordered
strings of fields produces a closed hierarchy (SvL 4.64–4.65) in which, in their words, "the
whole structure of diagrammatic perturbation theory is encoded." That hierarchy is the next
note's subject.

## 4 · What this connects to

The influence-matrix series drew this fold before naming it. There, the object was a
discrete-time circuit: a forward copy acting on the ket, a conjugated copy acting on the bra,
stacked so that each site carries a doubled leg of dimension $$d^2$$ — with the site-wide
convention *solid line = ket index, dashed line = bra index*. That is a Trotterized contour,
leg by leg:

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 520 168" width="520" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Left: the contour drawn small, solid forward branch and dashed backward branch joined at a turn. Right: one folded leg of the influence-matrix network, a solid ket line and a dashed bra line side by side passing through a gate. An arrow labelled 'same doubling' connects the two pictures.">
    <defs>
      <marker id="dict-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--global-theme-color)"/></marker>
      <marker id="dict-arrow-n" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--global-text-color)"/></marker>
    </defs>

    <!-- left: mini contour -->
    <line x1="40" y1="66" x2="184" y2="66" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.6" marker-end="url(#dict-arrow-n)"/>
    <path d="M 190 66 A 12 12 0 0 1 190 90" fill="none" stroke="var(--global-theme-color)" stroke-width="1.7"/>
    <line x1="190" y1="90" x2="52" y2="90" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#dict-arrow-n)"/>
    <text x="112" y="54" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">&#947;&#8331; (ket)</text>
    <text x="112" y="110" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">&#947;&#8330; (bra)</text>
    <text x="112" y="140" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.7">continuous time</text>

    <!-- middle arrow -->
    <line x1="228" y1="78" x2="286" y2="78" stroke="var(--global-theme-color)" stroke-width="1.6" marker-end="url(#dict-arrow)"/>
    <text x="257" y="66" fill="var(--global-theme-color)" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">same doubling</text>

    <!-- right: folded leg -->
    <g stroke="currentColor" stroke-opacity="0.75" stroke-width="1.5">
      <line x1="382" y1="26" x2="382" y2="62"/>
      <line x1="382" y1="86" x2="382" y2="126"/>
    </g>
    <g stroke="currentColor" stroke-opacity="0.75" stroke-width="1.5" stroke-dasharray="4 3">
      <line x1="388" y1="26" x2="388" y2="62"/>
      <line x1="388" y1="86" x2="388" y2="126"/>
    </g>
    <rect x="356" y="62" width="60" height="24" rx="6" fill="var(--global-theme-color)" fill-opacity="0.2" stroke="var(--global-theme-color)" stroke-width="1.4"/>
    <text x="386" y="78" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">U &#8855; U*</text>
    <text x="386" y="146" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.7">one folded leg, dimension d&#178;</text>
    <text x="446" y="42" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" fill-opacity="0.7">ket&#8201;+&#8201;bra</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:34rem;margin:0.5rem auto 0;">
    The dictionary. The contour's two branches are the solid-and-dashed pair of the folded
    network: γ₋ is every ket leg, γ₊ every bra leg, and contour ordering is the vertical
    stacking of the circuit. Discrete time steps are Trotter slices of γ.
  </figcaption>
</figure>

Three entries of the dictionary run deeper than the picture:

- **The Feynman–Vernon influence functional lives on this contour.** Its defining data — a
  weight for each *pair* of forward and backward system trajectories — is precisely a
  functional on $$\gamma_- \times \gamma_+$$. The influence-matrix series built it as a
  tensor; Phase II of this thread (Kamenev Ch. 3) will build it by doing the
  bath integral on $$\gamma$$ directly.
- **The factorized initial state is a statement about $$\gamma^{\mathrm M}$$.** The IM
  series flagged $$\hat\rho_0 = \hat\rho_{\mathrm s} \otimes \hat\rho_{\mathrm{bath}}$$ as
  load-bearing: without it the bath never detaches. In contour language, factorization is
  what lets the vertical track be cut where the system–bath boundary is — the IM
  construction quietly assumed away exactly the initial correlations that
  $$\gamma^{\mathrm M}$$ exists to carry. When the IM literature needs a correlated initial
  state, it, too, grows one: evolve first, measure later — which is Kita's
  pre-thermalization move, rediscovered in tensor form.
- **Placement freedom is why folded observables are simple.** $$O(t_-) = O(t_+)$$ is the
  continuum statement of a fact the folded network uses constantly: the operator insertion
  closes the top of the network and may be attached to either index of the doubled leg.

## 5 · What stuck, and what's open

What actually changed in my head: I had filed the doubled time axis as a *formalism* — a
clever representation one adopts. It is not. It is already present in
$$\langle\Psi_0|\hat U^\dagger \hat O \hat U|\Psi_0\rangle$$; every formalism in this
thread's three sources is just a policy for what to hang off the ends of the trip. And the
three contours of the figure are not three formalisms but three *initial-condition
policies* — exact ($$\gamma^{\mathrm M}$$), grown (adiabatic switching), degenerate
(zero-temperature) — which coincide exactly when initial correlations are absent or
irrelevant, and part company otherwise.

The open question to carry into the next note: SvL admit the vertical track's attachment to
the real-time branches is, so far, merely "aesthetically appealing," with the real
motivation deferred to their §5.1 — while Kita claims a wide class of *noninteracting but
nonequilibrium* initial states supports the whole machinery with no vertical track at all
(his Eq. 3·8, Danielewicz's condition — which is, notably, the free-fermion posts' Gaussian
initial state wearing contour clothing). So: **what exactly does Wick's theorem require of
the initial state, and is the vertical track a convenience or a necessity for correlated
initial conditions?** That is the Martin–Schwinger hierarchy's question — next note.

<div class="sec-divider" aria-hidden="true">•••</div>

## References

{% bibliography --file refs_negf --cited --group_by none %}

> ##### ABOUT THIS NOTE
>
> A learning-in-public study note: I write these while working through books and long
> reviews, with **Claude AI** as a collaborator — the reading, the direction, and the
> physics-checking are mine. Notes follow their sources closely and say so where they do.
> Corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
