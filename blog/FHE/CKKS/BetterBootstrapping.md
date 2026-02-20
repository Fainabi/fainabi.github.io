# Better CKKS Bootstrapping

:::meta
title : Better Bootstrapping for Approximate Homomorphic Encryption
authors : Kyoohyung Han and Dohyeong Ki
publication : CT-RSA 2020
reference : CT-RSA:HK20
url : https://doi.org/10.1007/978-3-030-40186-3_16, https://eprint.iacr.org/2019/688
tags : FHE, CKKS, Bootstrapping
:::

:::flashcards
$\ell$ : ciphertext level in RNS
$\alpha$ : length of moduli chain for each decomposed groups
$\beta$ : number of groups of decomposition
$[k]$ : set of $\{0, 1, \cdots, k - 1\}$
$\RLWE_{s}(m)$ : RLWE ciphertexts encrypting $m$ under $s$
:::

This work synthesises the previous CKKS RNS [[SAC:CHKKS18]](CKKS-RNS.md) and RNS decomposition [[SAC:BEHZ16]](../BGV-and-BFV/FV-RNS.md), and introduces a key-switching method with the decomposition number between 1 and $\ell$.

The sine function is also better approximated.


## Advanced/Hybrid Key-switching

Two gadget functions are introduced: `Decompose` and `Powers`. In fact it is a intermediate state of inverse CRT constructions. Recall that the inverse CRT is:
$$
\sum_{i=0}^{\ell} [a]_{q_i}  \cdot [\hat{q}_i^{-1}]_{q_i} \cdot \hat{q}_i = \ip{\underbrace{\{[a]_{q_i} \cdot [\hat{q}_i^{-1}]_{q_i}\}_i}_{\mathsf{Decomp}} , \underbrace{\{\hat{q}_i\}_i}_{\mathsf{Powers}} }
$$
Therefore, to compute $a \cdot s'$ when computing key switching from $s'$ to $s$, the formula is
$$
\sum_{i=0}^{\ell} [a]_{q_i} \cdot [s]_{q_i}  \cdot [\hat{q}_i^{-1}]_{q_i} \cdot \hat{q}_i = \ip{\underbrace{\{[a]_{q_i} \cdot [\hat{q}_i^{-1}]_{q_i}\}_i}_{\mathsf{Decomp}} , \underbrace{\{s_i \cdot \hat{q}_i\}_i}_{\mathsf{Powers}} }
$$
That makes the switching keys to be a set of $\beta = \ceil{\ell / \alpha}$ RLWE ciphertexts
$$
\evk_i \in \RLWE_{s}(P \cdot s' \cdot \hat{Q}_j), \forall i \in [\beta] \quad \text{ where } \hat{Q}_j = Q/Q_j, Q_j = \prod_{i=j\alpha}^{j\alpha+\alpha-1} q_i
$$
where $\evk_{s'\rightarrow s} = \{\evk_i\}_{i}$, and the key-switching process for $(b, a) \in \RLWE_{s'}(m)$ is
$$
(b, 0) + \round{\frac{1}{P}\ip{\{[a]_{Q_j} \cdot [\hat{Q}_j^{-1}]_{Q_j}\}, \evk}} \in \RLWE_{s}(m)
$$
where inner product represents the homomophic inverse CRT construction, and $1/P$ is `ModDown`.


## Chebyshev Approximation on smaller intervals

The norm of message $m$ is smaller than the ciphertext modulus $q_0$, therefore for interpolation, the interval of $\cup_{i\in[K]} [-iB/q_0, iB/q_0]$ where $\|m\|_{\infty}/q_0 < B < 1$.

:::interests
details about Chebyshev interpolants over small intervals
:::

