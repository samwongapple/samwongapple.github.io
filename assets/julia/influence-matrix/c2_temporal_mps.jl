# c2_temporal_mps.jl — Companion 2 of the influence-matrix series:
# "A matrix-product state in the time direction"
#
# From-scratch temporal MPS + transverse contraction with truncation. Plain
# Julia + LinearAlgebra; no tensor-network library — writing the machinery by
# hand is the point at this stage.
#
# Objects:
#   · the influence matrix of a kicked Ising bath, stored as an MPS over the
#     temporal lattice: T tensors A_t[χ_l, 4, χ_r], physical leg σ_t = (s_t,s̄_t).
#   · absorbing one more bath site = applying a bond-dimension-4 MPO in time,
#     then compressing back down with SVDs. Cost per site: O(T χ² 4³) — the
#     exponential in T is gone.
#
# Conventions identical to c1_exact_dense.jl (site 1 = MSB; σ = 2·fwd + bwd;
# σ_1 = leftmost MPS site; leg values 1..4 ↔ (↑,↑),(↑,↓),(↓,↑),(↓,↓)).

using LinearAlgebra
using Printf

zval(bit) = 1 - 2*bit
kick(b) = [cos(b) -im*sin(b); -im*sin(b) cos(b)]

# ---------------------------------------------------------------- the MPO ----
# One bath site, read sideways, as a matrix-product operator over time.
# Bond variable β = folded (z_t, z̄_t) of the site being absorbed (dim 4).
# MPO tensor at step t:   W[β_in, η, σ, β_out]
#   = δ_{σ, β_in} · e^{-iJ(η_z z − η̄_z z̄)} · K_{z' z} K̄_{z̄' z̄}
# where (z,z̄) = β_in, (z',z̄') = β_out, η the emitted leg (next site inward).
# Bottom closure: β_1 = (↑,↑) (site starts in |↑⟩); top closure: z_{T+1} = z̄_{T+1}.

function site_mpo(J, K)
    W = zeros(ComplexF64, 4, 4, 4, 4)          # β_in, η, σ, β_out
    for βi in 1:4
        z, z̄ = zval((βi-1) >> 1), zval((βi-1) & 1)
        zi, z̄i = ((βi-1) >> 1) + 1, ((βi-1) & 1) + 1
        for η in 1:4
            ηz, η̄z = zval((η-1) >> 1), zval((η-1) & 1)
            ph = exp(-im*J*(ηz*z - η̄z*z̄))
            for βo in 1:4
                zo, z̄o = ((βo-1) >> 1) + 1, ((βo-1) & 1) + 1
                W[βi, η, βi, βo] = ph * K[zo, zi] * conj(K[z̄o, z̄i])
            end
        end
    end
    W                                           # σ index == β_in index (diagonal pin)
end

# --------------------------------------------------------- MPS operations ----
# MPS stored as Vector of 3-arrays A[χl, 4, χr]. No normalization assumptions;
# compress() sweeps right-to-left then left-to-right with SVD truncation.

function compress!(mps; χmax=64, cutoff=1e-12)
    T = length(mps)
    # right-to-left: bring to right-canonical form (no truncation yet)
    for t in T:-1:2
        A = mps[t]
        χl, d, χr = size(A)
        M = reshape(A, χl, d*χr)
        F = qr(transpose(M))                    # LQ via QR of the transpose
        Q = Matrix(F.Q); R = Matrix(F.R)
        k = size(Q, 2)
        mps[t] = reshape(transpose(Q), k, d, χr)
        B = mps[t-1]
        χl2, d2, _ = size(B)
        mps[t-1] = reshape(reshape(B, χl2*d2, χl) * transpose(R), χl2, d2, k)
    end
    # left-to-right: SVD + truncate, collecting the Schmidt values per cut
    schmidt = Vector{Vector{Float64}}(undef, T-1)
    for t in 1:T-1
        A = mps[t]
        χl, d, χr = size(A)
        M = reshape(A, χl*d, χr)
        # gesdd occasionally fails to converge at large sizes; fall back to gesvd
        F = try
            svd(M)
        catch
            svd(M; alg=LinearAlgebra.QRIteration())
        end
        sv = F.S
        keep = min(χmax, sum(sv .> cutoff*maximum(sv)), length(sv))
        keep = max(keep, 1)
        schmidt[t] = sv[1:keep]
        mps[t] = reshape(F.U[:, 1:keep], χl, d, keep)
        C = Diagonal(sv[1:keep]) * F.Vt[1:keep, :]
        B = mps[t+1]
        _, d2, χr2 = size(B)
        mps[t+1] = reshape(C * reshape(B, size(C,2), d2*χr2), keep, d2, χr2)
    end
    schmidt
end

# entanglement entropies across every cut, from the Schmidt values
function entropies(schmidt)
    map(schmidt) do sv
        p = sv.^2; p = p ./ sum(p)
        -sum(x -> x > 1e-16 ? x*log(x) : 0.0, p)
    end
end

# build the influence matrix of an L-site chain's bath as a temporal MPS
function im_mps(Lbath, T, J, b; χmax=64, cutoff=1e-12, bath0=:up)
    K = kick(b)
    mps = Vector{Array{ComplexF64,3}}()
    local schmidt
    for _ in 1:Lbath
        W = site_mpo(J, K)
        if isempty(mps)
            for t in 1:T
                A = zeros(ComplexF64, 4, 4, 4)
                for βi in 1:4, η in 1:4, βo in 1:4
                    A[βi, η, βo] = W[βi, η, βi, βo]
                end
                push!(mps, A)
            end
            # bottom closure: |↑⟩ selects β_1 = (↑,↑); the infinite-temperature
            # (maximally mixed) state is the folded vector ½·[δ_{z z̄}]
            if bath0 == :up
                mps[1] = mps[1][1:1, :, :]
            else
                mps[1] = 0.5 .* (mps[1][1:1, :, :] .+ mps[1][4:4, :, :])
            end
            top = zeros(ComplexF64, 4); top[1] = 1; top[4] = 1
            A = mps[T]
            mps[T] = reshape(reshape(A, 4*4, 4) * top, 4, 4, 1)
        else
            for t in 1:T
                A = mps[t]
                χl, _, χr = size(A)
                B = zeros(ComplexF64, 4*χl, 4, 4*χr)
                for βi in 1:4, η in 1:4, βo in 1:4
                    w = W[βi, η, βi, βo]
                    w == 0 && continue
                    @views B[(βi-1)*χl+1 : βi*χl, η, (βo-1)*χr+1 : βo*χr] .+= w .* A[:, βi, :]
                end
                mps[t] = B
            end
            # bottom: initial-state closure on the β block; top: trace closure
            A = mps[1]; χl, d, χr = size(A)
            blk0 = χl ÷ 4
            if bath0 == :up
                mps[1] = reshape(A[1:blk0, :, :], blk0, d, χr)
            else
                mps[1] = reshape(0.5 .* (A[1:blk0, :, :] .+ A[3*blk0+1:4*blk0, :, :]), blk0, d, χr)
            end
            B = mps[T]; χl2, d2, χr2 = size(B)
            blk = χr2 ÷ 4
            mps[T] = B[:, :, 1:blk] .+ B[:, :, 3*blk+1:4*blk]
        end
        schmidt = compress!(mps; χmax=χmax, cutoff=cutoff)
    end
    mps, schmidt
end

# ------------------------------------------------- dense checks (small T) ----
function mps_to_dense(mps)
    T = length(mps)
    v = reshape(mps[1], size(mps[1],2), size(mps[1],3))   # σ_1, χ
    for t in 2:T
        A = mps[t]
        χl, d, χr = size(A)
        v = reshape(v, :, χl) * reshape(A, χl, d*χr)
        v = reshape(v, :, χr)
    end
    raw = vec(v)
    # column-major bookkeeping leaves σ_1 as the FASTEST digit; c1's convention
    # is σ_1 = most significant base-4 digit, so reverse the digits.
    out = similar(raw)
    for i in 0:length(raw)-1
        j = 0; x = i
        for _ in 1:T
            j = 4j + (x & 3); x >>= 2
        end
        out[j+1] = raw[i+1]
    end
    out
end

# Gram-construction reference (copied from c1, pure |↑…↑⟩ bath of Lb sites)
function apply_site(A, ψ, n, j)
    out = similar(ψ); stride = 1 << (n - j)
    for base in 0:length(ψ)-1
        (base & stride) != 0 && continue
        i0, i1 = base + 1, base + stride + 1
        out[i0] = A[1,1]*ψ[i0] + A[1,2]*ψ[i1]
        out[i1] = A[2,1]*ψ[i0] + A[2,2]*ψ[i1]
    end
    out
end

function gram_IM(Lb, T, J, b)
    dimb = 2^Lb; K = kick(b)
    ising_int = [Lb > 1 ? exp(-im*J*sum(zval((i >> (Lb-1-j)) & 1) * zval((i >> (Lb-2-j)) & 1)
                                        for j in 0:Lb-2)) : 1.0 + 0im for i in 0:dimb-1]
    zb = [zval((i >> (Lb-1)) & 1) for i in 0:dimb-1]
    level = [begin ψ = zeros(ComplexF64, dimb); ψ[1] = 1; ψ end]
    for _ in 1:T
        nxt = Vector{Vector{ComplexF64}}(undef, 2*length(level))
        for (i, u) in enumerate(level)
            for (slot, s) in ((1, +1), (2, -1))
                v = u .* ising_int .* [exp(-im*J*s*z) for z in zb]
                for j in 1:Lb; v = apply_site(K, v, Lb, j); end
                nxt[2*(i-1) + slot] = v
            end
        end
        level = nxt
    end
    n = 2^T
    IM = zeros(ComplexF64, 4^T)
    for sf in 0:n-1, sb in 0:n-1
        idx = 0
        for k in 1:T
            idx = 4idx + 2*((sf >> (T-k)) & 1) + ((sb >> (T-k)) & 1)
        end
        IM[idx+1] = dot(level[sb+1], level[sf+1])
    end
    IM
end

# perfect-dephaser distance: how far the local tensors are from IM = Π_t δ_{s_t s̄_t}
function pd_distance(mps)
    v = mps_to_dense(mps)
    T = length(mps)
    pd = zeros(ComplexF64, 4^T)
    for mask in 0:(2^T - 1)
        j = 0
        for k in 1:T
            j = 4j + (((mask >> (T-k)) & 1) == 0 ? 0 : 3)
        end
        pd[j+1] = 1
    end
    maximum(abs.(v .- pd))
end

# ------------------------------------------------------------------ driver ---
function main()
    println("check 1: temporal MPS vs exact dense Gram construction (Lb=4, T=6)")
    for (J, b) in [(0.7, 0.6), (π/4, π/4)]
        mps, _ = im_mps(4, 6, J, b; χmax=256, cutoff=0.0)
        d = maximum(abs.(mps_to_dense(mps) .- gram_IM(4, 6, J, b)))
        χs = [size(A, 3) for A in mps[1:end-1]]
        @printf("  J=%.4f b=%.4f   max|Δ| = %.2e   bond dims: %s\n", J, b, d, string(χs))
    end

    println("\ncheck 2: the perfect dephaser — self-dual point (T=6)")
    println("  bath spins |↑⟩ (a solvable but polarized start):")
    for Lb in (2, 4, 8, 16)
        mps, schmidt = im_mps(Lb, 6, π/4, π/4; χmax=128, cutoff=1e-12)
        @printf("    Lb=%-3d  max TE over cuts = %.2e   max|IM − Πδ| = %.2e\n",
                Lb, maximum(entropies(schmidt)), pd_distance(mps))
    end
    println("  bath at infinite temperature (maximally mixed):")
    for Lb in (1, 2, 4, 8, 16)
        mps, schmidt = im_mps(Lb, 6, π/4, π/4; χmax=128, cutoff=1e-12, bath0=:mixed)
        @printf("    Lb=%-3d  max TE over cuts = %.2e   max|IM − Πδ| = %.2e\n",
                Lb, maximum(entropies(schmidt)), pd_distance(mps))
    end

    println("\ncheck 3: generic point — TE saturates with bath depth, χ stays small (T=10)")
    for Lb in (4, 8, 16, 32)
        _, schmidt = im_mps(Lb, 10, 0.7, 0.6; χmax=128, cutoff=1e-10)
        S = entropies(schmidt)
        @printf("  Lb=%-3d  TE at cuts 1..9:  %s\n", Lb,
                join([@sprintf("%.3f", x) for x in S], " "))
    end

    println("\ncheck 4: convergence with bond dimension (Lb=16, T=10, generic point)")
    ref, _ = im_mps(16, 10, 0.7, 0.6; χmax=256, cutoff=0.0)
    vref = mps_to_dense(ref); nref = norm(vref)
    for χ in (2, 4, 8, 16, 32)
        mps, _ = im_mps(16, 10, 0.7, 0.6; χmax=χ, cutoff=0.0)
        err = norm(mps_to_dense(mps) .- vref) / nref
        @printf("  χ=%-4d   relative L2 error of the IM = %.2e\n", χ, err)
    end

    println("\ncheck 5: TE map corners — half-cut TE at T=8, Lb=20 (for the widget/post)")
    for (J, b) in [(0.2, 0.2), (0.7, 0.6), (π/4, π/4), (0.7, π/4), (π/4, 0.7), (1.2, 1.2)]
        _, schmidt = im_mps(20, 8, J, b; χmax=64, cutoff=1e-10)
        S = entropies(schmidt)
        @printf("  J=%.4f b=%.4f   TE(mid) = %.4f\n", J, b, S[4])
    end

    println("\ntiming: one (J,b) point at T=20, Lb=40, χmax=64")
    stats = @timed im_mps(40, 20, 0.7, 0.6; χmax=64, cutoff=1e-10)
    S = entropies(stats.value[2])
    @printf("  %.2f s;  max TE = %.3f;  final bond dims ≤ %d\n",
            stats.time, maximum(S), maximum(size.(stats.value[1], 3)))
end

main()
