#!/usr/bin/env python3
"""
Numerics for "Four Ways to Bend a Ramp".

Two experiments on the two-level Hamiltonian

    H(z, x) = (1/2) ( z sigma_z + x sigma_x ),      gap  D = sqrt(z^2 + x^2)

Experiment A (one control, z):  the four frameworks each prescribe a SCHEDULE
z(t) along a fixed route.  All four reduce to  zdot ~ D^{n+}  with
n+ = 0 (linear), 2 (Fubini-Study / geometric fast-QUAD / QAB), 3 (FAQUAD).
We integrate the Schroedinger equation and compare.

Experiment B (two controls, z and x):  now the PATH itself is an object.
We hold the schedule fixed (constant Fubini-Study speed) and vary only the
route, then ask which geometric length functional orders the routes the way
the time-domain solve does.

Outputs PNGs into assets/img/geometric-control/.
"""

import os

import matplotlib.pyplot as plt
import numpy as np
from scipy.integrate import solve_ivp

OUT = os.path.join(os.path.dirname(__file__), "..", "img", "geometric-control")
os.makedirs(OUT, exist_ok=True)

SX = np.array([[0, 1], [1, 0]], dtype=complex)
SZ = np.array([[1, 0], [0, -1]], dtype=complex)


def hamiltonian(z, x):
    return 0.5 * (z * SZ + x * SX)


def ground_state(z, x):
    """Instantaneous ground state, phase-fixed by a real, continuous convention."""
    d = np.hypot(z, x)
    theta = np.arctan2(x, z)  # polar angle from the +z axis
    return np.array([-np.sin(theta / 2), np.cos(theta / 2)], dtype=complex), d


def evolve(z_of_t, x_of_t, tf, rtol=1e-10, atol=1e-12):
    """Integrate i psi' = H psi from the initial ground state; return infidelity."""
    psi0, _ = ground_state(z_of_t(0.0), x_of_t(0.0))

    def rhs(t, y):
        psi = y[:2] + 1j * y[2:]
        d = -1j * hamiltonian(z_of_t(t), x_of_t(t)) @ psi
        return np.concatenate([d.real, d.imag])

    y0 = np.concatenate([psi0.real, psi0.imag])
    sol = solve_ivp(rhs, (0.0, tf), y0, rtol=rtol, atol=atol, method="DOP853")
    psi = sol.y[:2, -1] + 1j * sol.y[2:, -1]
    target, _ = ground_state(z_of_t(tf), x_of_t(tf))
    return 1.0 - abs(np.vdot(target, psi)) ** 2


# ----------------------------------------------------------------------------
# Experiment A: one control parameter.  zdot ~ D^{n+}.
# ----------------------------------------------------------------------------

def schedule_npos(n_plus, x, Z, tf, n_grid=20001):
    """Return z(t) for the protocol zdot = k * D^{n+}, by inverting t(z)."""
    z = np.linspace(-Z, Z, n_grid)
    d = np.hypot(z, x)
    integrand = d ** (-float(n_plus))
    # t(z) = (tf / I) * int_{-Z}^{z} dz' D^{-n+},  I = int_{-Z}^{Z} dz' D^{-n+}
    cum = np.concatenate([[0.0], np.cumsum(0.5 * (integrand[1:] + integrand[:-1]) * np.diff(z))])
    t = tf * cum / cum[-1]
    return lambda tt: np.interp(tt, t, z)


def experiment_A():
    x, Z = 1.0, 10.0
    protocols = [
        (0, "linear  $(0,0)$,  $n_+=0$", "#1f77b4", "-"),
        (2, "Fubini–Study $(2,2)$ = QAB,  $n_+=2$", "#d62728", "-"),
        (3, "FAQUAD $(4,2)$,  $n_+=3$", "#2ca02c", "--"),
    ]

    tfs = np.logspace(np.log10(1.0), np.log10(400.0), 90)
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.1))

    # (a) pulse shapes at a representative tf
    tf_show = 40.0
    tt = np.linspace(0, tf_show, 800)
    for n, lab, col, ls in protocols:
        zf = schedule_npos(n, x, Z, tf_show)
        axes[0].plot(tt / tf_show, zf(tt) / x, color=col, ls=ls, lw=2, label=lab)
    axes[0].set_xlabel(r"$t/t_f$")
    axes[0].set_ylabel(r"$z(t)/x$")
    axes[0].set_title("(a)  pulse shapes, one control")
    axes[0].legend(fontsize=8.5, loc="lower right")
    axes[0].grid(alpha=0.25)

    # (b) infidelity vs tf
    for n, lab, col, ls in protocols:
        inf = [evolve(schedule_npos(n, x, Z, tf), lambda t: x, tf) for tf in tfs]
        axes[1].loglog(tfs, np.maximum(inf, 1e-16), color=col, ls=ls, lw=1.8, label=lab)

    # QAB computed from its OWN metric, independently, as a consistency check
    inf_qab = [evolve(qab_schedule_1d(x, Z, tf), lambda t: x, tf) for tf in tfs]
    axes[1].loglog(tfs, np.maximum(inf_qab, 1e-16), color="k", ls=":", lw=1.2,
                   label="QAB, from $\\mathrm{Tr}[\\partial H\\partial H]/\\Delta^4$")

    axes[1].set_xlabel(r"$t_f$   (units $1/x$)")
    axes[1].set_ylabel(r"$1-F$")
    axes[1].set_title("(b)  the time-domain referee")
    axes[1].legend(fontsize=8, loc="lower left")
    axes[1].grid(alpha=0.25, which="both")
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "schedules-lz.png"), dpi=170)
    plt.close(fig)

    # numerical statement of "QAB == (2,2)" as pulse shapes
    zf22 = schedule_npos(2, x, Z, tf_show)(tt)
    zfq = qab_schedule_1d(x, Z, tf_show)(tt)
    print(f"[A] max |z_QAB - z_(2,2)| / x  =  {np.max(np.abs(zfq - zf22)) / x:.3e}")


def qab_schedule_1d(x, Z, tf, n_grid=20001):
    """QAB schedule built from g_zz = Tr[(dH/dz)^2]/Delta^4, with no shortcuts."""
    z = np.linspace(-Z, Z, n_grid)
    dHdz = 0.5 * SZ
    g = np.trace(dHdz @ dHdz).real / np.hypot(z, x) ** 4
    integrand = np.sqrt(g)  # ds = sqrt(g_zz) dz ;  sqrt(g) zdot = const
    cum = np.concatenate([[0.0], np.cumsum(0.5 * (integrand[1:] + integrand[:-1]) * np.diff(z))])
    t = tf * cum / cum[-1]
    return lambda tt: np.interp(tt, t, z)


# ----------------------------------------------------------------------------
# Experiment B: two control parameters.  The path is the object.
# ----------------------------------------------------------------------------

def parabola_path(Z, x0, apex, n=4001):
    """Route from (-Z, x0) to (+Z, x0) bowing to coupling `apex` at z = 0."""
    z = np.linspace(-Z, Z, n)
    x = x0 + (apex - x0) * (1.0 - (z / Z) ** 2)
    return z, x


def lengths(z, x):
    """Fubini-Study, FAQUAD (4,2) and QAB lengths of a discretised route."""
    d = np.hypot(z, x)
    theta = np.unwrap(np.arctan2(x, z))
    dtheta = np.abs(np.diff(theta))
    dmid = 0.5 * (d[1:] + d[:-1])
    dl = np.hypot(np.diff(z), np.diff(x))
    L_fs = np.sum(0.5 * dtheta)                     # |dtheta|/2
    L_42 = np.sum(0.5 * dtheta / dmid)              # |dtheta| / (2 Delta)
    L_qab = np.sum(dl / (np.sqrt(2.0) * dmid ** 2))  # dl / (sqrt2 Delta^2)
    return L_fs, L_42, L_qab


def fs_schedule_interpolants(z, x, tf, smooth=False):
    """
    Schedule held FIXED across routes, so only the ROUTE varies.

    smooth=False: constant Fubini-Study speed (theta linear in t) -- the
        protocol every one of the four papers prescribes.  Its velocity
        switches on discontinuously at t=0 and off at t=tf.
    smooth=True: the same arclength profile put through a raised cosine, so
        the switch-on transient is removed (TOMKA smooth their protocols for
        exactly this reason).
    """
    theta = np.unwrap(np.arctan2(x, z))
    s = np.abs(theta - theta[0])
    s = s / s[-1]                       # normalised Fubini-Study arclength
    tau = np.linspace(0, 1, 4001)
    prof = tau if not smooth else 0.5 * (1 - np.cos(np.pi * tau))
    # invert s(route) against the desired profile prof(tau)
    t = tf * np.interp(s, prof, tau)
    return (lambda tt: np.interp(tt, t, z)), (lambda tt: np.interp(tt, t, x))


def qab_geodesic(Z, x0, n=4001):
    """
    Exact QAB geodesic.  With affine controls the QAB metric is
    (1/2) delta_{ij} / Delta^4, conformally flat with factor Delta^{-4}.
    In zeta = z + i x the inversion w = 1/zeta pulls it back to the flat
    metric |dw|/sqrt2, so geodesics are straight segments in w.
    """
    zi, zf = -Z + 1j * x0, Z + 1j * x0
    wi, wf = 1 / zi, 1 / zf
    w = wi + np.linspace(0, 1, n) * (wf - wi)
    zeta = 1 / w
    return zeta.real, zeta.imag


def experiment_B():
    Z, x0 = 10.0, 1.0
    # Routes with apex >= x0/2 keep theta monotone, so all of them subtend
    # exactly the same total |dtheta| between the fixed endpoints.
    apexes = np.geomspace(0.5, 12.0, 40)
    # At a single tf the infidelity is riddled with interference fringes
    # (HYPER's "resonances").  Average over a window of tf to expose the trend.
    tf_window = np.linspace(9.0, 15.0, 21)

    rows = []
    for a in apexes:
        z, x = parabola_path(Z, x0, a)
        L_fs, L_42, L_qab = lengths(z, x)
        vals, vals_s = [], []
        for tf in tf_window:
            zf, xf = fs_schedule_interpolants(z, x, tf)
            vals.append(evolve(zf, xf, tf))
            zs, xs = fs_schedule_interpolants(z, x, tf, smooth=True)
            vals_s.append(evolve(zs, xs, tf))
        rows.append((a, L_fs, L_42, L_qab, float(np.mean(vals)), float(np.mean(vals_s))))
    a, L_fs, L_42, L_qab, inf, inf_s = map(np.array, zip(*rows))

    print(f"[B] Fubini–Study length across the whole family: "
          f"min {L_fs.min():.6f}  max {L_fs.max():.6f}  "
          f"(spread {np.ptp(L_fs) / L_fs.mean():.2e}); pi/2 = {np.pi / 2:.6f}")
    print(f"[B] fringe-averaged infidelity spans {inf.max() / inf.min():.3e} "
          f"(hard switch-on) and {inf_s.max() / inf_s.min():.3e} (smoothed) "
          f"across the same family")

    fig, axes = plt.subplots(1, 2, figsize=(11.5, 4.3))

    # (a) the gap landscape with the competing routes
    ymax = 15.0
    zz, xx = np.meshgrid(np.linspace(-Z, Z, 400), np.linspace(0, ymax, 400))
    cf = axes[0].contourf(zz, xx, np.hypot(zz, xx), levels=24, cmap="viridis")
    plt.colorbar(cf, ax=axes[0], label=r"gap $\Delta$")
    for aa, col in [(0.5, "#ff9896"), (1.0, "#ffffff"), (4.0, "#aec7e8"), (10.0, "#98df8a")]:
        z, x = parabola_path(Z, x0, aa)
        axes[0].plot(z, x, color=col, lw=2,
                     label=fr"apex $x={aa:g}$:   $L_{{\rm FS}}={lengths(z, x)[0]:.4f}$")
    gz, gx = qab_geodesic(Z, x0)
    axes[0].plot(gz, gx, color="k", lw=2.6, ls="--", label="QAB geodesic (exact)")
    apex_qab = gx.max()
    axes[0].annotate(fr"QAB geodesic runs to $x={apex_qab:.0f}$" "\n" r"(unconstrained: off scale)",
                     xy=(0, ymax * 0.985), xytext=(4.0, ymax * 0.30), ha="center", fontsize=8,
                     color="w", arrowprops=dict(arrowstyle="->", color="w", lw=1.4))
    axes[0].set_xlim(-Z, Z)
    axes[0].set_ylim(0, ymax)
    axes[0].set_xlabel(r"detuning $z$")
    axes[0].set_ylabel(r"coupling $x$")
    axes[0].set_title("(a)  four routes, identical Fubini–Study length")
    axes[0].legend(fontsize=7.5, loc="upper left", framealpha=0.85)

    # (b) what each functional predicts vs what actually happens
    ax = axes[1]
    ax.loglog(a, inf, "o-", color="0.45", lw=1.5, ms=3.2,
              label=r"true $1-F$, hard switch-on")
    ax.loglog(a, inf_s, "o-", color="k", lw=1.9, ms=3.5,
              label=r"true $1-F$, smoothed switch-on")
    ax2 = ax.twinx()
    ax2.set_xscale("log")
    ax2.plot(a, L_fs / L_fs[0], color="#d62728", lw=2.2, label=r"$L_{(2,2)}$  Fubini–Study")
    ax2.plot(a, L_42 / L_42[0], color="#2ca02c", lw=2, ls="--", label=r"$L_{(4,2)}$  FAQUAD")
    ax2.plot(a, L_qab / L_qab[0], color="#1f77b4", lw=2, ls=":", label=r"$L_{\rm QAB}$")
    ax2.set_yscale("log")
    ax.set_xlabel(r"apex coupling $x$ at $z=0$   (how far the route detours from the small gap)")
    ax.set_ylabel(r"$1-F$, fixed schedule")
    ax2.set_ylabel("predicted length, normalised to the first route")
    ax.set_title("(b)  which functional orders the routes correctly")
    h1, l1 = ax.get_legend_handles_labels()
    h2, l2 = ax2.get_legend_handles_labels()
    ax.legend(h1 + h2, l1 + l2, fontsize=8, loc="lower left")
    ax.grid(alpha=0.25, which="both")
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "paths-two-parameter.png"), dpi=170)
    plt.close(fig)


# ----------------------------------------------------------------------------
# The bound chain of C3, checked numerically as a matrix inequality.
# ----------------------------------------------------------------------------

def check_bound_chain():
    """g_QAB >= g_(4,2) as quadratic forms, on a random 5-level affine model."""
    rng = np.random.default_rng(7)
    n = 5
    D = []
    for _ in range(3):
        a = rng.normal(size=(n, n)) + 1j * rng.normal(size=(n, n))
        D.append(a + a.conj().T)
    H0 = rng.normal(size=(n, n))
    H0 = H0 + H0.T

    worst = np.inf
    for _ in range(300):
        lam = rng.normal(size=3)
        H = H0 + sum(l * d for l, d in zip(lam, D))
        E, V = np.linalg.eigh(H)
        v = rng.normal(size=3)
        A = sum(vi * d for vi, d in zip(v, D))          # a^mu partial_mu H
        M = V.conj().T @ A @ V
        gaps = E[1:] - E[0]
        g42 = np.sum(np.abs(M[1:, 0]) ** 2 / gaps ** 4)  # projected, per-level gap
        gqab = np.trace(A @ A).real / gaps[0] ** 4       # trace, minimum gap
        worst = min(worst, gqab - g42)
    print(f"[C3] min over 300 random draws of  g_QAB - g_(4,2)  =  {worst:.6e}   (must be >= 0)")


if __name__ == "__main__":
    experiment_A()
    experiment_B()
    check_bound_chain()
    print("figures written to", os.path.normpath(OUT))
