---
layout: post
title: "Same chain, two libraries: DMRG in ITensor and DMRJulia"
date: 2026-07-07 09:00:00-0700
description: Running the same spin-1/2 Heisenberg chain through ITensor and DMRJulia — checked against exact diagonalization. Identical energies to ten digits; the real difference is what each library asks you to write and what it shows you.
tags: [dmrg, tensor-networks, julia]
categories: [programming]
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
</style>

This is the first entry in the *programming* section, where I learn a package by making it
do something I can check. The plan here: take one small, exactly-solvable physics problem —
the antiferromagnetic Heisenberg chain — and compute its ground state two ways, with
[ITensor](https://itensor.org/) {% cite fishman2022itensor --file refs_dmrg %} and with
[DMRJulia](https://github.com/bakerte/DMRJtensor.jl) {% cite baker2021dmrjulia --file refs_dmrg %}.
Both run the **density matrix renormalization group** (DMRG) {% cite white1992density --file refs_dmrg %},
the workhorse algorithm for one-dimensional quantum systems. The interesting part is not
which wins — spoiler: they agree to ten digits — but what each one asks you to write, and
what it shows you while it works.

<p class="thread-note"><span class="thread-label">The through-line</span> Same Hamiltonian, same algorithm, same answer. Everything that differs between these two libraries is a choice about ergonomics and transparency — so watch what the code looks like, and what the console prints.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · The problem

The spin-$$\tfrac12$$ **antiferromagnetic Heisenberg chain** is the "hello world" of DMRG.
Put a spin-$$\tfrac12$$ on each of $$N$$ sites in a line and couple neighbours with the
isotropic exchange interaction:

$$
H = J\sum_{i=1}^{N-1} \vec S_i\cdot\vec S_{i+1}
  = J\sum_{i=1}^{N-1}\Big[S^z_iS^z_{i+1}
    + \tfrac12\big(S^+_iS^-_{i+1}+S^-_iS^+_{i+1}\big)\Big],
$$

with $$J=1>0$$ (antiferromagnetic) and open ends. The second form is the one you actually
type into a computer: the diagonal $$S^zS^z$$ term, plus a "hopping" of spin flips written
with the raising and lowering operators $$S^\pm = S^x\pm iS^y$$, which is how
$$S^x_iS^x_{i+1}+S^y_iS^y_{i+1}$$ looks once you've made it manifestly particle-conserving.

Why this problem? Because we *know the answer*. In the thermodynamic limit the Bethe ansatz
{% cite bethe1931theorie --file refs_dmrg %} gives the exact ground-state energy per bond,

$$
\frac{E_0}{N} \xrightarrow{N\to\infty} \frac14 - \ln 2 \approx -0.4431,
$$

and for a finite chain we can get the exact number by brute force. That gives us a neutral
referee to check both libraries against before we trust either.

## 2 · A neutral referee: exact diagonalization

Before DMRG, the honest baseline. For $$N$$ sites the Hilbert space has dimension $$2^N$$, so
we can build $$H$$ as a $$2^N\times 2^N$$ matrix and diagonalize it directly — feasible for
$$N=12$$ ($$4096\times4096$$), hopeless much beyond that, which is *exactly why DMRG exists*.
Each term is a Kronecker product of Pauli-derived $$2\times2$$ blocks with identities on the
other sites:

```julia
using LinearAlgebra

const Sx = [0.0 0.5; 0.5 0.0]
const Sy = [0.0 -0.5im; 0.5im 0.0]
const Sz = [0.5 0.0; 0.0 -0.5]
const Id = [1.0 0.0; 0.0 1.0]

# operator O on site `site` of an N-site chain, as a 2^N x 2^N matrix
function embed(O, site, N)
    m = site == 1 ? O : Id
    for k in 2:N
        m = kron(m, k == site ? O : Id)
    end
    return m
end

function heisenberg_H(N)
    H = zeros(ComplexF64, 2^N, 2^N)
    for i in 1:(N - 1)
        H += embed(Sx, i, N) * embed(Sx, i + 1, N)
        H += embed(Sy, i, N) * embed(Sy, i + 1, N)
        H += embed(Sz, i, N) * embed(Sz, i + 1, N)
    end
    return Hermitian(H)
end

vals, vecs = eigen(heisenberg_H(12))
vals[1]   # -5.1420906328
```

So the target for $$N=12$$ is

$$
E_0^{\text{exact}} = -5.1420906328,\qquad
\frac{E_0}{N-1} = -0.4674627848\ \text{per bond}.
$$

(The finite chain sits above the infinite-chain $$-0.4431$$; open ends cost energy.) Now let's
see whether DMRG can reach that number without ever forming a 4096-dimensional vector.

<div class="sec-divider" aria-hidden="true">•••</div>

## 3 · ITensor: the ergonomic route

ITensor's central idea is the **named index**: every tensor carries labelled legs, and
contractions match legs by name, so you never track axis order by hand. You declare a chain
of spin-$$\tfrac12$$ sites, spell the Hamiltonian as a sum of named operator strings with the
`OpSum` mini-language, compile that to a matrix product operator (MPO), and hand it to `dmrg`
with a random matrix product state (MPS) to start from:

```julia
using ITensors, ITensorMPS

N = 12
sites = siteinds("S=1/2", N)

os = OpSum()
for j in 1:(N - 1)
    os += "Sz", j, "Sz", j + 1
    os += 1/2, "S+", j, "S-", j + 1
    os += 1/2, "S-", j, "S+", j + 1
end
H = MPO(os, sites)

psi0 = random_mps(sites; linkdims=10)
energy, psi = dmrg(H, psi0; nsweeps=8, maxdim=200, cutoff=1e-12)
# energy -> -5.1420906328
```

Notice how directly the code mirrors the second line of the Hamiltonian in §1: `os += "Sz",
j, "Sz", j+1` *is* $$S^z_jS^z_{j+1}$$. The operators are strings; the physics of what
`"S+"` means on a spin-$$\tfrac12$$ site is ITensor's problem, not yours. And `dmrg` is quiet
— it returns a number and the optimized state, and by default says almost nothing about how
it got there. That reticence is the whole aesthetic: describe the model, get the answer.

It lands on **−5.1420906328** — the exact energy, to every digit ED gave us.

## 4 · DMRJulia: the same climb, narrated

DMRJulia (the package is `DMRJtensor`) is built for a different purpose. It accompanies a
series of *"build your own tensor network library"* papers
{% cite baker2021dmrjulia baker2019basic --file refs_dmrg %}, and it is written to be read and
to teach the algorithm rather than to hide it. The high-level path is short — there's a
prebuilt Heisenberg Hamiltonian:

```julia
using DMRJtensor

N = 12
mpo = makeMPO(heisenbergMPO, 2, N)   # spin-1/2 (physical dimension 2), N sites
psi = randMPS(2, N)

energy = dmrg(psi, mpo; sweeps=30, m=200, cutoff=1e-12, method="twosite")
# energy -> -5.1420906328
```

Two small tells of the different philosophy are already visible. The physical space is an
**integer dimension** (`2`), not a named `"S=1/2"` site type — you're closer to the raw
tensors. And if you'd rather assemble the Hamiltonian yourself, you work with the actual
operator matrices instead of strings:

```julia
Sp, Sm, Sz = spinOps(s=0.5)          # returns the 2x2 operator matrices
mpo = 0
for i in 1:(N - 1)
    mpo += mpoterm(0.5, Sp, i, Sm, i + 1)
    mpo += mpoterm(0.5, Sm, i, Sp, i + 1)
    mpo += mpoterm(Sz, i, Sz, i + 1)
end
mpo = MPO(mpo)
```

The biggest difference, though, is what `dmrg` *prints*. Where ITensor is silent, DMRJulia
narrates every sweep — the energy so far, the truncation error, and, tellingly, the
**entanglement entropy** and **singular-value spectrum** at the centre bond:

```text
Sweep 8  (back and forth): 0.013 sec
  Largest truncation = 9.3e-13,  m = 42
  Energy at sweep 8 is  -5.074056185132
  SvN at center bond b=6 = 0.5305
  Singular values: [0.9324, 0.2355, 0.2048, 0.1817, ...]

Sweep 9   Energy is -5.141725636624
Sweep 10  Energy is -5.142090521222
Sweep 12  Energy is -5.142090632836   # converged to the ED value
```

That singular-value list is the heart of why DMRG works, printed in your face: the reduced
state at the cut is dominated by a handful of Schmidt values, so keeping a modest bond
dimension $$m$$ captures almost all the entanglement. ITensor computes exactly the same
quantities internally — it just doesn't show you. DMRJulia treats that display as the point.

And the answer? Also **−5.1420906328**. Two independent codebases, the same ten digits.

<div class="sec-divider" aria-hidden="true">•••</div>

## 5 · One observable: antiferromagnetic correlations

An energy is one number; a wavefunction is a lot more. The natural thing to ask of an
antiferromagnet is how neighbouring spins line up, through the correlation
$$\langle S^z_1 S^z_r\rangle$$. Both libraries expose this in one call —
`correlation_matrix(psi, "Sz", "Sz")` in ITensor, `correlationmatrix(psi, Sz, Sz)` in
DMRJulia — and both reproduce the ED numbers exactly:

| $$r$$ | $$\langle S^z_1 S^z_r\rangle$$ |
|:---:|:---:|
| 1 | $$+0.2500$$ |
| 2 | $$-0.2188$$ |
| 3 | $$+0.0661$$ |
| 4 | $$-0.0735$$ |
| 5 | $$+0.0365$$ |
| 6 | $$-0.0431$$ |

The sign **alternates** with distance — the fingerprint of antiferromagnetic order, spins
wanting to point opposite to their neighbours — while the magnitude decays. ($$r=1$$ is just
$$\langle (S^z)^2\rangle = \tfrac14$$, a handy sanity check.) Three independent methods, one
correlation function, digit-for-digit agreement.

## 6 · Head to head

The convergence is the clearest way to see that these are two roads up the same mountain.
Sweep the bond dimension and watch the per-bond energy error against the ED value fall
— exponentially, and in lockstep between the two libraries:

<div class="conv-widget" style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem 0.75rem 0.5rem;margin:1.5rem 0;text-align:center;">
  <canvas id="conv-canvas" width="440" height="300" style="max-width:100%;"></canvas>
  <p style="font-size:0.85rem;opacity:0.75;margin:0.5rem 0 0;">
    Ground-state energy error per bond vs. bond dimension $$m$$, $$N=12$$ chain.
    Both libraries converge exponentially and essentially on top of each other;
    by $$m\!\geq\!32$$ both hit the exact-diagonalization value.
  </p>
</div>

<script>
  (function () {
    var canvas = document.getElementById("conv-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");

    // Real measured data: per-bond |E - E_exact| at bond dimension m, N=12.
    var ms = [2, 4, 8, 16];
    var itensor  = [2.181e-2, 8.846e-4, 4.022e-6, 5.39e-9];
    var dmrjulia = [2.097e-2, 8.840e-4, 3.962e-6, 5.35e-9];

    var W = canvas.width, H = canvas.height;
    var L = 56, R = 14, T = 16, B = 40;          // padding
    var pw = W - L - R, ph = H - T - B;
    var logTop = -1, logBot = -9;                // y-axis: 1e-1 down to 1e-9

    function accent() {
      var c = getComputedStyle(document.documentElement).getPropertyValue("--global-theme-color");
      return c.trim() || "#1fb2a6";
    }
    function amber() {
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      return dark ? "#e0a63a" : "#b3760a";
    }
    function textColor() {
      var c = getComputedStyle(document.documentElement).getPropertyValue("--global-text-color");
      return c.trim() || "#888";
    }

    function xFor(i) { return L + (ms.length === 1 ? 0 : i / (ms.length - 1) * pw); }
    function yFor(err) {
      var lg = Math.log(err) / Math.LN10;
      var frac = (logTop - lg) / (logTop - logBot);
      return T + frac * ph;
    }

    function series(data, color) {
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var x = xFor(i), y = yFor(data[i]);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      for (var j = 0; j < data.length; j++) {
        ctx.beginPath(); ctx.arc(xFor(j), yFor(data[j]), 4, 0, Math.PI * 2); ctx.fill();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var tc = textColor();
      ctx.font = "11px -apple-system, sans-serif";
      ctx.textBaseline = "middle";

      // horizontal decade gridlines + labels
      ctx.strokeStyle = tc; ctx.fillStyle = tc;
      for (var e = logTop; e >= logBot; e--) {
        var y = T + (logTop - e) / (logTop - logBot) * ph;
        ctx.globalAlpha = 0.12;
        ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + pw, y); ctx.stroke();
        ctx.globalAlpha = 0.7; ctx.textAlign = "right";
        ctx.fillText("10" + supr(e), L - 8, y);
      }
      // x-axis labels (m)
      ctx.globalAlpha = 0.7; ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (var i = 0; i < ms.length; i++) {
        ctx.fillText("m=" + ms[i], xFor(i), T + ph + 8);
      }
      ctx.globalAlpha = 1; ctx.textBaseline = "middle";

      series(dmrjulia, amber());
      series(itensor, accent());

      // legend
      var lx = L + pw - 108, ly = T + 6;
      ctx.textAlign = "left";
      ctx.fillStyle = accent(); ctx.fillRect(lx, ly - 4, 14, 3);
      ctx.fillStyle = textColor(); ctx.fillText("ITensor", lx + 20, ly - 2);
      ctx.fillStyle = amber(); ctx.fillRect(lx, ly + 12, 14, 3);
      ctx.fillStyle = textColor(); ctx.fillText("DMRJulia", lx + 20, ly + 14);
    }

    function supr(e) {
      var map = {"-":"⁻","1":"¹","2":"²","3":"³","4":"⁴",
                 "5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","0":"⁰"};
      return String(e).split("").map(function (c) { return map[c] || c; }).join("");
    }

    draw();
    // redraw on theme toggle so colours track light/dark
    new MutationObserver(draw).observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-theme"]
    });
  })();
</script>

Pulling the comparison together:

| | **ITensor** | **DMRJulia** (`DMRJtensor`) |
|---|---|---|
| Site space | `siteinds("S=1/2", N)` — named site type | `randMPS(2, N)` — integer physical dimension |
| Hamiltonian | `OpSum` DSL of operator **strings** | prebuilt `heisenbergMPO`, or explicit operator **matrices** via `mpoterm` |
| DMRG call | `dmrg(H, ψ; nsweeps, maxdim, cutoff)` → `(E, ψ)` | `dmrg(ψ, mpo; sweeps, m, method)` → `E` |
| Per-sweep output | silent by default | narrates energy, truncation, entropy, singular values |
| Observables | `correlation_matrix(ψ,"Sz","Sz")` | `correlationmatrix(ψ, Sz, Sz)` |
| $$E_0$$ ($$N{=}12$$) | $$-5.1420906328$$ | $$-5.1420906328$$ |
| Ecosystem | large community, extensive docs, C++ and Julia | smaller, pedagogical, tied to the "build-your-own" papers |

The energies are indistinguishable. The libraries are not — and the difference is entirely
about what each optimizes for.

## 7 · Which to reach for

If I want a ground state so I can get on with the physics, ITensor's `OpSum` → `MPO` →
`dmrg` is hard to beat: the code reads like the Hamiltonian and the machinery stays out of
the way. If I want to *understand* DMRG — to watch the entanglement entropy grow and the
Schmidt spectrum decay as the sweeps converge, or to open up the source and see how a sweep
is actually assembled — DMRJulia is built for exactly that, and its per-sweep narration turns
a black box into a lecture. **ITensor to get the answer; DMRJulia to understand the answer.**
For a first real problem, running both against the same ED benchmark taught me more than
either would have alone.

<div class="sec-divider" aria-hidden="true">•••</div>

## References

{% bibliography --file refs_dmrg --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the tools behind my PhD, with
> **Claude AI** as a collaborator. Every number here was produced by actually running the
> code on my own machine and checked against exact diagonalization — the direction and the
> physics-checking are mine. Corrections welcome!
{: .block-tip }
