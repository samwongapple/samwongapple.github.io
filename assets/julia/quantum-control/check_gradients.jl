# check_gradients.jl — triple-check the GRAPE gradient on a random instance:
# (1) analytic Van Loan gradient, (2) central finite differences, (3) Zygote autodiff.
# Also: error of the first-order gradient vs dt (expect ~dt scaling of the
# relative error, since each segment's neglected term is O(dt²) on a gradient of size O(dt)).

include("grape_core.jl")
using Zygote, Random, Printf

Random.seed!(42)

# test problem: 2 qubits, ZZ drift + 4 local controls, random controls, gate target CNOT
J = 1.0
H0 = J * (sz ⊗ sz)
Hc = [sx ⊗ id2, sy ⊗ id2, id2 ⊗ sx, id2 ⊗ sy] ./ 2
CNOT = ComplexF64[1 0 0 0; 0 1 0 0; 0 0 0 1; 0 0 1 0]
K, M = 8, 4
T = 0.6
dt = T / K
u = 2.0 .* randn(K, M)

F, g_vl = fid_grad_gate(H0, Hc, u, dt, CNOT; exact = true)
_, g_1st = fid_grad_gate(H0, Hc, u, dt, CNOT; exact = false)

# --- finite differences (central, h sweep) ---
function fd_grad(u, h)
    g = zeros(size(u))
    for i in eachindex(u)
        up = copy(u); up[i] += h
        um = copy(u); um[i] -= h
        g[i] = (fid_gate(H0, Hc, up, dt, CNOT) - fid_gate(H0, Hc, um, dt, CNOT)) / (2h)
    end
    g
end

# --- Zygote autodiff through the matrix exponentials ---
function fid_zygote(uvec)
    u = reshape(uvec, K, M)
    Utot = Matrix{ComplexF64}(I, 4, 4)
    for k in 1:K
        H = H0 + sum(u[k, j] * Hc[j] for j in 1:M)
        Utot = exp(-im * dt * H) * Utot
    end
    abs2(tr(CNOT' * Utot)) / 16
end

@printf("F = %.12f   |∇F|₂ = %.6e\n\n", F, norm(g_vl))

g_ad = Zygote.gradient(fid_zygote, vec(u))[1]
@printf("Zygote vs Van Loan:      max|Δ| = %.3e   rel = %.3e\n",
        maximum(abs.(reshape(g_ad, K, M) .- g_vl)), maximum(abs.(reshape(g_ad, K, M) .- g_vl)) / norm(g_vl, Inf))

for h in [1e-3, 1e-4, 1e-5, 1e-6]
    g_fd = fd_grad(u, h)
    @printf("FD (h=%.0e) vs Van Loan: max|Δ| = %.3e\n", h, maximum(abs.(g_fd .- g_vl)))
end

println("\nfirst-order GRAPE gradient vs exact, error scaling with dt (same T, more segments):")
for Kn in [8, 16, 32, 64, 128]
    dtn = T / Kn
    un = 2.0 .* randn(Xoshiro(7), Kn, M)
    _, ge = fid_grad_gate(H0, Hc, un, dtn, CNOT; exact = true)
    _, g1 = fid_grad_gate(H0, Hc, un, dtn, CNOT; exact = false)
    @printf("  K=%3d  dt=%.5f   max|Δ| = %.3e   max rel = %.3e\n",
            Kn, dtn, maximum(abs.(g1 .- ge)), maximum(abs.(g1 .- ge) ./ (abs.(ge) .+ 1e-300)))
end
