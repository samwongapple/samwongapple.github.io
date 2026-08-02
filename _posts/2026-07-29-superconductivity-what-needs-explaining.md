---
layout: post
title: "Superconductivity: What Needs Explaining"
date: 2026-07-29 09:00:00-0700
description: Zero resistance is the famous fact and the least constraining one. Before any Hamiltonian, the experiments already tell you the state is a thermodynamic phase, that something is gapped, and that whatever carries the current has charge 2e.
tags: [condensed-matter, superconductivity, phenomenology, magnetism]
categories: [superconductivity]
related_posts: false
provides: [meissner-effect, london-equation, penetration-depth, flux-quantization]
requires: []
uses: []
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
    --thread-color: #b3760a; /* amber — the series' 'narrative thread' colour */
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
    --ledger-color: #b3543f; /* muted brick red — assumptions we owe an account of */
    border-left: 4px solid var(--ledger-color);
    background: color-mix(in srgb, var(--ledger-color) 8%, transparent);
    border-radius: 0 6px 6px 0;
    padding: 0.6rem 0.9rem;
    margin: 1.4rem 0;
    font-size: 0.95rem;
  }
  html[data-theme="dark"] .ledger-note {
    --ledger-color: #e0705a;
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
  .key-eq {
    border: 1.5px solid var(--global-theme-color);
    border-radius: 10px;
    background: color-mix(in srgb, var(--global-theme-color) 6%, transparent);
    padding: 0.4rem 1rem;
    margin: 1.5rem 0;
  }
</style>

In 1911, in Leiden, Heike Kamerlingh Onnes cooled a thread of mercury through 4.2 K and
watched its electrical resistance fall to something he could not distinguish from zero.

That is the fact everybody knows. It is also, of the facts we are about to collect, the one
that constrains the theory least. A good deal of what follows is an argument that zero
resistance is almost beside the point — that the experiments performed between 1911 and 1961
had, between them, already told us the state we were looking for is a genuine thermodynamic
phase, that something in it is gapped, and that whatever carries the supercurrent has charge
$$2e$$. All of that was known before, or independently of, any successful microscopic theory.

I want to spend this whole post on the constraints, because the pleasure of the theory that
eventually arrived is inseparable from how tightly it was boxed in beforehand. So: no
Hamiltonian here. Just the box.

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · Zero resistance is the least interesting fact

Start by taking "zero" seriously, because the experiments do. Wind a ring of superconductor,
set a current circulating in it, and then simply watch. There is nothing to plug in — the
current is its own power supply, and you monitor it by the magnetic field it produces
outside the ring. Experiments of this kind have run for years without a detectable decay.
Turning the null result into a bound on the resistivity puts it below roughly
$$10^{-25}\ \Omega\,\mathrm{m}$$: about seventeen orders of magnitude under copper at room
temperature. Whatever "zero" means here, it is not "small."

So let us give this its due and ask what a hypothetical **perfect conductor** would do. Not a
superconductor — just a normal metal whose resistivity someone has set to zero, with no other
change to its physics. Inside it, Ohm's law $$\mathbf{E} = \rho\,\mathbf{j}$$ with $$\rho = 0$$
forces the electric field to vanish. Faraday's law then says

$$
\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}
\quad\Longrightarrow\quad
\frac{\partial \mathbf{B}}{\partial t} = 0 .
$$

The magnetic field inside a perfect conductor cannot change. Read that again, because it is
not the statement people usually expect. It does not say the field is zero. It says the field
is **stuck** — frozen at whatever value it happened to have at the instant the resistance
vanished.

That has a sharp and testable consequence. A perfect conductor's magnetic state depends on
its _history_. Cool it in zero field and then apply one: no flux gets in, because getting in
would require $$\mathbf{B}$$ to change. Apply the field first and _then_ cool: the flux is
already inside, and it is now trapped there forever. Same final temperature, same final
applied field, two different interiors. A perfect conductor remembers how you got it cold.

<div class="thread-note" markdown="1">
<span class="thread-label">The question</span> Does a superconductor remember? Everything in
this post turns on the answer, and the answer is no.
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## 2 · The field-cooling experiment

The way to settle it is to run both protocols and compare, which is what Walther Meissner and
Robert Ochsenfeld did in 1933 {% cite meissner1933 --file refs_superconductivity %}, measuring
the field distribution around tin and lead cylinders as they were cooled through the
transition _with the field already on_.

Here is the full experiment. Two materials down the rows — the hypothetical perfect conductor
and the real superconductor. Two protocols across the columns, doing the same two operations
in opposite orders, and ending at exactly the same temperature and applied field.

<figure id="result-meissner-effect" style="margin:1.8rem auto;text-align:center;">
  <div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem 0.6rem;">
    <div id="mp1-mount"></div>
  </div>
  <figcaption style="font-size:0.85rem;opacity:0.85;max-width:38rem;margin:0.85rem auto 0;text-align:left;">
    Notice that three of the four panels agree — and that the disagreement is in the
    <em>field-cooled</em> column, where the superconductor throws the flux out at
    <span style="white-space:nowrap;">T<sub>c</sub></span> and the perfect conductor keeps it.
    Scrub back and forth across the second step to watch the moment the two materials part
    company.
  </figcaption>
</figure>

Three panels behave exactly as the perfect-conductor argument of §1 predicts. The fourth does
not. A superconductor cooled through $$T_c$$ in a magnetic field **expels** that field as it
crosses the transition, ending in the same flux-free state as one cooled in zero field and
magnetised afterwards.

This is the Meissner effect, and it is a much stronger statement than zero resistance. Zero
resistance says a field cannot _change_. The Meissner effect says the field must be _zero_,
and it says so no matter how the sample got there.

The word that matters is **equilibrium**. If the final state is independent of the path taken
to reach it, then it is a state — a function of the temperature and the applied field, and of
nothing else. That single sentence is the licence for everything thermodynamic that follows:
a well-defined free energy for each of the two phases, a phase boundary between them with the
usual conditions holding across it, a latent heat you can go and measure. Superconductivity
is not a metal that has become unusually good at conducting. It is a distinct phase of matter,
and it announces itself as one through its magnetism, not through its transport.

<div class="ledger-note" markdown="1">
<span class="ledger-label">Honest caveat</span> "Expels the field" is an idealisation in two
directions. The field does penetrate a thin surface layer — §4 measures it — and expulsion
only holds below a critical field, above which the sample gives up and goes normal. Both
qualifications turn out to be informative rather than annoying.
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## 3 · The phase diagram you are allowed to draw

Because the state is an equilibrium one, we can draw it in the $$H$$–$$T$$ plane, and the
picture is not the same for every material.

<figure style="margin:1.8rem auto;text-align:center;color:var(--global-text-color);">
<svg viewBox="0 0 660 250" width="680" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="H-T phase diagrams for type I and type II superconductors, showing the Meissner phase, the mixed vortex phase, and the normal phase">
  <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.75">
    <path d="M60,200 L285,200 M60,200 L60,36"/>
    <path d="M400,200 L625,200 M400,200 L400,36"/>
  </g>
  <!-- ---------- type I ---------- -->
  <path d="M60,200 L60,55 L102,60.8 L144,78.2 L186,107.2 L228,147.8 L249,172.4 L270,200 Z"
        fill="var(--global-theme-color)" opacity="0.18"/>
  <polyline points="60,55 102,60.8 144,78.2 186,107.2 228,147.8 249,172.4 270,200"
        fill="none" stroke="var(--global-theme-color)" stroke-width="2.2"/>
  <g font-size="12" fill="currentColor">
    <text x="172" y="47" text-anchor="middle" font-weight="600">type I</text>
    <text x="118" y="160" text-anchor="middle" opacity="0.9">Meissner</text>
    <text x="118" y="176" text-anchor="middle" opacity="0.9">B = 0</text>
    <text x="228" y="70" text-anchor="middle" opacity="0.75">normal</text>
    <text x="93" y="52" text-anchor="middle" opacity="0.75" font-style="italic">H&#8321;</text>
    <text x="270" y="217" text-anchor="middle" opacity="0.75" font-style="italic">T&#8348;</text>
    <text x="292" y="204" text-anchor="start" opacity="0.75">T</text>
    <text x="60" y="28" text-anchor="middle" opacity="0.75">H</text>
  </g>
  <!-- ---------- type II ---------- -->
  <path d="M400,200 L400,158 L442,159.7 L484,164.7 L526,173.1 L568,184.9 L589,192 L610,200 Z"
        fill="var(--global-theme-color)" opacity="0.18"/>
  <path d="M400,158 L442,159.7 L484,164.7 L526,173.1 L568,184.9 L589,192 L610,200
           L589,171.5 L568,146 L526,104 L484,74 L442,56 L400,50 Z"
        fill="var(--global-theme-color)" opacity="0.07"/>
  <polyline points="400,158 442,159.7 484,164.7 526,173.1 568,184.9 589,192 610,200"
        fill="none" stroke="var(--global-theme-color)" stroke-width="2.2"/>
  <polyline points="400,50 442,56 484,74 526,104 568,146 589,171.5 610,200"
        fill="none" stroke="var(--global-theme-color)" stroke-width="2.2" stroke-dasharray="6 4"/>
  <g fill="var(--global-theme-color)" opacity="0.55">
    <circle cx="432" cy="120" r="3"/><circle cx="462" cy="139" r="3"/><circle cx="452" cy="95" r="3"/>
    <circle cx="492" cy="120" r="3"/><circle cx="418" cy="88" r="3"/><circle cx="482" cy="147" r="3"/>
    <circle cx="512" cy="141" r="3"/><circle cx="522" cy="160" r="3"/><circle cx="440" cy="70" r="3"/>
  </g>
  <g font-size="12" fill="currentColor">
    <text x="512" y="47" text-anchor="middle" font-weight="600">type II</text>
    <text x="452" y="186" text-anchor="middle" opacity="0.9">Meissner</text>
    <text x="470" y="112" text-anchor="middle" opacity="0.9">mixed state</text>
    <text x="470" y="128" text-anchor="middle" opacity="0.7" font-size="10.5">flux enters as vortices</text>
    <text x="575" y="70" text-anchor="middle" opacity="0.75">normal</text>
    <text x="381" y="162" text-anchor="end" opacity="0.75" font-style="italic">H&#8347;&#8321;</text>
    <text x="381" y="54" text-anchor="end" opacity="0.75" font-style="italic">H&#8347;&#8322;</text>
    <text x="610" y="217" text-anchor="middle" opacity="0.75" font-style="italic">T&#8348;</text>
    <text x="632" y="204" text-anchor="start" opacity="0.75">T</text>
    <text x="400" y="28" text-anchor="middle" opacity="0.75">H</text>
  </g>
</svg>
<figcaption style="font-size:0.85rem;opacity:0.85;max-width:38rem;margin:0.85rem auto 0;text-align:left;">
  Notice that the type II diagram has a phase the type I diagram does not: between
  H<sub>c1</sub> and H<sub>c2</sub> the sample is neither fully superconducting nor normal,
  and admits flux in discrete tubes while carrying on superconducting around them. Why some
  materials do this and others do not is a question this post deliberately leaves open.
</figcaption>
</figure>

For a **type I** superconductor — mercury, tin, lead, aluminium, most elemental
superconductors — there is a single boundary $$H_c(T)$$, following an almost parabolic curve
from $$H_c(0)$$ down to zero at $$T_c$$. Below it the sample is superconducting and flux-free;
above it, normal. The critical field is not an extra fact bolted on: because we are entitled
to free energies now, $$\mu_0 H_c^2/2$$ is exactly the free-energy density by which the
superconducting state sits below the normal one. Expelling a field costs energy, and $$H_c$$
is the field at which the cost exceeds the discount. That number — the **condensation
energy** — is one of the quantities a microscopic theory will have to produce.

There is a critical _current_ too, and it is a consequence rather than an independent
constraint: a current in a wire makes its own magnetic field at the surface, and the wire
goes normal when that self-field reaches $$H_c$$. So the maximum supercurrent is set by the
maximum field, which is set by the condensation energy. One number, three faces.

For a **type II** superconductor — niobium, the alloys used in real magnets, and every
high-temperature superconductor — there are two boundaries. Below $$H_{c1}$$ the behaviour is
the Meissner state we have been discussing. Above $$H_{c2}$$ it is normal. In between is a
phase with no type I analogue: flux enters the sample, but in quantised tubes, each with a
normal core, arranged in a lattice, with superconductivity carrying on in the space between.
This is why superconducting magnets exist at all — $$H_{c2}$$ in niobium–tin is enormous
where $$H_c$$ in lead is feeble.

<div class="thread-note" markdown="1">
<span class="thread-label">Deferred</span> Why two types? The answer is a competition between
two lengths, one of which we are about to meet and one of which we are not. I am flagging it
rather than answering it, because the answer belongs with the order parameter.
</div>

One detail worth banking for later. In zero field, the normal-to-superconducting transition
is **second order** — no latent heat, but a discontinuity in the specific heat. In a finite
field it becomes first order, with a latent heat you can measure. That the same transition
changes order along its own phase boundary is a strong hint that we are dealing with something
that has a continuously growing amplitude, and we will want that thought again.

<div class="sec-divider" aria-hidden="true">•••</div>

## 4 · The minimal theory that expels a field

Can we write down the least possible amount of theory that produces the Meissner effect? Fritz
and Heinz London did, in 1935 {% cite london1935 --file refs_superconductivity %}, and the
whole thing takes three lines.

Start with the perfect conductor again, but now write it out. If a density $$n_s$$ of carriers
with mass $$m$$ and charge $$-e$$ accelerates freely in a field, then
$$m\,\dot{\mathbf{v}} = -e\mathbf{E}$$, and the current $$\mathbf{j}_s = -n_s e \mathbf{v}$$
obeys $$\partial_t \mathbf{j}_s = (n_s e^2/m)\,\mathbf{E}$$. Take the curl and use Faraday:

$$
\frac{\partial}{\partial t}\left[\nabla \times \mathbf{j}_s + \frac{n_s e^2}{m}\mathbf{B}\right] = 0 .
$$

A perfect conductor says that bracket is _constant in time_. That constant is precisely the
memory we found in §1 — it stores whatever flux was present at the transition. The Londons'
move, and it is the whole idea, was to observe that experiment says there is no memory, and
therefore to set the bracket not merely constant but **zero**:

<div id="model-london-equation" class="key-eq" markdown="1">
$$
\nabla \times \mathbf{j}_s = -\frac{n_s e^2}{m}\,\mathbf{B} .
$$
</div>

This is a real physical assumption, not an algebraic tidy-up. It says the supercurrent
responds to the magnetic field _itself_, not to its rate of change — which is exactly the
difference between a material with a history and a material in equilibrium. The Meissner
effect is not derived here so much as it is _installed_, honestly and in one visible step.

What it buys is a length. Combine it with Ampère's law $$\nabla \times \mathbf{B} = \mu_0
\mathbf{j}_s$$ and $$\nabla\cdot\mathbf{B} = 0$$:

$$
\nabla^2 \mathbf{B} = \frac{\mu_0 n_s e^2}{m}\,\mathbf{B} \equiv \frac{\mathbf{B}}{\lambda_L^2},
\qquad
\mathbf{B}(x) = \mathbf{B}_0\, e^{-x/\lambda_L}
$$

for a field applied parallel to the flat surface of a half-infinite sample. The field does not
stop dead at the surface; it dies exponentially over the **London penetration depth**

<div id="result-penetration-depth" class="key-eq" markdown="1">
$$
\lambda_L = \sqrt{\frac{m}{\mu_0 n_s e^2}} .
$$
</div>

Put numbers in and $$\lambda_L$$ comes out in the tens of nanometres — around 40 nm for lead
and niobium. So "the field is expelled" always meant "expelled from everything except a skin
a few tens of nanometres thick," which for a bulk sample is a distinction without a
difference, and for a thin film is not.

That last clause is worth touching rather than being told, so here is the slab problem: field
applied parallel to both faces of a slab of thickness $$d$$, solved exactly.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="lp1-mount"></div>
  <p style="font-size:0.85rem;opacity:0.8;max-width:37rem;margin:0.9rem auto 0;text-align:center;">
    Notice what happens as the slab is thinned to a few λ<sub>L</sub>: the two surface tails
    overlap in the middle, the field never gets near zero anywhere, and the expelled fraction
    collapses. Expulsion is a bulk property. A film thinner than λ<sub>L</sub> is all surface,
    with no interior to exclude a field from — which is why thin films survive fields that
    would destroy the same material in bulk.
  </p>
</div>

<div class="ledger-note" markdown="1">
<span class="ledger-label">On the ledger</span> Two debts. First, $$n_s$$ is a fitted
parameter — the theory contains no account of what the superconducting carriers *are*, how
many of them there should be, or why they exist below $$T_c$$ and not above. Second, and more
interestingly, the formula does not actually work: the free-electron estimate for aluminium
gives about 13 nm, while the measured penetration depth is nearer 50 nm. Being wrong by a
factor of four in a formula this simple means a length scale is missing from the argument. It
is, and we will have to go and find it.
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## 5 · Something in there is gapped

Now leave magnetism and ask a thermodynamic question: what does it cost to excite a
superconductor?

The cleanest answer comes from the electronic specific heat. In a normal metal it is linear,
$$C_{\rm el} = \gamma T$$ — the standard Sommerfeld result, and the linearity is a direct
consequence of a Fermi surface with states available at arbitrarily low energy. Below
$$T_c$$, the electronic specific heat of a superconductor instead falls **exponentially**,

$$
C_{\rm es} \sim \exp\!\left(-\frac{\Delta}{k_B T}\right) .
$$

An exponential like that has exactly one interpretation, and it is the same one it has in a
two-level system or a semiconductor: there is a **minimum energy $$\Delta$$ to make an
excitation**, and at low temperature the probability of paying it is Boltzmann-suppressed. The
low-temperature penetration depth tells the same story — $$\lambda(T)$$ is not merely small at
low $$T$$ but exponentially _flat_, saturating at its zero-temperature value, because there
are no cheap excitations available to degrade the screening.

So the superconducting state has a **gap**, and the Fermi surface's characteristic supply of
arbitrarily-low-energy excitations has been removed. Fixing the scale: for most elemental
superconductors the gap comes out near $$\Delta(0) \approx 1.76\,k_B T_c$$, which is a
suspiciously clean number to be an accident.

And there is a second number, from the transition itself. At $$T_c$$ in zero field the
specific heat does not diverge; it jumps, from $$\gamma T_c$$ in the normal state up to about
$$2.43\,\gamma T_c$$ just below. The dimensionless size of that jump,

$$
\frac{\Delta C}{\gamma T_c} \approx 1.43 ,
$$

is a pure number with no material parameters in it at all. Any candidate theory has to land
on it with nothing left to adjust. Post the number on the wall.

<div class="thread-note" markdown="1">
<span class="thread-label">The uncomfortable part</span> A gap cannot be the whole story, and
it is worth being precise about why. A band insulator is gapped. It has a clean energy cost
for every excitation, an exponentially small low-temperature specific heat — and it does
nothing whatever to a magnetic field. Diamond is not a superconductor. So a gap is plainly
*necessary* here and just as plainly *not sufficient*, and nothing in this post so far
explains what a superconductor has that an insulator doesn't. I am going to leave that sitting
there. It is the most important loose thread in the series, and pulling it is a later post's
whole job.
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## 6 · Whatever is carrying the current has charge 2e

The last two constraints are the most specific, and both of them are, in a sense, accidents of
measurement — nobody set out to determine the charge of the carriers.

**Flux quantization.** Take a superconducting ring, trap some flux through it, and measure
what you trapped. The answer is not a continuum. The trapped flux comes in integer multiples
of a fixed unit, and in 1961 two groups measured that unit within weeks of each other —
Deaver and Fairbank at Stanford using tin electroplated onto a fine copper wire
{% cite deaver1961 --file refs_superconductivity %}, and Doll and Näbauer in Munich using lead
cylinders {% cite doll1961 --file refs_superconductivity %}. Their papers sit on consecutive
pages of the same volume of _Physical Review Letters_. Both found

<div id="result-flux-quantization" class="key-eq" markdown="1">
$$
\Phi_0 = \frac{h}{2e} \approx 2.07 \times 10^{-15}\ \mathrm{Wb} .
$$
</div>

The number in that denominator is the entire point. Flux quantization itself follows from
requiring a single-valued quantum wavefunction around a closed loop — the general argument
gives $$h/q$$, where $$q$$ is the charge of whatever the wavefunction describes. London had
predicted $$h/e$$, for electrons. Experiment returned exactly half of it. Whatever carries
the supercurrent is not an electron; it has twice an electron's charge.

**The isotope effect.** The other clue arrived a decade earlier and points somewhere
completely different. In 1950, Emanuel Maxwell at the National Bureau of Standards
{% cite maxwell1950 --file refs_superconductivity %} and Charles Reynolds, Bernard Serin and
co-workers at Rutgers {% cite reynolds1950 --file refs_superconductivity %} independently
measured $$T_c$$ across separated isotopes of mercury — same chemistry, same electronic
structure, different nuclear mass. Their papers were published back to back. $$T_c$$ moved:
from about 4.185 K to 4.146 K as the mean isotope mass went from 199.7 to 203.4, following

$$
T_c \propto M^{-1/2} .
$$

Now ask what could possibly do that. The nuclear mass does not appear anywhere in the
electronic problem — not in the Coulomb interaction, not in the band structure, not in the
Fermi surface. There is exactly one thing in a metal whose energy scale depends on the ionic
mass, and that is the vibration of the ions themselves: phonon frequencies go as
$$M^{-1/2}$$, and the measured exponent is $$M^{-1/2}$$. The lattice is not a spectator. A
purely electronic theory of superconductivity is, by this one measurement, dead.

<div class="ledger-note" markdown="1">
<span class="ledger-label">Chronology, honestly</span> These two clues did not play the same
role. The isotope effect landed in 1950 and was a genuine signpost — it is one of the things
that sent the theorists towards phonons. Flux quantization landed in 1961, four years *after*
the microscopic theory, and functioned as a confirmation rather than a hint. It is tempting to
present the experimental record as a tidy set of clues assembled before the solution. It
wasn't.
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## 7 · The box, and the way out of it

Here is everything we now have to explain, with no theory spent:

- The superconducting state is an **equilibrium phase**, not a transport anomaly. It expels
  magnetic flux regardless of history, which is a thermodynamic statement and the reason we
  are entitled to a phase diagram at all.
- It **screens magnetic fields over a length** $$\lambda_L$$ of tens of nanometres — and the
  simplest formula for that length is wrong by a factor of a few, so at least one more length
  scale is hiding in the problem.
- It is **gapped**, with $$\Delta(0) \approx 1.76\,k_BT_c$$, and the specific heat jumps at
  $$T_c$$ by a parameter-free $$\Delta C/\gamma T_c \approx 1.43$$.
- A gap is **not enough**: gapped insulators expel nothing, so something beyond the gap does
  the magnetic work.
- The carriers have **charge $$2e$$**.
- The **lattice is involved**, with $$T_c \propto M^{-1/2}$$ pointing squarely at phonons.

Read that list again as a demand rather than a summary. Charge $$2e$$ means electrons are
bound in pairs. A gap of order $$k_BT_c$$ means the binding is weak — millikelvin-to-kelvin
scale, absurdly feeble next to the electronvolt scale of everything else in a metal. And the
isotope effect means the glue involves the ions.

Which lands us on a problem that ought to be impossible. Electrons repel each other. The
Coulomb interaction between two of them is the strongest thing in the room, and screening in a
metal reduces it but certainly does not change its sign. Yet the experiments say two electrons
must end up bound together, and bound so gently that a few kelvin pulls them apart.

So: where does an attraction between two electrons come from — and once you have one, how
weak is it allowed to be before it stops binding anything at all?

<div class="sec-divider" aria-hidden="true">•••</div>

## 8 · Exercises

**Exercise 1 — the memory of a perfect conductor.** Show that $$\rho = 0$$ implies
$$\partial\mathbf{B}/\partial t = 0$$ throughout the interior, and use it to predict the final
interior field for both columns of the §2 experiment. Then state, in one sentence, the extra
physical assumption you would have to add to get the Meissner result.

<div class="learn-more-box" markdown="0">
{% details Solution %}
With $$\rho = 0$$, any finite current density requires $$\mathbf{E} = \rho\mathbf{j} = 0$$
inside. Faraday's law $$\nabla\times\mathbf{E} = -\partial_t\mathbf{B}$$ then gives
$$\partial_t \mathbf{B} = 0$$ everywhere in the interior.

Zero-field cooled: the interior field is zero when resistance vanishes, so it stays zero when
the external field is applied — screening currents on the surface arrange themselves to keep
it that way. Final interior field: $$B = 0$$.

Field cooled: the interior field is $$B_0$$ when resistance vanishes, so it stays $$B_0$$
forever. Final interior field: $$B = B_0$$. The two protocols give different answers, which is
precisely the history dependence.

The missing assumption is the London one: that the supercurrent is fixed by $$\mathbf{B}$$
itself rather than by $$\partial_t\mathbf{B}$$, so that $$\nabla\times\mathbf{j}_s +
(n_se^2/m)\mathbf{B}$$ is _zero_ rather than merely conserved. Note this cannot be derived
from $$\rho=0$$ — it is strictly more information, which is the sense in which the Meissner
effect is an independent experimental fact.
{% enddetails %}

</div>

**Exercise 2 — how wrong is the London formula?** Aluminium has three valence electrons per
atom and a number density of about $$1.8\times 10^{29}\ \mathrm{m^{-3}}$$. Estimate
$$\lambda_L$$ at $$T = 0$$, assuming every electron participates, and compare with the
measured value of roughly 50 nm.

<div class="learn-more-box" markdown="0">
{% details Solution %}
$$
\lambda_L = \sqrt{\frac{m}{\mu_0 n e^2}}
= \sqrt{\frac{9.11\times10^{-31}}{(1.257\times10^{-6})(1.8\times10^{29})(1.602\times10^{-19})^2}} .
$$

The denominator is $$(1.257\times10^{-6})(1.8\times10^{29})(2.566\times10^{-38}) \approx
5.8\times10^{-15}$$, so $$\lambda_L \approx \sqrt{1.57\times10^{-16}} \approx 1.3\times10^{-8}$$
m, about 13 nm.

Measurement gives roughly 50 nm — too large by a factor near four. The discrepancy is not
noise, and blaming $$n_s < n$$ makes it worse rather than better in the wrong direction: a
smaller $$n_s$$ increases $$\lambda_L$$, so one could always fit it, but only by conceding
that $$n_s$$ is a free parameter with no independent meaning. The real resolution is that the
London relation is **local** — it assumes $$\mathbf{j}_s$$ at a point is set by $$\mathbf{B}$$
at that same point — and in a clean elemental superconductor the response is spread over a
second, longer length scale. Pippard's non-local generalisation was built precisely to handle
this, and the length involved is the coherence length. Aluminium is an extreme case: its
coherence length is around 1.6 μm, enormous compared to 13 nm, which is why it is aluminium
that embarrasses the formula most.
{% enddetails %}

</div>

**Exercise 3 — earning the 2.** Argue from single-valuedness of a wavefunction
$$\psi \propto e^{i\varphi}$$ around a closed loop inside a superconducting ring that the
trapped flux must be quantised in units of $$h/q$$. What would the flux quantum be if the
carriers were single electrons, and by what factor did the 1961 experiments miss that value?

<div class="learn-more-box" markdown="0">
{% details Solution %}
Take a closed path deep inside the ring, far enough from the surfaces that the supercurrent
has decayed to zero — possible because the ring is much thicker than $$\lambda_L$$. The
canonical momentum of a carrier of charge $$q$$ is $$\mathbf{p} = m\mathbf{v} + q\mathbf{A}$$,
and with a phase gradient $$\hbar\nabla\varphi = \mathbf{p}$$ the vanishing of $$\mathbf{v}$$
on the path leaves $$\hbar \nabla \varphi = q\mathbf{A}$$. Integrating around the loop,

$$
\hbar \oint \nabla\varphi\cdot d\boldsymbol{\ell} = q \oint \mathbf{A}\cdot d\boldsymbol{\ell}
= q\,\Phi .
$$

Single-valuedness of $$\psi$$ requires the phase to change by $$2\pi n$$ for integer $$n$$, so
$$\Phi = n h/q$$.

For $$q = e$$ this gives $$h/e \approx 4.14\times10^{-15}$$ Wb. The measured quantum is
$$2.07\times10^{-15}$$ Wb — smaller by exactly a factor of two, so $$q = 2e$$. Two remarks
worth making. The argument assumes a phase $$\varphi$$ exists and is well defined around the
loop, which is doing more work than it looks like and is not something this post has earned.
And the factor of two is a statement about the _charge_ of the carrier, not directly about
pairing — reading "charge $$2e$$" as "two electrons bound together" is an inference, and a
correct one, but it is an inference.
{% enddetails %}

</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## References

For the phenomenology at the level of this post, {% cite annett2004 --file refs_superconductivity %}
is the gentlest entry point and covers §§1–4 almost exactly in this order.
{% cite tinkham1996 --file refs_superconductivity %} is the standard reference and will be
cited throughout this series; its first two chapters are the thorough version of everything
here, including the thermodynamics of $$H_c$$ and the type I/type II distinction.

The primary literature is unusually readable. {% cite meissner1933 --file refs_superconductivity %}
is two pages. {% cite london1935 --file refs_superconductivity %} is worth reading for how
carefully the brothers justify replacing a constant of integration with zero — the step is
presented as the physical hypothesis it is. The 1950 isotope-effect letters
{% cite maxwell1950 --file refs_superconductivity %} and
{% cite reynolds1950 --file refs_superconductivity %} are a page each, and the 1961 flux
quantization letters {% cite deaver1961 --file refs_superconductivity %} and
{% cite doll1961 --file refs_superconductivity %} are barely longer.

{% bibliography --file refs_superconductivity --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
> {: .block-tip }

<script src="{{ '/assets/js/meissner-protocol.js' | relative_url }}"></script>
<script src="{{ '/assets/js/london-penetration.js' | relative_url }}"></script>
<script>
  (function () {
    function boot() {
      var mp = document.getElementById("mp1-mount");
      if (mp && window.createMeissnerProtocol) window.createMeissnerProtocol(mp);
      var lp = document.getElementById("lp1-mount");
      if (lp && window.createLondonPenetration) window.createLondonPenetration(lp);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  })();
</script>
<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
