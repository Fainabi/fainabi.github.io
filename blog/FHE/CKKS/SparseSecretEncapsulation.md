# Sparse Secret Encapsulation

:::meta
authors : Jean-Philippe Bossuat, Juan Ramon Troncoso-Pastoriza, and Jean-Pierre Hubaux
publication : ACNS 2022
reference : ACNS:BTH22
url : https://doi.org/10.1007/978-3-319-70694-8_15, https://eprint.iacr.org/2022/024.pdf
tags : FHE, CKKS, Bootstrapping
:::

:::flashcards
$\RLWE_{Q,s}(m)$ : RLWE ciphertext in $\mathcal{R}_Q^2$ encrypting $m$ under $s$
$s \rightarrow s'$ : key switch from secret $s$ to $s'$
$\ModRaise$ : Lift ciphertext from $\mathcal{R}_{q_0}^2$ to $\mathcal{R}_{Q_L}^2$
SSE : Sparse Secret Encapsulation
:::

The sparse secret encapsulation technique (SSE) `ModRaises` a ciphertext under a sprase secret, and switches back to a ciphertext at $Q_L$ under the original dense secret. Such operation controls the additional polynomial $I(X)$ as in $m + q_0 I(X)$, so that $\|I(X)\|$ is small, as it depends on the hamming weight of sparse secret.

The SSE procedure is:
$$
\RLWE_{q_0,s}(m) \stackrel{s\rightarrow s'}{\rightarrow} \RLWE_{q_0, s'}(m) \stackrel{\ModRaise}{\rightarrow} \RLWE_{Q_L, s'}(m + q_0 I) \stackrel{s' \rightarrow s}{\rightarrow} \RLWE_{Q_L, s}(m + q_0 I)
$$

## Irwin-Hall Distribution

The Irwin-Hall distribution is a probability distribution for a random variable defined as the sum of a number of independent random variables, each having a uniform distribution. This distribution is named after Joseph Oscar Irwin and Philip Hall. It is also known as the uniform sum distribution.

By Irwin-Hall distribution, the norm $\|I(X)\|$ is in $O(\sqrt h)$ with high probability.

## Bootstrapping Failure Probability

Bootstrapping is to remove $I(X)$ introduced by `ModRaise`, whose core mechanism is to evaluate `EvalMod`, which is a homomorphic evaluation of $\pmod{q_0}$. The `EvalMod` step is evaluated by polynomial evaluation for interpolating modulo $q_0$. The interval for interpolation is set to $[-q_0 I, q_0 I]$, at each slots. That means with smaller $I(X)$, the polynomial degree for interpolation is smaller.

The accumutative probability function of Irwin-Hall distribution is:
$$
1 - \of{\frac{2}{(h+1)!} \of{\sum_{i=0}^{\floor{K + 0.5(h+1)}} (-1)^i \begin{pmatrix}h+1 \\ i\end{pmatrix} (K + 0.5(h+1) -i )^{h+1}} - 1}^{2n}
$$

:::interests
details about Irwin-Hall Distribution
Failure probability bounds for different parameter sets
Empirical noise analysis
How to select the parameters
:::
