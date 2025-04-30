# Grothendieck Topology

**Def 1.** A Grothendieck Topology on a category $\mathcal C$ is a collection of [[sieve|sieves]] $J : (C : \mathcal C) \mapsto \text{Collection of Sieves over } C$ , satisfying three axioms:

- (Maximality) $\forall X \in \mathcal C, \mathbf{Hom}(-, X) \in J(X)$
- (Stability under pullback or base change) $\forall x: X' \rightarrow X, \forall S \in J(X), x^\ast S \in J(X')$
- (Transitivity, Local character condition) $\forall S \in J(X), (\forall (u: U \rightarrow X) \in S, u^\ast S' \in J(U)) \vdash S' \in J(X)$



**Def 2.** (*J-Covering*) A Grothendieck Topology on a (essentially small) category $\mathcal C$, is a property of families of morphisms with the same target:

$$(U_i \rightarrow X)_{i \in \mathcal{I}}$$

satisfying three axioms:
- (Maximality) $\mathbf{id}_X: X \rightarrow X \in J(X)$,
- (Stability) For $x: X' \rightarrow X$, and J-coverings $(U_i \rightarrow X)_i, (U'_j \rightarrow X')_j$, each composite $U'_j \rightarrow X' \rightarrow X$ factors through at least one in $(U_i \rightarrow X)_i$.
- (Transitivity) For a J-covering $(U_i \rightarrow X)_i$:
	1. Any family $(W_k \rightarrow X)_k$ through which $u_i : U_i \rightarrow X$ factorize is a J-covering
	2. For J-coverings $(V_{i,j} \rightarrow U_i)_{j \in J_i}$, the family of their composites 
	$$(V_{i,j} \rightarrow {U_i} \rightarrow X)_{i \in I, j \in J_i}$$
	is J-covering.
 