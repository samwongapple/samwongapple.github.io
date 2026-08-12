# Writing posts

The blog is chronological; the knowledge in it is a graph. This file is the contract that
keeps the second thing true without hand-maintaining it.

Three rules, then the details.

1. **Front matter is the single source of truth.** Concept relationships live in post front
   matter and `_data/concepts.yml`. Nothing that could be generated is written twice.
2. **One canonical home per concept.** A concept is _derived_ in exactly one post. Every
   other mention links to that post's anchor.
3. **Fail loudly.** A broken concept reference is a build warning or a validator error, never
   a silent disappearance.

Start a new post with `/newpost` — it runs the intake interview and scaffolds the metadata.

---

## 1. Concept front matter

Four optional lists of concept ids, all drawn from `_data/concepts.yml`:

```yaml
provides: [gaussian-state, correlation-matrix] # canonically derived HERE
provides_planned: [covariance-matrix] # claimed, section not yet written
requires: [second-quantization, partial-trace] # hard prerequisite
uses: [area-law] # invoked in passing
```

Keep the four distinct — the validator's usefulness depends entirely on the distinction
being real.

| Field              | Meaning                                                                                            | Validator treats it as                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `provides`         | This post is the canonical derivation. A reader who wants this is sent **here**. The prose exists. | A provider. Exactly one post may provide a given id.                                 |
| `provides_planned` | A scaffolded section intends to derive it. **The prose does not exist yet.**                       | _Not_ a provider. The concept still reports as a gap, annotated with who claimed it. |
| `requires`         | Hard prerequisite. The post is not readable without it.                                            | A graph edge; participates in cycle detection.                                       |
| `uses`             | Referenced or applied, but you can follow the argument without it.                                 | A reference, for the atlas and dead-entry detection.                                 |

### `provides` vs `provides_planned`

Four of the current posts are partial drafts whose scaffold comments declare sections not yet
written. Those claims go in `provides_planned`. Promote an id to `provides` **in the same
commit that lands the prose**, never before. A `provides_planned` entry does not satisfy
anyone's `requires` — that is the point of the field, and the reason gaps stay visible while
drafts are in flight.

### When does something count as `provides`?

If the post states the result, demonstrates it concretely, and builds on it, that post is the
canonical home — even if it doesn't prove the theorem from axioms. Wick's theorem
(free-fermions §1: stated, one worked factorization, cited) and Wiener–Khinchin
(dephasing §3) both qualify. A bare mention with no working does not.

Concepts a post genuinely just _names_ — dual-unitary circuits, NV centres — go in `uses`, or
nowhere.

### Adding a concept

New concepts get an entry in `_data/concepts.yml` in the same commit as the post that
references them. Fields: `id` (kebab-case, **stable, never renamed** — front matter points at
it), `name`, `symbol` (LaTeX without delimiters, or `null`), `blurb` (one line), `tags`
(`[<thread>, <kind>]`).

Threads: `foundations` · `spin-qubits` · `decoherence` · `free-fermions` ·
`circuits-simulation` · `temporal-methods` · `critical-dynamics` ·
`superconductivity` · `geometric-control` · `solvable-circuits` · `randomness` ·
`monitored` · `dressed-particles`.
Kinds: `prerequisite` · `model` · `formalism` · `technique` · `result` · `phenomenon` ·
`hardware`.

The first tag groups the notation page. The registry deliberately does **not** record which
post provides a concept — that is derived from front matter at build time, so the two can
never disagree.

---

## 2. Anchor discipline

Cross-post links point at a **specific result**, not at a whole post. Every concept a post
provides gets a stable anchor id on the block where it is derived or stated.

```text
id="result-<concept-id>"        a named result, boxed equation, or key claim
id="derivation-<concept-id>"    a collapsible derivation box
id="model-<concept-id>"         a model or convention definition
```

The suffix is the concept id from `_data/concepts.yml`, so the mapping is mechanical and the
validator can check it. Examples in use: `result-peschel-formula`,
`derivation-rotating-wave-approximation`, `model-kicked-ising-floquet`.

Anchors are **permanent**. Renaming one breaks every inbound concept-link, and unlike a
broken URL nothing will tell you. If a derivation moves to a different post, the anchor moves
with the `provides` entry.

On a `<div>`, `<details>`, or `<figure>`, put the id on the element. On a Markdown heading,
use kramdown's attribute syntax:

```text
### Rabi oscillations, geometrically
{: #result-rabi-oscillations }
```

(The attribute line must sit immediately under the heading, with no blank line between.)

## 3. Linking to a concept

```liquid
{% concept_link entanglement-spectrum %}
{% concept_link entanglement-spectrum, text: "the ζ spectrum" %}
```

Resolves to the canonical post plus anchor, pulled from the registry and the post index.
A concept with no provider renders **visibly unresolved** rather than as a dead link — that
is deliberate. If you see one in a rendered page, it means you are leaning on something you
have not written yet.

Do not hand-write cross-post links to derivations. `{% post_url %}` links to a whole post are
fine for "see also"; anything that means "this is derived over there" goes through
`concept_link`, so the validator can see it.

---

## 4. Notation conventions

Site-wide, so that a symbol means one thing across a thread:

- **Pauli operators are `X`, `Y`, `Z`** — not `σ_x`, `σ_y`, `σ_z`. This frees `σ` for
  standard deviations (dephasing) and folded indices (influence matrix), both of which
  collide with Paulis inside a single post otherwise.
- **`ε`** — double-dot detuning (spin qubits) and entanglement energies `ε_k`
  (free fermions). Both field-standard, different threads. The Kibble–Zurek ramp parameter is
  **`λ(t) = t/τ_Q`**, not `ε(t)`, so that `ε_k` stays free for the TFIM dispersion.
- **`Δ`** — drive detuning in the spin-qubit thread, spectral gap everywhere else.
- **`Ω`** — Rabi frequency (spin qubits), mean qubit frequency (dephasing, which says so
  explicitly), and the Einstein phonon frequency (dressed-particles, a thread containing no
  drives, which says so where the Holstein model is defined). Do not add a fourth meaning.
- **`c`** — fermion annihilation operator; also the CFT central charge in one quoted result.
  Prefer `c_i`, `c_i^\dagger` with indices, and write central charge only as `c = 1` in
  context.
- **`λ`** — the Kibble–Zurek quench ramp `λ(t) = t/τ_Q`. One documented scoped collision:
  the dressed-particles thread reuses bare `λ` for the dimensionless electron–phonon
  coupling (the field's glyph); the post that defines the Holstein model says so in prose.
  Everywhere else, nothing but the ramp. The superconductivity thread's penetration depth is
  **always** written `λ_L`, and the Ginzburg–Landau ratio always `κ = λ_L/ξ`. Do not drop
  the subscript, even in a post where no ramp appears.
- **`ξ`** — bare, it is the `correlation-length` prerequisite; the superconductivity thread
  never uses it undecorated. There it means two further things, distinguished by decoration
  and by dimension: `ξ_k` is the dispersion measured from μ (an **energy**), while `ξ_0` and
  `ξ(T)` are the BCS and Ginzburg–Landau coherence lengths (a **length**). This is a
  deliberate collision — the field uses all three and inventing a glyph would cost a reader
  more than it saves. The post that first introduces `ξ_0` must say in prose that it is a
  length and not the `ξ_k` of the previous post.
- **`u^μ`** — control parameters, in the geometric-control thread only. Chosen precisely
  because the field's own letters are all taken here: the source papers write `λ` (owned by
  the Kibble–Zurek ramp), `x` (that thread's toy model needs it for a coupling amplitude) and
  `θ` (a Bloch angle in the same post). `δ` is the adiabaticity tolerance there — all three
  modern papers use it — which leaves `ε` to the spin-qubit thread. Lowercase `z`, `x` are
  control _amplitudes_ multiplying the capital Paulis `Z`, `X`; the post says so where it
  defines the model.
- **`Z`** — the Pauli operator, site-wide, per the first rule above. Two exceptions, both in
  posts containing no qubits and no Pauli algebra, both scoped in prose where the symbol is
  defined: the BTK barrier strength in the Andreev-reflection post, and the quasiparticle
  weight `Z` / `Z_k` in the dressed-particles thread (first derived as `Z = e^{-g²}` in the
  polaron post). Do not create further exceptions.
- **Dressed-particles thread glyphs** — `g` is the bare electron–phonon coupling there (the
  TFIM transverse field and the Zeeman g-factor live in other threads); `δ` is the relative
  displacement between two particles, `δ_max` the truncation cutoff, and the Kronecker delta
  is always written with explicit indices `δ_{αβ}`; `U` is the Hubbard/e–h attraction and
  never a unitary in that thread (`W` if one is needed; `V` is the impurity potential); `Δ`
  is the pair binding energy — a spectral gap, consistent with the site-wide meaning.

Before introducing new notation, check `/notation/`. If it collides with an existing entry,
either pick a different glyph or add a scoped entry and say so in the prose — but never
silently reuse a symbol another post owns.

Every symbol that a concept canonically owns goes in that concept's `symbol` field. That
field is what `/notation/` renders; the page is generated, never hand-edited.

---

## 5. Post checklist

- [ ] `provides` / `requires` / `uses` present (empty lists are fine; **all three absent is a
      validator error**)
- [ ] every id exists in `_data/concepts.yml`; new ones added in the same commit
- [ ] each provided concept has its anchor in the body
- [ ] cross-post derivation references go through `{% concept_link %}`
- [ ] new notation checked against `/notation/`
- [ ] `bin/validate-concepts` passes
