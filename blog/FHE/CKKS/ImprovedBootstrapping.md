# Improved Bootstrapping

:::meta
title : Improved Bootstrapping for Approximate Homomorphic Encryption
authors : Hao Chen, Ilaria Chillotti, and Yongsoo Song
publication : EUROCRYPT 2019
reference : EC:CCS19
url : https://doi.org/10.1007/978-3-030-17656-3_2, https://eprint.iacr.org/2018/1043
tags : FHE, CKKS, Bootstrapping, DFT factorization, Chebyshev
:::

:::flashcards
$N$ : degree of cyclotomic ring
$n$ : number of slots, which is $N/2$
$\zeta$ : $\exp(\sqrt{-1}\pi/N)$
$\zeta_i$ : $\zeta^{5^i}$
:::

DFT matrix is dense. By factorization of DFT, it can reduce the complexity in bootstrapping. For sine approximation, Chebyshev approximation is adopted rather than Taylor polynomials.

## FFT-like evaluation and level-collapsing

Recall the DFT transformation between $\C^{n}$ and $\mathcal{R}=\Z[X]/(X^N+1)$ is
$$
\DFT = 
\left(\kern{-3em}\phantom{\begin{matrix}\zeta_0^{N/2-1} \\ \zeta_1^{N/2-1} \\ \vdots \\ \zeta_{n-1}^{N/2-1}\end{matrix}}\right.
\underbrace{
\begin{matrix}
    1 & \zeta_0 & \cdots & \zeta_0^{N/2-1} \\
    1 & \zeta_1 & \cdots & \zeta_1^{N/2-1} \\
    \vdots & \vdots & \ddots & \vdots \\
    1 & \zeta_{n-1} & \cdots & \zeta_{n-1}^{N/2-1} \\
\end{matrix}
}_{U} 
\left.\kern{-3em}\phantom{\begin{matrix}\zeta_0^{N/2-1} \\ \zeta_1^{N/2-1} \\ \vdots \\ \zeta_{n-1}^{N/2-1}\end{matrix}}\right|
\underbrace{
\begin{matrix}
    \zeta_0^{N/2} & \zeta_0^{N/2+1} & \cdots & \zeta_0^{N-1} \\
    \zeta_1^{N/2} & \zeta_1^{N/2+1} & \cdots & \zeta_1^{N-1} \\
    \vdots & \vdots & \ddots & \vdots \\
    \zeta_{n-1}^{N/2} & \zeta_{n-1}^{N/2+1} & \cdots & \zeta_{n-1}^{N-1} \\
\end{matrix}
}_{\sqrt{-1}\cdot U}
\left.\kern{-3em}\phantom{\begin{matrix}\zeta_0^{N/2-1} \\ \zeta_1^{N/2-1} \\ \vdots \\ \zeta_{n-1}^{N/2-1}\end{matrix}}\right)
\in \C^{n\times N}
$$
as in [[EC:CHKKS18]](Bootstrapping.md). In [EC:CCS19] (paper that this article is for), $U$ is called the _special Fourier transform_. 

A concurrent work is in [[access:HHC19]](DFTFactorization.md).

## Chebyshev Interpolants

By approximation theory, the Chebyshev interpolation finds the best approximated polynomial with least error. The evaluation follows reccurrance of Chebyshev polynomials and Paterson-Stockmeyer algorithm.

:::interests
Chebyshev interpolants
Paterson-Stockmeyer
:::