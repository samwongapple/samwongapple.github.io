# c1_exact_dense.jl — Companion 1 of the influence-matrix series:
# "Exact influence matrices, by brute force"
#
# Everything dense, everything exact, nothing clever. Plain Julia + LinearAlgebra.
#
# Model & conventions (identical to the blog post):
#   kicked Ising chain, one Floquet period = Ising layer  exp(-iJ Σ Z_j Z_{j+1})
#   then kick layer exp(-ib Σ X_j).  Site 1 = system, sites 2…L = bath.
#   s_t = system spin ENTERING step t (1-indexed);  σ_t = (s_t, s̄_t) folded, dim 4.
#   Initial state |↑…↑⟩ (product), so ρ0 = ρ_s ⊗ ρ_bath as the construction needs.
#
# Index conventions, in ONE place:
#   · basis index of an n-spin register: 0-based integer; site j ∈ 1..n is bit
#     (n-j), i.e. site 1 is the MOST significant bit; bit 0 ⇒ spin up ⇒ z = +1.
#   · folded index σ = 2·(forward bit) + (backward bit) ∈ 0:3, so
#     σ=0 is (↑,↑), σ=3 is (↓,↓).
#   · a T-leg folded tensor is a length-4^T vector, σ_1 the MOST significant
#     base-4 digit.

using LinearAlgebra
using Printf

zval(bit) = 1 - 2*bit                               # bit 0 → +1, bit 1 → −1
kick(b) = [cos(b) -im*sin(b); -im*sin(b) cos(b)]    # ⟨z'| e^{-ibX} |z⟩

# ---------------------------------------------------------------- stage 1 ----
# Brute force: evolve the full 2^L pure state, read off ⟨Z_1(t)⟩.
# This is the "contract in time" order, and the reference everything must match.

# apply a 2×2 gate to site j of an n-spin state (site 1 = MSB)
function apply_site(A, ψ, n, j)
    out = similar(ψ)
    stride = 1 << (n - j)
    for base in 0:length(ψ)-1
        (base & stride) != 0 && continue
        i0, i1 = base + 1, base + stride + 1
        out[i0] = A[1,1]*ψ[i0] + A[1,2]*ψ[i1]
        out[i1] = A[2,1]*ψ[i0] + A[2,2]*ψ[i1]
    end
    out
end

function brute_Z1(L, T, J, b_bath, b_sys_seq)
    dim = 2^L
    ψ = zeros(ComplexF64, dim); ψ[1] = 1                          # |↑…↑⟩
    ising = [exp(-im*J*sum(zval((idx >> (L-1-j)) & 1) * zval((idx >> (L-2-j)) & 1)
                           for j in 0:L-2)) for idx in 0:dim-1]
    Kb = kick(b_bath)
    out = Float64[]
    for t in 1:T
        ψ .*= ising                                               # Ising layer (diagonal)
        ψ = apply_site(kick(b_sys_seq[t]), ψ, L, 1)               # system kick
        for j in 2:L; ψ = apply_site(Kb, ψ, L, j); end            # bath kicks
        push!(out, sum(zval((idx >> (L-1)) & 1) * abs2(ψ[idx+1]) for idx in 0:dim-1))
    end
    out
end

# ---------------------------------------------------------------- stage 2 ----
# The transverse contraction: absorb the bath one site at a time starting from
# the far edge, carrying a 4^T-component temporal object the whole way.
#
# Absorbing one site means evaluating
#
#   IM_new[η] = Σ_{z,z̄ paths} ρ(z_1,z̄_1) Π_t [ e^{-iJ η_t z_t} e^{+iJ η̄_t z̄_t}
#                K_{z_{t+1} z_t} K̄_{z̄_{t+1} z̄_t} ] δ_{z_{T+1} z̄_{T+1}} · IM_old[(z,z̄)]
#
# where η is the trajectory of the next site inward and IM_old's legs are pinned
# to this site's own path (the coupling is diagonal, so a leg IS a spin value).
# Processed time-step by time-step, the working tensor W carries
#   ( η-legs emitted so far | current folded bond (z_t,z̄_t) | unconsumed IM_old legs )
# and never exceeds 4^{T+1} components — exponential in T, *linear* in L.
# The very first site (far edge) has no right neighbour: IM_old is the scalar 1.

function transverse_IM(L, T, J, b)
    K = kick(b)
    IM = ComplexF64[1]                        # IM_0: zero legs
    for _ in 1:(L-1)
        IM = absorb_site(IM, T, J, K)
    end
    IM                                        # 4^T components, σ_1 = MSB
end

function absorb_site(IMold, T, J, K)
    haslegs = length(IMold) > 1               # false only for the far-edge site
    Rfull = haslegs ? length(IMold) : 1
    # W[a, β, r]: a = η-legs so far (4^t of them), β ∈ 1:4 current bond, r = rest
    W = zeros(ComplexF64, 1, 4, Rfull)
    W[1, 1, :] = IMold                        # ρ_site = |↑⟩⟨↑| ⇒ (z_1,z̄_1) = (↑,↑)
    for t in 1:T
        A = 4^(t-1)
        R = haslegs ? 4^(T-t) : 1
        Wn = zeros(ComplexF64, A*4, 4, R)
        for β in 1:4                          # bond (z_t, z̄_t) entering this step
            zt, z̄t = zval((β-1) >> 1), zval((β-1) & 1)
            zi, z̄i = ((β-1) >> 1) + 1, ((β-1) & 1) + 1
            for η in 1:4                      # emitted leg η_t of the next site inward
                ηz, η̄z = zval((η-1) >> 1), zval((η-1) & 1)
                phase = exp(-im*J*ηz*zt + im*J*η̄z*z̄t)
                for βn in 1:4                 # bond after the kick
                    zn, z̄n = ((βn-1) >> 1) + 1, ((βn-1) & 1) + 1
                    amp = phase * K[zn, zi] * conj(K[z̄n, z̄i])
                    abs(amp) < 1e-300 && continue
                    if haslegs
                        # IM_old's leg t is pinned to the bond value β
                        for a in 1:A
                            @views Wn[(a-1)*4 + η, βn, :] .+= amp .* W[a, β, (β-1)*R+1 : β*R]
                        end
                    else
                        for a in 1:A
                            Wn[(a-1)*4 + η, βn, 1] += amp * W[a, β, 1]
                        end
                    end
                end
            end
        end
        W = Wn
    end
    vec(W[:, 1, 1] .+ W[:, 4, 1])             # trace closure: (↑,↑) or (↓,↓)
end

# ---------------------------------------------------------------- stage 3 ----
# ⟨Z_1(t)⟩ from a cached IM. Two ingredients:
#   · trace preservation: summing the LAST leg over σ ∈ {(↑,↑),(↓,↓)} (the folded
#     identity closure) turns the T-step IM into the (T−1)-step IM — the bath
#     can't signal you from the future. Applying it repeatedly marginalizes
#     IM down to its first t legs.
#   · the system side is a sum over 2^t forward × 2^t backward paths, with the
#     observable inserted after t periods. Exponential, but in t only.

# Closing the FUTURE legs correctly is a causality statement: ⟨Z_1(t)⟩ cannot
# depend on what the system does after t. So we may close the future with ANY
# drive we like — pick the trivial one (no kicks). A kickless system just sits
# in an eigenstate: its trajectory after step t is frozen at the endpoint e on
# BOTH branches (the closing trace forces them equal). Hence every future leg
# is pinned to the same diagonal value σ = (e,e), and the closure is a sum over
# e = ↑,↓ — two terms, not 2^(T−t). (Summing each future leg independently
# over the diagonal would be wrong: the future legs are correlated through the
# system's own world-line.)
function future_closed(IM, idx, t, T, e)
    j = idx
    σ = e == 0 ? 0 : 3                        # (↑,↑) or (↓,↓), held for all future steps
    for _ in 1:(T - t)
        j = 4j + σ
    end
    IM[j+1]
end

function im_Z1(IM, T, b_sys_seq)
    Ks = [kick(b) for b in b_sys_seq]
    out = Float64[]
    for t in 1:T
        n = 2^t
        w = zeros(ComplexF64, n, 2)           # endpoint amplitudes per forward path
        for path in 0:n-1
            ((path >> (t-1)) & 1) == 1 && continue            # s_1 = ↑ (ρ_s = |↑⟩⟨↑|)
            a = one(ComplexF64)
            for k in 1:t-1
                sf = (path >> (t-k)) & 1; st = (path >> (t-k-1)) & 1
                a *= Ks[k][st+1, sf+1]
            end
            slast = path & 1
            w[path+1, 1] = a * Ks[t][1, slast+1]
            w[path+1, 2] = a * Ks[t][2, slast+1]
        end
        val = zero(ComplexF64)
        for pf in 0:n-1
            (w[pf+1,1] == 0 && w[pf+1,2] == 0) && continue
            for pb in 0:n-1
                (w[pb+1,1] == 0 && w[pb+1,2] == 0) && continue
                idx = 0
                for k in 1:t
                    idx = 4idx + 2*((pf >> (t-k)) & 1) + ((pb >> (t-k)) & 1)
                end
                for e in 0:1                                  # endpoint after step t's kick
                    z = 1 - 2e
                    val += z * w[pf+1, e+1] * conj(w[pb+1, e+1]) *
                           future_closed(IM, idx, t, T, e)
                end
            end
        end
        push!(out, real(val))
    end
    out
end

# Independent construction of the same object (a cross-check on the transverse
# code): with a pure bath state, IM[s,s̄] = ⟨u_s̄|u_s⟩ where u_s = V_s|ψ_bath⟩ —
# a Gram matrix built from a tree over trajectory prefixes.
function gram_IM(L, T, J, b)
    Lb = L - 1; dimb = 2^Lb
    K = kick(b)
    ising_int = [exp(-im*J*sum(Lb > 1 ? (zval((i >> (Lb-1-j)) & 1) * zval((i >> (Lb-2-j)) & 1)
                                          for j in 0:Lb-2) : 0)) for i in 0:dimb-1]
    zb = [zval((i >> (Lb-1)) & 1) for i in 0:dimb-1]
    ψ0 = zeros(ComplexF64, dimb); ψ0[1] = 1
    level = [ψ0]
    levels = [level]
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
        push!(levels, level)
    end
    # assemble the folded 4^T vector: leg σ_t = (s_t, s̄_t), σ_1 = MSB
    IM = zeros(ComplexF64, 4^T)
    n = 2^T
    for sf in 0:n-1, sb in 0:n-1
        idx = 0
        for k in 1:T
            idx = 4idx + 2*((sf >> (T-k)) & 1) + ((sb >> (T-k)) & 1)
        end
        IM[idx+1] = dot(level[sb+1], level[sf+1])      # ⟨u_s̄|u_s⟩
    end
    IM
end

# ---------------------------------------------------------------- stage 4 ----
# Temporal entanglement: Schmidt spectrum of the normalized IM across each time
# cut. Computed here, interpreted in Part 2 of the series.

function te_spectra(IM, T)
    v = IM / norm(IM)
    map(1:T-1) do k
        # julia is column-major: axis 1 varies fastest ⇒ axis 1 = trailing legs
        M = reshape(v, 4^(T-k), 4^k)
        sv = svdvals(M)
        p = sv.^2; p ./= sum(p)
        S = -sum(x -> x > 1e-14 ? x*log(x) : 0.0, p)
        (k, S, sv)
    end
end

# ---------------------------------------------------------------- driver -----
function main()
    println("stages 1–3: transverse IM vs brute force  (L=5, T=6)")
    L, T = 5, 6
    for (J, b) in [(0.7, 0.6), (π/4, π/4), (0.3, 1.1)]
        IM = transverse_IM(L, T, J, b)
        @printf("  J=%.4f  b=%.4f   transverse vs Gram construction: max|Δ| = %.2e\n",
                J, b, maximum(abs.(IM .- gram_IM(L, T, J, b))))
        for bs in (b, b/2, 0.0)
            seq = fill(bs, T)
            d = maximum(abs.(brute_Z1(L, T, J, b, seq) .- im_Z1(IM, T, seq)))
            @printf("  J=%.4f  b=%.4f  b_sys=%.4f   max|Δ| = %.2e   (same IM reused)\n",
                    J, b, bs, d)
        end
    end

    println("\nstage 4: temporal entanglement across each cut")
    for (J, b, tag) in [(0.7, 0.6, "generic"), (π/4, π/4, "self-dual")]
        IM = transverse_IM(5, 6, J, b)
        line = join([@sprintf("S(%d)=%.4f", k, S) for (k, S, _) in te_spectra(IM, 6)], "  ")
        println("  $(rpad(tag,10)) $line")
    end

    println("\nstage 5: the wall in T (transverse contraction, L=5)")
    transverse_IM(5, 4, 0.7, 0.6)   # warm up the compiler before timing
    for T2 in 4:1:9
        stats = @timed transverse_IM(5, T2, 0.7, 0.6)
        @printf("  T=%-3d  4^T = %-9d   %8.3f s   %8.1f MB allocated\n",
                T2, 4^T2, stats.time, stats.bytes/1e6)
    end

    println("\nstage 5b: the wall in L (brute force, T=6)")
    brute_Z1(6, 6, 0.7, 0.6, fill(0.6, 6))
    for L2 in 8:4:20
        stats = @timed brute_Z1(L2, 6, 0.7, 0.6, fill(0.6, 6))
        @printf("  L=%-3d  2^L = %-9d   %8.3f s\n", L2, 2^L2, stats.time)
    end
end

main()
