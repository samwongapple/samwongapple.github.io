# crosscheck_grapejl.jl — same problems, independent implementation:
# GRAPE.jl / QuantumControl.jl (Goerz et al.) vs the from-scratch code.
#  · driven qubit: Δ=1, σx,σy controls, T=3, K=20  → expect 1-F ≈ 0 (machine)
#  · CNOT: J=1 ZZ drift + 4 local controls, K=32, T = 1.10·π/4 and 0.80·π/4
#    → expect machine-zero infidelity above the cliff, and the ED-envelope
#    floor (1-sin2JT)/2 = 0.0954915 below it.

using QuantumControl
using QuantumControl.Functionals: J_T_sm
using QuantumControl.QuantumPropagators: ExpProp
import GRAPE
using LinearAlgebra, Printf, Random

const sx = ComplexF64[0 1; 1 0]
const sy = ComplexF64[0 -im; im 0]
const sz = ComplexF64[1 0; 0 -1]
const id2 = Matrix{ComplexF64}(I, 2, 2)
⊗(a, b) = kron(a, b)
const CNOT = ComplexF64[1 0 0 0; 0 1 0 0; 0 0 0 1; 0 0 1 0]

function run_problem(H0, Hcs, kets, targets, T, K; iter_stop = 3000, seed = 1)
    rng = Xoshiro(seed)
    tlist = collect(range(0, T; length = K + 1))
    guesses = [rand(rng, K) .- 0.5 for _ in Hcs]          # piecewise-constant on intervals
    H = hamiltonian(H0, [(Hc, g) for (Hc, g) in zip(Hcs, guesses)]...)
    trajs = [Trajectory(ψ, H; target_state = ϕ) for (ψ, ϕ) in zip(kets, targets)]
    problem = ControlProblem(trajs, tlist; J_T = J_T_sm, iter_stop = iter_stop,
                             prop_method = ExpProp, check_convergence = res -> begin
                                 if res.J_T < 1e-13
                                     res.converged = true
                                     res.message = "J_T < 1e-13"
                                 end
                             end)
    res = optimize(problem; method = GRAPE, print_iters = false)
    res
end

println("— GRAPE.jl cross-check —")

# driven qubit
let Δ = 1.0, T = 3.0, K = 20
    res = run_problem(Δ / 2 .* sz, [sx ./ 2, sy ./ 2],
                      [ComplexF64[1, 0]], [ComplexF64[0, 1]], T, K)
    @printf("qubit  Δ=1, T=3.0, K=20:      GRAPE.jl 1-F = %.3e   (%s)\n", res.J_T, res.message)
end

# CNOT above and below the cliff (below: multi-start, like the from-scratch code)
for (x, seeds) in [(1.10, 1:1), (0.80, 1:5)]
    J = 1.0
    T = x * π / 4
    K = 32
    kets = [ComplexF64[i == j for i in 1:4] for j in 1:4]
    best = minimum(seeds) do s
        run_problem(J .* (sz ⊗ sz), [sx ⊗ id2, sy ⊗ id2, id2 ⊗ sx, id2 ⊗ sy] ./ 2,
                    kets, [CNOT * k for k in kets], T, K;
                    iter_stop = 10000, seed = s).J_T
    end
    env = x < 1 ? (1 - sin(2 * J * T)) / 2 : 0.0
    @printf("CNOT   T=%.2f·π/4, K=32:      GRAPE.jl best 1-F = %.6e   [ED envelope: %.6e]\n",
            x, best, env)
end
