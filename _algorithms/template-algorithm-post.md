---
layout: post
published: false # hidden — copy this file to start a real algorithm entry
title: "TEMPLATE — an algorithm, implemented and checked"
date: 2026-01-01 09:00:00-0700
description: Reusable scaffold for an algorithms-section entry — state the algorithm and the math it implements, build a reference to check against, implement it, run it, and grade the run against that reference. Replace this description with the entry's real one.
tags: [template]
categories: [tensor-networks] # <- a slug from _data/algorithm_threads.yml files this under a thread
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

> ##### TEMPLATE ENTRY
>
> A **scaffold**, not a real entry — copy it to start one. It encodes the shape every
> algorithms-section post should have: *state the algorithm and its math → build a
> reference you trust → implement → run → grade the run against the reference.* Every
> quantitative claim should come from code you actually ran, checked against an exact or
> independent result. Drafted with **Claude AI**.
{: .block-tip }

One paragraph of orientation: which algorithm this is, what problem it solves, and why it's
worth taking apart. Name the package(s) or say it's from scratch. Keep the marketing out —
say the job the algorithm does.

<p class="thread-note"><span class="thread-label">The through-line</span> State the one idea to hold onto while reading — the thread the whole entry keeps returning to.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · The algorithm

What it computes and the math it implements. Inline math uses double dollars —
$$\chi$$, $$\lvert\psi\rangle$$ — because a single `$` lets kramdown eat underscores.
Display equations get their own block and are auto-numbered:

$$
H \lvert \psi_0 \rangle = E_0 \lvert \psi_0 \rangle .
$$

Say what makes the naive approach expensive (the cost that motivates this algorithm), and
what the algorithm trades to beat it.

## 2 · A reference to check against

The honest baseline — an exact/brute-force result, a known analytic value, or an
independent method — that the implementation must reproduce. This is what turns "it ran"
into "it's right." State the target number here.

```julia
# the reference calculation (small enough to trust), producing the number to hit
```

## 3 · Implementation

The algorithm itself, in a runnable block including any install/setup line so the entry is
reproducible from scratch. Keep it the *smallest* code that does the real thing.

```julia
using SomePackage

# ... the core of the algorithm ...
# result -> matches the §2 reference
```

Point out the one or two lines where the key idea actually lives.

## 4 · Running it

The result, next to the §2 reference — agreement is the payoff. If there's a knob worth
sweeping (bond dimension, step size, sample count), show the convergence. An interactive
`<canvas>` + `<script>` widget can go here for that (reads theme colours from
`--global-theme-color` / `--global-text-color`); otherwise a table or a short output block.

## 5 · What it teaches

The one thing the exercise made concrete, and a single open question to carry forward. Keep
the broader arc internal — end on the question, not a roadmap.

<div class="sec-divider" aria-hidden="true">•••</div>

## References

<!-- Add a _bibliography/refs_<topic>.bib file, cite with {% raw %}{% cite key --file refs_topic %}{% endraw %}, then list them: -->
<!-- {% raw %}{% bibliography --file refs_topic --cited --group_by none %}{% endraw %} -->

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the tools behind my PhD, with
> **Claude AI** as a collaborator. Every number here was produced by actually running the
> code on my own machine and checked against an independent reference — the direction and
> the physics-checking are mine. Corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
