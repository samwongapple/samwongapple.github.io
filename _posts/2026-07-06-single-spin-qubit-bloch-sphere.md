---
layout: post
published: false # hidden for now — kept as a reusable template; real posts have started
title: A single spin qubit and the Bloch sphere
date: 2026-07-06 02:00:00-0700
description: Building intuition for one spin — Larmor precession, the Bloch sphere, and an interactive widget. Also serves as the template post showing math, code, and embedded animations.
tags: spin-qubits intuition
categories: learning-notes
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

> ##### TEMPLATE POST
>
> This is a **template**, not a real entry yet — it exists to demonstrate the blog's
> toolkit (inline/display math, syntax-highlighted code, and embedded interactive
> animations). It was drafted with the help of **Claude AI**. My first proper post is
> coming soon; until then, copy this file as a starting point.
{: .block-tip }

This template walks through **one spin in a magnetic field** while showing every
ingredient I want in future posts — prose, inline and display math, a
syntax-highlighted code block, and a small **interactive animation** embedded right in
the page.

## The picture first

Before any formalism: a spin-1/2 particle in a static magnetic field behaves like a
tiny compass needle that *precesses* rather than settling. If we point the field along
$z$, the spin's expectation value sweeps around the $z$-axis at a fixed rate. That rate
is the **Larmor frequency** $\omega_L = \gamma B_0$, where $\gamma$ is the
gyromagnetic ratio and $B_0$ the field strength.

We track the state on the **Bloch sphere**, writing any pure single-qubit state with
two angles:

$$
\lvert \psi \rangle = \cos\!\frac{\theta}{2}\,\lvert 0 \rangle
  + e^{i\phi}\sin\!\frac{\theta}{2}\,\lvert 1 \rangle .
$$

Under the Zeeman Hamiltonian $H = -\tfrac{1}{2}\hbar\omega_L\,\sigma_z$, the polar
angle $\theta$ is frozen while the azimuthal angle winds linearly in time,
$\phi(t) = \phi_0 - \omega_L t$. So on the sphere the tip just circles a line of
constant latitude — that is Larmor precession.

## See it move

Here is the top-down view of the Bloch vector (looking down the $z$-axis): the tip
traces a circle in the $x$–$y$ plane. Drag the slider to change $\omega_L$, or pause it.

<div class="bloch-widget" style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;text-align:center;">
  <canvas id="bloch-canvas" width="260" height="260" style="max-width:100%;"></canvas>
  <div style="display:flex;gap:1rem;align-items:center;justify-content:center;margin-top:0.75rem;flex-wrap:wrap;">
    <label style="font-size:0.9rem;">
      &omega;<sub>L</sub>
      <input id="bloch-freq" type="range" min="0" max="3" step="0.05" value="1" style="vertical-align:middle;">
    </label>
    <button id="bloch-toggle" style="cursor:pointer;padding:0.25rem 0.75rem;border-radius:6px;border:1px solid var(--global-divider-color);background:transparent;color:var(--global-text-color);">Pause</button>
  </div>
</div>

<script>
  (function () {
    var canvas = document.getElementById("bloch-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var freq = document.getElementById("bloch-freq");
    var toggle = document.getElementById("bloch-toggle");
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.38;
    var phi = 0, last = null, running = true;

    function accent() {
      var c = getComputedStyle(document.documentElement).getPropertyValue("--global-theme-color");
      return c.trim() || "#1fb2a6";
    }
    function textColor() {
      var c = getComputedStyle(document.documentElement).getPropertyValue("--global-text-color");
      return c.trim() || "#888";
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // guide circle + axes
      ctx.strokeStyle = textColor();
      ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
      ctx.globalAlpha = 1;
      // precessing vector
      var x = cx + R * Math.cos(phi);
      var y = cy - R * Math.sin(phi);
      ctx.strokeStyle = accent();
      ctx.fillStyle = accent();
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    }

    function frame(t) {
      if (last === null) last = t;
      var dt = (t - last) / 1000; last = t;
      if (running) phi -= parseFloat(freq.value) * dt * 2;
      draw();
      requestAnimationFrame(frame);
    }

    toggle.addEventListener("click", function () {
      running = !running;
      toggle.textContent = running ? "Pause" : "Play";
    });

    draw();
    requestAnimationFrame(frame);
  })();
</script>

Notice the tip never changes its distance from the centre: precession preserves the
polar angle, exactly as $\phi(t) = \phi_0 - \omega_L t$ predicts. Setting $\omega_L = 0$
freezes the spin — no field, no precession.

## Simulating it numerically

The same dynamics, integrated with a tiny bit of NumPy. We evolve the state vector
with the propagator $U(t) = e^{-iHt/\hbar}$ and read off $\langle \sigma_x \rangle$:

```python
import numpy as np

# Pauli matrices
sx = np.array([[0, 1], [1, 0]], dtype=complex)
sz = np.array([[1, 0], [0, -1]], dtype=complex)

omega_L = 1.0                      # Larmor frequency (rad/s)
H = -0.5 * omega_L * sz            # Zeeman Hamiltonian (hbar = 1)

# start on the equator: (|0> + |1>) / sqrt(2)
psi0 = np.array([1, 1], dtype=complex) / np.sqrt(2)

def evolve(psi, H, t):
    # eigendecomposition -> exact propagator for a time-independent H
    vals, vecs = np.linalg.eigh(H)
    U = vecs @ np.diag(np.exp(-1j * vals * t)) @ vecs.conj().T
    return U @ psi

for t in np.linspace(0, 2 * np.pi, 5):
    psi = evolve(psi0, H, t)
    exp_sx = np.real(psi.conj().T @ sx @ psi)
    print(f"t = {t:4.2f}   <sx> = {exp_sx:+.3f}")
```

The printed $\langle \sigma_x \rangle$ traces a cosine — the $x$-projection of the arrow
circling above.

## The template checklist

This post deliberately exercises the whole toolkit so I can reuse it:

- **Inline math** like $\omega_L = \gamma B_0$ with single `$…$`.
- **Display math** in its own paragraph with `$$…$$`.
- **Fenced code blocks** (` ```python `) with syntax highlighting.
- **An embedded `<canvas>` + `<script>`** for interactive animations, dropped straight
  into the Markdown.

Everything inherits the site's dark theme and teal accent automatically, because the
widget reads its colours from the theme's CSS variables.
