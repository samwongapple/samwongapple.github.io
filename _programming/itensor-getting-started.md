---
layout: post
published: false # hidden — kept as a reusable template; copy this to start a real entry
title: "Getting started with ITensor"
date: 2026-07-07 09:00:00-0700
description: Template for the programming section — a learning note that walks through installing a package, running a first example, and pairing code with the math it implements. Drafted as a scaffold, not a finished tutorial.
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

> ##### TEMPLATE ENTRY
>
> This is a **template**, not a real note yet — it exists to establish the shape of the
> *programming* section: pick a package, install it, run the smallest useful example,
> and line the code up against the math it implements. It was drafted with the help of
> **Claude AI**. Copy this file as a starting point for a real entry.
{: .block-tip }

The *programming* section is where I work through scientific-computing packages by
actually running them — [ITensor](https://itensor.org/), DMRJulia,
[QuantumControl.jl](https://github.com/JuliaQuantumControl/QuantumControl.jl), and
whatever else I end up needing. Each note follows the same rhythm: **what the package
is for**, **the smallest example that does something real**, and **the math the code is
standing in for**.

## What ITensor is for

ITensor is a library for **tensor-network** calculations — DMRG, MPS/MPO manipulation,
and time evolution — where the central object is a tensor carrying named indices rather
than positional axes. A matrix product state factorizes a many-body wavefunction into a
chain of rank-3 tensors:

$$
\lvert \psi \rangle = \sum_{\{s_i\}}
  A^{s_1} A^{s_2} \cdots A^{s_N}\, \lvert s_1 s_2 \cdots s_N \rangle ,
$$

so that a state living in a $2^N$-dimensional Hilbert space is stored in $O(N\,\chi^2)$
numbers, with $\chi$ the bond dimension controlling how much entanglement you keep.

## The smallest real example

Install it from the Julia REPL package manager, then build a two-site spin-1/2 Hilbert
space and read off an operator element:

```julia
using Pkg
Pkg.add("ITensors")

using ITensors

# a lattice of two spin-1/2 sites, each carrying named quantum-number indices
sites = siteinds("S=1/2", 2)

# the Sz operator on site 1, as an ITensor with in/out indices
Sz1 = op("Sz", sites[1])

# contract <up| Sz |up> = +1/2
up = state(sites[1], "Up")
@show scalar(dag(up)' * Sz1 * up)   # -> 0.5
```

The payoff of the named-index model: `Sz1 * up` contracts the *matching* indices
automatically, so you never track which axis is which by hand.

## The math it implements

That `scalar(...)` call is just the expectation value

$$
\langle \uparrow \rvert\, S^z \,\lvert \uparrow \rangle
  = \tfrac{1}{2}\hbar \quad (\hbar = 1),
$$

evaluated by contracting the operator's row/column indices against the state's
indices — the tensor-network spelling of the familiar bra–operator–ket sandwich.

## The template checklist

Every entry in this section should hit these, so the section reads consistently:

- **A one-paragraph "what it's for"** — no marketing, just the job the package does.
- **A runnable smallest example** in a fenced code block (` ```julia `), including the
  install line, so the note is reproducible from scratch.
- **The math the code implements**, with inline math like $\chi$ and display math for
  anything worth setting off.
- **A closing line** on what the example proves or what to try next.
