---
layout: post
published: false # hidden — copy this file to start a real reading note
title: "TEMPLATE — a study note that survives a second reading"
date: 2026-01-01 09:00:00-0700
description: Reusable scaffold for a readings-section note — name the source and the exact scope read, translate its conventions into the thread's dictionary, extract the payload with at least one visual, and end on one open question. Replace this description with the note's real one.
tags: [template]
categories: [negf] # <- a slug from _data/reading_threads.yml files this under a thread
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

> ##### TEMPLATE NOTE
>
> A **scaffold**, not a real note — copy it to start one. It encodes the shape every
> readings-section note should have: *name the source and exact scope read → translate
> conventions into the thread's dictionary → extract the payload, with at least one
> visual → connect to what the site already derives → end on one open question.* A study
> note follows its source's ordering and is honest about what was skipped — it is notes
> written to be reread, not an essay. Drafted with **Claude AI**.
{: .block-tip }

One paragraph of orientation: where this note sits in the thread, what the previous note
left open, and what question this one answers.

<p class="source-note"><span class="source-label">Read for this note</span> Author, <em>Title</em>, §x.y–x.z (pp. NN–MM), plus any secondary source and its role — e.g. "Kita §3.3 for the branch-index alternative". Say explicitly what was skimmed or skipped inside that range.</p>

<p class="thread-note"><span class="thread-label">The through-line</span> State the one idea to hold onto while reading — the thread the whole note keeps returning to.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · The idea in the source's own terms

The core content, following the source's logic. Inline math uses double dollars —
$$G^R$$, $$\lvert\psi\rangle$$ — because a single `$` lets kramdown eat underscores.
Display equations get their own block and are auto-numbered:

$$
i\partial_t G = \delta + \Sigma \ast G .
$$

Quote the source's key equations with its equation numbers in parentheses so the note can
be read next to the book.

## 2 · Conventions: the dictionary

Where this source's notation differs from the thread's canonical dictionary (see the
thread's conventions note / roadmap §B.2), translate it *here*, once, in a table — every
later section uses only thread conventions.

| This source writes | Thread convention | Watch out for |
| ------------------ | ----------------- | ------------- |
|                    |                   |               |

## 3 · The payload

The sections that do the work — usually two or three, named for the physics, not for the
book's section titles. **Every note carries at least one visual**: a theme-aware inline
SVG diagram for structures (contours, component tables, diagram topologies) or a
`<canvas>` + `<script>` widget for anything with a knob worth turning (widgets read
theme colours from `--global-theme-color` / `--global-text-color`; JS goes in
`assets/js/<note-slug>.js`). A figure the reader can manipulate teaches more than a
paragraph — prefer the widget when the idea *is* a dependence on a parameter.

Worked micro-examples beat quoted generality: instantiate the formalism on the smallest
system that exercises it (one mode, one level, two sites).

## 4 · What this connects to

Where this lands in the site's existing graph: cite blog derivations via
`{% raw %}{% concept_link some-concept %}{% endraw %}` instead of re-deriving them, and
say concretely what this note adds to (or reinterprets from) an existing thread. Study
notes default to `provides: []` — the blog stays the canonical home of derivations.

## 5 · What stuck, and what's open

Two or three sentences of what the reading actually changed in my head, then **one** open
question to carry into the next note. Keep the broader arc internal — end on the
question, not a roadmap.

<div class="sec-divider" aria-hidden="true">•••</div>

## References

<!-- Cite inline in the BODY prose with {% raw %}{% cite key --file refs_negf %}{% endraw %}
     (never dump cite tags here — they render as a stray "(Author, year)" paragraph).
     This section holds only the list: -->
<!-- {% raw %}{% bibliography --file refs_negf --cited --group_by none %}{% endraw %} -->

> ##### ABOUT THIS NOTE
>
> A learning-in-public study note: I write these while working through books and long
> reviews, with **Claude AI** as a collaborator — the reading, the direction, and the
> physics-checking are mine. Notes follow their sources closely and say so where they do.
> Corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
