# c3_te_regimes.jl — Companion 3 of the influence-matrix series:
# "Reading a phase diagram off one vector"
#
# A temporal-entanglement scaling study across dynamical regimes of the kicked
# Ising chain with longitudinal fields:
#
#   U_F = e^{-ib Σ X_j} · e^{-i(J Σ Z_j Z_{j+1} + Σ_j g_j Z_j)}
#
#   · g_j = 0                 → Jordan–Wigner free fermions: INTEGRABLE
#   · g_j = g ≠ 0 uniform     → integrability broken: CHAOTIC (thermalizing)
#   · g_j random & strong,
#     kick b weak             → strong disorder: LOCALIZED (MBL regime)
#   · b = J = π/4, any g      → dual-unitary: the perfect dephaser survives
#                               the longitudinal field (chaotic AND memoryless)
#
# Engine = Companion 2's temporal MPS + truncated transverse contraction,
# generalized with per-site longitudinal fields. Bath at infinite temperature
# throughout (the natural "bath in equilibrium" choice, and the one for which
# the PD form is exact at self-duality).
#
# Conventions identical to c1/c2.

using LinearAlgebra
using Printf
using Random

zval(bit) = 1 - 2*bit
kick(b) = [cos(b) -im*sin(b); -im*sin(b) cos(b)]

# MPO of one absorbed bath site with longitudinal angle g (enters the Ising
# layer as e^{-ig z_t} forward, e^{+ig z̄_t} backward)
function site_mpo(J, g, K)
    W = zeros(ComplexF64, 4, 4, 4, 4)          # β_in, η, σ, β_out
    for βi in 1:4
        z, z̄ = zval((βi-1) >> 1), zval((βi-1) & 1)
        zi, z̄i = ((βi-1) >> 1) + 1, ((βi-1) & 1) + 1
        for η in 1:4
            ηz, η̄z = zval((η-1) >> 1), zval((η-1) & 1)
            ph = exp(-im*(J*(ηz*z - η̄z*z̄) + g*(z - z̄)))
            for βo in 1:4
                zo, z̄o = ((βo-1) >> 1) + 1, ((βo-1) & 1) + 1
                W[βi, η, βi, βo] = ph * K[zo, zi] * conj(K[z̄o, z̄i])
            end
        end
    end
    W
end

function compress!(mps; χmax=64, cutoff=1e-12)
    T = length(mps)
    for t in T:-1:2
        A = mps[t]; χl, d, χr = size(A)
        F = qr(transpose(reshape(A, χl, d*χr)))
        Q = Matrix(F.Q); R = Matrix(F.R); k = size(Q, 2)
        mps[t] = reshape(transpose(Q), k, d, χr)
        B = mps[t-1]; χl2, d2, _ = size(B)
        mps[t-1] = reshape(reshape(B, χl2*d2, χl) * transpose(R), χl2, d2, k)
    end
    schmidt = Vector{Vector{Float64}}(undef, T-1)
    for t in 1:T-1
        A = mps[t]; χl, d, χr = size(A)
        M = reshape(A, χl*d, χr)
        # gesdd occasionally fails to converge at large sizes; fall back to gesvd
        F = try
            svd(M)
        catch
            svd(M; alg=LinearAlgebra.QRIteration())
        end
        sv = F.S
        keep = max(min(χmax, sum(sv .> cutoff*maximum(sv)), length(sv)), 1)
        schmidt[t] = sv[1:keep]
        mps[t] = reshape(F.U[:, 1:keep], χl, d, keep)
        C = Diagonal(sv[1:keep]) * F.Vt[1:keep, :]
        B = mps[t+1]; _, d2, χr2 = size(B)
        mps[t+1] = reshape(C * reshape(B, size(C,2), d2*χr2), keep, d2, χr2)
    end
    schmidt
end

entropy(sv) = (p = sv.^2 ./ sum(sv.^2); -sum(x -> x > 1e-16 ? x*log(x) : 0.0, p))

# influence matrix of a bath with per-site longitudinal angles gs[1..Lbath]
# (site 1 of gs = the boundary site, absorbed LAST); bath at infinite temperature
function im_mps(Lbath, T, J, b, gs; χmax=64, cutoff=1e-12)
    K = kick(b)
    mps = Vector{Array{ComplexF64,3}}()
    local schmidt
    for site in Lbath:-1:1                     # absorb far edge first
        W = site_mpo(J, gs[site], K)
        if isempty(mps)
            for t in 1:T
                A = zeros(ComplexF64, 4, 4, 4)
                for βi in 1:4, η in 1:4, βo in 1:4
                    A[βi, η, βo] = W[βi, η, βi, βo]
                end
                push!(mps, A)
            end
            mps[1] = 0.5 .* (mps[1][1:1, :, :] .+ mps[1][4:4, :, :])   # ∞-T bottom
            top = zeros(ComplexF64, 4); top[1] = 1; top[4] = 1
            A = mps[T]
            mps[T] = reshape(reshape(A, 4*4, 4) * top, 4, 4, 1)
        else
            for t in 1:T
                A = mps[t]; χl, _, χr = size(A)
                B = zeros(ComplexF64, 4*χl, 4, 4*χr)
                for βi in 1:4, η in 1:4, βo in 1:4
                    w = W[βi, η, βi, βo]
                    w == 0 && continue
                    @views B[(βi-1)*χl+1 : βi*χl, η, (βo-1)*χr+1 : βo*χr] .+= w .* A[:, βi, :]
                end
                mps[t] = B
            end
            A = mps[1]; χl, d, χr = size(A); blk = χl ÷ 4
            mps[1] = reshape(0.5 .* (A[1:blk, :, :] .+ A[3*blk+1:4*blk, :, :]), blk, d, χr)
            B = mps[T]; _, _, χr2 = size(B); blk2 = χr2 ÷ 4
            mps[T] = B[:, :, 1:blk2] .+ B[:, :, 3*blk2+1:4*blk2]
        end
        schmidt = compress!(mps; χmax=χmax, cutoff=cutoff)
    end
    mps, schmidt
end

# ------------------------------------------------------------------ study ----
function te_mid(Lb, T, J, b, gs; χmax=64)
    _, schmidt = im_mps(Lb, T, J, b, gs; χmax=χmax)
    entropy(schmidt[max(T ÷ 2, 1)])
end

function main()
    Ts = [4, 8, 12, 16, 20]
    pad = 4                                     # bath depth = T + pad (past the light cone)

    println("regime study: half-cut temporal entanglement vs T  (∞-T bath, χmax=64)")
    println("T grid: ", Ts)

    @printf("\n%-34s", "integrable (J=0.7, b=0.6, g=0):")
    for T in Ts
        @printf("  %6.3f", te_mid(T + pad, T, 0.7, 0.6, zeros(T + pad)))
    end

    @printf("\n%-34s", "chaotic (J=0.7, b=0.6, g=0.4):")
    for T in Ts
        @printf("  %6.3f", te_mid(T + pad, T, 0.7, 0.6, fill(0.4, T + pad)))
    end

    @printf("\n%-34s", "chaotic self-dual (π/4, π/4, g=0.4):")
    for T in Ts
        @printf("  %6.3f", te_mid(T + pad, T, π/4, π/4, fill(0.4, T + pad)))
    end

    nreal = 6
    @printf("\n%-34s", "MBL (J=0.25, b=0.2, g random):")
    rng = MersenneTwister(11)
    for T in Ts
        acc = 0.0
        for _ in 1:nreal
            gs = 2π .* rand(rng, T + pad)
            acc += te_mid(T + pad, T, 0.25, 0.2, gs)
        end
        @printf("  %6.3f", acc / nreal)
    end
    println("\n  (MBL row: mean over $nreal disorder realizations)")

    println("\nconvergence in χ (chaotic regime — the hard one):")
    for T in (12, 16, 20)
        for χ in (64, 128, 256)
            @printf("  T=%-3d χ=%-4d  TE(mid) = %.4f\n", T, χ,
                    te_mid(T + pad, T, 0.7, 0.6, fill(0.4, T + pad); χmax=χ))
        end
    end

    println("\nfull TE profile at T=20 (cuts 2,4,…,18), the three clean regimes:")
    for (tag, J, b, g) in [("integrable", 0.7, 0.6, 0.0),
                            ("chaotic   ", 0.7, 0.6, 0.4),
                            ("self-dual ", π/4, π/4, 0.4)]
        _, schmidt = im_mps(24, 20, J, b, fill(g, 24); χmax=64)
        S = [entropy(schmidt[k]) for k in 2:2:18]
        println("  $tag  ", join([@sprintf("%5.2f", x) for x in S], " "))
    end
end

main()
