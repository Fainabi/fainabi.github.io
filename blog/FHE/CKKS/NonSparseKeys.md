# Bootstrapping with Non-sparse Keys

:::meta
title : Efficient Bootstrapping for Approximate Homomorphic Encryption with Non-Sparse Keys
authors : Jean-Philippe Bossuat,  Christian Mouchet, Juan Troncoso-Pastoriza, and Jean-Pierre Hubaux
publication : EUROCRYPT 2021
reference : EC:BMTH21
url : https://doi.org/10.1007/978-3-030-77870-5_21, https://eprint.iacr.org/2020/1203
tags : FHE, CKKS, Bootstrapping
:::

Double-hoisting and the improved hybrid key-switching contribute to improvement on linear transformation. Furthermore, the `repacking` techinuqe for `CtS` combines iDFT evaluation and real/imaginary parts separation so that the level consumption is reduced. The homomorphic polynomial evaluation is also optimized, in depth and scale.


## Improved Hybrid Key-switching

In [[CT-RSA:HK20]](BetterBootstrapping.md), the key-switching is to compute
$$
\sum_{i=0}^{\ell} [a]_{q_i} \cdot [s]_{q_i}  \cdot [\hat{q}_i^{-1}]_{q_i} \cdot \hat{q}_i = \ip{\underbrace{\{[a]_{q_i} \cdot [\hat{q}_i^{-1}]_{q_i}\}_i}_{\mathsf{Decomp}} , \underbrace{\{\hat{q}_i \cdot [s]_{q_i}\}_i}_{\mathsf{Powers}} }
$$
Since $[\hat{q}_i^{-1}]_{q_i}$ can be pre-computed, Bossuat et al. say that the key-switching can be computed via
$$
\sum_{i=0}^{\ell} [a]_{q_i} \cdot [s]_{q_i} \cdot [\hat{q}_i^{-1}]_{q_i} \cdot \hat{q}_i = \ip{\underbrace{\{[a]_{q_i}}_{\mathsf{Decomp}}\} , \underbrace{\{\hat{q}_i \cdot [\hat{q}_i^{-1}]_{q_i} \cdot [s]_{q_i} \}_i}_{\mathsf{Powers}} }
$$
which supports hoisting technique proposed by Halevi and Shoup.

## Double Hoisting

## Repacking

## Polynomial Evaluation