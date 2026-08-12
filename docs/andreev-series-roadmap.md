# Series Roadmap: _Bound States That Carry Current_ — v1

**Working series title:** Bound States That Carry Current
**Subject:** The Andreev spin qubit, built from the bottom — what a superconducting gap does to
a single incident electron, how two interfaces turn that into a discrete level, what occupying
that level gives you, and why the resulting qubit is wired into a microwave circuit in a way no
quantum-dot spin is.

**Purpose:** close the gap between the two threads this blog already has. `spin-qubits` ends at
a spin that is exquisitely isolated and correspondingly hard to read and to connect;
`superconductivity` ends at a gapped condensate and an explicit promise about single-electron
scattering. The Andreev spin qubit is the object that joins them. By the end you have (a) a
working scattering-matrix solver for Andreev bound states, (b) a coherence budget assembled from
the filter-function machinery already published on this site, and (c) a clean public account of
why this platform makes the opposite trade from a quantum dot.

**Scope note:** this series is entirely textbook and published physics, and stops there. §6 is
the standing rule about what does not go on the blog.

---

## 0. The intellectual spine

Every post returns to one question, stated in a recurring callout box:

> **This step traded isolation for coupling. What did you gain, and what did you just let in?**

- **A1** — couple an electron to a condensate. Gain: subgap transport at all. Let in: nothing
  yet; one interface has no dynamics.
- **A2** — add the second interface. Gain: a discrete level with a phase handle. Let in:
  sensitivity to everything that moves the phase.
- **A3** — occupy the level. Gain: a spin-½. Let in: fermion parity, and therefore poisoning.
- **A4** — turn on spin–orbit. Gain: a splitting you can drive, and a spin that pushes
  supercurrent. Let in: gate-voltage noise through the transparency, flux noise through the
  phase.
- **A5** — hang it in a resonator. Gain: dispersive readout and millimetre-range two-qubit
  coupling. Let in: Purcell decay and photon shot noise.
- **A6** — total the ledger with the site's own noise machinery.

This is the same sentence as the `spin-qubits` thread blurb ("the coherence price you pay for
control"), applied to a platform that makes the opposite trade. That contrast is the reason the
series is worth writing here rather than anywhere else — a reader who has followed the dot
thread arrives with exactly the right prior to be surprised.

Secondary recurring box, one per post: **"Compared with the dot"** — three or four sentences
translating the Andreev object into the language of the existing spin-qubit posts (confinement,
readout, coupling, noise port). Mirrors the Berciu series' "For the quantum-information reader"
box. These boxes are also the series' cross-link budget: each one is a natural home for one or
two `concept_link` calls into `spin-qubits` and `decoherence`.

---

## 1. Post list, arc, and dependencies

```text
[superconductivity thread]          [andreev-qubits thread]

A1 (Andreev reflection) ── A2 (bound states, CPR) ──┬── A3 (parity) ── A4 (the spin qubit) ──┬── A5 (readout, coupling)
                                                    │                                        │
                                                    └────────────────────────────────────────┴── A6 (coherence budget)
```

Reading order is A1 → A6. A2 is the hinge: it is the last post with no qubits in it, and the
last that belongs to the `superconductivity` thread. A6 requires A4 and A5 and leans hard on
already-published decoherence posts.

---

### A1 — "What the Gap Does to an Incident Electron"

Thread: `superconductivity`. This post is already promised by that thread's blurb; write it as
the direct continuation of _Superconductivity: What Needs Explaining_.

**Core content**

- The question the previous post left open: the gap is established; what happens to one electron
  arriving at the boundary with energy below it? Set up the N–S interface as a **scattering
  problem for the BdG equation**, not as a transport formula to be quoted.
- **Andreev reflection.** Below the gap there is no single-particle state to enter, and ordinary
  reflection alone cannot conserve charge if a current flows. The resolution: the electron
  reflects as a **hole**, and a Cooper pair enters the condensate. Retro-reflection — the hole
  retraces the electron's path, because it comes from the time-reversed state. Charge 2e crosses
  per event; that is the same 2e the flux-quantization post already forced you to accept, now
  visible in a single scattering event.
- **The BTK model.** One delta-function barrier of strength `Z` at the interface, wavefunction
  matching, and the four coefficients (Andreev reflection, normal reflection, transmission as
  electron-like and hole-like quasiparticle). Do the matching explicitly in a collapsible box; it
  is four boundary conditions and it is worth seeing once.
- **The two limits, which are the whole point.** `Z = 0`: subgap conductance is **twice** the
  normal-state value — every incident electron transfers 2e. `Z → ∞`: the conductance becomes
  proportional to the BCS density of states, i.e. tunnelling spectroscopy. One formula
  interpolates between "perfect Andreev mirror" and "spectrometer for the gap".
- **Hard vs. soft gap**, and why experimentalists care so much: residual subgap conductance is
  the diagnostic for interface quality, and it is why in-situ epitaxial Al on InAs replaced
  evaporated-then-oxidised contacts. This is the one materials paragraph in the series, and it
  earns its place because every later post assumes a hard gap.

**Canonical derivations owned here:** BdG boundary-matching problem; Andreev reflection and
retro-reflection; the BTK model; barrier strength `Z`; subgap conductance doubling; hard-gap
criterion.

**Widget AW1 — "The Interface"**
Sliders: barrier strength `Z`, temperature `T/Δ`. Panel (a): `G(V)/G_N` vs `eV/Δ`, live, with the
`2×` line drawn. Panel (b): the four coefficients vs `E/Δ`, so the reader watches Andreev
reflection hand over to normal reflection as `Z` grows. Presets: "transparent (Z = 0)",
"tunnel junction (Z = 5)", "realistic epitaxial (Z ≈ 0.3)".

**Programming companion:** solve the matching numerically (4×4 linear system per energy) and
validate against BTK's closed form to 1e-12; reproduce the classic conductance family.

**Key refs:** Blonder, Tinkham & Klapwijk, PRB **25**, 4515 (1982); Andreev, Sov. Phys. JETP
**19**, 1228 (1964); Tinkham §3; Krogstrup et al., Nat. Mater. **14**, 400 (2015) for the
epitaxial-interface half of the hard-gap discussion.

---

### A2 — "Bound Between Two Mirrors"

Thread: `superconductivity`. The hinge post. No qubits, no Paulis, no spin — which is what keeps
the `Z` exception in §4 of `CONTRIBUTING-posts.md` confined to A1–A2.

**Core content**

- Two Andreev mirrors facing each other. An electron converts to a hole at one interface, the
  hole converts back at the other, and the round trip must close in phase. That quantization
  condition is the entire derivation — do it as a phase-accumulation argument first, then confirm
  by scattering matrix.
- **The short-junction limit** `L ≪ ξ_0` (a length — say so explicitly; the site rule warns that
  the earlier posts' `ξ_k` is an energy). In that limit the propagation phase drops out and the
  answer is universal, depending only on transmission:

  ```text
  E_A(φ) = Δ √(1 − τ sin²(φ/2))
  ```

- **Where τ comes from.** The normal-region scattering matrix, its transmission eigenvalues
  `τ_n`, and the statement that a junction is a set of independent channels — one Andreev level
  per channel. This is the concept that makes "a single-channel junction" a meaningful idealization
  rather than a cartoon.
- **The current-phase relation.** `I(φ) = (2e/ħ) ∂E_A/∂φ`. The level *carries current*, and the
  Josephson effect is bookkeeping over occupied Andreev levels rather than a separate phenomenon.
  Recover `I ∝ sin φ` as the `τ → 0` limit and note the Ambegaokar–Baratoff scale. A reader who
  has only ever seen the sinusoidal CPR should leave understanding that it is the tunnelling
  approximation to this.
- **The junction as a nonlinear inductance**, `L_J⁻¹ = (2e/ħ)² ∂²E/∂φ²`. State it, do not develop
  it; A5 collects.
- Spin degeneracy is exact here. Say so, and flag that A3 and A4 are about lifting it.

**Canonical derivations owned here:** Andreev bound state; the quantization condition;
short-junction limit; transmission eigenvalues / channel decomposition; current-phase relation;
Josephson inductance.

**Widget AW2 — "The Weak Link"**
Sliders: `τ` (log), number of channels, `φ`. Panel (a): `E_A(φ)` in the gap, both branches, with
the continuum shaded. Panel (b): `I(φ)`, with the `τ → 0` sinusoid overlaid as a dashed reference
so the skew is visible. Panel (c): `L_J(φ)`, diverging where the CPR turns over. This widget gets
extended in A3 (per-sector CPR) and again in A4 (spin splitting) — build it to be extended.

**Programming companion:** build the ABS spectrum from a normal-region scattering matrix for a
multi-channel junction; verify the single-channel case against the closed form; confirm the
sinusoidal limit and the `τ → 1` gap closing at `φ = π`.

**Key refs:** Beenakker, PRL **67**, 3836 (1991); Furusaki & Tsukada, Physica B (1991); Nazarov &
Blanter, _Quantum Transport_, ch. 1–2; Janvier et al., Science **349**, 1199 (2015).

---

### A3 — "Four States, Two Parities"

Thread: `andreev-qubits` starts here. Short post, load-bearing. It exists because the single most
common confusion in this literature is between the Andreev *pair* qubit and the Andreev *spin*
qubit, and the distinction is pure occupation bookkeeping.

**Core content**

- One Andreev level, four many-body states: `|0⟩`, `|↑⟩`, `|↓⟩`, `|↑↓⟩`. Energies relative to the
  ground state: the even sector splits by `2E_A(φ)`; the odd states sit in between and are
  degenerate.
- **Fermion parity** as the (nearly) conserved quantity that blocks even↔odd. Two qubits live
  here and they are not the same object: the even-sector transition is the **Andreev pair
  qubit** (Zazunov et al.), the odd-sector doublet is the **Andreev spin qubit**. Name both,
  state which one the series is about, and move on.
- **Supercurrent by sector.** The odd (singly-occupied) state carries no ABS supercurrent, while
  the even states carry `±I(φ)`. So parity is directly visible in the junction inductance —
  which is the seed of everything in A5. Make this the "aha" of the post.
- **Poisoning.** What actually flips parity: nonequilibrium quasiparticles in the leads. Why the
  odd state is often the long-lived one (leaving it requires ejecting a quasiparticle into the
  continuum). Typical parity lifetimes, and the standard mitigations (gap engineering, phonon and
  photon shielding, normal-metal traps).
- Compared-with-the-dot box: the dot has no parity problem, because its qubit is not built out of
  a superconducting condensate. This is the first real cost the platform pays.

**Canonical derivations owned here:** Andreev level occupation and the four-state ladder; fermion
parity; parity switching / quasiparticle poisoning; Andreev pair qubit; odd-sector spin doublet.

**Widget AW3 — "Parity"**
Panel (a): the four-state ladder vs `φ`, colour-coded by parity. Panel (b): the CPR of the
currently selected sector, so the reader sees the odd-sector current vanish. Panel (c): a live
random-telegraph parity trace with an adjustable poisoning rate, plus the running estimate of that
rate from the trace itself — which is a direct callback to the existing `random-telegraph-noise`
and `noise-spectroscopy` posts (`uses`, not `provides`).

**Programming companion:** simulate a two-state Markov parity process, estimate the switching rate
from the trace via the autocorrelation, and compare to the injected rate. Reuse the
`random-telegraph-noise` code from the decoherence thread rather than writing new.

**Key refs:** Zazunov et al., PRL **90**, 087003 (2003); Hays et al., PRL **121**, 047001 (2018)
(direct microwave measurement of ABS dynamics); Olivares et al. / Levy Yeyati on poisoning
dynamics.

---

### A4 — "Where the Spin Comes From"

The centre of the series.

**Core content**

- State the problem plainly: A3 gave a spin-½, but `|↑⟩` and `|↓⟩` are degenerate, so there is no
  qubit yet. Something must split them, and a magnetic field is the expensive answer.
- **Spin–orbit coupling in the weak link.** Rashba coupling makes the junction slightly more
  transparent for one spin than the other: `τ_↑ ≠ τ_↓`, hence `E_↑(φ) ≠ E_↓(φ)`. Derive this from
  the spin-dependent scattering matrix, not by assertion.
- **Why the splitting must vanish at `φ = 0` and `φ = π`.** A Kramers argument: at those phases
  the junction is time-reversal symmetric, and the doublet is protected. This is a *structural*
  fact about the SOC mechanism, not a detail — it is why the qubit frequency is tied to the flux
  bias. Give it its own subsection.
- The effective two-level Hamiltonian, and the fact that the spin quantization axis is itself set
  by the SOC direction and rotates with `φ` (Park–Yeyati; measured by Tosi et al.).
- **Manipulation.** Two routes actually used: Raman-type spin-flip transitions via the pair
  transition (Hays et al.), and direct drive by modulating the phase (Pita-Vidal et al.). Both
  work because the spin and the supercurrent are the same degree of freedom seen from two sides.
- Real numbers: splittings of order GHz, spin-flip time `T_S = 17 μs`, echo coherence
  `T_2E = 52 ns` in the 2021 Yale device. Put them in the text. The gap between those two numbers
  is the whole subject of A6.

**Canonical derivations owned here:** spin–orbit in a weak link; spin-split Andreev doublet;
Kramers protection at `φ = 0, π`; the Andreev spin qubit; spin–supercurrent coupling.

**Widget AW4 — "The Splitting"**
Extends AW2. Sliders: `τ`, SOC strength, `φ`. Panel (a): `E_↑(φ)`, `E_↓(φ)` in the gap. Panel (b):
splitting vs `φ`, with the zeros at `0` and `π` marked and labelled with the Kramers reason. Panel
(c): the qubit frequency readout in GHz for the current settings.

**Programming companion:** 1D Rashba BdG scattering problem; extract `τ_σ` numerically; compare
the resulting splitting to the analytic short-junction expression across a `τ`–SOC grid.

**Key refs:** Chtchelkatchev & Nazarov, PRL **90**, 226806 (2003); Padurariu & Nazarov, PRB **81**,
144519 (2010); Park & Yeyati, PRB **96**, 125416 (2017); Tosi et al., PRX **9**, 011010 (2019);
Hays et al., Science **373**, 430 (2021).

---

### A5 — "Wired In"

The post that justifies the platform's existence, and the sharpest contrast with the dot thread.

**Core content**

- The chain, stated once and then developed: spin state → supercurrent → junction inductance →
  resonator frequency. Nothing has to be converted; the coupling is native and first order.
- **Dispersive readout.** The standard cQED treatment applied to this qubit; single-shot fidelity
  and the integration-time trade.
- **Compared with the dot, at length.** The existing spin-qubit post's readout section covers
  Elzerman and Pauli spin blockade — spin-to-charge conversion, i.e. *manufacturing* a handle. Link
  to those anchors and set the two mechanisms side by side. This is the single most valuable
  paragraph in the series for a reader who came from the dot thread.
- **Long-range coupling.** Two junctions on one resonator couple over millimetres (Pita-Vidal
  2024; Cheung 2024 for the pair-qubit analogue). Exchange coupling in dots reaches ~100 nm. State
  the ratio and let it land.
- The transmon-coupled variant (Pita-Vidal 2023) as the currently most controllable
  implementation.
- What you let in: Purcell decay, photon shot noise, and the general fact that coupling strength
  and protection are the same knob.

**Canonical derivations owned here:** dispersive shift for an inductively coupled qubit;
spin–photon coupling via supercurrent; resonator-mediated two-qubit coupling.

**Widget AW5 — "Readout"**
Resonator transmission `|S21(ω)|` with the two spin states overlaid; sliders for coupling `g`,
linewidth `κ`, and detuning. A second panel: readout SNR vs integration time, with the measured
single-shot point marked. The pedagogical target is that the reader can *see* the dispersive shift
being smaller than the linewidth and understand why that costs integration time.

**Programming companion:** dispersive Jaynes–Cummings model; compute the shift and the SNR;
sanity-check against the reported single-shot fidelity.

**Key refs:** Blais et al., RMP **93**, 025005 (2021); Hays et al., Science **373**, 430 (2021);
Metzger et al., PRR **3**, 013036 (2021); Pita-Vidal et al., Nat. Phys. (2023) and Nat. Phys.
(2024); Cheung et al., Nat. Phys. **20**, 1793 (2024).

---

### A6 — "The Coherence Budget"

The post that only this blog can write, because the machinery is already here. Almost no new
formalism: it is an application post, and it should read like one.

**Core content**

- **Three noise ports, one framework.** The qubit frequency depends on `φ`, on `τ`, and on
  parity. Flux noise enters through `∂ω_q/∂φ`, gate/charge noise through `∂ω_q/∂τ`, and poisoning
  is not dephasing at all but a distinct loss channel. Set up the ledger before any numbers.
- For the two dephasing ports, apply the existing filter-function formalism **by reference**:
  `concept_link` to `filter-function`, `sequence-filter-function`, `attenuation-function`,
  `one-over-f`, `charge-noise`. Do not re-derive the overlap integral. This is both the house rule
  and the reason the post is short.
- **Sweet spots.** `∂ω_q/∂φ = 0` and `∂ω_q/∂τ = 0` — where each sits, and the structural problem
  that in the SOC device the phase sweet spots are exactly the Kramers points from A4, where the
  splitting vanishes and there is no qubit. Getting a usable frequency and first-order flux
  insensitivity at the same time is genuinely hard here. That tension is the honest punchline of
  the series.
- **T1 channels:** phonon-mediated spin relaxation through SOC, Purcell, and parity switching.
  Why `T_S` is microseconds while `T_2E` is tens of nanoseconds.
- **A numbers table**, unglamorous and explicit: ASQ vs Si/SiGe spin qubit vs transmon, on
  frequency, `T_2`, gate time, readout time, coupling range, and field compatibility. Let the
  platform lose several rows. It wins the last two, and that is the argument.

**Canonical derivations owned here:** the ASQ coherence budget; transparency as a noise port;
flux-noise coupling; poisoning-limited relaxation. **`uses` (not `provides`):** `filter-function`,
`sequence-filter-function`, `one-over-f`, `charge-noise`, `sweet-spot`, `hahn-echo`,
`coherence-timescales`, `random-telegraph-noise`.

**Widget AW6 — "Budget"**
Sliders: flux-noise amplitude, charge-noise amplitude, poisoning rate, and operating point
`(φ, τ)`. Outputs: `T_2*` and `T_2E` from the overlap integrals, plus a stacked bar showing which
channel dominates at the current operating point. Include a "sweep `φ`" button that traces the
coherence across the phase axis so the reader watches the sweet-spot problem appear on its own.

**Programming companion:** compute `χ(t) = ∫ S(ω) F(ω,t) dω/2π` per channel with the site's
existing filter functions; reproduce the measured echo time to within a factor of a few and say
honestly which parameter you had to choose to get there.

**Key refs:** the site's own dephasing and filter-function posts; Cerrillo, Hays, Fatemi & Levy
Yeyati, PRR **3**, L022012 (2021); the supplementary material of Hays et al. (2021).

---

## 2. Notation audit

The site rules in `CONTRIBUTING-posts.md` §4 collide with the standard notation of this field in
five places. Proposed resolutions, all of which need a §4 amendment landing **before A1**:

| Symbol | Existing owner | This series wants | Resolution |
| --- | --- | --- | --- |
| `Z` | Pauli operator, site-wide; §4 already grants an exception for "the Andreev-reflection post" | BTK barrier strength | Keep the granted exception, and **scope it to A1 and A2 only** — neither post contains a Pauli. From A3 onward `Z` is the Pauli operator again and barrier strength never reappears (the series speaks in `τ` after A2). Amend §4 to name the two posts rather than one. |
| `Δ` | `drive-detuning` (spin-qubits thread) **and** `spectral-gap` (elsewhere); §4 splits them by thread | The superconducting gap, in posts that are partly spin-qubit posts | Scoped rule: **in this series `Δ` is always the superconducting gap.** Where A4/A5 need a drive detuning, write `δω`. Amend §4 to add this exception explicitly, since A3–A6 sit in a qubit thread and would otherwise fall under the spin-qubit reading. |
| `φ` | the accumulated stochastic phase `φ(t)` in the decoherence thread (`coherence-function`, `attenuation-function`) | the superconducting phase difference | **`φ` is the junction phase difference in this series.** A6 imports the dephasing machinery by `concept_link` and never re-introduces `φ(t)` — it works in `χ(t)` and `W(t)` only. This is the anchor-discipline rule doing real work; note it in A6's prose so the choice is visible rather than lucky. |
| `τ` | time lag in `C(τ)`; `τ_c`, `τ_Q`, `τ_response` are all decorated | junction transparency (dimensionless) | **Bare `τ` is a transmission probability in this series**, `τ_n` per channel. Every time-like `τ` on the site already carries a subscript, so the collision is only in A6; say once there that `τ` is dimensionless and time lags appear only inside linked results. |
| `λ` / Rashba | §4: `λ` is the Kibble–Zurek ramp "and nothing else"; `λ_L` is the penetration depth | Rashba coupling, conventionally `λ_R` or `α_R` | Use **`α_R`**, always subscripted. Note that `α_k` is the Bogoliubov quasiparticle operator in the free-fermion thread — momentum-subscripted, so distinguishable, but A4 should say once that `α_R` is a coupling constant and not that operator. (This differs from the `λ_R` used in the research notes; the blog rule wins on the blog.) |

Two further items, no amendment needed but worth recording:

- `Γ` is the covariance matrix `Γ_ab` in the free-fermion thread. If a proximity/self-energy
  discussion ever appears (it does not in A1–A6), the tunnel rate must be written `Γ_T`.
- **Widget numbering collides with the Berciu series** (`W1`–`W7`). Use the `AW`_n_ prefix used
  throughout this document, and consider retrofitting `BW`_n_ on the other roadmap so the
  convention is uniform.

Also: `E_A` for the Andreev level energy sits beside the existing `quasiparticle-spectrum` symbol
`E_k`. Both subscripted, no action needed.

---

## 3. Registry, threads, and config

### New thread

Add to `_data/blog_threads.yml`, after `superconductivity`:

```yaml
- slug: andreev-qubits
  name: Andreev qubits
  blurb: A qubit made from a bound state in a superconducting weak link — parity you did not ask for, a spin that pushes supercurrent, and a readout that comes for free.
```

Add `andreev-qubits` to `display_categories` in `_config.yml` **only once A3 has landed**, per the
comment in `blog_threads.yml`. A1 and A2 carry `categories: [superconductivity]`.

### Phase 0 findings to verify before A1

1. **`bdg-pairing` and `bogoliubov-transformation` may have no provider.** The Majorana/Kitaev post
   (`2026-07-20-splitting-the-electron-majoranas-and-pairing.md`) has no `provides` / `requires` /
   `uses` keys at all — which the §5 checklist calls a validator error in its own right. A1
   `requires` both concepts, so retrofit that post's front matter (in its own commit, before A1)
   with whatever its prose genuinely derives. This is the same shape as the Berciu roadmap's
   `tight-binding-chain` finding.
2. Run `bin/validate-concepts` before and after, and confirm no proposed id below already exists.

### New concept ids

```text
# --- A1 ---
bdg-scattering-problem
andreev-reflection            symbol: e^- \to h^+ ,\; +2e
btk-model                     symbol: Z
conductance-doubling          symbol: G_{NS} = 2G_N
hard-gap

# --- A2 ---
andreev-bound-state           symbol: E_A(\varphi) = \Delta\sqrt{1-\tau\sin^2(\varphi/2)}
short-junction-limit          symbol: L \ll \xi_0
transmission-eigenvalue       symbol: \tau_n
current-phase-relation        symbol: I(\varphi) = (2e/\hbar)\,\partial E/\partial\varphi
josephson-inductance          symbol: L_J^{-1} = (2e/\hbar)^2 \partial^2 E/\partial\varphi^2

# --- A3 ---
andreev-level-occupation
fermion-parity                symbol: P = (-1)^{N}
quasiparticle-poisoning
andreev-pair-qubit

# --- A4 ---
spin-orbit-weak-link          symbol: \alpha_R
spin-split-andreev-doublet    symbol: \tau_\uparrow \neq \tau_\downarrow
kramers-protection            symbol: \varphi = 0,\pi
andreev-spin-qubit
spin-supercurrent-coupling

# --- A5 ---
dispersive-shift              symbol: \chi = g^2/\delta\omega
spin-photon-coupling
resonator-mediated-coupling

# --- A6 ---
asq-coherence-budget
transparency-noise-port
flux-noise-port
poisoning-limited-relaxation
```

Tags: first tag `superconductivity` for A1–A2 concepts, `andreev-qubits` for A3–A6 — which means
adding `andreev-qubits` to the thread list in `CONTRIBUTING-posts.md` §1. Kinds as usual
(`phenomenon` / `model` / `result` / `technique` / `hardware`).

Cross-thread `uses` edges this series should establish: A3 → `random-telegraph-noise`; A5 →
`spin-to-charge-conversion`, `elzerman-readout`, `pauli-spin-blockade`, `exchange-coupling`;
A6 → `filter-function`, `sequence-filter-function`, `hahn-echo`, `one-over-f`, `charge-noise`,
`sweet-spot`, `coherence-timescales`.

---

## 4. Claude Code prompts

### Phase 0 — audit (run first)

```text
Read CONTRIBUTING-posts.md, _data/concepts.yml, _data/blog_threads.yml, and
docs/andreev-series-roadmap.md.

Audit, do not write prose:
1. For every proposed concept id in roadmap §3, check for collisions with existing ids and
   for near-duplicates that should be reused instead of added.
2. Check the five notation collisions in roadmap §2 against the actual site rules and against
   every published post's prose. Report any case where my proposed resolution would break an
   existing post.
3. Confirm whether bdg-pairing and bogoliubov-transformation currently have a provider post.
   If not, propose the front-matter retrofit for the Majorana post based on what its prose
   actually derives — do not claim concepts it only mentions.
4. Draft the exact diff to CONTRIBUTING-posts.md §4 for the Z, Delta, phi, tau, and alpha_R
   rules, and the diff to §1's thread list.
5. Run bin/validate-concepts and report the current state.

Output a report. Change nothing yet.
```

### A1 — full drafting prompt

```text
Read docs/andreev-series-roadmap.md section "A1", plus CLAUDE.md and CONTRIBUTING-posts.md.
Read the published post "Superconductivity: What Needs Explaining" — A1 is its direct
continuation and must open on the hook its final section leaves.

We are writing A1 of the Bound States That Carry Current series:
"What the Gap Does to an Incident Electron"

AUDIENCE: me — a physics PhD student fluent in second quantization, BdG, and scattering
theory as linear algebra, comfortable with spin qubits and decoherence, but who has never
worked with NS interfaces or transport spectroscopy. Do not explain BdG. DO explain the
transport tradition's conventions and instincts, which I do not have.

STYLE (non-negotiable):
- Physical intuition in main text; full derivations in collapsible boxes with stable anchors.
- Concrete before abstract: do the single-interface matching completely before any formula
  is generalized.
- No forward references except the explicit flags the roadmap names.
- Check the concept registry before deriving anything.

NOTATION: roadmap §2. Z is the BTK barrier strength in this post and nowhere else; say so in
prose where you define it. Delta is the superconducting gap throughout.

STRUCTURE (draft ONE section, then STOP for review):

  S1. The question left open: the gap exists — what happens to one electron that arrives
      below it? Frame as a BdG scattering problem.
  S2. Andreev reflection: why a hole, why retro-reflected, why 2e crosses. Connect the 2e
      back to the flux-quantization anchor in the previous post; do not re-derive it.
  S3. The BTK model. Delta-barrier of strength Z, the four coefficients. Collapsible box:
      the full matching calculation.
  S4. The two limits. Z = 0 conductance doubling; Z -> infinity tunnelling spectroscopy.
      One formula, two familiar experiments.
  S5. Hard vs soft gap, and why the interface is a materials problem. One section, no more.
  S6. Spine callout: what this step coupled, and what it let in (nothing yet — one interface
      has no dynamics). Flag forward to A2 only.

STOP after each section. Do not draft the widget until all prose is approved.
```

**Widget prompt (after prose approval):**

```text
Build Widget AW1: "The Interface". Vanilla JS, self-contained, dark, teal #1fb2a6, responsive.

- Sliders: barrier strength Z (0 to 5), temperature T/Delta.
- Panel A: G(V)/G_N vs eV/Delta, live, with a dashed line at 2.
- Panel B: the four BTK coefficients vs E/Delta.
- Presets: transparent (Z=0), tunnel junction (Z=5), realistic epitaxial (Z=0.3).

The pedagogical point: one model interpolates between an Andreev mirror and a gap
spectrometer, and the reader should be able to find the crossover themselves.
```

### A2–A6 — roadmap-level prompts

Generate the detailed prompt **one at a time**, immediately before drafting each post — notation
and anchor decisions from earlier posts will change them. Template:

```text
Read docs/andreev-series-roadmap.md section "A<n>". Posts A1..A<n-1> are published — read
them and link to their canonical anchors rather than re-deriving.

Before drafting: propose a section-by-section outline for A<n> following the roadmap's Core
Content list, in the house style. For each section, list which existing anchors it links to
and which new concepts it claims as canonical.

Show me the outline and STOP.
```

**Special note for A2:** the phase-accumulation derivation must come before the scattering-matrix
one, and the sinusoidal CPR must be presented as the `τ → 0` limit of the result, never as the
starting point.

**Special note for A3:** keep it short. The post exists to separate the pair qubit from the spin
qubit and to make the odd-sector current vanish visibly. Resist expanding the poisoning section
into its own essay — A6 collects it.

**Special note for A4:** the Kramers argument at `φ = 0, π` gets its own subsection with a real
symmetry argument, not a hand-wave. A6's sweet-spot section depends on it landing.

**Special note for A6:** re-derive nothing from the decoherence thread. If a section starts
reproducing the overlap integral, that is the signal to replace it with a `concept_link`. Build
AW6 on top of the existing filter-function code.

---

## 5. Sequencing and honest scoping

- **A1 + A2** is a complete, publishable unit that requires no qubit context at all: Andreev
  reflection and the Josephson effect derived from bound states. It also discharges the promise
  the `superconductivity` thread blurb already made. If nothing else gets written, this still
  closes an open loop on the site.
- **A1 – A4** is the real milestone: the full "what is an Andreev spin qubit and where does its
  two-level structure come from" story. Natural stopping point.
- **A5 + A6** are the platform-argument half. A5 is the most shareable single post in the series
  (the coupling-range comparison is the number people repeat). A6 is the one that could only be
  written on this blog, because it consumes four existing posts as machinery — it is the strongest
  demonstration that the site is a graph and not a pile.
- This is a **fourth parallel track** alongside the free-fermion/matchgate/influence-matrix trio,
  the Berciu series, and the spin-qubit work. Be deliberate: the honest framing is that A1–A2
  finish an existing thread, A3–A6 are directly load-bearing for current research, and the Berciu
  series is the one competing for the same hours. If both are in flight, alternate at post
  granularity, not section granularity.

## 6. What stays off the blog

Writing A2–A4 forces you to state cleanly, for a reader who does not already believe it, why the
SOC splitting is welded to the phase and vanishes at the Kramers points. Having that paragraph
drafted in public is worth real money later. The gain is framing, not results — keep it that way.

Three standing rules:

- **A1–A6 are textbook and published literature, end to end.** Any mechanism you are actively
  working on does not appear: no derivations from unpublished work, no outlook section, no
  "one could imagine instead…" paragraph that telegraphs a direction. If a post starts wanting
  such a section, that is the signal to end the post, not to add it.
- **A6's sweet-spot observation is the one place the series brushes against your own thinking.**
  The claim that the SOC mechanism's phase sweet spots coincide with its Kramers degeneracy
  points — so flux-insensitivity and a finite qubit frequency are in structural tension — should
  be checked against the citation scanner before drafting. State it only as far as published
  sources already do. If it turns out not to be written down anywhere, it belongs in a paper,
  and A6 should say less rather than more.
- **Do not let the blog's simplifications leak backwards.** A single channel, the short-junction
  limit, a rigid splitting — all fine in a post, all things a referee will ask about. Where a
  post simplifies, record it in the research notes, not in the post.
