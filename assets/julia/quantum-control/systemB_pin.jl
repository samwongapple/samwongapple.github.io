# systemB_pin.jl — pin the CNOT/ZZ convention numerically, BEFORE trusting any T_min formula.
#  (a) explicit identity: CNOT = (I⊗H) · CZ · (I⊗H)  with
#      CZ = e^{iπ/4} · e^{-i(π/4) Z⊗Z} · e^{i(π/4) Z⊗I} · e^{i(π/4) I⊗Z}
#      ⇒ CNOT needs ZZ-angle exactly π/4 (convention H_drift = J σz⊗σz ⇒ T_min = π/(4J)).
#  (b) Makhlin invariants: CNOT vs e^{-i(π/4)ZZ} — locally equivalent iff (G1,G2) equal.
#      Also: with the OTHER convention H = (J/2) σzσz, the class of e^{-iT(J/2)ZZ} hits
#      CNOT's invariants at T = π/(2J) — that's where the π/(2J) papers live.
#  (c) locals-only ED referee: for drift angle θ = JT < π/4, the best achievable
#      F = max over single-qubit dressings of |Tr((k1⊗k2 · e^{-iθZZ} · k3⊗k4)† CNOT)|²/16.
#      This curve is the floor GRAPE must sit on below the cliff.

include("grape_core.jl")
using Optim, Random, Printf

const CNOT = ComplexF64[1 0 0 0; 0 1 0 0; 0 0 0 1; 0 0 1 0]
const Had = ComplexF64[1 1; 1 -1] ./ sqrt(2)
ZZ = sz ⊗ sz

# ---------- (a) explicit identity ----------
CZ = exp(-im * π / 4) * exp(-im * π / 4 .* ZZ) * exp(im * π / 4 .* (sz ⊗ id2)) * exp(im * π / 4 .* (id2 ⊗ sz))
lhs = (id2 ⊗ Had) * CZ * (id2 ⊗ Had)
@printf("(a) ‖(I⊗H)·CZ(from ZZ)·(I⊗H) − CNOT‖_max = %.2e\n", maximum(abs.(lhs .- CNOT)))

# ---------- (b) Makhlin invariants ----------
const Q = ComplexF64[1 0 0 im; 0 im 1 0; 0 im -1 0; 1 0 0 -im] ./ sqrt(2)  # magic basis
function makhlin(U)
    V = U ./ det(U)^(1 / 4)              # take U into SU(4) (up to ±i ambiguity, G-invariant combo below)
    m = transpose(Q' * V * Q) * (Q' * V * Q)
    g1 = tr(m)^2 / 16
    g2 = (tr(m)^2 - tr(m^2)) / 4
    (g1, real(g2))
end
gC = makhlin(CNOT)
gZ = makhlin(exp(-im * π / 4 .* ZZ))
@printf("(b) Makhlin  CNOT:            G1 = %.6f%+.6fim   G2 = %.6f\n", real(gC[1]), imag(gC[1]), gC[2])
@printf("    Makhlin  e^{-iπ/4 ZZ}:    G1 = %.6f%+.6fim   G2 = %.6f\n", real(gZ[1]), imag(gZ[1]), gZ[2])
@printf("    max|Δ| = %.2e\n", max(abs(gC[1] - gZ[1]), abs(gC[2] - gZ[2])))
# the other convention: H = (J/2) ZZ, J=1 — where does its class hit CNOT's?
for T in [π / 4, π / 2]
    g = makhlin(exp(-im * T / 2 .* ZZ))
    @printf("    H=(J/2)ZZ, T=%6s:      G1 = %.6f%+.6fim   G2 = %.6f\n",
            T ≈ π / 4 ? "π/4" : "π/2", real(g[1]), imag(g[1]), g[2])
end

# ---------- (c) locals-only ED envelope ----------
# k(α,β,γ) = Rz(α) Ry(β) Rz(γ), built elementwise (ForwardDiff-safe).
function su2(α, β, γ)
    ca, sa = cos(α / 2), sin(α / 2)
    cb, sb = cos(β / 2), sin(β / 2)
    cg, sg = cos(γ / 2), sin(γ / 2)
    rz1 = [complex(ca, -sa) 0; 0 complex(ca, sa)]
    ry = [complex(cb) -complex(sb); complex(sb) complex(cb)]
    rz2 = [complex(cg, -sg) 0; 0 complex(cg, sg)]
    rz1 * ry * rz2
end

function locals_only_F(θ; restarts = 12, rng = Xoshiro(2))
    core = exp(-im * θ .* ZZ)
    function negF(p)
        k1 = su2(p[1], p[2], p[3]);  k2 = su2(p[4], p[5], p[6])
        k3 = su2(p[7], p[8], p[9]);  k4 = su2(p[10], p[11], p[12])
        U = (k1 ⊗ k2) * core * (k3 ⊗ k4)
        -abs2(tr(CNOT' * U)) / 16
    end
    best = Inf
    for _ in 1:restarts
        res = optimize(negF, 2π .* rand(rng, 12), LBFGS(),
                       Optim.Options(g_tol = 1e-13, iterations = 4000); autodiff = :forward)
        best = min(best, Optim.minimum(res))
    end
    -best
end

println("\n(c) locals-only ED envelope: best F from class (θ,0,0), θ = JT")
println("      θ/(π/4)    1-F(ED)         1-sin²... candidate cos²(π/4-θ)→F? report raw")
for x in [0.0, 0.25, 0.5, 0.75, 0.9, 1.0]
    θ = x * π / 4
    F = locals_only_F(θ)
    @printf("      %.2f       %.9f     [1+cos... cand: F=%.9f]\n", x, 1 - F,
            ((1 + sin(2θ)) / 2))
end
