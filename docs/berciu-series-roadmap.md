# Series Roadmap: _Dressed Particles on a Lattice_ — v3

**Working series title:** Dressed Particles on a Lattice
**Subject:** Mona Berciu's Green's-function program — the formalism itself (real-frequency
resolvents, Lehmann structure, sum rules, non-perturbative self-energies), what a polaron
actually is, matrix continued fractions, momentum-average approximations, few-particle
propagators, and the ARPES/2eARPES application front (matrix self-energies; coincidence
signatures of pairing).

**Purpose:** learning-in-public entry into a new subfield, structured so that by the end you
have (a) working code for the core machinery, (b) an independently reproduced figure set from
arXiv:2606.18616 and the supporting papers, and (c) a defensible research opening at the seam
between this program and your tensor-network toolkit.

**v3 changes (2026-08-08):** new dedicated polaron post inserted as P3 — dressing intuition
built on the exactly solvable atomic limit (Lang–Firsov) — and everything downstream
renumbered (old P3–P6 → P4–P7). The Holstein model, the quasiparticle weight, the phonon
cloud, and the Gerlach–Löwen crossover move from the MA post into P3; the MA post slims to
pure method + certification. Seven posts total.
**v2 changes (2026-08-08):** exciton post dropped — the series runs entirely toward the
ARPES branch. Old P1 split into a formalism post and the lattice-machinery post. Phase 0
audit findings (λ, Ω, Z_k site-rule collisions; registry schema) folded into §2 and §3.
Older versions preserved in git history.

---

## 0. The intellectual spine

Every post returns to one question, stated explicitly in a recurring callout box:

> **What are you truncating, and what physical quantity controls the error?**

- MPS/TN: truncate on **entanglement**; error controlled by bond dimension χ.
- MA approximation: truncate on **cloud spatial extent**; error controlled by cloud radius.
- Few-particle GF: truncate on **inter-particle separation** δ_max; error controlled by the
  bound-state size ξ.
- VED: truncate on **number of applications of H**; error controlled by generation depth L.

This is the through-line and it is also your comparative advantage — you are the only person
likely to write this series who finds it strange that the method gets _cheaper_ for more
strongly bound states. Do not bury this. It is the reason the series is worth writing.

Two further instruments on the spine:

- **Spectral sum rules as the validation tool for approximations** — armed in P1, first
  checked on an exact solution in P3, fired as certification in P4. This is the most
  distinctively Berciu part of the program's epistemology: approximations are certified not
  by small-parameter arguments but by exact moment identities.
- **The dressing concept itself** — the series is named for it, and P3 is its dedicated
  home: everything later posts truncate (the cloud, the pair) is first met there as a
  physical object with a size, a weight, and an exactly solvable limit.

Secondary recurring box: **"For the quantum-information reader"** — short, one per post,
translating the condensed-matter object into language from the free-fermion / matchgate /
influence-matrix posts.

---

## 1. Post list, arc, and dependencies

```text
P1 (formalism) ──┬── P2 (lattice machinery) ──┐
                 │                            ├── P4 (MA) ── P5 (two particles) ──────┐
                 └── P3 (what a polaron is) ──┘    │                                  │
                                                   ▼                                  │
                                       P6 (what ARPES sees) ───► P7 (2eARPES) ◄───────┘
```

P1 → P2 → P4 → P5 is the hard methods chain. P3 requires only P1 and sits between P2 and
P4 in reading order — P4 leans on both. P6 requires P1 and P4. P7 requires P5 and P6.
Reading order is simply P1 → P7. If momentum flags, the stopping points are after P4 or
after P6 (§5).

---

### P1 — "Poles, Residues, and Everything Else: What a Green's Function Knows"

Pure formalism, zero lattice tricks — the object itself, presented the way this tradition
actually uses it, which is _not_ the field-theory route.

**Core content**

- Resolvent Ĝ(z) = (z − H)⁻¹ as an operator identity, not a perturbative construct.
  Lehmann representation; poles = eigenvalues, residues = overlaps. Spectral function
  A(k,ω) = −(1/π) Im G(k,ω+iη).
- Analytic structure: isolated poles vs. branch cuts; what discrete states and continua
  each look like in A(ω); the iη prescription and what η means physically (resolution /
  inverse propagation time).
- Time orderings: retarded vs. advanced vs. time-ordered G, and why this program lives at
  T = 0, real frequency, retarded — no Matsubara, no analytic continuation, no path
  integral. State explicitly _why the machinery is skippable here_: one or two carriers in
  an empty band means no Fermi sea to integrate over, so the resolvent route is exact where
  diagrammatics would be scaffolding.
- **Spectral sum rules.** Moments ∫ ωⁿ A(k,ω) dω = ⟨k|Hⁿ|k⟩, computable exactly from
  commutators for any n. Derive n = 0, 1, 2 explicitly. Flag forward: P3 checks these on
  an exact solution; P4 uses them to certify MA.
- **Dyson's equation as a definition.** Σ defined non-perturbatively by
  G = G₀ + G₀ΣG — "everything G₀ doesn't know" — with the diagram series as one possible
  _evaluation_ of Σ, not its meaning.
- The variational-space philosophy, stated once and early: in this program an approximation
  is a _restriction of the Hilbert space in which (z − H) is inverted_. The error is
  controlled by which physical configurations you excluded — a statement about physics, not
  about the size of a coupling. This is the sentence the whole series unpacks.

**Canonical derivations owned here:** Lehmann representation; retarded/time-ordered
distinction; spectral sum rules; Dyson equation / non-perturbative Σ.

**Widget W1 — "Anatomy of a Spectral Function"**
Small and cheap. The reader places poles (position + residue) on an energy axis, or toggles
on a continuum band; sliders for η. Panels: (a) A(ω) rendered live; (b) running check of the
n = 0, 1, 2 sum rules against the exact moments, updating as poles move — the reader _sees_
that you can deform a spectrum wildly while keeping low moments fixed, which is exactly the
freedom an approximation like MA exploits.

**Programming companion:** exact diagonalization of a small chain; build A(k,ω) from the
Lehmann sum; verify the first six moments against the commutator formulas to 10⁻¹⁰.

**Key refs:** Economou ch. 1–3; Mahan ch. 3 (time orderings); Goodvin, Berciu & Sawatzky,
PRB **74**, 245104 (2006) (the sum-rule program).

---

### P2 — "Continued Fractions All the Way Down: Lattice Green's Functions"

The lattice machinery. Links back to P1 rather than re-deriving.

**Core content**

- Free 1D chain Green's function in closed form; contrast real-space vs. momentum-space
  representations of the _same_ object. The anchor example for the whole series.
- The equation-of-motion trick: ⟨α|Ĝ(z)(z−H)|β⟩ = δ_αβ generates a linear system linking
  propagators at neighbouring displacements.
- Nearest-neighbour hopping ⇒ tridiagonal-in-shells recurrence ⇒ **matrix continued
  fraction** S₊ = [α − β S₊]⁻¹ γ, iterated from S = 0.
- Truncation at δ_max as a variational statement (P1's philosophy made concrete), not a
  numerical hack.
- Worked example: single impurity potential on a chain, bound state peeling off the band
  edge. Show the pole appearing and the wavefunction localizing.

**Canonical derivations owned here:** lattice Green's function (closed-form chain); EOM
trick; matrix continued fraction; shell recurrence in 1D; bound-state pole.

**Widget W2 — "Continued Fraction Sandbox"**
Interactive 1D chain. Sliders: impurity strength V, broadening η, truncation depth δ_max.
Panels: (a) A(ω) with band continuum + bound-state pole; (b) |G(δ)| vs δ on log axis showing
exponential decay; (c) relative error ε vs δ_max on log axis, live, so the reader sees
convergence accelerate as the bound state tightens. Preset buttons: "weak V (slow)",
"strong V (fast)".

**Programming companion:** reproduce the closed-form 1D chain g(δ,z) and validate the
continued-fraction solver against it to 10⁻¹⁰.

**Key refs:** Economou ch. 5–6; Berciu & Cook, EPL **92**, 40003 (2010).

---

### P3 — "Carrying the Cloud: What a Polaron Actually Is"

The new post. Dressing as physics, not as a word — built on the one limit of the Holstein
model that solves exactly with nothing but harmonic-oscillator algebra. Requires only P1.

**Core content**

- What "dressed" means: an electron in a deformable lattice drags a local distortion with
  it, and the composite object — electron plus cloud — is the particle that actually
  propagates. Landau's 1933 observation, one paragraph, then straight to a solvable model.
- **The Holstein model, defined here** (P4 inherits it): electron density coupled to a
  local Einstein oscillator on each site. Why this is the minimal model, and why it is
  already hard — the phonon Hilbert space is unbounded even for one site.
- **The atomic limit (t = 0), solved exactly.** The Lang–Firsov / displaced-oscillator
  transformation in a collapsible box: the ground state is the electron sitting on a site
  whose oscillator is coherently displaced. Polaron shift E_p = g²/Ω; cloud phonon-number
  statistics are Poisson with mean g².
- **The atomic-limit spectral function: the Franck–Condon staircase.** A(ω) is a ladder of
  phonon sidebands with weights e^(−g²) g^(2n)/n!; the quasiparticle weight Z = e^(−g²)
  is the overlap of the bare electron with the dressed ground state. Check the n = 0, 1, 2
  sum rules from P1 explicitly on the staircase — first live use of the instrument, and
  the reader sees spectral weight reshuffle between peaks while the moments stay pinned.
- **Turning the hopping back on.** Perturbatively, the dressed particle hops with
  t\* = t e^(−g²): the cloud must be rebuilt on the new site, and that overlap cost is the
  effective-mass enhancement. Small vs. large polarons; adiabatic (Ω ≪ t) vs.
  anti-adiabatic (Ω ≫ t) regimes and which materials sit where.
- **Crossover, not transition** (Gerlach–Löwen): the polaron ground state is analytic in
  the coupling — there is no "self-trapping transition", only a smooth cloud growth.
  Berciu's program takes this seriously where older strong-coupling treatments
  manufactured spurious transitions.
- Where you meet polarons in experiments: replica bands in ARPES (SrTiO₃ 2DEGs), transport
  in organic semiconductors and manganites — sets up the ARPES half of the series.
- Truncation callout box: the cloud is the object whose spatial extent P4 will truncate;
  in the atomic limit the cloud radius is exactly zero, which is why MA(0) will be exact
  there.

**Canonical derivations owned here:** Holstein model; Lang–Firsov transformation;
Franck–Condon staircase; quasiparticle weight Z; phonon cloud; the crossover statement.

**Widget W3 — "The Dressed Electron"**
Sliders: coupling g, phonon frequency Ω. Panels: (a) the cloud made visible — site
displacement cartoon plus the Poisson phonon-number distribution; (b) A(ω) staircase with
the Z-pole highlighted and the polaron shift marked; (c) Z = e^(−g²) and t\*/t vs g, with
the current point marked. Carry over W1's sum-rule readout (n = 0, 1) so the reader watches
weight redistribute across sidebands while the moments hold — the continuity trick that
makes P4's certification section land.

**Programming companion:** exact diagonalization of a two-site Holstein model with
truncated phonon number; verify the sideband weights converge to the Poisson staircase as
t → 0; verify Z, the polaron shift, and the first three moments against the closed forms.

**Key refs:** Lang & Firsov, Sov. Phys. JETP **16**, 1301 (1963); Holstein, Ann. Phys.
**8**, 325 (1959); Gerlach & Löwen, Rev. Mod. Phys. **63**, 63 (1991); Franchini, Reticcioli,
Setvin & Diebold, Nat. Rev. Mater. **6**, 560 (2021) (experimental sightings).

---

### P4 — "Averaging Over Ignorance: The Momentum Average Approximation"

The program's signature approximation, now stripped to method + certification — the model
and its physics live in P3.

**Core content**

- The Holstein model at finite t, recalled from P3: why the unbounded phonon Hilbert space
  defeats brute force once the electron moves.
- The EOM hierarchy for the electron Green's function with phonons; how it fails to close.
- Diagrammatic expansion of Σ; the MA move: sum _all_ self-energy diagrams but replace each
  free propagator by its momentum average.
- Why MA is exact in both limits: zero coupling, and zero bandwidth — the atomic limit the
  reader just solved in P3. The variational meaning (phonon cloud confined to one site) —
  P1's philosophy, second instance.
- **Certification by sum rules:** MA(0) satisfies the first six spectral-weight sum rules
  exactly and degrades gracefully after — this, not a small parameter, is why it works at
  _all_ couplings. Direct callback to P1's derivation and P3's staircase check; this
  section is the payoff of the formalism split and should not be rushed.
- Resulting continued fraction for Σ; polaron band, the k-resolved weight Z_k extending
  P3's Z, effective mass, the polaron+one-phonon continuum edge at E_GS + Ω.
- Systematic improvement: MA(1), MA(2) — cloud allowed to spread.

**Canonical derivations owned here:** self-energy hierarchy from EOM; MA(0) continued
fraction; the momentum-average concept; k-resolved Z_k.

**Widget W4 — "Holstein Polaron Explorer"**
Sliders: λ (coupling), Ω (phonon frequency), MA level (0/1/2). Panels: (a) A(k,ω) heatmap
over the BZ with the free band overlaid; (b) EDC at selected k; (c) Z_k and effective mass
m\*/m vs λ, showing the crossover. Annotate the E_GS + Ω continuum edge explicitly — readers
always mistake it for a second band. Optional but high-value: a live sum-rule readout
(n = 0–3) showing MA(0) pinning the low moments even at strong coupling.

**Programming companion:** reproduce a figure from Berciu & Goodvin PRB 76, 165109 (2007);
validate MA(0) against exact diagonalization on a small ring with truncated phonon number;
check the moment identities numerically.

**Key refs:** Berciu, PRL **97**, 036402 (2006); Goodvin, Berciu & Sawatzky, PRB **74**,
245104 (2006); Berciu & Goodvin, PRB **76**, 165109 (2007).

---

### P5 — "How Far Apart Can They Be? Few-Particle Green's Functions"

Load-bearing for P7: its argument runs on the two-particle sector, and the pair size ξ
read off the coincidence map is this post's bound-state radius.

**Core content**

- Two-particle sector: basis |K, δ⟩ labelled by total momentum K and relative displacement δ.
- Why K is a good quantum number and δ is the truncation axis.
- Bound states as poles below the two-particle continuum edge; E_bind(K) = E_cont(K) − E_bound(K).
- Extracting the relative wavefunction φ_K(δ) from residues.
- Generalisation to 2D: shells of constant N = |δ|, block matrices of size d_N.
- **The inversion:** cost decreases with binding strength. Contrast explicitly with MPS.
- Bipolarons as the physical payoff — two clouds merging, P3's object at two-particle level.

**Canonical derivations owned here:** relative-coordinate two-particle basis; shell block
recurrence in 2D; residue → wavefunction extraction.

**Widget W5 — "Two-Body Bound States on a Lattice"**
Sliders: attraction U, total momentum K, cutoff δ_max. Panels: (a) A(K,ω) with continuum
band and bound-state pole; (b) φ_K(δ) real-space profile with fitted ξ; (c) convergence:
E(δ_max) vs δ_max with the current ξ marked by a vertical line — the reader should see
that convergence sets in right around δ_max ≈ 2ξ.

**Programming companion:** reproduce a bound-state dispersion from Kornilovitch, Ann. Phys.
**460**, 169574 (2024) or the two-particle results of Berciu PRL 107.

**Key refs:** Berciu, PRL **107**, 246403 (2011); Bonča, Trugman, Batistić, PRB **60**, 1633
(1999) for the VED contrast.

---

### P6 — "The Self-Energy Is a Matrix"

**Core content**

- What ARPES measures: three-step model, sudden approximation, and precisely where the
  sudden approximation is load-bearing (flag it — it is the weakest link in P7's argument
  too).
- The standard single-band self-energy extraction recipe from MDC/EDC analysis.
- Multi-orbital breakdown: Σ becomes a matrix, and the measured intensity is a tangled
  function of all its matrix elements weighted by Wannier dipole matrix elements.
- Consequence: extracted "self-energies" in multiband materials can be artefacts.

**Canonical derivations owned here:** sudden approximation statement; matrix-Σ intensity
expression.

**Widget W6 — "What the Fitter Sees"**
Two-band toy model with a known exact matrix Σ. Panels: (a) simulated ARPES intensity with
adjustable dipole matrix element ratio; (b) the self-energy a naive single-band fitter
extracts from that intensity; (c) the true Σ components overlaid. Slider on the dipole
ratio; the reader watches the extracted curve detach from truth. This is the highest-value
widget in the series for an experimental audience.

**Programming companion:** reproduce a figure from Yam, Berciu & Sawatzky, PRB **112**,
115127 (2025).

**Key refs:** Damascelli, Hussain & Shen, RMP **75**, 473 (2003) §II; Yam, Berciu &
Sawatzky, PRB **112**, 115127 (2025).

---

### P7 — "Reading Pairing off a Two-Photon Map"

**Core content**

- Preformed pairs; the pseudogap regime where T_c is phase coherence, not pair breaking.
- One-electron ARPES signature (Kovač et al. 2025): weight cut off at μ − Δ/2 rather than μ.
- Coincidence ARPES: γ→2e vs. 2γ→2e; why the latter is cleaner.
- The energy-conservation argument, which is the whole paper and is genuinely elementary:
  - global: ω₁ + ω₂ ≤ 2μ
  - unpaired: ω₁ ≤ μ **and** ω₂ ≤ μ ⇒ weight in a square
  - paired, type-(i) (different pairs): ω_i ≤ μ − Δ/2 for both ⇒ smaller square
  - paired, type-(ii) (same pair): ω₁ ≤ μ − Δ/2 **or** ω₂ ≤ μ − Δ/2 ⇒ "wings", and a
    forbidden right triangle of leg Δ at the centre
- Phonon-mediated case: satellite diagonals at ω₁ + ω₂ = 2μ − pΩ give the glue boson energy.
- Intensity spread along the type-(ii) diagonal encodes the pair size ξ — P5's bound-state
  radius, read off an experiment.
- Honest caveats: T = 0, sudden approximation (P6's flag comes due), 1D numerics, no
  experiment yet for 2γ→2e.

**Canonical derivations owned here:** the (ω₁,ω₂) allowed-region bounds; type-(i)/type-(ii)
distinction.

**Widget W7 — "The Coincidence Map"**
Pure geometry, cheap to build, extremely illustrative. Sliders: μ, Δ, Ω. Toggle: paired /
unpaired. Toggle: show type-(i) only / type-(ii) only / both. The forbidden triangle, the
wings, the 2μ diagonal, and the phonon satellite diagonals all render live. Add a "read off
Δ" mode that draws the measurement you'd actually make on real data. Optionally overlay a
coarse simulated intensity.

**Programming companion:** reproduce the region structure of Fig. 1 and qualitatively match
Fig. 2 of arXiv:2606.18616 using a small exact-diagonalisation Hubbard chain at N_e = 2.

**Key refs:** Kovač, Nocera, Damascelli, Bonča & Berciu, PRL **134**, 096502 (2025);
Bonča, Damascelli & Berciu, PRL **136**, 196504 (2026); Bonča, Nocera, Damascelli & Berciu,
arXiv:2606.18616; Devereaux et al., PRB **108**, 165134 (2023).

---

## 2. Notation audit — updated with Phase 0 findings

The binding reference is `CONTRIBUTING-posts.md` §4, which is stricter than the concept
registry. Phase 0 found three site-rule violations the v1 table missed (λ, Ω, Z_k); the
agreed resolution is to amend §4 with scoped exceptions (field-standard glyphs, always
decorated where required, no Pauli algebra in this thread, scoping stated in prose). The
exact §4 diff is in the Phase 0 report; apply it in the same commit as P1's scaffold.

| Symbol   | Use in this series                        | Collision                                                                              | Resolution                                                                                                                                                                                           |
| -------- | ----------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `λ`      | dimensionless e–phonon coupling (P4)      | **site rule: λ is the Kibble–Zurek ramp "and nothing else"**                           | Keep λ (field standard); amend §4 with a documented scoped collision, stated where P4 defines λ = E_p/2t.                                                                                            |
| `g`      | bare e–phonon coupling (P3 atomic limit)  | TFIM transverse field (critical-dynamics); g-factor in gμ_B (spin qubits)              | Keep g, scoped to this thread and stated in P3's prose; relation to λ pinned once in P4.                                                                                                             |
| `Ω`      | Einstein phonon frequency                 | **site rule: Rabi frequency + dephasing mean frequency, "do not add a third meaning"** | Keep Ω (field standard); amend §4 to admit the third meaning, scoped to this thread (which contains no drives).                                                                                      |
| `Z, Z_k` | quasiparticle weight (P3 bare, P4 k-res.) | **site rule: Z is the Pauli operator; BTK barrier is "the one exception"**             | Keep Z/Z_k; amend §4 following the BTK precedent (no Pauli algebra in this thread). P3 scopes it in prose where Z = e^(−g²) is derived.                                                              |
| `U`      | Hubbard / e–h attraction                  | unitary operator in matchgate + free-fermion posts                                     | Keep U (field standard; precedent already exists in `exchange-coupling`'s J ≈ 4t²/U). Never use U for a unitary in this series — `V` is the impurity potential, so write `W` if a unitary is needed. |
| `Γ`      | Brillouin-zone Γ point                    | spatial Majorana covariance matrix in free-fermion series                              | Upright \Gamma for the BZ point, italic for covariance; prefer "the zone centre" in prose.                                                                                                           |
| `Δ`      | pair binding energy                       | site-wide: spectral gap (foundations), drive detuning (spin qubits)                    | Compatible — the pair binding energy _is_ a spectral gap. Scope in P7's prose.                                                                                                                       |
| `δ`      | relative displacement between particles   | Kronecker delta; adiabaticity tolerance (geometric-control, scoped there)              | Always write Kronecker with explicit indices δ_αβ; bold 𝛅 for the displacement vector in 2D.                                                                                                         |
| `δ_max`  | truncation cutoff                         | —                                                                                      | Use δ_max everywhere; the source papers switch between δ_M and M.                                                                                                                                    |
| `ξ`      | bound-state radius / pair size            | `correlation-length` (bare, site-wide); SC thread's ξ_k = dispersion-from-μ            | Bare ξ = bound-state/pair size, cross-linked to `correlation-length`. **In P7 never write ξ_k** — if the dispersion measured from μ is needed, write ε(k) − μ.                                       |
| `η`      | spectral broadening                       | none                                                                                   | Clean. Always state its value.                                                                                                                                                                       |
| `z`      | resolvent complex energy                  | lowercase z is a control amplitude in geometric-control (scoped there)                 | Clean in practice; scope in P1's prose.                                                                                                                                                              |
| `γ`      | (avoid)                                   | Majoranas (free-fermions), fluctuator rate (decoherence), lead coupling (IM post)      | Do not use γ for any coupling in this series.                                                                                                                                                        |
| `A(k,ω)` | spectral function                         | —                                                                                      | New canonical, owned by P1.                                                                                                                                                                          |
| `Σ`      | self-energy                               | —                                                                                      | New canonical, owned by P1 (Dyson as definition); the MA evaluation lives in P4.                                                                                                                     |

---

## 3. Concept metadata

Registry schema reminder (per Phase 0): canonical-ness is _derived from post front matter_
(`provides` / `provides_planned`), never recorded in `_data/concepts.yml`. Each id below
needs a full registry entry (`id` / `name` / `symbol` / `blurb` / `tags`) tagged
`[dressed-particles, <kind>]`, added in the same commit as the post that first references
it. New thread `dressed-particles` must be added to the registry header comment,
CONTRIBUTING §1's thread list, `_data/blog_threads.yml`, and (once P1 lands)
`display_categories` in `_config.yml`.

```text
# --- P1 ---
resolvent                     symbol: \hat{G}(z) = (z - H)^{-1}
lehmann-representation
spectral-function             symbol: A(k,\omega)
retarded-greens-function      (retarded vs. advanced vs. time-ordered; why retarded here)
spectral-sum-rules            (moment identities; the validation instrument)
dyson-equation                symbol: \Sigma   (Σ defined non-perturbatively)
self-energy                   (folded into dyson-equation or separate — decide at P1 scaffold)

# --- P2 ---
lattice-greens-function
matrix-continued-fraction
shell-recurrence
bound-state-pole

# --- P3 ---
holstein-model
lang-firsov-transformation
franck-condon-staircase       (atomic-limit sideband ladder, Poisson weights)
quasiparticle-weight          symbol: Z = e^{-g^2} (bare here; Z_k in P4)
phonon-cloud
polaron-crossover             (Gerlach–Löwen smoothness; no self-trapping transition)

# --- P4 ---
momentum-average
ma-hierarchy                  (EOM hierarchy + MA(0) continued fraction; name at scaffold)

# --- P5 ---
few-particle-greens-function
relative-coordinate-basis     symbol: |K, \delta\rangle
separation-truncation         symbol: \delta_{\max}
bipolaron
variational-exact-diagonalization

# --- P6 ---
sudden-approximation
matrix-self-energy
dipole-matrix-element

# --- P7 ---
preformed-pairs
coincidence-arpes
pair-binding-energy           symbol: \Delta
phonon-replica
```

Dropped from v1 (exciton post): `wannier-vs-frenkel-exciton`, `continuum-approximation`,
`multi-orbital-valence-band`, `exciton-momentum-transition`.

Cross-thread links established in Phase 0: P2 `requires: tight-binding-chain` (free-fermions
registry entry — currently has no provider post; retrofit its front matter before P2 lands
so the concept-link resolves). Truncation callouts `uses: matrix-product-states,
correlation-length`. After P1 lands, retrofit `uses: [spectral-function]` onto the
Gaussian-influence-matrix post, whose prose already invokes it.

---

## 4. Claude Code prompts

### Phase 0 — audit ✅ DONE (2026-08-08)

Complete. Findings: no concept collisions (all claims are new canonicals); three notation
site-rule violations resolved by scoped §4 amendments (see §2); scaffold schema corrected to
front-matter-driven `provides_planned`. The §4 diff and the per-post front-matter blocks are
in the Phase 0 report; regenerate the front matter from §3 above (v3 numbering) before
applying.

---

### Post 1 — full drafting prompt

```text
Read docs/berciu-series-roadmap.md section "P1", plus CLAUDE.md, CONTRIBUTING-posts.md,
and _data/concepts.yml.

We are writing Post 1 of the Dressed Particles series:
"Poles, Residues, and Everything Else: What a Green's Function Knows"

AUDIENCE: me — a physics PhD student fluent in second quantization, free fermions,
tensor networks, and quantum information, but new to condensed-matter Green's function
methods. Do not explain second quantization. DO explain everything specific to the
Green's-function tradition, because I have never used it. I know what a resolvent is
as linear algebra; I do not know the field's conventions, instincts, or vocabulary.

STYLE (non-negotiable, from CLAUDE.md):
- Physical intuition in the main text; full derivations in collapsible boxes with stable
  anchor IDs.
- Concrete before abstract. Every formal statement is immediately instantiated on a
  two-site or three-site example before any generality.
- No premature connections to other topics. Mechanism and intuition first.
- Check the concept registry before deriving anything.

NOTATION: follow section 2 of the roadmap exactly. Scope the resolvent variable z in
prose (geometric-control uses lowercase z for a control amplitude). Never use U for a
unitary anywhere in this series.

STRUCTURE (draft ONE section, then STOP and wait for my review before continuing):

  S1. Motivation: why this field's basic object is (z − H)⁻¹ and not the eigenbasis.
      The infinite-lattice argument, and the "one carrier in an empty band" setting
      that makes the whole T = 0 real-frequency program exact rather than approximate.
  S2. The resolvent and the Lehmann representation. Poles, residues, spectral function.
      Collapsible box: full derivation of the Lehmann form.
  S3. Analytic structure. Isolated poles vs. branch cuts; discrete states vs. continua
      in A(ω); what η means physically. Worked on a two-site + continuum toy.
  S4. Time orderings: retarded / advanced / time-ordered. Why retarded, why real
      frequency, why no Matsubara — state explicitly what a field-theory course builds
      that this program does not need, and why. This is the "Mona's perspective"
      section; it earns its length.
  S5. Spectral sum rules. Moments as ⟨k|Hⁿ|k⟩; derive n = 0, 1, 2 in a collapsible box.
      Flag forward: P3 checks these on an exact spectrum; P4 uses them to certify MA.
  S6. Dyson's equation as a definition. Σ = everything G₀ doesn't know; the diagram
      series as one evaluation, not the meaning.
  S7. The variational-space philosophy + the truncation callout box (roadmap §0):
      approximation = restricting the space in which (z − H) is inverted. Set up the
      series' spine; compare to bond-dimension truncation in one paragraph, no more.

After each section: STOP. Show me the section. Wait for explicit approval.
Do not draft the widget until all prose sections are approved.
```

**Widget prompt (after prose approval):**

```text
Build Widget W1: "Anatomy of a Spectral Function". Vanilla JS, self-contained, dark,
teal #1fb2a6, responsive.

- The reader places/drags poles (position, residue) on an energy axis; toggle adds a
  continuum band [−2t, 2t]. Slider: η (log scale).
- Panel A: A(ω) rendered live from the current pole set + continuum.
- Panel B: sum-rule checks n = 0, 1, 2 — target value vs. current value, live, with a
  visible pass/fail margin. The pedagogical point: wildly different spectra can share
  low moments; that freedom is what MA will exploit in P4.
```

---

### Post 2 — full drafting prompt

```text
Read docs/berciu-series-roadmap.md section "P2". Post 1 is published — read it and
link to its canonical anchors for the resolvent, Lehmann representation, spectral
function, sum rules, and Dyson equation. Do NOT re-derive any of those.

Post 2: "Continued Fractions All the Way Down: Lattice Green's Functions"

Same audience, style, and notation rules as Post 1. Use δ_max for the truncation
cutoff, Kronecker deltas always with explicit indices.

STRUCTURE (one section at a time, STOP after each):

  S1. The 1D chain, worked in closed form. Both k-space and real-space representations
      of the same G. This is the anchor example for the whole series.
  S2. The equation-of-motion trick. From ⟨α|Ĝ(z − H)|β⟩ = δ_{αβ} to a coupled linear
      system. Collapsible box: explicit derivation for the 1D chain.
  S3. Matrix continued fractions. The ansatz G_δ = S± G_{δ∓1}, the recursion
      S₊ = [α − β S₊]⁻¹ γ, iteration from S = 0.
  S4. The variational reading: truncating at δ_max means forbidding the particle from
      being that far away — P1 §7's philosophy, first concrete instance.
  S5. Worked example: single impurity on a chain. Bound state peels off the band edge;
      pole appears, wavefunction localizes.
  S6. Truncation callout box: δ_max vs. bond dimension; the error is controlled by a
      physical length, so strongly bound states are CHEAPER — the inverse of the usual
      tensor-network scaling story.

STOP after each section.
```

**Widget prompt (after prose approval):** the Continued Fraction Sandbox as specified in
§1 (sliders V, η, δ_max; panels A(ω), |G(δ)| decay with fitted ξ, convergence error vs.
δ_max with ξ marked; weak/strong binding presets).

---

### Posts 3–7 — roadmap-level prompts

Generate detailed section-by-section prompts **one at a time**, immediately before
executing each post, using the corresponding roadmap section. Do not pre-generate all
five — notation and anchor decisions from earlier posts will change them.

Template:

```text
Read docs/berciu-series-roadmap.md section "P<n>". Posts 1..<n−1> are published — read
them and link to their canonical anchors rather than re-deriving.

Before drafting: propose a section-by-section outline for Post <n> following the
roadmap's Core Content list, in the house style (intuition in main text, derivations in
collapsible boxes with stable anchors). Include for each section which existing anchors
it will link to and which new concepts it will claim as canonical.

Show me the outline and STOP. I will approve or revise before you draft prose.
```

**Special note for P3:** the intuition post must stay concrete — every claim about
dressing is demonstrated on the atomic limit, not asserted. The sum-rule check on the
Franck–Condon staircase links to P1's `spectral-sum-rules` anchor; it is the bridge that
makes P4's certification section land. Requires only P1, so it can be drafted in parallel
with P2 if convenient.

**Special note for P4:** the sum-rule certification section must link back to P1's
`spectral-sum-rules` anchor and P3's staircase check, and show at least one moment check
worked explicitly for MA(0). Cite Goodvin–Berciu–Sawatzky for the systematic version.

**Special note for P7:** the widget is pure geometry and should be built _first_, before
the prose — it will clarify the argument structure while writing. The pair-size section
must link to P5's residue → wavefunction anchor.

---

## 5. Sequencing and honest scoping

- **P1 – P4** is the complete, publishable mini-series and the real learning milestone —
  formalism, machinery, the dressing concept with an exact solution, and the program's
  signature approximation with its certification story. If momentum flags, stop there
  without embarrassment. (P1 + P2 + P3 is a respectable smaller unit: formalism, method,
  and physics, before any approximation.)
- **P5** is load-bearing for P7 but also independently satisfying (the cost-inversion
  post). **P6** stands alone as the most experimentally relevant single post.
- **P7** is the destination: the highest-shareability artefact in the series, and the
  figure-reproduction opening (arXiv:2606.18616) now that the exciton branch is cut.
- This series is a **third parallel track** alongside the free-fermion/matchgate/
  influence-matrix trio and the spin-qubit work. Be deliberate about that. The most
  defensible framing is that it is reconnaissance for a specific collaboration, not
  general interest.

## 6. The research seam to keep in view

Nobody in this community compresses the environment. The shell recurrence is exact but
the block sizes grow with shell number, which is what forces the method back to momentum
space in weak binding. A compressed representation of the |δ| > δ_max sector — where you
have genuine expertise and they do not — would push the crossover. Do not put this in the
posts as a claim. Keep it in the notes, and let P5's truncation callout box set it up
implicitly for a reader who is paying attention.
